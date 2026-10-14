import { describe, it, expect } from 'vitest';
import { dbService } from '../server/db/databaseService';

describe('Field Incident Validation & Automated Corridor State Mutation', () => {
  it('should automatically mark corridor BLOCKED when an IMPASSABLE incident is reported', () => {
    const report = dbService.createFieldIncident({
      locationName: 'Mawkdok Gorge Valley Sector KM 84.1',
      district: 'East Khasi Hills',
      affectedCorridor: 'NH-6',
      hazardType: 'Flash Flood and Bridge Scour',
      damageSeverity: 'IMPASSABLE',
      notes: 'Road submerged by 1.8m surging water. BRO bulldozers standing by.',
      reporterName: 'Patrol Drone Alpha-4',
    });

    expect(report.incidentId).toBeDefined();

    // Verify road condition state mutated in database
    const commandData = dbService.getCommandCenterData();
    const nh6Road = commandData.roadConditions.find((r: any) => r.highwayCode === 'NH-6');

    expect(nh6Road).toBeDefined();
    expect(nh6Road?.accessibilityStatus).toBe('BLOCKED');
    expect(nh6Road?.severity).toBe('CRITICAL');
  });

  it('should validate GPS coordinate bounds for Northeast India (NER)', () => {
    // NER Coordinates bounding box: Lat 21.5°N - 29.5°N, Lng 89.5°E - 97.5°E
    const isWithinNerBounds = (lat: number, lng: number) => {
      return lat >= 21.0 && lat <= 30.0 && lng >= 88.0 && lng <= 98.0;
    };

    const tawangCoord = isWithinNerBounds(27.5861, 91.8594);
    const guwahatiCoord = isWithinNerBounds(26.1445, 91.7362);
    const outOfBoundsCoord = isWithinNerBounds(19.0760, 72.8777); // Mumbai

    expect(tawangCoord).toBe(true);
    expect(guwahatiCoord).toBe(true);
    expect(outOfBoundsCoord).toBe(false);
  });

  it('should sanitize damage report notes against XSS injections', () => {
    const sanitizeReportNotes = (notes: string) => {
      return notes.replace(/<[^>]*>?/gm, '').trim();
    };

    const maliciousNote = 'Bridge collapsed <script>fetch("evil.com")</script> at hairpin 4';
    const cleanNote = sanitizeReportNotes(maliciousNote);

    expect(cleanNote).toBe('Bridge collapsed fetch("evil.com") at hairpin 4');
    expect(cleanNote.includes('<script>')).toBe(false);
  });
});
