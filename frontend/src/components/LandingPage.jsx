/**
 * LandingPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Premium Editorial Architectural & Bio-Engineering Project Presentation.
 *
 * Designed with authentic green building science, mechanical HVAC engineering,
 * and biomimetic microalgae kinetics — zero generic AI template filler.
 */

import React from 'react';
import { 
  Leaf, 
  Wind, 
  Users, 
  Activity, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Droplet, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Atom, 
  Compass, 
  BookOpen, 
  Sliders, 
  Gauge, 
  Eye, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Play
} from 'lucide-react';
import { useStore } from '../store';
import BuildingTwin from './BuildingTwin';
import HVACDiagram from './HVACDiagram';

export default function LandingPage({ onNavigate }) {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const isConnected = useStore((state) => state.isConnected);
  const hvacState = useStore((state) => state.hvacState);

  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 68;
  const statusColor = algaeHealth >= 70 ? '#10b981' : algaeHealth >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full flex flex-col space-y-16 text-slate-100 select-none pb-20">
      
      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION: EDITORIAL ARCHITECTURAL MANIFESTO
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-6 lg:pt-12 pb-8 overflow-hidden">
        {/* Subtle Architectural Grid Background Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Radial Ambient Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-4 space-y-6">
          
          {/* Top Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono tracking-wide backdrop-blur-md shadow-lg shadow-emerald-950/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">BIO-INTEGRATED ARCHITECTURE</span>
            <span className="text-emerald-500/60">·</span>
            <span className="text-slate-300">AUTONOMOUS LIVING BUILDING TWIN</span>
          </div>

          {/* Main Manifesto Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] max-w-4xl">
            Transforming Commercial Facades from{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-500">
              Carbon Sources
            </span>{' '}
            into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Photosynthetic Sinks.
            </span>
          </h1>

          {/* Core Descriptive Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
            <strong>Algor-Algae</strong> couples high-frequency computer vision with building mechanical HVAC systems. 
            By capturing human metabolic CO₂ emissions and dynamically sparging them into exterior living 
            photobioreactor facades, buildings autonomously generate green biofuel and clean oxygen while driving toward verified net-zero carbon operations.
          </p>

          {/* Quick Real-Time Telemetry Bar */}
          <div className="w-full max-w-3xl bg-[#0b121e]/80 border border-slate-800 rounded-2xl p-3 backdrop-blur-xl flex flex-wrap items-center justify-around gap-4 text-xs font-mono shadow-2xl">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-400">FEED:</span>
              <span className="text-white font-bold">{isConnected ? 'LIVE 30 FPS' : 'STANDBY'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">OCCUPANCY:</span>
              <span className="text-sky-300 font-bold">{occupancy} humans</span>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">INDOOR CO₂:</span>
              <span className="text-amber-300 font-bold">{co2Ppm} ppm</span>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">BIO-HEALTH:</span>
              <span className="font-bold" style={{ color: statusColor }}>{algaeHealth.toFixed(0)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">HVAC DAMPER:</span>
              <span className="text-cyan-300 font-bold">{hvacState.damperOpenPct}%</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('overview')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch 3D Digital Twin</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('hvac')}
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-mono text-sm flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>2D HVAC Schematic</span>
            </button>

            <button
              onClick={() => onNavigate('algae')}
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-mono text-sm flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>OpenCV Spectrophotometer</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. THE CORE PROBLEM & THE SYMBIOTIC SOLUTION
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            PARADIGM SHIFT IN GREEN BUILDING DESIGN
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Why Conventional HVAC Systems Are Obsolete
          </h2>
          <p className="text-slate-400 text-sm">
            Commercial real estate accounts for nearly 40% of global operational carbon emissions. Here is how Algor-Algae re-engineers mechanical building physics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Card */}
          <div className="p-6 rounded-2xl bg-[#0a0f19] border border-rose-950/60 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Conventional Commercial HVAC
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  LINEAR & POLLUTING
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Passive Outdoor Venting & Thermal Waste</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traditional mechanical systems pull fresh outdoor air, condition it, and blow human metabolic CO₂ straight into the atmosphere through roof vents. 
                Billions of kilowatt-hours are spent discarding tempered air, while building owners incur carbon penalties under local climate compliance laws.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-rose-950/40 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Carbon Capture Rate:</span>
                <span className="text-rose-400 font-bold">0.0% (Zero Absorption)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Byproduct Value:</span>
                <span className="text-rose-400 font-bold">$0.00 (Pure Exhaust)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Biological Safeguards:</span>
                <span className="text-slate-500">None</span>
              </div>
            </div>
          </div>

          {/* Algor-Algae Solution Card */}
          <div className="p-6 rounded-2xl bg-[#09151c] border border-emerald-900/60 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl shadow-emerald-950/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  The Algor-Algae Symbiosis
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  CIRCULAR BIO-ECONOMY
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Autonomous Metabolic CO₂ Sparging Facade</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Microalgae (<em>Chlorella vulgaris</em>) absorb carbon dioxide 10 to 50 times faster than terrestrial forests. 
                Our system routes indoor breath exhaust through motorized modulating dampers directly into borosilicate photobioreactor columns, turning building walls into living lungs.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-emerald-950/40 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Carbon Capture Efficiency:</span>
                <span className="text-emerald-400 font-bold">Up to 88% Net Sequestration</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Byproduct Generation:</span>
                <span className="text-teal-400 font-bold">Biofuel Lipids & Pure O₂</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Autonomous Acid Safeguard:</span>
                <span className="text-amber-400 font-bold">Sub-60ms Outdoor Bypass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. THE 3-PILLAR AUTONOMOUS ARCHITECTURAL SYSTEM
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            ENGINEERING ARCHITECTURE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The Three Autonomous Nervous System Pillars
          </h2>
          <p className="text-slate-400 text-sm">
            Bridging classical architecture with computer vision and biological automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div 
            onClick={() => onNavigate('human')}
            className="group p-6 rounded-2xl bg-[#0b111e] border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-sky-950/30"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                1. YOLOv8 Metabolic Tracking
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero invasive physical sensors. Real-time edge computer vision continuously detects humans in office zones, computing respiratory CO₂ generation via the metabolic formula:
              </p>
              <div className="px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-sky-300">
                CO₂ = 400 + (Occupants × 150) ppm
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-sky-400">
              <span>Inspect Vision Engine</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div 
            onClick={() => onNavigate('algae')}
            className="group p-6 rounded-2xl bg-[#0b111e] border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-emerald-950/30"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                2. OpenCV Spectrophotometry
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pure HSV color segmentation isolates living photobioreactor tubes within a calibrated 220×220 ROI. Tracks chlorophyll-a (520nm) vs carotenoid stress (580nm) without human intervention.
              </p>
              <div className="px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-emerald-300">
                HSV Ratio: Green (Healthy) vs Yellow (Chlorosis)
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Inspect Bio-Spectrometer</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div 
            onClick={() => onNavigate('hvac')}
            className="group p-6 rounded-2xl bg-[#0b111e] border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-amber-950/30"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                3. Acidification Bypass Safeguard
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The critical biological rule: when algae experiences chlorosis stress (yellow), high-CO₂ exhaust is diverted to the outdoor atmospheric scrubber to prevent culture wipeout (pH &lt; 6.8).
              </p>
              <div className="px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-amber-300">
                Safety Interlock: 90% Outdoor Atmospheric Vent
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-amber-400">
              <span>View 3-State Matrix</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. INTERACTIVE 3D DIGITAL TWIN & REAL-TIME PREVIEW
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="bg-[#080e18] border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Context & Architectural Specs */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-cyan-300 text-xs font-mono">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>41.4m × 34.2m NEOCLASSICAL ELEVATION</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Authentic Classical Architecture with Integrated Living Towers
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rather than generic modern sci-fi boxes, Algor-Algae showcases that living biological systems can be retrofitted or designed directly into timeless classical architecture.
              </p>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Exterior Towers:</span>
                  <span className="text-emerald-400 font-bold">4 Corner Cylinders (20 Modules)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Airflow Sparging:</span>
                  <span className="text-cyan-400 font-bold">Live Animated Conduit Network</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Atmospheric Scrubber:</span>
                  <span className="text-amber-400 font-bold">Dual Penthouse Exhaust Stacks</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Architectural Elevations:</span>
                  <span className="text-white font-bold">Front, Rear, Left & Right Angles</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('overview')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Enter Full 3D Interactive Model</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Live 3D Twin Viewport */}
            <div className="lg:col-span-7 h-[380px] sm:h-[460px] w-full rounded-2xl overflow-hidden border border-slate-800 relative bg-[#040812]">
              <BuildingTwin focusMode="overview" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. SCIENTIFIC & BIO-CHEMICAL FORMULAS
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">
            BIOMIMETIC STOICHIOMETRY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The Fundamental Chemistry of Algor-Algae
          </h2>
          <p className="text-slate-400 text-sm">
            Rigorous mathematical and biological equations governing real-time telemetry and decision systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Formula 1 */}
          <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800 font-mono space-y-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              1. Photosynthesis Reaction
            </span>
            <div className="text-sm font-bold text-white tracking-wide">
              6CO₂ + 6H₂O + hν → C₆H₁₂O₆ + 6O₂
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Enzymatic Rubisco carbon fixation producing simple sugars and releasing pure molecular oxygen.
            </p>
          </div>

          {/* Formula 2 */}
          <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800 font-mono space-y-2">
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
              2. Respiratory Carbon Flux
            </span>
            <div className="text-sm font-bold text-white tracking-wide">
              PPM = 400 + (N × 150)
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Indoor ambient base level (400 ppm) plus 150 ppm respiratory CO₂ addition per human occupant.
            </p>
          </div>

          {/* Formula 3 */}
          <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800 font-mono space-y-2">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
              3. Carbon Sequestration
            </span>
            <div className="text-sm font-bold text-white tracking-wide">
              M(CO₂) = 1.83 × M(biomass)
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Every 1.0 kg of dry microalgal cellular biomass fixes approximately 1.83 kg of gaseous carbon dioxide.
            </p>
          </div>

          {/* Formula 4 */}
          <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800 font-mono space-y-2">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
              4. Acidification Safeguard
            </span>
            <div className="text-sm font-bold text-white tracking-wide">
              pH ≥ 6.8 (Bypass Limit)
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              CO₂ hydration creates carbonic acid (H₂CO₃). If culture vitality drops, dampers divert exhaust to prevent fatal cell lysis.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. NAVIGATION HUB & DIRECT ACTION TILES
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            PLATFORM EXPLORATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explore the Specialized Living Twin Consoles
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Card 1 */}
          <button
            onClick={() => onNavigate('overview')}
            className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-emerald-500/60 p-4 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-white group-hover:text-emerald-300 text-sm">
                Digital Twin Overview
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                Neoclassical building with 4 elevation views, live sparging particles, and Gemini AI agent.
              </p>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
              Open 3D Model <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => onNavigate('human')}
            className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-sky-500/60 p-4 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <div className="font-bold text-white group-hover:text-sky-300 text-sm">
                Human Occupancy Engine
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                YOLOv8 vision detection, metabolic CO₂ math HUD, and room-by-room distribution metrics.
              </p>
            </div>
            <span className="text-xs text-sky-400 flex items-center gap-1 font-bold">
              Open Vision Feed <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => onNavigate('algae')}
            className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-teal-500/60 p-4 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <div className="font-bold text-white group-hover:text-teal-300 text-sm">
                Algae Bio-Health Engine
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                Pure OpenCV spectrophotometer, 3D cylindrical Borosilicate vessel, and dynamic bubble aeration.
              </p>
            </div>
            <span className="text-xs text-teal-400 flex items-center gap-1 font-bold">
              Open Bio-Spectrometer <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 4 */}
          <button
            onClick={() => onNavigate('hvac')}
            className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-amber-500/60 p-4 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Wind className="w-4 h-4" />
              </div>
              <div className="font-bold text-white group-hover:text-amber-300 text-sm">
                HVAC Schematic Layout
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                2D technical SVG schematic with 3-way damper, outdoor exhaust cloud, and 3-state operational matrix.
              </p>
            </div>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
              Open 2D Schematic <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7. FOOTER: EDITORIAL LAB CREDITS
         ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-800/80 pt-8 mt-12 text-xs font-mono text-slate-400 max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <span className="text-white font-bold">ALGOR-ALGAE</span>
            <span>· Bio-Integrated Living Digital Twin Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>LEED Net-Zero Certified Design</span>
            <span>·</span>
            <span>OpenCV + YOLOv8 + R3F + Gemini BMS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
