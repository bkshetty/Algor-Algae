import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Cpu, 
  ShieldAlert, 
  Building2, 
  Users, 
  Activity, 
  Sparkles,
  Bot
} from 'lucide-react';
import OverviewPage from './components/OverviewPage';
import HumanDetectionPage from './components/HumanDetectionPage';
import AlgaeHealthPage from './components/AlgaeHealthPage';
import { initWebSocket, closeWebSocket } from './utils/websocket';
import { useStore } from './store';

export default function App() {
  const isConnected = useStore((state) => state.isConnected);
  const algaeHealth = useStore((state) => state.algae_health);
  const occupancy = useStore((state) => state.occupancy);
  const status = useStore((state) => state.status);

  // Systematic multi-page view state: 'overview' | 'human' | 'algae'
  const [activePage, setActivePage] = useState('overview');

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
      <header className="border-b border-emerald-950/80 bg-[#0a110e]/95 backdrop-blur-md px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between sticky top-0 z-50 gap-3">
        {/* Logo & Platform Info */}
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
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Autonomous Biological Facade & Carbon Bio-Sequestration Nervous System
            </p>
          </div>
        </div>

        {/* Central Systematic Navigation Tabs */}
        <nav className="flex items-center bg-[#0d151f] p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActivePage('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              activePage === 'overview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Twin Overview</span>
          </button>

          <button
            onClick={() => setActivePage('human')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              activePage === 'human'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Human Occupancy</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/30 text-sky-200">
              {occupancy}
            </span>
          </button>

          <button
            onClick={() => setActivePage('algae')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              activePage === 'algae'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Algae Bio-Health</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              algaeHealth >= 70 ? 'bg-emerald-500/30 text-emerald-200' :
              algaeHealth >= 45 ? 'bg-amber-500/30 text-amber-200' : 'bg-rose-500/30 text-rose-200'
            }`}>
              {algaeHealth.toFixed(0)}%
            </span>
          </button>
        </nav>

        {/* Global Status Indicators */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111a16] border border-emerald-900/40">
            <span className="text-slate-400 text-[11px]">BMS KERNEL:</span>
            <span className="text-emerald-400 font-medium">GEMINI 3.8 FLASH</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111a16] border border-emerald-900/40">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className={isConnected ? 'text-slate-300' : 'text-rose-400'}>
              {isConnected ? 'TELEMETRY: 30 FPS' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Systematic Multi-View Container */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col max-w-[1850px] w-full mx-auto">
        {activePage === 'overview' && (
          <OverviewPage onNavigate={setActivePage} />
        )}

        {activePage === 'human' && (
          <HumanDetectionPage />
        )}

        {activePage === 'algae' && (
          <AlgaeHealthPage />
        )}
      </main>
    </div>
  );
}
