import { NER_ROUTE_POLYLINE, CONVOYS } from '../data/mockData';

export interface VehicleTelemetry {
  id: string;
  code: string;
  vehicleNo: string;
  callsign: string;
  operator: string;
  driverContact?: string;
  movementStatus: 'Moving' | 'Delayed' | 'Idle' | 'Stopped';
  speedKmh: number;
  cargoCategory?: string;
  cargoManifest?: string;
  cargoWeightKg?: number;
  currentRoute?: string;
  origin?: string;
  destination?: string;
  lat: number;
  lng: number;
  heading: number;
  progress: number;
  isHeadingEast: boolean;
  kmCompleted: number;
  kmRemaining: number;
  totalKm: number;
  etaString: string;
  etaTime: string;
  statusColor: string;
}

interface FleetVehicleConfig {
  id: string;
  code: string;
  vehicleNo: string;
  callsign: string;
  operator: string;
  driverContact: string;
  movementStatus: 'Moving' | 'Delayed' | 'Idle' | 'Stopped';
  speedKmh: number;
  baseProgress: number;
  speedRate: number; // Speed scale factor relative to standard pace
  cargoCategory: string;
  cargoManifest: string;
  cargoWeightKg: number;
  currentRoute: string;
  origin: string;
  destination: string;
  totalKm: number;
}

const FLEET_CONFIGS: FleetVehicleConfig[] = [
  {
    id: 'convoy-trk-042',
    code: 'TRK-042',
    callsign: 'CONVOY-04',
    vehicleNo: 'AS-01-HC-4821',
    operator: 'Phurba Tsering',
    driverContact: '+91 94022 19340',
    movementStatus: 'Moving',
    speedKmh: 46,
    baseProgress: 0.58,
    speedRate: 0.85,
    cargoCategory: 'ARCTIC-FUEL',
    cargoManifest: 'Special Grade High-Altitude Diesel Fuel',
    cargoWeightKg: 21000,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 545,
  },
  {
    id: 'convoy-02',
    code: 'TRK-017',
    callsign: 'CONVOY-02',
    vehicleNo: 'AS-01-MD-9104',
    operator: 'Biren Gogoi',
    driverContact: '+91 98561 74012',
    movementStatus: 'Moving',
    speedKmh: 32,
    baseProgress: 0.38,
    speedRate: 0.70,
    cargoCategory: 'CRYOGENIC-OXYGEN',
    cargoManifest: 'Medical Oxygen Cylinders & Cryogenic Liquid Tanks',
    cargoWeightKg: 18200,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
  {
    id: 'convoy-03',
    code: 'TRK-028',
    callsign: 'CONVOY-03',
    vehicleNo: 'AR-02-TX-3329',
    operator: 'Kezhokhoto Angami',
    driverContact: '+91 97740 55198',
    movementStatus: 'Delayed',
    speedKmh: 0,
    baseProgress: 0.72,
    speedRate: 0.0,
    cargoCategory: 'EMERGENCY-RATIONS',
    cargoManifest: 'Strategic Food Reserve & Emergency Dry Rations',
    cargoWeightKg: 28500,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
  {
    id: 'convoy-07',
    code: 'TRK-091',
    callsign: 'CONVOY-07',
    vehicleNo: 'MZ-01-BK-4011',
    operator: 'Rajesh Bora',
    driverContact: '+91 94351 88204',
    movementStatus: 'Moving',
    speedKmh: 51,
    baseProgress: 0.18,
    speedRate: 0.90,
    cargoCategory: 'ESSENTIAL-MEDS',
    cargoManifest: 'Critical Cold-Chain Vaccines & Medical Supplies',
    cargoWeightKg: 8500,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
  {
    id: 'convoy-05',
    code: 'TRK-103',
    callsign: 'CONVOY-05',
    vehicleNo: 'NL-07-AA-9932',
    operator: 'Dawa Lepcha',
    driverContact: '+91 98620 48115',
    movementStatus: 'Idle',
    speedKmh: 28,
    baseProgress: 0.48,
    speedRate: 0.35,
    cargoCategory: 'INFRA-EQUIPMENT',
    cargoManifest: 'Pre-cast Bridge Spans & Heavy Engineering Spares',
    cargoWeightKg: 38000,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
  {
    id: 'convoy-08',
    code: 'TRK-118',
    callsign: 'CONVOY-08',
    vehicleNo: 'MN-01-CD-6619',
    operator: 'Suraj Debbarma',
    driverContact: '+91 94350 67201',
    movementStatus: 'Moving',
    speedKmh: 36,
    baseProgress: 0.84,
    speedRate: 0.75,
    cargoCategory: 'COMMS-RELAYS',
    cargoManifest: 'Satellite Terminals & High-Altitude Repeater Relays',
    cargoWeightKg: 8900,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
  {
    id: 'convoy-09',
    code: 'TRK-126',
    callsign: 'CONVOY-09',
    vehicleNo: 'AR-04-CM-5520',
    operator: 'Tashi Namgyal',
    driverContact: '+91 94360 28194',
    movementStatus: 'Delayed',
    speedKmh: 22,
    baseProgress: 0.92,
    speedRate: 0.40,
    cargoCategory: 'ALPINE-SUPPLIES',
    cargoManifest: 'Extreme Weather Thermal Gear & Rations',
    cargoWeightKg: 12400,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
  {
    id: 'convoy-10',
    code: 'TRK-139',
    callsign: 'CONVOY-10',
    vehicleNo: 'ML-05-AB-7714',
    operator: 'Hemen Kalita',
    driverContact: '+91 98640 12390',
    movementStatus: 'Moving',
    speedKmh: 48,
    baseProgress: 0.06,
    speedRate: 0.80,
    cargoCategory: 'COLD-STORAGE',
    cargoManifest: 'Perishable Strategic Rations & Food Stocks',
    cargoWeightKg: 14200,
    currentRoute: 'Guwahati ➔ Itanagar',
    origin: 'Guwahati, Assam',
    destination: 'Itanagar, Arunachal Pradesh',
    totalKm: 312,
  },
];

class VehicleAnimationService {
  private baseTimestamp: number = performance.now();
  private simSpeed: number = 1;
  private subscribers: Set<(telemetries: VehicleTelemetry[], primary: VehicleTelemetry) => void> = new Set();
  private rafId: number | null = null;
  private primaryVehicleId: string = 'convoy-trk-042';

  // 39 segments along the 312 km route; 16 seconds per segment base duration for very slow, smooth gliding
  private readonly totalSegments: number = NER_ROUTE_POLYLINE.length - 1;
  private readonly totalDurationMs: number = (NER_ROUTE_POLYLINE.length - 1) * 16000; // 624,000 ms

  constructor() {
    this.startMasterLoop();
  }

  public setSimSpeed(speed: number) {
    this.simSpeed = Math.max(0.1, speed);
  }

  public setPrimaryVehicleId(id: string) {
    this.primaryVehicleId = id;
  }

  private calculateVehicleTelemetry(config: FleetVehicleConfig, elapsedMs: number): VehicleTelemetry {
    const progressDelta = (elapsedMs * this.simSpeed * config.speedRate) / this.totalDurationMs;
    let progress = (config.baseProgress + progressDelta) % 1;
    if (progress < 0) progress += 1;

    const points = NER_ROUTE_POLYLINE;
    const totalSegments = points.length - 1;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const segmentIndex = Math.min(Math.floor(clampedProgress * totalSegments), totalSegments - 1);
    const segFraction = (clampedProgress * totalSegments) - segmentIndex;

    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1] || p1;

    const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * segFraction;

    const dLat = p2[0] - p1[0];
    const dLng = p2[1] - p1[1];
    const headingRad = Math.atan2(dLng, dLat);
    let heading = Math.round((headingRad * 180) / Math.PI);
    if (heading < 0) heading += 360;
    const isHeadingEast = dLng >= 0 || (heading >= 0 && heading <= 180);

    const progressKm = Math.round(progress * config.totalKm);
    const kmRemaining = Math.max(0, config.totalKm - progressKm);

    // Dynamic realistic ETA calculation
    const hoursLeft = kmRemaining / Math.max(15, config.speedKmh);
    const hrs = Math.floor(hoursLeft);
    const mins = Math.round((hoursLeft - hrs) * 60);
    const etaString = `${hrs}h ${mins.toString().padStart(2, '0')}m`;

    const now = new Date();
    const etaDate = new Date(now.getTime() + hoursLeft * 3600 * 1000);
    const etaTime = etaDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const statusColor = 
      config.movementStatus === 'Moving' ? '#10B981' :
      config.movementStatus === 'Delayed' ? '#EF4444' :
      '#F59E0B';

    return {
      id: config.id,
      code: config.code,
      vehicleNo: config.vehicleNo,
      callsign: config.callsign,
      operator: config.operator,
      driverContact: config.driverContact,
      movementStatus: config.movementStatus,
      speedKmh: config.speedKmh,
      cargoCategory: config.cargoCategory,
      cargoManifest: config.cargoManifest,
      cargoWeightKg: config.cargoWeightKg,
      currentRoute: config.currentRoute,
      origin: config.origin,
      destination: config.destination,
      lat,
      lng,
      heading,
      progress,
      isHeadingEast,
      kmCompleted: progressKm,
      kmRemaining,
      totalKm: config.totalKm,
      etaString,
      etaTime,
      statusColor,
    };
  }

  public getAllTelemetries(): VehicleTelemetry[] {
    const elapsedMs = performance.now() - this.baseTimestamp;
    return FLEET_CONFIGS.map((cfg) => this.calculateVehicleTelemetry(cfg, elapsedMs));
  }

  public getTelemetry(vehicleId?: string): VehicleTelemetry {
    const targetId = vehicleId || this.primaryVehicleId;
    const all = this.getAllTelemetries();
    return all.find((v) => v.id === targetId) || all[0];
  }

  public subscribe(callback: (telemetries: VehicleTelemetry[], primary: VehicleTelemetry) => void): () => void {
    this.subscribers.add(callback);
    const all = this.getAllTelemetries();
    const primary = all.find((v) => v.id === this.primaryVehicleId) || all[0];
    callback(all, primary);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    const all = this.getAllTelemetries();
    const primary = all.find((v) => v.id === this.primaryVehicleId) || all[0];
    this.subscribers.forEach((cb) => {
      try {
        cb(all, primary);
      } catch (err) {
        console.error('Error in vehicle animation subscriber:', err);
      }
    });
  }

  private startMasterLoop() {
    const tick = () => {
      this.notifySubscribers();
      this.rafId = requestAnimationFrame(tick);
    };

    if (typeof window !== 'undefined') {
      this.rafId = requestAnimationFrame(tick);
    }
  }

  public destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.subscribers.clear();
  }
}

export const vehicleAnimationService = new VehicleAnimationService();

