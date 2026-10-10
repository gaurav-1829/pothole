import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
import json
import math
from typing import Dict, List, Any, Optional
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Attempt Ultralytics YOLO import with graceful degradation
try:
    from ultralytics import YOLO
except Exception:
    YOLO = None


class PotholeDetector:
    """
    Intelligent Computer Vision & YOLO Pothole Detection and Severity Analysis Engine.

    Features:
    1. YOLO Segmentation / Detection Support:
       - Uses models/pothole-seg.pt (segmentation mask area) if present.
       - Uses models/pothole.pt (bounding box area) if present.
       - Gracefully falls back to optimized PIL/NumPy CV engine if weights are missing.
    2. Area Ratio Calculation:
       - Computes area_ratio = pothole pixel area / image area for each detection and total.
    3. Real-World Scale Calibration:
       - Supports reference objects: ₹10 coin (27 mm), A4 paper (210 x 297 mm),
         or standard lane width (assumed ~3.0 m).
       - Converts pixels to cm; estimates width, length, and approx area (cm²).
    4. Configurable Severity Logic:
       - Combines area_ratio, count, confidence, and real-world size into Low / Medium / High.
       - Produces transparent, explainable severity_reasons list.
    """

    SEVERITY_COLORS = {
        "Critical": (239, 68, 68),
        "High":     (239, 68, 68),
        "Severe":   (249, 115, 22),
        "Moderate": (234, 179, 8),
        "Medium":   (234, 179, 8),
        "Minor":    (16, 185, 129),
        "Low":      (16, 185, 129),
    }

    def __init__(self):
        self.config = self._load_config()
        self.yolo_seg_model = None
        self.yolo_det_model = None
        self._init_yolo_models()

    def _load_config(self) -> Dict[str, Any]:
        """Loads severity thresholds and reference standards from severity_config.json."""
        config_path = os.path.join(os.path.dirname(__file__), "severity_config.json")
        default_config = {
            "thresholds": {
                "high": {
                    "min_area_ratio": 0.045,
                    "min_est_width_cm": 55.0,
                    "min_potholes": 3,
                    "min_confidence": 0.75,
                },
                "medium": {
                    "min_area_ratio": 0.015,
                    "min_est_width_cm": 25.0,
                    "min_potholes": 2,
                    "min_confidence": 0.50,
                },
            },
            "reference_standards": {
                "coin": {
                    "id": "coin",
                    "name": "₹10 Coin",
                    "real_dimension_cm": 2.7,
                    "description": "Standard Reserve Bank of India ₹10 coin (27 mm diameter)",
                },
                "a4": {
                    "id": "a4",
                    "name": "A4 Paper",
                    "real_dimension_cm": 29.7,
                    "description": "Standard ISO 216 A4 sheet (210 × 297 mm)",
                },
                "lane": {
                    "id": "lane",
                    "name": "Standard Lane Width",
                    "real_dimension_cm": 300.0,
                    "description": "IRC Standard Urban Traffic Lane (assumed ~3.0 m)",
                    "is_assumption": True,
                },
            },
        }

        if os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[Detector] Warning loading severity_config.json: {e}")
        return default_config

    def _init_yolo_models(self):
        """Initializes YOLO segmentation or detection model if weight files exist."""
        if YOLO is None:
            return

        base_dir = os.path.dirname(__file__)
        root_dir = os.path.abspath(os.path.join(base_dir, ".."))

        # 1. Search for segmentation model
        seg_candidates = [
            os.getenv("YOLO_SEG_MODEL_PATH"),
            os.path.join(root_dir, "models", "pothole-seg.pt"),
            os.path.join(base_dir, "models", "pothole-seg.pt"),
            os.path.join(base_dir, "pothole-seg.pt"),
        ]
        for path in seg_candidates:
            if path and os.path.exists(path):
                try:
                    self.yolo_seg_model = YOLO(path)
                    print(f"[Detector] Successfully loaded YOLO segmentation model: {path}")
                    break
                except Exception as e:
                    print(f"[Detector] Failed loading YOLO seg model {path}: {e}")

        # 2. Search for standard detection model
        det_candidates = [
            os.getenv("YOLO_MODEL_PATH"),
            os.path.join(root_dir, "models", "pothole.pt"),
            os.path.join(base_dir, "models", "pothole.pt"),
            os.path.join(base_dir, "pothole.pt"),
        ]
        for path in det_candidates:
            if path and os.path.exists(path):
                try:
                    self.yolo_det_model = YOLO(path)
                    print(f"[Detector] Successfully loaded YOLO detection model: {path}")
                    break
                except Exception as e:
                    print(f"[Detector] Failed loading YOLO det model {path}: {e}")

    # -------------------------------------------------------------------------
    # MAIN ANALYSIS API
    # -------------------------------------------------------------------------

    def analyze_image(
        self,
        input_image_path: str,
        output_annotated_path: str,
        reference_info: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes pothole detection, area calculation, size estimation, and severity scoring.
        Accepts optional reference_info:
        {
            "type": "coin" | "a4" | "lane",
            "line_pixels": float (or line_coords: {"x1":.., "y1":.., "x2":.., "y2":..})
        }
        """
        with Image.open(input_image_path) as orig_img:
            img = orig_img.convert("RGB")
            width, height = img.size
            total_image_pixels = max(1, width * height)

            # 1. Attempt YOLO detection if models available
            detections, method = self._try_yolo_detection(input_image_path, width, height)

            # 2. Fall back to computer vision pipeline if YOLO produced no candidate or unavailable
            if detections is None:
                detections, method = self._cv_detection_pipeline(img, width, height)

            # 3. Clean road case
            if not detections:
                self._render_clean_road_annotation(img, output_annotated_path)
                return self._no_pothole_result(0.95)

            # 4. Calibration with Real-World Size Reference (if provided)
            calibrated_method, cm_per_pixel, ref_details = self._calculate_scale(
                reference_info, width, height, method
            )

            # 5. Populate per-detection dimensions, area_ratio, and telemetry
            total_pothole_pixels = 0
            for det in detections:
                px_area = det.get("pixel_area", 0)
                total_pothole_pixels += px_area
                det_area_ratio = round(px_area / total_image_pixels, 5)
                det["area_ratio"] = det_area_ratio

                p_w = det["box"][3] - det["box"][1]
                p_h = det["box"][2] - det["box"][0]

                if cm_per_pixel is not None:
                    est_w = round(p_w * cm_per_pixel, 1)
                    est_l = round(p_h * cm_per_pixel, 1)
                    approx_area = round(px_area * (cm_per_pixel ** 2), 1)
                else:
                    # Perspective-adjusted optical estimate
                    est_w = max(18.0, min(140.0, round((p_w / width) * 160.0, 1)))
                    est_l = max(14.0, min(120.0, round((p_h / height) * 130.0, 1)))
                    approx_area = round(est_w * est_l * 0.78, 1)

                det["est_width_cm"] = est_w
                det["est_length_cm"] = est_l
                det["approx_area_cm2"] = approx_area
                det["dimensions_str"] = f"about {int(est_w)} x {int(est_l)} cm"
                det["size_method"] = calibrated_method

            total_area_ratio = round(total_pothole_pixels / total_image_pixels, 5)

            # 6. Evaluate Multi-factor Severity & Explainability Reasons
            primary = detections[0]
            severity, severity_level, reasons, hazard_score = self._compute_severity(
                total_area_ratio,
                len(detections),
                primary["confidence"],
                primary["est_width_cm"],
                primary.get("depth_cm", 6.0),
                ref_details,
            )

            # Assign severity & index labels to each pothole
            for idx, det in enumerate(detections):
                det["pothole_index"] = idx + 1
                det["pothole_id"] = f"Pothole #{idx + 1}"
                det["severity"] = severity
                det["severity_level"] = severity_level
                det["hazard_score"] = hazard_score

            # 7. Render Rich Annotated Visual Overlay
            self._render_annotations(
                img, detections, output_annotated_path, calibrated_method, ref_details
            )

            summary_msg = (
                f"1 pothole detected: {severity} severity ({primary['dimensions_str']})"
                if len(detections) == 1
                else f"{len(detections)} distinct potholes detected (total coverage: {round(total_area_ratio * 100, 1)}%)"
            )

            return {
                "pothole_count": len(detections),
                "has_pothole": True,
                "message": summary_msg,
                "overall_severity": severity,
                "severity": severity,
                "severity_level": severity_level,
                "severity_reasons": reasons,
                "area_ratio": total_area_ratio,
                "total_area_ratio": total_area_ratio,
                "est_width_cm": primary["est_width_cm"],
                "est_length_cm": primary["est_length_cm"],
                "estimated_dimensions": primary["dimensions_str"],
                "approx_area_cm2": primary["approx_area_cm2"],
                "size_method": calibrated_method,
                "reference_applied": ref_details is not None,
                "reference_name": ref_details["name"] if ref_details else None,
                "reference_is_assumption": ref_details.get("is_assumption", False) if ref_details else False,
                "confidence": round(sum(d["confidence"] for d in detections) / len(detections), 2),
                "hazard_score": hazard_score,
                "estimated_depth_cm": primary.get("depth_cm", 6.0),
                "detections": detections,
            }

    # -------------------------------------------------------------------------
    # YOLO & CV INFERENCE ENGINES
    # -------------------------------------------------------------------------

    def _try_yolo_detection(self, image_path: str, orig_w: int, orig_h: int):
        """Attempts inference with YOLO segmentation or detection weights."""
        if self.yolo_seg_model is not None:
            try:
                results = self.yolo_seg_model(image_path, verbose=False)
                res = results[0]
                if len(res.boxes) > 0:
                    dets = []
                    boxes = res.boxes.xyxy.cpu().numpy()
                    confs = res.boxes.conf.cpu().numpy()
                    masks = res.masks.xy if res.masks is not None else None

                    for i, box in enumerate(boxes):
                        x1, y1, x2, y2 = box.astype(int)
                        conf = float(confs[i])
                        contour = []
                        if masks is not None and i < len(masks):
                            contour = [[int(pt[0]), int(pt[1])] for pt in masks[i]]
                            px_area = self._polygon_area(contour)
                        else:
                            px_area = (x2 - x1) * (y2 - y1)
                            contour = self._make_polygon_contour(x1, y1, x2, y2)

                        dets.append({
                            "box": [y1, x1, y2, x2],
                            "normalized_box": [y1 / orig_h, x1 / orig_w, y2 / orig_h, x2 / orig_w],
                            "confidence": round(conf, 2),
                            "pixel_area": max(1, px_area),
                            "polygon": contour,
                            "depth_cm": 6.5,
                            "location_zone": "Center Lane",
                        })
                    return dets, "mask" if masks is not None else "bbox"
            except Exception as e:
                print(f"[Detector] YOLO seg inference error, falling back: {e}")

        if self.yolo_det_model is not None:
            try:
                results = self.yolo_det_model(image_path, verbose=False)
                res = results[0]
                if len(res.boxes) > 0:
                    dets = []
                    boxes = res.boxes.xyxy.cpu().numpy()
                    confs = res.boxes.conf.cpu().numpy()

                    for i, box in enumerate(boxes):
                        x1, y1, x2, y2 = box.astype(int)
                        conf = float(confs[i])
                        px_area = (x2 - x1) * (y2 - y1)
                        contour = self._make_polygon_contour(x1, y1, x2, y2)

                        dets.append({
                            "box": [y1, x1, y2, x2],
                            "normalized_box": [y1 / orig_h, x1 / orig_w, y2 / orig_h, x2 / orig_w],
                            "confidence": round(conf, 2),
                            "pixel_area": max(1, px_area),
                            "polygon": contour,
                            "depth_cm": 6.0,
                            "location_zone": "Center Lane",
                        })
                    return dets, "bbox"
            except Exception as e:
                print(f"[Detector] YOLO det inference error, falling back: {e}")

        return None, None

    def _cv_detection_pipeline(self, img: Image.Image, width: int, height: int):
        """Computer vision gradient and contour discovery pipeline."""
        analysis_w = 640
        analysis_h = max(240, int(640 * (height / width)))
        thumb = img.resize((analysis_w, analysis_h), Image.Resampling.BILINEAR)
        gray = thumb.convert("L")
        arr = np.asarray(gray).astype(np.float32)

        std_val = float(np.std(arr))
        if std_val < 8.0:
            return [], "bbox"

        lower_half = arr[int(analysis_h * 0.45):, :]
        lower_mean = float(np.mean(lower_half))
        lower_std = float(np.std(lower_half))
        if not (30.0 <= lower_mean <= 225.0) or lower_std < 5.0:
            return [], "bbox"

        road_start_row = int(analysis_h * 0.25)
        road_arr = arr[road_start_row:, :]
        road_mean = float(np.mean(road_arr))
        road_std = float(np.std(road_arr))

        min_contrast = min(35.0, max(20.0, road_std * 0.55))
        darkness_threshold = road_mean - min_contrast

        y_indices = np.arange(analysis_h).reshape(-1, 1)
        road_roi = (y_indices >= road_start_row)
        candidate_mask = (arr < darkness_threshold) & road_roi

        raw_detections = self._extract_clusters(
            candidate_mask, arr, analysis_w, analysis_h, width, height, road_mean, road_std
        )
        filtered = self._filter_and_index_detections(raw_detections, width, height)
        return filtered, "mask"

    # -------------------------------------------------------------------------
    # SIZE CALIBRATION & SEVERITY RULES
    # -------------------------------------------------------------------------

    def _calculate_scale(
        self,
        reference_info: Optional[Dict[str, Any]],
        width: int,
        height: int,
        default_method: str,
    ):
        """Calculates cm-per-pixel ratio from user-supplied reference object."""
        if not reference_info or not isinstance(reference_info, dict):
            return default_method, None, None

        ref_type = reference_info.get("type", "").lower()
        standards = self.config.get("reference_standards", {})

        if ref_type not in standards:
            return default_method, None, None

        ref_cfg = standards[ref_type]
        real_dim_cm = ref_cfg["real_dimension_cm"]

        # Determine line length in pixels
        line_px = reference_info.get("line_pixels")
        if not line_px and "line_coords" in reference_info:
            coords = reference_info["line_coords"]
            dx = coords.get("x2", 0) - coords.get("x1", 0)
            dy = coords.get("y2", 0) - coords.get("y1", 0)
            line_px = math.hypot(dx, dy)

        if not line_px or line_px < 6.0:
            return default_method, None, None

        cm_per_pixel = real_dim_cm / float(line_px)
        return "reference", cm_per_pixel, ref_cfg

    def _compute_severity(
        self,
        total_area_ratio: float,
        pothole_count: int,
        confidence: float,
        max_width_cm: float,
        depth_cm: float,
        ref_details: Optional[Dict[str, Any]],
    ):
        """Evaluates configurable thresholds and builds transparent reasons."""
        thresh = self.config.get("thresholds", {})
        high_cfg = thresh.get("high", {})
        med_cfg = thresh.get("med", thresh.get("medium", {}))

        reasons = []

        is_high = (
            total_area_ratio >= high_cfg.get("min_area_ratio", 0.045)
            or max_width_cm >= high_cfg.get("min_est_width_cm", 55.0)
            or pothole_count >= high_cfg.get("min_potholes", 3)
            or depth_cm >= 8.5
        )

        is_med = (
            total_area_ratio >= med_cfg.get("min_area_ratio", 0.015)
            or max_width_cm >= med_cfg.get("min_est_width_cm", 25.0)
            or pothole_count >= med_cfg.get("min_potholes", 2)
            or depth_cm >= 4.5
        )

        if is_high:
            severity = "High"
            severity_level = "High"
            hazard_score = min(98, int(75 + total_area_ratio * 300 + max_width_cm * 0.25))
        elif is_med:
            severity = "Medium"
            severity_level = "Medium"
            hazard_score = min(74, int(45 + total_area_ratio * 400 + max_width_cm * 0.25))
        else:
            severity = "Low"
            severity_level = "Low"
            hazard_score = min(40, int(20 + total_area_ratio * 500 + max_width_cm * 0.2))

        # Build Explainability Reasons
        area_pct_str = f"{round(total_area_ratio * 100, 2)}%"
        if total_area_ratio >= high_cfg.get("min_area_ratio", 0.045):
            reasons.append(f"Surface area ratio is {area_pct_str} of road frame (high crater coverage).")
        elif total_area_ratio >= med_cfg.get("min_area_ratio", 0.015):
            reasons.append(f"Surface area ratio is {area_pct_str} of road frame (moderate coverage).")
        else:
            reasons.append(f"Localized surface defect covering {area_pct_str} of frame.")

        if max_width_cm >= high_cfg.get("min_est_width_cm", 55.0):
            reasons.append(f"Estimated width is {int(max_width_cm)} cm (exceeds high threshold of {high_cfg.get('min_est_width_cm')} cm).")
        elif max_width_cm >= med_cfg.get("min_est_width_cm", 25.0):
            reasons.append(f"Estimated width is {int(max_width_cm)} cm (moderate vehicular impact).")

        if pothole_count >= 2:
            reasons.append(f"Multiple defects detected: cluster of {pothole_count} distinct potholes.")

        if ref_details:
            ref_name = ref_details.get("name", "Reference object")
            if ref_details.get("is_assumption", False):
                reasons.append(f"Real-world scale calibrated using {ref_name} (assumed 3.0 m lane width).")
            else:
                reasons.append(f"Real-world scale calibrated using {ref_name} ({ref_details.get('real_dimension_cm')} cm).")
        else:
            reasons.append("Scale estimated from camera perspective without physical reference.")

        return severity, severity_level, reasons, hazard_score

    # -------------------------------------------------------------------------
    # CV CLUSTER DISCOVERY & POST-PROCESSING
    # -------------------------------------------------------------------------

    def _extract_clusters(
        self,
        mask: np.ndarray,
        gray_arr: np.ndarray,
        t_w: int,
        t_h: int,
        orig_w: int,
        orig_h: int,
        road_mean: float,
        road_std: float,
    ) -> List[Dict[str, Any]]:
        candidates = []
        visited = np.zeros_like(mask, dtype=bool)

        step = 6
        min_pts = max(12, int((t_w * t_h * 0.0015) / (step * step)))
        max_pts = int((t_w * t_h * 0.45) / (step * step))

        for y in range(0, t_h - step, step):
            for x in range(0, t_w - step, step):
                if not mask[y, x] or visited[y, x]:
                    continue

                min_x, max_x, min_y, max_y = x, x, y, y
                queue = [(y, x)]
                visited[y, x] = True
                pts = []

                while queue and len(pts) < 15000:
                    cy, cx = queue.pop(0)
                    pts.append((cx, cy))
                    min_x = min(min_x, cx); max_x = max(max_x, cx)
                    min_y = min(min_y, cy); max_y = max(max_y, cy)
                    for dy, dx in ((-step, 0), (step, 0), (0, -step), (0, step)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < t_h and 0 <= nx < t_w and mask[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            queue.append((ny, nx))

                if not (min_pts <= len(pts) <= max_pts):
                    continue

                box_w = max_x - min_x
                box_h = max_y - min_y

                if box_w < 20 or box_h < 16:
                    continue

                cluster_mean = float(np.mean(gray_arr[min_y:max_y + 1, min_x:max_x + 1]))
                contrast_delta = road_mean - cluster_mean
                if contrast_delta < 18.0:
                    continue

                aspect = box_w / max(box_h, 1)
                if aspect > 4.0 or aspect < 0.20:
                    continue

                scale_x = orig_w / t_w
                scale_y = orig_h / t_h
                s_min_x = max(0, int(min_x * scale_x))
                s_max_x = min(orig_w, int(max_x * scale_x))
                s_min_y = max(0, int(min_y * scale_y))
                s_max_y = min(orig_h, int(max_y * scale_y))

                box_area = (s_max_x - s_min_x) * (s_max_y - s_min_y)
                area_pct = round((box_area / (orig_w * orig_h)) * 100, 2)
                if area_pct > 40.0:
                    continue

                # Asphalt border texture check
                pad = step * 2
                border_px_vals = []
                patches = [
                    (max(0, min_y - pad), max(0, min_y - pad), min(t_h - 1, min_y), min(t_w - 1, max_x)),
                    (min(t_h - 1, max_y), min(t_h - 1, max_y), min(t_h - 1, max_y + pad), min(t_w - 1, max_x)),
                    (min_y, max(0, min_x - pad), min(t_h - 1, max_y), min(t_w - 1, min_x)),
                    (min_y, min(t_w - 1, max_x), min(t_h - 1, max_y), min(t_w - 1, max_x + pad)),
                ]
                for (py1, px1, py2, px2) in patches:
                    if py2 > py1 and px2 > px1:
                        patch = gray_arr[py1:py2 + 1, px1:px2 + 1]
                        if patch.size > 0:
                            border_px_vals.append(float(np.mean(patch)))

                if border_px_vals:
                    border_mean = float(np.mean(border_px_vals))
                    if not (40.0 <= border_mean <= 215.0) or border_mean < cluster_mean + 12.0:
                        continue

                # Edge gradient verification
                roi = gray_arr[min_y:max_y + 1, min_x:max_x + 1]
                if roi.shape[0] >= 3 and roi.shape[1] >= 3:
                    lap = (
                        -roi[:-2, 1:-1] - roi[2:, 1:-1]
                        - roi[1:-1, :-2] - roi[1:-1, 2:]
                        + 4 * roi[1:-1, 1:-1]
                    )
                    edge_density = float(np.mean(np.abs(lap)))
                    if edge_density < 1.5:
                        continue

                contour = self._make_polygon_contour(s_min_x, s_min_y, s_max_x, s_max_y)
                poly_area = self._polygon_area(contour)

                depth_cm = round(
                    max(2.5, min(16.0, (contrast_delta / 10.0) * (1.0 + area_pct * 0.10))), 1
                )
                conf = round(min(0.97, 0.75 + (contrast_delta / 90.0) * 0.20), 2)

                cx_norm = (s_min_x + s_max_x) / (2.0 * orig_w)
                cy_norm = (s_min_y + s_max_y) / (2.0 * orig_h)
                horizontal = "Left Lane" if cx_norm < 0.38 else "Right Shoulder" if cx_norm > 0.62 else "Center Lane"
                vertical = "Foreground" if cy_norm > 0.65 else "Mid-Distance"

                candidates.append({
                    "box": [s_min_y, s_min_x, s_max_y, s_max_x],
                    "normalized_box": [
                        round(s_min_y / orig_h, 4), round(s_min_x / orig_w, 4),
                        round(s_max_y / orig_h, 4), round(s_max_x / orig_w, 4),
                    ],
                    "confidence": conf,
                    "depth_cm": depth_cm,
                    "area_percentage": area_pct,
                    "pixel_area": max(1, poly_area),
                    "polygon": contour,
                    "location_zone": f"{horizontal} ({vertical})",
                    "hazard_score": int(50 + area_pct * 2 + depth_cm * 2),
                })

        return candidates

    def _filter_and_index_detections(
        self, candidates: List[Dict[str, Any]], orig_w: int, orig_h: int
    ) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        candidates.sort(key=lambda c: c.get("hazard_score", 0), reverse=True)
        filtered = []

        for cand in candidates:
            y1, x1, y2, x2 = cand["box"]
            cand_area = max(1, (x2 - x1) * (y2 - y1))
            keep = True
            for chosen in filtered:
                cy1, cx1, cy2, cx2 = chosen["box"]
                ix1 = max(x1, cx1); iy1 = max(y1, cy1)
                ix2 = min(x2, cx2); iy2 = min(y2, cy2)
                if ix1 < ix2 and iy1 < iy2:
                    inter = (ix2 - ix1) * (iy2 - iy1)
                    union = cand_area + (cx2 - cx1) * (cy2 - cy1) - inter
                    if inter / max(union, 1) > 0.35:
                        keep = False
                        break
            if keep:
                filtered.append(cand)
            if len(filtered) >= 6:
                break

        return filtered

    # -------------------------------------------------------------------------
    # GEOMETRY & RENDERING HELPERS
    # -------------------------------------------------------------------------

    def _polygon_area(self, points: List[List[int]]) -> int:
        """Computes polygon area using the Shoelace formula."""
        if len(points) < 3:
            return 0
        n = len(points)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += points[i][0] * points[j][1]
            area -= points[j][0] * points[i][1]
        return int(abs(area) / 2.0)

    def _make_polygon_contour(self, min_x: int, min_y: int, max_x: int, max_y: int) -> List[List[int]]:
        w = max_x - min_x
        h = max_y - min_y
        cx, cy = min_x + w / 2, min_y + h / 2
        pts = []
        for i in range(12):
            angle = (2 * math.pi * i) / 12
            rx = (w / 2) * (0.85 + 0.15 * math.sin(i * 3.5))
            ry = (h / 2) * (0.85 + 0.15 * math.cos(i * 2.7))
            pts.append([int(cx + rx * math.cos(angle)), int(cy + ry * math.sin(angle))])
        return pts

    def _no_pothole_result(self, conf: float) -> Dict[str, Any]:
        return {
            "pothole_count": 0,
            "has_pothole": False,
            "message": "No pothole detected. Road surface appears clear and intact.",
            "overall_severity": "Low",
            "severity": "Low",
            "severity_level": "Low",
            "severity_reasons": ["Pavement surface is intact with no structural depressions."],
            "area_ratio": 0.0,
            "total_area_ratio": 0.0,
            "est_width_cm": 0.0,
            "est_length_cm": 0.0,
            "estimated_dimensions": "0 cm x 0 cm",
            "approx_area_cm2": 0.0,
            "size_method": "bbox",
            "reference_applied": False,
            "reference_name": None,
            "reference_is_assumption": False,
            "confidence": conf,
            "hazard_score": 0,
            "estimated_depth_cm": 0.0,
            "detections": [],
        }

    def _render_clean_road_annotation(self, img: Image.Image, output_path: str):
        annotated = img.copy()
        draw = ImageDraw.Draw(annotated)
        banner_h = max(40, int(img.height * 0.08))
        draw.rectangle([0, 0, img.width, banner_h], fill=(16, 185, 129))
        try:
            font = ImageFont.truetype("arial.ttf", size=max(14, int(banner_h * 0.42)))
        except Exception:
            font = ImageFont.load_default()
        draw.text(
            (20, int(banner_h * 0.28)),
            "✓ ROAD SURFACE AUDIT: NO POTHOLE DETECTED • PAVEMENT INTACT",
            fill=(255, 255, 255),
            font=font,
        )
        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        annotated.save(output_path, quality=92)

    def _render_annotations(
        self,
        img: Image.Image,
        detections: List[Dict[str, Any]],
        output_path: str,
        size_method: str,
        ref_details: Optional[Dict[str, Any]],
    ):
        annotated = img.copy()
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        draw = ImageDraw.Draw(annotated)

        try:
            font_badge = ImageFont.truetype("arial.ttf", size=max(13, int(img.width * 0.018)))
            font_header = ImageFont.truetype("arial.ttf", size=max(16, int(img.width * 0.022)))
            font_footer = ImageFont.truetype("arial.ttf", size=max(11, int(img.width * 0.015)))
        except Exception:
            font_badge = font_header = font_footer = ImageFont.load_default()

        # Top Banner
        top_h = max(38, int(img.height * 0.07))
        banner_color = (245, 158, 11) if len(detections) >= 2 else (30, 41, 59)
        draw.rectangle([0, 0, img.width, top_h], fill=banner_color)

        summary_title = (
            f"AI AUDIT: {len(detections)} DEFECTS DETECTED • {size_method.upper()} SIZING"
            if len(detections) >= 2
            else f"AI AUDIT: POTHOLE DETECTED • {size_method.upper()} SIZING"
        )
        draw.text((16, int(top_h * 0.25)), summary_title, fill=(255, 255, 255), font=font_header)

        # Draw Potholes
        for det in detections:
            sev = det.get("severity", "Moderate")
            color = self.SEVERITY_COLORS.get(sev, (234, 179, 8))
            min_y, min_x, max_y, max_x = det["box"]
            pid = det["pothole_id"]

            if "polygon" in det and len(det["polygon"]) >= 3:
                draw_ov.polygon([(p[0], p[1]) for p in det["polygon"]], fill=(*color, 85))

            bw = max(3, int(img.width * 0.005))
            for i in range(bw):
                draw.rectangle([min_x - i, min_y - i, max_x + i, max_y + i], outline=color)

            cl = max(15, int((max_x - min_x) * 0.15))
            for i in range(bw + 1):
                draw.line([(min_x - i, min_y - i), (min_x - i + cl, min_y - i)], fill=(255, 255, 255), width=2)
                draw.line([(min_x - i, min_y - i), (min_x - i, min_y - i + cl)], fill=(255, 255, 255), width=2)
                draw.line([(max_x + i, max_y + i), (max_x + i - cl, max_y + i)], fill=(255, 255, 255), width=2)
                draw.line([(max_x + i, max_y + i), (max_x + i, max_y + i - cl)], fill=(255, 255, 255), width=2)

            badge = (
                f"{pid} • Estimated size: {det['dimensions_str']} "
                f"({sev.upper()} • {int(det['confidence']*100)}%)"
            )
            tb = draw.textbbox((0, 0), badge, font=font_badge)
            tw, th = tb[2] - tb[0], tb[3] - tb[1]
            pad = 6
            by1 = max(4, min_y - th - pad * 2 - 4)
            by2 = by1 + th + pad * 2
            bx1, bx2 = min_x, min_x + tw + pad * 2
            draw.rectangle([bx1, by1, bx2, by2], fill=(24, 24, 27))
            draw.rectangle([bx1, by1, bx2, by2], outline=color, width=2)
            draw.text((bx1 + pad, by1 + pad - 2), badge, fill=(255, 255, 255), font=font_badge)

        # Bottom Honest Estimation Disclaimer Pill
        footer_h = max(26, int(img.height * 0.045))
        footer_y = img.height - footer_h
        draw.rectangle([0, footer_y, img.width, img.height], fill=(15, 23, 42))

        ref_label = f"Ref: {ref_details['name']}" if ref_details else "Single photo perspective"
        disclaimer_text = f"ℹ Estimated size ({ref_label}) — estimate from a single photo, not a precise measurement."
        draw.text((14, footer_y + 4), disclaimer_text, fill=(203, 213, 225), font=font_footer)

        annotated = Image.alpha_composite(annotated.convert("RGBA"), overlay).convert("RGB")
        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        annotated.save(output_path, quality=92)


detector = PotholeDetector()
