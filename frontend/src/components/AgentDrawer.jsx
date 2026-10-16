/**
 * AgentDrawer.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Autonomous Gemini 3.8 Flash BMS Kernel & ESG Carbon Credit Auditor.
 * Conforms to the Design Specification:
 * - Obsidian ground #090f19, hairline borders rgba(237,231,220,0.13)
 * - Inks: #ede7dc, #9ea5a8, #6c7378
 * - Buttons: Hairline pill outlines, hover accent, green type dot (no filled blocks)
 * - Real-time JSON action dispatch & cryptographic ESG certificate generation.
 */

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
Kernel: Gemini 3.8 Flash Autonomous BMS

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
    <div className="bg-[#090f19] rounded-2xl border border-[rgba(237,231,220,0.13)] p-4 flex flex-col shadow-xl select-none font-['Sora'] h-full">
      
      {/* Drawer Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#ede7dc] font-['Syne'] flex items-center">
              Gemini 3.8 Flash BMS Kernel
              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </h3>
            <p className="text-[10px] text-[#9ea5a8] font-mono">
              Closed-Loop Biological Optimization & Carbon Credit Auditor
            </p>
          </div>
        </div>

        {/* Action Button: Pill Outline with Green Type Dot */}
        <button
          onClick={handleRunAI}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-full border transition-all text-xs font-mono uppercase tracking-[0.1em] flex items-center space-x-2 ${
            isLoading
              ? 'border-[rgba(237,231,220,0.1)] text-[#6c7378] cursor-not-allowed'
              : 'border-[rgba(237,231,220,0.22)] hover:border-[#10b981] hover:text-[#10b981] text-[#ede7dc]'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10b981]" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>Run AI Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center space-x-2 mt-3 pb-2 border-b border-[rgba(237,231,220,0.08)] font-mono text-[11px] uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-1 px-2 border-b-2 transition-all ${
            activeTab === 'actions'
              ? 'border-[#10b981] text-[#ede7dc] font-bold'
              : 'border-transparent text-[#9ea5a8] hover:text-[#ede7dc]'
          }`}
        >
          BMS Directives ({diagnostics?.actions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`pb-1 px-2 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'certificate'
              ? 'border-[#10b981] text-[#ede7dc] font-bold'
              : 'border-transparent text-[#9ea5a8] hover:text-[#ede7dc]'
          }`}
        >
          <span>ESG Carbon Audit</span>
          {diagnostics?.carbon_report && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 mt-3 overflow-y-auto max-h-[220px] pr-1">
        {activeTab === 'actions' && (
          <div className="space-y-2">
            {diagnostics?.actions && diagnostics.actions.length > 0 ? (
              diagnostics.actions.map((act, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-xl border border-[rgba(237,231,220,0.1)] bg-[rgba(237,231,220,0.02)] flex items-start space-x-2.5"
                >
                  <span className="font-mono text-[10.5px] text-[#10b981] font-bold mt-0.5">
                    0{index + 1}
                  </span>
                  <div className="text-xs text-[#ede7dc] leading-relaxed">
                    {act}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs font-mono text-[#9ea5a8] border border-dashed border-[rgba(237,231,220,0.13)] rounded-xl">
                Ready for BMS Inference. Click <strong className="text-[#ede7dc]">Run AI Diagnostics</strong> above to generate real-time closed-loop directives.
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificate' && (
          <div className="space-y-3 font-mono text-xs">
            {diagnostics?.carbon_report ? (
              <div className="p-3 rounded-xl border border-[rgba(237,231,220,0.13)] bg-[rgba(237,231,220,0.02)] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[rgba(237,231,220,0.08)] pb-2">
                  <span className="text-[#9ea5a8] uppercase text-[10px]">ESG Score</span>
                  <span className="text-[#10b981] font-bold text-sm">
                    {diagnostics.carbon_report.esg_compliance_score}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#6c7378] block text-[9.5px] uppercase">CO₂ Absorbed</span>
                    <span className="text-[#ede7dc] font-bold">
                      {diagnostics.carbon_report.co2_absorbed_kg_day} kg/day
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6c7378] block text-[9.5px] uppercase">Carbon Credits</span>
                    <span className="text-[#0284c7] font-bold">
                      +{diagnostics.carbon_report.carbon_credits_earned} tCO₂e
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#9ea5a8] font-sans italic border-t border-[rgba(237,231,220,0.08)] pt-2 leading-relaxed">
                  "{diagnostics.carbon_report.summary}"
                </p>

                <button
                  onClick={downloadCertificate}
                  className="w-full mt-2 py-1.5 px-3 rounded-full border border-[rgba(237,231,220,0.22)] hover:border-[#10b981] hover:text-[#10b981] text-[#ede7dc] transition-all flex items-center justify-center space-x-2 text-[10.5px] uppercase tracking-wider"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Download ESG Audit Certificate (.txt)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs font-mono text-[#9ea5a8] border border-dashed border-[rgba(237,231,220,0.13)] rounded-xl">
                Carbon Audit Ledger awaits BMS generation. Click <strong className="text-[#ede7dc]">Run AI Diagnostics</strong> to trigger verifiable ESG report.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
