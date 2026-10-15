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
  timestamp: 0,
  isSynthetic: false,
  isConnected: false,

  // AI Agent diagnostics state
  diagnostics: null,
  isLoadingDiagnostics: false,
  autoTriggeredForCrisis: false,

  // Actions
  updateTelemetry: (payload) => {
    const current = get();
    const newHealth = payload.algae_health ?? current.algae_health;

    // Reset auto-trigger flag when health recovers above 60%
    let autoFlag = current.autoTriggeredForCrisis;
    if (newHealth >= 60.0) {
      autoFlag = false;
    }

    set({
      occupancy: payload.occupancy ?? current.occupancy,
      co2_ppm: payload.co2_ppm ?? current.co2_ppm,
      ambient_lux: payload.ambient_lux ?? current.ambient_lux,
      algae_health: newHealth,
      biofuel_ml_hr: payload.biofuel_ml_hr ?? current.biofuel_ml_hr,
      status: payload.status ?? current.status,
      webcam_frame_base64: payload.webcam_frame_base64 ?? current.webcam_frame_base64,
      timestamp: payload.timestamp ?? current.timestamp,
      isSynthetic: payload.is_synthetic ?? current.isSynthetic,
      autoTriggeredForCrisis: autoFlag
    });
  },

  setConnectionStatus: (status) => set({ isConnected: status }),

  setDiagnostics: (diag) => set({ diagnostics: diag, isLoadingDiagnostics: false }),

  setIsLoadingDiagnostics: (loading) => set({ isLoadingDiagnostics: loading }),

  markAutoTriggered: () => set({ autoTriggeredForCrisis: true }),

  clearDiagnostics: () => set({ diagnostics: null })
}));
