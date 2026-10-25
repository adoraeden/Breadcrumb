import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricsCards } from './components/MetricsCards';
import { NetworkMap } from './components/NetworkMap';
import { TerminalSimulator } from './components/TerminalSimulator';
import { DecoyVault } from './components/DecoyVault';
import { IncidentTimeline } from './components/IncidentTimeline';
import { AlertPanel } from './components/AlertPanel';
import { ProvenanceInspector } from './components/ProvenanceInspector';
import { IncidentReport } from './components/IncidentReport';
import { HostStatusGrid } from './components/HostStatusGrid';
import { HostDetailModal } from './components/HostDetailModal';
import { PrintDossier } from './components/PrintDossier';
import { SimulationState, HostNode, TerminalLine } from './types';
import { fetchState, resetSimulation, executeCommand } from './services/api';

const INITIAL_TERMINAL_LINES: TerminalLine[] = [
  {
    id: 'init-1',
    type: 'system',
    content: 'Breadcrumb Defensive Simulation Terminal v1.4',
  },
  {
    id: 'init-2',
    type: 'system',
    content: "Type 'help' for simulated shell commands or click 'Run Attack Simulation' for automated playback.",
  },
];

export default function App() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [currentHostId, setCurrentHostId] = useState<string>('web-01');
  const [inspectedHost, setInspectedHost] = useState<HostNode | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [stepProgress, setStepProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(INITIAL_TERMINAL_LINES);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isDemoRunningRef = useRef(false);
  isDemoRunningRef.current = isDemoRunning;

  // Poll state from server periodically (skip during active stepwise demo to prevent race conditions)
  useEffect(() => {
    let isMounted = true;

    const loadState = async () => {
      if (isDemoRunningRef.current) return;
      try {
        const data = await fetchState();
        if (isMounted) {
          setState(data);
          setErrorMsg(null);
        }
      } catch (err: any) {
        if (isMounted && !isDemoRunningRef.current) {
          setErrorMsg('Failed to sync simulation state from backend server.');
        }
      }
    };

    loadState();
    const interval = setInterval(loadState, 1400);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCommandSubmit = async (cmdText: string, overrideHostId?: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const activeHostId = overrideHostId || currentHostId;
    const currentHost = state?.hosts.find((h) => h.id === activeHostId) || {
      id: activeHostId,
      defaultUser: 'deploy-user',
    };

    // Add user prompt line to terminal
    const userLine: TerminalLine = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'prompt',
      content: trimmed,
      hostId: currentHost.id,
      user: currentHost.defaultUser,
    };

    setTerminalLines((prev) => [...prev, userLine]);

    try {
      const res = await executeCommand(activeHostId, trimmed);

      if (res.output === '[CLEAR_TERMINAL]') {
        setTerminalLines([]);
        return;
      }

      const outLine: TerminalLine = {
        id: `o-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type:
          res.output.includes('ALERT') || res.output.includes('TRIPWIRE')
            ? 'system'
            : 'output',
        content: res.output,
      };

      setTerminalLines((prev) => [...prev, outLine]);
      setState(res.state);
    } catch (err: any) {
      setTerminalLines((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'error',
          content: `Command Error: ${err.message}`,
        },
      ]);
      setErrorMsg(`Command failed: ${err.message}`);
    }
  };

  const handleRunDemo = async () => {
    if (isDemoRunning) return;

    // Check if scenario has already been executed
    const isAlreadyTriggered = state?.decoys.some((d) => d.status === 'Triggered') ||
      (state?.incident && state.incident.status === 'OPEN');

    if (isAlreadyTriggered) {
      setTerminalLines((prev) => [
        ...prev,
        {
          id: `notice-${Date.now()}`,
          type: 'system',
          content: 'Adversary lateral scenario has already been executed and incident is OPEN. Click "Reset" in the top bar to run the simulation again from clean baseline.',
        },
      ]);
      return;
    }

    setIsDemoRunning(true);
    setErrorMsg(null);
    setCurrentHostId('web-01');

    setTerminalLines((prev) => [
      ...prev,
      {
        id: `demo-banner-${Date.now()}`,
        type: 'system',
        content: '=== COMMENCING AUTOMATED ADVERSARY LATERAL MOVEMENT SIMULATION ===',
      },
    ]);

    try {
      // Step 1: Foothold inspection on web-01
      setStepProgress('Step 1/4: Gaining initial foothold on web-01 (whoami)...');
      await new Promise((r) => setTimeout(r, 600));
      await handleCommandSubmit('whoami', 'web-01');

      // Step 2: Local file discovery
      setStepProgress('Step 2/4: Discovering local files and directories (ls)...');
      await new Promise((r) => setTimeout(r, 800));
      await handleCommandSubmit('ls', 'web-01');

      // Step 3: Honeytoken file inspection
      setStepProgress('Step 3/4: Reading deployment_notes.txt and extracting honeytoken...');
      await new Promise((r) => setTimeout(r, 1000));
      await handleCommandSubmit('cat deployment_notes.txt', 'web-01');

      // Step 4: Lateral movement authentication against backup-01
      setStepProgress('Step 4/4: Attempting lateral auth on backup-01 via DECOY-WEB-7F3A...');
      await new Promise((r) => setTimeout(r, 1200));
      await handleCommandSubmit('use DECOY-WEB-7F3A --target backup-01', 'web-01');

      setStepProgress('Deception Tripwire Activated! Incident dossier generated.');
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err: any) {
      console.error('Demo execution error:', err);
      setErrorMsg(`Simulation stopped unexpectedly: ${err.message}`);
      setTerminalLines((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'error',
          content: `Simulation aborted: ${err.message}`,
        },
      ]);
    } finally {
      setIsDemoRunning(false);
      setStepProgress(null);
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetSimulation();
      setState(res.state);
      setInspectedHost(null);
      setErrorMsg(null);
      setIsDemoRunning(false);
      setStepProgress(null);
      setTerminalLines([
        ...INITIAL_TERMINAL_LINES,
        {
          id: `reset-${Date.now()}`,
          type: 'system',
          content: 'Simulation environment restored to clean baseline state.',
        },
      ]);
    } catch (err: any) {
      console.error('Reset error:', err);
      setErrorMsg(`Failed to reset simulation: ${err.message}`);
    }
  };

  const handleSelectHost = (host: HostNode) => {
    setInspectedHost(host);
  };

  const handleJumpToTerminal = (hostId: string) => {
    setCurrentHostId(hostId);
    setActiveSection('simulator');
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#080D18] flex items-center justify-center p-4">
        <div className="text-center font-mono">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-cyan-300">Initializing Breadcrumb Sentinel Engine...</p>
          <p className="text-xs text-slate-500 mt-1">Connecting to simulated honeynet orchestrator</p>
        </div>
      </div>
    );
  }

  const { hosts, decoys, events, alerts, activeHops, incident, metrics } = state;

  return (
    <div className="min-h-screen bg-[#080D18] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        state={state}
        activeSection={activeSection}
        onReset={handleReset}
        onRunDemo={handleRunDemo}
        isDemoRunning={isDemoRunning}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      <div className="screen-only flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            setMobileMenuOpen(false);
          }}
          incidentCount={incident && incident.status === 'OPEN' ? 1 : 0}
          alertCount={alerts.length}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6 sm:space-y-7">
          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-800/60 p-3.5 rounded-xl text-xs sm:text-sm font-mono text-rose-300 flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="underline hover:text-white cursor-pointer ml-3 shrink-0 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Section: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* 4 Overview Metrics */}
              <MetricsCards metrics={metrics} />

              {/* 5 Hosts Status Grid */}
              <HostStatusGrid hosts={hosts} onSelectHost={handleSelectHost} />

              {/* Topology Preview & Alerts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <NetworkMap
                    hosts={hosts}
                    activeHops={activeHops}
                    selectedHostId={inspectedHost?.id || null}
                    onSelectHost={handleSelectHost}
                  />
                </div>
                <div>
                  <AlertPanel alerts={alerts} />
                </div>
              </div>

              {/* Provenance & Timeline preview */}
              <ProvenanceInspector incident={incident} decoys={decoys} />
              <IncidentTimeline events={events.slice(0, 5)} />
            </div>
          )}

          {/* Section: Network Map */}
          {activeSection === 'network' && (
            <div className="space-y-6">
              <NetworkMap
                hosts={hosts}
                activeHops={activeHops}
                selectedHostId={inspectedHost?.id || null}
                onSelectHost={handleSelectHost}
              />
              <HostStatusGrid hosts={hosts} onSelectHost={handleSelectHost} />
            </div>
          )}

          {/* Section: Attack Simulator */}
          {activeSection === 'simulator' && (
            <div className="space-y-6">
              <TerminalSimulator
                hosts={hosts}
                currentHostId={currentHostId}
                onSelectHostId={setCurrentHostId}
                lines={terminalLines}
                onCommandSubmit={handleCommandSubmit}
                onClearTerminal={() => setTerminalLines([])}
                onRunDemo={handleRunDemo}
                onReset={handleReset}
                isAutomating={isDemoRunning}
                stepProgress={stepProgress}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetworkMap
                  hosts={hosts}
                  activeHops={activeHops}
                  selectedHostId={currentHostId}
                  onSelectHost={handleSelectHost}
                />
                <AlertPanel alerts={alerts} />
              </div>
            </div>
          )}

          {/* Section: Incident Timeline */}
          {activeSection === 'timeline' && (
            <div className="space-y-6">
              <IncidentTimeline events={events} />
            </div>
          )}

          {/* Section: Decoy Vault */}
          {activeSection === 'decoys' && (
            <div className="space-y-6">
              <DecoyVault decoys={decoys} />
              <ProvenanceInspector incident={incident} decoys={decoys} />
            </div>
          )}

          {/* Section: Reports */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <IncidentReport incident={incident} events={events} activeHops={activeHops} />
            </div>
          )}
        </main>
      </div>

      {/* Host Detail Modal (when clicked) */}
      <HostDetailModal
        host={inspectedHost}
        onClose={() => setInspectedHost(null)}
        onJumpToTerminal={handleJumpToTerminal}
        events={events}
      />

      {/* Dedicated Print Dossier: hidden on screen, always rendered during print */}
      <div className="print-only hidden print:block">
        <PrintDossier
          incident={incident}
          events={events}
          activeHops={activeHops}
        />
      </div>
    </div>
  );
}
