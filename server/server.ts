import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './db/database';
import { NH13_PRIMARY_CORRIDOR, NH13_DYNAMIC_BYPASS, SELA_HAZARD_SECTOR } from '../src/data/mockData';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// SSE Clients pool
let sseClients: Response[] = [];

export function broadcastEvent(eventData: any) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Ignore broken client connections
    }
  });
}

// Background telemetry tick broadcast (every 2.5s)
setInterval(() => {
  if (sseClients.length === 0) return;

  const convoys = db.getConvoys();
  const alerts = db.getAlerts();

  broadcastEvent({
    type: 'TELEMETRY_TICK',
    timestamp: new Date().toISOString(),
    convoysCount: convoys.length,
    activeAlertsCount: alerts.filter((a) => !a.acknowledged).length,
  });
}, 2500);

// =============================================================================
// AUTHENTICATION
// =============================================================================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Operator ID and password are required.' });
  }

  const user = db.authenticateUser(identifier, password);
  if (!user) {
    return res.status(401).json({ error: 'Incorrect email/Operator ID or password.' });
  }

  const { passwords, ...userProfile } = user;
  const token = `jwt-nerlogix-${user.role.toLowerCase()}-${Date.now()}`;

  res.json({
    success: true,
    user: userProfile,
    token,
    message: 'Authentication successful.',
  });
});

// =============================================================================
// HEALTH & CORRIDOR INTELLIGENCE
// =============================================================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ACTIVE',
    service: 'NER-LOGIX Tactical Operations Engine',
    database: 'Embedded Persistent Storage Active',
    sector: 'NH-13 Trans-Himalayan Highway (Guwahati ⇄ Tawang)',
    activeConvoys: db.getConvoys().length,
    activeAlerts: db.getAlerts().filter((a) => !a.acknowledged).length,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get('/api/telemetry/live', (_req: Request, res: Response) => {
  res.json({
    convoys: db.getConvoys(),
    primaryCorridor: NH13_PRIMARY_CORRIDOR,
    bypassCorridor: NH13_DYNAMIC_BYPASS,
    hazardSector: SELA_HAZARD_SECTOR,
    alerts: db.getAlerts(),
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// CONVOYS & VEHICLES
// =============================================================================
app.get('/api/convoys', (_req: Request, res: Response) => {
  res.json({
    success: true,
    convoys: db.getConvoys(),
    total: db.getConvoys().length,
  });
});

app.get('/api/convoys/:id', (req: Request, res: Response) => {
  const convoy = db.getConvoyById(req.params.id);
  if (!convoy) {
    return res.status(404).json({ error: 'Convoy not found.' });
  }
  res.json({ success: true, convoy });
});

// Register New Vehicle
app.post('/api/convoys', (req: Request, res: Response) => {
  const newConvoy = db.addConvoy(req.body);

  // Broadcast new vehicle to all clients (Admin, Driver, Simulation)
  broadcastEvent({
    type: 'CONVOY_ADDED',
    convoy: newConvoy,
    convoys: db.getConvoys(),
    message: `Vehicle ${newConvoy.callsign} registered and active on corridor.`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    convoy: newConvoy,
    message: 'Vehicle registered and saved to database.',
  });
});

// Reroute / Divert Convoy
app.post('/api/convoys/:id/reroute', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, approvedBy, bypassRouteId, newEta } = req.body;

  const result = db.rerouteConvoy(id, {
    reason,
    approvedBy,
    bypassRouteId,
    newEta,
  });

  if (!result) {
    return res.status(404).json({ error: `Convoy with ID ${id} not found.` });
  }

  // Broadcast reroute to all connected clients (Driver gets instant notification!)
  broadcastEvent({
    type: 'CONVOY_REROUTED',
    convoyId: result.convoy.id,
    convoy: result.convoy,
    rerouteRecord: result.rerouteRecord,
    convoys: db.getConvoys(),
    message: `🚨 Control Center Dispatched Reroute for ${result.convoy.callsign}: Diverted to Dynamic Bypass NH-13B.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    convoy: result.convoy,
    rerouteRecord: result.rerouteRecord,
    message: 'Reroute approved, persisted in database, and broadcasted to Driver.',
  });
});

// =============================================================================
// ALERTS
// =============================================================================
app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    alerts: db.getAlerts(),
    unreadCount: db.getAlerts().filter((a) => !a.acknowledged).length,
  });
});

app.post('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const updated = db.acknowledgeAlert(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Alert not found.' });
  }

  broadcastEvent({
    type: 'ALERT_ACKNOWLEDGED',
    alertId: req.params.id,
    alerts: db.getAlerts(),
  });

  res.json({ success: true, alert: updated });
});

// =============================================================================
// FIELD INCIDENTS & DISPATCH
// =============================================================================
app.get('/api/incidents', (_req: Request, res: Response) => {
  res.json({
    success: true,
    incidents: db.getIncidents(),
  });
});

app.post('/api/incidents', (req: Request, res: Response) => {
  const payload = req.body;
  const reports: any[] = Array.isArray(payload) ? payload : [payload];
  const processed = reports.map((r) => db.addIncident(r));

  // Broadcast incident to all clients
  broadcastEvent({
    type: 'INCIDENT_REPORTED',
    incidents: processed,
    alerts: db.getAlerts(),
    message: `⚠️ Field Incident Received: ${processed[0]?.hazardType || 'Hazard'} reported on corridor.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    processedCount: processed.length,
    reports: processed,
    message: `Persisted ${processed.length} incident report(s) to database.`,
  });
});

// =============================================================================
// SIMULATION
// =============================================================================
app.get('/api/simulation/history', (_req: Request, res: Response) => {
  res.json({
    success: true,
    simulations: db.getSimulations(),
  });
});

app.post('/api/simulation/inject', (req: Request, res: Response) => {
  const { vehicleId, incidentType, severity, location, duration, details } = req.body;

  const sim = db.injectSimulation({
    vehicleId: vehicleId || 'NER-TRK-01',
    incidentType: incidentType || 'Landslide',
    severity: severity || 'Critical',
    location: location || 'NH-6 Near Mawkdok, Meghalaya',
    duration: duration || '3 Hours',
    details: details || `${incidentType} simulated by operator.`,
  });

  // Broadcast simulation to all clients
  broadcastEvent({
    type: 'SIMULATION_INJECTED',
    simulation: sim,
    alerts: db.getAlerts(),
    message: `⚡ Simulation Injected: ${sim.incidentType} (${sim.severity}) at ${sim.location}.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    simulation: sim,
    message: 'Simulation scenario injected and active on network.',
  });
});

app.post('/api/simulation/reset', (_req: Request, res: Response) => {
  db.resetSimulation();

  broadcastEvent({
    type: 'SIMULATION_RESET',
    convoys: db.getConvoys(),
    alerts: db.getAlerts(),
    message: 'Simulation reset: All routes and vehicles restored to baseline state.',
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    convoys: db.getConvoys(),
    alerts: db.getAlerts(),
    message: 'Simulation database reset successfully.',
  });
});

// Audit History
app.get('/api/history', (_req: Request, res: Response) => {
  res.json({
    success: true,
    reroutes: db.getReroutes(),
    simulations: db.getSimulations(),
    incidents: db.getIncidents(),
  });
});

// =============================================================================
// REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// =============================================================================
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial snapshot
  res.write(
    `data: ${JSON.stringify({
      type: 'INIT',
      convoys: db.getConvoys(),
      alerts: db.getAlerts(),
      hazardSector: SELA_HAZARD_SECTOR,
      primaryCorridor: NH13_PRIMARY_CORRIDOR,
      bypassCorridor: NH13_DYNAMIC_BYPASS,
    })}\n\n`
  );

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

const server = app.listen(PORT, () => {
  console.log(`[NER-LOGIX Operations Engine] Active on http://localhost:${PORT}`);
  console.log(`[Database] File-persisted storage loaded successfully`);
  console.log(`[Sector] NH-13 Trans-Himalayan Highway (Guwahati ⇄ Tawang)`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[NER-LOGIX Operations Engine] Port ${PORT} is already in use by another instance. Using existing running service.`);
  } else {
    console.error('[NER-LOGIX Operations Engine] Server error:', err);
  }
});
