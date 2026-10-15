import React, { useState } from 'react';
import { Camera, Users, AlertTriangle, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { useStore } from '../store';
import { setSimulationOverride, disableSimulationOverride } from '../utils/websocket';

export default function CameraFeed() {
  const frameBase64 = useStore((state) => state.webcam_frame_base64);
  const isConnected = useStore((state) => state.isConnected);
  const isSynthetic = useStore((state) => state.isSynthetic);
  const occupancy = useStore((state) => state.occupancy);
  const algaeHealth = useStore((state) => state.algae_health);

  const [activeTestMode, setActiveTestMode] = useState('live');

  const handleSimulateOccupants = async (count) => {
    setActiveTestMode(`occ-${count}`);
    await setSimulationOverride(count, algaeHealth < 50);
  };

  const handleSimulateYellowCrisis = async () => {
    setActiveTestMode('crisis');
    await setSimulationOverride(occupancy, true);
  };

  const handleSimulateGreenCulture = async () => {
    setActiveTestMode('healthy');
    await setSimulationOverride(occupancy, false);
  };

  const handleResetToLive = async () => {
    setActiveTestMode('live');
    await disableSimulationOverride();
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1320] border border-slate-800/80 rounded-2xl p-4 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Vision Telemetry Feed
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-mono text-slate-400">
            {isConnected ? (isSynthetic ? 'SYNTHETIC CV FEED' : 'LIVE 30 FPS STREAM (ZERO-LAG)') : 'OFFLINE (RECONNECTING)'}
          </span>
        </div>
      </div>

      {/* Video / Annotated Canvas Container */}
      <div className="relative mt-3 flex-1 min-h-[260px] bg-black rounded-xl overflow-hidden border border-slate-700/60 flex items-center justify-center">
        {frameBase64 ? (
          <img
            src={frameBase64}
            alt="Real-time Computer Vision Annotated Stream"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs font-mono text-slate-400">
              Connecting to Python Computer Vision Server...<br />
              Ensure <code className="text-emerald-400">python main.py</code> is running on port 8000.
            </p>
          </div>
        )}

        {/* Floating Watermark / Instructions */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[11px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 pointer-events-none">
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>YOLOv8: {occupancy} human{occupancy !== 1 ? 's' : ''} detected</span>
          </div>
          <div className="text-emerald-400">
            Hold green/yellow in top-right ROI
          </div>
        </div>
      </div>

      {/* Quick Demo Controls for Hackathon Judges */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center">
            <Zap className="w-3 h-3 text-amber-400 mr-1" /> Hackathon Demo Triggers:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Mode: {activeTestMode}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleSimulateOccupants(3)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeTestMode === 'occ-3'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            +2 Humans (850ppm)
          </button>
          <button
            onClick={handleSimulateYellowCrisis}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeTestMode === 'crisis'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            Yellow Crisis (40%)
          </button>
          <button
            onClick={handleSimulateGreenCulture}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeTestMode === 'healthy'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            Restore Culture (95%)
          </button>
          <button
            onClick={handleResetToLive}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeTestMode === 'live'
                ? 'bg-emerald-500/20 border-emerald-400 text-slate-200'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/60'
            }`}
          >
            Live Webcam
          </button>
        </div>
      </div>
    </div>
  );
}
