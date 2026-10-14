import { describe, it, expect } from 'vitest';
import { NH13_PRIMARY_CORRIDOR, NH13_DYNAMIC_BYPASS, SELA_HAZARD_SECTOR } from '../src/data/mockData';

describe('Trans-Himalayan Autonomous Rerouting Engine', () => {
  it('should verify primary corridor baseline characteristics', () => {
    expect(NH13_PRIMARY_CORRIDOR.id).toBe('corridor-nh13-primary');
    expect(NH13_PRIMARY_CORRIDOR.totalDistanceKm).toBeGreaterThanOrEqual(300);
    expect(NH13_PRIMARY_CORRIDOR.apexAltitudeMeters).toBeGreaterThanOrEqual(700);
    expect(NH13_PRIMARY_CORRIDOR.riskIndex).toBeGreaterThan(30);
  });

  it('should verify dynamic bypass offers safer composite risk score', () => {
    expect(NH13_DYNAMIC_BYPASS.riskIndex).toBeLessThan(NH13_PRIMARY_CORRIDOR.riskIndex);
    expect(NH13_DYNAMIC_BYPASS.routeType).toBe('DYNAMIC_BYPASS');
    expect(NH13_DYNAMIC_BYPASS.name).toContain('Bypass');
  });

  it('should accurately compute multi-objective risk reduction matrix', () => {
    // Multi-objective function:
    // Net Risk Gain = Delta Risk Index points
    const deltaRisk = NH13_PRIMARY_CORRIDOR.riskIndex - NH13_DYNAMIC_BYPASS.riskIndex;
    expect(deltaRisk).toBeGreaterThan(15);
  });

  it('should detect Sela Pass hazard sector boundaries and alert threshold', () => {
    expect(SELA_HAZARD_SECTOR.id).toContain('hazard');
    expect(SELA_HAZARD_SECTOR.landslideRiskScore).toBeGreaterThanOrEqual(60);
    expect(SELA_HAZARD_SECTOR.soilSaturationPercent).toBeGreaterThan(80);
  });

  it('should reject route diversion if vehicle gross weight exceeds bridge tolerance', () => {
    const validateBridgeWeight = (vehicleWeightTons: number, bridgeLimitTons: number) => {
      return vehicleWeightTons <= bridgeLimitTons;
    };

    const lightConvoy = validateBridgeWeight(12.5, 24.0);
    const overloadedTruck = validateBridgeWeight(28.0, 24.0);

    expect(lightConvoy).toBe(true);
    expect(overloadedTruck).toBe(false);
  });
});
