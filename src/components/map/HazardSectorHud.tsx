import React from 'react';
import { X, AlertTriangle, CloudRain, Mountain, Activity, ShieldAlert, GitFork, Radio } from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

interface HazardSectorHudProps {
  onClose: () => void;
}

export const HazardSectorHud: React.FC<HazardSectorHudProps> = ({ onClose }) => {
  const { hazardSector, divertConvoy, convoys } = useTelemetryStore();

  const handleDivertAllPending = () => {
    convoys.forEach((c) => {
      if (c.status !== 'DIVERTED' && c.distanceToHazardKm > 0 && c.distanceToHazardKm < 180) {
        divertConvoy(c.id);
      }
    });
    onClose();
  };

  return (
    <div className="fixed sm:absolute top-16 right-4 sm:right-6 z-30 w-[400px] max-w-[calc(100vw-2rem)] rounded-3xl saas-card p-5 text-slate-800 shadow-2xl border border-rose-200 animate-in fade-in duration-200 bg-white">
      
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-wider text-rose-600 font-bold uppercase">
              GEOLOGICAL HAZARD SECTOR
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
              {hazardSector.status}
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900 mt-1">
            {hazardSector.name}
          </h2>

          <div className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Landslide Risk Score: {hazardSector.landslideRiskScore}% Critical</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Corridor Span & Elevation */}
      <div className="my-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1.5">
        <div className="flex justify-between text-slate-600">
          <span>Corridor Milestones:</span>
          <span className="text-rose-700 font-bold">KM {hazardSector.kmStart} – KM {hazardSector.kmEnd}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Slope Elevation Span:</span>
          <span className="text-slate-800 font-medium">3,400m ⟶ 4,170m Apex</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Cliff Slope Gradient:</span>
          <span className="text-rose-700 font-bold">{hazardSector.slopeAngleDeg}° Steep Metamorphic Face</span>
        </div>
      </div>

      {/* Real-time Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2.5 my-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase">INSAR SUBSIDENCE</div>
          <div className="text-sm font-bold text-rose-600 mt-0.5">
            {hazardSector.insarDisplacementMmHr} mm/hr
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase">PRECIPITATION</div>
          <div className="text-sm font-bold text-blue-600 mt-0.5">
            {hazardSector.rainfallMmHr} mm/hr
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed py-1">
        {hazardSector.description}
      </p>

      {/* Mass Evac / Divert Button */}
      <div className="pt-3 border-t border-slate-100">
        <button
          onClick={handleDivertAllPending}
          className="w-full py-2.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Execute Preemptive Reroute for Approaching Convoys</span>
        </button>
      </div>

    </div>
  );
};
