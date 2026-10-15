import React, { useEffect } from 'react';
import { Leaf, Cpu, ShieldAlert } from 'lucide-react';
import BuildingTwin from './components/BuildingTwin';
import CameraFeed from './components/CameraFeed';
import TelemetryHUD from './components/TelemetryHUD';
import AgentDrawer from './components/AgentDrawer';
import { initWebSocket, closeWebSocket } from './utils/websocket';
import { useStore } from './store';

export default function App() {
  const isConnected = useStore((state) => state.isConnected);
  const algaeHealth = useStore((state) => state.algae_health);
  const status = useStore((state) => state.status);

  useEffect(() => {
    initWebSocket();
    return () => {
      closeWebSocket();
    };
  }, []);

  const isCritical = algaeHealth < 45;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Top Futuristic Navigation Bar */}
      <header className="border-b border-emerald-950/80 bg-[#0a110e]/95 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-[#070b12] rounded-[10px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base tracking-tight text-white font-mono flex items-center">
                ALGOR-ALGAE
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  LIVING TWIN v1.0
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Autonomous Biological Facade & Carbon Bio-Sequestration Nervous System
            </p>
          </div>
        </div>

        {/* Global Status Indicators */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111a16] border border-emerald-900/40">
            <span className="text-slate-400 text-[11px]">BMS KERNEL:</span>
            <span className="text-emerald-400 font-medium">GEMINI 3.8 FLASH</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111a16] border border-emerald-900/40">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className={isConnected ? 'text-slate-300' : 'text-rose-400'}>
              {isConnected ? 'TELEMETRY: 30 FPS (ZERO-LAG)' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col space-y-4 max-w-[1850px] w-full mx-auto">
        {/* Top Telemetry HUD Cards */}
        <TelemetryHUD />

        {/* Split View: 3D Twin (Left) & Vision Feed + Agent Drawer (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
          {/* Left Column: 3D Procedural Building Twin */}
          <section className="lg:col-span-7 h-[540px] lg:h-full min-h-[500px]">
            <BuildingTwin />
          </section>

          {/* Right Column: CV Camera Stream & Gemini 2.5 Agent Drawer */}
          <section className="lg:col-span-5 flex flex-col space-y-4">
            <div className="h-[320px] flex-shrink-0">
              <CameraFeed />
            </div>
            <div className="flex-1 min-h-[290px]">
              <AgentDrawer />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
