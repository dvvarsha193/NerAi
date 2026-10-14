import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Search, 
  RotateCcw, 
  Maximize2, 
  Phone, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { NER_ROUTE_POLYLINE, NER_ROUTE_SCHEDULE } from '../../data/mockData';
import { vehicleAnimationService, VehicleTelemetry } from '../../services/vehicleAnimationService';
import { HazardDetailModal, HazardAlertType } from '../map/HazardDetailModal';

interface FleetMapDashboardProps {
  onBackToFleet?: () => void;
}

export const FleetMapDashboard: React.FC<FleetMapDashboardProps> = ({ onBackToFleet }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const {
    navigateToIndividualVehicle,
    selectedConvoyId,
    setSelectedConvoyId,
    simSpeed
  } = useTelemetryStore();

  const [selectedVehicleCode, setSelectedVehicleCode] = useState<string>('TRK-042');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Moving' | 'Delayed' | 'Idle'>('All');
  const [activeLayer, setActiveLayer] = useState<'traffic' | 'weather' | 'terrain' | 'risks'>('risks');
  const [activeHazardAlert, setActiveHazardAlert] = useState<HazardAlertType | null>(null);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);

  // Live telemetries state from the animation engine
  const [liveTelemetries, setLiveTelemetries] = useState<VehicleTelemetry[]>(() => vehicleAnimationService.getAllTelemetries());

  // Active selected vehicle telemetry
  const activeTelemetry = liveTelemetries.find((v) => v.code === selectedVehicleCode || v.id === selectedConvoyId) || liveTelemetries[0];

  // Dynamic live calculations for active vehicle
  const liveProgressPercent = Math.round((activeTelemetry?.progress || 0.58) * 100);
  const liveDistanceDone = activeTelemetry?.kmCompleted || Math.round((activeTelemetry?.progress || 0.58) * 545);
  const totalRouteKm = activeTelemetry?.totalKm || 545;

  // Filter vehicles
  const filteredVehicles = liveTelemetries.filter((v) => {
    const matchesSearch = 
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.currentRoute?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = 
      statusFilter === 'All' || 
      v.movementStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle map recenter
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([26.68, 92.95], 7.6, { animate: true });
    }
  };

  const handleLocateActiveVehicle = () => {
    if (mapInstanceRef.current && activeTelemetry) {
      mapInstanceRef.current.setView([activeTelemetry.lat, activeTelemetry.lng], 9.5, { animate: true });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Center map on North East corridor matching screenshot
    const map = L.map(mapContainerRef.current, {
      center: [26.68, 92.95],
      zoom: 7.6,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Base Satellite/Terrain Layer with Topography
    const tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Hybrid Satellite
    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // 1. Topographic Regional Text Labels
    const regionalLabels: { name: string; pos: [number, number]; styleClass: string }[] = [
      { name: 'ASSAM', pos: [26.35, 93.10], styleClass: 'text-slate-300/80 font-black tracking-[0.25em] text-xs sm:text-sm' },
      { name: 'MEGHALAYA', pos: [25.55, 91.80], styleClass: 'text-slate-300/70 font-black tracking-[0.2em] text-xs' },
      { name: 'ARUNACHAL PRADESH', pos: [27.45, 93.65], styleClass: 'text-slate-200/90 font-black tracking-[0.25em] text-xs sm:text-sm' },
      { name: 'NAGALAND', pos: [26.05, 94.40], styleClass: 'text-slate-300/70 font-black tracking-[0.2em] text-xs' },
    ];

    regionalLabels.forEach((lbl) => {
      const lblIcon = L.divIcon({
        className: 'custom-fleetmap-label',
        html: `<div class="${lbl.styleClass} select-none pointer-events-none whitespace-nowrap drop-shadow-md">${lbl.name}</div>`,
        iconSize: [140, 20],
        iconAnchor: [70, 10],
      });
      L.marker(lbl.pos, { icon: lblIcon, interactive: false }).addTo(map);
    });

    // 2. City Labels
    const cities: { name: string; pos: [number, number] }[] = [
      { name: 'Shillong', pos: [25.57, 91.89] },
      { name: 'Tawang', pos: [27.58, 91.86] },
      { name: 'Bomdila', pos: [27.26, 92.42] },
      { name: 'Ziro', pos: [27.53, 93.83] },
      { name: 'Jorhat', pos: [26.75, 94.22] },
      { name: 'Dibrugarh', pos: [27.47, 94.91] },
      { name: 'Dimapur', pos: [25.90, 93.72] },
    ];

    cities.forEach((c) => {
      const cIcon = L.divIcon({
        className: 'custom-fleetmap-city',
        html: `
          <div class="flex items-center gap-1 pointer-events-none">
            <div class="w-1.5 h-1.5 rounded-full bg-white ring-1 ring-slate-800"></div>
            <span class="text-white text-[10px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">${c.name}</span>
          </div>
        `,
        iconSize: [80, 16],
        iconAnchor: [3, 8],
      });
      L.marker(c.pos, { icon: cIcon, interactive: false }).addTo(map);
    });

    // 3. The Main Highway Corridor (Guwahati ➔ Nagaon ➔ Tezpur ➔ Bhalukpong ➔ Itanagar)
    // Completed segment (solid blue) and remaining segment (dashed light blue)
    const completedPath = NER_ROUTE_POLYLINE.slice(0, 31);
    const remainingPath = NER_ROUTE_POLYLINE.slice(30);

    // Glowing border
    L.polyline(completedPath, {
      color: '#93C5FD',
      weight: 7,
      opacity: 0.6,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Solid Completed Blue line
    L.polyline(completedPath, {
      color: '#2563EB',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Remaining Route (Dashed)
    L.polyline(remainingPath, {
      color: '#60A5FA',
      weight: 3.5,
      dashArray: '5, 8',
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 4. Terminus Points: Guwahati (Green) & Itanagar (Red)
    const startIcon = L.divIcon({
      className: 'custom-ghy-start',
      html: `
        <div class="flex items-center pointer-events-auto cursor-pointer">
          <div class="w-7 h-7 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-300/60 z-20">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div class="ml-1 px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-bold shadow-xl border border-slate-700 whitespace-nowrap">
            Guwahati
          </div>
        </div>
      `,
      iconSize: [110, 36],
      iconAnchor: [14, 18],
    });
    L.marker([26.1445, 91.7362], { icon: startIcon }).addTo(map);

    const destIcon = L.divIcon({
      className: 'custom-ita-dest',
      html: `
        <div class="flex items-center pointer-events-auto cursor-pointer">
          <div class="w-7 h-7 rounded-full bg-[#EF4444] border-2 border-white flex items-center justify-center text-white shadow-lg ring-2 ring-rose-300/60 z-20">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div class="ml-1 px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-bold shadow-xl border border-slate-700 whitespace-nowrap">
            Itanagar
          </div>
        </div>
      `,
      iconSize: [110, 36],
      iconAnchor: [14, 18],
    });
    L.marker([27.0844, 93.6053], { icon: destIcon }).addTo(map);

    // 5. Checkpoints: Nagaon, Tezpur, Bhalukpong
    const checkpoints = [
      { name: 'Nagaon', pos: [26.3450, 92.6840] },
      { name: 'Tezpur', pos: [26.6528, 92.7926] },
      { name: 'Bhalukpong', pos: [27.0125, 92.6508] },
    ];

    checkpoints.forEach((cp) => {
      const cpIcon = L.divIcon({
        className: 'custom-cp-marker',
        html: `
          <div class="flex items-center pointer-events-auto cursor-pointer">
            <div class="w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            </div>
            <div class="ml-1 px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[10px] font-bold shadow-md border border-slate-700 whitespace-nowrap">
              ${cp.name}
            </div>
          </div>
        `,
        iconSize: [90, 24],
        iconAnchor: [8, 12],
      });
      L.marker(cp.pos as [number, number], { icon: cpIcon }).addTo(map);
    });

    // 6. Hazard & Risk Shaded Zones with Small Yellow Alert Signs
    const createFleetYellowAlertSignIcon = (title: string) => {
      return L.divIcon({
        className: 'custom-fleet-yellow-alert-sign',
        html: `
          <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group hover:scale-125 transition-transform" title="Click to view ${title} details">
            <!-- Pulsing yellow radar ping ring -->
            <div class="absolute -inset-1.5 rounded-full bg-amber-400/40 animate-ping"></div>

            <!-- Small Yellow Alert Triangle Badge -->
            <div class="relative w-6 h-6 rounded-full bg-[#F59E0B] border-2 border-white text-slate-950 flex items-center justify-center text-xs font-black shadow-lg ring-2 ring-amber-400/70 hover:bg-amber-400 transition-colors">
              ⚠️
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // A. ⚠️ Landslide Alert (Yellow/Orange gradient circle around Bomdila/Tawang)
    L.circle([27.35, 92.45], {
      radius: 35000,
      color: '#D97706',
      weight: 2,
      fillColor: '#F59E0B',
      fillOpacity: 0.25,
    }).addTo(map);

    const fleetLandslideMarker = L.marker([27.35, 92.45], { 
      icon: createFleetYellowAlertSignIcon('Landslide Risk'),
      zIndexOffset: 1200 
    }).addTo(map);
    fleetLandslideMarker.on('click', () => {
      setActiveHazardAlert('landslide');
    });

    // B. ⚠️ Heavy Rainfall Alert (Blue gradient storm circle around foothill area)
    L.circle([26.95, 92.10], {
      radius: 32000,
      color: '#2563EB',
      weight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.25,
    }).addTo(map);

    const fleetRainMarker = L.marker([26.95, 92.10], { 
      icon: createFleetYellowAlertSignIcon('Heavy Rainfall'),
      zIndexOffset: 1200 
    }).addTo(map);
    fleetRainMarker.on('click', () => {
      setActiveHazardAlert('rainfall');
    });

    // C. ⛔ Road Closed (Red gradient circle near Nagaland/Jorhat)
    L.circle([26.70, 94.20], {
      radius: 30000,
      color: '#DC2626',
      weight: 2,
      fillColor: '#EF4444',
      fillOpacity: 0.38,
    }).addTo(map);

    const roadClosedBadgeIcon = L.divIcon({
      className: 'custom-roadclosed-badge',
      html: `
        <div class="flex flex-col items-center pointer-events-auto cursor-pointer group">
          <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-xl ring-2 ring-rose-400/60">
            ⛔
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([26.70, 94.20], { icon: roadClosedBadgeIcon }).addTo(map);

    // D. ⚠️ Flood Alert (Cyan/Blue gradient circle along Brahmaputra river basin)
    L.circle([26.50, 93.18], {
      radius: 28000,
      color: '#0284C7',
      weight: 2,
      fillColor: '#06B6D4',
      fillOpacity: 0.25,
    }).addTo(map);

    const fleetFloodMarker = L.marker([26.50, 93.18], { 
      icon: createFleetYellowAlertSignIcon('Flood Alert'),
      zIndexOffset: 1200 
    }).addTo(map);
    fleetFloodMarker.on('click', () => {
      setActiveHazardAlert('floods');
    });

    mapInstanceRef.current = map;

    return () => {
      vehicleMarkersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Subscribe to Master Animation Service for all 8 vehicles moving smoothly and slowly along the same route
  useEffect(() => {
    vehicleAnimationService.setSimSpeed(simSpeed || 1);

    const unsubscribe = vehicleAnimationService.subscribe((telemetries, primary) => {
      setLiveTelemetries(telemetries);

      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      telemetries.forEach((v) => {
        const isSelected = v.code === selectedVehicleCode || v.id === selectedConvoyId;
        const isMoving = v.movementStatus === 'Moving';
        const isDelayed = v.movementStatus === 'Delayed';

        let marker = vehicleMarkersRef.current.get(v.code);

        if (!marker) {
          let vIcon: L.DivIcon;

          if (isSelected) {
            vIcon = L.divIcon({
              className: `fleetmap-truck-${v.code}`,
              html: `
                <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group hover:scale-110 transition-transform">
                  <!-- Radar / Selection Glow Ring -->
                  <div class="absolute -inset-2.5 rounded-full bg-blue-500/35 animate-ping"></div>

                  <!-- 3D Truck Graphic Container with Selection Glow -->
                  <div class="moving-truck-heading-puck relative w-12 h-9 rounded-xl bg-blue-600 p-1 flex items-center justify-center shadow-2xl ring-2 ring-white transition-transform duration-200" style="transform: scaleX(${v.isHeadingEast ? -1 : 1});">
                    <img 
                      src="/truck.png" 
                      alt="${v.code}" 
                      class="w-full h-full object-contain drop-shadow-md"
                    />
                    <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full ${isMoving ? 'bg-emerald-400' : isDelayed ? 'bg-rose-500' : 'bg-amber-400'} ring-2 ring-white"></span>
                  </div>
                </div>
              `,
              iconSize: [48, 36],
              iconAnchor: [24, 18],
            });
          } else {
            vIcon = L.divIcon({
              className: `fleetmap-truck-${v.code}`,
              html: `
                <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group hover:scale-110 transition-transform">
                  <div class="moving-truck-heading-puck relative w-9 h-7 rounded-lg bg-white/95 border border-slate-300 p-0.5 shadow-md flex items-center justify-center transition-transform duration-200" style="transform: scaleX(${v.isHeadingEast ? -1 : 1});">
                    <img 
                      src="/truck.png" 
                      alt="${v.code}" 
                      class="w-full h-full object-contain"
                    />
                    <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isMoving ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500' : 'bg-amber-500'} ring-1 ring-white"></span>
                  </div>
                </div>
              `,
              iconSize: [36, 30],
              iconAnchor: [18, 15],
            });
          }

          marker = L.marker([v.lat, v.lng], { 
            icon: vIcon, 
            zIndexOffset: isSelected ? 1500 : 800 
          }).addTo(map);

          marker.on('click', () => {
            setSelectedVehicleCode(v.code);
            setSelectedConvoyId(v.id);
          });

          vehicleMarkersRef.current.set(v.code, marker);
        } else {
          // Update position smoothly
          marker.setLatLng([v.lat, v.lng]);

          // Update heading transform and speed text
          const markerEl = marker.getElement();
          if (markerEl) {
            const puck = markerEl.querySelector('.moving-truck-heading-puck') as HTMLElement | null;
            if (puck) {
              puck.style.transform = `scaleX(${v.isHeadingEast ? -1 : 1})`;
            }
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [simSpeed, selectedVehicleCode, selectedConvoyId, setSelectedConvoyId]);

  // Re-render markers when selectedVehicleCode changes so active callout bubble attaches to the new vehicle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    vehicleMarkersRef.current.forEach((m) => m.remove());
    vehicleMarkersRef.current.clear();
  }, [selectedVehicleCode]);

  return (
    <div className="flex-1 w-full h-[calc(100vh-60px)] flex flex-col bg-[#F4F7FB] overflow-hidden select-none text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR                                                         */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBackToFleet?.()}
            title="Back to Vehicle Fleet"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
              Fleet Map
            </h1>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
              Live location and movement of all vehicles across the North East
            </p>
          </div>
        </div>

        {/* Right Top Header Actions */}
        <div className="flex items-center gap-2">
          {/* Vehicles Count Dropdown */}
          <div className="relative hidden md:block">
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs">
              <option value="248">All Vehicles (248)</option>
              <option value="182">Moving (182)</option>
              <option value="14">Delayed (14)</option>
              <option value="52">Idle (52)</option>
            </select>
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset View</span>
          </button>

          {/* Layer Switches */}
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex items-center gap-0.5 shadow-xs">
            <button
              onClick={() => setActiveLayer('traffic')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeLayer === 'traffic' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Traffic
            </button>
            <button
              onClick={() => setActiveLayer('weather')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeLayer === 'weather' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Weather
            </button>
            <button
              onClick={() => setActiveLayer('terrain')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeLayer === 'terrain' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Terrain
            </button>
            <button
              onClick={() => setActiveLayer('risks')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeLayer === 'risks' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Risk Zones
            </button>
          </div>

          {/* Fit to Bounds Button */}
          <button
            onClick={handleResetView}
            title="Fit to Bounds"
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors shadow-xs cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-COLUMN LAYOUT (LEFT LIST + CENTER MAP + RIGHT DETAILS)          */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: VEHICLE SELECTOR LIST (COL SPAN 3)                         */}
        {/* ======================================================================= */}
        <div className="lg:col-span-3 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          
          {/* Search Box */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vehicle ID or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-slate-100 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('All')}
              className={`pb-2 transition-all relative cursor-pointer ${
                statusFilter === 'All' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All</span>
              {statusFilter === 'All' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('Moving')}
              className={`pb-2 transition-all relative cursor-pointer ${
                statusFilter === 'Moving' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Moving</span>
              {statusFilter === 'Moving' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('Delayed')}
              className={`pb-2 transition-all relative cursor-pointer ${
                statusFilter === 'Delayed' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Delayed</span>
              {statusFilter === 'Delayed' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('Idle')}
              className={`pb-2 transition-all relative cursor-pointer ${
                statusFilter === 'Idle' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Idle</span>
              {statusFilter === 'Idle' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          </div>

          {/* Scrollable Vehicle List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-50">
            {filteredVehicles.map((v) => {
              const isSelected = v.code === selectedVehicleCode || v.id === selectedConvoyId;
              const isMoving = v.movementStatus === 'Moving';
              const isDelayed = v.movementStatus === 'Delayed';

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleCode(v.code);
                    setSelectedConvoyId(v.id);
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-50/80 border-2 border-blue-500 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Truck icon badge container */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {v.code}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {v.currentRoute || 'Guwahati ➔ Itanagar'}
                      </div>
                    </div>
                  </div>

                  {/* Right Speed & Status */}
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-800">
                      {v.speedKmh} km/h
                    </div>
                    <div className="mt-0.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isMoving
                          ? 'bg-emerald-50 text-emerald-700'
                          : isDelayed
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${isMoving ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                        {v.movementStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ======================================================================= */}
        {/* CENTER COLUMN: LEAFLET MAP CANVAS (COL SPAN 6)                          */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 relative h-full bg-[#1E293B] overflow-hidden">
          
          {/* Leaflet Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

          {/* Bottom-Left Floating Legend matching screenshot */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-auto max-w-[280px]">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-xl text-slate-800 text-[10px]">
              <div className="font-extrabold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 text-xs">
                Map Legend
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                  <span>Start Point</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Vehicle (Moving)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white"></span>
                  <span>Destination</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Vehicle (Delayed)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 ring-1 ring-white"></span>
                  <span>Checkpoint / City</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Vehicle (Idle)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-blue-600 rounded-full"></span>
                  <span>Route (Completed)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Landslide Risk</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 border-b-2 border-dashed border-blue-400"></span>
                  <span>Route (Remaining)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🌧️</span>
                  <span>Heavy Rainfall</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span>⛔</span>
                  <span>Road Closure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🌊</span>
                  <span>Flood Prone Area</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Traffic Congestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1 bg-[#FDE047] text-[8px] font-black text-amber-900 rounded">NH</span>
                  <span>National Highway</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Right Zoom & Center Controls */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-0.5 flex flex-col items-center">
              <button
                onClick={() => mapInstanceRef.current?.zoomIn()}
                title="Zoom In"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => mapInstanceRef.current?.zoomOut()}
                title="Zoom Out"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-t border-slate-100 text-xs cursor-pointer"
              >
                -
              </button>
            </div>

            <button
              onClick={handleLocateActiveVehicle}
              title="Center on Selected Vehicle"
              className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              🎯
            </button>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: SELECTED VEHICLE & ROUTE TIMELINE (COL SPAN 3)            */}
        {/* ======================================================================= */}
        <div className="lg:col-span-3 bg-[#F8FAFC] border-l border-slate-200 flex flex-col h-full overflow-y-auto p-3.5 space-y-3">
          
          {/* Card 1: Selected Vehicle Details */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col gap-3">
            
            {/* Card Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-900">Selected Vehicle</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTelemetry?.movementStatus === 'Moving'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeTelemetry?.movementStatus === 'Delayed'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeTelemetry?.movementStatus || 'Moving'}
              </span>
            </div>

            {/* Truck Banner */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 font-display">
                  {activeTelemetry?.code || 'TRK-042'}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  ID: {activeTelemetry?.callsign || 'CONVOY-04'}
                </div>
              </div>
            </div>

            {/* Driver & Speed Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Driver</div>
                <div className="font-bold text-slate-900 text-xs">{activeTelemetry?.operator || 'Phurba Tsering'}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                  <Phone className="w-2.5 h-2.5" />
                  <span>{activeTelemetry?.driverContact || '+91 94022 19340'}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Current Speed</div>
                <div className="font-black text-slate-900 text-xs">{activeTelemetry?.speedKmh || 46} km/h</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Last Updated: 16 Sep 2026, 03:24 PM</div>
              </div>
            </div>

            {/* Route & Progress Bar */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1 mb-1.5">
                <span className="text-blue-600">📍</span>
                <span>{activeTelemetry?.currentRoute || 'Guwahati ➔ Itanagar'}</span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${liveProgressPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>{liveDistanceDone} km / {totalRouteKm} km</span>
                <span className="font-bold text-slate-700">{liveProgressPercent}%</span>
              </div>
            </div>

            {/* 2 Info Metric Boxes */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">Estimated Arrival</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">{activeTelemetry?.etaString || '5h 04m'}</div>
                <div className="text-[9px] text-slate-400 font-medium">ETA: {activeTelemetry?.etaTime || '08:28 PM'}</div>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-2 border border-slate-100">
                <div className="text-[9px] text-slate-400 font-semibold uppercase">Cargo Type</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">{activeTelemetry?.cargoCategory || 'ARCTIC-FUEL'}</div>
                <div className="text-[9px] text-slate-400 font-medium">{(activeTelemetry?.cargoWeightKg || 21000).toLocaleString()} kg</div>
              </div>
            </div>

            {/* Action Button: View Full Dashboard */}
            <button
              onClick={() => navigateToIndividualVehicle(activeTelemetry?.id || 'convoy-trk-042')}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
            >
              <span>View Full Dashboard</span>
              <span>→</span>
            </button>

          </div>

          {/* Card 2: Route Timeline */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col">
            <button
              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="text-xs font-extrabold text-slate-900">
                Route Timeline
              </div>
              <div className="text-slate-400 hover:text-slate-600">
                {isTimelineExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isTimelineExpanded && (
              <div className="mt-3.5 pl-1 space-y-3.5">
                {NER_ROUTE_SCHEDULE.map((milestone, idx) => {
                  const isLast = idx === NER_ROUTE_SCHEDULE.length - 1;
                  const isFirst = idx === 0;
                  const isCurrent = idx === 3; // Bhalukpong
                  const isPassed = idx < 3;

                  return (
                    <div key={milestone.id} className="relative flex items-start gap-2.5">
                      {!isLast && (
                        <div className="absolute left-[6px] top-[14px] bottom-[-14px] w-[2px] bg-slate-200"></div>
                      )}

                      {/* Icon dot */}
                      <div className={`relative z-10 w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCurrent
                          ? 'bg-blue-600 ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-emerald-500 ring-2 ring-emerald-100'
                          : 'bg-slate-300 ring-1 ring-slate-200'
                      }`}>
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                      </div>

                      {/* Step content */}
                      <div className="flex-1 flex items-start justify-between">
                        <div>
                          <div className={`text-xs ${isCurrent ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                            {milestone.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {isFirst ? 'Departed' : isCurrent ? 'Current Location' : isLast ? 'Destination' : 'Crossed'} · {milestone.time}
                          </div>
                        </div>

                        {/* Current badge */}
                        {isCurrent && (
                          <div className="bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 text-right">
                            <div className="text-[10px] font-black text-blue-700">{activeTelemetry?.speedKmh || 46} km/h</div>
                            <div className="text-[8px] font-bold text-emerald-600">On Schedule</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Hazard Details Modal */}
      <HazardDetailModal
        alertType={activeHazardAlert}
        onClose={() => setActiveHazardAlert(null)}
        onCenterMap={(coords) => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(coords, 9.2, { animate: true });
          }
        }}
      />

    </div>
  );
};
