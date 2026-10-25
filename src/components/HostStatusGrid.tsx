import React from 'react';
import { Server, Database, HardDrive, Laptop, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { HostNode } from '../types';

interface HostStatusGridProps {
  hosts: HostNode[];
  onSelectHost: (host: HostNode) => void;
}

export const HostStatusGrid: React.FC<HostStatusGridProps> = ({ hosts, onSelectHost }) => {
  const getHostIcon = (role: string) => {
    if (role.includes('Database')) return Database;
    if (role.includes('Storage')) return HardDrive;
    if (role.includes('Workstation')) return Laptop;
    if (role.includes('Backup')) return ShieldCheck;
    return Server;
  };

  return (
    <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#263449]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            Simulated Host Infrastructure
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            5 monitored nodes with active canary decoys and honeypot instrumentation
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 font-medium self-start sm:self-auto">
          Click any card to inspect files & logs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
        {hosts.map((host) => {
          const Icon = getHostIcon(host.role);
          const isIncident = host.status === 'Incident';
          const isObserved = host.status === 'Observed Activity';

          return (
            <div
              key={host.id}
              onClick={() => onSelectHost(host)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isIncident
                  ? 'bg-[#24141E] border-rose-500/60 hover:border-rose-400 shadow-sm shadow-rose-950/40 ring-1 ring-rose-500/30'
                  : isObserved
                  ? 'bg-[#241D14] border-amber-500/60 hover:border-amber-400 shadow-sm shadow-amber-950/40 ring-1 ring-amber-500/30'
                  : 'bg-[#151F30] border-[#263449] hover:border-cyan-400/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-md ${
                    isIncident ? 'bg-rose-950/50 text-rose-400' : isObserved ? 'bg-amber-950/50 text-amber-400' : 'bg-cyan-950/50 text-cyan-400'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs font-mono text-slate-300 font-medium">
                    {host.zone}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-sm font-bold font-mono text-slate-100 block tracking-tight">
                    {host.id}
                  </span>
                  <span className="text-xs text-slate-300 block truncate mt-0.5 font-medium">
                    {host.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#263449]/70 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-300 font-medium">{host.ip}</span>
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isIncident
                      ? 'text-rose-300'
                      : isObserved
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {isIncident ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  ) : isObserved ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {host.status === 'Observed Activity' ? 'Observed' : host.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
