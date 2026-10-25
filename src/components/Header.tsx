import React from 'react';
import { Play, RotateCcw, ShieldAlert, CheckCircle2, Menu } from 'lucide-react';
import { SimulationState } from '../types';

interface HeaderProps {
  state: SimulationState | null;
  activeSection: string;
  onReset: () => void;
  onRunDemo: () => void;
  isDemoRunning: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeSection,
  onReset,
  onRunDemo,
  isDemoRunning,
  onToggleMobileMenu,
}) => {
  const sectionTitles: Record<string, string> = {
    overview: 'Operations Overview',
    network: 'Simulated Network Topology',
    simulator: 'Interactive Attack Simulator',
    timeline: 'Security Event Timeline',
    decoys: 'Decoy Honeytoken Vault',
    reports: 'SOC Incident Report',
  };

  const hasIncident = state?.incident && state.incident.status === 'OPEN';
  const hasAlerts = (state?.alerts?.length || 0) > 0;

  return (
    <header className="no-print h-18 border-b border-[#263449] bg-[#101827] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Zone 1: Mobile Hamburger + Breadcrumb Trail & Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-md hover:bg-[#151F30] cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs sm:text-sm font-mono text-slate-300 font-medium whitespace-nowrap">
            Breadcrumb / SecOps / {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <h1 className="text-base font-bold text-white truncate hidden md:inline tracking-tight">
            {sectionTitles[activeSection] || 'Security Console'}
          </h1>
        </div>
      </div>

      {/* Zone 2: Status Indicator */}
      <div className="hidden lg:flex items-center gap-3">
        {hasIncident ? (
          <div className="flex items-center gap-2 text-rose-300 bg-rose-500/15 border border-rose-500/40 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold tracking-wide">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>INCIDENT ACTIVE: {state?.incident?.id}</span>
          </div>
        ) : hasAlerts ? (
          <div className="flex items-center gap-2 text-amber-300 bg-amber-500/15 border border-amber-500/40 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold tracking-wide">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>OBSERVED ACTIVITY ({state?.alerts.length} ALERTS)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ALL SIMULATED HOSTS NOMINAL</span>
          </div>
        )}
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onRunDemo}
          disabled={isDemoRunning}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all shadow-sm shadow-cyan-950/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
          title="Run automated 5-step lateral movement attack simulation"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isDemoRunning ? 'Simulating…' : 'Run Attack Demo'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isDemoRunning}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-[#151F30] hover:bg-[#1E2D44] border border-[#263449] hover:border-slate-400 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          title="Restore simulation to clean initial baseline"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
