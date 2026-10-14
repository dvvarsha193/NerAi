import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, RotateCcw, MapPin, AlertTriangle, CloudRain } from 'lucide-react';
import { NER_ROUTE_POLYLINE, NER_ROUTE_SCHEDULE } from '../../data/mockData';
import { CompletedDelivery } from './CompletedDeliveriesView';

interface CompletedJourneyMapProps {
  delivery: CompletedDelivery;
}

// Route mapping for each delivery destination
const ROUTE_COORDINATES: Record<string, [number, number][]> = {
  'Guwahati → Itanagar': NER_ROUTE_POLYLINE,
  'Tezpur → Bhalukpong': NER_ROUTE_POLYLINE.slice(22, 32),
  'Tezpur → Tawang': [
    [26.6528, 92.7926], // Tezpur
    [26.8300, 92.7400], // Balipara
    [27.0125, 92.6508], // Bhalukpong
    [27.1350, 92.5100], // Tenga
    [27.2800, 92.4200], // Bomdila
    [27.3500, 92.2400], // Dirang
    [27.5050, 92.0950], // Sela Pass
    [27.5400, 91.9500], // Jaswant Garh
    [27.5600, 91.8900], // Jang
    [27.5861, 91.8653], // Tawang
  ],
  'Dimapur → Kohima': [
    [25.9068, 93.7274], // Dimapur
    [25.8200, 93.8100], // Chumukedima
    [25.7500, 93.9200], // Medziphema
    [25.6751, 94.1086], // Kohima
  ],
  'Guwahati → Shillong': [
    [26.1445, 91.7362], // Guwahati
    [26.0100, 91.8500], // Burnihat
    [25.9000, 91.8800], // Nongpoh
    [25.6800, 91.9000], // Umiam
    [25.5788, 91.8933], // Shillong
  ],
  'Silchar → Aizawl': [
    [24.8333, 92.7789], // Silchar
    [24.5200, 92.7600], // Vairengte
    [24.2300, 92.6800], // Kolasib
    [23.7271, 92.7176], // Aizawl
  ],
  'Jorhat → Itanagar': [
    [26.7509, 94.2037], // Jorhat
    [26.9000, 94.1200], // Dergaon
    [27.0000, 93.8500], // Gohpur
    [27.0844, 93.6053], // Itanagar
  ],
  'Imphal → Dimapur': [
    [24.8170, 93.9368], // Imphal
    [25.0400, 93.9600], // Kangpokpi
    [25.2600, 94.0100], // Senapati
    [25.5200, 93.8700], // Maram
    [25.9068, 93.7274], // Dimapur
  ],
  'Guwahati → Tezpur': [
    [26.1445, 91.7362], // Guwahati
    [26.1500, 92.3500], // Jagiroad
    [26.3450, 92.6840], // Nagaon
    [26.6528, 92.7926], // Tezpur
  ],
  'Aizawl → Silchar': [
    [23.7271, 92.7176], // Aizawl
    [24.2300, 92.6800], // Kolasib
    [24.5200, 92.7600], // Vairengte
    [24.8333, 92.7789], // Silchar
  ],
};

export const CompletedJourneyMap: React.FC<CompletedJourneyMapProps> = ({ delivery }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const replayMarkerRef = useRef<L.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);

  const routePoints = ROUTE_COORDINATES[delivery.route] || NER_ROUTE_POLYLINE;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Initialize Leaflet map
    const startPoint = routePoints[0] || [26.1445, 91.7362];
    const endPoint = routePoints[routePoints.length - 1] || [27.0844, 93.6053];

    const map = L.map(mapContainerRef.current, {
      center: [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2],
      zoom: 8,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Google Maps Terrain Tile Layer (Matching Reference Screenshot)
    L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // Render State Regional Labels
    const stateLabels = [
      { text: 'ASSAM', coords: [26.35, 92.85] },
      { text: 'ARUNACHAL PRADESH', coords: [27.35, 93.20] },
      { text: 'MEGHALAYA', coords: [25.60, 91.80] },
    ];

    stateLabels.forEach((lbl) => {
      const labelIcon = L.divIcon({
        className: 'custom-state-label',
        html: `
          <div style="font-size: 11px; font-weight: 800; color: rgba(255, 255, 255, 0.7); letter-spacing: 2px; text-shadow: 0 1px 3px rgba(0,0,0,0.6); pointer-events: none; white-space: nowrap;">
            ${lbl.text}
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [60, 10],
      });
      L.marker(lbl.coords as [number, number], { icon: labelIcon, interactive: false }).addTo(map);
    });

    // 1. Background Route Glow
    L.polyline(routePoints, {
      color: '#1E40AF',
      weight: 8,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 2. Primary Route Polyline (Vibrant Blue Highway)
    L.polyline(routePoints, {
      color: '#2563EB',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 3. Start Marker (Origin)
    const originIcon = L.divIcon({
      className: 'custom-map-origin',
      html: `
        <div style="display: flex; items-align: center; gap: 4px; pointer-events: auto;">
          <div style="width: 20px; height: 20px; border-radius: 9999px; background-color: #10B981; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;">
            📍
          </div>
          <div style="background-color: rgba(15, 23, 42, 0.85); color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">
            ${delivery.origin}
          </div>
        </div>
      `,
      iconSize: [80, 24],
      iconAnchor: [10, 12],
    });
    L.marker(startPoint, { icon: originIcon }).addTo(map);

    // 4. End Marker (Destination)
    const destIcon = L.divIcon({
      className: 'custom-map-destination',
      html: `
        <div style="display: flex; items-align: center; gap: 4px; pointer-events: auto;">
          <div style="width: 22px; height: 22px; border-radius: 9999px; background-color: #E11D48; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;">
            📍
          </div>
          <div style="background-color: rgba(15, 23, 42, 0.9); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">
            ${delivery.destination}
          </div>
        </div>
      `,
      iconSize: [80, 24],
      iconAnchor: [11, 12],
    });
    L.marker(endPoint, { icon: destIcon }).addTo(map);

    // 5. Waypoints with Labels (Nagaon, Tezpur, Bhalukpong)
    if (delivery.route.includes('Itanagar')) {
      const waypoints = [
        { name: 'Nagaon', coords: [26.3450, 92.6840] },
        { name: 'Tezpur', coords: [26.6528, 92.7926] },
        { name: 'Bhalukpong', coords: [27.0125, 92.6508] },
      ];

      waypoints.forEach((wp) => {
        const wpIcon = L.divIcon({
          className: 'custom-map-waypoint',
          html: `
            <div style="background-color: rgba(15, 23, 42, 0.85); color: white; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.25); white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);">
              ${wp.name}
            </div>
          `,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        L.marker(wp.coords as [number, number], { icon: wpIcon }).addTo(map);
      });

      // 6. Hazard & Weather Badges matching screenshot
      // Heavy Rain Badge near Tezpur
      const rainIcon = L.divIcon({
        className: 'custom-map-rain-badge',
        html: `
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: #3B82F6; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white; animation: bounce 2s infinite;">
            🌧️
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([26.7200, 92.7500], { icon: rainIcon }).addTo(map);

      // Landslide Risk Badge near Bhalukpong
      const hazardIcon = L.divIcon({
        className: 'custom-map-hazard-badge',
        html: `
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: #F59E0B; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">
            ⚠️
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([26.9600, 92.6800], { icon: hazardIcon }).addTo(map);
    }

    // Fit map bounds to route with clean padding
    const bounds = L.latLngBounds(routePoints);
    map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 10,
    });

    // Handle container resize
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [delivery]);

  // Replay animation along route
  const handleReplayJourney = () => {
    if (!mapInstanceRef.current || routePoints.length === 0) return;

    setIsReplaying(true);
    setReplayProgress(0);

    const map = mapInstanceRef.current;

    // Create or reset replay truck marker
    if (!replayMarkerRef.current) {
      const truckIcon = L.divIcon({
        className: 'replay-truck-marker',
        html: `
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(37,99,235,0.5); border: 2.5px solid white;">
            🚚
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      replayMarkerRef.current = L.marker(routePoints[0], { icon: truckIcon, zIndexOffset: 1000 }).addTo(map);
    }

    let startTime: number | null = null;
    const durationMs = 4500; // 4.5s smooth replay

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setReplayProgress(progress);

      // Interpolate point along route
      const totalSegments = routePoints.length - 1;
      const currentSegmentIndex = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
      const segmentProgress = (progress * totalSegments) - currentSegmentIndex;

      const p1 = routePoints[currentSegmentIndex];
      const p2 = routePoints[currentSegmentIndex + 1];

      if (p1 && p2) {
        const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
        const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
        const currentLatLng = L.latLng(lat, lng);

        if (replayMarkerRef.current) {
          replayMarkerRef.current.setLatLng(currentLatLng);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsReplaying(false);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Action Controls */}
      <div className="absolute right-3 bottom-3 z-10 flex items-center gap-2">
        <button
          onClick={handleReplayJourney}
          disabled={isReplaying}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs disabled:opacity-75"
        >
          {isReplaying ? (
            <>
              <RotateCcw className="w-3 h-3 text-blue-400 animate-spin" />
              <span>Replaying ({Math.round(replayProgress * 100)}%)</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
              <span>Replay Journey</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
