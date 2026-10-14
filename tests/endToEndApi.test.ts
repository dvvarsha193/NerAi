import { describe, it, expect } from 'vitest';
import { db } from '../server/db/database';
import { dbService } from '../server/db/databaseService';

describe('End-to-End Operational Intelligence Pipeline', () => {
  it('should verify live convoys telemetry feed has valid positions and speeds', () => {
    const convoys = db.getConvoys();
    expect(convoys.length).toBeGreaterThanOrEqual(6);

    convoys.forEach((convoy) => {
      expect(convoy.id).toBeDefined();
      expect(convoy.callsign).toBeDefined();
      expect(convoy.speedKmh).toBeGreaterThanOrEqual(0);
      expect(convoy.fuelPercent).toBeGreaterThan(0);
      expect(convoy.currentPosition.length).toBe(2);
    });
  });

  it('should verify tactical alerts feed has active unacknowledged incidents', () => {
    const alerts = db.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);

    const highSeverityAlert = alerts.find((a) => a.level === 'CRITICAL' || a.level === 'HIGH' || a.severity === 'CRITICAL');
    expect(highSeverityAlert).toBeDefined();
  });

  it('should verify database diagnostics reports provider and table statistics', () => {
    const status = dbService.getDatabaseStatus();
    expect(status.provider).toBeDefined();
    expect(status.isLocalPersistent).toBe(true);
    expect(status.dataCounts.depots).toBeGreaterThanOrEqual(4);
    expect(status.dataCounts.healthCenters).toBeGreaterThanOrEqual(5);
    expect(status.dataCounts.roadConditions).toBeGreaterThanOrEqual(4);
    expect(status.timestamp).toBeDefined();
  });
});
