import React, { useState } from 'react';
import { 
  Users, 
  Wind, 
  Activity, 
  Droplet, 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useStore } from '../store';
import { triggerAIDiagnostics } from '../utils/websocket';

export default function Dashboard() {
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);
  const algaeHealth = useStore((state) => state.algae_health);
  const biofuelRate = useStore((state) => state.biofuel_ml_hr);
  const status = useStore((state) => state.status);
  const diagnostics = useStore((state) => state.diagnostics);
  const isLoading = useStore((state) => state.isLoadingDiagnostics);

  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'agent' | 'esg'

  const handleRunAI = async () => {
    try {
      await triggerAIDiagnostics();
      setActiveTab('agent');
    } catch (e) {
      console.error(e);
    }
  };

  // Health color mapping
  const isHealthy = algaeHealth >= 70;
  const isStressed = algaeHealth >= 45 && algaeHealth < 70;
  const isCritical = algaeHealth < 45;

  const healthColor = isHealthy ? 'text-emerald-400' : isStressed ? 'text-amber-400' : 'text-rose-500';
  const healthBg = isHealthy ? 'bg-emerald-500/10 border-emerald-500/30' : isStressed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';
  const healthProgressColor = isHealthy ? 'bg-emerald-500' : isStressed ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Banner Warning if Critical */}
      {isCritical && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-rose-300">BIOLOGICAL CRISIS:</span>{' '}
              <span className="text-slate-200">Algae health dropped to {algaeHealth.toFixed(0)}%. Yellow spectrum dominant.</span>
            </div>
          </div>
          <button
            onClick={handleRunAI}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-medium tracking-wide flex items-center space-x-1"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Engage AI</span>
          </button>
        </div>
      )}

      {/* Primary KPI Grid (4 Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Human Occupancy */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Occupancy</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{occupancy}</span>
            <span className="text-[11px] text-slate-400 font-mono">person{occupancy !== 1 ? 's' : ''}</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
            <span>CV YOLOv8n</span>
            <span className="text-sky-400 font-mono">100% active</span>
          </div>
        </div>

        {/* Metric 2: Indoor CO2 Load */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Simulated CO2</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{co2Ppm}</span>
            <span className="text-[11px] text-slate-400 font-mono">ppm</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
            <span>Formula (400 + N*150)</span>
            <span className={`font-mono ${co2Ppm > 800 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {co2Ppm > 800 ? 'High Intake' : 'Normal'}
            </span>
          </div>
        </div>

        {/* Metric 3: Algae Culture Health */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors duration-500 ${healthBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Algae Health</span>
            <Activity className={`w-4 h-4 ${healthColor}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono ${healthColor}`}>{algaeHealth.toFixed(1)}%</span>
            <span className="text-[11px] font-mono text-slate-400">{status}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-slate-900/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${healthProgressColor}`}
              style={{ width: `${Math.max(5, Math.min(100, algaeHealth))}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Biofuel Synthesis Rate */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Biofuel Output</span>
            <Droplet className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{biofuelRate}</span>
            <span className="text-[11px] text-slate-400 font-mono">ml / hr</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
            <span>Lipid Yield</span>
            <span className="text-teal-400 font-mono">+{(biofuelRate * 24 / 1000).toFixed(2)} L/day</span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs: AI Agent Diagnostics & ESG ESG Carbon Report */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 p-4 flex flex-col min-h-[300px]">
        {/* Tab Controls & Run AI Button */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex space-x-1.5">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'telemetry'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Loop
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                activeTab === 'agent'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Gemini 2.5 Agent</span>
              {diagnostics && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
            <button
              onClick={() => setActiveTab('esg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                activeTab === 'esg'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ESG Carbon Report</span>
            </button>
          </div>

          {/* Trigger AI Button */}
          <button
            onClick={handleRunAI}
            disabled={isLoading}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-2 transition-all shadow-lg ${
              isLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/50 hover:shadow-emerald-900/80'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini Reasoning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Run AI Diagnostics</span>
              </>
            )}
          </button>
        </div>

        {/* Tab 1: System Closed-Loop Flow & Principles */}
        {activeTab === 'telemetry' && (
          <div className="py-3 flex-1 flex flex-col justify-between text-xs font-mono">
            <div className="space-y-3">
              <div className="text-slate-400 text-[11px] leading-relaxed">
                <span className="text-emerald-400 font-semibold">CLOSED-LOOP BIOLOGICAL ARCHITECTURE:</span> The building captures human exhaled CO2 from HVAC return ducts, routes it to facade-integrated photobioreactor panels, where microalgae converts it into pure O2 and harvestable biomass.
              </div>

              {/* Step Pipeline Visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-sky-400 text-[10px] font-bold">1. LOAD GENERATION</div>
                  <div className="text-slate-200 text-xs mt-1">{occupancy} occupants</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">+{occupancy * 150} ppm metabolic CO2</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-emerald-400 text-[10px] font-bold">2. BIO-SEQUESTRATION</div>
                  <div className="text-slate-200 text-xs mt-1">Facade at {algaeHealth.toFixed(0)}%</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{co2Ppm} ppm air sparging</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-teal-400 text-[10px] font-bold">3. CIRCULAR RECOVERY</div>
                  <div className="text-slate-200 text-xs mt-1">{biofuelRate} ml/hr lipid</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Clean O2 returned to HVAC</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Autonomous BMS Watchdog: Watching spectrophotometer ROI for chlorosis shifts</span>
              </span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        )}

        {/* Tab 2: Gemini 2.5 Flash Autonomous Agent Output */}
        {activeTab === 'agent' && (
          <div className="py-2 flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[290px] pr-1">
            {diagnostics ? (
              <>
                {/* Diagnostics summary block */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center">
                      <Bot className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                      Biological Diagnostics
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      diagnostics.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300' :
                      diagnostics.status === 'STRESSED' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {diagnostics.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200 leading-relaxed font-sans">
                    {diagnostics.diagnostics}
                  </p>
                </div>

                {/* System Actions Generated */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Autonomous BMS Control Directives:
                  </div>
                  <div className="space-y-2">
                    {diagnostics.detailed_actions?.map((act, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono flex items-start justify-between space-x-3">
                        <div>
                          <div className="text-emerald-400 font-bold flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 mr-1" />
                            {act.action} <span className="text-slate-400 font-normal ml-2">[{act.target}]</span>
                          </div>
                          <div className="text-slate-300 text-[11px] mt-0.5 font-sans">
                            {act.rationale}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] flex-shrink-0">
                          {act.parameter}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400 text-xs font-mono space-y-2">
                <Bot className="w-8 h-8 text-slate-600" />
                <p>Click "Run AI Diagnostics" above or trigger a yellow crisis to simulate automated biological intervention.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: ESG Carbon Compliance Report */}
        {activeTab === 'esg' && (
          <div className="py-2 flex-1 flex flex-col space-y-3 font-mono text-xs">
            {diagnostics?.carbon_report ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">CO2 Sequestered / Day</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {diagnostics.carbon_report.co2_absorbed_kg_day} kg
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Carbon Credits Generated</span>
                    <div className="text-xl font-bold text-sky-400 mt-1">
                      {diagnostics.carbon_report.carbon_credits_earned} tCO2e
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 uppercase">ESG Compliance Rating</span>
                    <span className="text-emerald-400 font-bold">{diagnostics.carbon_report.esg_compliance_score}</span>
                  </div>
                  <p className="mt-2 text-xs font-sans text-slate-300 leading-relaxed">
                    {diagnostics.carbon_report.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400 text-xs font-mono space-y-2">
                <FileText className="w-8 h-8 text-slate-600" />
                <p>Run AI Diagnostics to generate real-time ESG compliance carbon reporting.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
