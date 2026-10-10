import os
import random
import datetime
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base, PotholeReport, Complaint, ReportTimeline
from detector import detector

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def create_synthetic_pothole_image(filename: str, severity: str = "Moderate") -> str:
    """Generates a realistic asphalt road surface image with pothole crater for demonstration."""
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return f"/uploads/{filename}"

    width, height = 800, 600
    # Asphalt noise texture
    noise = np.random.randint(45, 85, (height, width), dtype=np.uint8)
    img = Image.fromarray(noise).convert("RGB")
    
    # Road markings (yellow or white line)
    draw = ImageDraw.Draw(img)
    draw.line([(0, int(height * 0.35)), (width, int(height * 0.35))], fill=(190, 180, 70), width=8)

    # Dark pothole depression
    cx, cy = int(width * 0.52), int(height * 0.58)
    rx = random.randint(90, 160) if severity in ["Critical", "Severe"] else random.randint(50, 90)
    ry = int(rx * 0.65)

    # Draw jagged crater
    poly_pts = []
    num_pts = 16
    for i in range(num_pts):
        angle = (2 * 3.14159 * i) / num_pts
        r_var = rx * (0.75 + 0.35 * random.random())
        px = int(cx + r_var * np.cos(angle))
        py = int(cy + (ry / rx) * r_var * np.sin(angle))
        poly_pts.append((px, py))

    # Crater fill & inner shadow
    draw.polygon(poly_pts, fill=(18, 18, 22))
    # Inner rim highlights
    for i in range(len(poly_pts)):
        p1 = poly_pts[i]
        p2 = poly_pts[(i + 1) % len(poly_pts)]
        draw.line([p1, p2], fill=(95, 95, 100), width=3)

    # Add gravel & texture
    for _ in range(120):
        gx = cx + random.randint(-rx, rx)
        gy = cy + random.randint(-ry, ry)
        draw.ellipse([gx, gy, gx + 3, gy + 3], fill=(130, 125, 115))

    img = img.filter(ImageFilter.SMOOTH_MORE)
    img.save(filepath, quality=90)
    return f"/uploads/{filename}"


def seed_database():
    """Populates database with realistic sample potholes across an urban grid, with statuses & complaints."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(PotholeReport).count() > 0:
        print("[DB Seeder] Database already populated. Skipping.")
        db.close()
        return

    print("[DB Seeder] Seeding initial pothole reports and citizen complaints...")

    # Anchor center around realistic urban coordinates (e.g. 28.6139, 77.2090 or San Francisco / London)
    # Let's use a dynamic vibrant center: 28.6139, 77.2090 (New Delhi / Global Metro)
    center_lat, center_lng = 28.6139, 77.2090

    sample_reports = [
        {
            "code": "REP-2026-001",
            "lat_offset": 0.0085,
            "lng_offset": 0.0120,
            "severity": "Critical",
            "status": "In Progress",
            "priority": "Emergency",
            "address": "MG Road, Near Central Metro Exit 2",
            "ward": "Ward 12 - Civic Center",
            "notes": "Large 14cm deep cavity causing heavy traffic bottlenecks and two-wheeler skid hazards.",
            "citizen_name": "Rajesh Sharma",
            "citizen_email": "rajesh.s@example.com",
            "citizen_phone": "+91 98765 43210",
            "assigned_crew": "Rapid Asphalt Repair Squad #4",
            "hazard_score": 92,
            "est_dim": "85 cm x 60 cm",
            "est_depth": 14.2,
            "upvotes": 48,
        },
        {
            "code": "REP-2026-002",
            "lat_offset": -0.0095,
            "lng_offset": 0.0040,
            "severity": "Severe",
            "status": "Pending",
            "priority": "High",
            "address": "Outer Ring Road, Underpass Lane 3",
            "ward": "Ward 8 - South Ring",
            "notes": "Deep crater formed after monsoon downpour. Potential tire puncture risk.",
            "citizen_name": "Priya Varma",
            "citizen_email": "priya.v@example.com",
            "citizen_phone": "+91 98112 23344",
            "assigned_crew": "Unassigned",
            "hazard_score": 78,
            "est_dim": "65 cm x 45 cm",
            "est_depth": 9.5,
            "upvotes": 29,
        },
        {
            "code": "REP-2026-003",
            "lat_offset": 0.0145,
            "lng_offset": -0.0110,
            "severity": "Moderate",
            "status": "Scheduled",
            "priority": "Medium",
            "address": "Sector 15 Main Commercial Market",
            "ward": "Ward 3 - Market North",
            "notes": "Surface depression expanding across the left turning lane.",
            "citizen_name": "Arun Kulkarni",
            "citizen_email": "arun.k@example.com",
            "citizen_phone": "+91 99234 56789",
            "assigned_crew": "Ward Maintenance Crew #2",
            "hazard_score": 54,
            "est_dim": "45 cm x 35 cm",
            "est_depth": 6.2,
            "upvotes": 14,
        },
        {
            "code": "REP-2026-004",
            "lat_offset": -0.0040,
            "lng_offset": -0.0150,
            "severity": "Minor",
            "status": "Repaired",
            "priority": "Low",
            "address": "Green Avenue, Block C Lane",
            "ward": "Ward 5 - Residential West",
            "notes": "Early asphalt unraveling near pedestrian crossing. Successfully patched and sealed.",
            "citizen_name": "Siddharth Roy",
            "citizen_email": "sid.roy@example.com",
            "citizen_phone": "+91 97654 32109",
            "assigned_crew": "Patrol & Patch Unit #1",
            "hazard_score": 28,
            "est_dim": "25 cm x 20 cm",
            "est_depth": 3.4,
            "upvotes": 9,
        },
        {
            "code": "REP-2026-005",
            "lat_offset": 0.0180,
            "lng_offset": 0.0060,
            "severity": "Critical",
            "status": "Under Review",
            "priority": "High",
            "address": "University Road, Opposite Science Faculty",
            "ward": "Ward 1 - Campus Zone",
            "notes": "Substantial crater in high-density student cycling pathway.",
            "citizen_name": "Ananya Sen",
            "citizen_email": "ananya.s@example.com",
            "citizen_phone": "+91 98450 11223",
            "assigned_crew": "Inspection Engineer Mehta",
            "hazard_score": 86,
            "est_dim": "75 cm x 50 cm",
            "est_depth": 11.8,
            "upvotes": 37,
        },
        {
            "code": "REP-2026-006",
            "lat_offset": -0.0160,
            "lng_offset": -0.0080,
            "severity": "Moderate",
            "status": "Pending",
            "priority": "Medium",
            "address": "Industrial Area Phase 2, Gate 4",
            "ward": "Ward 9 - Industrial East",
            "notes": "Repeated heavy truck loads causing road depression.",
            "citizen_name": "Vikram Malhotra",
            "citizen_email": "vikram.m@example.com",
            "citizen_phone": "+91 99887 76655",
            "assigned_crew": "Unassigned",
            "hazard_score": 59,
            "est_dim": "50 cm x 40 cm",
            "est_depth": 7.0,
            "upvotes": 18,
        }
    ]

    for item in sample_reports:
        img_filename = f"sample_{item['code'].lower()}.jpg"
        annotated_filename = f"annotated_{img_filename}"
        
        # Create synthetic image
        img_rel_url = create_synthetic_pothole_image(img_filename, item["severity"])
        
        # Analyze and generate annotated image
        raw_full_path = os.path.join(UPLOAD_DIR, img_filename)
        annotated_full_path = os.path.join(UPLOAD_DIR, annotated_filename)
        analysis = detector.analyze_image(raw_full_path, annotated_full_path)
        
        report = PotholeReport(
            report_code=item["code"],
            image_url=img_rel_url,
            annotated_image_url=f"/uploads/{annotated_filename}",
            repair_image_url=f"/uploads/{annotated_filename}" if item["status"] == "Repaired" else None,
            latitude=round(center_lat + item["lat_offset"], 6),
            longitude=round(center_lng + item["lng_offset"], 6),
            location_source="EXIF",
            address=item["address"],
            ward=item["ward"],
            city="Metropolitan Area",
            severity=item["severity"],
            confidence=analysis["confidence"],
            pothole_count=analysis["pothole_count"],
            bounding_boxes=analysis["detections"],
            segmentation_masks=[d.get("polygon", []) for d in analysis["detections"]],
            estimated_dimensions=item["est_dim"],
            estimated_depth_cm=item["est_depth"],
            hazard_score=item["hazard_score"],
            status=item["status"],
            priority=item["priority"],
            assigned_crew=item["assigned_crew"],
            authority_notes=f"Inspection logged. Work order pending verification." if item["status"] != "Repaired" else "Repaired with hot-mix bituminous asphalt.",
            citizen_name=item["citizen_name"],
            citizen_email=item["citizen_email"],
            citizen_phone=item["citizen_phone"],
            citizen_description=item["notes"],
            upvotes=item["upvotes"],
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 10)),
            updated_at=datetime.datetime.utcnow(),
        )
        db.add(report)
        db.flush()

        # Add timeline entry
        timeline1 = ReportTimeline(
            report_id=report.id,
            action="Report Submitted",
            details=f"Pothole report registered with AI severity analysis ({item['severity']}).",
            actor=item["citizen_name"],
            timestamp=report.created_at
        )
        db.add(timeline1)

        if item["status"] in ["Scheduled", "In Progress", "Repaired"]:
            timeline2 = ReportTimeline(
                report_id=report.id,
                action=f"Status: {item['status']}",
                details=f"Assigned to {item['assigned_crew']}. Priority set to {item['priority']}.",
                actor="PWD Road Engineer",
                timestamp=report.created_at + datetime.timedelta(hours=6)
            )
            db.add(timeline2)

    # Seed Sample Complaints
    sample_complaints = [
        {
            "ticket": "CMP-2026-101",
            "report_id": 1,
            "name": "Alok Mathur",
            "email": "alok.m@example.com",
            "phone": "+91 98765 11223",
            "subject": "Severe wheel rim damage due to MG Road pothole",
            "description": "My car's alloy wheel suffered severe bend and tire blowout yesterday night near Metro exit due to unlit deep pothole. Request immediate barrier placement and compensation.",
            "category": "Vehicle Damage",
            "priority": "Urgent",
            "status": "Escalated to PWD",
            "response": "Grievance received. Ward engineer notified for urgent barricading and repair dispatch.",
            "officer": "Chief Municipal Grievance Officer",
        },
        {
            "ticket": "CMP-2026-102",
            "report_id": 2,
            "name": "Sunita Rao",
            "email": "sunita.rao@example.com",
            "phone": "+91 98111 44556",
            "subject": "Delayed repair of Outer Ring Road underpass crater",
            "description": "This pothole has been open for 8 days causing severe traffic jams during morning rush hours. Please prioritize repair.",
            "category": "Delayed Repair",
            "priority": "High",
            "status": "Under Review",
            "response": "Inspection team has scheduled repair crew for night shift deployment.",
            "officer": "PWD South Zone",
        }
    ]

    for cmp in sample_complaints:
        complaint = Complaint(
            ticket_number=cmp["ticket"],
            report_id=cmp["report_id"],
            citizen_name=cmp["name"],
            citizen_email=cmp["email"],
            citizen_phone=cmp["phone"],
            subject=cmp["subject"],
            description=cmp["description"],
            category=cmp["category"],
            priority=cmp["priority"],
            status=cmp["status"],
            authority_response=cmp["response"],
            assigned_officer=cmp["officer"],
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
        )
        db.add(complaint)

    db.commit()
    db.close()
    print("[DB Seeder] Database populated successfully.")


if __name__ == "__main__":
    seed_database()
