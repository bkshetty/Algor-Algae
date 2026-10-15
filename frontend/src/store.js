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

    // Reset auto-trigger flag when health recovers above 60%
    let autoFlag = current.autoTriggeredForCrisis;
    if (newHealth >= 60.0) {
      autoFlag = false;
    }

    // Dynamic HVAC computation if in 'auto' mode
    let updatedHvac = { ...current.hvacState };
    if (current.hvacState.mode === 'auto') {
      if (newHealth < 45.0) {
        // Crisis: Acidification bypass
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 15,
          airflowVelocity: 2.2,
          airflowColor: '#ef4444',
          activeLoop: 'roof_bypass',
          hvacStatusText: 'AI ACIDIFICATION BYPASS ACTIVE',
          aiReasoning: `Gemini 3.8 Flash BMS: Chlorosis stress detected in OpenCV spectrophotometer (${newHealth.toFixed(1)}%). Exhaust bypassed away from facade to avoid acidification.`,
          spargingRateLpm: 3.5,
          divertPct: 85
        };
      } else if (newOcc > 1 || newCo2 > 650) {
        // High Occupancy: Airflow redirected to facade
        const damper = Math.min(100, 35 + (newOcc * 15));
        const vel = 1.0 + (newOcc * 0.45);
        const isSurge = newCo2 > 800;
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: damper,
          airflowVelocity: vel,
          airflowColor: isSurge ? '#f59e0b' : '#38bdf8',
          activeLoop: 'facade',
          hvacStatusText: isSurge ? 'AI AIRFLOW REDIRECTED TO FACADE' : 'ACTIVE METABOLIC SPARGING',
          aiReasoning: `Gemini 3.8 Flash BMS: Detected ${newOcc} occupants (${newCo2} ppm CO2). Damper modulated to ${damper}%. Human exhaust redirected directly to bioreactor panels.`,
          spargingRateLpm: (newOcc * 5.2).toFixed(1),
          divertPct: 0
        };
      } else {
        // Baseline optimal
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 40,
          airflowVelocity: 1.0,
          airflowColor: newHealth >= 75 ? '#10b981' : '#38bdf8',
          activeLoop: 'facade',
          hvacStatusText: 'NORMAL RECIRCULATION',
          aiReasoning: `Gemini 3.8 Flash BMS: Standard indoor ventilation (${newCo2} ppm). Facade panels operating at optimal photosynthetic balance.`,
          spargingRateLpm: 8.5,
          divertPct: 0
        };
      }
    }

    set({
      occupancy: newOcc,
      co2_ppm: newCo2,
      ambient_lux: payload.ambient_lux ?? current.ambient_lux,
      algae_health: newHealth,
      biofuel_ml_hr: payload.biofuel_ml_hr ?? current.biofuel_ml_hr,
      status: payload.status ?? current.status,
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
      set({
        hvacState: {
          mode: 'redirect',
          damperOpenPct: 88,
          airflowVelocity: 2.8,
          airflowColor: '#f59e0b', // Radiant amber-gold redirection
          activeLoop: 'facade',
          hvacStatusText: 'AI AIRFLOW REDIRECT: 88% DAMPER OPEN',
          aiReasoning: 'Gemini 3.8 Flash BMS: Human occupancy spike detected (1000 ppm CO2). Modulating motorized dampers to 88% — Redirecting high-CO2 exhaust into facade spargers!',
          spargingRateLpm: 28.5,
          divertPct: 0
        }
      });
    } else if (scenario === 'bypass') {
      set({
        hvacState: {
          mode: 'bypass',
          damperOpenPct: 15,
          airflowVelocity: 2.4,
          airflowColor: '#ef4444', // Warning crimson bypass
          activeLoop: 'roof_bypass',
          hvacStatusText: 'AI EMERGENCY BYPASS: FACADE DIVERTED 85%',
          aiReasoning: 'Gemini 3.8 Flash BMS: Severe chlorosis / acidic pH (6.3) detected. Diverting 85% of airflow away from facade to roof scrubber to prevent culture wipeout.',
          spargingRateLpm: 4.0,
          divertPct: 85
        }
      });
    } else if (scenario === 'optimal') {
      set({
        hvacState: {
          mode: 'optimal',
          damperOpenPct: 75,
          airflowVelocity: 1.8,
          airflowColor: '#10b981', // Vivid bio-green
          activeLoop: 'facade',
          hvacStatusText: 'AI MAX PHOTOSYNTHESIS: 75% UNIFORM FLOW',
          aiReasoning: 'Gemini 3.8 Flash BMS: Ideal photosynthetic equilibrium. Modulating all 56 facade sparging valves for peak 32 ml/hr biomass synthesis.',
          spargingRateLpm: 22.0,
          divertPct: 0
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
