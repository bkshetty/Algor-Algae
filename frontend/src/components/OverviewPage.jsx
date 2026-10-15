import React from 'react';
import { ArrowRight, Users, Activity, Bot, Wind, Droplet, Sparkles } from 'lucide-react';
import BuildingTwin from './BuildingTwin';
import CameraFeed from './CameraFeed';
import TelemetryHUD from './TelemetryHUD';
import AgentDrawer from './AgentDrawer';
import { useStore } from '../store';

export default function OverviewPage({ onNavigate }) {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Top Telemetry HUD Cards */}
      <TelemetryHUD />

      {/* Main Split View: 3D Twin (Left) & Vision Feed + Agent Drawer (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column (7 cols): 3D Procedural Building Twin */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          <div className="h-[520px] lg:h-[580px] w-full">
            <BuildingTwin focusMode="overview" />
          </div>

          {/* Quick Engine Jump Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
            <button
              onClick={() => onNavigate('human')}
              className="bg-[#0d1626] hover:bg-[#121f36] border border-sky-900/50 p-3 rounded-xl flex items-center justify-between text-left transition-all group shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                    Human Occupancy Engine
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {occupancy} occupants • {co2Ppm} ppm CO₂
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('algae')}
              className="bg-[#0c1813] hover:bg-[#10241b] border border-emerald-900/50 p-3 rounded-xl flex items-center justify-between text-left transition-all group shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    Algae Health & BMS Engine
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {algaeHealth.toFixed(1)}% Health • {biofuelRate} ml/h
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Right Column (5 cols): CV Camera Stream & Gemini Agent Drawer */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          <div className="h-[310px] flex-shrink-0">
            <CameraFeed mode="overview" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <AgentDrawer />
          </div>
        </section>
      </div>
    </div>
  );
}
