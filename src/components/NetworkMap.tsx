import React from 'react';
import { Server, Database, HardDrive, Laptop, ShieldCheck } from 'lucide-react';
import { HostNode, AttackHop } from '../types';

interface NetworkMapProps {
  hosts: HostNode[];
  activeHops: AttackHop[];
  selectedHostId: string | null;
  onSelectHost: (host: HostNode) => void;
}

// Predefined node positions in an 800x440 SVG canvas
const NODE_POSITIONS: Record<string, { x: number; y: number; label: string; icon: any }> = {
  'web-01': { x: 170, y: 130, label: 'Web Server', icon: Server },
  'fileserver': { x: 400, y: 100, label: 'File Storage', icon: HardDrive },
  'dev-laptop': { x: 170, y: 320, label: 'Dev Workstation', icon: Laptop },
  'db-01': { x: 420, y: 320, label: 'Database Cluster', icon: Database },
  'backup-01': { x: 640, y: 210, label: 'Backup Vault', icon: ShieldCheck },
};

// Standard passive infrastructure links
const BASE_LINKS = [
  { source: 'web-01', target: 'fileserver' },
  { source: 'web-01', target: 'db-01' },
  { source: 'dev-laptop', target: 'fileserver' },
  { source: 'dev-laptop', target: 'db-01' },
  { source: 'db-01', target: 'backup-01' },
  { source: 'fileserver', target: 'backup-01' },
];

export const NetworkMap: React.FC<NetworkMapProps> = ({
  hosts,
  activeHops,
  selectedHostId,
  onSelectHost,
}) => {
  return (
    <div className="bg-[#101827] border border-[#263449] rounded-xl p-5 sm:p-6 flex flex-col shadow-sm">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">Simulated Network Topology</h2>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-1 rounded-md">
              Active Graph
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Real-time node telemetry and observed simulated authentication attempt vectors
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono font-semibold self-start sm:self-auto">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400"></span>
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-400"></span>
            <span>Observed Activity</span>
          </div>
          <div className="flex items-center gap-2 text-rose-300">
            <span className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-400"></span>
            <span>Incident</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden my-3 select-none">
        <svg
          viewBox="0 0 800 440"
          className="w-full h-auto max-h-[500px] block"
          style={{ minHeight: '360px' }}
        >
          <defs>
            {/* Markers for lateral attack hops */}
            <marker
              id="attack-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
            </marker>

            {/* Glowing filter for compromised vectors */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background grid dots for technical aesthetic */}
          <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="#1C2A42" />
          </pattern>
          <rect width="800" height="440" fill="url(#dot-grid)" opacity="0.9" />

          {/* Subnet Zone Labels */}
          <text x="170" y="38" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
            INGRESS / DMZ & WORKSTATIONS
          </text>
          <line x1="285" y1="45" x2="285" y2="400" stroke="#1E2D44" strokeDasharray="4 4" />

          <text x="415" y="38" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
            INTERNAL CORE INFRASTRUCTURE
          </text>
          <line x1="535" y1="45" x2="535" y2="400" stroke="#1E2D44" strokeDasharray="4 4" />

          <text x="640" y="38" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
            ISOLATED COLD VAULT
          </text>

          {/* Base Passive Network Lines */}
          {BASE_LINKS.map((link, idx) => {
            const src = NODE_POSITIONS[link.source];
            const dst = NODE_POSITIONS[link.target];
            if (!src || !dst) return null;
            return (
              <line
                key={`base-${idx}`}
                x1={src.x}
                y1={src.y}
                x2={dst.x}
                y2={dst.y}
                stroke="#1E2B3E"
                strokeWidth="1.75"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Active Observed Attack Hops (Animated Red/Cyan tracer) */}
          {activeHops.map((hop) => {
            const src = NODE_POSITIONS[hop.source];
            const dst = NODE_POSITIONS[hop.target];
            if (!src || !dst) return null;

            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2 - 16;

            return (
              <g key={hop.id} filter="url(#glow)">
                {/* Background glow line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="#EF4444"
                  strokeWidth="3.5"
                  opacity="0.45"
                />
                {/* Foreground animated pulsed tracer */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="#F87171"
                  strokeWidth="2.75"
                  strokeDasharray="7 7"
                  markerEnd="url(#attack-arrow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="28;0"
                    dur="0.85s"
                    repeatCount="indefinite"
                  />
                </line>

                {/* Vector Tag Badge */}
                <rect
                  x={midX - 75}
                  y={midY - 12}
                  width="150"
                  height="24"
                  rx="4"
                  fill="#101827"
                  stroke="#EF4444"
                  strokeWidth="1.25"
                />
                <text
                  x={midX}
                  y={midY + 5}
                  textAnchor="middle"
                  fill="#FECDD3"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  PIVOT: {hop.decoyId}
                </text>
              </g>
            );
          })}

          {/* Host Nodes */}
          {hosts.map((host) => {
            const pos = NODE_POSITIONS[host.id];
            if (!pos) return null;

            const isSelected = selectedHostId === host.id;
            const isIncident = host.status === 'Incident';
            const isObserved = host.status === 'Observed Activity';

            // Visual styles according to status
            let borderColor = '#263449';
            let fillColor = '#151F30';
            let textColor = '#F8FAFC';
            let statusText = 'Healthy';
            let statusColor = '#94A3B8';

            if (isIncident) {
              borderColor = '#EF4444';
              fillColor = '#24141E';
              textColor = '#FECDD3';
              statusText = 'Incident';
              statusColor = '#F87171';
            } else if (isObserved) {
              borderColor = '#F59E0B';
              fillColor = '#241D14';
              textColor = '#FDE68A';
              statusText = 'Observed';
              statusColor = '#FBBF24';
            }

            if (isSelected) {
              borderColor = '#22D3EE';
            }

            return (
              <g
                key={host.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectHost(host)}
                className="cursor-pointer transition-all duration-200 group"
              >
                {/* Node Box */}
                <rect
                  x="-80"
                  y="-38"
                  width="160"
                  height="76"
                  rx="8"
                  fill={fillColor}
                  stroke={borderColor}
                  strokeWidth={isSelected ? 2.5 : 1.75}
                  className="transition-colors group-hover:stroke-cyan-400"
                />

                {/* Host Name & Role */}
                <text
                  x="0"
                  y="-14"
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  {host.id}
                </text>

                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fill="#CBD5E1"
                  fontSize="11.5"
                  fontWeight="500"
                  fontFamily="Plus Jakarta Sans"
                >
                  {pos.label}
                </text>

                {/* Host IP & Status Indicator */}
                <text
                  x="-68"
                  y="25"
                  textAnchor="start"
                  fill="#94A3B8"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="JetBrains Mono"
                >
                  {host.ip}
                </text>

                <text
                  x="68"
                  y="25"
                  textAnchor="end"
                  fill={statusColor}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  {statusText}
                </text>

                {/* Event Count Badge (if any) */}
                {(host.eventCount || 0) > 0 && (
                  <g transform="translate(70, -32)">
                    <circle r="10" fill="#EF4444" />
                    <text
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {host.eventCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Notice */}
      <div className="pt-3.5 border-t border-[#263449] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-300">
        <span className="text-slate-400 font-medium">
          SIMULATED NETWORK — NOT CONNECTED TO REAL HOSTS
        </span>
        <span className="text-cyan-300 font-semibold">
          Click any host node to inspect simulated filesystem & telemetry
        </span>
      </div>
    </div>
  );
};
