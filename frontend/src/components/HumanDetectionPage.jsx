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
      {/* Top Occupancy Telemetry HUD Header - Apple Retail Product Specification Tiles */}
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
            <Wind className="w-4 h-4 text-[#34C759]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{co2Ppm}</span>
            <span className="text-xs text-[#86868B] font-medium">ppm</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Base: 400 ppm</span>
            <span className="text-[#34C759] font-medium">+{metabolicCo2Added} ppm breath</span>
          </div>
        </div>

        {/* Metric 3: HVAC Sparging Damper */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">HVAC Damper Valve</span>
            <Activity className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{hvacDamperOpenPct}%</span>
            <span className="text-xs text-[#86868B] font-medium">{airflowSpargingRate} L/min</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Airflow Loop</span>
            <span className={isBypass ? "text-[#FF3B30] font-semibold" : "text-[#0071E3] font-medium"}>
              {isBypass ? "Outside (Bypassed)" : "Redirected to Facade"}
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
            <span>Sequestration</span>
            <span className={isBypass ? "text-[#FF9500] font-semibold" : "text-[#34C759] font-semibold"}>
              {isBypass ? "Culture Safeguard" : "100% Absorbed"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split View: 3D Twin (Left) & Vision Feed + Math Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column (7 cols): Working 3D Digital Twin with Human Focus */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          <div className="h-[460px] lg:h-[520px] w-full rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-[#000000]">
            <BuildingTwin focusMode="human" />
          </div>

          {/* Floor-by-Floor Building Occupancy Distribution Card */}
          <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1D1D1F] font-semibold flex items-center">
                <Building className="w-4 h-4 text-[#0071E3] mr-1.5" />
                7-Story Tower Occupancy Distribution & Intake Manifold
              </span>
              <span className="text-[#0071E3] text-[11px] font-medium bg-[#E8F2FD] px-2 py-0.5 rounded-[980px]">
                Dynamic Airflow Active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-1 text-center">
              {[7, 6, 5, 4, 3, 2, 1].map((floor) => {
                const floorOcc = Math.max(0, Math.ceil((occupancy * (8 - floor)) / 10));
                return (
                  <div key={floor} className="bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] p-2.5 rounded-xl flex flex-col items-center">
                    <span className="text-[10px] font-medium text-[#86868B]">FL {floor}</span>
                    <span className="text-base font-semibold text-[#1D1D1F] mt-0.5">{floorOcc}</span>
                    <span className="text-[10px] text-[#86868B] font-mono mt-0.5">{400 + floorOcc * 150}ppm</span>
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
                  <div className="text-[#0071E3] font-semibold mt-0.5">+{metabolicCo2Added} ppm ({occupancy} pers)</div>
                </div>
              </div>
            </div>

            {/* Quick Demo Simulator for Judges */}
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2 flex items-center">
                <Zap className="w-3.5 h-3.5 text-[#0071E3] mr-1.5" />
                Hackathon Judge Simulation Controls:
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleSetOccupants(1)}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'occ-1'
                      ? 'btn-apple-primary'
                      : 'btn-apple-secondary'
                  }`}
                >
                  1 Person
                </button>
                <button
                  onClick={() => handleSetOccupants(2)}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'occ-2'
                      ? 'btn-apple-primary'
                      : 'btn-apple-secondary'
                  }`}
                >
                  2 People
                </button>
                <button
                  onClick={() => handleSetOccupants(4)}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'occ-4'
                      ? 'btn-apple-primary'
                      : 'btn-apple-secondary'
                  }`}
                >
                  4 People
                </button>
                <button
                  onClick={handleResetLive}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'live'
                      ? 'bg-[#34C759] text-white'
                      : 'btn-apple-secondary'
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
