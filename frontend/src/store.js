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
    damperOpenPct: 85,
    airflowVelocity: 3.0,
    airflowColor: '#34C759', // Vivid bio-green
    activeLoop: 'facade', // 'facade' | 'roof_bypass'
    hvacStatusText: 'ALGAE IS GREEN: AIR REDIRECTED TO BIOREACTOR',
    aiReasoning: 'Gemini 3.8 Flash BMS: Microalgae culture is healthy & green (92.0%). Human CO₂ return air routed directly into bioreactor panels as photosynthetic fuel.',
    spargingRateLpm: 26.0,
    divertPct: 15
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

    // Biological Rule:
    // When algae is GREEN (health >= 45%): air MUST redirect to algae bioreactor!
    // When algae is YELLOW or UNHEALTHY (health < 45% or yellow pixels / crisis): air MUST redirect to exhausts outside!
    const isAlgaeYellowOrUnhealthy = newHealth < 45.0 ||
                                     payload.status === 'CRITICAL_ACIDIFICATION_RISK' ||
                                     payload.status === 'CRITICAL DECAY' ||
                                     payload.status === 'CRITICAL' ||
                                     Boolean(payload.hsv_stats && payload.hsv_stats.yellow_ratio >= 0.35);
    const isAlgaeGreen = !isAlgaeYellowOrUnhealthy;

    // Dynamic HVAC computation if in 'auto' mode
    let updatedHvac = { ...current.hvacState };
    if (current.hvacState.mode === 'auto') {
      if (!isAlgaeGreen) {
        // ALGAE IS YELLOW OR UNHEALTHY: Redirect air to exhausts outside!
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 15,
          airflowVelocity: 2.8,
          airflowColor: '#FF3B30',
          activeLoop: 'roof_bypass',
          hvacStatusText: 'ALGAE IS YELLOW: AIR REDIRECTED TO EXHAUSTS',
          aiReasoning: `Gemini 3.8 Flash BMS: Yellow/unhealthy microalgae detected in ROI (${newHealth.toFixed(1)}% < 45%). Sick microalgae cannot process carbon efficiently; continuing high-CO2 air creates lethal carbonic acid (pH < 6.8). Damper clamped to 15%, 85% exhaust air redirected to safe rooftop scrubber.`,
          spargingRateLpm: 2.5,
          divertPct: 85
        };
      } else if (newOcc < 4) {
        // OCCUPANTS < 4: Not enough CO2 load to justify bioreactor feed — redirect to exhausts outside
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 15,
          airflowVelocity: 2.0,
          airflowColor: '#0071E3',
          activeLoop: 'roof_bypass',
          hvacStatusText: 'LOW OCCUPANCY: AIR REDIRECTED TO EXHAUSTS',
          aiReasoning: `Gemini 3.8 Flash BMS: Only ${newOcc} occupant(s) detected (< 4). Metabolic CO₂ load insufficient for photosynthetic feed. Air redirected to outside exhausts. Bioreactor on 15% standby trickle.`,
          spargingRateLpm: 2.5,
          divertPct: 85
        };
      } else {
        // OCCUPANTS >= 4 AND ALGAE IS GREEN: Redirect air to algae bioreactor!
        const damper = Math.min(95, Math.max(85, 45 + (newOcc * 10)));
        const vel = 3.0;
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: damper,
          airflowVelocity: vel,
          airflowColor: '#34C759',
          activeLoop: 'facade',
          hvacStatusText: 'ALGAE IS GREEN: AIR REDIRECTED TO BIOREACTOR',
          aiReasoning: `Gemini 3.8 Flash BMS: Microalgae culture is healthy & green (${newHealth.toFixed(1)}%). ${newOcc} occupants generating ${400 + newOcc * 150} ppm CO₂. HVAC dampers opened to ${damper}% — routing human CO₂ return air directly into algae bioreactor panels as photosynthetic fuel.`,
          spargingRateLpm: 26.0,
          divertPct: Math.max(5, 100 - damper)
        };
      }
    }

    const finalHealth = newHealth;
    const finalStatus = isAlgaeGreen ? (payload.status ?? 'OPTIMAL') : 'CRITICAL_ACIDIFICATION_RISK';

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
