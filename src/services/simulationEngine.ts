import { Convoy, SimulatedIncident } from '../types';

// Standard Shillong / Meghalaya Corridor Geometries
export const SHILLONG_AFFECTED_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.0600, 91.8100], // Khanapara
  [25.9800, 91.8600], // Jorabat
  [25.9000, 91.8800], // Nongpoh
  [25.8200, 91.8700], // Umsning
  [25.7400, 91.8600], // Hazard Zone (Mawkdok Sector)
  [25.6800, 91.8800], // Mawryngkneng Jct
  [25.6200, 91.8900], // Barapani / Umiam
  [25.5788, 91.8933], // Shillong
];

export const SHILLONG_RECOMMENDED_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.0600, 91.8100],
  [25.9800, 91.8600],
  [25.9000, 91.8800], // Nongpoh
  [25.8300, 91.7700], // Western ridge diversion
  [25.7300, 91.7200], // Ri-Bhoi bypass
  [25.6400, 91.7800], // Umroi Airport Link
  [25.5900, 91.8400], // Mawlai bypass
  [25.5788, 91.8933], // Shillong
];

export const SHILLONG_ALT2_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.1000, 92.0000], // Sonapur Link
  [25.9500, 92.0500], // Bhoirymbong eastern ridge
  [25.8000, 92.0800], // East Jaintia bypass
  [25.6700, 91.9900], // NEIGRIHMS access
  [25.5788, 91.8933], // Shillong
];

// Standard Assam / Arunachal Corridor Geometries
export const ARUNACHAL_AFFECTED_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.3450, 92.6840], // Nagaon
  [26.5400, 92.8500], // Kaliabor
  [26.6528, 92.7926], // Tezpur
  [26.8300, 92.7400], // Balipara
  [27.0125, 92.6508], // Bhalukpong / Hazard Zone
  [27.0500, 93.3000], // Hoj corridor
  [27.0844, 93.6053], // Itanagar
];

export const ARUNACHAL_RECOMMENDED_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.3450, 92.6840], // Nagaon
  [26.5400, 92.8500], // Kaliabor
  [26.6528, 92.7926], // Tezpur
  [26.7800, 93.1500], // Biswanath Chariali bypass
  [26.9800, 93.4500], // Gohpur elevated expressway
  [27.0844, 93.6053], // Itanagar
];

export const ARUNACHAL_ALT2_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.4000, 92.1500], // Mangaldai corridor
  [26.7500, 92.4000], // Orang link
  [26.9000, 92.6000], // Rowta foothills
  [27.0844, 93.6053], // Itanagar
];

export interface SimulationParams {
  vehicleId: string;
  incidentType: string;
  location: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  duration?: string;
  details?: string;
}

export function buildSimulatedIncident(
  params: SimulationParams,
  targetConvoy: Convoy
): SimulatedIncident {
  const {
    vehicleId,
    incidentType,
    location,
    severity,
    duration = '3 Hours',
    details = '',
  } = params;

  // Determine corridor type based on vehicle destination and location
  const isArunachal =
    location.toLowerCase().includes('sela') ||
    location.toLowerCase().includes('arunachal') ||
    location.toLowerCase().includes('tezpur') ||
    targetConvoy.destination.toLowerCase().includes('itanagar') ||
    targetConvoy.destination.toLowerCase().includes('tawang');

  // Coordinates resolution
  let hazardCoords: [number, number] = [25.7400, 91.8600];
  let blockCoords: [number, number] = [25.7800, 91.8700];
  let vehicleCoords: [number, number] = targetConvoy.currentPosition || [25.9300, 91.8600];
  let center: [number, number] = [25.86, 91.83];
  let bounds: [[number, number], [number, number]] = [
    [26.16, 91.68],
    [25.54, 92.00],
  ];
  let origin = { name: 'Guwahati', coordinates: [26.1445, 91.7362] as [number, number] };
  let destination = { name: 'Shillong', coordinates: [25.5788, 91.8933] as [number, number] };
  let currentRoute = SHILLONG_AFFECTED_ROUTE;
  let recommendedRoute = SHILLONG_RECOMMENDED_ROUTE;
  let alt2Route = SHILLONG_ALT2_ROUTE;

  if (isArunachal) {
    hazardCoords = [27.0125, 92.6508];
    blockCoords = [26.8300, 92.7400];
    center = [26.65, 92.79];
    bounds = [
      [27.15, 91.70],
      [26.10, 93.65],
    ];
    origin = { name: 'Guwahati', coordinates: [26.1445, 91.7362] };
    destination = { name: 'Itanagar', coordinates: [27.0844, 93.6053] };
    vehicleCoords = [26.6528, 92.7926];
    currentRoute = ARUNACHAL_AFFECTED_ROUTE;
    recommendedRoute = ARUNACHAL_RECOMMENDED_ROUTE;
    alt2Route = ARUNACHAL_ALT2_ROUTE;
  } else {
    // Check specific Meghalaya locations
    if (location.toLowerCase().includes('nongpoh')) {
      hazardCoords = [25.9000, 91.8800];
      blockCoords = [25.9100, 91.8800];
    } else if (location.toLowerCase().includes('jorabat')) {
      hazardCoords = [25.9800, 91.8600];
      blockCoords = [26.0000, 91.8500];
    }
  }

  // Base metrics by incident type
  let baseDelay = 80;
  let currentRisk = 87;
  let recRisk = 24;
  let alt2Risk = 32;
  let reasonSnippet = 'Active debris blocking carriageway.';
  let weatherRainfall = 'High';
  let roadCondition = 'Uncertain';

  switch (incidentType.toLowerCase()) {
    case 'landslide':
      baseDelay = 80;
      currentRisk = 88;
      recRisk = 22;
      reasonSnippet = 'Active rockfall and slope subsidence blocking carriageway.';
      weatherRainfall = 'High';
      roadCondition = 'Impassable';
      break;
    case 'flood':
      baseDelay = 95;
      currentRisk = 92;
      recRisk = 20;
      reasonSnippet = 'Flash runoff and river water logging submerged highway sector.';
      weatherRainfall = 'Extreme';
      roadCondition = 'Submerged';
      break;
    case 'heavy rainfall':
      baseDelay = 45;
      currentRisk = 76;
      recRisk = 26;
      reasonSnippet = 'Cloudburst and near-zero visibility causing hydroplaning danger.';
      weatherRainfall = 'Severe';
      roadCondition = 'Slippery';
      break;
    case 'traffic congestion':
      baseDelay = 40;
      currentRisk = 62;
      recRisk = 18;
      reasonSnippet = 'High density freight bottleneck creating severe gridlock.';
      weatherRainfall = 'Low';
      roadCondition = 'Standstill';
      break;
    case 'road blockage':
      baseDelay = 75;
      currentRisk = 84;
      recRisk = 22;
      reasonSnippet = 'Fallen debris and physical highway barrier blocking transit.';
      weatherRainfall = 'Moderate';
      roadCondition = 'Obstructed';
      break;
    case 'accident':
      baseDelay = 55;
      currentRisk = 78;
      recRisk = 25;
      reasonSnippet = 'Multi-vehicle collision and active emergency extraction ops.';
      weatherRainfall = 'Moderate';
      roadCondition = 'Blocked Lanes';
      break;
    case 'route closure':
      baseDelay = 120;
      currentRisk = 95;
      recRisk = 15;
      reasonSnippet = 'Official corridor closure issued by Disaster Management Authority.';
      weatherRainfall = 'Moderate';
      roadCondition = 'Closed';
      break;
    default:
      baseDelay = 60;
      currentRisk = 75;
      recRisk = 24;
      reasonSnippet = `${incidentType} disruption active on sector.`;
      break;
  }

  // Severity multiplier
  let sevMultiplier = 1.0;
  if (severity === 'Critical') {
    sevMultiplier = 1.25;
    currentRisk = Math.min(98, currentRisk + 8);
  } else if (severity === 'High') {
    sevMultiplier = 1.0;
  } else if (severity === 'Moderate') {
    sevMultiplier = 0.8;
    currentRisk = Math.max(50, currentRisk - 10);
  } else {
    sevMultiplier = 0.6;
    currentRisk = Math.max(40, currentRisk - 20);
  }

  const delayMinutes = Math.round(baseDelay * sevMultiplier);
  const addedDistanceKm = isArunachal ? 18 : 15;
  const alt2AddedDistanceKm = isArunachal ? 34 : 28;
  const addedTimeMin = Math.round(18 * sevMultiplier);
  const alt2AddedTimeMin = Math.round(33 * sevMultiplier);

  const currentDist = isArunachal ? 312 : 121;
  const recDist = currentDist + addedDistanceKm;
  const alt2Dist = currentDist + alt2AddedDistanceKm;

  const currentEtaMinutes = isArunachal ? 345 : 188;
  const recEtaMinutes = currentEtaMinutes + addedTimeMin;
  const alt2EtaMinutes = currentEtaMinutes + alt2AddedTimeMin;

  const formatMinToHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} h ${m.toString().padStart(2, '0')} min`;
  };

  const reason = details || `${incidentType} (${severity}) detected at ${location}. ${reasonSnippet} Expected duration: ${duration}. Rerouting via AI recommended bypass avoids hazard and secures schedule.`;

  return {
    id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
    vehicleId: targetConvoy.id,
    vehicleCallsign: targetConvoy.callsign,
    incidentType,
    severity,
    location,
    duration,
    details: reason,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'REROUTING_REQUIRED',
    affectedSection: {
      startKm: isArunachal ? 238 : 52,
      endKm: isArunachal ? 254 : 64,
      name: location,
      coordinates: hazardCoords,
    },
    metrics: {
      reason,
      delayMinutes,
      addedDistanceKm,
      etaDifference: `+${addedTimeMin} min (+${addedDistanceKm} km)`,
      currentRisk,
      recommendedRisk: recRisk,
      alt2Risk,
      currentDistanceKm: currentDist,
      recommendedDistanceKm: recDist,
      alt2DistanceKm: alt2Dist,
      currentEta: formatMinToHours(currentEtaMinutes),
      recommendedEta: formatMinToHours(recEtaMinutes),
      alt2Eta: formatMinToHours(alt2EtaMinutes),
      riskReductionPts: currentRisk - recRisk,
      trafficCurrent: 'Moderate',
      trafficRec: 'Light',
      trafficAlt2: 'Moderate',
      rainfallCurrent: weatherRainfall,
      rainfallRec: 'Low',
      rainfallAlt2: 'Low',
      roadConditionCurrent: roadCondition,
      roadConditionRec: 'Good',
      roadConditionAlt2: 'Moderate',
    },
    routes: {
      currentRoute,
      disruptedSegment: [
        hazardCoords,
        blockCoords,
      ],
      recommendedRoute,
      alt2Route,
      center,
      zoom: isArunachal ? 9 : 10,
      bounds,
      origin,
      destination,
      hazardCoords,
      blockCoords,
      vehicleCoords,
    },
  };
}
