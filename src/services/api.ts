import { Convoy, TacticalAlert } from '../types';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:3001/api'
  : '/api';

export async function fetchConvoysApi(): Promise<Convoy[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/convoys`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.convoys || [];
  } catch (err) {
    console.warn('[API] Failed to fetch convoys from server, using local fallback:', err);
    return [];
  }
}

export async function addConvoyApi(convoyData: Omit<Convoy, 'id'> & { id?: string }): Promise<Convoy> {
  const res = await fetch(`${API_BASE_URL}/convoys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(convoyData),
  });

  if (!res.ok) {
    throw new Error(`Failed to add vehicle: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.convoy;
}

export async function rerouteConvoyApi(
  convoyId: string,
  options: {
    reason?: string;
    approvedBy?: string;
    bypassRouteId?: string;
    newEta?: string;
  } = {}
): Promise<{ success: boolean; convoy: Convoy; rerouteRecord: any }> {
  const res = await fetch(`${API_BASE_URL}/convoys/${convoyId}/reroute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    throw new Error(`Failed to reroute vehicle: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function fetchAlertsApi(): Promise<TacticalAlert[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.alerts || [];
  } catch (err) {
    console.warn('[API] Failed to fetch alerts from server:', err);
    return [];
  }
}

export async function acknowledgeAlertApi(alertId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Failed to acknowledge alert on server:', err);
    return false;
  }
}

export async function submitIncidentsApi(reports: any[] | any): Promise<any> {
  const payload = Array.isArray(reports) ? reports : [reports];
  const res = await fetch(`${API_BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to submit incident: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function injectSimulationApi(payload: {
  vehicleId?: string;
  incidentType: string;
  severity: string;
  location: string;
  duration?: string;
  details?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/simulation/inject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to inject simulation: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function resetSimulationApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulation/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Reset simulation failed on server:', err);
    return null;
  }
}

export async function fetchHistoryApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/history`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Failed to fetch audit history:', err);
    return { reroutes: [], simulations: [], incidents: [] };
  }
}
