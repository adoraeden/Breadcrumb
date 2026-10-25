import React from 'react';
import { SecurityIncident, SecurityEvent, AttackHop } from '../types';

interface PrintDossierProps {
  incident: SecurityIncident | null;
  events: SecurityEvent[];
  activeHops: AttackHop[];
}

export const PrintDossier: React.FC<PrintDossierProps> = ({
  incident,
  events,
  activeHops,
}) => {
  const currentDate = new Date().toUTCString();

  if (!incident) {
    return (
      <div className="print-container p-8 space-y-6 font-sans">
        <div className="border-b-2 border-slate-800 pb-4">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
            Breadcrumb Cyber Deception Sentinel · Automated Forensics
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Fleet Security Baseline Status Report
          </h1>
          <p className="text-xs font-mono text-slate-600 mt-1">
            Classification: SEC-INTERNAL // RESTRICTED · Generated: {currentDate}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg">
          <h3 className="font-bold text-sm text-slate-900 uppercase font-mono">
            System Operational Baseline: Nominal
          </h3>
          <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
            All 5 simulated host environments (web-01, fileserver, dev-laptop, db-01, backup-01) are active with nominal telemetry.
            Canary honeytokens and planted decoy credentials remain armed and untripped. No lateral traversal attempts or provenance violations have been observed.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-300 text-xs font-mono text-slate-500 flex justify-between">
          <span>Authority: Breadcrumb Deception Sentinel</span>
          <span>Status: Clean Baseline // Zero Active Incidents</span>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container p-6 space-y-6 font-sans">
      {/* Dossier Header */}
      <div className="print-section border-b-2 border-slate-900 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold">
              Security Operations Center · Incident Reconstruction Dossier
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {incident.title}
            </h1>
            <p className="text-xs font-mono text-slate-600 mt-1">
              Classification: SEC-INTERNAL // RESTRICTED · Incident Reference: <strong>{incident.id}</strong>
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="print-badge-critical inline-block px-3 py-1 font-bold rounded">
              INCIDENT STATUS: {incident.status}
            </span>
            <p className="text-slate-600 mt-1.5">
              Detected: {new Date(incident.startTime).toUTCString()}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Executive Summary & Detection Basis */}
      <div className="print-section space-y-2">
        <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
          1. Executive Summary & Detection Basis
        </h2>
        <div className="p-3.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-800 leading-relaxed font-sans">
          {incident.summary}
        </div>
        <p className="text-xs font-mono text-slate-600 italic">
          Attribution Basis: This decoy has no legitimate use in the simulation, enabling attribution to its known planted origin.
        </p>
      </div>

      {/* Scope and Affected Infrastructure */}
      <div className="print-section grid grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-3 bg-slate-50 border border-slate-300 rounded">
          <span className="text-slate-500 uppercase font-bold block mb-1">Affected Monitored Hosts:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {incident.affectedHosts.map((h) => (
              <span key={h} className="print-badge-critical px-2 py-0.5 font-bold rounded">
                {h}
              </span>
            ))}
          </div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-300 rounded">
          <span className="text-slate-500 uppercase font-bold block mb-1">Tripped Honeytoken Decoys:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {incident.triggeredDecoys.map((d) => (
              <span key={d} className="print-badge-info px-2 py-0.5 font-bold rounded">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Observed Credential Provenance & Vector Evidence */}
      <div className="print-section space-y-2">
        <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
          2. Observed Credential Provenance & Lateral Path Reconstruction
        </h2>
        <table className="w-full text-xs font-mono text-left border-collapse">
          <thead>
            <tr>
              <th>Credential ID</th>
              <th>Planted Origin Host</th>
              <th>Planted Decoy File</th>
              <th>Observed Ingress Target</th>
              <th>Attribution Confidence</th>
            </tr>
          </thead>
          <tbody>
            {incident.provenance.map((p, idx) => (
              <tr key={idx}>
                <td className="font-bold text-sky-800">{p.credentialId}</td>
                <td>{p.originHost}</td>
                <td>{p.originFile}</td>
                <td className="font-bold text-rose-800">{p.observedTarget}</td>
                <td className="font-bold text-emerald-800">100% Deterministic Provenance</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-600 mt-1">
          * Note: Observed lateral authentication attempts were intercepted and rejected by the Breadcrumb Deception Sentinel.
        </p>
      </div>

      {/* 3. MITRE ATT&CK Matrix Alignment */}
      <div className="print-section space-y-2">
        <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
          3. MITRE ATT&CK Matrix Alignment
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {incident.mitreTechniques.map((t) => (
            <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono">
              <span className="text-purple-800 font-bold uppercase text-[10px] block">{t.phase}</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{t.id}</div>
              <div className="text-slate-700 mt-0.5 leading-tight">{t.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Forensic Event Evidence Log */}
      <div className="print-section space-y-2">
        <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
          4. Forensic Event Evidence Log
        </h2>
        <table className="w-full text-xs font-mono text-left border-collapse">
          <thead>
            <tr>
              <th className="w-24">Event ID</th>
              <th className="w-20">Time</th>
              <th className="w-28">Type</th>
              <th className="w-32">Source → Target</th>
              <th>Observed Telemetry Evidence</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr key={evt.id}>
                <td className="font-bold text-slate-900">{evt.id}</td>
                <td>{new Date(evt.timestamp).toLocaleTimeString()}</td>
                <td className="font-semibold text-sky-800">{evt.type}</td>
                <td>
                  {evt.sourceHost} {evt.targetHost ? `→ ${evt.targetHost}` : ''}
                </td>
                <td className="text-slate-800">{evt.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Recommended Defensive Remediations */}
      <div className="print-section space-y-2">
        <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
          5. Recommended Defensive Remediations & Countermeasures
        </h2>
        <div className="space-y-2">
          {incident.defensiveRecommendations.map((rec, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-300 rounded text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    rec.priority === 'Immediate' ? 'print-badge-critical' : 'print-badge-warning'
                  }`}>
                    {rec.priority}
                  </span>
                  {rec.action}
                </span>
                <span className="font-mono text-slate-600">
                  Target: <strong>{rec.target}</strong>
                </span>
              </div>
              <p className="mt-1 text-slate-700 leading-relaxed">
                {rec.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Sign-off / Footer */}
      <div className="print-section pt-4 border-t-2 border-slate-900 flex justify-between items-center text-xs font-mono text-slate-600">
        <span>Authority: Breadcrumb Cyber Deception Sentinel</span>
        <span>Attribution: 100% Deterministic Seeded Provenance</span>
      </div>
    </div>
  );
};
