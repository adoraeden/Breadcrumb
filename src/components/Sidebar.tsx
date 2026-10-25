import React from 'react';
import {
  LayoutDashboard,
  Network,
  Terminal,
  Clock,
  KeyRound,
  FileText,
  Shield,
  Activity,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  incidentCount: number;
  alertCount: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  incidentCount,
  alertCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'network', label: 'Network Map', icon: Network },
    { id: 'simulator', label: 'Attack Simulator', icon: Terminal },
    { id: 'timeline', label: 'Incident Timeline', icon: Clock, badge: alertCount > 0 ? alertCount : null },
    { id: 'decoys', label: 'Decoy Vault', icon: KeyRound },
    { id: 'reports', label: 'Reports', icon: FileText, badge: incidentCount > 0 ? '1' : null },
  ];

  const handleSelect = (id: string) => {
    onSelectSection(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside className="w-64 bg-[#101827] border-r border-[#263449] flex flex-col h-full shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-[#263449] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Breadcrumb
            </div>
            <p className="text-xs text-slate-300 font-medium leading-tight mt-0.5">
              Deception & Incident Intel
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-[#151F30]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine Status Bottom Panel */}
      <div className="p-4 border-t border-[#263449] bg-[#0c1322]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-xs">Simulation Engine Online</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs font-mono tracking-wider text-cyan-300 font-bold uppercase bg-cyan-950/70 border border-cyan-700/60 px-2.5 py-1 rounded">
            SIMULATION MODE
          </span>
          <span className="text-xs text-slate-400 font-mono font-medium">v1.4-local</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="no-print hidden md:flex shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
