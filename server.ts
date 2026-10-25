import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data interfaces
interface HostNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  status: 'Healthy' | 'Observed Activity' | 'Incident';
  defaultUser: string;
  zone: string;
  os: string;
  description: string;
  files: Record<string, any>;
  currentPath?: string;
  eventCount?: number;
}

interface DecoyAsset {
  id: string;
  name: string;
  type: string;
  originHost: string;
  originFile: string;
  plantedAt: string;
  status: 'Planted' | 'Triggered' | 'Reset';
  intendedTarget: string;
  description: string;
  fakePayload: string;
  interactionCount: number;
  lastInteractedAt: string | null;
  observedTargets: string[];
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'DISCOVERY' | 'CREDENTIAL_USE' | 'ALERT_RAISED' | 'INCIDENT_OPENED';
  sourceHost: string;
  targetHost?: string;
  decoyId?: string;
  severity: 'Informational' | 'Warning' | 'Critical';
  message: string;
  evidence: Record<string, any>;
  mitreTechnique?: string;
}

interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: 'Warning' | 'Critical';
  title: string;
  hostId: string;
  originHost?: string;
  decoyId?: string;
  reason: string;
  evidence: Record<string, any>;
}

interface AttackHop {
  id: string;
  source: string;
  target: string;
  decoyId: string;
  timestamp: string;
}

interface SecurityIncident {
  id: string;
  status: 'OPEN' | 'CONTAINED' | 'RESOLVED';
  startTime: string;
  title: string;
  affectedHosts: string[];
  triggeredDecoys: string[];
  summary: string;
  provenance: {
    credentialId: string;
    originHost: string;
    originFile: string;
    observedTarget: string;
    detectionReason: string;
  }[];
  mitreTechniques: { id: string; name: string; phase: string }[];
  defensiveRecommendations: {
    priority: 'Immediate' | 'Short-Term' | 'Strategic';
    action: string;
    details: string;
    target: string;
  }[];
}

// Read initial canonical data
const hostsDataPath = path.join(__dirname, 'data', 'hosts.json');
const decoysDataPath = path.join(__dirname, 'data', 'decoys.json');

const rawHosts: HostNode[] = JSON.parse(fs.readFileSync(hostsDataPath, 'utf8'));
const rawDecoys: DecoyAsset[] = JSON.parse(fs.readFileSync(decoysDataPath, 'utf8'));

// Server Authoritative In-Memory State
let hosts: HostNode[] = [];
let decoys: DecoyAsset[] = [];
let events: SecurityEvent[] = [];
let alerts: SecurityAlert[] = [];
let activeHops: AttackHop[] = [];
let incident: SecurityIncident | null = null;
let eventCounter = 1;
let alertCounter = 1;

function resetState() {
  hosts = JSON.parse(JSON.stringify(rawHosts)).map((h: HostNode) => ({
    ...h,
    currentPath: '/',
    eventCount: 0,
  }));
  decoys = JSON.parse(JSON.stringify(rawDecoys));
  events = [];
  alerts = [];
  activeHops = [];
  incident = null;
  eventCounter = 1;
  alertCounter = 1;
}

resetState();

function getMetrics() {
  const affectedHosts = hosts.filter((h) => h.status !== 'Healthy').length;
  const decoyInteractions = decoys.reduce((sum, d) => sum + d.interactionCount, 0);
  const observedAttackHops = activeHops.length;
  const activeIncidents = incident && incident.status === 'OPEN' ? 1 : 0;

  return {
    totalHosts: hosts.length,
    affectedHosts,
    activeIncidents,
    decoyInteractions,
    observedAttackHops,
  };
}

// Defensive recommendations generator based on observed attack hops & decoy telemetry
function generateRecommendations(triggeredDecoys: DecoyAsset[], hops: AttackHop[]) {
  const recommendations: SecurityIncident['defensiveRecommendations'] = [];

  for (const dec of triggeredDecoys) {
    recommendations.push({
      priority: 'Immediate',
      action: `Revoke & Invalidate Token ${dec.id}`,
      details: `Immediately blacklist and revoke all access grants associated with ${dec.id}. Verify IAM and credential caches on ${dec.originHost}.`,
      target: dec.originHost,
    });
  }

  for (const hop of hops) {
    recommendations.push({
      priority: 'Immediate',
      action: `Isolate Network Segment Between ${hop.source} and ${hop.target}`,
      details: `Enforce micro-segmentation firewall rules. Drop ingress traffic from ${hop.source} to ${hop.target} on sensitive service ports.`,
      target: `${hop.source} → ${hop.target}`,
    });

    recommendations.push({
      priority: 'Short-Term',
      action: `Audit Ingress Access Logs on ${hop.target}`,
      details: `Inspect authentication and syslog records on ${hop.target} around ${hop.timestamp} for concurrent unauthorized remote executions.`,
      target: hop.target,
    });
  }

  recommendations.push({
    priority: 'Strategic',
    action: `Deploy Secondary Honeytokens & Seeded Decoys`,
    details: `Plant randomized Canary tokens in sibling repositories and configurations to detect secondary lateral pivot attempts.`,
    target: 'Fleet-wide',
  });

  return recommendations;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // REST API Routes
  app.get('/api/status', (req, res) => {
    res.json({ ok: true, status: 'operational', timestamp: new Date().toISOString() });
  });

  app.get('/api/state', (req, res) => {
    res.json({
      hosts,
      decoys,
      events,
      alerts,
      activeHops,
      incident,
      metrics: getMetrics(),
    });
  });

  app.get('/api/hosts', (req, res) => {
    res.json(hosts);
  });

  app.get('/api/decoys', (req, res) => {
    res.json(decoys);
  });

  app.get('/api/events', (req, res) => {
    res.json(events);
  });

  app.get('/api/alerts', (req, res) => {
    res.json(alerts);
  });

  app.post('/api/reset', (req, res) => {
    resetState();
    res.json({
      success: true,
      message: 'Simulation state restored to baseline.',
      state: {
        hosts,
        decoys,
        events,
        alerts,
        activeHops,
        incident,
        metrics: getMetrics(),
      },
    });
  });

  // Simulated Command Execution Endpoint
  app.post('/api/command', (req, res) => {
    try {
      const { hostId, command } = req.body;
      if (!hostId || typeof command !== 'string') {
        return res.status(400).json({ error: 'Missing hostId or command' });
      }

      const host = hosts.find((h) => h.id === hostId);
      if (!host) {
        return res.status(404).json({ error: `Host '${hostId}' not found.` });
      }

      const trimmed = command.trim();
      if (!trimmed) {
        return res.json({ output: '', state: { hosts, decoys, events, alerts, activeHops, incident, metrics: getMetrics() } });
      }

      // Parse command
      const parts = trimmed.split(/\s+/);
      const action = parts[0].toLowerCase();
      let output = '';

      if (action === 'help') {
        output = [
          'Breadcrumb Defensive Simulator Shell - Available Commands:',
          '  help                                Display this command manual',
          '  whoami                              Show current simulated user and host identity',
          '  ls [dir]                            List files and directories',
          '  cd <dir>                            Change working directory (/ or .. or folder)',
          '  cat <filename>                      Read simulated file contents',
          '  use <credential-id> --target <host> Attempt authentication against target host using credential',
          '  clear                               Clear terminal output screen',
          '',
          'Tip: Look for configuration or deployment notes containing credentials to test lateral detection.',
        ].join('\n');
      } else if (action === 'clear') {
        output = '[CLEAR_TERMINAL]';
      } else if (action === 'whoami') {
        output = `${host.defaultUser}@${host.name} (IP: ${host.ip}) [Zone: ${host.zone}] [OS: ${host.os}]`;
      } else if (action === 'ls') {
        const targetDir = parts[1] || host.currentPath || '/';
        const cwd = host.currentPath || '/';
        let resolvedFiles: Record<string, any> = host.files;

        if (cwd !== '/') {
          const folderName = cwd.replace(/^\//, '');
          if (host.files[folderName] && typeof host.files[folderName] === 'object') {
            resolvedFiles = host.files[folderName];
          }
        }

        const entries = Object.keys(resolvedFiles);
        if (entries.length === 0) {
          output = '(directory empty)';
        } else {
          output = entries
            .map((name) => {
              const isDir = typeof resolvedFiles[name] === 'object';
              return isDir ? `${name}/` : name;
            })
            .join('    ');
        }
      } else if (action === 'cd') {
        const target = parts[1];
        if (!target || target === '/' || target === '~') {
          host.currentPath = '/';
          output = '';
        } else if (target === '..') {
          host.currentPath = '/';
          output = '';
        } else {
          const cleanName = target.replace(/\/$/, '');
          if (host.files[cleanName] && typeof host.files[cleanName] === 'object') {
            host.currentPath = `/${cleanName}`;
            output = '';
          } else {
            output = `cd: no such file or directory: ${target}`;
          }
        }
      } else if (action === 'cat') {
        const fileName = parts[1];
        if (!fileName) {
          output = 'cat: missing filename. Usage: cat <filename>';
        } else {
          const cwd = host.currentPath || '/';
          let folder: Record<string, any> = host.files;
          if (cwd !== '/') {
            const folderName = cwd.replace(/^\//, '');
            folder = host.files[folderName] || {};
          }

          if (folder[fileName] !== undefined && typeof folder[fileName] === 'string') {
            const content = folder[fileName];
            output = content;

            // Check if this file houses a honeytoken/decoy credential!
            const matchedDecoy = decoys.find(
              (d) => d.originHost === host.id && d.originFile.toLowerCase() === fileName.toLowerCase()
            );

            if (matchedDecoy) {
              const alreadyDiscovered = events.some(
                (e) => e.type === 'DISCOVERY' && e.sourceHost === host.id && e.decoyId === matchedDecoy.id
              );
              matchedDecoy.interactionCount += 1;
              matchedDecoy.lastInteractedAt = new Date().toISOString();
              host.eventCount = (host.eventCount || 0) + 1;
              if (host.status === 'Healthy') {
                host.status = 'Observed Activity';
              }

              if (!alreadyDiscovered) {
                // Record Discovery Security Event
                const eventId = `EVT-${String(eventCounter++).padStart(4, '0')}`;
                const discoveryEvent: SecurityEvent = {
                  id: eventId,
                  timestamp: new Date().toISOString(),
                  type: 'DISCOVERY',
                  sourceHost: host.id,
                  decoyId: matchedDecoy.id,
                  severity: 'Informational',
                  message: `Simulated decoy credential file '${fileName}' opened on host ${host.id}.`,
                  evidence: {
                    command: trimmed,
                    inspectedFile: fileName,
                    decoyId: matchedDecoy.id,
                    decoyType: matchedDecoy.type,
                    hostIP: host.ip,
                  },
                  mitreTechnique: 'T1552.001 (Credentials in Files)',
                };
                events.unshift(discoveryEvent);
              }
            }
          } else if (folder[fileName] && typeof folder[fileName] === 'object') {
            output = `cat: ${fileName}: Is a directory`;
          } else {
            output = `cat: ${fileName}: No such file or directory`;
          }
        }
      } else if (action === 'use') {
        // Syntax: use <credential-id> --target <host-id>
        const credId = parts[1];
        const targetIndex = parts.indexOf('--target');
        const targetHostId = targetIndex !== -1 && parts[targetIndex + 1] ? parts[targetIndex + 1] : null;

        if (!credId || !targetHostId) {
          output = 'use: invalid syntax. Expected: use <credential-id> --target <target-host>';
        } else {
          const targetHost = hosts.find((h) => h.id === targetHostId);
          if (!targetHost) {
            output = `use: error: target host '${targetHostId}' is unreachable or does not exist.`;
          } else {
            // Check if credential is a known decoy honeytoken
            const matchedDecoy = decoys.find((d) => d.id.toUpperCase() === credId.toUpperCase());

            if (matchedDecoy) {
              const alreadyUsedOnTarget = matchedDecoy.observedTargets.includes(targetHostId);
              if (alreadyUsedOnTarget) {
                output = [
                  `[TRIPWIRE INTERCEPT] Initiating session to ${targetHostId} (${targetHost.ip})...`,
                  `AUTH_KEY: ${matchedDecoy.id}`,
                  `--> Connection rejected: Credential '${matchedDecoy.id}' was previously revoked and quarantined.`,
                  `--> Active incident ${incident?.id || 'INC-2026-BREADCRUMB-01'} remains under containment.`,
                ].join('\n');
                return res.json({
                  output,
                  state: {
                    hosts,
                    decoys,
                    events,
                    alerts,
                    activeHops,
                    incident,
                    metrics: getMetrics(),
                  },
                });
              }

              // Tripwire triggered!
              matchedDecoy.status = 'Triggered';
              matchedDecoy.interactionCount += 1;
              matchedDecoy.lastInteractedAt = new Date().toISOString();
              if (!matchedDecoy.observedTargets.includes(targetHostId)) {
                matchedDecoy.observedTargets.push(targetHostId);
              }

              // Update host statuses
              targetHost.status = 'Incident';
              targetHost.eventCount = (targetHost.eventCount || 0) + 1;

              const originHost = hosts.find((h) => h.id === matchedDecoy.originHost);
              if (originHost) {
                originHost.status = 'Incident';
                originHost.eventCount = (originHost.eventCount || 0) + 1;
              }

              // Record Attack Hop
              const hopId = `HOP-${matchedDecoy.originHost}-${targetHostId}-${Date.now().toString().slice(-4)}`;
              const existingHop = activeHops.find(
                (h) => h.source === matchedDecoy.originHost && h.target === targetHostId && h.decoyId === matchedDecoy.id
              );
              if (!existingHop) {
                activeHops.push({
                  id: hopId,
                  source: matchedDecoy.originHost,
                  target: targetHostId,
                  decoyId: matchedDecoy.id,
                  timestamp: new Date().toISOString(),
                });
              }

              // Generate Credential Use Event
              const eventId = `EVT-${String(eventCounter++).padStart(4, '0')}`;
              const useEvent: SecurityEvent = {
                id: eventId,
                timestamp: new Date().toISOString(),
                type: 'CREDENTIAL_USE',
                sourceHost: matchedDecoy.originHost,
                targetHost: targetHostId,
                decoyId: matchedDecoy.id,
                severity: 'Critical',
                message: `Honeytoken tripwire triggered! Decoy credential ${matchedDecoy.id} (planted on ${matchedDecoy.originHost}) was presented against ${targetHostId}.`,
                evidence: {
                  credentialId: matchedDecoy.id,
                  originHost: matchedDecoy.originHost,
                  originFile: matchedDecoy.originFile,
                  destinationHost: targetHostId,
                  targetIP: targetHost.ip,
                  commandExecuted: trimmed,
                  decoyCategory: matchedDecoy.type,
                },
                mitreTechnique: 'T1078 (Valid Accounts / Honeytoken Ingestion)',
              };
              events.unshift(useEvent);

              // Generate Alert
              const alertId = `ALT-${String(alertCounter++).padStart(4, '0')}`;
              const alert: SecurityAlert = {
                id: alertId,
                timestamp: new Date().toISOString(),
                severity: 'Critical',
                title: `Honeytoken Lateral Auth: ${matchedDecoy.id}`,
                hostId: targetHostId,
                originHost: matchedDecoy.originHost,
                decoyId: matchedDecoy.id,
                reason: `Decoy credential with provenance on ${matchedDecoy.originHost} (${matchedDecoy.originFile}) was presented to authenticate against ${targetHostId}.`,
                evidence: {
                  detectedHop: `${matchedDecoy.originHost} -> ${targetHostId}`,
                  credentialId: matchedDecoy.id,
                  plantedOrigin: `${matchedDecoy.originHost}:${matchedDecoy.originFile}`,
                  observedTarget: targetHostId,
                  confidence: '100% Deterministic Decoy Provenance',
                },
              };
              alerts.unshift(alert);

              // Open or update incident
              const affectedHostIds = Array.from(
                new Set([...(incident?.affectedHosts || []), matchedDecoy.originHost, targetHostId])
              );
              const triggeredDecoyIds = Array.from(
                new Set([...(incident?.triggeredDecoys || []), matchedDecoy.id])
              );

              const triggeredObjects = decoys.filter((d) => triggeredDecoyIds.includes(d.id));
              const recommendations = generateRecommendations(triggeredObjects, activeHops);

              incident = {
                id: 'INC-2026-BREADCRUMB-01',
                status: 'OPEN',
                startTime: incident?.startTime || new Date().toISOString(),
                title: `Unauthorized Lateral Movement via Honeytoken ${matchedDecoy.id}`,
                affectedHosts: affectedHostIds,
                triggeredDecoys: triggeredDecoyIds,
                summary: `Deterministic deception alert: Decoy credential ${matchedDecoy.id} created exclusively on ${matchedDecoy.originHost} in '${matchedDecoy.originFile}' was utilized to initiate authentication on ${targetHostId}. This confirms unauthorized adversary discovery and lateral traversal between ${matchedDecoy.originHost} and ${targetHostId}.`,
                provenance: triggeredObjects.map((d) => ({
                  credentialId: d.id,
                  originHost: d.originHost,
                  originFile: d.originFile,
                  observedTarget: d.observedTargets.join(', ') || targetHostId,
                  detectionReason: 'Known decoy credential used across distinct simulated host boundary.',
                })),
                mitreTechniques: [
                  { id: 'T1083', name: 'File and Directory Discovery', phase: 'Discovery' },
                  { id: 'T1552.001', name: 'Credentials In Files: Local Credentials', phase: 'Credential Access' },
                  { id: 'T1078', name: 'Valid Accounts: Honeytoken Deception', phase: 'Defense Evasion' },
                  { id: 'T1021', name: 'Remote Services: Lateral Movement', phase: 'Lateral Movement' },
                ],
                defensiveRecommendations: recommendations,
              };

              output = [
                `[TRIPWIRE INTERCEPT] Initiating session to ${targetHostId} (${targetHost.ip})...`,
                `AUTH_KEY: ${matchedDecoy.id}`,
                `--> Connection rejected by Breadcrumb Deception Sentinel.`,
                `--> ALERT GENERATED: Provenance violation detected.`,
                `--> Decoy Origin: ${matchedDecoy.originHost} (${matchedDecoy.originFile})`,
                `--> Target Host: ${targetHostId}`,
                `--> Incident Record Logged: INC-2026-BREADCRUMB-01`,
              ].join('\n');
            } else {
              output = [
                `Connecting to ${targetHostId} (${targetHost.ip})...`,
                `Authentication failed: Credential '${credId}' is not recognized or has expired.`,
              ].join('\n');
            }
          }
        }
      } else {
        output = `breadcrumb-sh: command not found: ${action}. Type 'help' for a list of simulated commands.`;
      }

      return res.json({
        output,
        state: {
          hosts,
          decoys,
          events,
          alerts,
          activeHops,
          incident,
          metrics: getMetrics(),
        },
      });
    } catch (err: any) {
      console.error('Command processing error:', err);
      res.status(500).json({ error: 'Internal simulation error: ' + err.message });
    }
  });

  // Automated one-click Attack Scenario Demo endpoint
  app.post('/api/demo', (req, res) => {
    // Execute full deterministic sequence
    // Step 1: web-01 whoami & ls
    // Step 2: web-01 cat deployment_notes.txt
    // Step 3: web-01 use DECOY-WEB-7F3A --target backup-01
    const webHost = hosts.find((h) => h.id === 'web-01')!;
    const backupHost = hosts.find((h) => h.id === 'backup-01')!;
    const decoy = decoys.find((d) => d.id === 'DECOY-WEB-7F3A')!;

    if (decoy && decoy.status === 'Triggered') {
      return res.json({
        success: true,
        alreadyTriggered: true,
        message: 'Demonstration scenario was already executed. Reset scenario to run again.',
        state: {
          hosts,
          decoys,
          events,
          alerts,
          activeHops,
          incident,
          metrics: getMetrics(),
        },
      });
    }

    // 1. Discovery
    decoy.interactionCount += 1;
    decoy.lastInteractedAt = new Date().toISOString();
    webHost.eventCount = (webHost.eventCount || 0) + 1;
    webHost.status = 'Observed Activity';

    const evt1: SecurityEvent = {
      id: `EVT-${String(eventCounter++).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
      type: 'DISCOVERY',
      sourceHost: 'web-01',
      decoyId: decoy.id,
      severity: 'Informational',
      message: `Simulated decoy credential file 'deployment_notes.txt' accessed on web-01.`,
      evidence: {
        command: 'cat deployment_notes.txt',
        inspectedFile: 'deployment_notes.txt',
        decoyId: decoy.id,
      },
      mitreTechnique: 'T1552.001 (Credentials in Files)',
    };
    events.unshift(evt1);

    // 2. Lateral auth using decoy
    decoy.status = 'Triggered';
    decoy.interactionCount += 1;
    if (!decoy.observedTargets.includes('backup-01')) {
      decoy.observedTargets.push('backup-01');
    }

    webHost.status = 'Incident';
    webHost.eventCount = (webHost.eventCount || 0) + 1;
    backupHost.status = 'Incident';
    backupHost.eventCount = (backupHost.eventCount || 0) + 1;

    activeHops = [
      {
        id: `HOP-web-01-backup-01-${Date.now().toString().slice(-4)}`,
        source: 'web-01',
        target: 'backup-01',
        decoyId: decoy.id,
        timestamp: new Date().toISOString(),
      },
    ];

    const evt2: SecurityEvent = {
      id: `EVT-${String(eventCounter++).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
      type: 'CREDENTIAL_USE',
      sourceHost: 'web-01',
      targetHost: 'backup-01',
      decoyId: decoy.id,
      severity: 'Critical',
      message: `Honeytoken tripwire triggered! Decoy credential ${decoy.id} (planted on web-01) was presented against backup-01.`,
      evidence: {
        credentialId: decoy.id,
        originHost: 'web-01',
        originFile: 'deployment_notes.txt',
        destinationHost: 'backup-01',
        commandExecuted: 'use DECOY-WEB-7F3A --target backup-01',
      },
      mitreTechnique: 'T1078 (Valid Accounts / Honeytoken Ingestion)',
    };
    events.unshift(evt2);

    const alert: SecurityAlert = {
      id: `ALT-${String(alertCounter++).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
      severity: 'Critical',
      title: `Honeytoken Lateral Auth: ${decoy.id}`,
      hostId: 'backup-01',
      originHost: 'web-01',
      decoyId: decoy.id,
      reason: `Decoy credential with provenance on web-01 (deployment_notes.txt) was presented to authenticate against backup-01.`,
      evidence: {
        detectedHop: 'web-01 -> backup-01',
        credentialId: decoy.id,
        plantedOrigin: 'web-01:deployment_notes.txt',
        observedTarget: 'backup-01',
        confidence: '100% Deterministic Decoy Provenance',
      },
    };
    alerts.unshift(alert);

    incident = {
      id: 'INC-2026-BREADCRUMB-01',
      status: 'OPEN',
      startTime: new Date().toISOString(),
      title: `Unauthorized Lateral Movement via Honeytoken ${decoy.id}`,
      affectedHosts: ['web-01', 'backup-01'],
      triggeredDecoys: [decoy.id],
      summary: `Deterministic deception alert: Decoy credential ${decoy.id} created exclusively on web-01 in 'deployment_notes.txt' was utilized to initiate authentication on backup-01. This confirms unauthorized adversary discovery and lateral traversal between web-01 and backup-01.`,
      provenance: [
        {
          credentialId: decoy.id,
          originHost: 'web-01',
          originFile: 'deployment_notes.txt',
          observedTarget: 'backup-01',
          detectionReason: 'Known decoy credential used across distinct simulated host boundary.',
        },
      ],
      mitreTechniques: [
        { id: 'T1083', name: 'File and Directory Discovery', phase: 'Discovery' },
        { id: 'T1552.001', name: 'Credentials In Files: Local Credentials', phase: 'Credential Access' },
        { id: 'T1078', name: 'Valid Accounts: Honeytoken Deception', phase: 'Defense Evasion' },
        { id: 'T1021', name: 'Remote Services: Lateral Movement', phase: 'Lateral Movement' },
      ],
      defensiveRecommendations: generateRecommendations([decoy], activeHops),
    };

    res.json({
      success: true,
      message: 'Demonstration scenario executed successfully.',
      state: {
        hosts,
        decoys,
        events,
        alerts,
        activeHops,
        incident,
        metrics: getMetrics(),
      },
    });
  });

  // Serve static files in production or mount Vite middleware in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('dist/ folder not found, please run npm run build');
    }
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Breadcrumb] Deception Sentinel Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
