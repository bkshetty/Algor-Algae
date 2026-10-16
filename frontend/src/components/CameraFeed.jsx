/**
 * CameraFeed.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Real-Time Computer Vision Perception Stream & Judges' Demo Control Engine.
 *
 * Implements:
 * 1. YOLOv8 Edge Vision Human Occupancy Detection (Class 0 Bounding Boxes)
 * 2. OpenCV Pure HSV Spectrophotometer (220x220 ROI Color Segmentation)
 * 3. Quick 1-Click Demo Simulation Triggers for Hackathon Judges
 * 4. Strict adherence to design tokens: #060a12 ground, #090f19 surface,
 *    rgba(237,231,220,0.13) hairlines, and type ornament accents.
 */

import React, { useState } from 'react';
import { Camera, Users, Zap, FlaskConical, Gauge, RefreshCw, Eye } from 'lucide-react';
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
  const co2Ppm = useStore((state) => state.co2_ppm);
  const hsvStats = useStore((state) => state.hsv_stats);

  const [activeTestMode, setActiveTestMode] = useState('live');

  // Select frame based on mode
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
    <div className="flex flex-col h-full bg-[#090f19] border border-[rgba(237,231,220,0.13)] rounded-2xl p-4 shadow-xl select-none font-['Sora']">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#ede7dc] font-['Syne'] flex items-center">
              {mode === 'algae'
                ? 'OpenCV Bio-Spectrophotometer'
                : mode === 'human'
                ? 'YOLOv8 Human Occupancy Tracker'
                : 'Dual-Modal Perception Engine'}
            </h3>
            <span className="text-[10px] text-[#9ea5a8] font-mono block">
              {mode === 'algae'
                ? 'Pure HSV ROI Spectrometry // 520nm vs 580nm'
                : mode === 'human'
                ? 'COCO Class 0 // Real-time Bounding Boxes'
                : 'YOLOv8 Occupancy + HSV Spectrophotometry'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[10.5px]">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'}`} />
          <span className="text-[#9ea5a8]">
            {isConnected ? (isSynthetic ? 'SYNTHETIC CV' : '30 FPS REAL-TIME') : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Video / Annotated Canvas Container */}
      <div className="relative mt-3 flex-1 min-h-[240px] bg-black rounded-xl overflow-hidden border border-[rgba(237,231,220,0.13)] flex items-center justify-center">
        {frameBase64 ? (
          <img
            src={frameBase64}
            alt={mode === 'algae' ? 'OpenCV Algae Spectrophotometer Feed' : 'Computer Vision Stream'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-[#10b981] animate-spin" />
            <p className="text-xs font-mono text-[#9ea5a8]">
              Streaming Real-Time Computer Vision...<br />
              Target: <code className="text-[#10b981]">ws://localhost:8000/ws</code>
            </p>
          </div>
        )}

        {/* Floating Watermark HUD */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10.5px] font-mono bg-[rgba(9,15,25,0.85)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[rgba(237,231,220,0.13)] text-[#ede7dc] pointer-events-none">
          <div className="flex items-center space-x-2">
            <span className="text-[#0284c7]">OCC: {occupancy}</span>
            <span className="text-[rgba(237,231,220,0.2)]">|</span>
            <span className="text-[#f59e0b]">CO₂: {co2Ppm} ppm</span>
            <span className="text-[rgba(237,231,220,0.2)]">|</span>
            <span className="text-[#10b981]">HEALTH: {algaeHealth.toFixed(0)}%</span>
          </div>
          <div className="text-[10px] text-[#9ea5a8] uppercase tracking-wider">
            {activeTestMode === 'live' ? 'Live Optical Feed' : `Test: ${activeTestMode}`}
          </div>
        </div>
      </div>

      {/* Quick Demo Controls for Hackathon Judges */}
      <div className="mt-3 pt-3 border-t border-[rgba(237,231,220,0.13)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10.5px] font-['Sora'] uppercase tracking-[0.14em] text-[#9ea5a8] flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5" />
            Judges' Perception Triggers:
          </span>
          <span className="text-[10px] text-[#6c7378] font-mono">
            ACTIVE: <strong className="text-[#ede7dc]">{activeTestMode.toUpperCase()}</strong>
          </span>
        </div>

        {/* 2-Row Hairline Pill Trigger Buttons */}
        <div className="space-y-1.5 font-['Sora'] text-xs">
          {/* Row 1: Occupancy Spikes */}
          <div className="grid grid-cols-4 gap-1.5 font-mono text-[10.5px]">
            <button
              onClick={() => handleSimulateOccupants(1)}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'occ-1'
                  ? 'border-[#0284c7] text-[#0284c7] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#0284c7] hover:text-[#0284c7]'
              }`}
            >
              1 Human
            </button>
            <button
              onClick={() => handleSimulateOccupants(3)}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'occ-3'
                  ? 'border-[#0284c7] text-[#0284c7] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#0284c7] hover:text-[#0284c7]'
              }`}
            >
              3 Humans
            </button>
            <button
              onClick={() => handleSimulateOccupants(5)}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'occ-5'
                  ? 'border-[#f59e0b] text-[#f59e0b] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#f59e0b] hover:text-[#f59e0b]'
              }`}
            >
              Surge (5)
            </button>
            <button
              onClick={handleResetToLive}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'live'
                  ? 'border-[#10b981] text-[#10b981] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#10b981] hover:text-[#10b981]'
              }`}
            >
              Live Feed
            </button>
          </div>

          {/* Row 2: Biological Health States */}
          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10.5px]">
            <button
              onClick={handleSimulateGreenCulture}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'healthy'
                  ? 'border-[#10b981] text-[#10b981] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#10b981] hover:text-[#10b981]'
              }`}
            >
              Lush Green (95%)
            </button>
            <button
              onClick={handleSimulateYellowCrisis}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'crisis'
                  ? 'border-[#f59e0b] text-[#f59e0b] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#f59e0b] hover:text-[#f59e0b]'
              }`}
            >
              Yellow Stress (45%)
            </button>
            <button
              onClick={async () => {
                setActiveTestMode('stress');
                await setSimulationOverride(occupancy, true);
              }}
              className={`py-1.5 px-2 rounded-full border transition-all text-center ${
                activeTestMode === 'stress'
                  ? 'border-[#ef4444] text-[#ef4444] font-bold'
                  : 'border-[rgba(237,231,220,0.18)] text-[#ede7dc] hover:border-[#ef4444] hover:text-[#ef4444]'
              }`}
            >
              Acid Crash (25%)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
