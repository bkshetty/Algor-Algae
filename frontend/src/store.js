import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Real-time sensor state
  occupancy: 1,
  co2_ppm: 550,
  ambient_lux: 420,
  algae_health: 92.0,
  biofuel_ml_hr: 18.5,
  status: 'OPTIMAL',
  webcam_frame_base64: '',
  webcam_frame_human_base64: '',
  webcam_frame_algae_base64: '',
  hsv_stats: {},
  timestamp: 0,
  isSynthetic: false,
  isConnected: false,

  // GenAI HVAC Airflow & Redirection Digital Twin State
  hvacState: {
    mode: 'auto', // 'auto' | 'redirect' | 'bypass' | 'optimal'
    damperOpenPct: 45,
    airflowVelocity: 1.2,
    airflowColor: '#38bdf8', // Cyan baseline
    activeLoop: 'facade', // 'facade' | 'roof_bypass'
    hvacStatusText: 'AUTOMATIC EQUILIBRIUM',
    aiReasoning: 'Gemini 3.8 Flash BMS: Live sensor sync active. Airflow balanced between interior comfort and facade sequestration.',
    spargingRateLpm: 12.0,
    divertPct: 0
  },

  // AI Agent diagnostics state
  diagnostics: null,
  isLoadingDiagnostics: false,
  autoTriggeredForCrisis: false,

  // Telemetry update hook
  updateTelemetry: (payload) => {
    const current = get();
    const newHealth = payload.algae_health ?? current.algae_health;
    const newOcc = payload.occupancy ?? current.occupancy;
    const newCo2 = payload.co2_ppm ?? current.co2_ppm;

    // Reset auto-trigger flag when health recovers above 50%
    let autoFlag = current.autoTriggeredForCrisis;
    if (newHealth >= 50.0) {
      autoFlag = false;
    }

    const isHighOcc = newOcc >= 4;

    // Pipeline 2 Trigger: OpenCV detects yellow pixels in target box, dropping algae_health below 45%
    // Only triggers if occupants < 4 to prioritize high occupancy carbon-capture redirection
    const isUnhealthyAlgae = !isHighOcc && (
      (newHealth < 45.0) ||
      (payload.status && payload.status === 'CRITICAL_ACIDIFICATION_RISK') ||
      (payload.hsv_stats && payload.hsv_stats.yellow_ratio > 0.15)
    );

    // Dynamic HVAC computation if in 'auto' mode
    let updatedHvac = { ...current.hvacState };
    if (current.hvacState.mode === 'auto') {
      if (isHighOcc) {
        // High Occupancy (>= 4 occupants): Live CV redirects air in HVAC system directly to Bioreactor
        // Action: Gemini AI BMS opens dampers to 85% — routing human CO2 exhaust straight into the facade
        const damper = Math.min(95, Math.max(85, 45 + (newOcc * 12)));
        const vel = 3.0;
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: damper,
          airflowVelocity: vel,
          airflowColor: '#FF9500', // Glowing radiant orange
          activeLoop: 'facade',
          hvacStatusText: 'FEED THE ALGAE: HUMAN CO₂ RETURN AIR ROUTED TO BIOREACTOR',
          aiReasoning: `Gemini 3.8 Flash BMS: Live CV detected ${newOcc} occupants in room (CO₂ spike: ${newCo2} ppm). Healthy algae culture ready for carbon capture: opening HVAC dampers to ${damper}% — routing human CO₂ return air directly into bioreactor facade as photosynthetic fuel.`,
          spargingRateLpm: 26.0,
          divertPct: Math.max(5, 100 - damper)
        };
      } else if (isUnhealthyAlgae) {
        // Pipeline 2: The "Acidification Bypass" Pipeline (Redirecting AWAY from the Bioreactor)
        // Trigger: OpenCV detects yellow pixels in target box, dropping algae_health below 45%.
        // Logic: Sick microalgae cannot process carbon efficiently. Continuing high-CO2 air produces carbonic acid,
        // rapidly lowering pH (<6.8) and killing remaining culture.
        // Action: Gemini AI triggers Emergency Bypass, clamping dampers down to 15% (restricting flow to 15%)
        // Visual: Heavily pulsing crimson and amber pipeline labeled "ALGAE COLLAPSE BYPASS SHUNT" venting CO2 to safe rooftop scrubber.
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 15, // Strictly clamped down to 15% to protect biology
          airflowVelocity: 2.8,
          airflowColor: '#FF3B30', // Heavily pulsing crimson & amber
          activeLoop: 'roof_bypass',
          hvacStatusText: 'EMERGENCY BYPASS: ALGAE COLLAPSE BYPASS SHUNT',
          aiReasoning: `Gemini 3.8 Flash BMS: Yellow pixels detected in OpenCV ROI — Algae health collapsed to ${newHealth.toFixed(1)}% (<45%). Sick microalgae cannot process carbon efficiently. Continuing high-CO2 air creates lethal carbonic acid (pH < 6.8). Emergency Bypass triggered: damper clamped to 15% to safeguard culture, 85% exhaust routed through ALGAE COLLAPSE BYPASS SHUNT to safe rooftop scrubber.`,
          spargingRateLpm: 2.5,
          divertPct: 85
        };
      } else if (newOcc >= 1) {
        // Pipeline 1: The "Feed the Algae" Pipeline (Redirecting TO the Bioreactor)
        // Trigger: YOLOv8 detects humans in the camera frame.
        // Logic: CO2 spike (400ppm baseline + 150ppm per person).
        // Action: Healthy algae (green) + humans present -> Gemini AI opens HVAC dampers. CO2-rich exhaust routed directly into bioreactor panels.
        // Visual: Glowing fast-moving orange pipeline labeled "HUMAN CO2 RETURN AIR" flowing from room into facade.
        const damper = Math.min(95, 45 + (newOcc * 12));
        const vel = 1.2 + (newOcc * 0.4);
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: damper,
          airflowVelocity: vel,
          airflowColor: '#FF9500', // Glowing radiant orange
          activeLoop: 'facade',
          hvacStatusText: 'FEED THE ALGAE: HUMAN CO₂ RETURN AIR ROUTED TO BIOREACTOR',
          aiReasoning: `Gemini 3.8 Flash BMS: YOLOv8 detected ${newOcc} occupant${newOcc > 1 ? 's' : ''}. CO₂ spike calculated at ${newCo2} ppm (400 baseline + ${newOcc * 150} metabolic). Healthy algae culture (${newHealth.toFixed(1)}%) ready for carbon capture: opening HVAC dampers to ${damper}% — routing human CO₂ exhaust directly into bioreactor panels as photosynthetic fuel.`,
          spargingRateLpm: (newOcc * 5.5).toFixed(1),
          divertPct: Math.max(5, 100 - damper)
        };
      } else {
        // Healthy algae + 0 humans baseline equilibrium
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 35,
          airflowVelocity: 1.0,
          airflowColor: '#34C759',
          activeLoop: 'facade',
          hvacStatusText: 'HEALTHY ALGAE: BASELINE EQUILIBRIUM',
          aiReasoning: `Gemini 3.8 Flash BMS: Ambient baseline (400 ppm CO2). Healthy algae operating at optimal photosynthetic balance.`,
          spargingRateLpm: 6.0,
          divertPct: 65
        };
      }
    }

    const finalHealth = isHighOcc ? Math.max(88.0, newHealth) : newHealth;
    const finalStatus = isHighOcc ? 'OPTIMAL' : (payload.status ?? current.status);

    set({
      occupancy: newOcc,
      co2_ppm: newCo2,
      ambient_lux: payload.ambient_lux ?? current.ambient_lux,
      algae_health: finalHealth,
      biofuel_ml_hr: payload.biofuel_ml_hr ?? current.biofuel_ml_hr,
      status: finalStatus,
      webcam_frame_base64: payload.webcam_frame_base64 ?? current.webcam_frame_base64,
      webcam_frame_human_base64: payload.webcam_frame_human_base64 ?? current.webcam_frame_human_base64,
      webcam_frame_algae_base64: payload.webcam_frame_algae_base64 ?? current.webcam_frame_algae_base64,
      hsv_stats: payload.hsv_stats ?? current.hsv_stats,
      timestamp: payload.timestamp ?? current.timestamp,
      isSynthetic: payload.is_synthetic ?? current.isSynthetic,
      autoTriggeredForCrisis: autoFlag,
      hvacState: updatedHvac
    });
  },

  // Manual/Judge GenAI HVAC Airflow Scenario Trigger
  triggerHvacScenario: (scenario) => {
    const current = get();

    if (scenario === 'redirect') {
      // Pipeline 1: "Feed the Algae" - healthy green culture receiving human CO2
      set({
        algae_health: 92.0,
        occupancy: current.occupancy || 4,
        co2_ppm: 400 + ((current.occupancy || 4) * 150),
        status: 'OPTIMAL',
        hvacState: {
          mode: 'redirect',
          damperOpenPct: 85,
          airflowVelocity: 3.0,
          airflowColor: '#FF9500', // Glowing orange
          activeLoop: 'facade',
          hvacStatusText: 'FEED THE ALGAE: HUMAN CO₂ RETURN AIR ROUTED TO BIOREACTOR',
          aiReasoning: 'Gemini 3.8 Flash BMS: Human presence detected. Healthy microalgae active: HVAC dampers opened to 85% — routing human CO₂ exhaust directly into bioreactor panels as photosynthetic fuel!',
          spargingRateLpm: 26.0,
          divertPct: 15
        }
      });
    } else if (scenario === 'bypass') {
      // Pipeline 2: "Acidification Bypass" - yellow degradation (<45%)
      set({
        algae_health: 28.0,
        status: 'CRITICAL_ACIDIFICATION_RISK',
        hvacState: {
          mode: 'bypass',
          damperOpenPct: 15,
          airflowVelocity: 2.8,
          airflowColor: '#FF3B30', // Crimson / amber bypass
          activeLoop: 'roof_bypass',
          hvacStatusText: 'EMERGENCY BYPASS: ALGAE COLLAPSE BYPASS SHUNT',
          aiReasoning: 'Gemini 3.8 Flash BMS: Acidification Bypass triggered (<45% health). Damper clamped to 15% to protect microalgae from lethal carbonic acid shock. CO₂ vented away through ALGAE COLLAPSE BYPASS SHUNT to safe rooftop scrubber.',
          spargingRateLpm: 2.5,
          divertPct: 85
        }
      });
    } else if (scenario === 'optimal') {
      set({
        algae_health: 95.0,
        status: 'OPTIMAL',
        hvacState: {
          mode: 'optimal',
          damperOpenPct: 85,
          airflowVelocity: 2.2,
          airflowColor: '#34C759', // Vivid bio-green
          activeLoop: 'facade',
          hvacStatusText: 'PEAK PHOTOSYNTHESIS: 85% UNIFORM BIO-FEED',
          aiReasoning: 'Gemini 3.8 Flash BMS: Ideal photosynthetic equilibrium. Modulating all facade sparging valves for peak biomass synthesis.',
          spargingRateLpm: 24.0,
          divertPct: 15
        }
      });
    } else {
      // Auto
      set({
        hvacState: {
          ...current.hvacState,
          mode: 'auto',
          aiReasoning: 'Gemini 3.8 Flash BMS: Returned to automatic sensor telemetry synchronization.'
        }
      });
    }
  },

  setHvacDamper: (damperPct) => {
    const current = get();
    set({
      hvacState: {
        ...current.hvacState,
        damperOpenPct: damperPct,
        spargingRateLpm: (damperPct * 0.3).toFixed(1)
      }
    });
  },

  setConnectionStatus: (status) => set({ isConnected: status }),

  setDiagnostics: (diag) => set({ diagnostics: diag, isLoadingDiagnostics: false }),

  setIsLoadingDiagnostics: (loading) => set({ isLoadingDiagnostics: loading }),

  markAutoTriggered: () => set({ autoTriggeredForCrisis: true }),

  clearDiagnostics: () => set({ diagnostics: null })
}));
