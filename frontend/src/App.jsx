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
    <div className={`min-h-screen flex flex-col ${
      isLanding
        ? "bg-[#060a12] text-[#ede7dc] font-['Sora'] selection:bg-[#10b981] selection:text-black"
        : "bg-[#F5F5F7] text-[#1D1D1F] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] selection:bg-[#0071E3] selection:text-white"
    }`}>
      
      {/* ────────────────────────────────────────────────────────────────────
          NAVIGATION BAR
          - Landing Page: 58px Dark Obsidian Translucent Bar
          - All Other Pages: Apple Retail 44px Glass Bar (apple-design.md)
         ──────────────────────────────────────────────────────────────────── */}
      {isLanding ? (
        <header className="h-[58px] border-b border-[rgba(237,231,220,0.13)] bg-[rgba(13,21,34,0.75)] backdrop-blur-[16px] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
          {/* Wordmark (15px Syne 700 uppercase with green trailing dot) */}
          <div 
            onClick={() => handleNav('landing')}
            className="flex items-center space-x-2 cursor-pointer group select-none"
          >
            <span className="font-['Syne'] font-bold text-[12px] sm:text-[15px] uppercase tracking-[-0.02em] text-[#ede7dc] group-hover:opacity-90 transition-opacity">
              Algor-Algae<span className="text-[#10b981]">.</span>
            </span>
            <span className="hidden md:inline-block font-mono text-[9.5px] uppercase px-1.5 py-0.5 rounded border border-[rgba(237,231,220,0.15)] text-[#9ea5a8]">
              TWIN v1.0
            </span>
          </div>

          {/* Links */}
          <nav className="hidden sm:flex items-center space-x-5 lg:space-x-7 font-['Sora'] text-[10.5px] uppercase font-medium tracking-[0.12em]">
            <button
              onClick={() => handleNav('landing')}
              className="text-[#10b981] font-semibold py-1 transition-colors"
            >
              Portal
            </button>
            <button
              onClick={() => handleNav('overview')}
              className="text-[#ede7dc] hover:text-[#10b981] py-1 transition-colors"
            >
              3D Twin
            </button>
            <button
              onClick={() => handleNav('human')}
              className="text-[#ede7dc] hover:text-[#10b981] py-1 transition-colors flex items-center gap-1.5"
            >
              <span>Occupancy</span>
              <span className="font-mono text-[9.5px] px-1 rounded border border-[rgba(237,231,220,0.15)] text-[#9ea5a8]">
                {occupancy}
              </span>
            </button>
            <button
              onClick={() => handleNav('algae')}
              className="text-[#ede7dc] hover:text-[#10b981] py-1 transition-colors flex items-center gap-1.5"
            >
              <span>Algae Health</span>
              <span className="font-mono text-[9.5px] px-1 rounded border border-[rgba(16,185,129,0.3)] text-[#10b981]">
                {algaeHealth.toFixed(0)}%
              </span>
            </button>
            <button
              onClick={() => handleNav('hvac')}
              className="text-[#ede7dc] hover:text-[#10b981] py-1 transition-colors"
            >
              HVAC Schematic
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <div className="hidden xl:flex items-center space-x-2 font-mono text-[10px] text-[#9ea5a8]">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'}`} />
              <span>{isConnected ? '30 FPS' : 'STANDBY'}</span>
            </div>

            <button
              onClick={() => handleNav('overview')}
              className="px-3.5 py-1.5 rounded-full border border-[rgba(237,231,220,0.22)] hover:border-[#10b981] hover:text-[#10b981] font-['Sora'] text-[10.5px] font-medium tracking-[0.12em] uppercase text-[#ede7dc] transition-all"
            >
              Launch 3D Twin
            </button>
          </div>
        </header>
      ) : (
        /* Apple Retail Navbar: 44px Glass Bar */
        <header className="h-[44px] border-b border-[rgba(0,0,0,0.08)] bg-[rgba(245,245,247,0.8)] backdrop-blur-[20px] backdrop-saturate-[1.8] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50 select-none">
          {/* Apple Wordmark */}
          <div 
            onClick={() => handleNav('landing')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">
              Algor-Algae
            </span>
            <span className="text-[11px] text-[#86868B] bg-[#E8E8ED] px-1.5 py-0.5 rounded-[980px]">
              Twin
            </span>
          </div>

          {/* Apple Nav Links: SF Pro Text, 12px, rationed blue for active */}
          <nav className="hidden sm:flex items-center space-x-6 text-[12px] font-normal text-[#1D1D1F]">
            <button
              onClick={() => handleNav('landing')}
              className="text-[#1D1D1F] hover:text-[#0066CC] transition-colors"
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

            <button
              onClick={() => handleNav('landing')}
              className="btn-apple-primary text-[12px] px-3.5 py-1.5"
            >
              Back to Portal
            </button>
          </div>
        </header>
      )}

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
