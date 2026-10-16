/**
 * OverviewPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Apple Retail "Product-tile whiteout" Design System (apple-design.md):
 * - Flat off-white ground (#F5F5F7) with pure white (#FFFFFF) panels
 * - True black (#000000) edge-to-edge canvas product display tile
 * - Near-black ink (#1D1D1F) for headlines, #86868B for metadata
 * - Single rationed blue (#0071E3) for primary pill actions
 * - Tight SF Pro Display & SF Pro Text typography
 */

import React, { useState } from 'react';
import { 
  Building2, 
  FlaskConical, 
  Wind, 
  Eye, 
  Bot, 
  Sliders, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import BuildingTwin from './BuildingTwin';
import BioreactorTwin from './BioreactorTwin';
import HVACDiagram from './HVACDiagram';
import CameraFeed from './CameraFeed';
import TelemetryHUD from './TelemetryHUD';
import AgentDrawer from './AgentDrawer';
import { useStore } from '../store';

export default function OverviewPage({ onNavigate }) {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const hvacState = useStore((state) => state.hvacState);
  const isConnected = useStore((state) => state.isConnected);

  // Subsystem Stage Mode: 'building' | 'bioreactor' | 'hvac'
  const [twinViewMode, setTwinViewMode] = useState('building');

  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 68;

  return (
    <div className="flex flex-col space-y-6 w-full text-[#1D1D1F] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] select-none">
      
      {/* ══════════════════════════════════════════════════════════════════════
          1. TOP COMMAND BAR & SUBSYSTEM MODE SELECTOR
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[rgba(0,0,0,0.08)]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-medium text-[#86868B] uppercase tracking-[0.06em]">
            <span>Digital Twin Prototype</span>
            <span>·</span>
            <span className="text-[#0071E3] font-medium">BMS Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#1D1D1F] mt-0.5">
            Living Bioreactor Facade Twin
          </h1>
          <p className="text-sm text-[#86868B] mt-1">
            Closed-loop photosynthetic carbon capture and autonomous biological building management.
          </p>
        </div>

        {/* Primary Subsystem View Mode Switcher: Apple Segmented Pill Control */}
        <div className="inline-flex p-1 bg-[#E8E8ED] rounded-[980px] self-start lg:self-center">
          <button
            onClick={() => setTwinViewMode('building')}
            className={`px-4 py-1.5 rounded-[980px] text-xs font-medium transition-all ${
              twinViewMode === 'building'
                ? 'bg-[#FFFFFF] text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            3D Building
          </button>

          <button
            onClick={() => setTwinViewMode('bioreactor')}
            className={`px-4 py-1.5 rounded-[980px] text-xs font-medium transition-all ${
              twinViewMode === 'bioreactor'
                ? 'bg-[#FFFFFF] text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Bioreactor Vessel
          </button>

          <button
            onClick={() => setTwinViewMode('hvac')}
            className={`px-4 py-1.5 rounded-[980px] text-xs font-medium transition-all ${
              twinViewMode === 'hvac'
                ? 'bg-[#FFFFFF] text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            HVAC Schematic
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. REAL-TIME TELEMETRY HUD STRIP (APPLE RETAIL TILES)
         ══════════════════════════════════════════════════════════════════════ */}
      <TelemetryHUD />

      {/* ══════════════════════════════════════════════════════════════════════
          3. MAIN REARRANGED STAGE:
             LEFT: Gen AI 3D Twin & Living Bioreactor (Building / PBR / HVAC)
             RIGHT: Camera Detection Perception & Autonomous Gemini BMS Kernel
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        
        {/* ────────────────────────────────────────────────────────────────────
            PART 1 (LEFT 7 COLS): THE GEN AI 3D TWIN / BIOLOGICAL STAGE
           ──────────────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          
          {/* Subsystem Stage Header Bar */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center space-x-2 text-[#86868B] uppercase tracking-[0.05em] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
              <span className="text-[#1D1D1F] font-semibold">
                {twinViewMode === 'building' && '3D Neoclassical Architectural Twin'}
                {twinViewMode === 'bioreactor' && 'High-Fidelity 3D Photobioreactor Vessel'}
                {twinViewMode === 'hvac' && 'Closed-Loop HVAC Airflow Schematic'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[#86868B] text-[11px] font-mono">
              <span>AIRFLOW LOOP:</span>
              <span className={isBypass ? 'text-[#FF3B30] font-semibold' : 'text-[#34C759] font-semibold'}>
                {isBypass ? 'Outdoor Bypass Vent' : 'Facade Redirection'}
              </span>
            </div>
          </div>

          {/* Interactive Visualizer Canvas Container: Dark Apple Render Tile */}
          <div className="h-[560px] lg:h-[620px] w-full rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-[#000000] relative">
            
            {twinViewMode === 'building' && (
              <BuildingTwin focusMode="overview" />
            )}

            {twinViewMode === 'bioreactor' && (
              <div className="w-full h-full relative">
                <BioreactorTwin />
              </div>
            )}

            {twinViewMode === 'hvac' && (
              <div className="w-full h-full overflow-y-auto p-2 bg-[#F5F5F7]">
                <HVACDiagram />
              </div>
            )}
          </div>

          {/* Bottom Technical Specs Strip: Clean White Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <span className="text-[#86868B] block text-[10.5px] uppercase tracking-wider font-medium">Dimensions</span>
                <span className="text-[#1D1D1F] font-semibold text-sm">41.4m × 34.2m Core</span>
              </div>
              <span className="text-[11px] text-[#86868B]">7-Bay Facade</span>
            </div>

            <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <span className="text-[#86868B] block text-[10.5px] uppercase tracking-wider font-medium">Bioreactors</span>
                <span className="text-[#34C759] font-semibold text-sm">20 Corner Modules</span>
              </div>
              <span className="text-[11px] text-[#86868B]">4 Towers</span>
            </div>

            <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <span className="text-[#86868B] block text-[10.5px] uppercase tracking-wider font-medium">Acid Safeguard</span>
                <span className={isBypass ? 'text-[#FF3B30] font-semibold text-sm' : 'text-[#0071E3] font-semibold text-sm'}>
                  {isBypass ? '< 60ms Actuated' : 'pH ≥ 6.8 Nominal'}
                </span>
              </div>
              <span className="text-[11px] text-[#86868B]">Servo 88%</span>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────
            PART 2 (RIGHT 5 COLS): CAMERA DETECTION & GEMINI BMS KERNEL
           ──────────────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Subsystem Header Bar */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center space-x-2 text-[#86868B] uppercase tracking-[0.05em] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
              <span className="text-[#1D1D1F] font-semibold">
                Vision Perception & Autonomous AI
              </span>
            </div>

            <span className="text-[11px] text-[#86868B] font-mono">
              Zero-Latency Tensor
            </span>
          </div>

          {/* Top Component: Real-Time Camera Detection + Judge Triggers */}
          <div className="flex-shrink-0">
            <CameraFeed mode="overview" />
          </div>

          {/* Bottom Component: Autonomous Gemini BMS Agent Log & ESG Audit */}
          <div className="flex-1 min-h-[300px]">
            <AgentDrawer />
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. BOTTOM ARCHITECTURAL BENCHMARKS (APPLE SPEC TILES)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[#86868B] font-medium">
              System Specifications
            </div>
            <h2 className="text-xl font-semibold text-[#1D1D1F] mt-0.5 tracking-[-0.01em]">
              Autonomous Building Performance Benchmarks
            </h2>
          </div>
          <span className="text-xs text-[#86868B] font-mono">
            Chlorella vulgaris Symbiosis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#86868B] text-[11px] uppercase font-medium">Spectrophotometry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            </div>
            <div className="text-lg font-semibold text-[#1D1D1F] tracking-[-0.01em]">
              520nm / 580nm
            </div>
            <p className="text-[12px] text-[#86868B] leading-relaxed">
              OpenCV ROI evaluates chlorophyll-a peak vs carotenoids to detect chlorosis onset before cell death.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#86868B] text-[11px] uppercase font-medium">Edge Perception</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
            </div>
            <div className="text-lg font-semibold text-[#1D1D1F] tracking-[-0.01em]">
              YOLOv8 Nano
            </div>
            <p className="text-[12px] text-[#86868B] leading-relaxed">
              Real-time occupant bounding boxes correlate directly with indoor CO₂ surges via mathematical modeling.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#86868B] text-[11px] uppercase font-medium">Damper Actuation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
            </div>
            <div className="text-lg font-semibold text-[#1D1D1F] tracking-[-0.01em]">
              &lt; 60ms Motorized Servo
            </div>
            <p className="text-[12px] text-[#86868B] leading-relaxed">
              3-way damper redirects 88% air into spargers during occupancy spikes, or bypasses outside during culture stress.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#86868B] text-[11px] uppercase font-medium">Carbon Sequestration</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            </div>
            <div className="text-lg font-semibold text-[#1D1D1F] tracking-[-0.01em]">
              88% Peak Capture
            </div>
            <p className="text-[12px] text-[#86868B] leading-relaxed">
              Transforms breath waste into continuous biofuel and pure O₂, verified via cryptographic ESG reports.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
