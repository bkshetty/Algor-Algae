import React from 'react';
import { Users, Wind, Sun, Activity, Droplet } from 'lucide-react';
import { useStore } from '../store';

export default function TelemetryHUD() {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const ambientLux = useStore((state) => state.ambient_lux);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const status = useStore((state) => state.status);

  const isHealthy = algaeHealth >= 70;
  const isStressed = algaeHealth >= 45 && algaeHealth < 70;
  const healthColor = isHealthy ? 'text-emerald-400' : isStressed ? 'text-amber-400' : 'text-rose-500';
  const healthBg = isHealthy ? 'bg-emerald-500/10 border-emerald-500/30' : isStressed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';
  const progressBg = isHealthy ? 'bg-emerald-500' : isStressed ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 1. Occupancy */}
      <div className="bg-[#111a16]/80 backdrop-blur-md p-3.5 rounded-xl border border-emerald-900/40 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase tracking-wider">Occupancy</span>
          <Users className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-white">{occupancy}</span>
          <span className="text-[11px] text-slate-400 font-mono">person{occupancy !== 1 ? 's' : ''}</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1 flex items-center justify-between">
          <span>YOLOv8n</span>
          <span className="text-sky-400 font-mono">Class 0</span>
        </div>
      </div>

      {/* 2. Indoor CO2 Load */}
      <div className="bg-[#111a16]/80 backdrop-blur-md p-3.5 rounded-xl border border-emerald-900/40 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase tracking-wider">Indoor CO2</span>
          <Wind className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-white">{co2Ppm}</span>
          <span className="text-[11px] text-slate-400 font-mono">ppm</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1 flex items-center justify-between">
          <span>400 + N*150</span>
          <span className={`font-mono ${co2Ppm > 800 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {co2Ppm > 800 ? 'Spike' : 'Normal'}
          </span>
        </div>
      </div>

      {/* 3. Ambient Light Lux */}
      <div className="bg-[#111a16]/80 backdrop-blur-md p-3.5 rounded-xl border border-emerald-900/40 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase tracking-wider">Ambient Light</span>
          <Sun className="w-4 h-4 text-amber-300" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-white">{ambientLux}</span>
          <span className="text-[11px] text-slate-400 font-mono">lux</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1 flex items-center justify-between">
          <span>Grayscale CV</span>
          <span className="text-amber-300 font-mono">
            {ambientLux > 500 ? 'Direct Sun' : 'Diffused'}
          </span>
        </div>
      </div>

      {/* 4. Algae Health Score */}
      <div className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors duration-500 shadow-lg ${healthBg}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">Algae Health</span>
          <Activity className={`w-4 h-4 ${healthColor}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-2xl font-bold font-mono ${healthColor}`}>{algaeHealth.toFixed(1)}%</span>
          <span className="text-[10px] font-mono text-slate-400">{status}</span>
        </div>
        <div className="mt-1.5 w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressBg}`}
            style={{ width: `${Math.max(5, Math.min(100, algaeHealth))}%` }}
          />
        </div>
      </div>

      {/* 5. Biofuel Generation */}
      <div className="bg-[#111a16]/80 backdrop-blur-md p-3.5 rounded-xl border border-emerald-900/40 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase tracking-wider">Biofuel Yield</span>
          <Droplet className="w-4 h-4 text-teal-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-white">{biofuelRate}</span>
          <span className="text-[11px] text-slate-400 font-mono">ml / hr</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1 flex items-center justify-between">
          <span>Lipid Synthesis</span>
          <span className="text-teal-400 font-mono">+{(biofuelRate * 24 / 1000).toFixed(2)} L/d</span>
        </div>
      </div>
    </div>
  );
}
