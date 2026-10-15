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

    // Check if algae reactor is unhealthy / yellow / stressed
    const isUnhealthyAlgae = (newHealth < 68.0) ||
                             (payload.status && payload.status !== 'OPTIMAL') ||
                             (payload.hsv_stats && payload.hsv_stats.yellow_ratio > 0.08);

    // Dynamic HVAC computation if in 'auto' mode
    let updatedHvac = { ...current.hvacState };
    if (current.hvacState.mode === 'auto') {
      if (isUnhealthyAlgae) {
        // ALGAE UNHEALTHY / YELLOW: Bypassed to outside atmosphere to prevent fatal carbonic acidification
        const isYellow = newHealth >= 45.0;
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 10,
          airflowVelocity: 2.2,
          airflowColor: isYellow ? '#f59e0b' : '#ef4444',
          activeLoop: 'roof_bypass',
          hvacStatusText: isYellow
            ? 'ALGAE YELLOW: OUTLET AIR REDIRECTED TO OUTSIDE'
            : 'CRITICAL CHLOROSIS: OUTLET AIR VENTED OUTSIDE',
          aiReasoning: `Gemini 3.8 Flash BMS: Algae reactor is unhealthy / yellow (${newHealth.toFixed(1)}% health). High-CO2 outlet air (${newCo2} ppm) is redirected to outside atmosphere (90% outdoor vent) to prevent lethal carbonic acid shock (pH < 6.8).`,
          spargingRateLpm: 2.0,
          divertPct: 90
        };
      } else if (newOcc > 1 || newCo2 > 650) {
        // HEALTHY ALGAE + High Occupancy: Airflow safely redirected to facade bioreactors
        const damper = Math.min(100, 35 + (newOcc * 15));
        const vel = 1.0 + (newOcc * 0.45);
        const isSurge = newCo2 > 800;
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: damper,
          airflowVelocity: vel,
          airflowColor: isSurge ? '#f59e0b' : '#38bdf8',
          activeLoop: 'facade',
          hvacStatusText: isSurge ? 'HEALTHY ALGAE: AI AIRFLOW REDIRECTED TO FACADE' : 'ACTIVE METABOLIC SPARGING',
          aiReasoning: `Gemini 3.8 Flash BMS: Detected ${newOcc} occupants (${newCo2} ppm CO2). Healthy algae culture (${newHealth.toFixed(1)}%) is actively photosynthesizing. Damper modulated to ${damper}% to feed bioreactor panels.`,
          spargingRateLpm: (newOcc * 5.2).toFixed(1),
          divertPct: 0
        };
      } else {
        // HEALTHY ALGAE + Baseline optimal ventilation
        updatedHvac = {
          mode: 'auto',
          damperOpenPct: 40,
          airflowVelocity: 1.0,
          airflowColor: newHealth >= 75 ? '#10b981' : '#38bdf8',
          activeLoop: 'facade',
          hvacStatusText: 'HEALTHY ALGAE: BALANCED RECIRCULATION',
          aiReasoning: `Gemini 3.8 Flash BMS: Standard indoor air (${newCo2} ppm). Healthy algae operating at optimal photosynthetic balance.`,
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
    const isUnhealthy = current.algae_health < 68.0 || current.status !== 'OPTIMAL';

    if (scenario === 'redirect') {
      if (isUnhealthy) {
        // Safety Interlock: cannot redirect toxic CO2 into unhealthy/yellow algae!
        set({
          hvacState: {
            mode: 'bypass',
            damperOpenPct: 10,
            airflowVelocity: 2.2,
            airflowColor: '#ef4444',
            activeLoop: 'roof_bypass',
            hvacStatusText: 'SAFETY OVERRIDE: OUTLET AIR VENTED OUTSIDE',
            aiReasoning: `Gemini 3.8 Flash BMS Safety Override: Redirection requested, but algae reactor is unhealthy / yellow (${current.algae_health.toFixed(1)}% health). Outlet air is safely redirected to outside atmosphere (90% outdoor vent) to prevent culture acidification!`,
            spargingRateLpm: 2.0,
            divertPct: 90
          }
        });
      } else {
        set({
          hvacState: {
            mode: 'redirect',
            damperOpenPct: 88,
            airflowVelocity: 2.8,
            airflowColor: '#f59e0b', // Radiant amber-gold redirection
            activeLoop: 'facade',
            hvacStatusText: 'AI AIRFLOW REDIRECT: 88% DAMPER OPEN',
            aiReasoning: 'Gemini 3.8 Flash BMS: Human occupancy spike detected (1000 ppm CO2). Healthy algae culture ready: Modulating motorized dampers to 88% — Redirecting exhaust into facade spargers!',
            spargingRateLpm: 28.5,
            divertPct: 0
          }
        });
      }
    } else if (scenario === 'bypass') {
      set({
        hvacState: {
          mode: 'bypass',
          damperOpenPct: 10,
          airflowVelocity: 2.4,
          airflowColor: '#ef4444', // Warning crimson bypass
          activeLoop: 'roof_bypass',
          hvacStatusText: 'AI OUTDOOR BYPASS: 90% VENTED TO OUTSIDE',
          aiReasoning: 'Gemini 3.8 Flash BMS: Algae stress / chlorosis safeguard active. Diverting 90% of outlet air to rooftop atmospheric scrubber to prevent culture acidification.',
          spargingRateLpm: 2.0,
          divertPct: 90
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
          aiReasoning: 'Gemini 3.8 Flash BMS: Ideal photosynthetic equilibrium. Modulating all facade sparging valves for peak biomass synthesis.',
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
