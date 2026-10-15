# 🌿 Algor-Algae: The Living Bioreactor Digital Twin

![Hackathon Status](https://img.shields.io/badge/Status-Hackathon_MVP-success)
![Platform](https://img.shields.io/badge/Platform-macOS_%7C_Windows-blue)
![Stack](https://img.shields.io/badge/Stack-React_3D_%7C_Python_%7C_Gemini_AI-violet)

**Algor-Algae** is a software-based Digital Twin that simulates a futuristic, closed-loop green building. It models a symbiotic relationship between indoor human occupants and an exterior "living" facade made of micro-algae bioreactors. The system uses Computer Vision to simulate IoT sensors and Generative AI to autonomously manage the biological health of the building.

---

## 🌎 The Problem & Solution

**The Problem:** Modern "green" architecture focuses on energy *reduction*, but buildings still vent massive amounts of human-exhaled Carbon Dioxide ($CO_2$) into the atmosphere. While algae-filled glass panels can absorb this $CO_2$ and generate biofuel, algae is biologically fragile. If temperature or nutrients fluctuate, the algae dies, and the building fails.

**The Solution:** Algor-Algae treats human $CO_2$ as fuel, not waste. We use **Computer Vision** to track indoor occupancy and redirect $CO_2$ to the exterior living panels. We use an autonomous **Generative AI Agent** as a continuous biological manager. When the system detects the algae failing (turning yellow), the AI instantly triggers nutrient protocols to save it, perfectly balancing the human environment with the biological facade.

---

## 🏗️ Architecture (Hackathon Software Simulation)

For this prototype, physical hardware is simulated using a laptop webcam pipeline:

1. **Vision as a Sensor:** 
   - **YOLOv8** counts humans in the room to mathematically simulate indoor $CO_2$ spikes.
   - **OpenCV** analyzes a target box on the webcam, reading green vs. yellow pixels to calculate real-time Algae Health.
2. **Real-Time Telemetry:** A **FastAPI WebSocket** server streams this data at 10-15 FPS.
3. **3D Digital Twin:** A **React Three Fiber** interface receives the data. The 3D building's glass facade dynamically shifts colors (Emerald Green to Yellow) based on biological health.
4. **Autonomous AI:** **Gemini 2.5 Flash** acts as the Building Management System (BMS). When health drops, it analyzes the JSON state and issues automated commands to balance the ecosystem.

---

## 💻 Tech Stack

* **Backend:** Python 3.10+, FastAPI, WebSockets
* **Computer Vision:** OpenCV, Ultralytics (YOLOv8n)
* **AI / ML:** Google GenAI SDK (Gemini 2.5 Flash)
* **Frontend:** React.js, Vite, Tailwind CSS
* **3D Rendering:** Three.js, React Three Fiber (`@react-three/fiber`), Drei

---

## 🚀 Local Setup & Installation

You will need to run two separate terminal instances to start the project. 

### Prerequisites
* Python 3.10+
* Node.js v18+
* A Gemini API Key from Google AI Studio.

### 1. Backend (Python/FastAPI) Setup

Open your first terminal and navigate to the `backend` folder:

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
# On Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API Key as an environment variable
export GEMINI_API_KEY="your_api_key_here"  # Mac/Linux
set GEMINI_API_KEY="your_api_key_here"     # Windows

# Start the CV server (Ensure your webcam is not blocked by other apps)
uvicorn main:app --reload
```

### 2. Frontend (React/Three.js) Setup

Open a second terminal and navigate to the `frontend` folder:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 🎥 Hackathon Demo Flow

1. **Baseline:** Stand alone in the webcam frame. The UI shows low $CO_2$, and the 3D building is vibrant green.
2. **Occupancy Spike:** Have teammates enter the webcam frame. YOLO counts them, simulated $CO_2$ spikes, and the HVAC simulation redirects air to the panels.
3. **Biological Crisis:** Hold a yellow object/phone screen into the "Algae Scanner" box on the webcam feed. OpenCV detects the failure, health drops, and the 3D building instantly turns sickly yellow.
4. **AI Resolution:** Click the **"Run AI Diagnostics"** button. Gemini reads the crisis state, issues JSON commands to flush nutrients, and generates a Carbon Offset ESG report.

---

## 🔮 Future Scope
Transitioning from a hackathon MVP to a real-world deployment would involve replacing the webcam simulation with physical IoT infrastructure:
* Honeywell physical $CO_2$ probes and PIR sensors.
* Submerged spectrophotometers in actual algae bioreactor tanks.
* PLC (Programmable Logic Controllers) integrated via MQTT to physically open valves based on the AI's commands.
