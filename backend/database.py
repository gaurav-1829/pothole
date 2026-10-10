import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "sqlite:///./pothole_reports.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_code = Column(String(50), unique=True, index=True)
    
    # Image Paths
    image_url = Column(String(500), nullable=False)
    annotated_image_url = Column(String(500), nullable=True)
    repair_image_url = Column(String(500), nullable=True)
    
    # Location
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location_source = Column(String(50), default="EXIF")  # EXIF, Browser_GPS, Manual_Pin
    address = Column(String(500), default="Road Segment, Sector Analysis")
    city = Column(String(100), default="Metro City")
    ward = Column(String(100), default="Ward 4 - Central Zone")

    # Detection & AI Analysis
    severity = Column(String(50), default="Moderate", index=True)  # Low, Medium, High (or Minor, Moderate, Severe, Critical)
    confidence = Column(Float, default=0.88)
    pothole_count = Column(Integer, default=1)
    bounding_boxes = Column(JSON, default=list)  # [{box: [ymin, xmin, ymax, xmax], label, confidence, severity, area_pct}]
    segmentation_masks = Column(JSON, default=list)  # polygon contours
    estimated_dimensions = Column(String(100), default="45 cm x 30 cm")
    estimated_depth_cm = Column(Float, default=6.5)
    hazard_score = Column(Integer, default=65)  # 1 to 100

    # Feature 1: Pothole Size & Measurement Estimation
    area_ratio = Column(Float, default=0.0)
    est_width_cm = Column(Float, default=0.0)
    est_length_cm = Column(Float, default=0.0)
    size_method = Column(String(50), default="bbox")  # "mask", "bbox", "reference"
    severity_reasons = Column(JSON, default=list)

    # Workflow Status
    # Statuses: Pending (Red), Under Review (Orange), Scheduled (Purple), In Progress (Yellow), Repaired (Green), Rejected (Gray)
    status = Column(String(50), default="Pending", index=True)
    priority = Column(String(50), default="Medium")  # Low, Medium, High, Emergency
    assigned_crew = Column(String(200), default="Unassigned")
    authority_notes = Column(Text, default="")
    work_order_id = Column(String(100), nullable=True)

    # Citizen Info
    citizen_name = Column(String(200), default="Anonymous Citizen")
    citizen_email = Column(String(200), default="")
    citizen_phone = Column(String(50), default="")
    citizen_description = Column(Text, default="")
    upvotes = Column(Integer, default=1)

    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    scheduled_date = Column(DateTime, nullable=True)
    repaired_date = Column(DateTime, nullable=True)

    # Relationships
    complaints = relationship("Complaint", back_populates="report", cascade="all, delete-orphan")
    timeline_logs = relationship("ReportTimeline", back_populates="report", cascade="all, delete-orphan")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_number = Column(String(50), unique=True, index=True)
    report_id = Column(Integer, ForeignKey("pothole_reports.id"), nullable=True)
    
    citizen_name = Column(String(200), nullable=False)
    citizen_email = Column(String(200), nullable=False)
    citizen_phone = Column(String(50), default="")
    
    subject = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Delayed Repair") # Vehicle Damage, Delayed Repair, Danger to Pedestrians, Waterlogging, Repeat Issue
    priority = Column(String(50), default="High") # Normal, High, Urgent
    
    status = Column(String(50), default="Open") # Open, Under Review, Escalated to PWD, Action Taken, Resolved
    authority_response = Column(Text, default="")
    assigned_officer = Column(String(200), default="Municipal Grievance Cell")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    report = relationship("PotholeReport", back_populates="complaints")


class ReportTimeline(Base):
    __tablename__ = "report_timeline"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("pothole_reports.id"), nullable=False)
    action = Column(String(100), nullable=False) # Created, Status Changed, Crew Assigned, Note Added, Repaired
    details = Column(Text, default="")
    actor = Column(String(100), default="System") # Citizen, System, Road Maintenance Officer
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("PotholeReport", back_populates="timeline_logs")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def upgrade_database_schema(target_engine=engine):
    """
    Safely inspects database tables and adds missing columns dynamically.
    Ensures zero data loss or table recreation errors across migrations.
    """
    from sqlalchemy import inspect, text

    inspector = inspect(target_engine)
    if "pothole_reports" in inspector.get_table_names():
        existing_cols = {col["name"] for col in inspector.get_columns("pothole_reports")}
        
        new_columns = {
            "area_ratio": "FLOAT DEFAULT 0.0",
            "est_width_cm": "FLOAT DEFAULT 0.0",
            "est_length_cm": "FLOAT DEFAULT 0.0",
            "size_method": "VARCHAR(50) DEFAULT 'bbox'",
            "severity_reasons": "JSON DEFAULT '[]'",
        }

        with target_engine.connect() as conn:
            for col_name, col_type in new_columns.items():
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE pothole_reports ADD COLUMN {col_name} {col_type}"))
            conn.commit()
