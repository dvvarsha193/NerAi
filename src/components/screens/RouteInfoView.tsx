import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Calendar, 
  Truck, 
  Package, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  BarChart2, 
  Flag, 
  Sparkles, 
  AlertTriangle, 
  Eye, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Minus, 
  Crosshair, 
  Info, 
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelemetryStore } from '../../store/useTelemetryStore';

// Waypoints for Route Segments (Guwahati -> Jorabat -> Nongpoh -> Mawkdok -> Shillong)
const GUWAHATI_COORDS: [number, number] = [26.1445, 91.7362];
const JORABAT_COORDS: [number, number] = [26.0600, 91.8100];
const NONGPOH_COORDS: [number, number] = [25.9000, 91.8800];
const MAWKDOK_COORDS: [number, number] = [25.7400, 91.8600];
const UMIAM_COORDS: [number, number] = [25.6600, 91.8900];
const SHILLONG_COORDS: [number, number] = [25.5788, 91.8933];

// Colored Segment Polylines
const SEGMENT_LOW_RISK: [number, number][] = [
  GUWAHATI_COORDS,
  [26.1000, 91.7700],
  JORABAT_COORDS,
];

const SEGMENT_MOD_RISK: [number, number][] = [
  JORABAT_COORDS,
  [25.9800, 91.8600],
  NONGPOH_COORDS,
];

const SEGMENT_HIGH_RISK: [number, number][] = [
  NONGPOH_COORDS,
  [25.8200, 91.8700],
  MAWKDOK_COORDS,
];

const SEGMENT_FINAL: [number, number][] = [
  MAWKDOK_COORDS,
  UMIAM_COORDS,
  [25.6200, 91.8900],
  SHILLONG_COORDS,
];

const ALTERNATIVE_DASHED_ROUTE: [number, number][] = [
  JORABAT_COORDS,
  [25.9500, 91.7500],
  [25.8000, 91.7000],
  [25.6500, 91.7800],
  SHILLONG_COORDS,
];

export const RouteInfoView: React.FC = () => {
  const navigate = useNavigate();

  // Filter Form State
  const [fromLocation, setFromLocation] = useState('Guwahati, Assam');
  const [toLocation, setToLocation] = useState('Shillong, Meghalaya');
  const [departureDate, setDepartureDate] = useState('17 Oct 2024, 08:00 AM');
  const [selectedVehicle, setSelectedVehicle] = useState('NER-TRK-01');
  const [selectedCargo, setSelectedCargo] = useState('Electronics & Essentials');

  const [activeMapLayer, setActiveMapLayer] = useState<'map' | 'satellite'>('map');
  const [selectedRouteAlternative, setSelectedRouteAlternative] = useState<'primary' | 'safer' | 'faster'>('primary');

  // Map Container Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [25.86, 91.83],
        zoom: 10,
        minZoom: 8,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Google Terrain / Satellite Tile Layer
      const tileUrl = activeMapLayer === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

      L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // Regional Labels: ASSAM & MEGHALAYA
      const assamLabel = L.divIcon({
        className: 'custom-region-label',
        html: `<div style="font-size: 11px; font-weight: 800; color: rgba(100, 116, 139, 0.7); letter-spacing: 3px; pointer-events: none;">ASSAM</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10],
      });
      L.marker([26.10, 91.95], { icon: assamLabel, interactive: false }).addTo(map);

      const meghalayaLabel = L.divIcon({
        className: 'custom-region-label',
        html: `<div style="font-size: 11px; font-weight: 800; color: rgba(100, 116, 139, 0.7); letter-spacing: 3px; pointer-events: none;">MEGHALAYA</div>`,
        iconSize: [120, 20],
        iconAnchor: [60, 10],
      });
      L.marker([25.76, 91.56], { icon: meghalayaLabel, interactive: false }).addTo(map);

      // 1. Green Segment (Low Risk: Guwahati -> Jorabat)
      L.polyline(SEGMENT_LOW_RISK, {
        color: '#10B981',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 2. Orange Segment (Moderate Risk: Jorabat -> Nongpoh)
      L.polyline(SEGMENT_MOD_RISK, {
        color: '#F59E0B',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 3. Red Segment (High Risk / Landslide zone: Nongpoh -> Mawkdok)
      L.polyline(SEGMENT_HIGH_RISK, {
        color: '#EF4444',
        weight: 5.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 4. Final Segment (Mawkdok -> Shillong)
      L.polyline(SEGMENT_FINAL, {
        color: '#F59E0B',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 5. Alternative Route (Blue Dashed)
      L.polyline(ALTERNATIVE_DASHED_ROUTE, {
        color: '#2563EB',
        weight: 4.5,
        dashArray: '6,6',
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 6. Hazard Zone Translucent Circle (around Mawkdok)
      L.circle(MAWKDOK_COORDS, {
        radius: 4500,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.16,
        weight: 1.5,
        dashArray: '4,4',
      }).addTo(map);

      // Hazard Marker Badge
      const hazardIcon = L.divIcon({
        className: 'custom-landslide-marker',
        html: `
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: #EF4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); border: 2px solid white;">
            ⚠️
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker(MAWKDOK_COORDS, { icon: hazardIcon }).addTo(map);

      // 7. City / Waypoint Markers
      const createWaypointMarker = (name: string, coords: [number, number], color: string = '#2563EB', isStartOrDest: boolean = false) => {
        const icon = L.divIcon({
          className: 'custom-waypoint-pin',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: ${isStartOrDest ? '14px' : '10px'}; height: ${isStartOrDest ? '14px' : '10px'}; border-radius: 9999px; background-color: ${color}; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
              <div style="font-size: 9px; font-weight: 800; color: #0F172A; text-shadow: 0 1px 2px white; margin-top: 1px; white-space: nowrap;">${name}</div>
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, isStartOrDest ? 7 : 5],
        });
        L.marker(coords, { icon }).addTo(map);
      };

      createWaypointMarker('Guwahati', GUWAHATI_COORDS, '#10B981', true);
      createWaypointMarker('Jorabat', JORABAT_COORDS, '#2563EB');
      createWaypointMarker('Nongpoh', NONGPOH_COORDS, '#2563EB');
      createWaypointMarker('Mawkdok', MAWKDOK_COORDS, '#EF4444');
      createWaypointMarker('Umiam', UMIAM_COORDS, '#2563EB');
      createWaypointMarker('Shillong', SHILLONG_COORDS, '#EF4444', true);

      // 8. Rain Clouds 🌧️
      const rainPoints: [number, number][] = [
        [26.0400, 91.6800],
        [25.8800, 91.5400],
        [25.7000, 91.6400],
        [25.9200, 92.0600],
        [25.6400, 91.9600],
      ];

      rainPoints.forEach((coords) => {
        const rainIcon = L.divIcon({
          className: 'custom-map-rain-cloud',
          html: `<div style="font-size: 15px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); opacity: 0.88;">🌧️</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker(coords, { icon: rainIcon, interactive: false }).addTo(map);
      });

      // Fit Map Bounds
      map.fitBounds([
        [26.16, 91.68],
        [25.54, 92.00]
      ], { padding: [10, 10] });

    } catch (err) {
      console.error('Leaflet Map Init Error:', err);
    }

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch (e) {
          // ignore
        }
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [activeMapLayer, selectedRouteAlternative]);

  return (
    <div className="w-full min-h-full bg-[#F3F7FA] px-4 py-4 select-none text-slate-800 space-y-4">
      <div className="max-w-[1920px] mx-auto w-full space-y-4">
        
        {/* ========================================================================= */}
        {/* 1. TOP QUERY / FILTER BAR                                                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-center">
          
          {/* From */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From</div>
              <input 
                type="text" 
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>

          {/* To */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">To</div>
              <input 
                type="text" 
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Departure Date & Time */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Departure Date & Time</div>
              <input 
                type="text" 
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Vehicle (Optional) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <Truck className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vehicle (Optional)</div>
              <input 
                type="text" 
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Cargo (Optional) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cargo (Optional)</div>
              <input 
                type="text" 
                value={selectedCargo}
                onChange={(e) => setSelectedCargo(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button 
            onClick={() => navigate('/admin/ner-ai')}
            className="w-full h-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Analyse Route with NER AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        {/* ========================================================================= */}
        {/* 2. TOP METRIC CARDS STRIP (6 Metrics)                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* 1. Total Distance */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-display leading-tight">101 km</div>
              <div className="text-[11px] font-medium text-slate-400">Total Distance</div>
            </div>
          </div>

          {/* 2. Predicted Duration */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-display leading-tight">2 h 47 min</div>
              <div className="text-[11px] font-medium text-slate-400">Predicted Duration</div>
            </div>
          </div>

          {/* 3. Journey Risk */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-slate-900 font-display leading-tight">64 / 100</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200">
                  Moderate
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-400">Journey Risk</div>
            </div>
          </div>

          {/* 4. NER AI Confidence */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-display leading-tight">89%</div>
              <div className="text-[11px] font-medium text-slate-400">NER AI Confidence</div>
            </div>
          </div>

          {/* 5. Predicted Arrival */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 font-display leading-tight">10:47 AM</div>
              <div className="text-[11px] font-medium text-slate-400">Predicted Arrival</div>
            </div>
          </div>

          {/* 6. Recommended Departure */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 font-display leading-tight flex items-center gap-1">
                <span>07:10 – 07:40 AM</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] font-bold text-emerald-600 leading-tight">
                Could reduce risk by 32% and save ~32 min
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN BODY: 2 COLUMNS (Left 9 Cols, Right 3 Cols)                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT 9 COLUMNS CONTAINER                                                */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-3.5">
            
            {/* ROW 1: Route Overview Map (7 Cols) + NER AI Forecast (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              
              {/* CARD 1: Route Overview Map */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[460px]">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                    Route Overview
                  </h3>
                </div>

                <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 min-h-[380px]">
                  {/* Leaflet Map Canvas */}
                  <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

                  {/* Layer Switcher */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center bg-white/95 backdrop-blur-xs p-0.5 rounded-lg border border-slate-200 shadow-xs">
                    <button
                      onClick={() => setActiveMapLayer('map')}
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        activeMapLayer === 'map'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Map
                    </button>
                    <button
                      onClick={() => setActiveMapLayer('satellite')}
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        activeMapLayer === 'satellite'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>

                  {/* Cardinal Arrows */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 text-[9px] font-extrabold text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-0.2 rounded-full shadow-xs">
                    ↑ To Tezpur
                  </div>
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 text-[9px] font-extrabold text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-0.2 rounded-full shadow-xs">
                    ↓ To Silchar
                  </div>

                  {/* Floating Legend Box (Bottom Left) */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-xs space-y-1 text-[9px] font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 rounded bg-[#10B981]"></span>
                      <span>Low Risk (Safe)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 rounded bg-[#F59E0B]"></span>
                      <span>Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 rounded bg-[#EF4444]"></span>
                      <span>High Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 rounded bg-[#2563EB] border-b border-dashed"></span>
                      <span>Alternative Route</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                      <span>City / Waypoint</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🌧️</span>
                      <span>Weather Alert</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Landslide Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Vehicle (Start)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Destination</span>
                    </div>
                    <div className="pt-0.5 border-t border-slate-100 flex items-center gap-1 text-slate-400">
                      <span className="w-4 h-0.5 bg-slate-400 inline-block"></span>
                      <span>20 km</span>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="absolute right-2.5 bottom-2.5 z-10 flex flex-col gap-1">
                    <button 
                      onClick={() => mapInstanceRef.current?.setView([25.86, 91.83], 10)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => mapInstanceRef.current?.zoomIn()}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => mapInstanceRef.current?.zoomOut()}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>

              {/* CARD 2: NER AI Journey Forecast */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-black text-slate-900 tracking-tight font-display">
                      NER AI Journey Forecast
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 text-[9px] font-extrabold ml-auto">
                      AI
                    </span>
                  </div>

                  {/* Forecast Narrative */}
                  <p className="text-[11px] text-slate-600 leading-snug mt-2">
                    This journey is feasible, but elevated weather and terrain risk is expected between Nongpoh and Mawkdok approx. 1h 15m after departure.
                  </p>

                  {/* Key Predictions List */}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Key Predictions
                    </div>

                    <div className="space-y-1.5">
                      {/* Prediction 1: Heavy Rain */}
                      <div className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center text-xs">
                            🌧️
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-900">
                              Heavy Rain <span className="text-rose-600 font-extrabold text-[10px] ml-1">81% probability</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              09:10–09:50 AM • Near Nongpoh
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Prediction 2: Landslide Risk */}
                      <div className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/70 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-100/60 text-rose-700 flex items-center justify-center text-xs font-bold">
                            ⚠️
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-900">
                              Landslide Risk <span className="text-rose-600 font-extrabold text-[10px] ml-1">67% probability</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              09:35–10:15 AM • Nongpoh ➔ Mawkdok
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Prediction 3: Reduced Visibility */}
                      <div className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center text-xs">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-900">
                              Reduced Visibility <span className="text-rose-600 font-extrabold text-[10px] ml-1">58% probability</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              09:10–10:00 AM • Visibility ~2.6 km
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Prediction 4: Traffic Congestion */}
                      <div className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/70 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center text-xs">
                            <Car className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-900">
                              Traffic Congestion <span className="text-rose-600 font-extrabold text-[10px] ml-1">41% probability</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              10:20–10:40 AM • Shillong entry
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Assessment Callout */}
                <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-1.5 text-[10px] text-blue-900 leading-snug mt-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-blue-950">Overall Assessment: </span>
                    Moderate risk journey. Take necessary precautions and consider early departure.
                  </div>
                </div>
              </div>

            </div>

            {/* ROW 2: Journey Timeline (Predicted Conditions) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight font-display flex items-center gap-1.5">
                  <span>Journey Timeline</span>
                  <span className="text-slate-400 font-medium text-xs">(Predicted Conditions)</span>
                </h3>
              </div>

              {/* Connected Waypoint Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                
                {/* 1. Guwahati */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0"></span>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      <span className="text-slate-400 font-normal">08:00 AM</span> Guwahati
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-[10px]">
                    <div className="inline-block px-1.5 py-0.2 rounded bg-emerald-100/60 text-emerald-800 font-bold">
                      Normal
                    </div>
                    <div className="text-slate-600 font-medium">Traffic: Light</div>
                    <div className="text-slate-600 font-medium">Weather: Clear</div>
                  </div>
                </div>

                {/* 2. Jorabat */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0"></span>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      <span className="text-slate-400 font-normal">08:38 AM</span> Jorabat
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-[10px]">
                    <div className="inline-block px-1.5 py-0.2 rounded bg-emerald-100/60 text-emerald-800 font-bold">
                      Normal
                    </div>
                    <div className="text-slate-600 font-medium">Traffic: Light</div>
                    <div className="text-slate-600 font-medium">Weather: Clear</div>
                  </div>
                </div>

                {/* 3. Nongpoh */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100 flex-shrink-0"></span>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      <span className="text-slate-400 font-normal">09:15 AM</span> Nongpoh
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200 space-y-1 text-[10px]">
                    <div className="text-rose-600 font-bold flex items-center gap-1">
                      <span>🌧️ Heavy Rain</span>
                    </div>
                    <div className="text-amber-700 font-medium">👁️ Visibility ↓</div>
                    <div className="text-rose-600 font-medium">⚠️ Landslide Risk ↑</div>
                    <div className="text-rose-700 font-extrabold">Risk: 68</div>
                  </div>
                </div>

                {/* 4. Mawkdok */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100 flex-shrink-0"></span>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      <span className="text-slate-400 font-normal">09:52 AM</span> Mawkdok
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1 text-[10px]">
                    <div className="text-rose-700 font-bold flex items-center gap-1">
                      <span>⚠️ Landslide-prone</span>
                    </div>
                    <div className="text-rose-600 font-medium">🌧️ Heavy Rain</div>
                    <div className="text-amber-700 font-medium">🚧 Narrow Roads</div>
                    <div className="text-rose-700 font-extrabold">Risk: 82</div>
                  </div>
                </div>

                {/* 5. Shillong */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0"></span>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      <span className="text-slate-400 font-normal">10:47 AM</span> Shillong
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-1 text-[10px]">
                    <div className="text-emerald-700 font-bold">
                      🌧️ Light Rain
                    </div>
                    <div className="text-slate-600 font-medium">Traffic: Moderate</div>
                    <div className="text-emerald-700 font-extrabold">Risk: 32</div>
                  </div>
                </div>

              </div>
            </div>

            {/* ROW 3: Route Alternatives (5 Cols) + Detailed Segment Analysis (7 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              
              {/* CARD: Route Alternatives */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-start">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                    Route Alternatives
                  </h3>
                  <button 
                    onClick={() => navigate('/admin/reroute')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    View on Map →
                  </button>
                </div>

                <div className="space-y-2 mt-2.5">
                  
                  {/* 1. Primary Route */}
                  <div 
                    onClick={() => setSelectedRouteAlternative('primary')}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedRouteAlternative === 'primary'
                        ? 'border-blue-500 bg-blue-50/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Primary Route</span>
                      <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                        Current
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">101 km | 2 h 47 min</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                      <span>Risk: <strong className="text-amber-600">64 / 100</strong></span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[8.5px] font-bold border border-amber-200">Moderate</span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[9.5px] text-slate-600">
                      <li className="flex items-center gap-1 text-blue-600"><span>•</span> Shortest distance</li>
                      <li className="flex items-center gap-1 text-rose-600"><span>•</span> Passes through 2 high-risk segments</li>
                      <li className="flex items-center gap-1 text-slate-600"><span>•</span> Moderate traffic</li>
                    </ul>
                  </div>

                  {/* 2. Safer Route */}
                  <div 
                    onClick={() => setSelectedRouteAlternative('safer')}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedRouteAlternative === 'safer'
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Safer Route</span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-bold shadow-xs">
                        Recommended
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">116 km | 3 h 03 min</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                      <span>Risk: <strong className="text-emerald-600">29 / 100</strong></span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[8.5px] font-bold border border-emerald-200">Low</span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[9.5px] text-slate-600">
                      <li className="flex items-center gap-1 text-emerald-600"><span>•</span> Avoids high-risk landslide zone</li>
                      <li className="flex items-center gap-1 text-emerald-600"><span>•</span> Lower rainfall exposure</li>
                      <li className="flex items-center gap-1 text-emerald-600"><span>•</span> More stable road conditions</li>
                    </ul>
                  </div>

                  {/* 3. Faster Route */}
                  <div 
                    onClick={() => setSelectedRouteAlternative('faster')}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedRouteAlternative === 'faster'
                        ? 'border-rose-500 bg-rose-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Faster Route</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">96 km | 2 h 35 min</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                      <span>Risk: <strong className="text-rose-600">78 / 100</strong></span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 text-[8.5px] font-bold border border-rose-200">High</span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[9.5px] text-slate-600">
                      <li className="flex items-center gap-1 text-rose-600"><span>•</span> Slightly faster</li>
                      <li className="flex items-center gap-1 text-rose-600"><span>•</span> Higher landslide and weather risk</li>
                      <li className="flex items-center gap-1 text-rose-600"><span>•</span> Narrow mountain roads</li>
                    </ul>
                  </div>

                </div>
              </div>

              {/* CARD: Detailed Segment Analysis */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-start">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                    Detailed Segment Analysis
                  </h3>
                  <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                    View All Segments →
                  </button>
                </div>

                <div className="overflow-x-auto mt-1 flex-1">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400">
                        <th className="py-2">Segment</th>
                        <th className="py-2">Distance</th>
                        <th className="py-2">ETA</th>
                        <th className="py-2">Risk</th>
                        <th className="py-2">Key Conditions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Guwahati ➔ Jorabat</td>
                        <td className="py-2.5 text-slate-600">0 – 22 km</td>
                        <td className="py-2.5 text-slate-600">38 min</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                            Low
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">Clear, good road</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Jorabat ➔ Nongpoh</td>
                        <td className="py-2.5 text-slate-600">22 – 55 km</td>
                        <td className="py-2.5 text-slate-600">52 min</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[9px] border border-amber-200">
                            Moderate
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">Heavy rain, moderate visibility</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Nongpoh ➔ Mawkdok</td>
                        <td className="py-2.5 text-slate-600">55 – 76 km</td>
                        <td className="py-2.5 text-slate-600">44 min</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[9px] border border-rose-200">
                            High
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">Landslide risk, narrow roads</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Mawkdok ➔ Shillong</td>
                        <td className="py-2.5 text-slate-600">76 – 101 km</td>
                        <td className="py-2.5 text-slate-600">33 min</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                            Low
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">Light rain, moderate traffic</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT 3 COLUMNS: VERTICAL SIDEBAR                                       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
            
            {/* 1. Journey Readiness */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 tracking-tight font-display pb-2 border-b border-slate-100">
                  Journey Readiness
                </h3>

                {/* Gauge Semi-Circle Meter */}
                <div className="flex flex-col items-center justify-center my-2">
                  <div className="relative w-40 h-22 flex items-center justify-center">
                    <svg className="w-40 h-22 overflow-visible" viewBox="0 0 140 75">
                      {/* Background Arc */}
                      <path
                        d="M 15 68 A 55 55 0 0 1 125 68"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="7.5"
                        strokeLinecap="round"
                      />
                      {/* Filled Arc (74% of 172.79 arc length) */}
                      <path
                        d="M 15 68 A 55 55 0 0 1 125 68"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="7.5"
                        strokeLinecap="round"
                        strokeDasharray="172.79"
                        strokeDashoffset={172.79 * (1 - 0.74)}
                      />
                    </svg>
                    <div className="absolute top-7 flex flex-col items-center">
                      <span className="text-3xl font-black text-slate-900 font-display leading-tight">
                        74<span className="text-xs text-slate-400 font-bold ml-0.5">/100</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider mt-1.5">
                    PROCEED WITH CAUTION
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-1.5 text-[10.5px] pt-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Vehicle condition suitable</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Fuel sufficient for journey</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Destination accessible</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>No confirmed road closures</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Heavy rainfall predicted</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>2 high-risk terrain segments</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Connectivity may drop (~18 km)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Best Departure Time */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 tracking-tight font-display flex items-center gap-1">
                  <span>Best Departure Time</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </h3>
                <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                  View hourly forecast →
                </button>
              </div>

              {/* Mini Bar Chart */}
              <div className="flex items-end justify-between gap-1.5 h-20 pt-3">
                {/* 06:00 AM */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500">31</span>
                  <div className="w-full bg-emerald-300 rounded-t-sm h-[31%]"></div>
                  <span className="text-[8px] text-slate-400">06:00 AM</span>
                </div>
                {/* 07:00 AM - Recommended */}
                <div className="flex-1 flex flex-col items-center gap-1 relative">
                  <span className="absolute -top-3.5 text-[7.5px] font-extrabold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded whitespace-nowrap">
                    Recommended
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700">28</span>
                  <div className="w-full bg-emerald-500 rounded-t-sm h-[28%]"></div>
                  <span className="text-[8px] font-bold text-emerald-700">07:00 AM</span>
                </div>
                {/* 08:00 AM */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-600">64</span>
                  <div className="w-full bg-amber-400 rounded-t-sm h-[64%]"></div>
                  <span className="text-[8px] text-slate-400">08:00 AM</span>
                </div>
                {/* 09:00 AM */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-rose-600">78</span>
                  <div className="w-full bg-rose-400 rounded-t-sm h-[78%]"></div>
                  <span className="text-[8px] text-slate-400">09:00 AM</span>
                </div>
                {/* 10:00 AM - Peak */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-rose-700">82</span>
                  <div className="w-full bg-rose-500 rounded-t-sm h-[82%]"></div>
                  <span className="text-[8px] text-slate-400">10:00 AM</span>
                </div>
                {/* 11:00 AM */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-600">59</span>
                  <div className="w-full bg-amber-400 rounded-t-sm h-[59%]"></div>
                  <span className="text-[8px] text-slate-400">11:00 AM</span>
                </div>
              </div>

              <p className="text-[9.5px] text-slate-600 leading-snug pt-1">
                Depart between <strong className="text-slate-900">07:10 – 07:40 AM</strong> to avoid peak rainfall and reduce risk by <strong className="text-emerald-700">32%</strong>.
              </p>
            </div>

            {/* 3. Route Risk Breakdown */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-black text-slate-900 tracking-tight font-display">
                Route Risk Breakdown
              </h3>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Weather</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[72%]"></div>
                    </div>
                    <span className="font-extrabold text-rose-600 w-5 text-right">72</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Landslide Risk</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[78%]"></div>
                    </div>
                    <span className="font-extrabold text-rose-600 w-5 text-right">78</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Flood Risk</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[18%]"></div>
                    </div>
                    <span className="font-extrabold text-emerald-600 w-5 text-right">18</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Traffic</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[37%]"></div>
                    </div>
                    <span className="font-extrabold text-amber-600 w-5 text-right">37</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Terrain</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full w-[69%]"></div>
                    </div>
                    <span className="font-extrabold text-orange-600 w-5 text-right">69</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Road Conditions</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[42%]"></div>
                    </div>
                    <span className="font-extrabold text-amber-600 w-5 text-right">42</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Visibility</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full w-[58%]"></div>
                    </div>
                    <span className="font-extrabold text-orange-600 w-5 text-right">58</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Connectivity</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-auto">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[34%]"></div>
                    </div>
                    <span className="font-extrabold text-emerald-600 w-5 text-right">34</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
