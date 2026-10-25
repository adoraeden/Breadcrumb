import { SimulationState } from '../types';

const REQUEST_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchState(): Promise<SimulationState> {
  const res = await fetchWithTimeout('/api/state');
  if (!res.ok) {
    throw new Error(`Failed to fetch state: ${res.statusText}`);
  }
  return res.json();
}

export async function executeCommand(
  hostId: string,
  command: string
): Promise<{ output: string; state: SimulationState }> {
  const res = await fetchWithTimeout('/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, command }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to execute command');
  }
  return res.json();
}

export async function runAutomatedDemo(): Promise<{ success: boolean; state: SimulationState; message?: string }> {
  const res = await fetchWithTimeout('/api/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to run demo simulation');
  }
  return res.json();
}

export async function resetSimulation(): Promise<{ success: boolean; state: SimulationState }> {
  const res = await fetchWithTimeout('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to reset simulation');
  }
  return res.json();
}

