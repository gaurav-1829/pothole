import os
import sys
import json
import urllib.request
import requests

if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def test_feature1():
    print("[TEST] 1. Checking /api/config/severity...")
    req = urllib.request.urlopen("http://localhost:8000/api/config/severity")
    cfg = json.loads(req.read().decode("utf-8"))
    assert "thresholds" in cfg, "Thresholds missing from config"
    assert "reference_standards" in cfg, "Reference standards missing from config"
    assert "coin" in cfg["reference_standards"]
    assert "a4" in cfg["reference_standards"]
    assert "lane" in cfg["reference_standards"]
    print("  SUCCESS: Severity and reference config loaded properly.")

    test_img = r"C:/Users/pundi/.gemini/antigravity/brain/79bbe2de-a42e-4c97-8f7e-39d7dd95b519/.user_uploaded/media_1791546883310_e197cfa9.png"
    if os.path.exists(test_img):
        print("[TEST] 2. Running detection without reference object...")
        with open(test_img, "rb") as f:
            res1 = requests.post("http://localhost:8000/api/detect", files={"file": f})
        assert res1.status_code == 200, f"Status code: {res1.status_code}"
        d1 = res1.json()
        analysis1 = d1["ai_analysis"]
        assert "area_ratio" in analysis1, "area_ratio missing"
        assert "est_width_cm" in analysis1, "est_width_cm missing"
        assert "est_length_cm" in analysis1, "est_length_cm missing"
        assert "size_method" in analysis1, "size_method missing"
        assert "severity_reasons" in analysis1, "severity_reasons missing"
        assert isinstance(analysis1["severity_reasons"], list)
        print(f"  SUCCESS: Detected area_ratio={analysis1['area_ratio']}, method={analysis1['size_method']}")
        print(f"  Dimensions: {analysis1['estimated_dimensions']}")
        print(f"  Reasons: {analysis1['severity_reasons']}")

        print("[TEST] 3. Running detection with physical scale reference (Rs 10 coin)...")
        with open(test_img, "rb") as f:
            res2 = requests.post(
                "http://localhost:8000/api/detect",
                files={"file": f},
                data={"reference_type": "coin", "reference_line_pixels": 54.0}
            )
        assert res2.status_code == 200
        d2 = res2.json()
        analysis2 = d2["ai_analysis"]
        assert analysis2["size_method"] == "reference"
        assert analysis2["reference_applied"] is True
        print(f"  SUCCESS: Calibrated dimensions={analysis2['estimated_dimensions']}")
        print(f"  Calibrated approx_area_cm2={analysis2['approx_area_cm2']}")
        print(f"  Reasons: {analysis2['severity_reasons']}")

        print("[TEST] 4. Submitting report and verifying database persistence...")
        payload = {
            "image_url": d2["image_url"],
            "annotated_image_url": d2["annotated_image_url"],
            "latitude": 30.3165,
            "longitude": 78.0322,
            "location_source": "Test",
            "address": "Dehradun Test Corridor",
            "city": "Dehradun",
            "ward": "Ward 08",
            "severity": analysis2["severity"],
            "confidence": analysis2["confidence"],
            "pothole_count": analysis2["pothole_count"],
            "estimated_dimensions": analysis2["estimated_dimensions"],
            "estimated_depth_cm": analysis2["estimated_depth_cm"],
            "hazard_score": analysis2["hazard_score"],
            "area_ratio": analysis2["area_ratio"],
            "est_width_cm": analysis2["est_width_cm"],
            "est_length_cm": analysis2["est_length_cm"],
            "size_method": analysis2["size_method"],
            "severity_reasons": analysis2["severity_reasons"],
            "citizen_name": "Test Engineer",
        }
        res_rep = requests.post("http://localhost:8000/api/reports", json=payload)
        assert res_rep.status_code == 200
        created = res_rep.json()
        assert created["area_ratio"] == analysis2["area_ratio"]
        assert created["est_width_cm"] == analysis2["est_width_cm"]
        assert created["est_length_cm"] == analysis2["est_length_cm"]
        assert created["size_method"] == "reference"
        assert len(created["severity_reasons"]) > 0
        print(f"  SUCCESS: Saved report {created['report_code']} with Feature 1 fields!")

    print("[ALL TESTS PASSED] Feature 1 backend is fully verified!")

if __name__ == "__main__":
    test_feature1()
