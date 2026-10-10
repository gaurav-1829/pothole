import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel

import json
from database import engine, SessionLocal, Base, PotholeReport, Complaint, ReportTimeline, get_db, upgrade_database_schema
from detector import detector
from exif_parser import extract_exif_metadata
from seed_data import seed_database

# Create tables, apply safe migrations & initial seed
Base.metadata.create_all(bind=engine)
upgrade_database_schema(engine)
seed_database()

app = FastAPI(
    title="RoadWatch - AI Pothole Detection & Civic Action Platform",
    description="Full-stack AI-driven pothole detection, geo-spatial mapping, report submission, authority management, and citizen grievance escalation system.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")


# ----------------- PYDANTIC SCHEMAS -----------------
class ReportCreateSchema(BaseModel):
    image_url: str
    annotated_image_url: Optional[str] = None
    latitude: float
    longitude: float
    location_source: Optional[str] = "Manual_Pin"
    address: Optional[str] = "Road Segment"
    city: Optional[str] = "Metro City"
    ward: Optional[str] = "Central Zone"
    severity: Optional[str] = "Moderate"
    confidence: Optional[float] = 0.85
    pothole_count: Optional[int] = 1
    bounding_boxes: Optional[List[dict]] = []
    segmentation_masks: Optional[List[list]] = []
    estimated_dimensions: Optional[str] = "45 cm x 30 cm"
    estimated_depth_cm: Optional[float] = 6.0
    hazard_score: Optional[int] = 60
    area_ratio: Optional[float] = 0.0
    est_width_cm: Optional[float] = 0.0
    est_length_cm: Optional[float] = 0.0
    size_method: Optional[str] = "bbox"
    severity_reasons: Optional[List[str]] = []
    citizen_name: Optional[str] = "Anonymous Citizen"
    citizen_email: Optional[str] = ""
    citizen_phone: Optional[str] = ""
    citizen_description: Optional[str] = ""


class ReportUpdateSchema(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_crew: Optional[str] = None
    authority_notes: Optional[str] = None
    work_order_id: Optional[str] = None
    repair_image_url: Optional[str] = None


class ComplaintCreateSchema(BaseModel):
    report_id: Optional[int] = None
    citizen_name: str
    citizen_email: str
    citizen_phone: Optional[str] = ""
    subject: str
    description: str
    category: Optional[str] = "Delayed Repair"
    priority: Optional[str] = "High"


class ComplaintUpdateSchema(BaseModel):
    status: Optional[str] = None
    authority_response: Optional[str] = None
    assigned_officer: Optional[str] = None
    priority: Optional[str] = None


# ----------------- API ENDPOINTS -----------------

from fastapi.responses import FileResponse

@app.get("/")
def root():
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": "RoadWatch AI Pothole Detection & Authority Portal API",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/api/config/severity")
def get_severity_config():
    """Returns configurable severity thresholds and real-world reference standards."""
    return detector.config


@app.post("/api/detect")
async def detect_potholes(
    file: UploadFile = File(...),
    reference_type: Optional[str] = Form(None),
    reference_line_pixels: Optional[float] = Form(None),
    reference_line_coords: Optional[str] = Form(None),
):
    """
    Accepts an uploaded image file:
    1. Extracts EXIF GPS (lat/lng, timestamp, camera) if available.
    2. Runs Computer Vision / YOLO Pothole Detection (bounding boxes, contours, severity, dimensions, depth).
    3. Calibrates scale if reference_type (coin, a4, lane) and reference line are supplied.
    4. Saves original and annotated visuals with honest estimation disclaimers.
    """
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_id = str(uuid.uuid4())[:8]
    raw_filename = f"upload_{unique_id}{ext}"
    annotated_filename = f"annotated_{unique_id}{ext}"

    raw_path = os.path.join(UPLOAD_DIR, raw_filename)
    annotated_path = os.path.join(UPLOAD_DIR, annotated_filename)

    # Save uploaded file
    contents = await file.read()
    with open(raw_path, "wb") as f:
        f.write(contents)

    # 1. Extract EXIF metadata
    exif_data = extract_exif_metadata(raw_path)

    # 2. Build reference object details if provided
    ref_info = None
    if reference_type:
        coords = None
        if reference_line_coords:
            try:
                coords = json.loads(reference_line_coords)
            except Exception:
                pass
        ref_info = {
            "type": reference_type,
            "line_pixels": reference_line_pixels,
            "line_coords": coords,
        }

    # 3. Run AI detection, segmentation area, and severity classification
    analysis = detector.analyze_image(raw_path, annotated_path, reference_info=ref_info)

    return {
        "status": "success",
        "image_url": f"/uploads/{raw_filename}",
        "annotated_image_url": f"/uploads/{annotated_filename}",
        "exif": exif_data,
        "ai_analysis": analysis,
    }


def serialize_report(r: PotholeReport) -> dict:
    """Explicitly serializes a PotholeReport model to dictionary."""
    return {
        "id": r.id,
        "report_code": r.report_code,
        "image_url": r.image_url,
        "annotated_image_url": r.annotated_image_url,
        "repair_image_url": r.repair_image_url,
        "latitude": r.latitude,
        "longitude": r.longitude,
        "location_source": r.location_source,
        "address": r.address,
        "city": r.city,
        "ward": r.ward,
        "severity": r.severity,
        "confidence": r.confidence,
        "pothole_count": r.pothole_count,
        "bounding_boxes": r.bounding_boxes or [],
        "segmentation_masks": r.segmentation_masks or [],
        "estimated_dimensions": r.estimated_dimensions,
        "estimated_depth_cm": r.estimated_depth_cm,
        "hazard_score": r.hazard_score,
        "area_ratio": r.area_ratio or 0.0,
        "est_width_cm": r.est_width_cm or 0.0,
        "est_length_cm": r.est_length_cm or 0.0,
        "size_method": r.size_method or "bbox",
        "severity_reasons": r.severity_reasons or [],
        "status": r.status,
        "priority": r.priority,
        "assigned_crew": r.assigned_crew,
        "authority_notes": r.authority_notes,
        "work_order_id": r.work_order_id,
        "citizen_name": r.citizen_name,
        "citizen_email": r.citizen_email,
        "citizen_phone": r.citizen_phone,
        "citizen_description": r.citizen_description,
        "upvotes": r.upvotes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        "scheduled_date": r.scheduled_date.isoformat() if r.scheduled_date else None,
        "repaired_date": r.repaired_date.isoformat() if r.repaired_date else None,
    }


@app.post("/api/reports")
def create_report(payload: ReportCreateSchema, db: Session = Depends(get_db)):
    """Submits a new pothole report to database and records creation timeline."""
    count = db.query(PotholeReport).count()
    report_code = f"REP-{datetime.datetime.utcnow().year}-{count + 1:04d}"

    # Determine default priority based on severity
    severity_priority_map = {
        "Critical": "Emergency",
        "High": "Emergency",
        "Severe": "High",
        "Moderate": "Medium",
        "Medium": "Medium",
        "Minor": "Low",
        "Low": "Low",
    }
    default_priority = severity_priority_map.get(payload.severity, "Medium")

    report = PotholeReport(
        report_code=report_code,
        image_url=payload.image_url,
        annotated_image_url=payload.annotated_image_url or payload.image_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_source=payload.location_source,
        address=payload.address or "Road Location",
        city=payload.city or "Metro City",
        ward=payload.ward or "General Zone",
        severity=payload.severity or "Moderate",
        confidence=payload.confidence or 0.85,
        pothole_count=payload.pothole_count or 1,
        bounding_boxes=payload.bounding_boxes or [],
        segmentation_masks=payload.segmentation_masks or [],
        estimated_dimensions=payload.estimated_dimensions or "45 cm x 30 cm",
        estimated_depth_cm=payload.estimated_depth_cm or 6.0,
        hazard_score=payload.hazard_score or 60,
        area_ratio=payload.area_ratio or 0.0,
        est_width_cm=payload.est_width_cm or 0.0,
        est_length_cm=payload.est_length_cm or 0.0,
        size_method=payload.size_method or "bbox",
        severity_reasons=payload.severity_reasons or [],
        status="Pending",
        priority=default_priority,
        citizen_name=payload.citizen_name or "Anonymous Citizen",
        citizen_email=payload.citizen_email or "",
        citizen_phone=payload.citizen_phone or "",
        citizen_description=payload.citizen_description or "",
        upvotes=1,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # Timeline entry
    timeline = ReportTimeline(
        report_id=report.id,
        action="Report Submitted",
        details=f"New report logged by {report.citizen_name} with {report.severity} severity score.",
        actor=report.citizen_name,
    )
    db.add(timeline)
    db.commit()

    return serialize_report(report)


@app.get("/api/reports")
def get_reports(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "newest",
    db: Session = Depends(get_db)
):
    """Retrieves list of pothole reports with multifaceted filters."""
    query = db.query(PotholeReport)

    if status and status != "All":
        query = query.filter(PotholeReport.status == status)

    if severity and severity != "All":
        query = query.filter(PotholeReport.severity == severity)

    if ward and ward != "All":
        query = query.filter(PotholeReport.ward == ward)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (PotholeReport.report_code.ilike(search_fmt)) |
            (PotholeReport.address.ilike(search_fmt)) |
            (PotholeReport.ward.ilike(search_fmt)) |
            (PotholeReport.citizen_name.ilike(search_fmt))
        )

    if sort_by == "hazard":
        query = query.order_by(PotholeReport.hazard_score.desc())
    elif sort_by == "upvotes":
        query = query.order_by(PotholeReport.upvotes.desc())
    elif sort_by == "oldest":
        query = query.order_by(PotholeReport.created_at.asc())
    else:
        query = query.order_by(PotholeReport.created_at.desc())

    reports = query.all()
    return reports


@app.get("/api/reports/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    """Returns single report with timeline logs and associated citizen complaints."""
    report = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    timelines = (
        db.query(ReportTimeline)
        .filter(ReportTimeline.report_id == report_id)
        .order_by(ReportTimeline.timestamp.asc())
        .all()
    )

    complaints = (
        db.query(Complaint)
        .filter(Complaint.report_id == report_id)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return {
        "report": report,
        "timeline": timelines,
        "complaints": complaints,
    }


@app.patch("/api/reports/{report_id}")
def update_report(report_id: int, payload: ReportUpdateSchema, db: Session = Depends(get_db)):
    """Authority dashboard endpoint to update report status, assign crew, set notes, or mark repaired."""
    report = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    changes = []

    if payload.status and payload.status != report.status:
        old_st = report.status
        report.status = payload.status
        changes.append(f"Status changed from {old_st} to {payload.status}")
        if payload.status == "Repaired":
            report.repaired_date = datetime.datetime.utcnow()
        elif payload.status == "Scheduled":
            report.scheduled_date = datetime.datetime.utcnow() + datetime.timedelta(days=2)

    if payload.priority and payload.priority != report.priority:
        report.priority = payload.priority
        changes.append(f"Priority set to {payload.priority}")

    if payload.assigned_crew and payload.assigned_crew != report.assigned_crew:
        report.assigned_crew = payload.assigned_crew
        changes.append(f"Assigned maintenance crew: {payload.assigned_crew}")

    if payload.authority_notes is not None:
        report.authority_notes = payload.authority_notes

    if payload.work_order_id:
        report.work_order_id = payload.work_order_id

    if payload.repair_image_url:
        report.repair_image_url = payload.repair_image_url

    report.updated_at = datetime.datetime.utcnow()

    # Log timeline if modifications occurred
    if changes:
        timeline = ReportTimeline(
            report_id=report.id,
            action="Authority Update",
            details=" | ".join(changes),
            actor="Road Authority Admin",
        )
        db.add(timeline)

    db.commit()
    db.refresh(report)
    return report


@app.post("/api/reports/{report_id}/upvote")
def upvote_report(report_id: int, db: Session = Depends(get_db)):
    """Allows citizens to upvote a hazard report to elevate urgency."""
    report = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.upvotes += 1
    db.commit()
    return {"id": report.id, "upvotes": report.upvotes}


# ----------------- COMPLAINTS / GRIEVANCE ENDPOINTS -----------------

@app.post("/api/complaints")
def create_complaint(payload: ComplaintCreateSchema, db: Session = Depends(get_db)):
    """Allows citizen to submit an official complaint or escalation to municipal authority."""
    count = db.query(Complaint).count()
    ticket_num = f"CMP-{datetime.datetime.utcnow().year}-{count + 101:04d}"

    complaint = Complaint(
        ticket_number=ticket_num,
        report_id=payload.report_id,
        citizen_name=payload.citizen_name,
        citizen_email=payload.citizen_email,
        citizen_phone=payload.citizen_phone or "",
        subject=payload.subject,
        description=payload.description,
        category=payload.category or "Delayed Repair",
        priority=payload.priority or "High",
        status="Open",
        authority_response="Your grievance has been registered. An inspection officer will review within 24 hours.",
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # If linked to a report, log on timeline
    if payload.report_id:
        timeline = ReportTimeline(
            report_id=payload.report_id,
            action="Citizen Complaint Filed",
            details=f"Ticket {ticket_num}: {payload.subject} ({payload.category})",
            actor=payload.citizen_name,
        )
        db.add(timeline)
        db.commit()

    return complaint


@app.get("/api/complaints")
def get_complaints(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Authority dashboard endpoint to inspect and resolve citizen complaints."""
    query = db.query(Complaint)

    if status and status != "All":
        query = query.filter(Complaint.status == status)

    if priority and priority != "All":
        query = query.filter(Complaint.priority == priority)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Complaint.ticket_number.ilike(search_fmt)) |
            (Complaint.subject.ilike(search_fmt)) |
            (Complaint.citizen_name.ilike(search_fmt)) |
            (Complaint.citizen_email.ilike(search_fmt))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return complaints


@app.patch("/api/complaints/{complaint_id}")
def update_complaint(complaint_id: int, payload: ComplaintUpdateSchema, db: Session = Depends(get_db)):
    """Authority endpoint to update complaint status, assign officer, and reply to citizen."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if payload.status:
        complaint.status = payload.status
        if payload.status == "Resolved":
            complaint.resolved_at = datetime.datetime.utcnow()

    if payload.authority_response:
        complaint.authority_response = payload.authority_response

    if payload.assigned_officer:
        complaint.assigned_officer = payload.assigned_officer

    if payload.priority:
        complaint.priority = payload.priority

    complaint.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint


# ----------------- ANALYTICS ENDPOINTS -----------------

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Calculates municipal road health and repair velocity metrics."""
    total_reports = db.query(PotholeReport).count()
    repaired_count = db.query(PotholeReport).filter(PotholeReport.status == "Repaired").count()
    in_progress_count = db.query(PotholeReport).filter(PotholeReport.status.in_(["In Progress", "Scheduled", "Under Review"])).count()
    pending_count = db.query(PotholeReport).filter(PotholeReport.status == "Pending").count()

    critical_count = db.query(PotholeReport).filter(PotholeReport.severity == "Critical").count()
    severe_count = db.query(PotholeReport).filter(PotholeReport.severity == "Severe").count()
    moderate_count = db.query(PotholeReport).filter(PotholeReport.severity == "Moderate").count()
    minor_count = db.query(PotholeReport).filter(PotholeReport.severity == "Minor").count()

    total_complaints = db.query(Complaint).count()
    open_complaints = db.query(Complaint).filter(Complaint.status != "Resolved").count()

    resolution_rate = round((repaired_count / max(1, total_reports)) * 100, 1)

    return {
        "summary": {
            "total_reports": total_reports,
            "repaired_count": repaired_count,
            "in_progress_count": in_progress_count,
            "pending_count": pending_count,
            "resolution_rate_pct": resolution_rate,
            "total_complaints": total_complaints,
            "open_complaints": open_complaints,
        },
        "severity_breakdown": {
            "Critical": critical_count,
            "Severe": severe_count,
            "Moderate": moderate_count,
            "Minor": minor_count,
        },
        "status_breakdown": {
            "Pending": pending_count,
            "In Progress / Scheduled": in_progress_count,
            "Repaired": repaired_count,
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
