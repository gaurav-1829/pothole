import subprocess
import time
import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def start_services():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    print("=" * 60)
    print("🚀 Starting RoadWatch AI Pothole Detection & Civic Action Platform")
    print("=" * 60)

    # 1. Start Backend FastAPI
    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    time.sleep(2)

    # 2. Start Frontend Vite Dev Server
    print("[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    print("\n" + "=" * 60)
    print("✅ System Operational!")
    print("🌐 Frontend Web App:  http://localhost:5173")
    print("🔌 Backend API & Docs: http://127.0.0.1:8000/docs")
    print("=" * 60)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    start_services()
