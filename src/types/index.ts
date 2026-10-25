export interface HostNode {
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

export interface DecoyAsset {
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

export interface SecurityEvent {
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

export interface SecurityAlert {
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

export interface AttackHop {
  id: string;
  source: string;
  target: string;
  decoyId: string;
  timestamp: string;
}

export interface SecurityIncident {
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

export interface SystemMetrics {
  totalHosts: number;
  affectedHosts: number;
  activeIncidents: number;
  decoyInteractions: number;
  observedAttackHops: number;
}

export interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'system' | 'error';
  content: string;
  hostId?: string;
  user?: string;
}

export interface SimulationState {
  hosts: HostNode[];
  decoys: DecoyAsset[];
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  activeHops: AttackHop[];
  incident: SecurityIncident | null;
  metrics: SystemMetrics;
}
