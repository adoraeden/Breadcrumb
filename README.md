# Breadcrumb — AI-Assisted Cyber Deception & Incident Reconstruction Platform

**Plant the breadcrumb. Trace the intrusion. Reconstruct the incident.**

Breadcrumb is a defensive cybersecurity simulation platform that demonstrates how decoy files and honeytoken credentials can help identify suspicious activity and reconstruct a simulated security incident.

By placing unique decoy credentials in simulated deployment notes and configuration files, Breadcrumb demonstrates how an attempted reuse of a decoy credential can connect its origin host to a target host, generate alerts, and build an incident timeline.

**Important:** Breadcrumb is a simulation environment. It does not monitor real networks, access real machines, or execute real attacks.

---

## 1. Executive Summary & Problem Statement

Lateral movement is a significant challenge in cybersecurity. After gaining access to a system, an attacker may search for credentials and attempt to use them to access other systems. Traditional detection methods can generate false positives, making suspicious activity harder to investigate.

Breadcrumb demonstrates a cyber-deception approach using simulated hosts, decoy files, and unique honeytoken credentials.

### Breadcrumb's Deception Approach

- **Decoy credentials:** Unique fake credentials are planted in simulated files and have no legitimate purpose within the simulation.
- **Credential provenance:** Each decoy is associated with its simulated origin host and source file.
- **Interaction detection:** Using a decoy credential in the simulation generates a security event.
- **Incident reconstruction:** The simulation connects the credential's origin to the target of an attempted authentication.
- **Investigation timeline:** Events, alerts, and host relationships can be reviewed to understand the simulated incident.
- **Incident reporting:** Investigation findings can be viewed and exported for further review.

For example, the simulated credential `DECOY-WEB-7F3A` originates from `deployment_notes.txt` on `web-01`. When the demo attempts to use it against `backup-01`, Breadcrumb records the simulated interaction and displays the resulting incident evidence.

This demonstrates an attempted lateral movement path, not a successful compromise of the target.

---

## 2. Screenshots

### 2.1 Dashboard

The dashboard provides an overview of simulated hosts, incident metrics, decoy interactions, and observed attack hops.

![Breadcrumb Dashboard](screenshots/dashboard.png)

### 2.2 Hosts and Decoy Vault

Explore the simulated host environment, virtual files, and planted decoy credentials.

![Breadcrumb Hosts and Decoy Vault](screenshots/hosts-decoy-vault.png)

### 2.3 Attack Simulation and Incident Reconstruction

Run the simulated attack demo and inspect the generated events, alerts, timeline, and attempted movement between hosts.

![Breadcrumb Attack Simulation](screenshots/attack-demo.png)

### 2.4 Incident Report

Review the investigation findings and available incident report export options.

![Breadcrumb Incident Report](screenshots/incident-report.png)

---

## 3. Architecture & Tech Stack

### Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Node.js, Express.js
- **Simulation data:** JSON-based host and decoy data
- **Visualization:** Interactive network topology, event timeline, and host status panels
- **Reporting:** Incident report with available print and JSON export functionality
- **Development assistance:** AI-assisted coding and debugging tools

### Project Structure

```text
Breadcrumb/
├── server.ts
├── package.json
├── data/
│   ├── hosts.json
│   └── decoys.json
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MetricsCards.tsx
│   │   ├── NetworkMap.tsx
│   │   ├── TerminalSimulator.tsx
│   │   ├── DecoyVault.tsx
│   │   ├── IncidentTimeline.tsx
│   │   ├── AlertPanel.tsx
│   │   ├── ProvenanceInspector.tsx
│   │   ├── IncidentReport.tsx
│   │   ├── HostStatusGrid.tsx
│   │   └── HostDetailModal.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── screenshots/
│   ├── dashboard.png
│   ├── hosts-decoy-vault.png
│   ├── attack-demo.png
│   └── incident-report.png
├── index.html
└── README.md
```

*Note: The structure above describes the documented project layout. Some filenames or directories may differ if the implementation has changed.*

### Backend REST API

The application documents the following API endpoints for its simulation workflow:

| Endpoint | Purpose |
|---|---|
| `GET /api/state` | Retrieve the current simulation state. |
| `GET /api/hosts` | Retrieve the simulated hosts. |
| `GET /api/decoys` | Retrieve registered decoy credentials. |
| `GET /api/events` | Retrieve the event timeline. |
| `GET /api/alerts` | Retrieve generated security alerts. |
| `POST /api/command` | Execute a supported simulated terminal command. |
| `POST /api/demo` | Run the automated attack demonstration. |
| `POST /api/reset` | Restore the simulation to its initial state. |

---

## 4. Quickstart & Setup Instructions

### Prerequisites

- Node.js 18 or later
- npm
- Git (optional, for cloning the repository)

### Run on Windows

Open PowerShell or the VS Code terminal and run:

```powershell
git clone https://github.com/adoraeden/Breadcrumb.git
cd Breadcrumb
npm install
npm run dev
```

Open the local URL printed by Vite or the development server in your terminal. If the project is configured to use port 3000, visit:

`http://localhost:3000`

**Note:** The actual development URL and port depend on the project's current configuration.

---

## 5. Demonstration Workflow

### Step 1: Explore the Dashboard

Review the simulated host environment and the initial security metrics.

### Step 2: Inspect the Hosts and Decoy Vault

Explore the simulated hosts, inspect virtual files, and identify the decoy credentials registered in the environment.

### Step 3: Run the Attack Simulation

Start the automated demonstration using the application's attack simulation control.

The demonstration illustrates a simulated sequence involving:

1. Activity on `web-01`.
2. Discovery of `deployment_notes.txt`.
3. Use of the decoy credential `DECOY-WEB-7F3A`.
4. An attempted authentication against `backup-01`.
5. Detection and recording of the simulated decoy interaction.

### Step 4: Investigate the Incident

Review the generated alerts, chronological event timeline, network visualization, and provenance information.

Breadcrumb distinguishes recorded simulation events from inferred movement between hosts.

### Step 5: Review and Export the Report

Inspect the incident report and use the application's available export options.

The simulation can then be reset for another demonstration.

---

## 6. Testing & Verification

The project includes a simulation workflow intended to demonstrate the following capabilities:

| Test area | Expected behavior |
|---|---|
| Application startup | Development server starts successfully. |
| Dashboard | Simulated hosts and metric cards are displayed. |
| Decoy Vault | Registered decoy credentials and their simulated origins are displayed. |
| Terminal simulation | Supported commands can be entered in the simulated environment. |
| File discovery | Reading a simulated decoy file records the configured event. |
| Decoy interaction | Using a decoy credential in the demo generates the configured security event. |
| Alert generation | The corresponding simulated alert appears. |
| Incident timeline | Recorded events are displayed chronologically. |
| Network visualization | The attempted movement is represented between the relevant simulated hosts. |
| Provenance | Credential origin and target are presented for investigation. |
| Incident report | Available investigation findings can be reviewed and exported. |
| Reset | The simulation can be returned to its initial state. |

These are the intended test outcomes for the simulation. Actual results depend on the current implementation and should be verified before making claims about successful testing.

---

## 7. Project Scope & Ethical Boundaries

Breadcrumb is designed as a defensive cybersecurity demonstration.

- **Simulated environment:** Hosts, files, credentials, and attack events represent a virtual environment.
- **No real network scanning:** The project is not intended to scan external networks or access real machines.
- **No real credential theft:** The decoy credentials are demonstration data.
- **No real attack execution:** The attack workflow demonstrates simulated events rather than executing an intrusion.
- **Investigation support:** The interface demonstrates how decoy interactions can be organized into an incident timeline and report.
- **Resettable state:** The simulation provides a reset workflow for repeatable demonstrations.

Breadcrumb demonstrates the concepts of cyber deception, honeytokens, provenance tracking, attempted lateral movement, and incident reconstruction. It is an educational prototype, not a replacement for a production security monitoring or incident response system.

---

## 8. Future Improvements

Potential improvements include:

- Integration with a controlled cybersecurity lab environment.
- Persistent incident history and audit storage.
- More configurable decoy credentials and simulated host scenarios.
- Expanded investigation reports and evidence correlation.
- Additional defensive response simulations.
- Automated regression testing and stronger API validation.

---

## 9. Live Demo & Repository

- **Live application:** https://breadcrumb-demo.onrender.com
- **GitHub repository:** https://github.com/adoraeden/Breadcrumb

---

## 10. Project Summary

Breadcrumb demonstrates how decoy credentials and simulated host interactions can be used to illustrate suspicious credential reuse and reconstruct a potential lateral movement path.

By combining a simulated network, honeytoken registry, event timeline, alert generation, provenance visualization, and incident reporting, Breadcrumb provides an interactive introduction to cyber deception and incident investigation.

**Plant the breadcrumb. Trace the intrusion. Reconstruct the incident.**
