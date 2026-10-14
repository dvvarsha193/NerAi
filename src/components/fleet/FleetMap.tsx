import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { NER_ROUTE_POLYLINE } from '../../data/mockData';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Maximize2, 
  Layers, 
  AlertTriangle, 
  CloudRain, 
  ShieldAlert, 
  Compass
} from 'lucide-react';

interface FleetMapProps {
  onVehicleClick?: (convoyId: string) => void;
}

export const FleetMap: React.FC<FleetMapProps> = ({ onVehicleClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const {
    convoys,
    selectedConvoyId,
    navigateToIndividualVehicle,
    setIsHazardInspectorOpen
  } = useTelemetryStore();

  const [activeLayer, setActiveLayer] = useState<'traffic' | 'weather' | 'terrain' | 'risks'>('terrain');
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map on North East corridor (Guwahati - Tezpur - Itanagar - Nagaland region)
    const map = L.map(mapContainerRef.current, {
      center: [26.60, 93.10],
      zoom: 7.3,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Base Google Maps Terrain Layer (Matching reference image)
    const tileUrl = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // 1. Regional State / Topographic Text Labels matching reference screenshot
    const regionalLabels: { name: string; pos: [number, number]; styleClass: string }[] = [
      { name: 'ASSAM', pos: [26.25, 92.90], styleClass: 'text-slate-500/80 font-black tracking-[0.25em] text-xs sm:text-sm select-none' },
      { name: 'MEGHALAYA', pos: [25.55, 91.80], styleClass: 'text-slate-500/75 font-black tracking-[0.2em] text-xs select-none' },
      { name: 'ARUNACHAL PRADESH', pos: [27.55, 93.80], styleClass: 'text-slate-600/90 font-black tracking-[0.25em] text-xs sm:text-sm select-none' },
      { name: 'NAGALAND', pos: [26.05, 94.40], styleClass: 'text-slate-500/70 font-black tracking-[0.2em] text-xs select-none' },
    ];

    regionalLabels.forEach((lbl) => {
      const lblIcon = L.divIcon({
        className: 'custom-fleet-region-label',
        html: `<div class="${lbl.styleClass} pointer-events-none whitespace-nowrap drop-shadow-sm">${lbl.name}</div>`,
        iconSize: [140, 20],
        iconAnchor: [70, 10],
      });
      L.marker(lbl.pos, { icon: lblIcon, interactive: false }).addTo(map);
    });

    // 2. Brahmaputra River Major Waterway Path
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
      weight: 6,
      opacity: 0.55,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 3. Thick Blue Main Corridor Route (Guwahati ➔ Itanagar)
    L.polyline(NER_ROUTE_POLYLINE, {
      color: '#93C5FD',
      weight: 8,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    L.polyline(NER_ROUTE_POLYLINE, {
      color: '#2563EB',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Secondary Arterial Routes (Dimapur, Imphal, Shillong, Jorhat, Dibrugarh)
    const feederRoutes: [number, number][][] = [
      [[26.345, 92.684], [25.90, 93.72], [25.67, 94.11]], // Nagaon -> Dimapur -> Kohima
      [[26.6528, 92.7926], [26.75, 94.22], [27.47, 94.91]], // Tezpur -> Jorhat -> Dibrugarh
      [[26.1445, 91.7362], [25.57, 91.89]], // Guwahati -> Shillong
    ];

    feederRoutes.forEach((route) => {
      L.polyline(route, {
        color: '#60A5FA',
        weight: 3,
        dashArray: '4, 6',
        opacity: 0.7,
      }).addTo(map);
    });

    // 4. City & Landmark Badges matching reference screenshot
    const cities: { name: string; pos: [number, number]; isMain?: boolean }[] = [
      { name: 'Guwahati', pos: [26.1445, 91.7362], isMain: true },
      { name: 'Shillong', pos: [25.57, 91.89] },
      { name: 'Nagaon', pos: [26.3450, 92.6840], isMain: true },
      { name: 'Tezpur', pos: [26.6528, 92.7926], isMain: true },
      { name: 'Bhalukpong', pos: [27.0125, 92.6508], isMain: true },
      { name: 'Itanagar', pos: [27.0844, 93.6053], isMain: true },
      { name: 'Ziro', pos: [27.53, 93.83] },
      { name: 'Tawang', pos: [27.58, 91.86] },
      { name: 'Jorhat', pos: [26.75, 94.22] },
      { name: 'Kohima', pos: [25.67, 94.11] },
      { name: 'Dibrugarh', pos: [27.47, 94.91] },
      { name: 'Dibang Valley', pos: [27.95, 94.85] },
    ];

    cities.forEach((city) => {
      const cityIcon = L.divIcon({
        className: 'custom-fleet-city-marker',
        html: `
          <div class="flex items-center gap-1 group cursor-pointer pointer-events-auto">
            <div class="w-2.5 h-2.5 rounded-full ${city.isMain ? 'bg-blue-600 ring-2 ring-white shadow-sm' : 'bg-slate-400 ring-1 ring-white'}"></div>
            <div class="px-1.5 py-0.5 rounded-md ${city.isMain ? 'bg-[#0F172A] text-white font-bold' : 'bg-white/90 text-slate-700 font-semibold'} text-[9px] shadow-sm border border-slate-200/50 whitespace-nowrap">
              ${city.name}
            </div>
          </div>
        `,
        iconSize: [80, 20],
        iconAnchor: [5, 10],
      });
      L.marker(city.pos, { icon: cityIcon }).addTo(map);
    });

    // 5. Hazard Overlay Icons matching reference screenshot
    const hazards: { icon: string; pos: [number, number]; title: string; bg: string; border: string }[] = [
      { icon: '⚠️', pos: [27.4200, 92.8000], title: 'Landslide Risk (Sela Pass)', bg: 'bg-rose-50', border: 'border-rose-500' },
      { icon: '⚠️', pos: [25.9200, 93.7500], title: 'Landslide Risk (NH-2 Dimapur)', bg: 'bg-rose-50', border: 'border-rose-500' },
      { icon: '🌧️', pos: [25.3000, 91.7000], title: 'Heavy Rain (Cherrapunji)', bg: 'bg-blue-50', border: 'border-blue-500' },
      { icon: '🌧️', pos: [27.0800, 92.6000], title: 'Heavy Rainfall (Bhalukpong)', bg: 'bg-blue-50', border: 'border-blue-500' },
      { icon: '⛔', pos: [24.8500, 93.9500], title: 'Road Closure (Imphal)', bg: 'bg-rose-50', border: 'border-rose-600' },
      { icon: '🌊', pos: [27.3500, 94.2000], title: 'Flood Alert (Subansiri)', bg: 'bg-cyan-50', border: 'border-cyan-500' },
    ];

    hazards.forEach((h) => {
      const hIcon = L.divIcon({
        className: 'custom-fleet-hazard-marker',
        html: `
          <div 
            class="w-7 h-7 rounded-full ${h.bg} border-2 ${h.border} flex items-center justify-center text-xs shadow-md ring-2 ring-slate-200/40 cursor-pointer hover:scale-110 transition-transform animate-pulse"
            title="${h.title}"
          >
            ${h.icon}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(h.pos, { icon: hIcon }).addTo(map);
      marker.on('click', () => {
        setIsHazardInspectorOpen(true);
      });
    });

    mapInstanceRef.current = map;

    // Handle smooth container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setIsHazardInspectorOpen]);

  // Render & update interactive vehicle markers on the fleet map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing vehicle markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    convoys.forEach((convoy) => {
      const isMoving = convoy.movementStatus === 'Moving';
      const isDelayed = convoy.movementStatus === 'Delayed';
      const isIdle = convoy.movementStatus === 'Idle' || convoy.movementStatus === 'Stopped';

      const statusColor = isMoving ? '#10B981' : isDelayed ? '#EF4444' : '#F59E0B';
      const statusBadgeBg = isMoving ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500' : 'bg-amber-500';

      const vIcon = L.divIcon({
        className: 'custom-fleet-convoy-marker',
        html: `
          <div class="relative group cursor-pointer pointer-events-auto flex flex-col items-center">
            <!-- Radar Ping for moving / delayed convoys -->
            ${isMoving ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/25 animate-ping"></div>` : ''}
            ${isDelayed ? `<div class="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping"></div>` : ''}

            <!-- 3D Truck Icon with Status Ring -->
            <div class="relative w-10 h-8 rounded-xl bg-white/95 border-2 shadow-lg flex items-center justify-center p-0.5 transition-all group-hover:scale-110 group-hover:shadow-xl" style="border-color: ${statusColor};">
              <img 
                src="/truck.png" 
                alt="Convoy" 
                class="w-full h-full object-contain pointer-events-none select-none -scale-x-100" 
              />
              <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusBadgeBg} ring-2 ring-white flex items-center justify-center">
                <span class="w-1 h-1 rounded-full bg-white"></span>
              </span>
            </div>
          </div>
        `,
        iconSize: [40, 32],
        iconAnchor: [20, 16],
      });

      const marker = L.marker(convoy.currentPosition, { icon: vIcon, zIndexOffset: isMoving ? 500 : 300 }).addTo(map);

      // Bind rich popup + click handler to navigate to the individual vehicle dashboard
      const popupHtml = `
        <div class="p-1 font-sans text-slate-800 select-none min-w-[200px]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <span class="font-extrabold text-xs text-slate-900">${convoy.vehicleNo || convoy.callsign}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${isMoving ? 'bg-emerald-50 text-emerald-700' : isDelayed ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}">
              ● ${convoy.movementStatus || 'Moving'}
            </span>
          </div>
          <div class="text-[11px] space-y-1 mb-2">
            <div class="text-slate-600"><strong>Driver:</strong> ${convoy.operator}</div>
            <div class="text-slate-600"><strong>Route:</strong> ${convoy.currentRoute || 'NH-13 Trans-Himalayan'}</div>
            <div class="text-slate-600"><strong>Speed:</strong> <span class="font-bold text-blue-600">${convoy.speedKmh} km/h</span></div>
            <div class="text-slate-600"><strong>Cargo:</strong> ${convoy.cargoCategory}</div>
          </div>
          <button 
            id="popup-btn-${convoy.id}" 
            class="w-full py-1.5 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
          >
            <span>View Vehicle Dashboard</span>
            <span>→</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -18] });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${convoy.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onVehicleClick) {
              onVehicleClick(convoy.id);
            } else {
              navigateToIndividualVehicle(convoy.id);
            }
          };
        }
      });

      marker.on('click', () => {
        // Direct click fallback or opens popup
      });

      markersRef.current.push(marker);
    });
  }, [convoys, navigateToIndividualVehicle, onVehicleClick]);

  return (
    <div className="relative w-full h-full min-h-[250px] sm:min-h-[265px] lg:min-h-[275px] rounded-xl overflow-hidden bg-[#E2E8F0] border border-slate-200/90 shadow-xs group select-none">
      
      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Map Header Strip Controls (Matching reference screenshot) */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-slate-200/90 p-0.5 flex items-center gap-0.5">
          <button
            onClick={() => setActiveLayer('traffic')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              activeLayer === 'traffic' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Traffic
          </button>

          <button
            onClick={() => setActiveLayer('weather')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              activeLayer === 'weather' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Weather
          </button>

          <button
            onClick={() => setActiveLayer('terrain')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              activeLayer === 'terrain' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Terrain
          </button>

          <button
            onClick={() => setActiveLayer('risks')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              activeLayer === 'risks' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Risks
          </button>
        </div>

        {/* Expand / Recenter */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([26.60, 93.10], 7.3);
            }
          }}
          title="Reset Map View"
          className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>

      {/* Floating Map Legend Card on Top-Left (Compact) */}
      {isLegendOpen && (
        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-auto max-w-[175px]">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2 shadow-lg text-slate-800">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-900">Map Legend</span>
              <button 
                onClick={() => setIsLegendOpen(false)}
                className="text-[9px] text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 text-[9px] font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span>Moving</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                <span>Delayed</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>Idle</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-600 rounded-full flex-shrink-0"></span>
                <span>Route</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 text-[10px] flex-shrink-0">⚠️</span>
                <span>Landslide</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-blue-500 text-[10px] flex-shrink-0">🌧️</span>
                <span>Rainfall</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 text-[10px] flex-shrink-0">⛔</span>
                <span>Closure</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-cyan-500 text-[10px] flex-shrink-0">🌊</span>
                <span>Flood</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle for Legend if closed */}
      {!isLegendOpen && (
        <button
          onClick={() => setIsLegendOpen(true)}
          className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-[9px] font-bold text-slate-700 hover:text-blue-600 transition-colors pointer-events-auto"
        >
          Legend
        </button>
      )}

      {/* Bottom-Right Zoom & Recenter Controls */}
      <div className="absolute bottom-2.5 right-2.5 z-20 flex flex-col gap-1 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-slate-200/90 p-0.5 flex flex-col items-center">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
            className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
            className="w-6 h-6 rounded flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-t border-slate-100"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([26.60, 93.10], 7.3, { animate: true });
            }
          }}
          title="Center on Fleet Corridor"
          className="w-6 h-6 rounded-lg bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors"
        >
          <Crosshair className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
