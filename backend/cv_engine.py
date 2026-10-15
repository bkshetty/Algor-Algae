import cv2  # type: ignore
import numpy as np
import base64
from typing import Tuple, Dict, Any

try:
    from ultralytics import YOLO  # type: ignore
    _YOLO_AVAILABLE = True
except ImportError:
    _YOLO_AVAILABLE = False
    YOLO = None  # type: ignore


class CVEngine:
    """
    Computer Vision Engine for Algor-Algae Digital Twin.
    - YOLOv8 for Person/Occupancy detection and mathematical CO2 derivation.
    - OpenCV HSV color segmentation on a designated 220x220 ROI for Algae Health analysis.
    """

    def __init__(self, model_name: str = "yolov8n.pt"):
        self.model = None
        if _YOLO_AVAILABLE and YOLO is not None:
            try:
                # Load lightweight nano model; auto-downloads if not present
                self.model = YOLO(model_name)
            except Exception as e:
                print(f"[CVEngine] Warning: Could not initialize YOLO ({e}). Falling back to face cascade / mock.")
        
        # Algae health smoothed state (Exponential Moving Average)
        self.smoothed_health = 92.0
        
        # 220x220 ROI parameters
        self.roi_size = 220
        self.roi_margin = 20

    def calculate_co2(self, occupancy_count: int) -> int:
        """
        Derives simulated indoor CO2 based on human occupancy.
        Base: 400 ppm (ambient fresh air) + 150 ppm per person.
        """
        return 400 + (max(0, occupancy_count) * 150)

    def calculate_biofuel_rate(self, co2_ppm: int, health_pct: float) -> float:
        """
        Calculates simulated biofuel output (ml/hr).
        Higher CO2 and healthy algae accelerate biomass and lipid production.
        """
        rate = (co2_ppm / 400.0) * (health_pct / 100.0) * 15.0
        return round(rate, 1)

    def analyze_algae_health(self, roi_bgr: np.ndarray) -> Tuple[float, Dict[str, Any]]:
        """
        HSV color analysis inside the 220x220 ROI box.
        - Green Hue range: H: 35-85, S: 40-255, V: 40-255 (Healthy Algae)
        - Yellow Hue range: H: 15-34, S: 40-255, V: 40-255 (Dying/Stressed Algae)
        Returns calculated health percentage and pixel statistics.
        """
        if roi_bgr is None or roi_bgr.size == 0:
            return 90.0, {"green_pixels": 0, "yellow_pixels": 0, "total_pixels": 0}

        hsv = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2HSV)
        total_pixels = roi_bgr.shape[0] * roi_bgr.shape[1]

        # Green mask (Healthy Chlorella/Spirulina)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        green_count = int(cv2.countNonZero(green_mask))

        # Yellow mask (Degradation / Stress / Yellow paper/screen held up)
        lower_yellow = np.array([15, 40, 40])
        upper_yellow = np.array([34, 255, 255])
        yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
        yellow_count = int(cv2.countNonZero(yellow_mask))

        # Color fractions
        green_ratio = green_count / total_pixels
        yellow_ratio = yellow_count / total_pixels

        # Target health logic:
        # If user explicitly holds yellow object in the ROI box (yellow_ratio > 0.08)
        if yellow_ratio > 0.08:
            # Significant yellow detected -> crisis simulation
            target_health = max(10.0, 100.0 - (yellow_ratio * 150.0))
        elif green_ratio > 0.08:
            # Significant green detected -> thriving culture
            target_health = min(100.0, 80.0 + (green_ratio * 30.0))
        else:
            # Neutral / ambient background: baseline healthy living facade
            target_health = 92.0

        # Smooth changes using exponential moving average (alpha = 0.25)
        self.smoothed_health = (0.25 * target_health) + (0.75 * self.smoothed_health)
        self.smoothed_health = max(5.0, min(100.0, self.smoothed_health))

        stats = {
            "green_pixels": green_count,
            "yellow_pixels": yellow_count,
            "green_ratio": round(green_ratio, 3),
            "yellow_ratio": round(yellow_ratio, 3),
            "total_pixels": total_pixels
        }
        return round(self.smoothed_health, 1), stats

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Full processing pipeline on a single frame:
        1. Detect people using YOLOv8 -> Occupancy count & CO2 formula.
        2. Extract 220x220 ROI at top-right -> Algae health HSV analysis.
        3. Annotate frame with target box, bounding boxes, and HUD telemetry.
        """
        h, w, _ = frame.shape
        annotated = frame.copy()

        # 1. Occupancy Tracking via YOLOv8
        occupancy_count = 0
        boxes = []
        if self.model is not None:
            try:
                # Run inference on frame (verbose=False to keep logs clean)
                results: Any = self.model(frame, classes=[0], conf=0.40, verbose=False)
                for r in results:
                    boxes_attr = getattr(r, "boxes", None)
                    if boxes_attr is not None:
                        for box in boxes_attr:
                            cls_id = int(box.cls[0].item())
                            if cls_id == 0:  # Class 0 is Person in COCO
                                occupancy_count += 1
                                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                                boxes.append((x1, y1, x2, y2))
                                # Draw person bounding box
                                cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 210, 255), 2)
                                cv2.putText(
                                    annotated,
                                    "HUMAN OCCUPANT",
                                    (x1, max(20, y1 - 8)),
                                    cv2.FONT_HERSHEY_SIMPLEX,
                                    0.5,
                                    (0, 210, 255),
                                    2
                                )
            except Exception as e:
                print(f"[CVEngine] YOLO detection error: {e}")
        else:
            # Fallback simple simulation: 1 person baseline
            occupancy_count = 1

        co2_ppm = self.calculate_co2(occupancy_count)

        # 2. Ambient Light Estimation via grayscale mean intensity
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        mean_intensity = float(np.mean(gray))
        # Map 0-255 mean pixel brightness to 0-1000 simulated lux
        ambient_lux = int(mean_intensity * 3.9)

        # 3. Designated 220x220 ROI on top-right corner
        roi_x = max(0, w - self.roi_size - self.roi_margin)
        roi_y = self.roi_margin
        roi_w = min(self.roi_size, w - roi_x)
        roi_h = min(self.roi_size, h - roi_y)

        roi_crop = frame[roi_y:roi_y + roi_h, roi_x:roi_x + roi_w]
        health_pct, stats = self.analyze_algae_health(roi_crop)
        biofuel_rate = self.calculate_biofuel_rate(co2_ppm, health_pct)

        # Dynamic color for HUD based on health (BGR format)
        if health_pct >= 70:
            status_color = (46, 204, 113)  # Emerald Green
            status_text = "OPTIMAL"
        elif health_pct >= 45:
            status_color = (0, 200, 255)   # Amber / Caution
            status_text = "STRESSED"
        else:
            status_color = (30, 30, 240)   # Crimson / Crisis
            status_text = "CRITICAL DECAY"

        # Draw ROI Target Box (220x220)
        cv2.rectangle(
            annotated,
            (roi_x, roi_y),
            (roi_x + roi_w, roi_y + roi_h),
            status_color,
            3
        )
        # Corner reticles for high-tech HUD look
        c_len = 16
        for cx, cy in [(roi_x, roi_y), (roi_x + roi_w, roi_y), (roi_x, roi_y + roi_h), (roi_x + roi_w, roi_y + roi_h)]:
            dx = c_len if cx == roi_x else -c_len
            dy = c_len if cy == roi_y else -c_len
            cv2.line(annotated, (cx, cy), (cx + dx, cy), (255, 255, 255), 2)
            cv2.line(annotated, (cx, cy), (cx, cy + dy), (255, 255, 255), 2)

        # Label above ROI
        cv2.putText(
            annotated,
            "BIO-SCANNER (220x220)",
            (roi_x, max(15, roi_y - 8)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (255, 255, 255),
            1
        )
        # Algae Health percentage inside ROI
        cv2.putText(
            annotated,
            f"HEALTH: {health_pct:.0f}% ({status_text})",
            (roi_x + 8, roi_y + roi_h - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            status_color,
            2
        )

        # Top-Left Telemetry HUD Overlay
        overlay_h = 95
        overlay_w = 260
        sub_img = annotated[10:10 + overlay_h, 10:10 + overlay_w]
        black_rect = np.zeros(sub_img.shape, dtype=np.uint8)
        # Semi-transparent dark background
        res = cv2.addWeighted(sub_img, 0.35, black_rect, 0.65, 1.0)
        annotated[10:10 + overlay_h, 10:10 + overlay_w] = res
        cv2.rectangle(annotated, (10, 10), (10 + overlay_w, 10 + overlay_h), (100, 100, 100), 1)

        cv2.putText(annotated, "ALGOR-ALGAE TWIN cv2", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 170), 2)
        cv2.putText(annotated, f"OCCUPANTS: {occupancy_count} humans", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        cv2.putText(annotated, f"SIMULATED CO2: {co2_ppm} ppm", (20, 68), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 210, 255), 1)
        cv2.putText(annotated, f"AMBIENT LUX: {ambient_lux} lx", (20, 84), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 220, 100), 1)
        cv2.putText(annotated, f"BIOFUEL RATE: {biofuel_rate} ml/h", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 255, 100), 1)

        return {
            "occupancy": occupancy_count,
            "co2_ppm": co2_ppm,
            "ambient_lux": ambient_lux,
            "algae_health": health_pct,
            "biofuel_ml_hr": biofuel_rate,
            "status": status_text,
            "stats": stats,
            "annotated_frame": annotated
        }

    @staticmethod
    def frame_to_base64_jpeg(frame: np.ndarray, quality: int = 70) -> str:
        """
        Encodes an OpenCV BGR frame to a JPEG Base64 string for WebSocket transmission.
        """
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        success, buffer = cv2.imencode('.jpg', frame, encode_params)
        if not success:
            return ""
        b64_str = base64.b64encode(buffer.tobytes()).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_str}"
