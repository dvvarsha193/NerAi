import React from 'react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { Mountain, AlertTriangle, GitFork } from 'lucide-react';

export const CorridorElevationProfile: React.FC = () => {
  const { convoys, selectedConvoyId, setSelectedConvoyId } = useTelemetryStore();

  const profilePoints = [
    { km: 0, alt: 55, name: 'Guwahati (55m)' },
    { km: 68, alt: 52, name: 'Mangaldai (52m)' },
    { km: 118, alt: 50, name: 'Orang (50m)' },
    { km: 182, alt: 48, name: 'Tezpur (48m)' },
    { km: 242, alt: 210, name: 'Bhalukpong (210m)' },
    { km: 295, alt: 1450, name: 'Tenga (1,450m)' },
    { km: 332, alt: 2415, name: 'Bomdila (2,415m)' },
    { km: 374, alt: 1560, name: 'Dirang (1,560m)' },
    { km: 416, alt: 4170, name: 'Sela Apex (4,170m)' },
    { km: 448, alt: 2160, name: 'Jang (2,160m)' },
    { km: 485, alt: 3048, name: 'Tawang (3,048m)' },
  ];

  const bypassPoints = [
    { km: 332, alt: 2415 },
    { km: 345, alt: 2100 },
    { km: 365, alt: 1980 },
    { km: 388, alt: 2850 },
    { km: 412, alt: 1560 },
    { km: 432, alt: 3120 },
    { km: 448, alt: 2160 },
  ];

  const svgWidth = 840;
  const svgHeight = 110;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 15;
  const paddingBottom = 22;

  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const usableHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (km: number) => paddingLeft + (km / 485) * usableWidth;
  const getY = (alt: number) => paddingTop + usableHeight - (alt / 4500) * usableHeight;

  const primaryPathD = profilePoints.reduce((acc, pt, i) => {
    const x = getX(pt.km);
    const y = getY(pt.alt);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const primaryAreaD = `${primaryPathD} L ${getX(485)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  const bypassPathD = bypassPoints.reduce((acc, pt, i) => {
    const x = getX(pt.km);
    const y = getY(pt.alt);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="w-full saas-card p-4 bg-white text-slate-800 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-900">
            NH-13 Elevation Cross-Section Profile (Guwahati ⇄ Tawang)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#2563EB] rounded-full" />
            <span>NH-13 Primary Arterial (Apex 4,170m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#10B981] rounded-full" />
            <span>Mandala Bypass (-1,050m Altitude)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>KM 416 Landslide Breach</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pt-2">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[700px] select-none">
          <defs>
            <linearGradient id="primaryProfileGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="hazardAreaLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Elevation Horizontal Grid Guidelines */}
          {[1000, 2000, 3000, 4000].map((alt) => {
            const y = getY(alt);
            return (
              <g key={alt}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#F1F5F9" strokeDasharray="3 3" />
                <text x={paddingLeft - 6} y={y + 3} textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">
                  {alt}m
                </text>
              </g>
            );
          })}

          {/* Mountain Profile Filled Area */}
          <path d={primaryAreaD} fill="url(#primaryProfileGradientLight)" />

          {/* Primary Route Line */}
          <path d={primaryPathD} fill="none" stroke="#2563EB" strokeWidth="2.5" />

          {/* Bypass Route Line */}
          <path d={bypassPathD} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 3" />

          {/* Active Landslide Zone Callout at KM 416 */}
          <rect
            x={getX(414)}
            y={getY(4400)}
            width={getX(418) - getX(414) + 12}
            height={usableHeight + 10}
            fill="url(#hazardAreaLight)"
          />
          <line
            x1={getX(416)}
            y1={getY(4170)}
            x2={getX(416)}
            y2={getY(4400)}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle cx={getX(416)} cy={getY(4170)} r="4" fill="#EF4444" className="animate-pulse" />
          <text x={getX(416)} y={getY(4250)} fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="middle">
            ⚠️ KM 416 SEVERED
          </text>

          {/* Waypoint Altitude Tick Marks */}
          {profilePoints.map((pt, i) => {
            const x = getX(pt.km);
            const y = getY(pt.alt);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
                <text
                  x={x}
                  y={svgHeight - 6}
                  fill="#64748B"
                  fontSize="7.5"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {pt.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Real-time Convoy Altitude Marker Pips */}
          {convoys.map((convoy) => {
            const x = getX(convoy.currentKm);
            let estimatedAlt = 55;
            for (let i = 0; i < profilePoints.length - 1; i++) {
              if (convoy.currentKm >= profilePoints[i].km && convoy.currentKm <= profilePoints[i + 1].km) {
                const ratio = (convoy.currentKm - profilePoints[i].km) / (profilePoints[i + 1].km - profilePoints[i].km);
                estimatedAlt = profilePoints[i].alt + ratio * (profilePoints[i + 1].alt - profilePoints[i].alt);
                break;
              }
            }
            const y = getY(estimatedAlt);
            const isSelected = selectedConvoyId === convoy.id;

            return (
              <g
                key={convoy.id}
                onClick={() => setSelectedConvoyId(convoy.id)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle cx={x} cy={y} r="8" fill="#3B82F6" fillOpacity="0.25" className="animate-ping" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 5 : 3.5}
                  fill={convoy.status === 'DIVERTED' ? '#10B981' : isSelected ? '#2563EB' : '#1E293B'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
