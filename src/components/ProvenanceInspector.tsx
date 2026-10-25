import React from 'react';
import { GitBranch, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { SecurityIncident, DecoyAsset } from '../types';

interface ProvenanceInspectorProps {
  incident: SecurityIncident | null;
  decoys: DecoyAsset[];
}

export const ProvenanceInspector: React.FC<ProvenanceInspectorProps> = ({
  incident,
  decoys,
}) => {
  const triggeredDecoy = decoys.find((d) => d.status === 'Triggered') || decoys[0];

  return (
    <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#263449]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5 tracking-tight">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            Credential Provenance & Lateral Path Reconstruction
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Deterministic attribution mapping seeded origins directly to adversary pivot attempts
          </p>
        </div>
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-3 py-1 rounded-md self-start sm:self-auto">
          Attribution Engine
        </span>
      </div>

      {/* Visual Provenance Vector Flow */}
      <div className="bg-[#0D1524] border border-[#263449] rounded-xl p-5">
        <div className="text-xs font-mono text-slate-400 mb-3.5 uppercase tracking-wider font-semibold">
          Reconstructed Vector Pipeline
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-mono">
          {/* Node 1: Origin */}
          <div className="w-full md:w-1/3 bg-[#151F30] border border-[#263449] p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
              <span>Seeded Origin</span>
              <span className="text-emerald-400 font-bold">Planted Baseline</span>
            </div>
            <div className="text-base font-bold text-white">
              {triggeredDecoy.originHost}
            </div>
            <div className="text-xs text-slate-300 truncate mt-1 font-medium">
              File: {triggeredDecoy.originFile}
            </div>
          </div>

          {/* Transition Arrow / Honeytoken */}
          <div className="flex flex-col items-center justify-center shrink-0 my-1 md:my-0">
            <span className="text-xs text-cyan-300 font-bold px-3 py-1.5 rounded-md bg-cyan-950/90 border border-cyan-700/60 shadow-xs">
              {triggeredDecoy.id}
            </span>
            <div className="flex items-center text-slate-500 mt-1.5">
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          {/* Node 2: Observed Target */}
          <div className="w-full md:w-1/3 bg-[#151F30] border border-rose-500/40 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
              <span>Observed Attempt Target</span>
              <span className="text-rose-400 font-bold">Tripwire Intercept</span>
            </div>
            <div className="text-base font-bold text-rose-300">
              {triggeredDecoy.observedTargets[0] || triggeredDecoy.intendedTarget}
            </div>
            <div className="text-xs text-slate-300 truncate mt-1 font-medium">
              Auth: Simulated Service Connection Attempt
            </div>
          </div>
        </div>
      </div>

      {/* Distinction: Observed Evidence vs Inferred Movement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        {/* Box A: Observed Evidence */}
        <div className="bg-[#151F30] border border-[#263449] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Observed Evidence (Empirically Recorded)</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Events explicitly recorded by the Breadcrumb simulator:
          </p>
          <ul className="space-y-2 text-slate-200 font-mono text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">·</span>
              <span>
                <strong>T1552.001:</strong> File <code className="text-cyan-300 font-semibold">{triggeredDecoy.originFile}</code> read on host <code className="text-cyan-300 font-semibold">{triggeredDecoy.originHost}</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">·</span>
              <span>
                <strong>T1078:</strong> Token <code className="text-cyan-300 font-semibold">{triggeredDecoy.id}</code> used in an observed simulated authentication attempt against <code className="text-rose-300 font-semibold">{triggeredDecoy.observedTargets[0] || 'destination'}</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">·</span>
              <span>
                <strong>Attribution:</strong> This decoy has no legitimate use in the simulation, enabling attribution to its known planted origin.
              </span>
            </li>
          </ul>
        </div>

        {/* Box B: Inferred Movement */}
        <div className="bg-[#151F30] border border-[#263449] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Inferred Activity (Hypothesized Progression)</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Plausible progression deduced from token provenance:
          </p>
          <ul className="space-y-2 text-slate-200 text-xs sm:text-sm font-mono">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">·</span>
              <span>Adversary established initial access on <code className="text-white font-semibold">{triggeredDecoy.originHost}</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">·</span>
              <span>Adversary discovered plaintext deployment notes during discovery commands.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">·</span>
              <span>Adversary initiated an observed simulated authentication attempt against <code className="text-white font-semibold">{triggeredDecoy.intendedTarget}</code> assuming valid administrative access (connection was intercepted and rejected).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
