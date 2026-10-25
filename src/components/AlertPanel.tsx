import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, X } from 'lucide-react';
import { SecurityAlert } from '../types';

interface AlertPanelProps {
  alerts: SecurityAlert[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const [inspectAlert, setInspectAlert] = useState<SecurityAlert | null>(null);

  if (alerts.length === 0) {
    return (
      <div className="bg-[#101827] border border-[#263449] rounded-xl p-8 text-center shadow-sm">
        <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2.5" />
        <h3 className="text-sm font-bold text-slate-200">No Alerts Active</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          No suspicious activity recorded yet. Run the simulation to see Breadcrumb tripwires in action.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#263449]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Deception Sentinel Alerts</h2>
        </div>
        <span className="text-xs sm:text-sm font-mono text-rose-300 font-bold bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-md">
          {alerts.length} Critical
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="bg-[#151F30] border border-rose-500/40 rounded-xl p-4 sm:p-4.5 space-y-2.5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-mono font-bold text-rose-400">{alt.id}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm sm:text-base font-bold text-white">{alt.title}</span>
                </div>
                <p className="text-sm text-slate-200 mt-1.5 leading-relaxed font-normal">{alt.reason}</p>
              </div>
              <span className="text-xs sm:text-sm font-mono text-slate-400 whitespace-nowrap font-medium">
                {new Date(alt.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="pt-2.5 flex items-center justify-between text-xs sm:text-sm font-mono border-t border-[#263449]/70">
              <span className="text-slate-300">
                Target: <strong className="text-white">{alt.hostId}</strong>
              </span>
              <button
                type="button"
                onClick={() => setInspectAlert(alt)}
                className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 font-bold cursor-pointer hover:underline"
              >
                <span>Inspect Evidence</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Evidence Modal */}
      {inspectAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#101827] border border-[#263449] rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3.5 border-b border-[#263449]">
              <div>
                <span className="text-xs font-mono uppercase text-rose-400 font-bold tracking-wider">
                  Incident Evidence Record
                </span>
                <h3 className="text-base font-bold font-mono text-white mt-1">
                  {inspectAlert.id}: {inspectAlert.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectAlert(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#151F30] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm font-mono">
              <div className="p-3.5 bg-[#0C1322] border border-[#263449] rounded-lg space-y-2">
                <div>
                  <span className="text-slate-400 font-medium">Alert Reason:</span>
                  <p className="text-slate-100 mt-1 leading-relaxed font-normal">{inspectAlert.reason}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Detected Vector:</span>
                  <p className="text-cyan-300 mt-1 font-bold text-sm">
                    {inspectAlert.originHost} → {inspectAlert.hostId}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-300 block mb-1.5 font-medium">Telemetry Payload Evidence:</span>
                <pre className="p-3.5 bg-[#080D18] border border-[#263449] rounded-lg text-xs sm:text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed font-normal">
                  {JSON.stringify(inspectAlert.evidence, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectAlert(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-200 bg-[#151F30] hover:bg-[#1E2D44] border border-[#263449] rounded-md cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
