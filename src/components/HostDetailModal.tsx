import React, { useState } from 'react';
import { X, Server, Folder, File, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { HostNode, SecurityEvent } from '../types';

interface HostDetailModalProps {
  host: HostNode | null;
  onClose: () => void;
  onJumpToTerminal: (hostId: string) => void;
  events: SecurityEvent[];
}

export const HostDetailModal: React.FC<HostDetailModalProps> = ({
  host,
  onClose,
  onJumpToTerminal,
  events,
}) => {
  if (!host) return null;

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const hostEvents = events.filter(
    (e) => e.sourceHost === host.id || e.targetHost === host.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#101827] border border-[#263449] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#263449]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold font-mono text-white tracking-tight">{host.id}</h3>
                <span className="text-slate-600">·</span>
                <span className="text-sm font-bold text-slate-200">{host.role}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 font-medium">
                IP: <span className="text-white">{host.ip}</span> · Zone: <span className="text-white">{host.zone}</span> · OS: <span className="text-white">{host.os}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-[#151F30] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Host Status & Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-xs sm:text-sm">
          <div className="bg-[#151F30] border border-[#263449] p-3.5 rounded-xl">
            <span className="text-slate-400 block text-xs font-medium">System Status</span>
            <div className="mt-1.5 flex items-center gap-2 font-bold">
              {host.status === 'Incident' ? (
                <span className="text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Incident Active
                </span>
              ) : host.status === 'Observed Activity' ? (
                <span className="text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Observed Activity
                </span>
              ) : (
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Healthy
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#151F30] border border-[#263449] p-3.5 rounded-xl">
            <span className="text-slate-400 block text-xs font-medium">Default Account</span>
            <span className="text-white font-bold mt-1.5 block">
              {host.defaultUser}
            </span>
          </div>

          <div className="bg-[#151F30] border border-[#263449] p-3.5 rounded-xl">
            <span className="text-slate-400 block text-xs font-medium">Telemetry Events</span>
            <span className="text-cyan-300 font-bold mt-1.5 block tabular-nums">
              {hostEvents.length} Recorded
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-200 leading-relaxed bg-[#0C1322] border border-[#263449] p-4 rounded-xl font-normal">
          {host.description}
        </p>

        {/* Virtual Filesystem Explorer */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider">
            Virtual Filesystem & Decoy Artifacts
          </h4>
          <div className="bg-[#080D18] border border-[#263449] rounded-xl p-4 font-mono text-xs sm:text-sm">
            <div className="text-slate-400 text-xs mb-3 font-medium">Available files on <code className="text-cyan-300 font-bold">{host.id}:/</code></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.keys(host.files).map((fileName) => {
                const isDir = typeof host.files[fileName] === 'object';
                const isSelected = selectedFile === fileName;
                return (
                  <button
                    type="button"
                    key={fileName}
                    onClick={() => setSelectedFile(isSelected ? null : fileName)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg text-left border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-semibold'
                        : 'bg-[#151F30] border-[#263449] text-slate-200 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {isDir ? (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{fileName}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected File Content Preview */}
            {selectedFile && host.files[selectedFile] && typeof host.files[selectedFile] === 'string' && (
              <div className="mt-4 pt-4 border-t border-[#263449]">
                <span className="text-slate-300 text-xs block font-bold mb-1.5">
                  File Preview: <code className="text-cyan-300">{selectedFile}</code>
                </span>
                <pre className="p-3.5 bg-[#0C1322] border border-[#263449] rounded-lg text-xs sm:text-sm text-cyan-200 overflow-x-auto whitespace-pre-wrap leading-relaxed font-medium">
                  {host.files[selectedFile]}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#263449] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onJumpToTerminal(host.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all cursor-pointer shadow-xs"
          >
            <Terminal className="w-4 h-4" />
            <span>Open Terminal on {host.id}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-[#151F30] hover:bg-[#1E2D44] border border-[#263449] rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
