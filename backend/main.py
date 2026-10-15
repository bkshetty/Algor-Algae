import asyncio
import threading
import time
import cv2  # type: ignore
import numpy as np  # type: ignore
from fastapi import FastAPI, WebSocket, WebSocketDisconnect  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore
from typing import Dict, Any, Optional

from cv_engine import CVEngine
from ai_agent import BioFacadeAIAgent

app = FastAPI(title="Algor-Algae Digital Twin Backend")

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cv_engine = CVEngine()
ai_agent = BioFacadeAIAgent()

# Shared state between background CV capture thread and async WebSocket
state_lock = threading.Lock()
latest_state: Dict[str, Any] = {
    "occupancy": 1,
    "co2_ppm": 550,
    "ambient_lux": 420,
    "algae_health": 92.0,
    "biofuel_ml_hr": 19.0,
    "status": "OPTIMAL",
    "webcam_frame_base64": "",
    "timestamp": time.time(),
    "is_synthetic": False
}

# Optional manual simulation override for testing or emergency backup
simulation_override = {
    "active": False,
    "occupancy": 2,
    "simulate_yellow_crisis": False
}

is_running = True


def generate_synthetic_frame(occupancy: int, is_crisis: bool) -> np.ndarray:
    """
    Generates a high-tech synthetic camera frame if physical webcam is inaccessible.
    Guarantees cross-platform hackathon execution without camera hardware.
    """
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:] = (20, 24, 28)

    # Grid background lines
    for x in range(0, 640, 40):
        cv2.line(frame, (x, 0), (x, 480), (35, 40, 45), 1)
    for y in range(0, 480, 40):
        cv2.line(frame, (0, y), (640, y), (35, 40, 45), 1)

    # Draw simulated human silhouettes
    for i in range(occupancy):
        center_x = 120 + (i * 140)
        # Head
        cv2.circle(frame, (center_x, 220), 40, (70, 80, 95), -1)
        # Torso
        pts = np.array([[center_x - 55, 440], [center_x + 55, 440], [center_x + 35, 270], [center_x - 35, 270]])
        cv2.fillPoly(frame, [pts], (70, 80, 95))
        # Label
        cv2.putText(frame, f"Person #{i+1}", (center_x - 35, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160, 180, 200), 1)

    # Draw test card in ROI box (top right: x=400, y=20, w=220, h=220)
    card_x, card_y, card_w, card_h = 420, 40, 180, 180
    if is_crisis:
        # Yellow stress paper/culture
        cv2.rectangle(frame, (card_x, card_y), (card_x + card_w, card_y + card_h), (25, 215, 245), -1)
        cv2.putText(frame, "YELLOW SAMPLE", (card_x + 10, card_y + 95), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
    else:
        # Green healthy algae culture
        cv2.rectangle(frame, (card_x, card_y), (card_x + card_w, card_y + card_h), (40, 180, 45), -1)
        cv2.putText(frame, "CHLORELLA CULTURE", (card_x + 10, card_y + 95), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 2)

    return frame


def cv_capture_worker():
    """
    Dedicated background worker thread for OpenCV video capture and processing.
    Ensures camera operations never block the FastAPI asyncio event loop.
    """
    global latest_state, is_running

    print("[CV Worker] Attempting to connect to camera 0...")
    cap = cv2.VideoCapture(0)

    # Some platforms work better with alternate backends or indices
    if not cap.isOpened():
        print("[CV Worker] Camera 0 could not be opened. Running in synthetic simulation mode.")
        use_camera = False
    else:
        # Request standard resolution and frame rate
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        use_camera = True
        print("[CV Worker] Physical webcam connected successfully!")

    while is_running:
        try:
            frame = None
            is_synthetic = False

            if use_camera and not simulation_override["active"]:
                ret, cam_frame = cap.read()
                if ret and cam_frame is not None:
                    # Mirror webcam for natural mirror feedback
                    frame = cv2.flip(cam_frame, 1)
                else:
                    use_camera = False
                    print("[CV Worker] Camera read dropped. Switching to synthetic mode.")

            if frame is None:
                is_synthetic = True
                occ = simulation_override["occupancy"] if simulation_override["active"] else 1
                crisis = simulation_override["simulate_yellow_crisis"] if simulation_override["active"] else False
                frame = generate_synthetic_frame(occupancy=occ, is_crisis=crisis)

            # Process frame through YOLO and HSV ROI
            processed = cv_engine.process_frame(frame)
            b64_frame = cv_engine.frame_to_base64_jpeg(processed["annotated_frame"], quality=65)

            # Update shared state safely
            with state_lock:
                latest_state["occupancy"] = processed["occupancy"]
                latest_state["co2_ppm"] = processed["co2_ppm"]
                latest_state["ambient_lux"] = processed.get("ambient_lux", 420)
                latest_state["algae_health"] = processed["algae_health"]
                latest_state["biofuel_ml_hr"] = processed["biofuel_ml_hr"]
                latest_state["status"] = processed["status"]
                latest_state["webcam_frame_base64"] = b64_frame
                latest_state["timestamp"] = time.time()
                latest_state["is_synthetic"] = is_synthetic

            # Throttle background capture to ~20-25 FPS to conserve CPU
            time.sleep(0.04)

        except Exception as e:
            print(f"[CV Worker] Frame processing exception: {e}")
            time.sleep(0.1)

    if cap.isOpened():
        cap.release()
    print("[CV Worker] Stopped cleanly.")


# Start background capture thread at server startup
capture_thread = threading.Thread(target=cv_capture_worker, daemon=True)
capture_thread.start()


@app.get("/")
def read_root():
    return {
        "project": "Algor-Algae Digital Twin",
        "status": "ONLINE",
        "websocket_endpoint": "ws://localhost:8000/ws"
    }


@app.get("/api/status")
def get_status():
    """Returns current live sensor and building telemetry."""
    with state_lock:
        state_copy = dict(latest_state)
    # Exclude heavy base64 image from quick polling status
    state_copy.pop("webcam_frame_base64", None)
    return state_copy


class DiagnosticsRequest(BaseModel):
    override_state: Optional[Dict[str, Any]] = None


@app.post("/api/diagnostics")
async def trigger_diagnostics(req: Optional[DiagnosticsRequest] = None):
    """
    Triggers the Gemini 2.5 Flash Bio-Facade AI Agent with live telemetry.
    Returns structured biological diagnostics, BMS actions, and ESG carbon report.
    """
    with state_lock:
        current_state = {
            "occupancy": latest_state["occupancy"],
            "co2_ppm": latest_state["co2_ppm"],
            "algae_health": latest_state["algae_health"],
            "biofuel_ml_hr": latest_state["biofuel_ml_hr"],
            "status": latest_state["status"]
        }

    if req and req.override_state:
        current_state.update(req.override_state)

    result = await ai_agent.run_diagnostics(current_state)
    return {
        "timestamp": time.time(),
        "input_state": current_state,
        "diagnostics": result
    }


class SimulationOverrideRequest(BaseModel):
    active: bool
    occupancy: Optional[int] = 2
    simulate_yellow_crisis: Optional[bool] = False


@app.post("/api/simulate")
def set_simulation(req: SimulationOverrideRequest):
    """
    Enables manual simulation override for testing scenarios without physical objects.
    """
    global simulation_override
    simulation_override["active"] = req.active
    if req.occupancy is not None:
        simulation_override["occupancy"] = max(0, min(10, req.occupancy))
    if req.simulate_yellow_crisis is not None:
        simulation_override["simulate_yellow_crisis"] = req.simulate_yellow_crisis

    return {"status": "SUCCESS", "override": simulation_override}


@app.websocket("/ws")
async def websocket_telemetry_stream(websocket: WebSocket):
    """
    High-frequency WebSocket stream (10-15 FPS) delivering:
    - occupancy
    - co2_ppm
    - algae_health
    - biofuel_ml_hr
    - status
    - webcam_frame_base64
    """
    await websocket.accept()
    print("[WebSocket] Client connected to live telemetry stream.")
    try:
        while True:
            with state_lock:
                payload = {
                    "occupancy": latest_state["occupancy"],
                    "co2_ppm": latest_state["co2_ppm"],
                    "ambient_lux": latest_state.get("ambient_lux", 420),
                    "algae_health": latest_state["algae_health"],
                    "biofuel_ml_hr": latest_state["biofuel_ml_hr"],
                    "status": latest_state["status"],
                    "webcam_frame_base64": latest_state["webcam_frame_base64"],
                    "timestamp": latest_state["timestamp"],
                    "is_synthetic": latest_state["is_synthetic"]
                }
            await websocket.send_json(payload)
            # ~12 FPS stream rate
            await asyncio.sleep(0.08)
    except WebSocketDisconnect:
        print("[WebSocket] Client disconnected.")
    except Exception as e:
        print(f"[WebSocket] Stream error: {e}")


@app.on_event("shutdown")
def shutdown_event():
    global is_running
    is_running = False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
