import { useEffect } from 'react';
import { useStore } from '../store';
import { initWebSocket, closeWebSocket } from '../utils/websocket';

export function useWebSocket() {
  const isConnected = useStore((state) => state.isConnected);
  const occupancy = useStore((state) => state.occupancy);
  const co2_ppm = useStore((state) => state.co2_ppm);
  const ambient_lux = useStore((state) => state.ambient_lux);
  const algae_health = useStore((state) => state.algae_health);
  const biofuel_ml_hr = useStore((state) => state.biofuel_ml_hr);
  const status = useStore((state) => state.status);
  const webcam_frame_base64 = useStore((state) => state.webcam_frame_base64);

  useEffect(() => {
    initWebSocket();
    return () => {
      closeWebSocket();
    };
  }, []);

  return {
    isConnected,
    occupancy,
    co2_ppm,
    ambient_lux,
    algae_health,
    biofuel_ml_hr,
    status,
    webcam_frame_base64
  };
}
