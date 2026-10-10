# 🛣️ RoadWatch AI — Pothole Detection & Civic Action Platform

An intelligent, full-stack pothole detection, spatial mapping, municipal authority workflow, and citizen grievance escalation system.

---

## 🌟 Key Features

### 1. 🔍 AI Computer Vision Detection & Severity Estimation
- **Asphalt Depression & Crater Detection**: Analyzes road surface texture, edge gradients, and depression contours.
- **Bounding Boxes & Polygon Segmentation Masks**: Visual bounding boxes and semi-transparent polygon contour overlays with corner accents.
- **Severity Scoring**: Dynamic multi-tier classification:
  - 🔴 **Critical**: Large surface area (>10%), deep cavity (>10 cm), hazard score $\ge 80$.
  - 🟠 **Severe**: Substantial depression, hazard score $60-79$.
  - 🟡 **Moderate**: Medium depression, hazard score $40-59$.
  - 🟢 **Minor**: Surface hairline crack/early erosion, hazard score $< 40$.
- **Dimensions & Depth Estimations**: Computes estimated width, height, and cavity depth in centimeters.
- **Physical Scale Calibration**: Supports reference objects (e.g. standard coin, A4 sheet) for real-world metric calibration.

### 2. 📍 Tri-Mode Geo-Spatial Location Capture
- **Photo EXIF GPS Extraction**: Automatically extracts GPS Latitude and Longitude directly from photo EXIF metadata (camera/phone GPS).
- **Browser HTML5 Geolocation**: One-click "Use Device GPS" button.
- **Interactive Manual Pin Dropper**: Leaflet map to click or drag a pin to pinpoint exact road location with real-time coordinate synchronization.

### 3. 🗺️ Public Interactive Hazard Map
- **Custom Status-Colored SVG Markers**:
  - 🔴 **Pending** (Red with pulse animation)
  - 🟠 **Under Review** (Orange)
  - 🟣 **Scheduled** (Purple)
  - 🟡 **In Progress** (Yellow)
  - 🟢 **Repaired** (Emerald Green)
- **Live Search & Multifaceted Filtering**: Filter by Status, Severity, Street, and Ward.
- **Pothole Detail Drawer & Upvoting**: View AI inspection visuals, dimensions, depth, citizen notes, and upvote urgency.
- **Direct Grievance Link**: One-click transition to file an official grievance linked to any mapped pothole.

### 4. 🏛️ Municipal Authority Portal & Dispatch Workflow
- **Executive Analytics Bar**: Real-time KPI counters for Total Hazards, Critical alerts, In Progress work, Resolution rate %, and Open Grievances.
- **Report Management**: Full table view with thumbnails, ward breakdown, and action triggers.
- **Work Order & Status Modal**:
  - Transition status (`Pending` $\rightarrow$ `Under Review` $\rightarrow$ `Scheduled` $\rightarrow$ `In Progress` $\rightarrow$ `Repaired` $\rightarrow$ `Rejected`).
  - Assign maintenance squads (e.g., *Rapid Asphalt Repair Squad #4*).
  - Adjust priority (`Emergency`, `High`, `Medium`, `Low`).
  - Add internal inspection and work order notes with full audit timeline tracking.

### 5. 📢 Citizen Grievance & Escalation System
- **Formal Complaint Submission**: Citizens can file escalation tickets (e.g., *Vehicle Rim Damage*, *Delayed Repair*, *Pedestrian Hazard*, *Waterlogging*).
- **Ticket Tracking**: Unique tracking ticket ID (e.g., `CMP-2026-0101`) to check resolution progress and read official authority responses in real time.
- **Authority Grievance Inbox**: Public works officers can review citizen claims, assign inspection officers, and send official replies.

---

## 🏗️ Architecture

```
pothole/
├── .env.example           # Environment template with placeholder keys
├── .gitignore             # Git ignore rules for node_modules, venv, .env, DBs, models
├── README.md              # Project documentation & setup instructions
├── run_app.py             # Unified launcher script for Python + Node
├── start.bat              # One-click Windows runner
├── backend/
│   ├── .env.example       # Backend-specific environment variables template
│   ├── database.py        # SQLAlchemy SQLite models & schema migrations
│   ├── detector.py        # Computer vision pothole detection & bounding box engine
│   ├── exif_parser.py     # EXIF metadata & GPS coordinate parser
│   ├── main.py            # FastAPI backend endpoints & middleware
│   ├── requirements.txt   # Python backend dependencies
│   ├── seed_data.py       # Realistic dataset & synthetic defect generator
│   ├── severity_config.json # Thresholds and reference standards configuration
│   └── uploads/           # Directory for uploaded and annotated images (ignored in git)
└── frontend/
    ├── .gitignore         # Frontend-specific ignore rules
    ├── index.html         # HTML root template
    ├── package.json       # Frontend scripts and npm dependencies
    ├── vite.config.js     # Vite configuration with backend API proxy
    └── src/
        ├── App.jsx        # Main React application
        ├── index.css      # Design system & Leaflet styling
        └── components/
            ├── AuthorityDashboard.jsx # Municipal dispatch & complaints inbox
            ├── ComplaintCenter.jsx    # Grievance submission & ticket tracker
            ├── DetectionStudio.jsx    # Image upload, AI visualizer & report form
            ├── Navbar.jsx             # Top navigation & tab switcher
            └── PublicMap.jsx          # Interactive Leaflet map with custom pins
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ (with npm)

### 1. Environment Setup
Copy the template environment file to configure your local variables:
```bash
cp .env.example .env
```
Or for backend specifically:
```bash
cp backend/.env.example backend/.env
```

### 2. Install Dependencies

**Backend:**
```bash
pip install -r backend/requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Launch Platform

#### Option A: One-Click Unified Runner (Recommended)
Run the unified launcher from the project root:
```bash
python run_app.py
```
Or on Windows:
```bash
start.bat
```

#### Option B: Run Services Individually
- **Backend (FastAPI)**:
  ```bash
  cd backend
  uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Frontend (Vite Dev Server)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 🌐 Application URLs

- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Docs (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **FastAPI Alternative Docs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🛡️ Git & Security Policies
Sensitive credentials and bulky binary files are strictly excluded via `.gitignore`:
- `.env` files containing secrets or private API tokens
- Python virtual environments (`venv/`, `.venv/`)
- Node modules (`node_modules/`) and build outputs (`dist/`)
- SQLite database files (`*.db`, `*.sqlite`)
- Image/media uploads (`uploads/`)
- AI model weights (`*.pt`, `*.pth`, `*.onnx`)
