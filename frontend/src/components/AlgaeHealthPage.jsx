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
  Gauge
} from 'lucide-react';
import BuildingTwin from './BuildingTwin';
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

  const [activeTab, setActiveTab] = useState('diagnostics'); // 'diagnostics' | 'esg' | 'hsv'
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
            <span className={healthColor}>HSV 220x220 Box</span>
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

        {/* Metric 4: Autonomous BMS Agent State */}
        <div className="bg-[#0e1626] border border-indigo-900/50 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">BMS Autonomous Agent</span>
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-indigo-300">GEMINI 3.8 FLASH</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Auto Intervention</span>
            <span className={isCritical ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400 font-bold'}>
              {isCritical ? 'CRITICAL TRIGGER' : 'STANDBY (OPTIMAL)'}
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

          {/* Photobioreactor Physical Subsystem Status */}
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                Living Bioreactor Facade Loop Status:
              </span>
              <span className={`text-[11px] font-bold ${healthColor}`}>Status: {status}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Culture Strain</span>
                <div className="text-emerald-300 font-bold text-xs mt-0.5">Chlorella Vulgaris</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Culture pH</span>
                <div className="text-sky-300 font-bold text-xs mt-0.5">{isCritical ? 'pH 6.4 (Acidic)' : 'pH 7.8 (Optimal)'}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Active Glass Panels</span>
                <div className="text-white font-bold text-xs mt-0.5">56 / 56 Panels Online</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400">Biofuel Extraction</span>
                <div className="text-teal-300 font-bold text-xs mt-0.5">Continuous Centrifuge</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (5 cols): ROI Camera Stream & Gemini 3.8 AI Diagnostics */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          {/* Vision Feed (ROI Focus) */}
          <div className="h-[310px] flex-shrink-0">
            <CameraFeed />
          </div>

          {/* AI Autonomous Management & ESG Panel */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
            {/* Header & Tab Buttons */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex space-x-1.5 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'diagnostics'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Actions</span>
                </button>
                <button
                  onClick={() => setActiveTab('esg')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'esg'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
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
              <div className="space-y-3 font-mono text-xs max-h-[280px] overflow-y-auto pr-1">
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

            {/* Tab 2: ESG Report */}
            {activeTab === 'esg' && (
              <div className="space-y-3 font-mono text-xs max-h-[280px] overflow-y-auto">
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
                Judge Simulation Triggers:
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
                  Yellow Crisis
                </button>
                <button
                  onClick={handleSimulateHealthy}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'healthy'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Healthy Culture
                </button>
                <button
                  onClick={handleResetLive}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activePreset === 'live'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  Live Scanner
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
