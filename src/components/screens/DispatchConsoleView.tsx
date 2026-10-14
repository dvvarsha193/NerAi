import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Truck, 
  User, 
  Phone, 
  Package, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  Edit3, 
  ShieldCheck, 
  Navigation, 
  Plus, 
  Minus, 
  Crosshair, 
  Share2, 
  Info,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

// Default Fallback Corridor Waypoints (Guwahati -> Shillong)
const CURRENT_AFFECTED_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.0600, 91.8100],
  [25.9800, 91.8600],
  [25.9000, 91.8800], // Nongpoh
  [25.8200, 91.8700],
  [25.7400, 91.8600], // Landslide Hazard Zone (Mawkdok)
  [25.6800, 91.8800],
  [25.6200, 91.8900],
  [25.5788, 91.8933], // Shillong
];

const AI_RECOMMENDED_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.0600, 91.8100],
  [25.9800, 91.8600],
  [25.9000, 91.8800], // Nongpoh
  [25.8300, 91.7700], // Western ridge diversion
  [25.7300, 91.7200],
  [25.6400, 91.7800],
  [25.5900, 91.8400],
  [25.5788, 91.8933], // Shillong
];

const ALTERNATIVE_2_ROUTE: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.1000, 92.0000],
  [25.9500, 92.0500],
  [25.8000, 92.0800],
  [25.6700, 91.9900],
  [25.5788, 91.8933], // Shillong
];

// Helper to interpolate smooth slow movement along polyline coordinates
function interpolateAlongPolyline(points: [number, number][], progress: number): { position: [number, number]; heading: number } {
  if (!points || points.length === 0) {
    return { position: [25.93, 91.86], heading: 135 };
  }
  if (points.length === 1) {
    return { position: points[0], heading: 135 };
  }
  const t = Math.max(0, Math.min(1, progress));
  const totalSegments = points.length - 1;
  const segmentFloat = t * totalSegments;
  const segmentIdx = Math.min(Math.floor(segmentFloat), totalSegments - 1);
  const frac = segmentFloat - segmentIdx;

  const p1 = points[segmentIdx];
  const p2 = points[segmentIdx + 1] || p1;

  const lat = p1[0] + (p2[0] - p1[0]) * frac;
  const lng = p1[1] + (p2[1] - p1[1]) * frac;

  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  let heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
  if (heading < 0) heading += 360;

  return { position: [lat, lng], heading };
}

// Crisp White Truck Marker with dynamic heading and callsign badge
function createWhiteTruckIcon(headingDeg: number, callsign: string) {
  return L.divIcon({
    className: 'custom-white-truck-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <!-- Pulsing radar glow -->
        <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: rgba(37, 99, 235, 0.22); border: 1.5px solid rgba(37, 99, 235, 0.5); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- White Truck Body Badge -->
        <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #FFFFFF; color: #0F172A; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.35); border: 2.5px solid #2563EB; transform: rotate(${headingDeg}deg); transition: transform 0.15s ease-out; z-index: 20;">
          🚚
        </div>
        
        <!-- Callsign Pill -->
        <div style="position: absolute; top: 34px; background: #0F172A; color: #FFFFFF; font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 4px; white-space: nowrap; pointer-events: none; border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 2px 5px rgba(0,0,0,0.3); z-index: 25;">
          ${callsign}
        </div>
      </div>
    `,
    iconSize: [42, 48],
    iconAnchor: [21, 16],
  });
}

export const DispatchConsoleView: React.FC = () => {
  const { 
    convoys,
    selectedConvoyId,
    activeSimulatedIncident,
    approveSimulationReroute,
    rejectSimulationReroute,
    resetSimulation,
  } = useTelemetryStore();

  const [selectedRouteOption, setSelectedRouteOption] = useState<'recommended' | 'current' | 'alt2'>('recommended');
  const [activeSubtab, setActiveSubtab] = useState<'Route Options' | 'Risk Factors' | 'Satellite Data' | 'Weather' | 'Road Info'>('Route Options');
  const [activeMapLayer, setActiveMapLayer] = useState<'map' | 'satellite'>('map');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(272);

  // Moving Truck animation references
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const animProgressRef = useRef<number>(0.35);
  const animIntervalRef = useRef<any>(null);

  // Active convoy targeting
  const activeConvoy =
    convoys.find((c) => c.id === activeSimulatedIncident?.vehicleId || c.callsign === activeSimulatedIncident?.vehicleId) ||
    convoys.find((c) => c.id === selectedConvoyId) ||
    convoys[0];

  const isRerouteApproved = activeSimulatedIncident?.status === 'REROUTED' || activeConvoy?.status === 'DIVERTED';
  const isReroutingRequired = activeSimulatedIncident?.status === 'REROUTING_REQUIRED' && !isRerouteApproved;
  const isRejected = activeSimulatedIncident?.status === 'REJECTED';

  // Dynamic Route & Map Geometries
  const currentRouteCoords = activeSimulatedIncident?.routes?.currentRoute || CURRENT_AFFECTED_ROUTE;
  const recRouteCoords = activeSimulatedIncident?.routes?.recommendedRoute || AI_RECOMMENDED_ROUTE;
  const alt2RouteCoords = activeSimulatedIncident?.routes?.alt2Route || ALTERNATIVE_2_ROUTE;
  const hazardCoords = activeSimulatedIncident?.routes?.hazardCoords || [25.7400, 91.8600];
  const blockCoords = activeSimulatedIncident?.routes?.blockCoords || [25.7800, 91.8700];
  const vehicleCoords = activeSimulatedIncident?.routes?.vehicleCoords || activeConvoy?.currentPosition || [25.9300, 91.8600];
  const mapBounds = activeSimulatedIncident?.routes?.bounds || [[26.16, 91.68], [25.54, 92.00]];
  const originData = activeSimulatedIncident?.routes?.origin || { name: activeConvoy?.origin?.split(',')[0] || 'Guwahati', coordinates: [26.1445, 91.7362] as [number, number] };
  const destData = activeSimulatedIncident?.routes?.destination || { name: activeConvoy?.destination?.split(',')[0] || 'Shillong', coordinates: [25.5788, 91.8933] as [number, number] };

  // Helper for incident icon
  const getIncidentBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood':
        return { emoji: '🌊', name: 'Flood' };
      case 'heavy rainfall':
        return { emoji: '🌧️', name: 'Heavy Rain' };
      case 'traffic congestion':
        return { emoji: '🚗', name: 'Traffic Jam' };
      case 'road blockage':
        return { emoji: '🛑', name: 'Road Block' };
      case 'accident':
        return { emoji: '💥', name: 'Accident' };
      case 'route closure':
        return { emoji: '⛔', name: 'Route Closed' };
      case 'vehicle breakdown':
        return { emoji: '🔧', name: 'Breakdown' };
      default:
        return { emoji: '⚠️', name: 'Landslide' };
    }
  };

  const incidentBadge = getIncidentBadge(activeSimulatedIncident?.incidentType || 'Landslide');

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Leaflet Map Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: activeSimulatedIncident?.routes?.center || [25.86, 91.83],
      zoom: activeSimulatedIncident?.routes?.zoom || 10,
      minZoom: 7,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Tile Layer: Google Terrain / Satellite
    const tileUrl = activeMapLayer === 'satellite'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // 1. Current Route (Affected - Red line)
    L.polyline(currentRouteCoords, {
      color: '#EF4444',
      weight: selectedRouteOption === 'current' ? 5.5 : 4,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 2. AI Recommended Route (Green when approved, Blue dashed when pending)
    L.polyline(recRouteCoords, {
      color: isRerouteApproved ? '#10B981' : '#2563EB',
      weight: selectedRouteOption === 'recommended' || isRerouteApproved ? 5.5 : 4,
      dashArray: isRerouteApproved ? undefined : '6,6',
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 3. Alternative 2 Route (if selected)
    if (selectedRouteOption === 'alt2') {
      L.polyline(alt2RouteCoords, {
        color: '#3B82F6',
        weight: 5,
        dashArray: '4,4',
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // 4. Incident Hazard Zone (Translucent Red Circle)
    L.circle(hazardCoords, {
      radius: 4200,
      color: '#EF4444',
      fillColor: '#EF4444',
      fillOpacity: 0.16,
      weight: 1.5,
      dashArray: '4,4',
    }).addTo(map);

    // Hazard Badge inside danger zone
    const hazardIcon = L.divIcon({
      className: 'custom-hazard-marker',
      html: `
        <div style="display: flex; align-items: center; gap: 4px; pointer-events: auto;">
          <div style="width: 26px; height: 26px; border-radius: 9999px; background-color: #EF4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); border: 2px solid white;">
            ${incidentBadge.emoji}
          </div>
          <div style="background-color: white; border: 1px solid #FCA5A5; color: #991B1B; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap;">
            ${activeSimulatedIncident?.incidentType || 'Hazard'}<br/><span style="font-size: 8px; font-weight: 600; color: #64748B;">${activeSimulatedIncident?.severity || 'Critical'}</span>
          </div>
        </div>
      `,
      iconSize: [85, 28],
      iconAnchor: [13, 14],
    });
    L.marker(hazardCoords, { icon: hazardIcon }).addTo(map);

    // 5. Road Blocked Icon (Red X square on affected road)
    const blockIcon = L.divIcon({
      className: 'custom-blocked-road',
      html: `
        <div style="width: 17px; height: 17px; background-color: #EF4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border-radius: 3px; border: 1.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
          ✕
        </div>
      `,
      iconSize: [17, 17],
      iconAnchor: [8.5, 8.5],
    });
    L.marker(blockCoords, { icon: blockIcon }).addTo(map);

    // 6. Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-origin-marker',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 15px; height: 15px; border-radius: 9999px; background-color: #10B981; color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;">
          </div>
          <div style="font-size: 9.5px; font-weight: 800; color: #0F172A; text-shadow: 0 1px 2px white; margin-top: 1px; white-space: nowrap;">
            ${originData.name}
          </div>
        </div>
      `,
      iconSize: [65, 30],
      iconAnchor: [32.5, 7.5],
    });
    L.marker(originData.coordinates, { icon: originIcon }).addTo(map);

    // 7. Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 15px; height: 15px; border-radius: 9999px; background-color: #2563EB; color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;">
          </div>
          <div style="font-size: 9.5px; font-weight: 800; color: #0F172A; text-shadow: 0 1px 2px white; margin-top: 1px; white-space: nowrap;">
            ${destData.name}
          </div>
        </div>
      `,
      iconSize: [65, 30],
      iconAnchor: [32.5, 7.5],
    });
    L.marker(destData.coordinates, { icon: destIcon }).addTo(map);

    // 8. Vehicle Icon (White Truck)
    const activeRouteForMovement = selectedRouteOption === 'alt2' ? alt2RouteCoords : recRouteCoords;
    const initialPos = isRerouteApproved
      ? interpolateAlongPolyline(activeRouteForMovement, animProgressRef.current).position
      : vehicleCoords;
    const initialHeading = isRerouteApproved
      ? interpolateAlongPolyline(activeRouteForMovement, animProgressRef.current).heading
      : 135;

    const truckMarker = L.marker(initialPos, {
      icon: createWhiteTruckIcon(initialHeading, activeConvoy.callsign || 'NER-TRK-01'),
      zIndexOffset: 1000,
    }).addTo(map);

    truckMarkerRef.current = truckMarker;

    // Fit Bounds
    map.fitBounds(mapBounds, { padding: [16, 16] });

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeMapLayer, selectedRouteOption, activeSimulatedIncident, isRerouteApproved]);

  // Moving Animation Effect: When rerouted, moves the white truck very slowly along the bypass corridor
  useEffect(() => {
    if (!isRerouteApproved) {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
        animIntervalRef.current = null;
      }
      animProgressRef.current = 0.35;
      if (truckMarkerRef.current) {
        truckMarkerRef.current.setLatLng(vehicleCoords);
        truckMarkerRef.current.setIcon(createWhiteTruckIcon(135, activeConvoy.callsign || 'NER-TRK-01'));
      }
      return;
    }

    // When rerouted: animate slowly along the bypass route
    const activeRouteForMovement = selectedRouteOption === 'alt2' ? alt2RouteCoords : recRouteCoords;

    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
    }

    // Advance very slowly: 0.0003 progress every 60ms (~2 minutes full corridor)
    animIntervalRef.current = setInterval(() => {
      animProgressRef.current += 0.0003;

      // Loop smoothly when reaching near destination for continuous demo
      if (animProgressRef.current > 0.98) {
        animProgressRef.current = 0.35; // Loop back to start of bypass for uninterrupted showcase
      }

      const { position, heading } = interpolateAlongPolyline(activeRouteForMovement, animProgressRef.current);

      if (truckMarkerRef.current) {
        truckMarkerRef.current.setLatLng(position);
        truckMarkerRef.current.setIcon(createWhiteTruckIcon(heading, activeConvoy.callsign || 'NER-TRK-01'));
      }
    }, 60);

    return () => {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
        animIntervalRef.current = null;
      }
    };
  }, [isRerouteApproved, selectedRouteOption, activeConvoy.callsign, recRouteCoords, alt2RouteCoords, vehicleCoords]);

  const handleApproveReroute = async () => {
    await approveSimulationReroute({ routeOption: selectedRouteOption === 'alt2' ? 'alt2' : 'recommended' });
  };

  const handleRejectReroute = async () => {
    await rejectSimulationReroute();
  };

  const handleResetSimulation = async () => {
    await resetSimulation();
  };

  return (
    <div className="w-full min-h-full bg-[#F3F7FA] px-4 py-3.5 select-none text-slate-800">
      <div className="max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* ========================================================================= */}
        {/* COLUMN 1 (LEFT, 3 Cols): Current Vehicle + Active Incident + Timeline      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* CARD 1: Current Vehicle */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900 tracking-tight font-display">
                Current Vehicle
              </span>

              {isRerouteApproved ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Rerouted via Bypass</span>
                </span>
              ) : isReroutingRequired ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>⚠️ Rerouting Required</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>In Transit</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl flex-shrink-0 border border-slate-200 shadow-xs">
                🚚
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 font-display">
                  {activeConvoy.callsign || activeConvoy.id || 'NER-TRK-01'}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {activeConvoy.origin} → {activeConvoy.destination}
                </div>
              </div>
            </div>

            {/* Metadata Details List */}
            <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-400 font-medium">Driver</span>
                <span className="font-bold text-slate-800 ml-auto">{activeConvoy.operator || 'Rohit Das'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-bold text-slate-800 ml-auto">{activeConvoy.driverContact || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-bold text-slate-800 ml-auto">{activeConvoy.vehicleNo || 'NL-01-AB-4582'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-bold text-slate-800 ml-auto truncate max-w-[170px]">{activeConvoy.cargoManifest || 'Electronics & Essentials'}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Active Incident */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900 tracking-tight font-display">
                Active Incident
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                activeSimulatedIncident?.severity === 'Critical'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span>+ {activeSimulatedIncident?.severity || 'High'} Risk</span>
              </span>
            </div>

            {/* Incident Title & Location */}
            <div className="flex items-start gap-2 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xs flex-shrink-0 font-bold">
                {incidentBadge.emoji}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {activeSimulatedIncident?.incidentType || 'Landslide'} Detected
                </div>
                <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                  {activeSimulatedIncident?.location || 'NH-6, 18.4 km ahead'}
                </div>
                <div className="text-[9.5px] text-slate-400">
                  Detected at {activeSimulatedIncident?.timestamp || '10:18 AM'} (via Simulation Engine + Satellite)
                </div>
              </div>
            </div>

            {/* Incident Visual Scene */}
            <div className="relative w-full h-22 sm:h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex-shrink-0 my-1">
              <img 
                src="/landslide_incident.jpg" 
                alt="Incident Scene" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-extrabold">
                {incidentBadge.emoji} {activeSimulatedIncident?.incidentType || 'Hazard'}
              </div>
            </div>

            {/* Incident Key-Value Attributes */}
            <div className="space-y-1 text-[10.5px] text-slate-600 divide-y divide-slate-100 pt-1">
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 font-medium">Type</span>
                <span className="font-bold text-slate-800">{activeSimulatedIncident?.incidentType || 'Natural (Landslide)'}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 font-medium">Source</span>
                <span className="font-bold text-slate-800">ISRO InSAR + IMD Radar</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 font-medium">Severity</span>
                <span className="font-bold text-rose-600">{activeSimulatedIncident?.severity || 'Critical'}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 font-medium">Disruption Duration</span>
                <span className="font-bold text-purple-700">{activeSimulatedIncident?.duration || '3 Hours'}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-400 font-medium">Estimated Impact</span>
                <span className="font-bold text-rose-600">+{activeSimulatedIncident?.metrics?.delayMinutes || 80}m delay</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Incident Timeline */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-display mb-2">
              Incident Timeline
            </h3>

            <div className="space-y-2.5 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative flex items-center gap-2.5 pl-6">
                <span className="absolute left-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                <div className="text-[11px] leading-tight">
                  <span className="font-extrabold text-slate-800">{activeSimulatedIncident?.timestamp || '10:18 AM'}</span> — <span className="text-slate-600">{activeSimulatedIncident?.incidentType || 'Incident'} detected</span>
                </div>
              </div>

              <div className="relative flex items-center gap-2.5 pl-6">
                <span className="absolute left-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"></span>
                <div className="text-[11px] leading-tight">
                  <span className="font-extrabold text-slate-800">10:20 AM</span> — <span className="text-slate-600">Risk analysis done</span>
                </div>
              </div>

              <div className="relative flex items-center gap-2.5 pl-6">
                <span className="absolute left-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"></span>
                <div className="text-[11px] leading-tight">
                  <span className="font-extrabold text-slate-800">10:21 AM</span> — <span className="text-slate-600">AI route options gen.</span>
                </div>
              </div>

              <div className="relative flex items-center gap-2.5 pl-6">
                <span className={`absolute left-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  isRerouteApproved ? 'bg-emerald-500' : isRejected ? 'bg-slate-400' : 'bg-blue-600 animate-pulse'
                }`}></span>
                <div className="text-[11px] leading-tight">
                  <span className="font-extrabold text-slate-800">10:24 AM</span> — <span className={`font-bold ${
                    isRerouteApproved ? 'text-emerald-600' : isRejected ? 'text-slate-600' : 'text-blue-600'
                  }`}>
                    {isRerouteApproved ? 'Reroute Dispatched' : isRejected ? 'Reroute Rejected' : 'Awaiting decision'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2 (CENTER, 5 Cols): Meghalaya Map + Route Comparison Table         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          
          {/* Center Map Card */}
          <div className="relative w-full h-[460px] lg:h-[490px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
            
            {/* Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Top Left: Map / Satellite Layer Switch */}
            <div className="absolute top-3 left-3 z-10 flex items-center bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setActiveMapLayer('map')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMapLayer === 'map'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setActiveMapLayer('satellite')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMapLayer === 'satellite'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Top Cardinal Arrow */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-[10px] font-extrabold text-slate-700 bg-white/90 backdrop-blur-xs px-3 py-0.5 rounded-full shadow-xs">
              ↑ North Corridor
            </div>

            {/* Bottom Cardinal Arrow */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[10px] font-extrabold text-slate-700 bg-white/90 backdrop-blur-xs px-3 py-0.5 rounded-full shadow-xs">
              ↓ South Corridor
            </div>

            {/* Bottom Left Legend Box */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-[10px] font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 rounded bg-[#EF4444]"></span>
                <span>Current Route (Disrupted)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-0.5 rounded ${isRerouteApproved ? 'bg-[#10B981]' : 'bg-[#2563EB] border-b border-dashed'}`}></span>
                <span>{isRerouteApproved ? 'Active Dynamic Bypass' : 'AI Recommended Route'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{incidentBadge.emoji}</span>
                <span>{activeSimulatedIncident?.incidentType || 'Hazard Zone'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span>Vehicle ({activeConvoy.callsign || 'NER-TRK-01'})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                </span>
                <span>{originData.name} ➔ {destData.name}</span>
              </div>
            </div>

            {/* Right Map Controls */}
            <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-1.5">
              <button 
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.fitBounds(mapBounds, { padding: [16, 16] });
                  }
                }}
                title="Recenter corridor"
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
              </button>
              <button 
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Route Comparison Table (Directly under the Map) */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-display mb-2">
              Route Comparison (Live Disruption Assessment)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase">
                    <th className="py-1 text-slate-400">Parameter</th>
                    <th className="py-1 text-slate-600">Current Route</th>
                    <th className="py-1 text-emerald-600">AI Recommended</th>
                    <th className="py-1 text-blue-600">Alternative 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-1 text-slate-400">Distance</td>
                    <td className="py-1 font-bold text-slate-800">{activeSimulatedIncident?.metrics?.currentDistanceKm || 121} km</td>
                    <td className="py-1 font-bold text-emerald-700 bg-emerald-50/70 px-1.5 rounded">{activeSimulatedIncident?.metrics?.recommendedDistanceKm || 136} km</td>
                    <td className="py-1 text-slate-600">{activeSimulatedIncident?.metrics?.alt2DistanceKm || 149} km</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">ETA</td>
                    <td className="py-1 font-bold text-slate-800">{activeSimulatedIncident?.metrics?.currentEta || '3 h 08 min'}</td>
                    <td className="py-1 font-bold text-emerald-700 bg-emerald-50/70 px-1.5 rounded">{activeSimulatedIncident?.metrics?.recommendedEta || '3 h 26 min'}</td>
                    <td className="py-1 text-slate-600">{activeSimulatedIncident?.metrics?.alt2Eta || '3 h 41 min'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Risk Score</td>
                    <td className="py-1 font-extrabold text-rose-600">{activeSimulatedIncident?.metrics?.currentRisk || 87} ({activeSimulatedIncident?.severity || 'Critical'})</td>
                    <td className="py-1 font-extrabold text-emerald-600 bg-emerald-50/70 px-1.5 rounded">{activeSimulatedIncident?.metrics?.recommendedRisk || 24} (Low)</td>
                    <td className="py-1 font-bold text-blue-600">{activeSimulatedIncident?.metrics?.alt2Risk || 32} (Moderate)</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Estimated Delay</td>
                    <td className="py-1 font-bold text-rose-600">+{activeSimulatedIncident?.metrics?.delayMinutes || 80} min delay</td>
                    <td className="py-1 font-bold text-emerald-600 bg-emerald-50/70 px-1.5 rounded">0 min (Safe)</td>
                    <td className="py-1 text-blue-600">0 min</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Traffic</td>
                    <td className="py-1 font-bold text-slate-700">{activeSimulatedIncident?.metrics?.trafficCurrent || 'Moderate'}</td>
                    <td className="py-1 font-bold text-emerald-600 bg-emerald-50/70 px-1.5 rounded">{activeSimulatedIncident?.metrics?.trafficRec || 'Light'}</td>
                    <td className="py-1 text-slate-600">{activeSimulatedIncident?.metrics?.trafficAlt2 || 'Moderate'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Weather/Precip</td>
                    <td className="py-1 font-bold text-rose-600">{activeSimulatedIncident?.metrics?.rainfallCurrent || 'High'}</td>
                    <td className="py-1 font-bold text-emerald-600 bg-emerald-50/70 px-1.5 rounded">{activeSimulatedIncident?.metrics?.rainfallRec || 'Low'}</td>
                    <td className="py-1 text-blue-600">{activeSimulatedIncident?.metrics?.rainfallAlt2 || 'Low'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-400">Road Condition</td>
                    <td className="py-1 font-bold text-rose-600">{activeSimulatedIncident?.metrics?.roadConditionCurrent || 'Uncertain'}</td>
                    <td className="py-1 font-bold text-emerald-600 bg-emerald-50/70 px-1.5 rounded">{activeSimulatedIncident?.metrics?.roadConditionRec || 'Good'}</td>
                    <td className="py-1 text-amber-600">{activeSimulatedIncident?.metrics?.roadConditionAlt2 || 'Moderate'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3 (RIGHT, 4 Cols): NER AI Analysis + Reroute Impact Underneath      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          
          {/* CARD 1: NER AI Analysis */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
            
            {/* AI Top Header Bar */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-black text-slate-900 font-display">
                  NER AI Analysis
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span>Confidence 94%</span>
                <span className="w-10 h-2 bg-emerald-200 rounded-full overflow-hidden inline-block">
                  <span className="w-[94%] h-full bg-emerald-500 block"></span>
                </span>
              </div>
            </div>

            {/* AI Warning Box */}
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-2 text-xs text-blue-900 leading-snug font-medium">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                {activeSimulatedIncident?.metrics?.reason ||
                  'High probability of road blockage due to active hazard zone ahead. Rerouting via alternative route is recommended to avoid delay and safety risk.'}
              </div>
            </div>

            {/* Subtabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-1 scrollbar-none">
              {(['Route Options', 'Risk Factors', 'Satellite Data', 'Weather', 'Road Info'] as const).map((tab) => {
                const isActive = activeSubtab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSubtab(tab)}
                    className={`px-2 py-0.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* 3 SIDE-BY-SIDE ROUTE OPTION CARDS (View Alternatives) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              {/* 1. Current Route (Red) */}
              <div 
                onClick={() => setSelectedRouteOption('current')}
                className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedRouteOption === 'current'
                    ? 'border-rose-500 bg-rose-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>Current</span>
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    📍 {activeSimulatedIncident?.metrics?.currentDistanceKm || 121} km
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">
                    🕒 {activeSimulatedIncident?.metrics?.currentEta || '3 h 08 min'}
                  </div>
                  <div className="text-[11px] font-black text-rose-600">
                    Risk {activeSimulatedIncident?.metrics?.currentRisk || 87}/100
                  </div>
                </div>

                <ul className="mt-2 space-y-0.5 text-[9.5px] text-slate-600 leading-tight">
                  <li className="flex items-center gap-1 text-rose-600">
                    <span>•</span> {activeSimulatedIncident?.incidentType || 'Hazard'} zone
                  </li>
                  <li className="flex items-center gap-1 text-rose-600">
                    <span>•</span> +{activeSimulatedIncident?.metrics?.delayMinutes || 80}m delay
                  </li>
                  <li className="flex items-center gap-1 text-rose-600">
                    <span>•</span> Road blocked
                  </li>
                </ul>
              </div>

              {/* 2. Recommended Route (Green - Highlighted) */}
              <div 
                onClick={() => setSelectedRouteOption('recommended')}
                className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                  selectedRouteOption === 'recommended'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300 bg-white'
                }`}
              >
                <div className="absolute -top-2 right-1.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-bold shadow-xs">
                  Recommended
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Rec.</span>
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    📍 {activeSimulatedIncident?.metrics?.recommendedDistanceKm || 136} km
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">
                    🕒 {activeSimulatedIncident?.metrics?.recommendedEta || '3 h 26 min'}
                  </div>
                  <div className="text-[11px] font-black text-emerald-600">
                    Risk {activeSimulatedIncident?.metrics?.recommendedRisk || 24}/100
                  </div>
                </div>

                <ul className="mt-2 space-y-0.5 text-[9.5px] text-slate-600 leading-tight">
                  <li className="flex items-center gap-1 text-emerald-600">
                    <span>•</span> Safe corridor
                  </li>
                  <li className="flex items-center gap-1 text-emerald-600">
                    <span>•</span> Zero delay
                  </li>
                  <li className="flex items-center gap-1 text-emerald-600">
                    <span>•</span> +{activeSimulatedIncident?.metrics?.addedDistanceKm || 15}km (+18m)
                  </li>
                </ul>
              </div>

              {/* 3. Alternative 2 Route (Blue) */}
              <div 
                onClick={() => setSelectedRouteOption('alt2')}
                className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedRouteOption === 'alt2'
                    ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600">
                    <Share2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Alt 2</span>
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    📍 {activeSimulatedIncident?.metrics?.alt2DistanceKm || 149} km
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">
                    🕒 {activeSimulatedIncident?.metrics?.alt2Eta || '3 h 41 min'}
                  </div>
                  <div className="text-[11px] font-black text-blue-600">
                    Risk {activeSimulatedIncident?.metrics?.alt2Risk || 32}/100
                  </div>
                </div>

                <ul className="mt-2 space-y-0.5 text-[9.5px] text-slate-600 leading-tight">
                  <li className="flex items-center gap-1 text-blue-600">
                    <span>•</span> Minimal risk
                  </li>
                  <li className="flex items-center gap-1 text-blue-600">
                    <span>•</span> Longer road
                  </li>
                  <li className="flex items-center gap-1 text-blue-600">
                    <span>•</span> +{activeSimulatedIncident?.metrics?.alt2DistanceKm ? activeSimulatedIncident.metrics.alt2DistanceKm - activeSimulatedIncident.metrics.currentDistanceKm : 28}km
                  </li>
                </ul>
              </div>

            </div>

            {/* "Why this route?" Banner */}
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 text-sm">
                  💡
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Why this route?
                  </div>
                  <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                    Avoids {activeSimulatedIncident?.incidentType || 'landslide'} corridor, reduces risk by {activeSimulatedIncident?.metrics?.riskReductionPts || 63} points, bypasses {activeSimulatedIncident?.metrics?.delayMinutes || 80}m delay.
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsAnalysisModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[10.5px] font-bold whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer shadow-xs"
              >
                Analysis →
              </button>
            </div>

            {/* 3 Main Action Buttons: Accept / Modify / Reject */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleApproveReroute}
                disabled={isRerouteApproved}
                className={`py-2.5 px-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer ${
                  isRerouteApproved
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-default'
                    : 'bg-[#2563EB] hover:bg-blue-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isRerouteApproved ? 'Rerouted' : 'Accept Reroute'}</span>
              </button>

              <button
                onClick={() => setIsModifyModalOpen(true)}
                className="py-2.5 px-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Modify</span>
              </button>

              <button
                onClick={handleRejectReroute}
                className="py-2.5 px-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isRejected ? 'Rejected' : 'Reject'}</span>
              </button>
            </div>

            {/* Countdown / Status Banner */}
            <div className={`p-2 rounded-xl border flex items-center gap-2 text-[11px] font-bold ${
              isRerouteApproved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isRejected
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {isRerouteApproved ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Reroute Active: Convoy diverted to recommended bypass route.</span>
                </>
              ) : isRejected ? (
                <>
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>Reroute Rejected: Vehicle staying on current primary corridor.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 animate-pulse" />
                  <span>
                    Auto-reroute in <span className="font-mono underline">{formatCountdown(countdownSeconds)}</span> due to {activeSimulatedIncident?.severity || 'Critical'} hazard level.
                  </span>
                </>
              )}
            </div>

            {/* Demo Presentation Reset Control */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-400 font-semibold">Demo Presentation Controls:</span>
              <button
                onClick={handleResetSimulation}
                className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-1.5 transition-all cursor-pointer text-[10.5px]"
                title="Restore all routes and vehicles to clean baseline state"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset Simulation</span>
              </button>
            </div>

          </div>

          {/* CARD 2: Reroute Impact (If Approved) - Directly under NER AI Analysis */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-display mb-2">
              Reroute Impact (If Approved)
            </h3>

            {/* 4 Badges Row */}
            <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
              {/* Risk Reduction */}
              <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
                <div className="text-[8px] font-bold text-emerald-700 uppercase">Risk Reduction</div>
                <div className="text-xs font-black text-emerald-700 mt-1 flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activeSimulatedIncident?.metrics?.riskReductionPts || 63} pts</span>
                </div>
              </div>

              {/* Additional Distance */}
              <div className="p-1.5 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center">
                <div className="text-[8px] font-bold text-blue-700 uppercase">Add. Dist</div>
                <div className="text-xs font-black text-blue-700 mt-1 flex items-center gap-0.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>+{activeSimulatedIncident?.metrics?.addedDistanceKm || 15} km</span>
                </div>
              </div>

              {/* Additional Time */}
              <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center">
                <div className="text-[8px] font-bold text-rose-700 uppercase">Add. Time</div>
                <div className="text-xs font-black text-rose-700 mt-1 flex items-center gap-0.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>+18 min</span>
                </div>
              </div>

              {/* Deliveries Protected */}
              <div className="p-1.5 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center">
                <div className="text-[8px] font-bold text-purple-700 uppercase">Protected</div>
                <div className="text-xs font-black text-purple-700 mt-1 flex items-center gap-0.5">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  <span>4</span>
                </div>
              </div>
            </div>

            {/* Quote Block */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic leading-snug mt-2">
              ❝ "Significantly reduces risk with minimal increase in distance and time." – <span className="font-bold not-italic text-blue-600">NER AI</span>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED ANALYSIS MODAL */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  NER AI Route Simulation & Risk Analysis
                </h3>
              </div>
              <button 
                onClick={() => setIsAnalysisModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Optical satellite synthetic aperture radar (SAR) and real-time telemetry detected an active{' '}
              <strong className="text-slate-800 font-bold">{activeSimulatedIncident?.incidentType || 'incident'}</strong> disruption near{' '}
              <strong className="text-slate-800 font-bold">{activeSimulatedIncident?.location || 'NH-6 Mawkdok'}</strong> with expected blockage of{' '}
              <strong className="text-purple-700 font-bold">{activeSimulatedIncident?.duration || '3 Hours'}</strong>. By diverting via the AI Recommended bypass, vehicle{' '}
              <strong className="text-slate-900 font-bold">{activeConvoy.callsign || 'NER-TRK-01'}</strong> avoids potential single-point failure, prevents {activeSimulatedIncident?.metrics?.delayMinutes || 80} minutes of gridlock, and secures mission schedule.
            </p>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              ✔ Driver {activeConvoy.operator || 'Rohit Das'} will receive automated turn-by-turn vector coordinates via offline-cached satellite terminal upon approval.
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsAnalysisModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApproveReroute();
                  setIsAnalysisModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                Approve Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODIFY ROUTE MODAL */}
      {isModifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Modify Bypass Constraints
              </h3>
              <button 
                onClick={() => setIsModifyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Acceptable Delay</label>
                <select className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium">
                  <option>+30 minutes</option>
                  <option>+45 minutes</option>
                  <option>+1 hour</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Passability Threshold</label>
                <select className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium">
                  <option>Paved Highways Only</option>
                  <option>Single-Lane Mountain Corridor Permitted</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setSelectedRouteOption('alt2');
                  setIsModifyModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                Apply Custom Bypass (Alternative 2)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DispatchConsoleView;
