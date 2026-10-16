# 🌿 Algor-Algae: Living Bioreactor Digital Twin

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&logo=statuspage)](https://github.com/bkshetty/Algor-Algae)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=for-the-badge&logo=apple)](https://github.com/bkshetty/Algor-Algae)
[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%203D%20%7C%20YOLOv8%20%7C%20Gemini%20AI-8A2BE2?style=for-the-badge)](https://github.com/bkshetty/Algor-Algae)

**Algor-Algae** is an enterprise-grade Living Digital Twin and autonomous Building Management System (BMS). It creates an engineered biological closed-loop between indoor human occupants and an exterior micro-algae photobioreactor facade (*Chlorella vulgaris*).

Using real-time Computer Vision (**YOLOv8** & **OpenCV Spectrophotometry**) and Generative AI (**Google Gemini 2.5/3.8 Flash**), the digital twin tracks human presence, derives respiratory $\text{CO}_2$ loads, modulates 3-way motorized HVAC dampers, and shields delicate microalgae cultures from lethal carbonic acid crashes.

---

## 📋 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Biological Redirection Logic](#-biological-redirection-logic)
3. [System Prerequisites](#-system-prerequisites)
4. [Quick Start Guide (Run in 2 Steps)](#-quick-start-guide)
5. [Detailed Installation Guide](#-detailed-installation-guide)
   - [Backend Setup (FastAPI & Computer Vision)](#1-backend-setup-fastapicv)
   - [Frontend Setup (React, Vite & Three.js 3D)](#2-frontend-setup-react--threejs)
6. [Interactive Application Pages](#-interactive-application-pages)
7. [Hackathon Demo & Evaluation Script](#-hackathon-demo-script)
8. [API & WebSocket Specifications](#-api--websocket-specifications)
9. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏛️ Architectural Overview

```
                                  +------------------------------------------+
                                  |            LIVING BUILDING               |
                                  +------------------------------------------+
                                                       |
                         +-----------------------------+-----------------------------+
                         |                                                           |
                         v                                                           v
            [Room Occupancy Tracking]                                   [Bioreactor Spectrophotometer]
            • YOLOv8 Person Detection (Class 0)                         • OpenCV HSV Color Segmentation
            • Real-time Occupancy Count (N)                             • Chlorophyll-a (520nm) vs Decay (620nm)
            • Math CO2 Spike: 400 + (N × 150) ppm                      • Biological Culture Health (0 - 100%)
                         |                                                           |
                         +-----------------------------+-----------------------------+
                                                       |
                                                       v
                                       [FastAPI WebSocket Stream (30 FPS)]
                                                       |
                                                       v
                                          [Gemini Autonomous BMS Agent]
                                        3-Way Motorized Damper Modulation
                                                       |
                         +-----------------------------+-----------------------------+
                         |                                                           |
                         v                                                           v
       [High Occupancy: N >= 4 Humans]                             [Low Occupancy: N < 4 Humans]
         Damper: 85% to Bioreactor Facade                            Damper: 85% Outside Exhaust
       Photosynthetic Fuel Conduit: ACTIVE                        Rooftop Scrubber Exhaust: ACTIVE
```

---

## ⚡ Biological Redirection Logic

The HVAC system enforces a biological cause-and-effect loop driven by real-time computer vision sensors:

| Operational State | Biological Health Trigger | Damper Angle | Damper Allocation | Airflow Routing & Visual Representation |
| :--- | :--- | :--- | :--- | :--- |
| **"Feed the Algae"**<br>*(Green / Healthy Culture)* | **Algae is Green**<br>*(Health $\ge$ 45%)* | $75^\circ$ (Downward) | **85% to Bioreactor**<br>15% Outdoor Standby | **Air Redirects to Bioreactor:** Human $\text{CO}_2$ exhaust routes directly into the algae bioreactor panels as photosynthetic fuel. 2D schematic renders glowing **HUMAN $\text{CO}_2$ RETURN AIR** entering the emerald green **PHOTOSYNTHETIC FUEL (85% FLOW)** conduit. 3D Twin bioreactor columns bubble actively with bio-illumination. |
| **"Acidification Bypass"**<br>*(Yellow / Unhealthy Culture)* | **Algae is Yellow / Unhealthy**<br>*(Health $<$ 45% or Yellow ROI)* | $12^\circ$ (Upward Bypass) | **85% Outside Exhaust**<br>15% Bio-Clamp | **Air Redirects to Exhausts:** Sick microalgae cannot process carbon efficiently; continuing high-$\text{CO}_2$ air creates lethal carbonic acid ($\text{pH} < 6.8$). Damper clamps to 15%, and 85% exhaust air is shunted away through the **ALGAE COLLAPSE BYPASS SHUNT** to the safe rooftop scrubber. |

---

## 💻 System Prerequisites

Make sure the following runtimes are installed on your workstation:

| Runtime / Tool | Minimum Version | Recommended Version | Check Command |
| :--- | :--- | :--- | :--- |
| **Python** | `3.10.x` | `3.11.x` or `3.12.x` | `python3 --version` |
| **Node.js** | `v18.0.0` | `v20.x.x` (LTS) | `node --version` |
| **npm** | `9.x.x` | `10.x.x` | `npm --version` |
| **Hardware** | Laptop Webcam | 720p/1080p Web Camera | *(Zero-lag camera reader built in)* |

> [!NOTE]
> **No Physical Camera Available?** If no webcam is attached or camera access is denied, Algor-Algae automatically switches to **High-Fidelity Synthetic Simulation Mode**, allowing full demo functionality with zero crashes.

---

## 🚀 Quick Start Guide

Open **two separate terminal tabs** in the project directory:

### Terminal 1: Backend (FastAPI & CV Engine)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend runs on: `http://localhost:8000` (API & WebSocket)*

### Terminal 2: Frontend (React & Three.js Twin)
```bash
cd frontend
npm install
npm run dev
```
*Open your browser to: `http://localhost:5173`*

---

## 🛠️ Detailed Installation Guide

### 1. Backend Setup (FastAPI/CV)

1. **Navigate to the backend directory:**
   ```bash
   cd /path/to/Algor-Algae/backend
   ```

2. **Create and activate a dedicated Python virtual environment:**
   - **macOS / Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
   - **Windows (Command Prompt / PowerShell):**
     ```cmd
     python -m venv .venv
     .venv\Scripts\activate
     ```

3. **Install all required dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   **Core Dependencies Installed:**
   - `fastapi` & `uvicorn[standard]` — High-throughput async web server.
   - `websockets` — 30 FPS binary and telemetry transport.
   - `opencv-python` — Color segmentation, spectrophotometer ROI analysis, and frame encoding.
   - `ultralytics` — YOLOv8n deep learning human detection.
   - `google-genai` — Official Google GenAI SDK for Gemini 2.5 / 3.8 Flash.
   - `numpy` & `pydantic` — Numerical operations and schema validations.
   - `python-dotenv` — Environment variable management.

4. **Configure your Environment Variables:**
   Copy the `.env.example` file to create `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=8000
   HOST=0.0.0.0
   ```
   *(Get an API key for free at [Google AI Studio](https://aistudio.google.com/)).*

5. **Start the Backend Server:**
   ```bash
   python main.py
   # Or alternatively:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   **Expected Output on Startup:**
   ```
   [CV Worker] Attempting to connect to camera 0 with Zero-Lag Stream...
   [CV Worker] Physical webcam connected successfully with Zero-Lag Reader!
   INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
   ```

---

### 2. Frontend Setup (React & Three.js)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd /path/to/Algor-Algae/frontend
   ```

2. **Install Node packages:**
   ```bash
   npm install
   ```

   **Key Libraries Installed:**
   - `react` & `react-dom` (v18.3.1)
   - `three` & `@react-three/fiber` & `@react-three/drei` — 3D WebGL rendering engine.
   - `zustand` — State store for zero-latency telemetry synchronization.
   - `lucide-react` — Icon design system.
   - `tailwindcss` & `postcss` — Apple Human Interface design styling.

3. **Launch the development server:**
   ```bash
   npm run dev
   ```

4. **Verify the Production Build (Optional):**
   ```bash
   npm run build
   ```
   *Compiles clean distribution chunks in `frontend/dist` without errors.*

---

## 🖥️ Interactive Application Pages

The frontend application includes 5 specialized pages accessible from the top navigation bar:

### 1. 🎴 Algor-Algae Hero & Portal (`/` - Overview)
- **Record-Label Split Hero Entrance:** Smooth interactive sliding portals uncovering the living bioreactor facade.
- **Real-Time Telemetry Badges:** Live occupancy counter, derived atmospheric $\text{CO}_2$, and dynamic damper position indicator.
- **Operational State Deck:** Interactive cards demonstrating Baseline, "Feed the Algae", and "Acidification Bypass" modes.

### 2. 💨 2D HVAC System Layout & Redirection Schematic
- **Complete Mechanical Engineering Schematic:** Displays outdoor intake, HEPA filtration, supply fan, multi-room distribution (Rooms 1, 2, 3), horizontal glowing orange $\text{CO}_2$ return manifold, $\text{CO}_2$ sensor, 3-way motorized AI damper, upward rooftop scrubber conduit, and downward green photosynthetic fuel branch into the algae column with live flow meter ($L/\text{min}$).
- **Automatic Cause-and-Effect Actuation:**
  - When occupants are $\ge 4$: air routes into the green facade fuel conduit.
  - When occupants are $< 4$: air redirects upward to the rooftop scrubber.

### 3. 👥 Human Detection & Occupancy Tracking
- **YOLOv8 Neural Network Stream:** Real-time human bounding box overlay with confidence scores.
- **Metabolic Carbon Math:** Live calculation showing $+150\text{ ppm}$ breath per occupant and daily metabolic load ($\text{kg }\text{CO}_2/\text{day}$).
- **Side-by-Side Verification:** Live vision stream alongside the synchronized 2D HVAC schematic.

### 4. 🧫 Algae Health & OpenCV Spectrophotometer
- **220x220 Spectrophotometer ROI:** Analyzes Chlorophyll-a absorption peak ($520\text{nm}$) vs. Carotenoid stress ($580\text{nm}$) and Chlorosis decay ($620\text{nm}$).
- **Biochemical Readouts:** Biomass density ($g/L$), biofuel production rate ($ml/\text{hr}$), and mean HSV metrics.
- **Manual Simulation Controls:** Allows triggering yellow degradation paper simulation or healthy green culture with a single click.

### 5. 🏢 Interactive 3D Living Digital Twin
- **Neoclassical Architectural Facade:** 3D building model with four vertical cylindrical photobioreactor columns embedded in the corner facades.
- **Live Physics Simulation:** Bubble ascent speed and bio-emissive pulse intensities dynamically accelerate based on HVAC damper percentage and airflow velocity.
- **Atmospheric Plume:** Renders billing outdoor exhaust particles during rooftop bypass / low occupancy states.
- **Camera Presets:** One-click navigation for Street Level, 45° Hero Angle, Bioreactor Close-up, and Rooftop Scrubber Overview.

### 6. 🤖 Gemini Autonomous BMS Agent (AI Diagnostic Modal)
- Click **"Run AI Diagnostics"** from any page to invoke the Gemini 2.5/3.8 Flash agent.
- Returns structured JSON actuation commands:
  - Damper servo modulation (`BMS_Bypass_Damper`)
  - Nutrient dosing (`dose_nitrogen`, `dose_iron`)
  - pH buffer neutralization (`dose_bicarbonate_buffer`)
  - Sparging rate optimization
- Generates a **Carbon Offset ESG Certification** with estimated daily sequestered $\text{CO}_2$.

---

## 🎬 Hackathon Demo Script

Follow this 4-step sequence to demonstrate the digital twin to judges:

### Step 1: Low Occupancy Baseline ($< 4$ Occupants)
- Stand in front of the camera alone ($1\text{ person}$).
- **Observe:** Occupancy reads $1$, $\text{CO}_2$ reads $550\text{ ppm}$.
- **HVAC Action:** The 3-way damper redirects air to the **SAFE ROOFTOP SCRUBBER** (85% outside vent). The downward bioreactor conduit is throttled to 15% idle standby.

### Step 2: High Occupancy Spike ($\ge 4$ Occupants)
- Have 3 teammates step into the camera frame or raise photos of faces so YOLO detects **4 or more occupants**.
- **Observe:** Occupancy updates to $4+$, $\text{CO}_2$ spikes to $1000+\text{ ppm}$.
- **HVAC Action:** The 3-way damper automatically actuates downward to $75^\circ$.
- **Visual:** The orange **HUMAN $\text{CO}_2$ RETURN AIR** pipeline routes directly into the glowing green **PHOTOSYNTHETIC FUEL (85% FLOW)** conduit, feeding the bioreactors!

### Step 3: Biological Acidification Crisis
- Hold a yellow piece of paper, post-it note, or yellow screen image into the top-right **OpenCV Spectrophotometer ROI box** (or click the **"Simulate Yellow Algae Crisis"** button).
- **Observe:** Algae health drops below $45\%$.
- **HVAC Action:** Emergency Bypass triggers immediately! The damper clamps down to $15\%$ to protect the biology, and the crimson & amber **ALGAE COLLAPSE BYPASS SHUNT** activates, routing exhaust to the safe rooftop scrubber.

### Step 4: Autonomous AI Resolution
- Click the **"Run AI Diagnostics"** button.
- **Observe:** Google Gemini evaluates the biological telemetry, generates a diagnosis of carbonic acid shock, activates nitrogen dosing, resets the dampers, and produces a real-time ESG Carbon Credit Certificate.

---

## 📡 API & WebSocket Specifications

### WebSocket Stream
- **URL:** `ws://localhost:8000/ws`
- **Frame Rate:** 30 FPS
- **Payload Schema:**
  ```json
  {
    "occupancy": 5,
    "co2_ppm": 1150,
    "ambient_lux": 420,
    "algae_health": 92.0,
    "biofuel_ml_hr": 24.5,
    "status": "OPTIMAL",
    "webcam_frame_base64": "data:image/jpeg;base64,...",
    "webcam_frame_human_base64": "data:image/jpeg;base64,...",
    "webcam_frame_algae_base64": "data:image/jpeg;base64,...",
    "hsv_stats": {
      "green_pixels": 4200,
      "yellow_pixels": 120,
      "green_ratio": 0.087,
      "yellow_ratio": 0.002,
      "mean_h": 48.2,
      "mean_s": 142.1,
      "mean_v": 180.5,
      "biomass_g_l": 2.06
    },
    "timestamp": 1729064000.12,
    "is_synthetic": false
  }
  ```

### HTTP Endpoints
- `GET /api/status` — Returns current snapshot of digital twin telemetry.
- `POST /api/diagnostics` — Triggers Gemini Autonomous BMS AI diagnosis.
- `POST /api/simulation` — Sets simulation override parameters for judge testing.
- `DELETE /api/simulation` — Disables simulation override and resumes live webcam tracking.

---

## ❓ Troubleshooting & FAQs

### 1. Webcam access error or black frame on macOS
- Grant camera permissions to your terminal:  
  **System Settings $\to$ Privacy & Security $\to$ Camera $\to$ Enable Terminal / iTerm / VS Code.**
- Ensure no other applications (Zoom, Teams, Photo Booth, FaceTime) have locked the camera device (`/dev/video0`).

### 2. Port 8000 or 5173 is already in use
- Terminate any orphaned processes:
  - **macOS / Linux:**
    ```bash
    lsof -ti :8000 | xargs kill -9
    lsof -ti :5173 | xargs kill -9
    ```
  - **Windows:**
    ```cmd
    netstat -ano | findstr :8000
    taskkill /PID <PID> /F
    ```

### 3. YOLOv8 weights auto-download
- On first startup, `ultralytics` will download the lightweight `yolov8n.pt` model (~6 MB) automatically into the `backend/` directory. Ensure your computer has active internet access during initial launch.

### 4. Gemini API Key missing or quota exceeded
- If no Gemini API key is provided, the backend seamlessly falls back to local heuristic biological diagnostic generation without throwing unhandled exceptions.

---

## 📄 License
Algor-Algae is licensed under the **MIT License**.
Built with precision for next-generation bio-intelligent architecture.
