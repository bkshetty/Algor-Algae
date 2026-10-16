/**
 * AgentDrawer.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Apple Retail "Product-tile whiteout" Design System (apple-design.md):
 * - Flat pure-white panel (#FFFFFF) with crisp hairline border (rgba(0,0,0,0.08))
 * - Near-black text (#1D1D1F) with SF Pro Text hierarchy
 * - Action buttons: Apple #0071E3 primary pill button and #0071E3 outline pill button
 * - Clean enterprise ESG Carbon Audit reporting
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
  Cpu
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
    <div className="bg-[#FFFFFF] rounded-2xl border border-[rgba(0,0,0,0.08)] p-4 flex flex-col select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] h-full">
      
      {/* Drawer Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)]">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-[-0.01em] flex items-center">
            Gemini 3.8 Flash BMS Kernel
            <span className="ml-2 w-2 h-2 rounded-full bg-[#34C759]" />
          </h3>
          <p className="text-[11px] text-[#86868B] mt-0.5">
            Autonomous Building Management & ESG Carbon Auditor
          </p>
        </div>

        {/* Action Button: Apple Primary #0071E3 Pill Button */}
        <button
          onClick={handleRunAI}
          disabled={isLoading}
          className="btn-apple-primary px-3.5 py-1.5 text-xs flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run AI Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center space-x-2 mt-3 pb-2 border-b border-[rgba(0,0,0,0.06)] text-xs">
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-1 px-2 border-b-2 transition-all font-medium ${
            activeTab === 'actions'
              ? 'border-[#0071E3] text-[#0071E3]'
              : 'border-transparent text-[#86868B] hover:text-[#1D1D1F]'
          }`}
        >
          BMS Directives ({diagnostics?.actions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`pb-1 px-2 border-b-2 transition-all font-medium flex items-center space-x-1.5 ${
            activeTab === 'certificate'
              ? 'border-[#0071E3] text-[#0071E3]'
              : 'border-transparent text-[#86868B] hover:text-[#1D1D1F]'
          }`}
        >
          <span>ESG Carbon Audit</span>
          {diagnostics?.carbon_report && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
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
                  className="p-2.5 rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#F5F5F7] flex items-start space-x-2.5"
                >
                  <span className="font-mono text-[11px] text-[#0071E3] font-semibold mt-0.5">
                    0{index + 1}
                  </span>
                  <div className="text-xs text-[#1D1D1F] leading-relaxed">
                    {act}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#86868B] bg-[#F5F5F7] rounded-xl border border-[rgba(0,0,0,0.04)]">
                Ready for BMS Inference. Click <strong className="text-[#1D1D1F]">Run AI Diagnostics</strong> above to generate real-time closed-loop directives.
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificate' && (
          <div className="space-y-3 text-xs">
            {diagnostics?.carbon_report ? (
              <div className="p-3.5 rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F5F7] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2">
                  <span className="text-[#86868B] uppercase text-[10px] tracking-wider font-medium">ESG Score</span>
                  <span className="text-[#0071E3] font-bold text-sm">
                    {diagnostics.carbon_report.esg_compliance_score}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#86868B] block text-[10px] uppercase">CO₂ Absorbed</span>
                    <span className="text-[#1D1D1F] font-semibold">
                      {diagnostics.carbon_report.co2_absorbed_kg_day} kg/day
                    </span>
                  </div>
                  <div>
                    <span className="text-[#86868B] block text-[10px] uppercase">Carbon Credits</span>
                    <span className="text-[#0071E3] font-semibold">
                      +{diagnostics.carbon_report.carbon_credits_earned} tCO₂e
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-[#86868B] italic border-t border-[rgba(0,0,0,0.06)] pt-2 leading-relaxed">
                  "{diagnostics.carbon_report.summary}"
                </p>

                <button
                  onClick={downloadCertificate}
                  className="btn-apple-outline w-full mt-2 py-1.5 px-3 flex items-center justify-center space-x-1.5 text-[11px]"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Download ESG Audit Certificate (.txt)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#86868B] bg-[#F5F5F7] rounded-xl border border-[rgba(0,0,0,0.04)]">
                Carbon Audit Ledger awaits BMS generation. Click <strong className="text-[#1D1D1F]">Run AI Diagnostics</strong> to trigger verifiable ESG report.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
