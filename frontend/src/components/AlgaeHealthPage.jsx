import React, { useState } from 'react';
import { 
  Activity, 
  Droplet, 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Zap, 
  Sun, 
  Eye, 
  RotateCcw,
  FlaskConical,
  Gauge,
  Wind,
  Sliders,
  ArrowRight
} from 'lucide-react';
import BuildingTwin from './BuildingTwin';
import HVACDiagram from './HVACDiagram';
import CameraFeed from './CameraFeed';
import { useStore } from '../store';
import { triggerAIDiagnostics, setSimulationOverride, disableSimulationOverride } from '../utils/websocket';

export default function AlgaeHealthPage() {
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const status = useStore((state) => state.status);
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const diagnostics = useStore((state) => state.diagnostics);
  const isLoading = useStore((state) => state.isLoadingDiagnostics);
  const hvacState = useStore((state) => state.hvacState);
  const triggerHvacScenario = useStore((state) => state.triggerHvacScenario);
  const setHvacDamper = useStore((state) => state.setHvacDamper);
  const hsvStats = useStore((state) => state.hsv_stats);

  const [activeTab, setActiveTab] = useState('diagnostics'); // 'diagnostics' | 'hvac' | 'esg'
  const [activePreset, setActivePreset] = useState('live');

  const handleRunAI = async () => {
    try {
      await triggerAIDiagnostics();
      setActiveTab('diagnostics');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateCrisis = async () => {
    setActivePreset('crisis');
    await setSimulationOverride(occupancy, true);
  };

  const handleSimulateHealthy = async () => {
    setActivePreset('healthy');
    await setSimulationOverride(occupancy, false);
  };

  const handleResetLive = async () => {
    setActivePreset('live');
    await disableSimulationOverride();
  };

  // Health color mapping
  const isHealthy = algaeHealth >= 70;
  const isStressed = algaeHealth >= 45 && algaeHealth < 70;
  const isCritical = algaeHealth < 45;

  const healthColor = isHealthy ? 'text-emerald-400' : isStressed ? 'text-amber-400' : 'text-rose-500';
  const healthBg = isHealthy ? 'bg-emerald-500/10 border-emerald-500/30' : isStressed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';
  const healthProgressColor = isHealthy ? 'bg-emerald-500' : isStressed ? 'bg-amber-500' : 'bg-rose-500';

  const dominantPigment = isHealthy ? 'Chlorophyll-a (520nm)' : isStressed ? 'Carotenoid / Stress (580nm)' : 'Severe Chlorosis Decay (620nm)';
  const dailyLipidYield = ((biofuelRate * 24) / 1000).toFixed(2);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Top Algae Bio-Health Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Algae Health */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-lg transition-colors duration-500 ${healthBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Bioreactor Health</span>
            <Activity className={`w-4 h-4 ${healthColor}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-3xl font-bold font-mono ${healthColor}`}>{algaeHealth.toFixed(1)}%</span>
            <span className="text-xs font-mono text-slate-300 font-bold uppercase">{status}</span>
          </div>
          <div className="mt-2 w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${healthProgressColor}`}
              style={{ width: `${Math.max(5, Math.min(100, algaeHealth))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Dominant Spectral Wavelength */}
        <div className="bg-[#0e1626] border border-emerald-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Dominant Pigment Spectrum</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base font-bold font-mono text-white truncate">{dominantPigment}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>ROI Spectrophotometer</span>
            <span className={healthColor}>HSV Hue: {hsvStats?.mean_h ?? 58}°</span>
          </div>
        </div>

        {/* Metric 3: Biofuel Synthesis Rate */}
        <div className="bg-[#0e1626] border border-teal-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Biofuel Synthesis Rate</span>
            <Droplet className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">{biofuelRate}</span>
            <span className="text-xs text-teal-300 font-mono">ml / hr</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Daily Biomass Harvest</span>
            <span className="text-teal-400 font-bold">+{dailyLipidYield} L/day</span>
          </div>
        </div>

        {/* Metric 4: GenAI HVAC Airflow Redirection Status */}
        <div className="bg-[#0e1626] border border-indigo-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">GenAI HVAC Airflow</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-bold font-mono truncate" style={{ color: hvacState.airflowColor }}>
              {hvacState.hvacStatusText}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Damper Valve</span>
            <span className="font-bold" style={{ color: hvacState.airflowColor }}>
              {hvacState.damperOpenPct}% Open
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: 3D Twin (Left) & Vision Feed + AI Agent (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column (7 cols): 3D Living Bioreactor Building Twin */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          <div className="h-[460px] lg:h-[520px] w-full">
            <BuildingTwin focusMode="algae" />
          </div>

          {/* Photobioreactor Physical Subsystem Status & OpenCV Color Breakdown */}
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                OpenCV Spectrophotometer Bio-Scanner Telemetry:
              </span>
              <span className={`text-[11px] font-bold ${healthColor}`}>Culture: {status}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Culture Strain</span>
                <div className="text-emerald-300 font-bold text-xs mt-0.5">Chlorella Vulgaris</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Photosynthetic Microalgae</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Culture pH & Acid Level</span>
                <div className={`font-bold text-xs mt-0.5 ${isCritical ? 'text-rose-400' : 'text-sky-300'}`}>
                  {isCritical ? 'pH 6.3 (Acid Shock)' : 'pH 7.8 (Optimal)'}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  {isCritical ? 'Bypass Damper Activated' : 'Buffer Balanced'}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">HSV Mean Color Hue</span>
                <div className="text-white font-bold text-xs mt-0.5">
                  H: {hsvStats?.mean_h ?? 58}° (S:{hsvStats?.mean_s ?? 120})
                </div>
                <div className="text-[9px] text-emerald-400 mt-0.5">
                  {hsvStats?.mean_h >= 35 && hsvStats?.mean_h <= 85 ? 'Healthy Green' : 'Yellow/Degraded'}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Biomass Cell Density</span>
                <div className="text-teal-300 font-bold text-xs mt-0.5">
                  {hsvStats?.biomass_g_l ?? 1.62} g/L
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">Centrifuge Extraction Online</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (5 cols): ROI Camera Stream & Gemini 3.8 AI Diagnostics */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          {/* Vision Feed (ROI Color Spectrophotometer Focus - ZERO YOLO) */}
          <div className="h-[310px] flex-shrink-0">
            <CameraFeed mode="algae" />
          </div>

          {/* AI Autonomous Management, HVAC Redirection & ESG Panel */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
            {/* Header & Tab Buttons */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex space-x-1 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    activeTab === 'diagnostics'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Actions</span>
                </button>

                <button
                  onClick={() => setActiveTab('hvac')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    activeTab === 'hvac'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>HVAC Redirection</span>
                </button>

                <button
                  onClick={() => setActiveTab('esg')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    activeTab === 'esg'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>ESG Report</span>
                </button>
              </div>

              {/* Run AI Diagnostics Button */}
              <button
                onClick={handleRunAI}
                disabled={isLoading}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-all shadow-md ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Run AI Diagnostics</span>
                  </>
                )}
              </button>
            </div>

            {/* Tab 1: AI Diagnostics & BMS Commands */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-3 font-mono text-xs max-h-[290px] overflow-y-auto pr-1">
                {diagnostics ? (
                  <>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[10px] text-slate-400 uppercase">Biological Assessment</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          diagnostics.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300' :
                          diagnostics.status === 'STRESSED' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {diagnostics.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans leading-relaxed">
                        {diagnostics.diagnostics}
                      </p>
                    </div>

                    {/* Action Directives */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Autonomous BMS Directives Executed:
                      </div>
                      {diagnostics.detailed_actions?.map((act, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between space-x-2">
                          <div>
                            <div className="text-emerald-400 font-bold flex items-center text-xs">
                              <ChevronRight className="w-3 h-3 mr-1" />
                              {act.action} <span className="text-slate-400 font-normal ml-1">[{act.target}]</span>
                            </div>
                            <div className="text-slate-300 text-[11px] font-sans mt-0.5">
                              {act.rationale}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] flex-shrink-0">
                            {act.parameter}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs space-y-2">
                    <Bot className="w-8 h-8 text-slate-600" />
                    <p>Click "Run AI Diagnostics" above to have Gemini 3.8 Flash formulate autonomous biological interventions.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: HVAC Airflow Redirection Actuator System */}
            {activeTab === 'hvac' && (
              <div className="space-y-3 font-mono text-xs max-h-[360px] overflow-y-auto pr-1">
                {/* ── 2D HVAC System Layout & Operational Scenarios ── */}
                <HVACDiagram />

                {/* Visual Airflow Loop Schematic */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 uppercase">HVAC Redirection Loop</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${hvacState.airflowColor}22`, color: hvacState.airflowColor }}>
                      {hvacState.hvacStatusText}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80 flex items-center justify-between text-[11px] space-x-1 text-center">
                    <div className="flex-1">
                      <span className="text-slate-400 text-[9px] block">INDOOR ROOMS</span>
                      <span className="text-sky-300 font-bold">{occupancy} humans ({co2Ppm}ppm)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-400 text-[9px] block">MOTORIZED DAMPER</span>
                      <span className="font-bold" style={{ color: hvacState.airflowColor }}>{hvacState.damperOpenPct}% Modulated</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-400 text-[9px] block">BIOREACTOR FACADE</span>
                      <span className="text-emerald-400 font-bold">{biofuelRate} ml/h Lipid</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
                    {hvacState.aiReasoning}
                  </div>
                </div>

                {/* Actuator State Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Damper Position</span>
                    <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-between">
                      <span>{hvacState.damperOpenPct}%</span>
                      <span className="text-[10px] font-normal text-slate-400">Servo 42°</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Air Sparging Rate</span>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5 flex items-center justify-between">
                      <span>{hvacState.spargingRateLpm} L/min</span>
                      <span className="text-[10px] font-normal text-slate-400">{(hvacState.airflowVelocity * 160).toFixed(0)} CFM</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Nutrient Dosing Solenoid</span>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {isStressed || isCritical ? '+35 ml/hr Buffer' : 'Standby (0 ml)'}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Electrochromic Tint</span>
                    <div className="text-sm font-bold text-indigo-400 mt-0.5">
                      {isCritical ? '40% Transmission' : '85% Transmission'}
                    </div>
                  </div>
                </div>

                {/* Interactive Airflow Demo Triggers */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center">
                    <Zap className="w-3 h-3 text-amber-400 mr-1" />
                    Test GenAI Airflow Redirect Scenarios:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerHvacScenario('redirect')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all text-left ${
                        hvacState.mode === 'redirect'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-amber-400 hover:bg-slate-700/60'
                      }`}
                    >
                      🔀 AI Redirect (Amber)
                    </button>
                    <button
                      onClick={() => triggerHvacScenario('bypass')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all text-left ${
                        hvacState.mode === 'bypass'
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-rose-400 hover:bg-slate-700/60'
                      }`}
                    >
                      ⚠️ AI Bypass (Crimson)
                    </button>
                    <button
                      onClick={() => triggerHvacScenario('optimal')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all text-left ${
                        hvacState.mode === 'optimal'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-emerald-400 hover:bg-slate-700/60'
                      }`}
                    >
                      🌿 Max Bio (Emerald)
                    </button>
                    <button
                      onClick={() => triggerHvacScenario('auto')}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all text-left ${
                        hvacState.mode === 'auto'
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      🔄 Auto Dynamic Sync
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: ESG Report */}
            {activeTab === 'esg' && (
              <div className="space-y-3 font-mono text-xs max-h-[290px] overflow-y-auto">
                {diagnostics?.carbon_report ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase">CO₂ Sequestered</span>
                        <div className="text-lg font-bold text-emerald-400 mt-1">
                          {diagnostics.carbon_report.co2_absorbed_kg_day} kg / day
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase">Carbon Credits</span>
                        <div className="text-lg font-bold text-sky-400 mt-1">
                          {diagnostics.carbon_report.carbon_credits_earned} tCO2e
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 uppercase">LEED ESG Rating</span>
                        <span className="text-emerald-400 font-bold">{diagnostics.carbon_report.esg_compliance_score}</span>
                      </div>
                      <p className="mt-2 text-xs font-sans text-slate-300 leading-relaxed">
                        {diagnostics.carbon_report.summary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs space-y-2">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p>Run AI Diagnostics to generate automated LEED Net-Zero Carbon Offset certification metrics.</p>
                  </div>
                )}
              </div>
            )}

            {/* Hackathon Judge Simulation Triggers */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                Algae Color & Culture Triggers:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSimulateCrisis}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'crisis'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Yellow Crisis (40%)
                </button>
                <button
                  onClick={handleSimulateHealthy}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'healthy'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Healthy Culture (95%)
                </button>
                <button
                  onClick={handleResetLive}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'live'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Live OpenCV Feed
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Full 2D HVAC Architecture & 3-State Operational Redirection Layout ── */}
      <section className="mt-8 pt-6 border-t border-slate-800/80">
        <HVACDiagram />
      </section>
    </div>
  );
}
