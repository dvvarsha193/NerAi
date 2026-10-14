import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { NER_ROUTE_POLYLINE, NER_ROUTE_SCHEDULE } from '../../data/mockData';
import { vehicleAnimationService } from '../../services/vehicleAnimationService';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Maximize2, 
  Minimize2
} from 'lucide-react';
import { HazardDetailModal, HazardAlertType } from './HazardDetailModal';

interface NerMapProps {
  isCompact?: boolean;
  onExpandClick?: () => void;
  isExpandedModal?: boolean;
  singleVehicleOnly?: boolean;
}

export const NerMap: React.FC<NerMapProps> = ({ 
  isCompact = false, 
  onExpandClick,
  isExpandedModal = false,
  singleVehicleOnly = false 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const {
    convoys,
    selectedConvoyId,
    navigateToIndividualVehicle,
    simSpeed,
    isFullGisExpanded,
    setIsFullGisExpanded,
    setVehicleProgress
  } = useTelemetryStore();

  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const [activeLayer, setActiveLayer] = useState<'terrain' | 'satellite' | 'roadmap'>('roadmap');
  const [activeHazardAlert, setActiveHazardAlert] = useState<HazardAlertType | null>(null);

  // Custom Zoom Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleLocateVehicle = () => {
    if (!mapInstanceRef.current) return;
    const targetId = selectedConvoyId || 'convoy-trk-042';
    const marker = vehicleMarkersRef.current.get(targetId) || Array.from(vehicleMarkersRef.current.values())[0];
    if (marker) {
      mapInstanceRef.current.setView(marker.getLatLng(), 10, { animate: true });
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

    const map = L.map(mapContainerRef.current, {
      center: isCompact ? [26.68, 92.75] : [26.68, 92.75],
      zoom: isExpandedModal ? 9 : isCompact ? 7.6 : 8.5,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Base Map Tiles: Exact Google Maps Terrain (Matching reference image) & Satellite
    let tileUrl = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'; // Google Terrain (Default)
    if (activeLayer === 'satellite') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Hybrid Satellite
    } else if (activeLayer === 'roadmap') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Google Roadmap
    }

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // 1. Render State / Regional Topographic Text Labels (ASSAM, MEGHALAYA, ARUNACHAL PRADESH)
    const regionalLabels: { name: string; pos: [number, number]; styleClass: string }[] = [
      { name: 'ASSAM', pos: [26.40, 93.10], styleClass: 'text-slate-500/80 font-black tracking-[0.25em] text-xs sm:text-sm' },
      { name: 'MEGHALAYA', pos: [25.65, 91.88], styleClass: 'text-slate-500/70 font-black tracking-[0.2em] text-xs' },
      { name: 'Shillong', pos: [25.57, 91.89], styleClass: 'text-slate-600 font-bold text-[10px]' },
      { name: 'ARUNACHAL PRADESH', pos: [27.45, 93.40], styleClass: 'text-slate-600/90 font-black tracking-[0.25em] text-xs sm:text-sm' },
      { name: 'Tawang', pos: [27.58, 91.86], styleClass: 'text-slate-600 font-semibold text-[10px]' },
      { name: 'Bomdila', pos: [27.26, 92.42], styleClass: 'text-slate-600 font-semibold text-[10px]' },
      { name: 'Ziro', pos: [27.53, 93.83], styleClass: 'text-slate-600 font-semibold text-[10px]' },
      { name: 'Golaghat', pos: [26.52, 93.97], styleClass: 'text-slate-600 font-semibold text-[10px]' },
      { name: 'Dibrugarh', pos: [27.47, 94.91], styleClass: 'text-slate-600 font-semibold text-[10px]' },
      { name: 'Tinsukia', pos: [27.50, 95.36], styleClass: 'text-slate-600 font-semibold text-[10px]' },
    ];

    regionalLabels.forEach((lbl) => {
      const lblIcon = L.divIcon({
        className: 'custom-region-label',
        html: `<div class="${lbl.styleClass} select-none pointer-events-none whitespace-nowrap">${lbl.name}</div>`,
        iconSize: [120, 20],
        iconAnchor: [60, 10],
      });
      L.marker(lbl.pos, { icon: lblIcon, interactive: false }).addTo(map);
    });

    // 2. Render Brahmaputra River Major Waterway Path
    const riverCoordinates: [number, number][] = [
      [26.14, 91.70],
      [26.25, 92.00],
      [26.35, 92.40],
      [26.58, 92.85],
      [26.70, 93.40],
      [26.90, 94.00],
      [27.40, 94.90],
    ];
    L.polyline(riverCoordinates, {
      color: '#93C5FD',
      weight: isCompact ? 5 : 7,
      opacity: 0.6,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 3. Render Thick Blue Route Polyline matching screenshot (#2563EB)
    // Glowing shadow route polyline
    L.polyline(NER_ROUTE_POLYLINE, {
      color: '#93C5FD',
      weight: isCompact ? 7 : 9,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Crisp vibrant blue main highway polyline
    L.polyline(NER_ROUTE_POLYLINE, {
      color: '#2563EB',
      weight: isCompact ? 4.5 : 5.5,
      opacity: 0.98,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 4. Highway Pill Badges on the road
    if (!isCompact) {
      // NH27 badge (near Nagaon)
      const nh27Icon = L.divIcon({
        className: 'nh-badge-nh27',
        html: `
          <div class="px-1.5 py-0.5 rounded bg-[#FDE047] border border-amber-400 text-[#713F12] text-[9px] font-black shadow-sm flex items-center gap-0.5">
            <span>NH27</span>
          </div>
        `,
        iconSize: [36, 16],
        iconAnchor: [18, 8],
      });
      L.marker([26.25, 92.53], { icon: nh27Icon, interactive: false }).addTo(map);

      // NH52 badge (near Bhalukpong)
      const nh52Icon = L.divIcon({
        className: 'nh-badge-nh52',
        html: `
          <div class="px-1.5 py-0.5 rounded bg-[#FDE047] border border-amber-400 text-[#713F12] text-[9px] font-black shadow-sm flex items-center gap-0.5">
            <span>NH52</span>
          </div>
        `,
        iconSize: [36, 16],
        iconAnchor: [18, 8],
      });
      L.marker([26.85, 92.73], { icon: nh52Icon, interactive: false }).addTo(map);
    }

    // 5. Green Starting Point Marker (Guwahati) with Dark Label Badge and ✈️ Airport
    const startPointIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div class="relative flex items-center pointer-events-auto cursor-pointer group">
          <div class="w-7 h-7 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-300/60 z-20">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>

          <div class="ml-1 px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-bold shadow-xl flex items-center gap-1 whitespace-nowrap z-20 border border-slate-700">
            <span>Guwahati</span>
          </div>

          ${!isCompact ? `
            <div class="absolute -bottom-4 left-1 w-4 h-4 rounded-full bg-[#2563EB] border border-white text-white flex items-center justify-center text-[8px] shadow-md z-20">
              ✈️
            </div>
          ` : ''}
        </div>
      `,
      iconSize: [110, 36],
      iconAnchor: [14, 18],
    });
    L.marker([26.1445, 91.7362], { icon: startPointIcon }).addTo(map);

    // 6. Red Destination Point Marker (Itanagar) with Dark Label Badge
    const destPointIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div class="relative flex items-center pointer-events-auto cursor-pointer group">
          <div class="w-7 h-7 rounded-full bg-[#EF4444] border-2 border-white flex items-center justify-center text-white shadow-lg ring-2 ring-rose-300/60 z-20">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>

          <div class="ml-1 px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-bold shadow-xl flex items-center gap-1 whitespace-nowrap z-20 border border-slate-700">
            <span>Itanagar</span>
          </div>
        </div>
      `,
      iconSize: [110, 36],
      iconAnchor: [14, 18],
    });
    L.marker([27.0844, 93.6053], { icon: destPointIcon }).addTo(map);

    // 7. Intermediate Landmark Cards (Nagaon, Tezpur, Bhalukpong) matching reference screenshot
    if (!isCompact) {
      // Nagaon
      const nagaonIcon = L.divIcon({
        className: 'custom-wp-nagaon',
        html: `
          <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group">
            <div class="px-2 py-1 bg-white rounded-xl border border-slate-200 shadow-md flex flex-col items-center mb-1">
              <span class="text-xs">🏛️</span>
              <span class="text-[8px] font-bold text-slate-700">Nagaon</span>
            </div>
            <div class="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[10px] font-bold shadow-md border border-slate-700 whitespace-nowrap">
              Nagaon
            </div>
          </div>
        `,
        iconSize: [56, 52],
        iconAnchor: [28, 44],
      });
      L.marker([26.3450, 92.6840], { icon: nagaonIcon }).addTo(map);

      // Tezpur
      const tezpurIcon = L.divIcon({
        className: 'custom-wp-tezpur',
        html: `
          <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group">
            <div class="px-2 py-1 bg-white rounded-xl border border-slate-200 shadow-md flex flex-col items-center mb-1">
              <span class="text-xs">🏛️</span>
              <span class="text-[8px] font-bold text-slate-700">Tezpur</span>
            </div>
            <div class="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[10px] font-bold shadow-md border border-slate-700 whitespace-nowrap">
              Tezpur
            </div>
          </div>
        `,
        iconSize: [56, 52],
        iconAnchor: [28, 44],
      });
      L.marker([26.6528, 92.7926], { icon: tezpurIcon }).addTo(map);

      // Bhalukpong
      const bhalukpongIcon = L.divIcon({
        className: 'custom-wp-bhalukpong',
        html: `
          <div class="relative flex flex-col items-center pointer-events-auto cursor-pointer group">
            <div class="px-2 py-1 bg-white rounded-xl border border-slate-200 shadow-md flex flex-col items-center mb-1">
              <span class="text-xs">🌲⛰️</span>
              <span class="text-[8px] font-bold text-slate-700">Bhalukpong</span>
            </div>
            <div class="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[10px] font-bold shadow-md border border-slate-700 whitespace-nowrap">
              Bhalukpong
            </div>
          </div>
        `,
        iconSize: [64, 52],
        iconAnchor: [32, 44],
      });
      L.marker([27.0125, 92.6508], { icon: bhalukpongIcon }).addTo(map);
    }

    // 8. Hazard Alert Small Yellow Signs (Landslide, Heavy Rainfall, Floods)
    const createYellowAlertSignIcon = (title: string) => {
      return L.divIcon({
        className: 'custom-yellow-alert-sign',
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

    // A. ⚠️ Landslide Alert (Small Yellow Alert Sign at [27.35, 92.45])
    L.circle([27.35, 92.45], {
      radius: isCompact ? 28000 : 35000,
      color: '#D97706',
      weight: 1.5,
      fillColor: '#F59E0B',
      fillOpacity: 0.25,
    }).addTo(map);

    const landslideMarker = L.marker([27.35, 92.45], { 
      icon: createYellowAlertSignIcon('Landslide Risk'),
      zIndexOffset: 1100 
    }).addTo(map);
    landslideMarker.on('click', () => {
      setActiveHazardAlert('landslide');
    });

    // B. ⚠️ Heavy Rainfall Alert (Small Yellow Alert Sign at [26.95, 92.10])
    L.circle([26.95, 92.10], {
      radius: isCompact ? 26000 : 32000,
      color: '#2563EB',
      weight: 1.5,
      fillColor: '#3B82F6',
      fillOpacity: 0.25,
    }).addTo(map);

    const rainMarker = L.marker([26.95, 92.10], { 
      icon: createYellowAlertSignIcon('Heavy Rainfall'),
      zIndexOffset: 1100 
    }).addTo(map);
    rainMarker.on('click', () => {
      setActiveHazardAlert('rainfall');
    });

    // C. ⚠️ Flood Alert (Small Yellow Alert Sign at [26.50, 93.18])
    L.circle([26.50, 93.18], {
      radius: isCompact ? 24000 : 28000,
      color: '#0284C7',
      weight: 1.5,
      fillColor: '#06B6D4',
      fillOpacity: 0.25,
    }).addTo(map);

    const floodMarker = L.marker([26.50, 93.18], { 
      icon: createYellowAlertSignIcon('Flood Alert'),
      zIndexOffset: 1100 
    }).addTo(map);
    floodMarker.on('click', () => {
      setActiveHazardAlert('floods');
    });

    // 9. Instantiate Initial Moving Markers (Single active vehicle or all fleet vehicles)
    const allTelemetries = vehicleAnimationService.getAllTelemetries();
    const targetVehicleId = selectedConvoyId || 'convoy-trk-042';
    const displayTelemetries = singleVehicleOnly
      ? allTelemetries.filter((v) => v.id === targetVehicleId)
      : allTelemetries;

    vehicleMarkersRef.current.clear();

    displayTelemetries.forEach((v) => {
      const isSelected = v.id === targetVehicleId;
      const isDelayed = v.movementStatus === 'Delayed';
      const isMoving = v.movementStatus === 'Moving';

      const vehicleIcon = L.divIcon({
        className: `custom-vehicle-marker-${v.id}`,
        html: `
          <div class="relative cursor-pointer pointer-events-auto group flex flex-col items-center">
            <!-- Animated Radar Glow Ring -->
            ${isMoving ? `<div class="absolute -inset-2.5 rounded-full bg-blue-500/25 animate-ping"></div>` : ''}
            ${isDelayed ? `<div class="absolute -inset-2.5 rounded-full bg-rose-500/35 animate-ping"></div>` : ''}

            <!-- 3D Realistic White Cargo Truck (Front Tires Leading in Direction of Travel) -->
            <div 
              class="moving-truck-heading-puck relative w-12 h-9 sm:w-13 sm:h-10 flex items-center justify-center transition-transform duration-200 ${isSelected ? 'ring-2 ring-blue-500 rounded-lg shadow-lg' : ''}"
              style="transform: scaleX(${v.isHeadingEast ? -1 : 1});"
            >
              <img 
                src="/truck.png" 
                alt="${v.callsign}" 
                class="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
              />
              <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isMoving ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500' : 'bg-amber-500'} ring-1 ring-white"></span>
            </div>
          </div>
        `,
        iconSize: [44, 34],
        iconAnchor: [22, 17],
      });

      const vMarker = L.marker([v.lat, v.lng], { 
        icon: vehicleIcon, 
        zIndexOffset: isSelected ? 1200 : isMoving ? 800 : 500 
      }).addTo(map);

      // Bind interactive navigation popup
      const popupHtml = `
        <div class="p-1 font-sans text-slate-800 select-none min-w-[200px]">
          <div class="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-100">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background-color: ${v.statusColor};"></span>
              <span class="font-extrabold text-xs text-slate-900">${v.vehicleNo}</span>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${isMoving ? 'bg-emerald-50 text-emerald-700' : isDelayed ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}">
              ${v.movementStatus}
            </span>
          </div>
          <div class="text-[11px] space-y-1 mb-2">
            <div class="text-slate-600"><strong>Driver:</strong> ${v.operator}</div>
            <div class="text-slate-600"><strong>Speed:</strong> <span class="font-bold text-blue-600">${v.speedKmh} km/h</span></div>
            <div class="text-slate-600"><strong>Route:</strong> ${v.currentRoute || 'NH-13 Trans-Himalayan'}</div>
            <div class="text-slate-600"><strong>Cargo:</strong> ${v.cargoCategory || 'General Freight'}</div>
          </div>
          <button 
            id="map-popup-nav-${v.id}" 
            class="w-full py-1.5 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Vehicle Dashboard</span>
            <span>→</span>
          </button>
        </div>
      `;

      vMarker.bindPopup(popupHtml, { closeButton: false, offset: [0, -20] });

      vMarker.on('popupopen', () => {
        const btn = document.getElementById(`map-popup-nav-${v.id}`);
        if (btn) {
          btn.onclick = () => {
            navigateToIndividualVehicle(v.id);
          };
        }
      });

      vehicleMarkersRef.current.set(v.id, vMarker);
    });

    // Handle map resize / container dimensions
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    mapInstanceRef.current = map;

    return () => {
      vehicleMarkersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeLayer, isCompact, isExpandedModal, selectedConvoyId, navigateToIndividualVehicle, singleVehicleOnly]);

  // Subscribe to Master Vehicle Animation Service
  useEffect(() => {
    vehicleAnimationService.setSimSpeed(simSpeed || 1);

    const unsubscribe = vehicleAnimationService.subscribe((telemetries, primary) => {
      const targetVehicleId = selectedConvoyId || 'convoy-trk-042';
      const activeTelemetries = singleVehicleOnly
        ? telemetries.filter((v) => v.id === targetVehicleId)
        : telemetries;

      // 1. Move vehicle marker(s) smoothly along coordinates
      activeTelemetries.forEach((telemetry) => {
        const marker = vehicleMarkersRef.current.get(telemetry.id);
        if (marker) {
          marker.setLatLng([telemetry.lat, telemetry.lng]);

          const markerEl = marker.getElement();
          if (markerEl) {
            const puckEl = markerEl.querySelector('.moving-truck-heading-puck') as HTMLElement | null;
            if (puckEl) {
              puckEl.style.transform = `scaleX(${telemetry.isHeadingEast ? -1 : 1})`;
            }
          }
        }
      });

      // 2. Synchronize store progress with primary vehicle for HUDs/metrics
      if (primary) {
        setVehicleProgress(primary.progress);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [simSpeed, setVehicleProgress, singleVehicleOnly, selectedConvoyId]);

  return (
    <div className="relative w-full h-full min-h-[220px] overflow-hidden select-none bg-[#E2E8F0] rounded-2xl group">
      
      {/* Map Leaflet Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing" 
      />

      {/* Top-Right Map Controls (+, -, Crosshair Locate, Expand) */}
      {!isCompact && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 p-1 flex flex-col items-center gap-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-t border-slate-100"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLocateVehicle}
            title="Center on Live Moving Vehicle"
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom-Left: Google Maps Status Badge with Interactive Layer Switcher */}
      {!isCompact && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2.5">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-800 leading-none">
                Google Maps
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 mt-1">
                <button
                  onClick={() => setActiveLayer('terrain')}
                  className={`px-1.5 py-0.5 rounded ${activeLayer === 'terrain' ? 'bg-blue-600 text-white font-bold' : 'hover:text-blue-600'}`}
                >
                  Terrain
                </button>
                <span>·</span>
                <button
                  onClick={() => setActiveLayer('roadmap')}
                  className={`px-1.5 py-0.5 rounded ${activeLayer === 'roadmap' ? 'bg-blue-600 text-white font-bold' : 'hover:text-blue-600'}`}
                >
                  Roadmap
                </button>
                <span>·</span>
                <button
                  onClick={() => setActiveLayer('satellite')}
                  className={`px-1.5 py-0.5 rounded ${activeLayer === 'satellite' ? 'bg-blue-600 text-white font-bold' : 'hover:text-blue-600'}`}
                >
                  Satellite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Right: Floating Complete Map Legend */}
      {!isCompact && isExpandedModal && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto hidden md:block">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl w-48">
            <div className="text-xs font-bold text-slate-900 mb-2 pb-1 border-b border-slate-100">
              Map Legend
            </div>

            <div className="space-y-1.5 text-[11px] font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 flex-shrink-0"></span>
                <span>Starting Point</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 flex-shrink-0"></span>
                <span>Destination</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 flex-shrink-0"></span>
                <span className="font-semibold text-blue-700">Vehicle (Live)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-blue-600 rounded-full flex-shrink-0"></span>
                <span>Route</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-white flex-shrink-0"></span>
                <span>Waypoint / City</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-1 bg-[#FDE047] text-[8px] font-extrabold text-amber-900 rounded flex-shrink-0">NH</span>
                <span>National Highway</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-rose-500 text-xs flex-shrink-0">⚠️</span>
                <span>Landslide Risk</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-blue-500 text-xs flex-shrink-0">🌧️</span>
                <span>Heavy Rainfall</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-cyan-500 text-xs flex-shrink-0">🌊</span>
                <span>Flood Prone Area</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 text-xs flex-shrink-0">🏛️</span>
                <span>Important City / Landmark</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hazard Intelligence Modal */}
      <HazardDetailModal
        alertType={activeHazardAlert}
        onClose={() => setActiveHazardAlert(null)}
        onCenterMap={(coords) => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(coords, isCompact ? 8.5 : 9.5, { animate: true });
          }
        }}
      />

    </div>
  );
};
