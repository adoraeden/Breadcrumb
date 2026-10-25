<<<<<<< HEAD
# Breadcrumb — AI-Assisted Cyber Deception & Incident Reconstruction Platform

> **"Plant the breadcrumb. Trace the intrusion. Reconstruct the incident."**

Breadcrumb is a defensive cybersecurity platform that deploys simulated decoy files and unique honeytoken credentials across monitored host environments. By embedding deterministic provenance markers inside fake deployment notes, configuration files, and API secrets, Breadcrumb instantly trips unauthorized lateral movement, reconstructs adversary pivot vectors, and generates SOC-ready forensic dossiers without alert fatigue.

---

## 1. Executive Summary & Problem Statement

In modern enterprise security, lateral movement is notoriously difficult to detect reliably. Adversaries who gain access to an edge host (such as a DMZ web server) scour local directories for credentials to pivot to internal databases and backup storage. Traditional heuristics produce endless false positives.

**Breadcrumb's Deception Philosophy:**
- **Deterministic 100% Attribution:** Decoys have zero legitimate business utility. Any interaction with or authentication attempt using a decoy credential is mathematically anomalous.
- **Seeded Provenance:** Every decoy token (e.g. `DECOY-WEB-7F3A`) is cataloged with its exact origin host (`web-01`) and file (`deployment_notes.txt`).
- **Immediate Vector Reconstruction:** When `DECOY-WEB-7F3A` is presented for authentication on `backup-01`, Breadcrumb immediately establishes the lateral pivot edge (`web-01` → `backup-01`) and triggers defensive containment.

*Note: Breadcrumb is an explicit simulation environment. It does not scan real networks, access real machines, or execute real attacks.*

---

## 2. Architecture & Tech Stack

```
breadcrumb/
├── server.ts               # Authoritative Node.js + Express backend with REST API & Vite middleware
├── package.json            # Scripts & project dependencies
├── data/
│   ├── hosts.json          # 5 simulated nodes (web-01, db-01, fileserver, dev-laptop, backup-01)
│   └── decoys.json         # Decoy registry (DECOY-WEB-7F3A, DECOY-DEV-2C91, DECOY-FILE-8B24)
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Top bar contract with incident status & controls
│   │   ├── Sidebar.tsx             # Navigation & Simulation engine status
│   │   ├── MetricsCards.tsx        # 4 SOC KPIs with tabular figures
│   │   ├── NetworkMap.tsx          # Interactive SVG network topology with animated hop tracer
│   │   ├── TerminalSimulator.tsx   # Interactive shell, command history & 1-click adversary demo
│   │   ├── DecoyVault.tsx          # Decoy honeytoken registry & payload inspector
│   │   ├── IncidentTimeline.tsx    # Chronological event stream with MITRE ATT&CK tags
│   │   ├── AlertPanel.tsx          # Critical alerts & evidence modal
│   │   ├── ProvenanceInspector.tsx # Observed Evidence vs Inferred Movement breakdown
│   │   ├── IncidentReport.tsx      # Printable & JSON-exportable incident dossier
│   │   ├── HostStatusGrid.tsx      # Infrastructure status cards
│   │   └── HostDetailModal.tsx     # Deep file explorer & node inspector
│   ├── services/
│   │   └── api.ts                  # REST API client
│   ├── types/
│   │   └── index.ts                # Strict TypeScript interfaces
│   ├── App.tsx                     # Main application layout & reactive state orchestrator
│   ├── index.css                   # Tailwind v4 styles, custom scrollbar & print rules
│   └── main.tsx                    # React 19 entry point
├── index.html              # HTML shell with Plus Jakarta Sans & JetBrains Mono fonts
└── README.md
```

### Backend REST API Endpoints:
- `GET /api/state` — Full authoritative state (hosts, decoys, events, alerts, activeHops, incident, metrics).
- `GET /api/hosts` — List all 5 simulated hosts.
- `GET /api/decoys` — List all honeytokens and their recorded interaction count.
- `GET /api/events` — Chronological security audit logs with server timestamps.
- `GET /api/alerts` — Active high-severity alerts.
- `POST /api/command` — Validate and execute simulated shell command on a host.
- `POST /api/demo` — Execute the automated 5-step adversary demonstration.
- `POST /api/reset` — Restore hosts, decoys, and telemetry back to clean baseline.

---

## 3. Quickstart & PowerShell Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or npx

### Windows PowerShell Commands:
```powershell
# 1. Clone or navigate into the project directory
cd breadcrumb

# 2. Install all required dependencies
npm install

# 3. Launch the development server
npm run dev

# 4. Open your browser and navigate to:
# http://localhost:3000
```

*(For Linux / macOS, the exact same `npm install` and `npm run dev` commands apply).*

---

## 4. 60-Second Judge Demonstration Script

1. **(0–10s) The Defensive Problem:**
   *"Judges, this is Breadcrumb. Traditional security suffers from alert fatigue and struggles to detect lateral movement. Breadcrumb solves this by planting deterministic honeytokens in realistic fake files across monitored hosts."*

2. **(10–25s) The Baseline Topology & Decoys:**
   *"Notice our 5 simulated hosts: web-01, fileserver, dev-laptop, db-01, and our isolated backup-01 vault. All nodes are currently healthy. In our Decoy Vault, we have three seeded honeytokens. Notice DECOY-WEB-7F3A planted in deployment_notes.txt on web-01."*

3. **(25–45s) Triggering the Deception Tripwire (One-Click Demo):**
   *Click 'Run Attack Simulation' in the header.*
   *"Watch the simulated adversary: they compromise web-01, run 'ls', discover 'deployment_notes.txt', extract the decoy key, and attempt to authenticate against backup-01 with 'use DECOY-WEB-7F3A --target backup-01'. Instant tripwire! The sentinel immediately intercepts the connection."*

4. **(45–60s) Reconstruction & SOC Dossier:**
   *"Look at the network map: an animated lateral attack vector now links web-01 to backup-01. Our Provenance Engine links the credential's origin directly to the destination. Finally, in Reports, we have an actionable SOC incident dossier with MITRE ATT&CK mappings (T1083, T1552.001, T1078, T1021) and print/export readiness."*

---

## 5. Manual Testing & Acceptance Verification Checklist

| Scenario | Expected Result | Verified |
| :--- | :--- | :---: |
| 1. App Startup | Starts cleanly on port 3000 via `npm run dev` | Yes |
| 2. Dashboard Shell | Displays 5 hosts, 4 KPI cards, clean dark theme | Yes |
| 3. Decoy Vault | Shows 3 unique honeytokens with origin files & planted status | Yes |
| 4. Terminal Commands | Accepts `help`, `whoami`, `ls`, `cd`, `cat`, `use`, `clear` | Yes |
| 5. Safe Error Handling | Rejects unknown commands & invalid hosts gracefully | Yes |
| 6. File Discovery | `cat deployment_notes.txt` logs `DISCOVERY` event | Yes |
| 7. Honeytoken Trigger | `use DECOY-WEB-7F3A --target backup-01` trips sentinel | Yes |
| 8. Alert Generation | Critical Alert appears immediately in UI | Yes |
| 9. Network Map Animation | Animated red/cyan vector connects `web-01` to `backup-01` | Yes |
| 10. Timeline Stream | Chronological events with server timestamps & MITRE tags | Yes |
| 11. Provenance Breakdown | Clear distinction: Observed Evidence vs Inferred Movement | Yes |
| 12. SOC Incident Report | Compiles complete dossier with defensive mitigations | Yes |
| 13. Print / PDF Export | `@media print` renders clean white document | Yes |
| 14. Reset Control | Restores all hosts, decoys, and events to initial baseline | Yes |
| 15. Repeatable Demo | Automated demo can be executed repeatedly | Yes |
| 16. Offline Operation | 100% self-contained, no external APIs or keys required | Yes |

---

## 6. Project Scope & Ethical Boundaries

- **Simulated Environment:** All host nodes, network IPs (`192.0.2.x` reserved documentation range), filesystems, and credentials are completely simulated in memory.
- **No Real Network Scanning:** The tool never executes raw socket scans, packet sniffing, or external brute-forcing.
- **In-Memory Volatility:** Simulation state is maintained authoritatively in Node.js memory and can be cleanly reset at any time via the UI or `/api/reset`.
=======
# Breadcrumb
Cyber Deception and Incident Reconstruction Platform
>>>>>>> 03d19d99e0323b02ab5b63ef3c3c470fb4dd9506
