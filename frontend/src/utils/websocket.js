import { useStore } from '../store';

let socket = null;
let reconnectTimer = null;
const BACKEND_WS_URL = 'ws://localhost:8000/ws';
export const BACKEND_HTTP_URL = 'http://localhost:8000';

export function initWebSocket() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const { updateTelemetry, setConnectionStatus, algae_health, autoTriggeredForCrisis, markAutoTriggered } = useStore.getState();

  try {
    socket = new WebSocket(BACKEND_WS_URL);

    socket.onopen = () => {
      console.log('[WebSocket] Connected to Algor-Algae backend.');
      setConnectionStatus(true);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        updateTelemetry(data);

        // PRD Section 3.3: Automatic AI trigger if health drops below 50%
        if (data.algae_health < 50.0 && !useStore.getState().autoTriggeredForCrisis && !useStore.getState().isLoadingDiagnostics) {
          markAutoTriggered();
          triggerAIDiagnostics();
        }
      } catch (err) {
        console.error('[WebSocket] Parse error:', err);
      }
    };

    socket.onclose = () => {
      setConnectionStatus(false);
      console.log('[WebSocket] Disconnected. Reconnecting in 2.5s...');
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          initWebSocket();
        }, 2500);
      }
    };

    socket.onerror = (error) => {
      console.warn('[WebSocket] Connection error:', error);
      setConnectionStatus(false);
      socket.close();
    };
  } catch (err) {
    console.error('[WebSocket] Setup exception:', err);
    setConnectionStatus(false);
    reconnectTimer = setTimeout(initWebSocket, 3000);
  }
}

export function closeWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}

export async function triggerAIDiagnostics(overrideState = null) {
  const store = useStore.getState();
  store.setIsLoadingDiagnostics(true);

  try {
    const payload = overrideState ? { override_state: overrideState } : {};
    const res = await fetch(`${BACKEND_HTTP_URL}/api/diagnostics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    store.setDiagnostics(data.diagnostics);
    return data.diagnostics;
  } catch (error) {
    console.error('[AIAgent] Diagnostics request failed:', error);
    store.setIsLoadingDiagnostics(false);
    throw error;
  }
}

export async function setSimulationOverride(occupancy, simulateYellowCrisis) {
  try {
    const res = await fetch(`${BACKEND_HTTP_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active: true,
        occupancy,
        simulate_yellow_crisis: simulateYellowCrisis
      })
    });
    return await res.json();
  } catch (error) {
    console.error('[Simulation] Failed to set override:', error);
  }
}

export async function disableSimulationOverride() {
  try {
    const res = await fetch(`${BACKEND_HTTP_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    });
    return await res.json();
  } catch (error) {
    console.error('[Simulation] Failed to disable override:', error);
  }
}
