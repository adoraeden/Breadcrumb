import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { DecoyAsset } from '../types';

interface DecoyVaultProps {
  decoys: DecoyAsset[];
}

export const DecoyVault: React.FC<DecoyVaultProps> = ({ decoys }) => {
  const [selectedDecoyId, setSelectedDecoyId] = useState<string | null>(null);
  const [filterHost, setFilterHost] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDecoys = decoys.filter((d) => {
    if (filterHost !== 'all' && d.originHost !== filterHost) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  const selectedDecoy = decoys.find((d) => d.id === selectedDecoyId) || decoys[0];

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Decoy Honeytoken Registry</h2>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Active seeded tripwires, fake credentials, and deterministic provenance tags
            </p>
          </div>

          {/* Interactive Filters (Buttons / Selectors) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-300 font-mono font-medium text-xs sm:text-sm">Host:</span>
              <select
                value={filterHost}
                onChange={(e) => setFilterHost(e.target.value)}
                className="bg-[#151F30] border border-[#263449] hover:border-slate-500 text-slate-100 text-xs sm:text-sm px-3 py-1.5 rounded-md focus:outline-none focus:border-cyan-400 font-mono cursor-pointer font-medium"
              >
                <option value="all">All Hosts</option>
                <option value="web-01">web-01</option>
                <option value="dev-laptop">dev-laptop</option>
                <option value="fileserver">fileserver</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-300 font-mono font-medium text-xs sm:text-sm">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#151F30] border border-[#263449] hover:border-slate-500 text-slate-100 text-xs sm:text-sm px-3 py-1.5 rounded-md focus:outline-none focus:border-cyan-400 font-mono cursor-pointer font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Planted">Planted</option>
                <option value="Triggered">Triggered</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Decoys Table & Detailed Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Decoys List */}
        <div className="lg:col-span-2 space-y-3.5">
          {filteredDecoys.map((decoy) => {
            const isSelected = selectedDecoy?.id === decoy.id;
            const isTriggered = decoy.status === 'Triggered';

            return (
              <div
                key={decoy.id}
                onClick={() => setSelectedDecoyId(decoy.id)}
                className={`bg-[#151F30] border rounded-xl p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-400 shadow-sm shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                    : 'border-[#263449] hover:border-[#3b4d66]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold font-mono text-cyan-300">
                        {decoy.id}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-sm font-bold text-white">{decoy.name}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {decoy.description}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 text-left sm:text-right">
                    {isTriggered ? (
                      <span className="text-xs sm:text-sm font-mono font-bold text-rose-300 flex items-center gap-1.5 justify-start sm:justify-end bg-rose-500/15 border border-rose-500/40 px-2.5 py-1 rounded-md">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Triggered
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300 flex items-center gap-1.5 justify-start sm:justify-end bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Planted
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400 font-medium mt-1.5 block">
                      {decoy.interactionCount} {decoy.interactionCount === 1 ? 'interaction' : 'interactions'}
                    </span>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="mt-4 pt-3.5 border-t border-[#263449]/80 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-mono">
                  <span>Origin: <span className="text-white font-semibold">{decoy.originHost}</span></span>
                  <span className="text-slate-600">·</span>
                  <span>File: <span className="text-white font-semibold">{decoy.originFile}</span></span>
                  <span className="text-slate-600">·</span>
                  <span>Type: <span className="text-white font-semibold">{decoy.type}</span></span>
                  {decoy.observedTargets.length > 0 && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-300 font-bold">
                        Target attempted: {decoy.observedTargets.join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Decoy Detail & Honeytoken Dossier */}
        <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 flex flex-col space-y-4.5 shadow-sm">
          <div className="border-b border-[#263449] pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Honeytoken Dossier
            </span>
            <h3 className="text-base font-bold font-mono text-white mt-1">
              {selectedDecoy.id}
            </h3>
            <p className="text-sm text-slate-300 font-medium mt-0.5">{selectedDecoy.name}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-mono font-medium mb-1">Planted Host Location:</span>
              <p className="text-slate-100 font-mono text-xs sm:text-sm bg-[#0C1322] border border-[#263449] p-3 rounded-lg font-medium">
                {selectedDecoy.originHost}:/{selectedDecoy.originFile}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-mono font-medium mb-1">Simulated Decoy File Content:</span>
              <pre className="text-xs sm:text-sm font-mono text-cyan-200 bg-[#080D18] border border-[#263449] p-3.5 rounded-lg overflow-x-auto leading-relaxed whitespace-pre-wrap font-medium">
                {selectedDecoy.fakePayload}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:text-sm">
              <div className="bg-[#151F30] p-3 rounded-lg border border-[#263449]">
                <span className="text-slate-400 text-xs block font-medium">Intended Lure Target:</span>
                <span className="text-slate-100 font-bold mt-1 block">
                  {selectedDecoy.intendedTarget}
                </span>
              </div>
              <div className="bg-[#151F30] p-3 rounded-lg border border-[#263449]">
                <span className="text-slate-400 text-xs block font-medium">Interaction Count:</span>
                <span className="text-slate-100 font-bold mt-1 block tabular-nums">
                  {selectedDecoy.interactionCount}
                </span>
              </div>
            </div>

            {/* Observed Traversal History */}
            <div className="bg-[#151F30] border border-[#263449] p-4 rounded-lg space-y-2.5">
              <span className="text-slate-200 font-bold text-sm flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                Observed Lateral Traversal History
              </span>
              {selectedDecoy.observedTargets.length > 0 ? (
                <div className="space-y-1.5 font-mono text-xs sm:text-sm">
                  {selectedDecoy.observedTargets.map((target, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-rose-300 font-medium">
                      <span>{selectedDecoy.originHost}</span>
                      <span className="text-slate-500 font-bold">→</span>
                      <span className="font-bold underline">{target}</span>
                      <span className="text-xs text-slate-400">(Simulated Attempt)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs sm:text-sm italic">
                  No lateral attempts recorded for this decoy yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
