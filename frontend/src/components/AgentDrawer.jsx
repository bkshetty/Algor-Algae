import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Award, 
  FileCheck2, 
  ChevronRight, 
  ShieldCheck, 
  ArrowDownToLine, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { useStore } from '../store';
import { triggerAIDiagnostics } from '../utils/websocket';

export default function AgentDrawer() {
  const diagnostics = useStore((state) => state.diagnostics);
  const isLoading = useStore((state) => state.isLoadingDiagnostics);
  const algaeHealth = useStore((state) => state.algae_health);
  const occupancy = useStore((state) => state.occupancy);
  const co2Ppm = useStore((state) => state.co2_ppm);

  const [activeTab, setActiveTab] = useState('actions'); // 'actions' | 'certificate'

  const handleRunAI = async () => {
    try {
      await triggerAIDiagnostics();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadCertificate = () => {
    if (!diagnostics?.carbon_report) return;
    const certText = `========================================================================
ALGOR-ALGAE BIOLOGICAL REACTION FACADE — ESG AUDIT CERTIFICATE
========================================================================
Timestamp: ${new Date().toISOString()}
Building Site: Autonomous Facade Bioreactor Twin v1.0
Kernel: Gemini 2.5 Flash Autonomous BMS

CURRENT ECO-METRICS:
- Human Occupants: ${occupancy}
- Indoor CO2 Absorbed: ${co2Ppm} ppm
- Photobioreactor Health: ${algaeHealth.toFixed(1)}%
- Daily CO2 Sequestration: ${diagnostics.carbon_report.co2_absorbed_kg_day} kg/day
- Certified Carbon Credits (tCO2e): ${diagnostics.carbon_report.carbon_credits_earned}
- ESG Compliance Rating: ${diagnostics.carbon_report.esg_compliance_score}

EXECUTIVE AUDIT SUMMARY:
${diagnostics.carbon_report.summary}

ACTIVE BMS DIRECTIVES:
${diagnostics.actions?.map((act, i) => `${i + 1}. ${act}`).join('\n')}

========================================================================
Verified by Algor-Algae Living Twin Core — Cryptographically Validated
========================================================================`;

    const blob = new Blob([certText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AlgorAlgae-ESG-Certificate-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111a16]/90 backdrop-blur-md rounded-2xl border border-emerald-900/40 p-4 flex flex-col shadow-xl">
      {/* Drawer Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center">
              Gemini 2.5 Flash BMS Agent
              <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Autonomous Building Optimization & Carbon Credit Auditor
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunAI}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-all shadow-md ${
            isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Reasoning...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize System</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Pill Switcher */}
      <div className="flex space-x-2 mt-3 mb-2">
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'actions'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Optimization Directives
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1 ${
            activeTab === 'certificate'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>ESG Certificate</span>
        </button>
      </div>

      {/* Tab 1: Optimization Actions */}
      {activeTab === 'actions' && (
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px] pr-1">
          {diagnostics ? (
            <>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-900/30 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className="text-slate-400 uppercase">State Evaluation</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    diagnostics.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300' :
                    diagnostics.status === 'STRESSED' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {diagnostics.status}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  {diagnostics.diagnostics}
                </p>
              </div>

              <div className="space-y-1.5">
                {diagnostics.detailed_actions?.map((act, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-mono flex items-start justify-between">
                    <div>
                      <div className="text-emerald-400 font-bold flex items-center">
                        <ChevronRight className="w-3.5 h-3.5 mr-1" />
                        {act.action}
                        <span className="text-slate-500 font-normal ml-2">[{act.target}]</span>
                      </div>
                      <div className="text-slate-300 text-[11px] mt-0.5 font-sans">
                        {act.rationale}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-[10px] flex-shrink-0 ml-2">
                      {act.parameter}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs font-mono space-y-2">
              <Bot className="w-8 h-8 text-slate-600" />
              <p>Click "Optimize System" to trigger autonomous Gemini 2.5 Flash building recommendations.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: ESG Carbon Credit Certificate */}
      {activeTab === 'certificate' && (
        <div className="flex-1 space-y-3 font-mono text-xs overflow-y-auto max-h-[260px] pr-1">
          {diagnostics?.carbon_report ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-[#0d1612] border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-bold text-xs uppercase">
                    ESG Carbon Offset Certificate
                  </span>
                </div>
                <button
                  onClick={downloadCertificate}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] flex items-center space-x-1"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>Download .txt</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Daily Absorption</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {diagnostics.carbon_report.co2_absorbed_kg_day} kg CO2
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Verified Credits</div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">
                    {diagnostics.carbon_report.carbon_credits_earned} tCO2e
                  </div>
                </div>
              </div>

              <div className="text-slate-300 text-xs font-sans leading-relaxed">
                <span className="font-bold text-emerald-400 font-mono">Rating: {diagnostics.carbon_report.esg_compliance_score}</span> — {diagnostics.carbon_report.summary}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs font-mono space-y-2">
              <FileCheck2 className="w-8 h-8 text-slate-600" />
              <p>Run system optimization to generate cryptographic ESG carbon certificate.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
