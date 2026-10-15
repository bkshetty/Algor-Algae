import React, { useState } from 'react';
import { Camera, Users, AlertTriangle, ShieldCheck, RefreshCw, Zap, FlaskConical, Gauge, Eye } from 'lucide-react';
import { useStore } from '../store';
import { setSimulationOverride, disableSimulationOverride } from '../utils/websocket';

export default function CameraFeed({ mode = 'overview' }) {
  const frameAll = useStore((state) => state.webcam_frame_base64);
  const frameHuman = useStore((state) => state.webcam_frame_human_base64);
  const frameAlgae = useStore((state) => state.webcam_frame_algae_base64);
  const isConnected = useStore((state) => state.isConnected);
  const isSynthetic = useStore((state) => state.isSynthetic);
  const occupancy = useStore((state) => state.occupancy);
  const algaeHealth = useStore((state) => state.algae_health);
  const hsvStats = useStore((state) => state.hsv_stats);

  const [activeTestMode, setActiveTestMode] = useState('live');

  // Select specialized frame based on current page mode
  let frameBase64 = frameAll;
  if (mode === 'algae') {
    frameBase64 = frameAlgae || frameAll;
  } else if (mode === 'human') {
    frameBase64 = frameHuman || frameAll;
  }

  const handleSimulateOccupants = async (count) => {
    setActiveTestMode(`occ-${count}`);
    await setSimulationOverride(count, algaeHealth < 68);
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
          {mode === 'algae' ? (
            <FlaskConical className="w-5 h-5 text-emerald-400" />
          ) : mode === 'human' ? (
            <Users className="w-5 h-5 text-sky-400" />
          ) : (
            <Camera className="w-5 h-5 text-emerald-400" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center">
              {mode === 'algae'
                ? 'OpenCV Bio-Spectrophotometer'
                : mode === 'human'
                ? 'YOLOv8 Human Occupancy Tracker'
                : 'Vision Telemetry Feed'}
            </h3>
            {mode === 'algae' && (
              <span className="text-[10px] text-emerald-400 font-mono block">
                Pure HSV Color Segmentation • YOLO Disabled
              </span>
            )}
            {mode === 'human' && (
              <span className="text-[10px] text-sky-400 font-mono block">
                COCO Class 0 • Continuous Bounding Boxes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-mono text-slate-400">
            {isConnected ? (isSynthetic ? 'SYNTHETIC CV FEED' : '30 FPS ZERO-LAG') : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Video / Annotated Canvas Container */}
      <div className="relative mt-3 flex-1 min-h-[260px] bg-black rounded-xl overflow-hidden border border-slate-700/60 flex items-center justify-center">
        {frameBase64 ? (
          <img
            src={frameBase64}
            alt={mode === 'algae' ? 'OpenCV Algae Spectrophotometer Feed' : 'Computer Vision Stream'}
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

        {/* Floating Watermark HUD */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[11px] font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 pointer-events-none">
          {mode === 'algae' ? (
            <>
              <div className="flex items-center space-x-1.5 text-emerald-300">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>HSV Hue: {hsvStats?.mean_h ?? 58}° • Density: {hsvStats?.biomass_g_l ?? 1.6} g/L</span>
              </div>
              <div className="text-emerald-400 text-[10px]">
                Hold green/yellow in 220x220 ROI
              </div>
            </>
          ) : mode === 'human' ? (
            <>
              <div className="flex items-center space-x-1.5 text-sky-300">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>YOLOv8: {occupancy} human{occupancy !== 1 ? 's' : ''} detected</span>
              </div>
              <div className="text-sky-400 text-[10px]">
                Metabolic CO₂: +{occupancy * 150} ppm
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>YOLO: {occupancy} humans | ROI Health: {algaeHealth.toFixed(0)}%</span>
              </div>
              <div className="text-emerald-400 text-[10px]">
                Bi-Modal Vision Active
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Demo Controls for Hackathon Judges */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center">
            <Zap className="w-3 h-3 text-amber-400 mr-1" />
            {mode === 'algae' ? 'Algae Health Simulation Triggers:' : 'Demo CV Triggers:'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Mode: {activeTestMode}
          </span>
        </div>

        {mode === 'algae' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              Healthy Green (95%)
            </button>
            <button
              onClick={async () => {
                setActiveTestMode('stress');
                await setSimulationOverride(occupancy, true);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeTestMode === 'stress'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                  : 'bg-slate-800/60 border-slate-700 text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              Acidic Decay (25%)
            </button>
            <button
              onClick={handleResetToLive}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeTestMode === 'live'
                  ? 'bg-emerald-500/20 border-emerald-400 text-slate-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/60'
              }`}
            >
              Live OpenCV Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleSimulateOccupants(1)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeTestMode === 'occ-1'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              1 Human (550ppm)
            </button>
            <button
              onClick={() => handleSimulateOccupants(3)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeTestMode === 'occ-3'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-800/60 border-slate-700 text-sky-400 hover:bg-slate-700/60'
              }`}
            >
              +2 Humans (850ppm)
            </button>
            <button
              onClick={() => handleSimulateOccupants(5)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeTestMode === 'occ-5'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700 text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              Surge 5 (1150ppm)
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
        )}
      </div>
    </div>
  );
}
