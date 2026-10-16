/**
 * CameraFeed.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Apple Retail "Product-tile whiteout" Design System (apple-design.md):
 * - Flat pure-white panel (#FFFFFF) container with #F5F5F7 ground
 * - True black (#000000) edge-to-edge camera perception tile
 * - Near-black ink (#1D1D1F) for labels, #86868B for metadata
 * - Apple pill buttons: Primary #0071E3 with white text, secondary #F5F5F7 pills
 */

import React, { useState } from 'react';
import { Camera, Users, Zap, FlaskConical, RefreshCw } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif]">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)]">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-[-0.01em] flex items-center">
            {mode === 'algae'
              ? 'OpenCV Bio-Spectrophotometer'
              : mode === 'human'
              ? 'YOLOv8 Human Occupancy Tracker'
              : 'Computer Vision Perception'}
          </h3>
          <span className="text-[11px] text-[#86868B] block mt-0.5">
            {mode === 'algae'
              ? 'Pure HSV ROI Spectrometry · 520nm vs 580nm'
              : mode === 'human'
              ? 'COCO Class 0 · Real-time Bounding Boxes'
              : 'Dual-Modal Perception · YOLOv8 + OpenCV Spectrophotometry'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-[#86868B] font-mono">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
          <span>{isConnected ? (isSynthetic ? 'Synthetic CV' : '30 FPS Live') : 'Offline'}</span>
        </div>
      </div>

      {/* Video / Annotated Canvas Container: True Black #000000 tile */}
      <div className="relative mt-3 flex-1 min-h-[240px] bg-[#000000] rounded-xl overflow-hidden border border-[rgba(0,0,0,0.1)] flex items-center justify-center">
        {frameBase64 ? (
          <img
            src={frameBase64}
            alt={mode === 'algae' ? 'OpenCV Algae Spectrophotometer Feed' : 'Computer Vision Stream'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#0071E3] animate-spin" />
            <p className="text-xs text-[#86868B]">
              Connecting to Computer Vision Server...
            </p>
          </div>
        )}

        {/* Floating Watermark HUD on Black Tile */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[11px] font-mono bg-[rgba(0,0,0,0.75)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] text-white pointer-events-none">
          <div className="flex items-center space-x-2">
            <span>OCC: {occupancy}</span>
            <span className="text-white/30">|</span>
            <span>CO₂: {co2Ppm} ppm</span>
            <span className="text-white/30">|</span>
            <span className="text-[#34C759]">HEALTH: {algaeHealth.toFixed(0)}%</span>
          </div>
          <div className="text-[10.5px] text-white/70">
            {activeTestMode === 'live' ? 'Live Optical' : `Test: ${activeTestMode}`}
          </div>
        </div>
      </div>

      {/* Quick Demo Controls for Hackathon Judges: Apple Pill Buttons */}
      <div className="mt-3.5 pt-3 border-t border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#86868B]">
            Perception Simulation Controls
          </span>
          <span className="text-[11px] text-[#86868B] font-mono">
            {activeTestMode.toUpperCase()}
          </span>
        </div>

        {/* Apple Pill Trigger Buttons */}
        <div className="space-y-1.5 text-xs">
          {/* Row 1: Occupancy Spikes */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => handleSimulateOccupants(1)}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'occ-1'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              1 Human
            </button>
            <button
              onClick={() => handleSimulateOccupants(3)}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'occ-3'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              3 Humans
            </button>
            <button
              onClick={() => handleSimulateOccupants(5)}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'occ-5'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              Surge 5
            </button>
            <button
              onClick={handleResetToLive}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'live'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              Live Feed
            </button>
          </div>

          {/* Row 2: Biological Health States */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleSimulateGreenCulture}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'healthy'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              Green (95%)
            </button>
            <button
              onClick={handleSimulateYellowCrisis}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'crisis'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              Yellow (45%)
            </button>
            <button
              onClick={async () => {
                setActiveTestMode('stress');
                await setSimulationOverride(occupancy, true);
              }}
              className={`py-1.5 px-2 rounded-[980px] text-center font-medium transition-colors ${
                activeTestMode === 'stress'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
              }`}
            >
              Crash (25%)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
