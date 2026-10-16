import React, { useState } from 'react';
import { 
  Users, 
  Wind, 
  Activity, 
  Zap, 
  Layers, 
  TrendingUp, 
  Cpu, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Radio,
  RefreshCw
} from 'lucide-react';
import HVACDiagram from './HVACDiagram';
import CameraFeed from './CameraFeed';
import { useStore } from '../store';
import { setSimulationOverride, disableSimulationOverride } from '../utils/websocket';

export default function HumanDetectionPage() {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const algaeHealth = useStore((state) => state.algae_health);
  const isConnected = useStore((state) => state.isConnected);
  const isSynthetic = useStore((state) => state.isSynthetic);
  const hvacState = useStore((state) => state.hvacState);
  const triggerHvac = useStore((state) => state.triggerHvacScenario);

  const [activePreset, setActivePreset] = useState('live');

  const handleSetOccupants = async (count, yellowCrisis = false) => {
    setActivePreset(yellowCrisis ? 'crisis' : `occ-${count}`);
    await setSimulationOverride(count, yellowCrisis);
    if (yellowCrisis) {
      triggerHvac('bypass');
    } else {
      triggerHvac('redirect');
    }
  };

  const handleResetLive = async () => {
    setActivePreset('live');
    await disableSimulationOverride();
    triggerHvac('auto');
  };

  // Biological Cause-and-Effect Pipeline State
  // Green Algae (health >= 45%): Air redirects to bioreactor (damper opens to 85%)
  // Yellow/Unhealthy Algae (<45%): Air redirects to exhausts outside (damper clamps to 15%)
  const isAlgaeGreen = algaeHealth >= 45.0 && hvacState.activeLoop !== 'roof_bypass';
  const isBypass = !isAlgaeGreen;
  const isCrisis = !isAlgaeGreen;
  const metabolicCo2Added = occupancy * 150;
  const hvacDamperOpenPct = isAlgaeGreen ? (hvacState.damperOpenPct || 85) : 15;
  const dailyCo2LoadKg = (occupancy * 0.12).toFixed(2);
  const airflowSpargingRate = isAlgaeGreen ? (hvacState.spargingRateLpm ? Number(hvacState.spargingRateLpm).toFixed(1) : '26.0') : '2.5';

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Top Occupancy & HVAC Telemetry HUD Header - Apple Retail Specification Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Detected Occupants */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Occupancy Tracked</span>
            <Users className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{occupancy}</span>
            <span className="text-xs text-[#86868B] font-medium">person{occupancy !== 1 ? 's' : ''} in room</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] mr-1.5 animate-pulse" />
              YOLOv8n Neural Net
            </span>
            <span className="text-[#0071E3] font-medium text-[10px] bg-[#E8F2FD] px-1.5 py-0.5 rounded-[980px]">Class 0</span>
          </div>
        </div>

        {/* Metric 2: Derived Atmospheric CO2 */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Indoor CO₂ Level</span>
            <Wind className="w-4 h-4 text-[#FF9500]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-[#FF9500] tracking-tight">{co2Ppm}</span>
            <span className="text-xs text-[#86868B] font-medium">ppm</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Base: 400 ppm</span>
            <span className="text-[#FF9500] font-medium">+{metabolicCo2Added} ppm breath</span>
          </div>
        </div>

        {/* Metric 3: HVAC Sparging Damper */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">HVAC Damper Valve</span>
            <Activity className={`w-4 h-4 ${isAlgaeGreen ? 'text-[#34C759]' : 'text-[#FF3B30]'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-3xl font-semibold tracking-tight ${isAlgaeGreen ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
              {hvacDamperOpenPct}%
            </span>
            <span className="text-xs text-[#86868B] font-medium">{airflowSpargingRate} L/min</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Active Pipeline</span>
            <span className={`font-semibold ${isAlgaeGreen ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
              {isAlgaeGreen ? "85% Facade Fuel Redirected" : "85% Outside Exhaust"}
            </span>
          </div>
        </div>

        {/* Metric 4: Daily Metabolic Carbon Load */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Metabolic Carbon Load</span>
            <TrendingUp className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{dailyCo2LoadKg}</span>
            <span className="text-xs text-[#86868B] font-medium">kg CO₂ / day</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Biological Loop</span>
            <span className={isAlgaeGreen ? "text-[#34C759] font-semibold" : "text-[#FF3B30] font-semibold"}>
              {isAlgaeGreen ? "Photosynthetic Feed (Bioreactor)" : "Acidification Shield (Exhausts)"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split View: HVAC System Diagram (Left) & Vision Feed + Math Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column (7 cols): Full 2D HVAC System Layout replacing the 3D building */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          {/* 2D HVAC System Layout & Bio-Redirection Flow */}
          <div className="w-full">
            <HVACDiagram
              defaultView="schematic"
              defaultState="live"
              compact={true}
              showHeader={true}
            />
          </div>

          {/* Biological Cause-and-Effect Architecture Summary Card */}
          <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2.5">
              <span className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#0071E3]" />
                Biological Cause-and-Effect Redirection Rules
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[980px] bg-[#E8F2FD] text-[#0071E3]">
                GEMINI AI BMS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Pipeline 1 Rule Box */}
              <div className={`p-3 rounded-xl border transition-all ${
                isAlgaeGreen
                  ? 'bg-[#E8F8EE] border-[#34C759]/40 ring-1 ring-[#34C759]/20'
                  : 'bg-[#F5F5F7] border-[rgba(0,0,0,0.04)]'
              }`}>
                <div className="flex items-center gap-1.5 text-[#34C759] font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>1. "Feed the Algae" Pipeline (Bioreactor Redirect)</span>
                </div>
                <div className="text-[11px] text-[#86868B] mt-1 space-y-1">
                  <p><strong className="text-[#1D1D1F]">Trigger:</strong> Algae is Green (health &ge; 45%).</p>
                  <p><strong className="text-[#1D1D1F]">Logic:</strong> CO₂ = 400 + 150ppm/person.</p>
                  <p><strong className="text-[#1D1D1F]">Action:</strong> Air redirected to algae bioreactor (85% damper).</p>
                  <p><strong className="text-[#34C759]">Visual:</strong> Glowing emerald & orange <span className="font-semibold">"HUMAN CO₂ RETURN AIR"</span> fuels facade.</p>
                </div>
              </div>

              {/* Pipeline 2 Rule Box */}
              <div className={`p-3 rounded-xl border transition-all ${
                !isAlgaeGreen
                  ? 'bg-[#FFF2F2] border-[#FF3B30]/40 ring-1 ring-[#FF3B30]/20'
                  : 'bg-[#F5F5F7] border-[rgba(0,0,0,0.04)]'
              }`}>
                <div className="flex items-center gap-1.5 text-[#FF3B30] font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>2. "Acidification Bypass" Pipeline (Outdoor Exhaust)</span>
                </div>
                <div className="text-[11px] text-[#86868B] mt-1 space-y-1">
                  <p><strong className="text-[#1D1D1F]">Trigger:</strong> OpenCV detects yellow pixels (&lt;45% health).</p>
                  <p><strong className="text-[#1D1D1F]">Logic:</strong> Sick algae cannot process CO₂ → Lethal carbonic acid (pH &lt; 6.8).</p>
                  <p><strong className="text-[#1D1D1F]">Action:</strong> Air redirected to exhausts (85% outside vent, 15% clamp).</p>
                  <p><strong className="text-[#FF3B30]">Visual:</strong> Pulsing crimson <span className="font-semibold">"ALGAE COLLAPSE BYPASS SHUNT"</span> vents to rooftop.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (5 cols): YOLOv8 Real-time Camera Feed & Derivation Breakdown */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          {/* Vision Feed Container */}
          <div className="h-[310px] flex-shrink-0">
            <CameraFeed mode="human" />
          </div>

          {/* Mathematical CO2 Derivation Card */}
          <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2.5">
              <h4 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider flex items-center">
                <Cpu className="w-4 h-4 text-[#0071E3] mr-2" />
                Human CO₂ Derivation Engine
              </h4>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-[980px] bg-[#E8F2FD] text-[#0071E3]">
                ACTIVE
              </span>
            </div>

            <div className="bg-[#F5F5F7] rounded-xl p-3.5 text-xs space-y-2.5 border border-[rgba(0,0,0,0.04)]">
              <div className="text-[#86868B] text-[11px]">
                Mathematical formula derived from human respiratory metabolic volume:
              </div>
              <div className="text-[#1D1D1F] font-semibold text-sm bg-white p-2.5 rounded-lg border border-[rgba(0,0,0,0.06)] text-center shadow-sm">
                CO₂(ppm) = 400 + ( Occupancy × 150 )
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-[rgba(0,0,0,0.06)]">
                  <span className="text-[#86868B] text-[10px] uppercase font-semibold">Ambient Baseline:</span>
                  <div className="text-[#1D1D1F] font-semibold mt-0.5">400 ppm (Clean Air)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[rgba(0,0,0,0.06)]">
                  <span className="text-[#86868B] text-[10px] uppercase font-semibold">Added Metabolic Load:</span>
                  <div className="text-[#FF9500] font-semibold mt-0.5">+{metabolicCo2Added} ppm ({occupancy} pers)</div>
                </div>
              </div>
            </div>

            {/* Quick Demo Simulator for Judges */}
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center">
                  <Zap className="w-3.5 h-3.5 text-[#0071E3] mr-1.5" />
                  Hackathon Judge Simulation Controls:
                </span>
                <span className="text-[10px] text-[#86868B]">1-Click Verification</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSetOccupants(1, false)}
                  className={`text-xs py-2 px-3 rounded-xl font-medium transition-all ${
                    activePreset === 'occ-1'
                      ? 'btn-apple-primary'
                      : 'btn-apple-secondary'
                  }`}
                >
                  1 Person (Baseline)
                </button>
                <button
                  onClick={() => handleSetOccupants(4, false)}
                  className={`text-xs py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1 ${
                    activePreset === 'occ-4'
                      ? 'bg-[#FF9500] text-white shadow-sm'
                      : 'btn-apple-secondary'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Feed Algae (4 Pers)</span>
                </button>
                <button
                  onClick={() => handleSetOccupants(4, true)}
                  className={`text-xs py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1 ${
                    activePreset === 'crisis'
                      ? 'bg-[#FF3B30] text-white shadow-sm'
                      : 'btn-apple-secondary border-[#FF3B30]/30 text-[#FF3B30]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Yellow Crisis (&lt;45%)</span>
                </button>
                <button
                  onClick={handleResetLive}
                  className={`text-xs py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1 ${
                    activePreset === 'live'
                      ? 'bg-[#34C759] text-white shadow-sm'
                      : 'btn-apple-secondary'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Live CV Camera</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
