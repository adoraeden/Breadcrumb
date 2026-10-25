import React from 'react';
import { Server, AlertTriangle, Eye, GitCommit } from 'lucide-react';
import { SystemMetrics } from '../types';

interface MetricsCardsProps {
  metrics: SystemMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'hosts',
      label: 'Simulated Hosts',
      value: metrics.totalHosts,
      subValue: metrics.affectedHosts > 0 ? `${metrics.affectedHosts} hosts affected` : '5 / 5 hosts healthy',
      icon: Server,
      accent: metrics.affectedHosts > 0 ? 'text-amber-400' : 'text-slate-100',
      badgeColor: metrics.affectedHosts > 0 ? 'text-amber-300' : 'text-emerald-400',
    },
    {
      id: 'incidents',
      label: 'Active Incidents',
      value: metrics.activeIncidents,
      subValue: metrics.activeIncidents > 0 ? 'Adversary hop tripped' : '0 open investigations',
      icon: AlertTriangle,
      accent: metrics.activeIncidents > 0 ? 'text-rose-400' : 'text-slate-100',
      badgeColor: metrics.activeIncidents > 0 ? 'text-rose-400' : 'text-slate-400',
    },
    {
      id: 'decoys',
      label: 'Decoy Interactions',
      value: metrics.decoyInteractions,
      subValue: 'Recorded honeytoken accesses',
      icon: Eye,
      accent: metrics.decoyInteractions > 0 ? 'text-cyan-400' : 'text-slate-100',
      badgeColor: metrics.decoyInteractions > 0 ? 'text-cyan-300' : 'text-slate-400',
    },
    {
      id: 'hops',
      label: 'Observed Attack Hops',
      value: metrics.observedAttackHops,
      subValue: 'Reconstructed lateral vectors',
      icon: GitCommit,
      accent: metrics.observedAttackHops > 0 ? 'text-purple-400' : 'text-slate-100',
      badgeColor: metrics.observedAttackHops > 0 ? 'text-purple-300' : 'text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-[#151F30] border border-[#263449] rounded-xl p-5 transition-all hover:border-[#3b4d66] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">{card.label}</span>
              <div className="p-2 rounded-lg bg-[#0C1322] border border-[#263449]">
                <Icon className={`w-5 h-5 ${card.accent}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight ${card.accent}`}>
                {card.value}
              </span>
            </div>
            <p className={`mt-2 text-xs sm:text-sm font-mono font-medium ${card.badgeColor}`}>
              {card.subValue}
            </p>
          </div>
        );
      })}
    </div>
  );
};
