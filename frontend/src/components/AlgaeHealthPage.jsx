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
import BioreactorTwin from './BioreactorTwin';
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
  const [threeDView, setThreeDView] = useState('bioreactor'); // 'bioreactor' | 'building'

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
      {/* Top Algae Bio-Health Header - Apple Retail Specification Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Algae Health */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Bioreactor Health</span>
            <Activity className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-3xl font-semibold tracking-tight ${
              isHealthy ? 'text-[#34C759]' : isStressed ? 'text-[#FF9500]' : 'text-[#FF3B30]'
            }`}>{algaeHealth.toFixed(1)}%</span>
            <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-[980px] ${
              isHealthy ? 'bg-[#EAF9EE] text-[#34C759]' : isStressed ? 'bg-[#FFF8E6] text-[#FF9500]' : 'bg-[#FEECEB] text-[#FF3B30]'
            }`}>{status}</span>
          </div>
          <div className="mt-2.5 w-full bg-[#E5E5EA] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isHealthy ? 'bg-[#34C759]' : isStressed ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, algaeHealth))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Dominant Spectral Wavelength */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Dominant Spectrum</span>
            <Gauge className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base font-semibold text-[#1D1D1F] truncate">{dominantPigment}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>ROI Spectrophotometer</span>
            <span className="font-medium text-[#1D1D1F]">Hue: {hsvStats?.mean_h ?? 58}°</span>
          </div>
        </div>

        {/* Metric 3: Biofuel Synthesis Rate */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Biofuel Synthesis Rate</span>
            <Droplet className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">{biofuelRate}</span>
            <span className="text-xs text-[#86868B] font-medium">ml / hr</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Daily Biomass Harvest</span>
            <span className="text-[#34C759] font-medium">+{dailyLipidYield} L/day</span>
          </div>
        </div>

        {/* Metric 4: GenAI HVAC Airflow Redirection Status */}
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">GenAI HVAC Airflow</span>
            <Wind className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-semibold truncate text-[#1D1D1F]">
              {hvacState.hvacStatusText}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#86868B] flex items-center justify-between">
            <span>Damper Valve</span>
            <span className="font-semibold text-[#0071E3]">
              {hvacState.damperOpenPct}% Open
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: 3D Twin (Left) & Vision Feed + AI Agent (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column (7 cols): 3D Living Bioreactor Digital Twin */}
        <section className="lg:col-span-7 flex flex-col space-y-3">
          {/* Apple Segmented Viewport Switcher */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center bg-[#E8E8ED] p-1 rounded-[980px] text-xs">
              <button
                onClick={() => setThreeDView('bioreactor')}
                className={`px-3.5 py-1 rounded-[980px] transition-all flex items-center gap-1.5 ${
                  threeDView === 'bioreactor'
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Real Photobioreactor (3D PBR)</span>
              </button>

              <button
                onClick={() => setThreeDView('building')}
                className={`px-3.5 py-1 rounded-[980px] transition-all flex items-center gap-1.5 ${
                  threeDView === 'building'
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Building Context</span>
              </button>
            </div>

            <span className="text-[11px] text-[#86868B] font-medium hidden sm:inline">
              {threeDView === 'bioreactor' ? 'Active: Chlorella Culture Chamber' : 'Active: 5-Story Facade'}
            </span>
          </div>

          <div className="h-[460px] lg:h-[520px] w-full rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-[#000000]">
            {threeDView === 'bioreactor' ? (
              <BioreactorTwin focusMode="algae" />
            ) : (
              <BuildingTwin focusMode="algae" />
            )}
          </div>

          {/* Photobioreactor Physical Subsystem Status & OpenCV Color Breakdown */}
          <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1D1D1F] font-semibold flex items-center">
                <FlaskConical className="w-4 h-4 text-[#0071E3] mr-1.5" />
                OpenCV Spectrophotometer Bio-Scanner Telemetry
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[980px] ${
                isHealthy ? 'bg-[#EAF9EE] text-[#34C759]' : isStressed ? 'bg-[#FFF8E6] text-[#FF9500]' : 'bg-[#FEECEB] text-[#FF3B30]'
              }`}>Culture: {status}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] p-3 rounded-xl">
                <span className="text-[10px] text-[#86868B] font-medium">Culture Strain</span>
                <div className="text-[#1D1D1F] font-semibold text-xs mt-0.5">Chlorella Vulgaris</div>
                <div className="text-[10px] text-[#86868B] mt-0.5">Photosynthetic Algae</div>
              </div>

              <div className="bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] p-3 rounded-xl">
                <span className="text-[10px] text-[#86868B] font-medium">Culture pH Level</span>
                <div className={`font-semibold text-xs mt-0.5 ${isCritical ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'}`}>
                  {isCritical ? 'pH 6.3 (Acid Shock)' : 'pH 7.8 (Optimal)'}
                </div>
                <div className="text-[10px] text-[#86868B] mt-0.5">
                  {isCritical ? 'Bypass Damper Active' : 'Buffer Balanced'}
                </div>
              </div>

              <div className="bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] p-3 rounded-xl">
                <span className="text-[10px] text-[#86868B] font-medium">HSV Color Hue</span>
                <div className="text-[#1D1D1F] font-semibold text-xs mt-0.5">
                  H: {hsvStats?.mean_h ?? 58}° (S:{hsvStats?.mean_s ?? 120})
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${hsvStats?.mean_h >= 35 && hsvStats?.mean_h <= 85 ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                  {hsvStats?.mean_h >= 35 && hsvStats?.mean_h <= 85 ? 'Healthy Green' : 'Yellow/Degraded'}
                </div>
              </div>

              <div className="bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] p-3 rounded-xl">
                <span className="text-[10px] text-[#86868B] font-medium">Biomass Cell Density</span>
                <div className="text-[#0071E3] font-semibold text-xs mt-0.5">
                  {hsvStats?.biomass_g_l ?? 1.62} g/L
                </div>
                <div className="text-[10px] text-[#86868B] mt-0.5">Harvest Online</div>
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
          <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 flex flex-col space-y-3">
            {/* Header & Tab Buttons */}
            <div className="flex flex-wrap items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2.5 gap-2">
              <div className="flex items-center bg-[#E8E8ED] p-1 rounded-[980px] text-xs">
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-3 py-1 rounded-[980px] transition-all flex items-center space-x-1.5 ${
                    activeTab === 'diagnostics'
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>AI Actions</span>
                </button>

                <button
                  onClick={() => setActiveTab('hvac')}
                  className={`px-3 py-1 rounded-[980px] transition-all flex items-center space-x-1.5 ${
                    activeTab === 'hvac'
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>HVAC Redirection</span>
                </button>

                <button
                  onClick={() => setActiveTab('esg')}
                  className={`px-3 py-1 rounded-[980px] transition-all flex items-center space-x-1.5 ${
                    activeTab === 'esg'
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-sm'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>ESG Report</span>
                </button>
              </div>

              {/* Run AI Diagnostics Button */}
              <button
                onClick={handleRunAI}
                disabled={isLoading}
                className="btn-apple-primary px-3.5 py-1.5 text-xs font-medium flex items-center space-x-1.5"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Run AI Diagnostics</span>
                  </>
                )}
              </button>
            </div>

            {/* Tab 1: AI Diagnostics & BMS Commands */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-3 text-xs max-h-[290px] overflow-y-auto pr-1">
                {diagnostics ? (
                  <>
                    <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider">Biological Assessment</span>
                        <span className={`px-2 py-0.5 rounded-[980px] text-[10px] font-semibold ${
                          diagnostics.status === 'OPTIMAL' ? 'bg-[#EAF9EE] text-[#34C759]' :
                          diagnostics.status === 'STRESSED' ? 'bg-[#FFF8E6] text-[#FF9500]' : 'bg-[#FEECEB] text-[#FF3B30]'
                        }`}>
                          {diagnostics.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#1D1D1F] leading-relaxed">
                        {diagnostics.diagnostics}
                      </p>
                    </div>

                    {/* Action Directives */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider">
                        Autonomous BMS Directives Executed:
                      </div>
                      {diagnostics.detailed_actions?.map((act, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] flex items-start justify-between space-x-2">
                          <div>
                            <div className="text-[#0071E3] font-semibold flex items-center text-xs">
                              <ChevronRight className="w-3.5 h-3.5 mr-0.5 text-[#0071E3]" />
                              {act.action} <span className="text-[#86868B] font-normal ml-1">[{act.target}]</span>
                            </div>
                            <div className="text-[#1D1D1F] text-[11px] mt-0.5">
                              {act.rationale}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-[980px] bg-white text-[#1D1D1F] text-[10px] font-medium border border-[rgba(0,0,0,0.06)] flex-shrink-0">
                            {act.parameter}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-[#86868B] text-xs space-y-2">
                    <Bot className="w-8 h-8 text-[#86868B]" />
                    <p>Click "Run AI Diagnostics" above to have Gemini formulate autonomous biological interventions.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: HVAC Airflow Redirection Actuator System */}
            {activeTab === 'hvac' && (
              <div className="space-y-3 text-xs max-h-[360px] overflow-y-auto pr-1">
                {/* Visual Airflow Loop Schematic */}
                <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider">HVAC Redirection Loop</span>
                    <span className="px-2 py-0.5 rounded-[980px] text-[10px] font-semibold bg-[#E8F2FD] text-[#0071E3]">
                      {hvacState.hvacStatusText}
                    </span>
                  </div>

                  {hvacState.activeLoop === 'roof_bypass' ? (
                    <div className="p-2.5 rounded-lg bg-white border border-[#FF3B30]/30 flex items-center justify-between text-[11px] space-x-1 text-center shadow-sm">
                      <div className="flex-1">
                        <span className="text-[#86868B] text-[9px] block">INDOOR ROOMS</span>
                        <span className="text-[#1D1D1F] font-semibold">{occupancy} humans ({co2Ppm}ppm)</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF3B30] flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[#86868B] text-[9px] block">DAMPER (BYPASS)</span>
                        <span className="font-semibold text-[#FF3B30]">90% OUTSIDE VENT</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF3B30] flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[#86868B] text-[9px] block">OUTSIDE ATMOSPHERE</span>
                        <span className="text-[#FF9500] font-semibold">ALGAE PROTECTED</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-white border border-[rgba(0,0,0,0.06)] flex items-center justify-between text-[11px] space-x-1 text-center shadow-sm">
                      <div className="flex-1">
                        <span className="text-[#86868B] text-[9px] block">INDOOR ROOMS</span>
                        <span className="text-[#1D1D1F] font-semibold">{occupancy} humans ({co2Ppm}ppm)</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#86868B] flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[#86868B] text-[9px] block">MOTORIZED DAMPER</span>
                        <span className="font-semibold text-[#0071E3]">{hvacState.damperOpenPct}% Modulated</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#86868B] flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[#86868B] text-[9px] block">BIOREACTOR FACADE</span>
                        <span className="text-[#34C759] font-semibold">{biofuelRate} ml/h Lipid</span>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-[#1D1D1F] leading-relaxed pt-1">
                    {hvacState.aiReasoning}
                  </div>
                </div>

                {/* Actuator State Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                    <span className="text-[10px] text-[#86868B] font-semibold uppercase">Damper Position</span>
                    <div className="text-sm font-semibold text-[#1D1D1F] mt-0.5 flex items-center justify-between">
                      <span>{hvacState.damperOpenPct}%</span>
                      <span className="text-[10px] font-normal text-[#86868B]">Servo 42°</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                    <span className="text-[10px] text-[#86868B] font-semibold uppercase">Air Sparging Rate</span>
                    <div className="text-sm font-semibold text-[#0071E3] mt-0.5 flex items-center justify-between">
                      <span>{hvacState.spargingRateLpm} L/min</span>
                      <span className="text-[10px] font-normal text-[#86868B]">{(hvacState.airflowVelocity * 160).toFixed(0)} CFM</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                    <span className="text-[10px] text-[#86868B] font-semibold uppercase">Nutrient Dosing Solenoid</span>
                    <div className="text-sm font-semibold text-[#34C759] mt-0.5">
                      {isStressed || isCritical ? '+35 ml/hr Buffer' : 'Standby (0 ml)'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                    <span className="text-[10px] text-[#86868B] font-semibold uppercase">Electrochromic Tint</span>
                    <div className="text-sm font-semibold text-[#0071E3] mt-0.5">
                      {isCritical ? '40% Transmission' : '85% Transmission'}
                    </div>
                  </div>
                </div>

                {/* Interactive Airflow Demo Triggers */}
                <div className="pt-2 border-t border-[rgba(0,0,0,0.06)] space-y-1.5">
                  <div className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider flex items-center">
                    <Zap className="w-3 h-3 text-[#0071E3] mr-1" />
                    Test GenAI Airflow Redirect Scenarios:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerHvacScenario('redirect')}
                      className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all text-left ${
                        hvacState.mode === 'redirect'
                          ? 'btn-apple-primary'
                          : 'btn-apple-secondary'
                      }`}
                    >
                      🔀 AI Redirect (Amber)
                    </button>
                    <button
                      onClick={() => triggerHvacScenario('bypass')}
                      className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all text-left ${
                        hvacState.mode === 'bypass'
                          ? 'btn-apple-primary'
                          : 'btn-apple-secondary'
                      }`}
                    >
                      ⚠️ AI Bypass (Crimson)
                    </button>
                    <button
                      onClick={() => triggerHvacScenario('optimal')}
                      className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all text-left ${
                        hvacState.mode === 'optimal'
                          ? 'btn-apple-primary'
                          : 'btn-apple-secondary'
                      }`}
                    >
                      🌿 Max Bio (Emerald)
                    </button>
                    <button
                      onClick={() => triggerHvacScenario('auto')}
                      className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all text-left ${
                        hvacState.mode === 'auto'
                          ? 'btn-apple-primary'
                          : 'btn-apple-secondary'
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
              <div className="space-y-3 text-xs max-h-[290px] overflow-y-auto">
                {diagnostics?.carbon_report ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                        <span className="text-[10px] text-[#86868B] font-semibold uppercase">CO₂ Sequestered</span>
                        <div className="text-lg font-semibold text-[#34C759] mt-1">
                          {diagnostics.carbon_report.co2_absorbed_kg_day} kg / day
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                        <span className="text-[10px] text-[#86868B] font-semibold uppercase">Carbon Credits</span>
                        <div className="text-lg font-semibold text-[#0071E3] mt-1">
                          {diagnostics.carbon_report.carbon_credits_earned} tCO2e
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#86868B] font-semibold uppercase">LEED ESG Rating</span>
                        <span className="text-[#34C759] font-bold">{diagnostics.carbon_report.esg_compliance_score}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#1D1D1F] leading-relaxed">
                        {diagnostics.carbon_report.summary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-[#86868B] text-xs space-y-2">
                    <FileText className="w-8 h-8 text-[#86868B]" />
                    <p>Run AI Diagnostics to generate automated LEED Net-Zero Carbon Offset certification metrics.</p>
                  </div>
                )}
              </div>
            )}

            {/* Hackathon Judge Simulation Triggers */}
            <div className="pt-2 border-t border-[rgba(0,0,0,0.06)]">
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2 flex items-center">
                <Zap className="w-3.5 h-3.5 text-[#0071E3] mr-1.5" />
                Algae Color & Culture Triggers:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSimulateCrisis}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'crisis'
                      ? 'btn-apple-primary'
                      : 'btn-apple-secondary'
                  }`}
                >
                  Yellow Crisis (40%)
                </button>
                <button
                  onClick={handleSimulateHealthy}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'healthy'
                      ? 'btn-apple-primary'
                      : 'btn-apple-secondary'
                  }`}
                >
                  Healthy Culture (95%)
                </button>
                <button
                  onClick={handleResetLive}
                  className={`text-xs py-1.5 px-3 rounded-[980px] font-medium transition-all ${
                    activePreset === 'live'
                      ? 'bg-[#34C759] text-white'
                      : 'btn-apple-secondary'
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
      <section className="mt-8 pt-6 border-t border-[rgba(0,0,0,0.08)]">
        <HVACDiagram />
      </section>
    </div>
  );
}
