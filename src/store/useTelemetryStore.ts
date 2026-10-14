import { create } from 'zustand';
import { Convoy, HighwayCorridor, HazardSectorData, TacticalAlert, TacticalScreen, SimulatedIncident, SimulationHistoryEntry } from '../types';
import { CONVOYS, NH13_PRIMARY_CORRIDOR, NH13_DYNAMIC_BYPASS, SELA_HAZARD_SECTOR, TACTICAL_ALERTS } from '../data/mockData';
import { soundEffects } from '../services/soundEffects';
import { fetchConvoysApi, fetchAlertsApi, addConvoyApi, rerouteConvoyApi, acknowledgeAlertApi, injectSimulationApi } from '../services/api';
import { buildSimulatedIncident, SimulationParams } from '../services/simulationEngine';

interface TacticalTelemetryState {
  activeScreen: TacticalScreen;
  convoys: Convoy[];
  primaryCorridor: HighwayCorridor;
  bypassCorridor: HighwayCorridor;
  hazardSector: HazardSectorData;
  alerts: TacticalAlert[];

  selectedConvoyId: string | null;
  isHazardInspectorOpen: boolean;
  isThreatOverlayActive: boolean;
  isSoundActive: boolean;
  searchFilter: string;

  // Real-life interactive features
  isGmapsFollowMode: boolean;
  activeMapStyle: 'topographic' | 'dark' | 'satellite';
  isRainfallEventActive: boolean;
  isLandslideEventActive: boolean;
  isAddVehicleModalOpen: boolean;
  isAddRouteModalOpen: boolean;
  isFullGisExpanded: boolean;
  activeFleetTab: 'fleet' | 'map' | 'alerts' | 'completed';
  isIndividualVehicleView: boolean;
  simSpeed: number;
  vehicleProgress: number;

  // Real-time synchronization methods
  fetchInitialData: () => Promise<void>;
  syncConvoysFromServer: (convoys: Convoy[]) => void;
  syncAlertsFromServer: (alerts: TacticalAlert[]) => void;
  applyRerouteFromServer: (convoy: Convoy) => void;
  applyNewConvoyFromServer: (convoy: Convoy) => void;
  acknowledgeAlertLocally: (alertId: string) => void;

  // Simulation & Reroute Integration
  activeSimulatedIncident: SimulatedIncident | null;
  simulationHistory: SimulationHistoryEntry[];
  setActiveSimulatedIncident: (incident: SimulatedIncident | null) => void;
  runSimulation: (params: SimulationParams) => Promise<void>;
  approveSimulationReroute: (options?: { routeOption?: 'recommended' | 'alt2' }) => Promise<void>;
  rejectSimulationReroute: () => Promise<void>;
  resetSimulation: () => Promise<void>;

  setActiveScreen: (screen: TacticalScreen) => void;
  setActiveFleetTab: (tab: 'fleet' | 'map' | 'alerts' | 'completed') => void;
  setSelectedConvoyId: (id: string | null) => void;
  setIsIndividualVehicleView: (val: boolean) => void;
  navigateToIndividualVehicle: (convoyId?: string) => void;
  navigateToFleetView: () => void;
  navigateToAlertsView: () => void;
  setIsHazardInspectorOpen: (open: boolean) => void;
  toggleThreatOverlay: () => void;
  toggleSound: () => void;
  setSearchFilter: (query: string) => void;

  toggleGmapsFollowMode: () => void;
  setActiveMapStyle: (style: 'topographic' | 'dark' | 'satellite') => void;
  toggleRainfallEvent: () => void;
  toggleLandslideEvent: () => void;
  setIsAddVehicleModalOpen: (open: boolean) => void;
  setIsAddRouteModalOpen: (open: boolean) => void;
  setIsFullGisExpanded: (expanded: boolean) => void;
  setSimSpeed: (speed: number) => void;
  setVehicleProgress: (progress: number) => void;

  tickTelemetry: () => void;
  divertConvoy: (convoyId: string, options?: { reason?: string; approvedBy?: string; newEta?: string }) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  addConvoy: (convoy: Omit<Convoy, 'id'> & { id?: string }) => Promise<void>;
  addRoute: (route: HighwayCorridor) => void;
}

let telemetryChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    telemetryChannel = new BroadcastChannel('nerlogix_telemetry_channel');
  } catch {
    // Channel unsupported
  }
}

const INITIAL_SIMULATED_INCIDENT: SimulatedIncident = buildSimulatedIncident(
  {
    vehicleId: 'NER-TRK-01',
    incidentType: 'Landslide',
    location: 'NH-6 Near Mawkdok, Meghalaya',
    severity: 'Critical',
    duration: '3 Hours',
    details: '140 m³ metamorphic rockfall blocking primary carriageway.',
  },
  CONVOYS[0]
);

const INITIAL_SIMULATION_HISTORY: SimulationHistoryEntry[] = [
  {
    id: 'SIM-902',
    vehicleId: 'NER-TRK-01',
    incidentType: 'Landslide',
    severity: 'Critical',
    location: 'NH-6 Near Mawkdok, Meghalaya',
    duration: '3 Hours',
    details: 'Active rockfall detected by ISRO InSAR sensor.',
    timestamp: 'Today, 10:24 AM',
    status: 'PROPAGATED',
  },
  {
    id: 'SIM-891',
    vehicleId: 'convoy-04',
    incidentType: 'Heavy Rain',
    severity: 'High',
    location: 'Sela Pass Corridor, Arunachal Pradesh',
    duration: '1.5 Hours',
    details: '78.5 mm/hr cloudburst causing low visibility.',
    timestamp: 'Today, 08:15 AM',
    status: 'REROUTED',
  },
  {
    id: 'SIM-844',
    vehicleId: 'convoy-02',
    incidentType: 'Road Closure',
    severity: 'Moderate',
    location: 'Jorabat Interchange, Assam',
    duration: '6 Hours',
    details: 'Culvert maintenance diverting heavy freight.',
    timestamp: 'Yesterday, 04:30 PM',
    status: 'REROUTED',
  },
];

export const useTelemetryStore = create<TacticalTelemetryState>((set, get) => ({
  activeScreen: 'vehicle_gis',
  activeFleetTab: 'fleet',
  convoys: CONVOYS,
  primaryCorridor: NH13_PRIMARY_CORRIDOR,
  bypassCorridor: NH13_DYNAMIC_BYPASS,
  hazardSector: SELA_HAZARD_SECTOR,
  alerts: TACTICAL_ALERTS,

  activeSimulatedIncident: INITIAL_SIMULATED_INCIDENT,
  simulationHistory: INITIAL_SIMULATION_HISTORY,

  selectedConvoyId: 'NER-TRK-01',
  isIndividualVehicleView: false,
  isHazardInspectorOpen: false,
  isThreatOverlayActive: true,
  isSoundActive: true,
  searchFilter: '',

  isGmapsFollowMode: false,
  activeMapStyle: 'topographic',
  isRainfallEventActive: true,
  isLandslideEventActive: true,
  isAddVehicleModalOpen: false,
  isAddRouteModalOpen: false,
  isFullGisExpanded: false,
  simSpeed: 1,
  vehicleProgress: 0.68,

  // Fetch initial data from backend persistent database
  fetchInitialData: async () => {
    try {
      const [serverConvoys, serverAlerts] = await Promise.all([
        fetchConvoysApi(),
        fetchAlertsApi(),
      ]);

      if (serverConvoys && serverConvoys.length > 0) {
        set({ convoys: serverConvoys });
      }
      if (serverAlerts && serverAlerts.length > 0) {
        set({ alerts: serverAlerts });
      }
    } catch {
      // Fallback
    }
  },

  syncConvoysFromServer: (convoys) => {
    set({ convoys });
  },

  syncAlertsFromServer: (alerts) => {
    set({ alerts });
  },

  applyRerouteFromServer: (updatedConvoy) => {
    set((state) => ({
      convoys: state.convoys.map((c) => (c.id === updatedConvoy.id ? updatedConvoy : c)),
    }));
  },

  applyNewConvoyFromServer: (newConvoy) => {
    set((state) => {
      const exists = state.convoys.some((c) => c.id === newConvoy.id);
      if (exists) {
        return {
          convoys: state.convoys.map((c) => (c.id === newConvoy.id ? newConvoy : c)),
        };
      }
      return {
        convoys: [...state.convoys, newConvoy],
      };
    });
  },

  acknowledgeAlertLocally: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    }));
  },

  setActiveScreen: (screen) => {
    soundEffects.playClick();
    if (screen === 'vehicle_gis') {
      set({ activeScreen: screen, isIndividualVehicleView: false });
    } else {
      set({ activeScreen: screen });
    }
  },

  setActiveFleetTab: (tab) => {
    soundEffects.playClick();
    set({ activeFleetTab: tab });
  },

  setIsIndividualVehicleView: (val) => {
    set({ isIndividualVehicleView: val });
  },

  navigateToIndividualVehicle: (convoyId) => {
    soundEffects.playRadarPing();
    set((s) => ({
      activeScreen: 'vehicle_gis',
      isIndividualVehicleView: true,
      selectedConvoyId: convoyId || s.selectedConvoyId || 'convoy-trk-042',
    }));
  },

  navigateToFleetView: () => {
    soundEffects.playClick();
    set({
      activeScreen: 'vehicle_gis',
      isIndividualVehicleView: false,
      activeFleetTab: 'fleet',
    });
  },

  navigateToAlertsView: () => {
    soundEffects.playAlertChime();
    set({
      activeScreen: 'vehicle_gis',
      isIndividualVehicleView: false,
      activeFleetTab: 'alerts',
    });
  },

  setVehicleProgress: (progress) => {
    set({ vehicleProgress: progress });
  },

  setSelectedConvoyId: (id) => {
    if (id) soundEffects.playRadarPing();
    set({ selectedConvoyId: id });
  },

  setIsHazardInspectorOpen: (open) => {
    if (open) soundEffects.playAlertChime();
    set({ isHazardInspectorOpen: open });
  },

  toggleThreatOverlay: () => set((s) => ({ isThreatOverlayActive: !s.isThreatOverlayActive })),
  toggleSound: () => {
    const nextVal = !get().isSoundActive;
    soundEffects.setEnabled(nextVal);
    set({ isSoundActive: nextVal });
  },
  setSearchFilter: (query) => set({ searchFilter: query }),

  toggleGmapsFollowMode: () => {
    soundEffects.playClick();
    set((s) => ({ isGmapsFollowMode: !s.isGmapsFollowMode }));
  },

  setActiveMapStyle: (style) => {
    soundEffects.playClick();
    set({ activeMapStyle: style });
  },

  toggleRainfallEvent: () => {
    soundEffects.playClick();
    set((s) => ({ isRainfallEventActive: !s.isRainfallEventActive }));
  },

  toggleLandslideEvent: () => {
    soundEffects.playAlertChime();
    set((s) => ({ isLandslideEventActive: !s.isLandslideEventActive }));
  },

  setIsAddVehicleModalOpen: (open) => set({ isAddVehicleModalOpen: open }),
  setIsAddRouteModalOpen: (open) => set({ isAddRouteModalOpen: open }),
  setIsFullGisExpanded: (expanded) => set({ isFullGisExpanded: expanded }),
  setSimSpeed: (speed) => set({ simSpeed: speed }),

  tickTelemetry: () => {
    const currentConvoys = get().convoys;
    const primaryRoute = get().primaryCorridor;
    const speedMult = get().simSpeed || 1;

    const updated = currentConvoys.map((convoy) => {
      const waypoints = primaryRoute.waypoints;
      const totalKm = primaryRoute.totalDistanceKm || 312;

      // Advance 1 waypoint (~8 km) every 12 seconds (~1.33 km per 2s tick)
      const deltaKm = (totalKm / (39 * 6)) * speedMult;
      let newKm = (convoy.currentKm || 212) + deltaKm;

      if (newKm >= totalKm) {
        newKm = 5;
      }

      const newProgress = Math.min(100, Number(((newKm / totalKm) * 100).toFixed(0)));

      // Interpolate coordinates along route
      const totalSegments = waypoints.length - 1;
      const progressRatio = newKm / totalKm;
      const segmentIndex = Math.min(Math.floor(progressRatio * totalSegments), totalSegments - 1);
      const segFraction = (progressRatio * totalSegments) - segmentIndex;

      const p1 = waypoints[segmentIndex];
      const p2 = waypoints[segmentIndex + 1] || p1;

      const newLat = p1[0] + (p2[0] - p1[0]) * segFraction;
      const newLng = p1[1] + (p2[1] - p1[1]) * segFraction;

      // Calculate heading angle
      const dLat = p2[0] - p1[0];
      const dLng = p2[1] - p1[1];
      const headingRad = Math.atan2(dLng, dLat);
      const headingDeg = Math.round((headingRad * 180) / Math.PI);

      const distDone = Math.round(newKm);
      const distLeft = Math.max(0, Math.round(totalKm - newKm));
      const hoursRemaining = distLeft / Math.max(20, convoy.speedKmh || 45);
      const hrs = Math.floor(hoursRemaining);
      const mins = Math.round((hoursRemaining - hrs) * 60);
      const estTravel = `${hrs}h ${mins}m`;

      return {
        ...convoy,
        currentKm: Number(newKm.toFixed(1)),
        distanceCompletedKm: distDone,
        distanceRemainingKm: distLeft,
        estimatedTravelTime: estTravel,
        progressPercent: newProgress,
        currentPosition: [Number(newLat.toFixed(5)), Number(newLng.toFixed(5))] as [number, number],
        headingDeg: headingDeg >= 0 ? headingDeg : 360 + headingDeg,
        altitudeMeters: Math.round(55 + (newProgress * 7)),
        distanceToHazardKm: convoy.status === 'DIVERTED' ? 0 : Math.max(0, Math.round(242 - newKm)),
        lastSatelliteTick: 'Live Real-time Telematics',
      };
    });

    set({ convoys: updated });
  },

  divertConvoy: async (convoyId, options) => {
    soundEffects.playRerouteCalculated();
    const bypassId = get().bypassCorridor.id;

    // 1. Optimistic local update
    const updated = get().convoys.map((c) => {
      if (c.id === convoyId || c.callsign.includes(convoyId)) {
        return {
          ...c,
          routeId: bypassId,
          status: 'DIVERTED' as const,
          distanceToHazardKm: 0,
          eta: options?.newEta || '3h 26m IST',
        };
      }
      return c;
    });
    set({ convoys: updated });

    // 2. Call backend persistent API
    try {
      await rerouteConvoyApi(convoyId, {
        bypassRouteId: bypassId,
        reason: options?.reason,
        approvedBy: options?.approvedBy,
        newEta: options?.newEta,
      });
    } catch (err) {
      console.warn('[TelemetryStore] Reroute API call failed, kept optimistic state:', err);
    }
  },

  acknowledgeAlert: async (alertId) => {
    soundEffects.playClick();
    const updated = get().alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
    set({ alerts: updated });

    try {
      await acknowledgeAlertApi(alertId);
    } catch {
      // Ignore
    }
  },

  addConvoy: async (convoyData) => {
    soundEffects.playSyncSuccess();
    const tempId = `convoy-${Date.now()}`;
    const newConvoy: Convoy = {
      ...convoyData,
      id: convoyData.id || tempId,
    };

    // 1. Optimistic update
    set((s) => ({
      convoys: [...s.convoys, newConvoy],
      selectedConvoyId: newConvoy.id,
    }));

    // 2. Persist to backend
    try {
      const created = await addConvoyApi(convoyData);
      if (created && created.id) {
        set((s) => ({
          convoys: s.convoys.map((c) => (c.id === tempId ? created : c)),
          selectedConvoyId: created.id,
        }));
      }
    } catch (err) {
      console.warn('[TelemetryStore] Add vehicle API failed, kept local instance:', err);
    }
  },

  addRoute: (routeData) => {
    soundEffects.playRerouteCalculated();
    set({ bypassCorridor: routeData });
  },

  setActiveSimulatedIncident: (incident) => set({ activeSimulatedIncident: incident }),

  runSimulation: async (params) => {
    soundEffects.playAlertChime();
    const currentConvoys = get().convoys;
    const targetConvoy =
      currentConvoys.find((c) => c.id === params.vehicleId || c.callsign === params.vehicleId) ||
      currentConvoys[0];

    const simulated = buildSimulatedIncident(params, targetConvoy);

    // 1. Mark target convoy as affected / disrupted
    const updatedConvoys = currentConvoys.map((c) => {
      if (c.id === targetConvoy.id) {
        return {
          ...c,
          status: 'HAZ-ALERT' as const,
          movementStatus: 'Delayed' as const,
          distanceToHazardKm: 18,
          currentRoute: `${c.currentRoute || 'Primary Highway'} (${params.incidentType} Alert)`,
        };
      }
      return c;
    });

    const newHistoryEntry: SimulationHistoryEntry = {
      id: simulated.id,
      vehicleId: targetConvoy.callsign || targetConvoy.id,
      incidentType: params.incidentType,
      severity: params.severity,
      location: params.location,
      duration: params.duration || '3 Hours',
      details: simulated.details,
      timestamp: simulated.timestamp,
      status: 'PROPAGATED',
    };

    // 2. Add tactical alert
    const newAlert: TacticalAlert = {
      id: `alt-sim-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      level: params.severity === 'Critical' ? 'CRITICAL' : 'WARNING',
      code: 'ALT-SIM',
      title: `SIMULATION: ${params.incidentType} Disruption`,
      details: `${params.incidentType} (${params.severity}) active near ${params.location}. Convoy ${targetConvoy.callsign} requires reroute dispatch.`,
      sector: params.location,
      convoyId: targetConvoy.id,
      acknowledged: false,
    };

    set((s) => ({
      activeSimulatedIncident: simulated,
      selectedConvoyId: targetConvoy.id,
      convoys: updatedConvoys,
      simulationHistory: [newHistoryEntry, ...s.simulationHistory],
      alerts: [newAlert, ...s.alerts],
    }));

    // 3. Broadcast cross-tab
    telemetryChannel?.postMessage({
      type: 'SIMULATION_EVENT',
      action: 'RUN_SIMULATION',
      payload: {
        simulated,
        targetConvoyId: targetConvoy.id,
        historyEntry: newHistoryEntry,
      },
    });

    // 4. Send to backend if available
    try {
      await injectSimulationApi({
        vehicleId: targetConvoy.id,
        incidentType: params.incidentType,
        severity: params.severity,
        location: params.location,
        details: simulated.details,
      });
    } catch {
      // Offline fallback
    }
  },

  approveSimulationReroute: async (options) => {
    soundEffects.playRerouteCalculated();
    const incident = get().activeSimulatedIncident;
    const targetId = incident?.vehicleId || get().selectedConvoyId || 'NER-TRK-01';
    const routeOption = options?.routeOption || 'recommended';

    const updatedConvoys = get().convoys.map((c) => {
      if (c.id === targetId || c.callsign === targetId) {
        return {
          ...c,
          status: 'DIVERTED' as const,
          movementStatus: 'Moving' as const,
          distanceToHazardKm: 0,
          currentRoute: routeOption === 'alt2' ? 'Alternative 2 Bypass Corridor' : 'AI Recommended Dynamic Bypass',
          eta: incident ? (routeOption === 'alt2' ? incident.metrics.alt2Eta : incident.metrics.recommendedEta) : '3h 26m IST',
          estimatedTravelTime: incident ? (routeOption === 'alt2' ? incident.metrics.alt2Eta : incident.metrics.recommendedEta) : '3h 26m',
          lastSatelliteTick: 'Reroute Dispatched via Control Center',
        };
      }
      return c;
    });

    const updatedIncident = incident ? { ...incident, status: 'REROUTED' as const } : null;
    const updatedHistory = get().simulationHistory.map((h, i) =>
      i === 0 || (incident && h.id === incident.id) ? { ...h, status: 'REROUTED' as const } : h
    );

    set({
      convoys: updatedConvoys,
      activeSimulatedIncident: updatedIncident,
      simulationHistory: updatedHistory,
    });

    telemetryChannel?.postMessage({
      type: 'SIMULATION_EVENT',
      action: 'APPROVE_REROUTE',
      payload: { targetId, routeOption },
    });

    try {
      await rerouteConvoyApi(targetId, {
        reason: incident?.details || 'AI Bypass Reroute Approval',
        approvedBy: 'Major Vikram Sen (Control Center)',
        newEta: incident?.metrics.recommendedEta,
      });
    } catch {
      // Local optimistic state
    }
  },

  rejectSimulationReroute: async () => {
    soundEffects.playClick();
    const incident = get().activeSimulatedIncident;
    const targetId = incident?.vehicleId || get().selectedConvoyId;

    const updatedConvoys = get().convoys.map((c) => {
      if (c.id === targetId || c.callsign === targetId) {
        return {
          ...c,
          status: 'ON-ROUTE' as const,
          movementStatus: 'Delayed' as const,
        };
      }
      return c;
    });

    const updatedIncident = incident ? { ...incident, status: 'REJECTED' as const } : null;
    const updatedHistory = get().simulationHistory.map((h, i) =>
      i === 0 || (incident && h.id === incident.id) ? { ...h, status: 'REJECTED' as const } : h
    );

    set({
      convoys: updatedConvoys,
      activeSimulatedIncident: updatedIncident,
      simulationHistory: updatedHistory,
    });

    telemetryChannel?.postMessage({
      type: 'SIMULATION_EVENT',
      action: 'REJECT_REROUTE',
      payload: { targetId },
    });
  },

  resetSimulation: async () => {
    soundEffects.playClick();
    const cleanConvoys = JSON.parse(JSON.stringify(CONVOYS));
    const cleanAlerts = JSON.parse(JSON.stringify(TACTICAL_ALERTS));

    set({
      convoys: cleanConvoys,
      activeSimulatedIncident: null,
      selectedConvoyId: 'NER-TRK-01',
      alerts: cleanAlerts,
    });

    telemetryChannel?.postMessage({
      type: 'SIMULATION_EVENT',
      action: 'RESET_SIMULATION',
    });
  },
}));

// Cross-tab message receiver
if (telemetryChannel) {
  telemetryChannel.onmessage = (event) => {
    try {
      const data = event.data;
      if (data?.type === 'SIMULATION_EVENT') {
        const store = useTelemetryStore.getState();
        if (data.action === 'RUN_SIMULATION' && data.payload?.simulated) {
          useTelemetryStore.setState({
            activeSimulatedIncident: data.payload.simulated,
            selectedConvoyId: data.payload.targetConvoyId,
            convoys: store.convoys.map((c) =>
              c.id === data.payload.targetConvoyId
                ? { ...c, status: 'HAZ-ALERT', movementStatus: 'Delayed' }
                : c
            ),
            simulationHistory: [data.payload.historyEntry, ...store.simulationHistory],
          });
        } else if (data.action === 'APPROVE_REROUTE') {
          const targetId = data.payload?.targetId;
          const currentInc = store.activeSimulatedIncident;
          useTelemetryStore.setState({
            convoys: store.convoys.map((c) =>
              c.id === targetId || c.callsign === targetId
                ? { ...c, status: 'DIVERTED', movementStatus: 'Moving', distanceToHazardKm: 0 }
                : c
            ),
            activeSimulatedIncident: currentInc ? { ...currentInc, status: 'REROUTED' } : null,
            simulationHistory: store.simulationHistory.map((h, i) =>
              i === 0 ? { ...h, status: 'REROUTED' } : h
            ),
          });
        } else if (data.action === 'REJECT_REROUTE') {
          const currentInc = store.activeSimulatedIncident;
          useTelemetryStore.setState({
            activeSimulatedIncident: currentInc ? { ...currentInc, status: 'REJECTED' } : null,
            simulationHistory: store.simulationHistory.map((h, i) =>
              i === 0 ? { ...h, status: 'REJECTED' } : h
            ),
          });
        } else if (data.action === 'RESET_SIMULATION') {
          useTelemetryStore.setState({
            convoys: JSON.parse(JSON.stringify(CONVOYS)),
            activeSimulatedIncident: null,
            selectedConvoyId: 'NER-TRK-01',
            alerts: JSON.parse(JSON.stringify(TACTICAL_ALERTS)),
          });
        }
      }
    } catch {
      // Ignore
    }
  };
}

