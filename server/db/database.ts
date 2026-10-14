import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { CONVOYS, NH13_PRIMARY_CORRIDOR, NH13_DYNAMIC_BYPASS, SELA_HAZARD_SECTOR, TACTICAL_ALERTS } from '../../src/data/mockData';
import { Convoy, TacticalAlert, FieldIncidentEntry } from '../../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'nerlogix-data')
  : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'nerlogix-db.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  operatorId: string;
  role: 'ADMIN' | 'DRIVER' | 'SIMULATION_OPERATOR';
  assignedVehicle?: string;
  designation: string;
  passwords: string[];
}

export interface RerouteRecord {
  id: string;
  convoyId: string;
  vehicleName: string;
  originRoute: string;
  destinationRoute: string;
  reason: string;
  approvedBy: string;
  riskReduction: number;
  addedDistanceKm: number;
  addedTimeMin: number;
  timestamp: string;
}

export interface SimulationRecord {
  id: string;
  vehicleId: string;
  incidentType: string;
  severity: string;
  location: string;
  duration?: string;
  details: string;
  timestamp: string;
  status: 'PROPAGATED' | 'REROUTED';
}

export interface DatabaseSchema {
  users: UserRecord[];
  convoys: Convoy[];
  alerts: TacticalAlert[];
  incidents: any[];
  reroutes: RerouteRecord[];
  simulations: SimulationRecord[];
  lastUpdated: string;
}

const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'USR-ADM-01',
    name: 'Major Vikram Sen',
    email: 'admin@nerlogix.in',
    operatorId: 'ADM-01',
    role: 'ADMIN',
    designation: 'Chief Logistics Controller',
    passwords: ['admin123', 'admin@123', 'password', '123456'],
  },
  {
    id: 'USR-DRV-01',
    name: 'Rohit Das',
    email: 'rohit@nerlogix.in',
    operatorId: 'DRV-01',
    role: 'DRIVER',
    assignedVehicle: 'NER-TRK-01',
    designation: 'Senior Heavy Freight Pilot',
    passwords: ['driver123', 'driver@123', 'password', '123456'],
  },
  {
    id: 'USR-SIM-01',
    name: 'Ananya Roy',
    email: 'sim@nerlogix.in',
    operatorId: 'SIM-01',
    role: 'SIMULATION_OPERATOR',
    designation: 'Tactical Disaster Simulator',
    passwords: ['sim123', 'sim@123', 'password', '123456'],
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all arrays exist
        return {
          users: parsed.users || DEFAULT_USERS,
          convoys: parsed.convoys || CONVOYS,
          alerts: parsed.alerts || TACTICAL_ALERTS,
          incidents: parsed.incidents || [],
          reroutes: parsed.reroutes || [],
          simulations: parsed.simulations || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('[DB] Failed to read database file, initializing defaults.', err);
    }

    // Default initial database state
    const initialDb: DatabaseSchema = {
      users: DEFAULT_USERS,
      convoys: JSON.parse(JSON.stringify(CONVOYS)),
      alerts: JSON.parse(JSON.stringify(TACTICAL_ALERTS)),
      incidents: [
        {
          id: 'inc-init-01',
          hazardType: 'Landslide',
          highway: 'NH-13 Trans-Himalayan Highway',
          kilometerMark: 'KM 414.2 (Sela Pass Ascent Sector)',
          severity: 'Impassable',
          coordinates: [27.505, 92.105],
          reporterName: 'Subedar D. Dorjee (BRO 42 BRTF)',
          notes: '140 m³ metamorphic rockfall blocking primary carriageway.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          synced: true,
        },
      ],
      reroutes: [],
      simulations: [],
      lastUpdated: new Date().toISOString(),
    };

    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDataDirectory();
      const payload = dataToSave || this.data;
      payload.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err);
    }
  }

  // ==========================================
  // USERS
  // ==========================================
  public getUsers(): UserRecord[] {
    return this.data.users;
  }

  public authenticateUser(identifier: string, password: string): UserRecord | null {
    const id = identifier.trim().toLowerCase();
    const pwd = password.trim();

    return (
      this.data.users.find(
        (u) =>
          (u.email.toLowerCase() === id || u.operatorId.toLowerCase() === id) &&
          u.passwords.includes(pwd)
      ) || null
    );
  }

  // ==========================================
  // CONVOYS & VEHICLES
  // ==========================================
  public getConvoys(): Convoy[] {
    return this.data.convoys;
  }

  public getConvoyById(id: string): Convoy | undefined {
    return this.data.convoys.find((c) => c.id === id || c.callsign.includes(id));
  }

  public addConvoy(convoyData: Omit<Convoy, 'id'> & { id?: string }): Convoy {
    const newConvoy: Convoy = {
      ...convoyData,
      id: convoyData.id || `convoy-trk-${Date.now().toString().slice(-4)}`,
    };

    this.data.convoys.push(newConvoy);
    this.saveData();
    return newConvoy;
  }

  public updateConvoy(id: string, updates: Partial<Convoy>): Convoy | null {
    const index = this.data.convoys.findIndex((c) => c.id === id || c.callsign.includes(id));
    if (index === -1) return null;

    this.data.convoys[index] = {
      ...this.data.convoys[index],
      ...updates,
    };
    this.saveData();
    return this.data.convoys[index];
  }

  public rerouteConvoy(
    convoyId: string,
    options: {
      bypassRouteId?: string;
      reason?: string;
      approvedBy?: string;
      newEta?: string;
    } = {}
  ): { convoy: Convoy; rerouteRecord: RerouteRecord } | null {
    const convoy = this.getConvoyById(convoyId);
    if (!convoy) return null;

    const bypassRouteId = options.bypassRouteId || NH13_DYNAMIC_BYPASS.id;
    const updatedConvoy = this.updateConvoy(convoy.id, {
      routeId: bypassRouteId,
      status: 'DIVERTED',
      distanceToHazardKm: 0,
      eta: options.newEta || '3h 26m IST',
      lastSatelliteTick: 'Reroute Dispatched via Control Center',
    });

    if (!updatedConvoy) return null;

    const rerouteRecord: RerouteRecord = {
      id: `RR-${Date.now().toString().slice(-4)}`,
      convoyId: updatedConvoy.id,
      vehicleName: updatedConvoy.callsign,
      originRoute: NH13_PRIMARY_CORRIDOR.name,
      destinationRoute: NH13_DYNAMIC_BYPASS.name,
      reason: options.reason || 'Landslide hazard avoidance on NH-13 Primary Corridor (Mawkdok Sector).',
      approvedBy: options.approvedBy || 'Major Vikram Sen (Control Center)',
      riskReduction: 63,
      addedDistanceKm: 15,
      addedTimeMin: 18,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.data.reroutes.unshift(rerouteRecord);
    this.saveData();

    return { convoy: updatedConvoy, rerouteRecord };
  }

  // ==========================================
  // ALERTS
  // ==========================================
  public getAlerts(): TacticalAlert[] {
    return this.data.alerts;
  }

  public addAlert(alert: Omit<TacticalAlert, 'id'> & { id?: string }): TacticalAlert {
    const newAlert: TacticalAlert = {
      ...alert,
      id: alert.id || `alt-${Date.now().toString().slice(-4)}`,
      acknowledged: false,
    };
    this.data.alerts.unshift(newAlert);
    this.saveData();
    return newAlert;
  }

  public acknowledgeAlert(id: string): TacticalAlert | null {
    const alert = this.data.alerts.find((a) => a.id === id);
    if (!alert) return null;

    alert.acknowledged = true;
    this.saveData();
    return alert;
  }

  // ==========================================
  // FIELD INCIDENTS
  // ==========================================
  public getIncidents(): any[] {
    return this.data.incidents;
  }

  public addIncident(incident: any): any {
    const newIncident = {
      ...incident,
      id: incident.id || `inc-${Date.now().toString().slice(-4)}`,
      synced: true,
      timestamp: incident.timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      syncTimestamp: new Date().toISOString(),
    };

    this.data.incidents.unshift(newIncident);

    // Automatically create a corresponding tactical alert
    this.addAlert({
      level: incident.severity === 'Impassable' || incident.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      code: 'ALT-FIELD',
      title: `Field Alert: ${incident.hazardType || 'Hazard'} Reported`,
      details: `${incident.hazardType} at ${incident.kilometerMark || incident.highway || 'Corridor'}. ${incident.notes || ''}`,
      sector: incident.highway || 'NH-13 Corridor',
      timestamp: 'Just now',
      acknowledged: false,
    });

    this.saveData();
    return newIncident;
  }

  // ==========================================
  // SIMULATION SCENARIOS
  // ==========================================
  public getSimulations(): SimulationRecord[] {
    return this.data.simulations;
  }

  public injectSimulation(simulation: Omit<SimulationRecord, 'id' | 'timestamp' | 'status'>): SimulationRecord {
    const newSim: SimulationRecord = {
      ...simulation,
      id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PROPAGATED',
    };

    this.data.simulations.unshift(newSim);

    // Elevate risk and generate alert
    this.addAlert({
      level: simulation.severity === 'Critical' ? 'CRITICAL' : 'WARNING',
      code: 'ALT-SIM',
      title: `SIMULATION: ${simulation.incidentType} Injected`,
      details: `${simulation.details} (${simulation.location}) targeting ${simulation.vehicleId}.`,
      sector: simulation.location,
      timestamp: 'Just now',
      acknowledged: false,
    });

    this.saveData();
    return newSim;
  }

  public resetSimulation() {
    this.data.convoys = JSON.parse(JSON.stringify(CONVOYS));
    this.data.alerts = JSON.parse(JSON.stringify(TACTICAL_ALERTS));
    this.saveData();
  }

  // ==========================================
  // REROUTE LOGS
  // ==========================================
  public getReroutes(): RerouteRecord[] {
    return this.data.reroutes;
  }
}

export const db = new DatabaseManager();
