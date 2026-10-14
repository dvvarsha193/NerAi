export type ConvoyStatus = 'ON-ROUTE' | 'DIVERTED' | 'HAZ-ALERT' | 'STATIONARY' | 'ARRIVED';

export type CargoCategory = 'CRYO-PHARMA' | 'CRYOGENIC-OXYGEN' | 'EMERGENCY-RATIONS' | 'ARCTIC-FUEL' | 'BRIDGE-INFRASTRUCTURE' | 'TACTICAL-COMMS';

export interface CorridorWaypoint {
  id: string;
  name: string;
  code: string;
  kmMark: number;
  altitudeMeters: number;
  coordinates: [number, number];
  sectorType: 'BASE_DEPOT' | 'CHECKPOINT' | 'MOUNTAIN_PASS' | 'HAZARD_SECTOR' | 'BYPASS_INTERCHANGE' | 'DESTINATION';
  slopeDeg: number;
  facilities?: string[];
  notes?: string;
}

export interface Convoy {
  id: string;
  callsign: string;
  operator: string;
  radioFrequency: string;
  vehicleClass: string;
  grossWeightKg: number;
  cargoCategory: CargoCategory;
  cargoManifest: string;
  origin: string;
  destination: string;
  status: ConvoyStatus;
  currentPosition: [number, number];
  coordinates?: [number, number]; // Alias for compatibility
  headingDeg: number;
  speedKmh: number;
  altitudeMeters: number;
  fuelPercent: number;
  cargoTempCelsius?: number;
  oxygenPressurePsi?: number;
  routeId: string;
  currentKm: number;
  distanceToHazardKm: number;
  eta: string;
  progressPercent: number;
  lastSatelliteTick: string;
  vehicleNo?: string;
  driverContact?: string;
  movementStatus?: 'Moving' | 'Stopped' | 'Idle' | 'Delayed';
  currentRoute?: string;
  startLocation?: string;
  distanceRemainingKm?: number;
  distanceCompletedKm?: number;
  estimatedTravelTime?: string;
}

export interface HighwayCorridor {
  id: string;
  name: string;
  highwayCode: string;
  totalDistanceKm: number;
  apexAltitudeMeters: number;
  routeType: 'PRIMARY_CORRIDOR' | 'HAZARD_SECTOR' | 'DYNAMIC_BYPASS';
  waypoints: [number, number][];
  surveyedPoints: CorridorWaypoint[];
  riskIndex: number;
  color: string;
  description: string;
}

export interface HazardSectorData {
  id: string;
  name: string;
  corridor: string;
  kmStart: number;
  kmEnd: number;
  apexAltitudeMeters: number;
  center: [number, number];
  polygon: [number, number][];
  landslideRiskScore: number;
  insarSubsidenceMmPerHour: number;
  insarDisplacementMmHr?: number;
  dopplerRainfallMmPerHour: number;
  rainfallMmHr?: number;
  soilSaturationPercent: number;
  slopeAngleDeg: number;
  affectedConvoysCount: number;
  status: 'ACTIVE_WARNING' | 'IMPASSABLE' | 'MITIGATING';
  recommendedAction: string;
  description?: string;
  lastTelemetryTick: string;
}

export interface TacticalAlert {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'NOMINAL';
  code: string;
  title: string;
  details: string;
  sector: string;
  convoyId?: string;
  acknowledged: boolean;
}

export interface FieldIncidentEntry {
  id: string;
  timestamp: string;
  hazardType: 'DEBRIS_FLOW' | 'ROCKFALL' | 'SUBSIDENCE' | 'BRIDGE_DAMAGE' | 'TORRENTIAL_WASH';
  highwayMilestone: string;
  coordinates: [number, number];
  clearingTimeHoursEst: number;
  passability: 'CLOSED' | 'CONVOY_ESCORT_ONLY' | 'SINGLE_LANE_CAUTION';
  reportedBy: string;
  tacticalNotes: string;
  synced: boolean;
  syncTimestamp?: string;
}

export type TacticalScreen = 'vehicle_gis' | 'reroute_console' | 'route_info' | 'ner_ai' | 'field_terminal';

export interface SimulationHistoryEntry {
  id: string;
  vehicleId: string;
  incidentType: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  location: string;
  duration?: string;
  details: string;
  timestamp: string;
  status: 'PROPAGATED' | 'REROUTED' | 'REJECTED' | 'RESET';
}

export interface SimulatedIncident {
  id: string;
  vehicleId: string;
  vehicleCallsign: string;
  incidentType: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  location: string;
  duration: string;
  details: string;
  timestamp: string;
  status: 'REROUTING_REQUIRED' | 'REROUTED' | 'REJECTED';
  affectedSection: {
    startKm: number;
    endKm: number;
    name: string;
    coordinates: [number, number];
  };
  metrics: {
    reason: string;
    delayMinutes: number;
    addedDistanceKm: number;
    etaDifference: string;
    currentRisk: number;
    recommendedRisk: number;
    alt2Risk: number;
    currentDistanceKm: number;
    recommendedDistanceKm: number;
    alt2DistanceKm: number;
    currentEta: string;
    recommendedEta: string;
    alt2Eta: string;
    riskReductionPts: number;
    trafficCurrent: string;
    trafficRec: string;
    trafficAlt2: string;
    rainfallCurrent: string;
    rainfallRec: string;
    rainfallAlt2: string;
    roadConditionCurrent: string;
    roadConditionRec: string;
    roadConditionAlt2: string;
  };
  routes: {
    currentRoute: [number, number][];
    disruptedSegment: [number, number][];
    recommendedRoute: [number, number][];
    alt2Route: [number, number][];
    center: [number, number];
    zoom: number;
    bounds: [[number, number], [number, number]];
    origin: { name: string; coordinates: [number, number] };
    destination: { name: string; coordinates: [number, number] };
    hazardCoords: [number, number];
    blockCoords: [number, number];
    vehicleCoords: [number, number];
  };
}
