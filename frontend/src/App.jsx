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

  return (
    <div className="min-h-screen bg-[#060a12] text-[#ede7dc] flex flex-col font-['Sora'] selection:bg-[#10b981] selection:text-black">
      {/* 58px Fixed Translucent Navigation Bar */}
      <header className="h-[58px] border-b border-[rgba(237,231,220,0.13)] bg-[rgba(13,21,34,0.75)] backdrop-blur-[16px] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        {/* Wordmark (15px Syne 700 uppercase with green trailing dot, 12px on mobile) */}
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

        {/* Links (10.5px Sora 500 uppercase letter-spacing 0.12em) */}
        <nav className="hidden sm:flex items-center space-x-5 lg:space-x-7 font-['Sora'] text-[10.5px] uppercase font-medium tracking-[0.12em]">
          <button
            onClick={() => handleNav('landing')}
            className={`transition-colors py-1 ${
              activePage === 'landing' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc] hover:text-[#10b981]'
            }`}
          >
            Portal
          </button>

          <button
            onClick={() => handleNav('overview')}
            className={`transition-colors py-1 ${
              activePage === 'overview' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc] hover:text-[#10b981]'
            }`}
          >
            3D Twin
          </button>

          <button
            onClick={() => handleNav('human')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              activePage === 'human' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc] hover:text-[#10b981]'
            }`}
          >
            <span>Occupancy</span>
            <span className="font-mono text-[9.5px] px-1 rounded border border-[rgba(237,231,220,0.15)] text-[#9ea5a8]">
              {occupancy}
            </span>
          </button>

          <button
            onClick={() => handleNav('algae')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              activePage === 'algae' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc] hover:text-[#10b981]'
            }`}
          >
            <span>Algae Health</span>
            <span className="font-mono text-[9.5px] px-1 rounded border border-[rgba(16,185,129,0.3)] text-[#10b981]">
              {algaeHealth.toFixed(0)}%
            </span>
          </button>

          <button
            onClick={() => handleNav('hvac')}
            className={`transition-colors py-1 ${
              activePage === 'hvac' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc] hover:text-[#10b981]'
            }`}
          >
            HVAC Schematic
          </button>
        </nav>

        {/* Right Controls: Pill CTA Button & Mobile Hamburger */}
        <div className="flex items-center space-x-3">
          <div className="hidden xl:flex items-center space-x-2 font-mono text-[10px] text-[#9ea5a8]">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'}`} />
            <span>{isConnected ? '30 FPS' : 'STANDBY'}</span>
          </div>

          <button
            onClick={() => handleNav(activePage === 'overview' ? 'landing' : 'overview')}
            className="px-3.5 py-1.5 rounded-full border border-[rgba(237,231,220,0.22)] hover:border-[#10b981] hover:text-[#10b981] font-['Sora'] text-[10.5px] font-medium tracking-[0.12em] uppercase text-[#ede7dc] transition-all"
          >
            {activePage === 'overview' ? 'View Portal' : 'Explore Twin'}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 rounded text-[#ede7dc] hover:text-[#10b981] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#090f19] border-b border-[rgba(237,231,220,0.13)] px-6 py-4 space-y-3 z-40 fixed top-[58px] left-0 right-0 shadow-2xl">
          <button
            onClick={() => handleNav('landing')}
            className={`block w-full text-left py-2 font-['Sora'] text-xs uppercase tracking-[0.12em] ${
              activePage === 'landing' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc]'
            }`}
          >
            Portal Landing
          </button>
          <button
            onClick={() => handleNav('overview')}
            className={`block w-full text-left py-2 font-['Sora'] text-xs uppercase tracking-[0.12em] ${
              activePage === 'overview' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc]'
            }`}
          >
            3D Digital Twin
          </button>
          <button
            onClick={() => handleNav('human')}
            className={`block w-full text-left py-2 font-['Sora'] text-xs uppercase tracking-[0.12em] ${
              activePage === 'human' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc]'
            }`}
          >
            Occupancy Perception ({occupancy})
          </button>
          <button
            onClick={() => handleNav('algae')}
            className={`block w-full text-left py-2 font-['Sora'] text-xs uppercase tracking-[0.12em] ${
              activePage === 'algae' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc]'
            }`}
          >
            Algae Bio-Health ({algaeHealth.toFixed(0)}%)
          </button>
          <button
            onClick={() => handleNav('hvac')}
            className={`block w-full text-left py-2 font-['Sora'] text-xs uppercase tracking-[0.12em] ${
              activePage === 'hvac' ? 'text-[#10b981] font-semibold' : 'text-[#ede7dc]'
            }`}
          >
            HVAC 2D Schematic
          </button>
        </div>
      )}

      {/* Main Systematic Multi-View Container: full-bleed for landing, padded for operational dashboard */}
      <main className={`flex-1 flex flex-col w-full ${activePage === 'landing' ? 'p-0 max-w-none' : 'p-4 lg:p-6 max-w-[1850px] mx-auto'}`}>
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
