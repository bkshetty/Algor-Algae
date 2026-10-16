import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Cpu, 
  ShieldAlert, 
  Building2, 
  Users, 
  Activity, 
  Sparkles,
  Bot,
  Wind,
  Compass
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import OverviewPage from './components/OverviewPage';
import HumanDetectionPage from './components/HumanDetectionPage';
import AlgaeHealthPage from './components/AlgaeHealthPage';
import HVACDiagram from './components/HVACDiagram';
import { initWebSocket, closeWebSocket } from './utils/websocket';
import { useStore } from './store';

export default function App() {
  const isConnected = useStore((state) => state.isConnected);
  const algaeHealth = useStore((state) => state.algae_health);
  const occupancy = useStore((state) => state.occupancy);
  const status = useStore((state) => state.status);

  // Systematic multi-page view state: 'landing' | 'overview' | 'human' | 'algae' | 'hvac'
  const [activePage, setActivePage] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initWebSocket();
    return () => {
      closeWebSocket();
    };
  }, []);

  const handleNav = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const isLanding = activePage === 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif] selection:bg-[#0071E3] selection:text-white">
      
      {/* ────────────────────────────────────────────────────────────────────
          NAVIGATION BAR — Apple Retail 44px Glass Bar (apple-design.md)
         ──────────────────────────────────────────────────────────────────── */}
      <header className="h-[44px] border-b border-[rgba(0,0,0,0.08)] bg-[rgba(245,245,247,0.8)] backdrop-blur-[20px] backdrop-saturate-[1.8] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50 select-none">
        {/* Apple Wordmark */}
        <div 
          onClick={() => handleNav('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">
            Algor-Algae<span className="text-[#0071E3]">.</span>
          </span>
          <span className="text-[11px] text-[#86868B] bg-[#E8E8ED] px-1.5 py-0.5 rounded-[980px]">
            Twin v1.0
          </span>
        </div>

        {/* Apple Nav Links: SF Pro Text, 12px, rationed blue for active */}
        <nav className="hidden sm:flex items-center space-x-6 text-[12px] font-normal text-[#1D1D1F]">
          <button
            onClick={() => handleNav('landing')}
            className={`transition-colors ${
              activePage === 'landing' ? 'text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:text-[#0066CC]'
            }`}
          >
            Portal
          </button>
          <button
            onClick={() => handleNav('overview')}
            className={`transition-colors ${
              activePage === 'overview' ? 'text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:text-[#0066CC]'
            }`}
          >
            3D Digital Twin
          </button>
          <button
            onClick={() => handleNav('human')}
            className={`transition-colors flex items-center gap-1.5 ${
              activePage === 'human' ? 'text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:text-[#0066CC]'
            }`}
          >
            <span>Occupancy</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5E5EA] text-[#1D1D1F] font-mono">
              {occupancy}
            </span>
          </button>
          <button
            onClick={() => handleNav('algae')}
            className={`transition-colors flex items-center gap-1.5 ${
              activePage === 'algae' ? 'text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:text-[#0066CC]'
            }`}
          >
            <span>Algae Health</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5E5EA] text-[#1D1D1F] font-mono">
              {algaeHealth.toFixed(0)}%
            </span>
          </button>
          <button
            onClick={() => handleNav('hvac')}
            className={`transition-colors ${
              activePage === 'hvac' ? 'text-[#0071E3] font-semibold' : 'text-[#1D1D1F] hover:text-[#0066CC]'
            }`}
          >
            HVAC Schematic
          </button>
        </nav>

        {/* Right Controls: Apple #0071E3 Primary Pill Button */}
        <div className="flex items-center space-x-3">
          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-[#86868B] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
            <span>{isConnected ? '30 FPS' : 'STANDBY'}</span>
          </div>

          {activePage === 'landing' ? (
            <button
              onClick={() => handleNav('overview')}
              className="btn-apple-primary text-[12px] px-3.5 py-1.5"
            >
              Launch 3D Twin
            </button>
          ) : (
            <button
              onClick={() => handleNav('landing')}
              className="btn-apple-secondary text-[12px] px-3.5 py-1.5"
            >
              Back to Portal
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className={`flex-1 flex flex-col w-full ${
        isLanding
          ? 'p-0 max-w-none'
          : 'p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto'
      }`}>
        {activePage === 'landing' && (
          <LandingPage onNavigate={handleNav} />
        )}

        {activePage === 'overview' && (
          <OverviewPage onNavigate={handleNav} />
        )}

        {activePage === 'human' && (
          <HumanDetectionPage />
        )}

        {activePage === 'algae' && (
          <AlgaeHealthPage />
        )}

        {activePage === 'hvac' && (
          <div className="w-full">
            <HVACDiagram />
          </div>
        )}
      </main>
    </div>
  );
}
