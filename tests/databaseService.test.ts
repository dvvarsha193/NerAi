import { describe, it, expect } from 'vitest';
import { dbService } from '../server/db/databaseService';

describe('Logistics Database Service & 8 Pillars Engine', () => {
  it('should initialize with all 8 Northeast state regional base depots', () => {
    const data = dbService.getCommandCenterData();
    expect(data.depots.length).toBeGreaterThanOrEqual(4);
    expect(data.healthCenters.length).toBeGreaterThanOrEqual(5);
    expect(data.roadConditions.length).toBeGreaterThanOrEqual(4);
  });

  it('should compute stockout radar remaining days correctly', () => {
    const radar = dbService.getStockoutRadar();
    expect(radar.totalMonitoredCenters).toBeGreaterThan(0);
    expect(Array.isArray(radar.activeAlerts)).toBe(true);

    // Critical centers like Tawang must have oxygen alerts
    const tawangAlert = radar.activeAlerts.find(
      (a: any) => a.centerId === 'HC-TAW-01' && a.category === 'OXYGEN'
    );
    expect(tawangAlert).toBeDefined();
    expect(tawangAlert.remainingStockDays).toBeLessThanOrEqual(5);
  });

  it('should simulate disaster disruptions and calculate ripple effect', () => {
    const disruption = dbService.simulateDisruption({
      hazardType: 'LANDSLIDE',
      location: 'Sela Pass Ascent Sector KM 414.2',
      district: 'Tawang',
      highwayCode: 'NH-13',
    });

    expect(disruption.simulationId).toBeDefined();
    expect(disruption.epicenter).toContain('Sela Pass');
    expect(disruption.directlyIsolatedHealthCenters.length).toBeGreaterThan(0);
    expect(disruption.recommendedBypassRoute).toBeDefined();
  });

  it('should run multi-criteria intelligent supply allocation engine', () => {
    const allocation = dbService.runIntelligentAllocation('HC-TAW-01');
    expect(allocation.destination).toBeDefined();
    expect(allocation.recommendedAllocation).toBeDefined();
    expect(allocation.recommendedAllocation.depotName).toBeDefined();
    expect(allocation.metrics.deliveryDelayHours.improvementPercent).toBeGreaterThan(50);
    expect(allocation.metrics.stockoutRiskPercent.improvementPercent).toBeGreaterThan(80);
  });

  it('should record and persist field incident reports', () => {
    const newReport = dbService.createFieldIncident({
      locationName: 'Dirang Chu River Basin KM 298',
      district: 'West Kameng',
      hazardType: 'Flash Flood Debris',
      damageSeverity: 'SEVERE',
      affectedCorridor: 'NH-13 West Kameng Arterial',
      notes: 'Road embankment eroded by torrential floodwaters.',
      reporterName: 'Inspector Tenzing (BRO)',
    });

    expect(newReport.incidentId).toBeDefined();
    expect(newReport.hazardType).toBe('Flash Flood Debris');

    const incidents = dbService.getFieldIncidents();
    const found = incidents.find((i: any) => i.incidentId === newReport.incidentId);
    expect(found).toBeDefined();
  });
});
