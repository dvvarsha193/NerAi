import mongoose, { Schema, Document } from 'mongoose';

// ============================================================================
// 1. DEPOT & INVENTORY MODEL
// ============================================================================
export interface InventoryItem {
  id: string;
  name: string;
  category: 'MEDICINE' | 'OXYGEN' | 'VACCINE' | 'FOOD_RATION' | 'FUEL';
  quantity: number;
  unit: string;
  dailyBurnRate: number;
  remainingStockDays: number;
  criticalThresholdDays: number;
  status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
}

export interface DepotDocument extends Document {
  depotId: string;
  name: string;
  state: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  totalCapacityTons: number;
  currentUtilizationPercent: number;
  inventory: InventoryItem[];
  assignedVehiclesCount: number;
  accessibilityStatus: 'OPEN' | 'RESTRICTED' | 'ISOLATED';
}

export const DepotSchema = new Schema<DepotDocument>({
  depotId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  coordinates: { type: [Number], required: true },
  elevationMeters: { type: Number, required: true },
  totalCapacityTons: { type: Number, required: true },
  currentUtilizationPercent: { type: Number, required: true },
  inventory: [
    {
      id: String,
      name: String,
      category: String,
      quantity: Number,
      unit: String,
      dailyBurnRate: Number,
      remainingStockDays: Number,
      criticalThresholdDays: Number,
      status: String,
    },
  ],
  assignedVehiclesCount: { type: Number, default: 4 },
  accessibilityStatus: { type: String, default: 'OPEN' },
});

// ============================================================================
// 2. REMOTE HEALTH CENTER / DESTINATION MODEL
// ============================================================================
export interface HealthCenterDocument extends Document {
  centerId: string;
  name: string;
  district: string;
  state: string;
  coordinates: [number, number];
  elevationMeters: number;
  populationServed: number;
  primaryCorridor: string;
  inventory: InventoryItem[];
  stockoutRiskLevel: 'NONE' | 'ELEVATED' | 'CRITICAL';
  criticalSupplyNeeded: string;
}

export const HealthCenterSchema = new Schema<HealthCenterDocument>({
  centerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  coordinates: { type: [Number], required: true },
  elevationMeters: { type: Number, required: true },
  populationServed: { type: Number, required: true },
  primaryCorridor: { type: String, required: true },
  inventory: [
    {
      id: String,
      name: String,
      category: String,
      quantity: Number,
      unit: String,
      dailyBurnRate: Number,
      remainingStockDays: Number,
      criticalThresholdDays: Number,
      status: String,
    },
  ],
  stockoutRiskLevel: { type: String, default: 'NONE' },
  criticalSupplyNeeded: { type: String, default: 'None' },
});

// ============================================================================
// 3. ROAD CONDITIONS & ACCESSIBILITY MODEL
// ============================================================================
export interface RoadConditionDocument extends Document {
  highwayCode: string;
  corridorName: string;
  state: string;
  district: string;
  kilometerMark: string;
  coordinates: [number, number];
  accessibilityStatus: 'PASSABLE' | 'CAUTION' | 'BLOCKED';
  hazardType?: 'LANDSLIDE' | 'FLOOD' | 'BRIDGE_COLLAPSE' | 'SNOW_BLOCK' | 'ROCKFALL' | 'NONE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedClearanceHours: number;
  lastUpdated: string;
  reportedBy: string;
}

export const RoadConditionSchema = new Schema<RoadConditionDocument>({
  highwayCode: { type: String, required: true },
  corridorName: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  kilometerMark: { type: String, required: true },
  coordinates: { type: [Number], required: true },
  accessibilityStatus: { type: String, required: true },
  hazardType: { type: String, default: 'NONE' },
  severity: { type: String, default: 'LOW' },
  estimatedClearanceHours: { type: Number, default: 0 },
  lastUpdated: { type: String, required: true },
  reportedBy: { type: String, default: 'BRO Patrol Unit' },
});

// ============================================================================
// 4. FIELD INCIDENT WITH DAMAGE PHOTO
// ============================================================================
export interface FieldIncidentDocument extends Document {
  incidentId: string;
  photoUrl?: string;
  locationName: string;
  district: string;
  state: string;
  coordinates: [number, number];
  hazardType: string;
  damageSeverity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'IMPASSABLE';
  affectedCorridor: string;
  notes: string;
  humanVerified: boolean;
  verifiedBy?: string;
  timestamp: string;
}

export const FieldIncidentSchema = new Schema<FieldIncidentDocument>({
  incidentId: { type: String, required: true, unique: true },
  photoUrl: { type: String },
  locationName: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  coordinates: { type: [Number], required: true },
  hazardType: { type: String, required: true },
  damageSeverity: { type: String, required: true },
  affectedCorridor: { type: String, required: true },
  notes: { type: String, required: true },
  humanVerified: { type: Boolean, default: false },
  verifiedBy: { type: String },
  timestamp: { type: String, required: true },
});

// Export Mongoose Models safely
export const DepotModel =
  mongoose.models.Depot || mongoose.model<DepotDocument>('Depot', DepotSchema);
export const HealthCenterModel =
  mongoose.models.HealthCenter || mongoose.model<HealthCenterDocument>('HealthCenter', HealthCenterSchema);
export const RoadConditionModel =
  mongoose.models.RoadCondition || mongoose.model<RoadConditionDocument>('RoadCondition', RoadConditionSchema);
export const FieldIncidentModel =
  mongoose.models.FieldIncident || mongoose.model<FieldIncidentDocument>('FieldIncident', FieldIncidentSchema);
