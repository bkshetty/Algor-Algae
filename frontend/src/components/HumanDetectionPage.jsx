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
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import BuildingTwin from './BuildingTwin';
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

  const [activePreset, setActivePreset] = useState('live');

  const handleSetOccupants = async (count) => {
    setActivePreset(`occ-${count}`);
    await setSimulationOverride(count, algaeHealth < 68);
  };

  const handleResetLive = async () => {
    setActivePreset('live');
    await disableSimulationOverride();
  };

  // HVAC calculations
  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 68;
  const metabolicCo2Added = occupancy * 150;
  const hvacDamperOpenPct = isBypass ? hvacState.damperOpenPct : Math.min(100, 35 + (occupancy * 15));
  const dailyCo2LoadKg = (occupancy * 0.12).toFixed(2);
  const airflowSpargingRate = isBypass ? hvacState.spargingRateLpm : (occupancy * 4.2).toFixed(1);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Top Occupancy Telemetry HUD Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Detected Occupants */}
        <div className="bg-[#0e1626] border border-sky-900/50 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Occupancy Tracked</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">{occupancy}</span>
            <span className="text-xs text-sky-300 font-mono">person{occupancy !== 1 ? 's' : ''} in room</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1.5 animate-ping" />
              YOLOv8n Neural Net
            </span>
            <span className="text-sky-400 font-mono">COCO Class 0</span>
          </div>
        </div>

        {/* Metric 2: Derived Atmospheric CO2 */}
        <div className="bg-[#0e1626] border border-emerald-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Indoor CO2 Concentration</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">{co2Ppm}</span>
            <span className="text-xs text-emerald-400 font-mono">ppm</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Baseline: 400 ppm</span>
            <span className="text-emerald-400 font-bold">+{metabolicCo2Added} ppm breath</span>
          </div>
        </div>

        {/* Metric 3: HVAC Sparging Damper */}
        <div className="bg-[#0e1626] border border-cyan-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">HVAC Damper Valve</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">{hvacDamperOpenPct}%</span>
            <span className="text-xs text-cyan-400 font-mono">{airflowSpargingRate} L/min</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Airflow Direction</span>
            <span className={isBypass ? "text-rose-400 font-bold" : "text-cyan-400 font-medium"}>
              {isBypass ? "Outside Atmosphere (Bypassed)" : "Redirected to Facade"}
            </span>
          </div>
        </div>

        {/* Metric 4: Daily Metabolic Carbon Load */}
        <div className="bg-[#0e1626] border border-teal-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Metabolic Carbon Load</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">{dailyCo2LoadKg}</span>
            <span className="text-xs text-teal-300 font-mono">kg CO₂ / day</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Facade Sequestration</span>
            <span className={isBypass ? "text-amber-400 font-bold" : "text-teal-400 font-bold"}>
              {isBypass ? "Bypassed (Culture Safeguard)" : "100% Absorbed"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split View: 3D Twin (Left) & Vision Feed + Math Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column (7 cols): Working 3D Digital Twin with Human Focus */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          <div className="h-[460px] lg:h-[520px] w-full">
            <BuildingTwin focusMode="human" />
          </div>

          {/* Floor-by-Floor Building Occupancy Distribution Card */}
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center">
                <Building className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
                7-Story Tower Occupancy Distribution & Intake Manifold:
              </span>
              <span className="text-sky-400 text-[11px]">Dynamic Airflow Active</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-1 font-mono text-center">
              {[7, 6, 5, 4, 3, 2, 1].map((floor) => {
                const floorOcc = Math.max(0, Math.ceil((occupancy * (8 - floor)) / 10));
                return (
                  <div key={floor} className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">FL {floor}</span>
                    <span className="text-sm font-bold text-sky-300 mt-1">{floorOcc}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">{400 + floorOcc * 150}ppm</span>
                  </div>
                );
              })}
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
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <Cpu className="w-4 h-4 text-sky-400 mr-2" />
                Real-Time Human CO₂ Derivation Engine
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                ACTIVE
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[11px]">
                Mathematical formula derived from respiratory metabolic volume:
              </div>
              <div className="text-emerald-400 font-bold text-sm bg-black/40 p-2 rounded border border-emerald-900/40 text-center">
                CO₂(ppm) = 400 + ( Occupancy × 150 )
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-400">Ambient Baseline:</span>
                  <div className="text-white font-bold mt-0.5">400 ppm (Clean Air)</div>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-400">Added Metabolic Load:</span>
                  <div className="text-sky-300 font-bold mt-0.5">+{metabolicCo2Added} ppm ({occupancy} pers)</div>
                </div>
              </div>
            </div>

            {/* Quick Demo Simulator for Judges */}
            <div className="pt-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                Hackathon Judge Simulation Controls:
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleSetOccupants(1)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'occ-1'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  1 Person
                </button>
                <button
                  onClick={() => handleSetOccupants(2)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'occ-2'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  2 People
                </button>
                <button
                  onClick={() => handleSetOccupants(4)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'occ-4'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  4 People
                </button>
                <button
                  onClick={handleResetLive}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'live'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Live CV
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
