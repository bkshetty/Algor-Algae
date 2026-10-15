import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai  # type: ignore
    from google.genai import types  # type: ignore
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False
    genai = None  # type: ignore
    types = None  # type: ignore



class SystemAction(BaseModel):
    action: str = Field(description="Command identifier like redirect_hvac, dose_nitrogen, adjust_sparging_flow")
    target: str = Field(description="Subsystem target: Facade_Loop_A, HVAC_Exhaust, Nutrient_Injector_3, Photobioreactor_LED")
    parameter: str = Field(description="Parameter change e.g. +35% flow, 50ml N-P-K nutrient buffer, 6500K spectrum")
    rationale: str = Field(description="Biological justification for this action")


class CarbonReport(BaseModel):
    co2_absorbed_kg_day: float = Field(description="Estimated daily CO2 sequestered by facade")
    carbon_credits_earned: float = Field(description="Simulated daily carbon credits (1 credit = 1 ton CO2)")
    esg_compliance_score: str = Field(description="Rating like AA+ or Platinum Net-Zero")
    summary: str = Field(description="ESG executive summary for building stakeholders")


class DiagnosticsResponse(BaseModel):
    status: str = Field(description="OPTIMAL, STRESSED, or CRITICAL")
    diagnostics: str = Field(description="Clear explanation of the biological and atmospheric state")
    actions: List[str] = Field(description="High-level command strings e.g. ['redirect_hvac', 'dose_nitrogen']")
    detailed_actions: List[SystemAction] = Field(description="Detailed system control commands")
    carbon_report: CarbonReport


class BioFacadeAIAgent:
    """
    Autonomous GenAI agent managing the Algor-Algae facade bioreactor loop.
    Interprets telemetry, diagnoses microalgae culture shifts, generates control commands,
    and calculates carbon offset ESG metrics using Gemini 2.5 Flash.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        if _GENAI_AVAILABLE and self.api_key and genai is not None:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[AIAgent] Warning: GenAI client initialization failed: {e}")

    def generate_fallback_diagnostics(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Graceful local heuristic fallback when offline, rate-limited, or API key is unset.
        Ensures hackathon demo never crashes.
        """
        occupancy = state.get("occupancy", 1)
        co2_ppm = state.get("co2_ppm", 550)
        health = state.get("algae_health", 90.0)
        biofuel_ml = state.get("biofuel_ml_hr", 15.0)

        # Base sequestration: ~0.08 kg CO2 per person equivalent/day with healthy algae
        daily_absorption_kg = round((occupancy * 0.12) * (health / 100.0) * (co2_ppm / 400.0), 3)
        carbon_credits = round(daily_absorption_kg / 1000.0, 5)

        if health >= 75.0:
            status = "OPTIMAL"
            diagnostics = (
                f"Culture is thriving in logarithmic growth phase. Indoor human load of {occupancy} occupants "
                f"generates {co2_ppm} ppm CO2, matching the optimal photosynthetic intake of facade Spirulina/Chlorella panels."
            )
            actions = ["maintain_flow_rate", "harvest_excess_biofuel", "log_carbon_offset"]
            detailed_actions = [
                {
                    "action": "maintain_flow_rate",
                    "target": "Facade_Circulation_Pumps",
                    "parameter": "Flow: 4.2 L/min",
                    "rationale": "Keeps algae cells uniformly suspended under sunlight."
                },
                {
                    "action": "harvest_excess_biofuel",
                    "target": "Bio_Separation_Centrifuge",
                    "parameter": f"Extract {biofuel_ml} ml/hr",
                    "rationale": "Prevents biofilm crowding and preserves light transmission."
                }
            ]
            esg_score = "AAA - Net-Positive Bio-Facade"
            esg_summary = (
                f"Facade currently sequestering {daily_absorption_kg} kg CO2/day directly from indoor ventilation. "
                "Building on track for LEED Zero Carbon certification."
            )
        elif health >= 45.0:
            status = "STRESSED"
            diagnostics = (
                f"Culture under mild abiotic stress. Yellowing hue detected in spectrophotometer ROI. "
                f"With {occupancy} occupants producing {co2_ppm} ppm CO2, the building exhaust is redirected "
                "to the outside atmosphere (90% outdoor vent) to prevent lethal carbonic acid shock (pH < 6.8) "
                "while culture undergoes nutrient recovery."
            )
            actions = ["dose_nitrogen_buffer", "bypass_hvac_exhaust_to_outside", "adjust_panel_tilt"]
            detailed_actions = [
                {
                    "action": "dose_nitrogen_buffer",
                    "target": "Nutrient_Doser_B",
                    "parameter": "+35 ml N-P-K nutrient buffer",
                    "rationale": "Replenishes depleted nitrogen needed for chlorophyll synthesis."
                },
                {
                    "action": "bypass_hvac_exhaust_to_outside",
                    "target": "BMS_Bypass_Damper",
                    "parameter": "Bypass 90% exhaust to outside atmosphere",
                    "rationale": "Yellow stress detected: Redirects high-CO2 exhaust outside to prevent carbonic acid acidification."
                }
            ]
            esg_score = "A - Warning: Carbon Efficiency Reduced"
            esg_summary = (
                f"Current sequestration reduced to {daily_absorption_kg} kg CO2/day due to nutrient limitation. "
                "Execute corrective nutrient dosing immediately."
            )
        else:
            status = "CRITICAL"
            diagnostics = (
                f"CRITICAL BIOLOGICAL COLLAPSE DETECTED. Algae health has fallen to {health:.1f}% with severe chlorosis "
                f"(yellow spectrum dominance). Immediate life-support automation triggered: 95% exhaust air vented outside."
            )
            actions = ["emergency_nutrient_flush", "divert_excess_hvac_exhaust", "activate_uv_sterilization", "trigger_shade_louvers"]
            detailed_actions = [
                {
                    "action": "emergency_nutrient_flush",
                    "target": "Nutrient_Injector_Primary",
                    "parameter": "Flush 120 ml recovery buffer + Fe-EDTA chelate",
                    "rationale": "Stops acute chlorosis and provides emergency bio-available iron and nitrogen."
                },
                {
                    "action": "divert_excess_hvac_exhaust",
                    "target": "BMS_Bypass_Damper",
                    "parameter": "Bypass 95% exhaust to outside atmosphere",
                    "rationale": "High CO2 concentration at low cellular vitality acidifies water below pH 6.8."
                },
                {
                    "action": "trigger_shade_louvers",
                    "target": "Facade_Electrochromic_Glass",
                    "parameter": "Dim facade transmission to 40%",
                    "rationale": "Protects fragile stressed cells from intense solar photo-bleaching."
                }
            ]
            esg_score = "C - Carbon Sequestration Offline"
            esg_summary = (
                "Algae panels operating at critical capacity. High risk of total biomass collapse. "
                "Automated emergency recovery protocol active."
            )

        return {
            "status": status,
            "diagnostics": diagnostics,
            "actions": actions,
            "detailed_actions": detailed_actions,
            "carbon_report": {
                "co2_absorbed_kg_day": daily_absorption_kg,
                "carbon_credits_earned": carbon_credits,
                "esg_compliance_score": esg_score,
                "summary": esg_summary
            }
        }

    async def run_diagnostics(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs diagnostics using Gemini 2.5 Flash if available, or gracefully falls back.
        """
        occupancy = state.get("occupancy", 1)
        co2_ppm = state.get("co2_ppm", 550)
        health = state.get("algae_health", 90.0)
        biofuel_ml = state.get("biofuel_ml_hr", 15.0)

        prompt = f"""
You are Algor-Algae Bio-Facade AI, an autonomous Building Management System (BMS) agent monitoring an architectural living microalgae bioreactor facade.
Current telemetry received from computer vision sensors:
- Indoor Occupancy: {occupancy} human occupants
- Indoor CO2 Load: {co2_ppm} ppm (Formula: 400 + {occupancy} * 150)
- Facade Algae Health: {health}% (derived from HSV spectrophotometric analysis)
- Simulated Biofuel Production: {biofuel_ml} ml/hr

CRITICAL HVAC RULE:
- When algae is UNHEALTHY or YELLOW (health < 70% or status STRESSED/CRITICAL): Outlet exhaust air MUST be bypassed to the outdoor atmosphere (BMS_Bypass_Damper: 90-95% outside vent) and NOT redirected to the algae bioreactor, to prevent toxic carbonic acid shock (pH < 6.8).
- Only when algae is HEALTHY (health >= 70%): High occupancy exhaust should be redirected to the algae bioreactor for photosynthetic sequestration.

Task:
Analyze this telemetry and output a strict JSON diagnostics assessment:
1. 'status': 'OPTIMAL' if health >= 75, 'STRESSED' if 45 <= health < 75, 'CRITICAL' if health < 45.
2. 'diagnostics': Concise, scientifically grounded explanation of what is happening biologically and structurally.
3. 'actions': Array of 2 to 4 command strings (e.g. ["bypass_hvac_exhaust_to_outside", "dose_nitrogen", "adjust_damper"]).
4. 'detailed_actions': Array of structured actions with action name, target subsystem, parameter, and rationale.
5. 'carbon_report': Object with co2_absorbed_kg_day (float), carbon_credits_earned (float), esg_compliance_score (string), and summary (string).

Respond ONLY with valid JSON matching the schema.
"""

        if self.client is not None and types is not None:
            try:
                # Use Gemini 3.8 Flash with structured JSON output
                response = self.client.models.generate_content(
                    model='gemini-3.8-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                    ),
                )
                if response.text:
                    parsed = json.loads(response.text)
                    return parsed
            except Exception as e:
                print(f"[AIAgent] Gemini API call failed ({e}). Falling back to internal engine.")

        # Graceful fallback guarantee
        return self.generate_fallback_diagnostics(state)
