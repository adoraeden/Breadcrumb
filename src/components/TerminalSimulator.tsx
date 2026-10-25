import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, RotateCcw, CornerDownLeft, Sparkles } from 'lucide-react';
import { HostNode, TerminalLine } from '../types';

interface TerminalSimulatorProps {
  hosts: HostNode[];
  currentHostId: string;
  onSelectHostId: (hostId: string) => void;
  lines: TerminalLine[];
  onCommandSubmit: (cmd: string) => Promise<void>;
  onClearTerminal: () => void;
  onRunDemo: () => Promise<void>;
  onReset: () => Promise<void>;
  isAutomating: boolean;
  stepProgress: string | null;
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  hosts,
  currentHostId,
  onSelectHostId,
  lines,
  onCommandSubmit,
  onClearTerminal,
  onRunDemo,
  onReset,
  isAutomating,
  stepProgress,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentHost = hosts.find((h) => h.id === currentHostId) || hosts[0];

  useEffect(() => {
    // Keep auto-scroll confined strictly inside the terminal box, never moving the page/window
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = async (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);
    setInputVal('');
    await onCommandSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setInputVal('');
        } else {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx] || '');
        }
      }
    }
  };

  const quickCommands = [
    { label: 'cat deployment_notes.txt', cmd: 'cat deployment_notes.txt', hint: 'Read decoy on web-01' },
    { label: 'use DECOY-WEB-7F3A --target backup-01', cmd: 'use DECOY-WEB-7F3A --target backup-01', hint: 'Trigger tripwire' },
    { label: 'ls', cmd: 'ls', hint: 'List current files' },
    { label: 'whoami', cmd: 'whoami', hint: 'Current user' },
    { label: 'help', cmd: 'help', hint: 'Command manual' },
  ];

  return (
    <div className="bg-[#101827] border border-[#263449] rounded-xl overflow-hidden flex flex-col shadow-sm">
      {/* Terminal Titlebar & Host Selector */}
      <div className="bg-[#0D1524] px-5 py-3.5 border-b border-[#263449] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <TerminalIcon className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Defensive Shell</span>
          <span className="text-slate-600">·</span>
          {/* Host Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="host-select" className="text-xs text-slate-300 font-mono font-medium">
              Host:
            </label>
            <select
              id="host-select"
              value={currentHostId}
              onChange={(e) => onSelectHostId(e.target.value)}
              disabled={isAutomating}
              className="bg-[#151F30] border border-[#263449] hover:border-slate-500 text-slate-100 text-xs sm:text-sm font-mono px-3 py-1.5 rounded-md focus:outline-none focus:border-cyan-400 cursor-pointer font-medium"
            >
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.id} ({h.role} - {h.ip})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onRunDemo()}
            disabled={isAutomating}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAutomating ? 'Simulating…' : 'Run Attack Simulation'}</span>
          </button>

          <button
            type="button"
            onClick={onClearTerminal}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#151F30] border border-transparent hover:border-[#263449] rounded-md transition-colors cursor-pointer"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onReset()}
            disabled={isAutomating}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#151F30] border border-transparent hover:border-[#263449] rounded-md transition-colors cursor-pointer"
            title="Reset Scenario State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Automated Step Progress Banner (if active) */}
      {stepProgress && (
        <div className="bg-cyan-950/70 border-b border-cyan-800/60 px-5 py-3 flex items-center justify-between text-sm font-mono text-cyan-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-semibold">{stepProgress}</span>
          </div>
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider hidden sm:inline">
            AUTORUN IN PROGRESS
          </span>
        </div>
      )}

      {/* Terminal Screen Area */}
      <div
        ref={terminalContainerRef}
        className="p-5 sm:p-6 bg-[#080D18] font-mono text-[13.5px] sm:text-[14px] text-slate-100 h-96 overflow-y-auto space-y-2 cursor-text leading-relaxed"
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
      >
        {lines.map((line) => {
          if (line.type === 'prompt') {
            return (
              <div key={line.id} className="flex items-start gap-2 text-slate-100 font-medium">
                <span className="text-cyan-400 font-bold shrink-0">
                  {line.user}@{line.hostId}:~$
                </span>
                <span className="whitespace-pre-wrap">{line.content}</span>
              </div>
            );
          }
          if (line.type === 'system') {
            return (
              <div
                key={line.id}
                className="text-cyan-200 bg-cyan-950/40 border border-cyan-800/50 p-3 rounded-lg whitespace-pre-wrap leading-relaxed font-medium"
              >
                {line.content}
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 font-medium whitespace-pre-wrap">
                {line.content}
              </div>
            );
          }
          return (
            <div key={line.id} className="text-slate-200 whitespace-pre-wrap pl-2.5 leading-relaxed font-normal">
              {line.content}
            </div>
          );
        })}
      </div>

      {/* Quick Helper Command Buttons for Judges */}
      <div className="bg-[#0C1322] px-5 py-2.5 border-t border-[#263449] flex items-center gap-2.5 overflow-x-auto text-xs">
        <span className="text-xs text-slate-300 shrink-0 font-mono font-semibold">Quick Run:</span>
        {quickCommands.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSubmit(item.cmd)}
            disabled={isAutomating}
            title={item.hint}
            className="px-3 py-1.5 rounded-md bg-[#151F30] hover:bg-[#1E2D44] border border-[#263449] hover:border-cyan-500/50 text-xs font-mono font-medium text-slate-200 hover:text-cyan-200 whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-40"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Terminal Input Row */}
      <div className="bg-[#090E1A] px-5 py-3 border-t border-[#263449] flex items-center gap-2.5">
        <span className="text-cyan-400 font-mono text-sm font-bold shrink-0">
          {currentHost.defaultUser}@{currentHost.id}:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAutomating}
          placeholder="Enter command (e.g., ls, cat deployment_notes.txt, help)"
          className="flex-1 bg-transparent border-none text-slate-100 font-mono text-sm focus:outline-none placeholder:text-slate-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => handleSubmit(inputVal)}
          disabled={isAutomating || !inputVal.trim()}
          className="p-2 text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Submit Command"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
