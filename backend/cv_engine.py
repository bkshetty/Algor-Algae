import os
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
                base_dir = os.path.dirname(os.path.abspath(__file__))
                resolved_path = os.path.join(base_dir, model_name)
                if not os.path.exists(resolved_path):
                    resolved_path = model_name
                # Load lightweight nano model
                self.model = YOLO(resolved_path)
            except Exception as e:
                print(f"[CVEngine] Warning: Could not initialize YOLO ({e}).")
        
        # Algae health smoothed state (Exponential Moving Average)
        self.smoothed_health = 92.0
        
        # 220x220 ROI parameters
        self.roi_size = 220
        self.roi_margin = 20

        # Performance optimizations: cadence caching for high FPS
        self.frame_counter = 0
        self.cached_occupancy = 1
        self.cached_boxes = []

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
            return 90.0, {
                "green_pixels": 0, "yellow_pixels": 0, "total_pixels": 0,
                "green_ratio": 0.0, "yellow_ratio": 0.0,
                "mean_h": 60.0, "mean_s": 120.0, "mean_v": 150.0,
                "biomass_g_l": 1.6
            }

        hsv = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2HSV)
        total_pixels = roi_bgr.shape[0] * roi_bgr.shape[1]

        # Calculate mean HSV across the ROI
        mean_vals = cv2.mean(hsv)
        mean_h = round(float(mean_vals[0]), 1)
        mean_s = round(float(mean_vals[1]), 1)
        mean_v = round(float(mean_vals[2]), 1)

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

        # Estimated biomass density (g/L) based on health and chlorophyll density
        biomass_g_l = round(0.45 + (self.smoothed_health / 100.0) * 1.75, 2)

        stats = {
            "green_pixels": green_count,
            "yellow_pixels": yellow_count,
            "green_ratio": round(green_ratio, 3),
            "yellow_ratio": round(yellow_ratio, 3),
            "mean_h": mean_h,
            "mean_s": mean_s,
            "mean_v": mean_v,
            "biomass_g_l": biomass_g_l,
            "total_pixels": total_pixels
        }
        return round(self.smoothed_health, 1), stats

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Full processing pipeline producing:
        1. annotated_human: YOLOv8 person tracking, bounding boxes, CO2 math HUD.
        2. annotated_algae: PURE OpenCV HSV color segmentation on 220x220 ROI.
           ZERO YOLO human detection or person bounding boxes.
        3. annotated_frame: Composite overview feed.
        """
        h, w, _ = frame.shape
        annotated_human = frame.copy()
        annotated_algae = frame.copy()

        # ---------------------------------------------------------------------
        # 1. Occupancy Tracking via YOLOv8 (Strictly for Human Detection Page)
        # ---------------------------------------------------------------------
        self.frame_counter += 1
        if self.model is not None:
            # Run inference every 2 frames, or every frame if no occupants currently detected
            if self.frame_counter % 2 == 0 or self.cached_occupancy == 0:
                try:
                    # Run inference on frame with conf=0.25 (optimal for seated/indoor humans)
                    results: Any = self.model(frame, classes=[0], conf=0.25, verbose=False)
                    new_boxes = []
                    new_count = 0
                    for r in results:
                        boxes_attr = getattr(r, "boxes", None)
                        if boxes_attr is not None:
                            for box in boxes_attr:
                                cls_id = int(box.cls[0].item())
                                if cls_id == 0:  # Class 0 is Person in COCO
                                    new_count += 1
                                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                                    new_boxes.append((x1, y1, x2, y2))
                    self.cached_occupancy = new_count
                    self.cached_boxes = new_boxes
                except Exception as e:
                    print(f"[CVEngine] YOLO detection error: {e}")

            occupancy_count = self.cached_occupancy
            for (x1, y1, x2, y2) in self.cached_boxes:
                # Draw person bounding box ONLY on human feed
                cv2.rectangle(annotated_human, (x1, y1), (x2, y2), (0, 210, 255), 2)
                cv2.putText(
                    annotated_human,
                    "HUMAN OCCUPANT",
                    (x1, max(20, y1 - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 210, 255),
                    2
                )
        else:
            # Fallback simple simulation: 1 person baseline
            occupancy_count = 1

        co2_ppm = self.calculate_co2(occupancy_count)

        # Ambient Light Estimation via grayscale mean intensity
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        mean_intensity = float(np.mean(gray))
        ambient_lux = int(mean_intensity * 3.9)

        # ---------------------------------------------------------------------
        # 2. Designated 220x220 ROI on top-right: PURE OpenCV Color Analysis
        # ---------------------------------------------------------------------
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
            pigment_text = "CHLOROPHYLL-a (520nm)"
        elif health_pct >= 45:
            status_color = (0, 200, 255)   # Amber / Caution
            status_text = "STRESSED"
            pigment_text = "CAROTENOID STRESS (580nm)"
        else:
            status_color = (30, 30, 240)   # Crimson / Crisis
            status_text = "CRITICAL DECAY"
            pigment_text = "CHLOROSIS DECAY (620nm)"

        # ---------------------------------------------------------------------
        # 3. Build annotated_algae (ZERO YOLO human boxes - Pure OpenCV Color)
        # ---------------------------------------------------------------------
        # Draw 220x220 Spectrophotometer ROI Box
        cv2.rectangle(
            annotated_algae,
            (roi_x, roi_y),
            (roi_x + roi_w, roi_y + roi_h),
            status_color,
            2
        )
        # Tech reticles on corners
        c_len = 18
        for cx, cy in [(roi_x, roi_y), (roi_x + roi_w, roi_y), (roi_x, roi_y + roi_h), (roi_x + roi_w, roi_y + roi_h)]:
            dx = c_len if cx == roi_x else -c_len
            dy = c_len if cy == roi_y else -c_len
            cv2.line(annotated_algae, (cx, cy), (cx + dx, cy), (255, 255, 255), 2)
            cv2.line(annotated_algae, (cx, cy), (cx, cy + dy), (255, 255, 255), 2)

        # Center crosshair in ROI
        mid_x = roi_x + roi_w // 2
        mid_y = roi_y + roi_h // 2
        cv2.line(annotated_algae, (mid_x - 10, mid_y), (mid_x + 10, mid_y), (255, 255, 255), 1)
        cv2.line(annotated_algae, (mid_x, mid_y - 10), (mid_x, mid_y + 10), (255, 255, 255), 1)

        # Label above ROI
        cv2.putText(
            annotated_algae,
            "OPENCV SPECTROPHOTOMETER (220x220)",
            (roi_x, max(15, roi_y - 8)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            (255, 255, 255),
            1
        )
        # Algae Health percentage inside ROI
        cv2.putText(
            annotated_algae,
            f"HEALTH: {health_pct:.0f}% ({status_text})",
            (roi_x + 8, roi_y + roi_h - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            status_color,
            2
        )

        # Real-time Color Spectrum mini bar under ROI
        bar_y = roi_y + roi_h + 10
        bar_w = roi_w
        bar_h = 10
        if bar_y + bar_h < h:
            cv2.rectangle(annotated_algae, (roi_x, bar_y), (roi_x + bar_w, bar_y + bar_h), (30, 30, 30), -1)
            g_w = int(bar_w * min(1.0, stats["green_ratio"] * 3.0))
            y_w = int(bar_w * min(1.0, stats["yellow_ratio"] * 3.0))
            if g_w > 0:
                cv2.rectangle(annotated_algae, (roi_x, bar_y), (roi_x + g_w, bar_y + bar_h), (46, 204, 113), -1)
            if y_w > 0:
                cv2.rectangle(annotated_algae, (roi_x + bar_w - y_w, bar_y), (roi_x + bar_w, bar_y + bar_h), (0, 215, 255), -1)
            cv2.putText(
                annotated_algae,
                f"HSV: H={stats['mean_h']:.0f} S={stats['mean_s']:.0f} V={stats['mean_v']:.0f}",
                (roi_x, bar_y + bar_h + 14),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.38,
                (200, 220, 240),
                1
            )

        # Top-Left Telemetry HUD for Algae Feed (Pure Algae / Spectrophotometer focus)
        algae_hud_h = 105
        algae_hud_w = 280
        sub_algae = annotated_algae[10:10 + algae_hud_h, 10:10 + algae_hud_w]
        black_rect_a = np.zeros(sub_algae.shape, dtype=np.uint8)
        res_a = cv2.addWeighted(sub_algae, 0.30, black_rect_a, 0.70, 1.0)
        annotated_algae[10:10 + algae_hud_h, 10:10 + algae_hud_w] = res_a
        cv2.rectangle(annotated_algae, (10, 10), (10 + algae_hud_w, 10 + algae_hud_h), (46, 204, 113), 1)

        cv2.putText(annotated_algae, "OPENCV BIO-SPECTROPHOTOMETER", (20, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (0, 255, 170), 2)
        cv2.putText(annotated_algae, f"HEALTH: {health_pct:.1f}% ({status_text})", (20, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.44, status_color, 2)
        cv2.putText(annotated_algae, f"PIGMENT: {pigment_text}", (20, 66), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1)
        cv2.putText(annotated_algae, f"BIOMASS DENSITY: {stats['biomass_g_l']:.2f} g/L", (20, 84), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (200, 255, 100), 1)
        cv2.putText(annotated_algae, "MODE: COLOR SEGMENTATION (YOLO OFF)", (20, 102), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (255, 200, 100), 1)

        # ---------------------------------------------------------------------
        # 4. Build annotated_human HUD (Occupancy & CO2 focus)
        # ---------------------------------------------------------------------
        human_hud_h = 95
        human_hud_w = 270
        sub_human = annotated_human[10:10 + human_hud_h, 10:10 + human_hud_w]
        black_rect_h = np.zeros(sub_human.shape, dtype=np.uint8)
        res_h = cv2.addWeighted(sub_human, 0.35, black_rect_h, 0.65, 1.0)
        annotated_human[10:10 + human_hud_h, 10:10 + human_hud_w] = res_h
        cv2.rectangle(annotated_human, (10, 10), (10 + human_hud_w, 10 + human_hud_h), (0, 210, 255), 1)

        cv2.putText(annotated_human, "YOLOv8 OCCUPANCY TRACKER", (20, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (0, 210, 255), 2)
        cv2.putText(annotated_human, f"OCCUPANTS: {occupancy_count} humans", (20, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (255, 255, 255), 1)
        cv2.putText(annotated_human, f"DERIVED CO2: {co2_ppm} ppm", (20, 66), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (0, 255, 170), 1)
        cv2.putText(annotated_human, f"METABOLIC LOAD: +{occupancy_count * 150} ppm", (20, 84), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (255, 220, 100), 1)
        cv2.putText(annotated_human, f"HVAC DEMAND: {occupancy_count * 4.2:.1f} L/min", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (180, 220, 255), 1)

        # ---------------------------------------------------------------------
        # 5. Composite annotated_frame (General Overview)
        # ---------------------------------------------------------------------
        annotated_frame = annotated_human.copy()
        # Draw ROI Box on overview as well
        cv2.rectangle(annotated_frame, (roi_x, roi_y), (roi_x + roi_w, roi_y + roi_h), status_color, 2)
        cv2.putText(annotated_frame, f"ALGAE: {health_pct:.0f}%", (roi_x + 5, roi_y + roi_h - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, status_color, 2)

        return {
            "occupancy": occupancy_count,
            "co2_ppm": co2_ppm,
            "ambient_lux": ambient_lux,
            "algae_health": health_pct,
            "biofuel_ml_hr": biofuel_rate,
            "status": status_text,
            "stats": stats,
            "annotated_frame": annotated_frame,
            "annotated_human": annotated_human,
            "annotated_algae": annotated_algae
        }

    @staticmethod
    def frame_to_base64_jpeg(frame: np.ndarray, quality: int = 55) -> str:
        """
        Encodes an OpenCV BGR frame to a JPEG Base64 string for WebSocket transmission.
        Quality 55 provides high visual clarity with 50% smaller payload for low-latency streaming.
        """
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        success, buffer = cv2.imencode('.jpg', frame, encode_params)
        if not success:
            return ""
        b64_str = base64.b64encode(buffer.tobytes()).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_str}"
