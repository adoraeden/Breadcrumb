import React, { useState } from 'react';
import { Clock, ShieldAlert, FileSearch, KeyRound, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { SecurityEvent } from '../types';

interface IncidentTimelineProps {
  events: SecurityEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSeverityStyle = (sev: SecurityEvent['severity']) => {
    switch (sev) {
      case 'Critical':
        return 'text-rose-300 border-rose-500/40 bg-rose-500/15';
      case 'Warning':
        return 'text-amber-300 border-amber-500/40 bg-amber-500/15';
      default:
        return 'text-cyan-300 border-cyan-500/40 bg-cyan-500/15';
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'CREDENTIAL_USE':
        return KeyRound;
      case 'DISCOVERY':
        return FileSearch;
      case 'ALERT_RAISED':
      case 'INCIDENT_OPENED':
        return ShieldAlert;
      default:
        return Terminal;
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-[#101827] border border-[#263449] rounded-xl p-12 sm:p-16 text-center shadow-sm">
        <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3.5" />
        <h3 className="text-base font-bold text-white">No Security Events Recorded Yet</h3>
        <p className="text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
          Execute commands in the Attack Simulator (e.g., <code className="text-cyan-300 font-mono">cat deployment_notes.txt</code>) or click <strong>"Run Attack Demo"</strong> in the top header to observe event generation in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#263449]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5 tracking-tight">
            <Clock className="w-5 h-5 text-cyan-400" />
            Security Event Timeline
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Chronological audit trail of recorded file discovery and honeytoken lateral auth attempts
          </p>
        </div>
        <span className="text-xs sm:text-sm font-mono text-slate-300 font-semibold self-start sm:self-auto">
          {events.length} {events.length === 1 ? 'event' : 'events'} recorded
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        {events.map((evt) => {
          const Icon = getEventIcon(evt.type);
          const isExpanded = expandedId === evt.id;
          const sevClass = getSeverityStyle(evt.severity);

          return (
            <div
              key={evt.id}
              className="bg-[#151F30] border border-[#263449] rounded-xl transition-all hover:border-[#3b4d66] overflow-hidden shadow-xs"
            >
              {/* Event Header Row */}
              <div
                onClick={() => toggleExpand(evt.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-lg border shrink-0 ${sevClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm sm:text-base font-mono font-bold text-white">
                        {evt.id}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs sm:text-sm font-bold text-cyan-200">
                        {evt.type.replace(/_/g, ' ')}
                      </span>
                      {evt.mitreTechnique && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-mono font-semibold text-purple-300 bg-purple-950/50 border border-purple-800/50 px-2 py-0.5 rounded">
                            MITRE {evt.mitreTechnique}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm sm:text-[15px] text-slate-200 mt-1.5 leading-relaxed font-normal">
                      {evt.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-mono text-slate-400 font-medium whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Evidence Drawer */}
              {isExpanded && (
                <div className="bg-[#0C1322] px-5 py-4 border-t border-[#263449] text-xs sm:text-sm font-mono space-y-3">
                  <div className="text-xs text-cyan-300 uppercase tracking-wider font-bold">
                    Technical Evidence Record
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-200">
                    <div>
                      <span className="text-slate-400 font-medium">Source Host:</span> <strong className="text-white">{evt.sourceHost}</strong>
                    </div>
                    {evt.targetHost && (
                      <div>
                        <span className="text-slate-400 font-medium">Target Host:</span> <strong className="text-rose-300">{evt.targetHost}</strong>
                      </div>
                    )}
                    {evt.decoyId && (
                      <div>
                        <span className="text-slate-400 font-medium">Honeytoken ID:</span> <strong className="text-cyan-300">{evt.decoyId}</strong>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 font-medium">Server Timestamp:</span> <span className="text-slate-300">{evt.timestamp}</span>
                    </div>
                  </div>

                  {/* Raw Evidence Payload */}
                  <div className="mt-2.5">
                    <span className="text-slate-400 text-xs block font-medium mb-1">Payload Details:</span>
                    <pre className="p-3 bg-[#080D18] border border-[#263449] rounded-lg text-xs sm:text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(evt.evidence, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
