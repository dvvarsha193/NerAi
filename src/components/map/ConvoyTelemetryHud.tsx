import React from 'react';
import { 
  X, 
  Truck, 
  Activity, 
  Thermometer, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  GitFork, 
  Gauge, 
  Fuel, 
  Layers,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Convoy } from '../../types';
import { useTelemetryStore } from '../../store/useTelemetryStore';

interface ConvoyTelemetryHudProps {
  convoy: Convoy;
  onClose: () => void;
}

export const ConvoyTelemetryHud: React.FC<ConvoyTelemetryHudProps> = ({ convoy, onClose }) => {
  const { divertConvoy } = useTelemetryStore();

  const isDiverted = convoy.status === 'DIVERTED';
  const isApproachingHazard = convoy.distanceToHazardKm > 0 && convoy.distanceToHazardKm <= 80;

  return (
    <div className="fixed sm:absolute top-16 right-4 sm:right-6 z-30 w-[400px] max-w-[calc(100vw-2rem)] rounded-3xl saas-card p-5 text-slate-800 shadow-2xl border border-slate-200 animate-in fade-in duration-200 bg-white">
      
      {/* Header Bar */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-wider text-blue-600 font-bold uppercase">
              VEHICLE TELEMETRY
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              isDiverted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isApproachingHazard
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {convoy.status}
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900 mt-1">
            {convoy.callsign}
          </h2>

          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Operator: {convoy.operator}</span>
            <span>•</span>
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <Radio className="w-3 h-3" /> {convoy.radioFrequency}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Cargo & Payload Detail */}
      <div className="py-3 border-b border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Cargo Category</span>
          <span className="font-bold text-blue-600">{convoy.cargoCategory}</span>
        </div>
        <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
          {convoy.cargoManifest}
        </div>
      </div>

      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-4 gap-2 my-3 text-center">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] text-slate-400 font-bold uppercase">CORRIDOR KM</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">KM {convoy.currentKm}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] text-slate-400 font-bold uppercase">ALTITUDE</div>
          <div className="text-sm font-bold text-blue-600 mt-0.5">{convoy.altitudeMeters}m</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] text-slate-400 font-bold uppercase">SPEED</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{convoy.speedKmh} km/h</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] text-slate-400 font-bold uppercase">FUEL TANK</div>
          <div className="text-sm font-bold text-emerald-600 mt-0.5">{convoy.fuelPercent}%</div>
        </div>
      </div>

      {/* Route & Hazard Proximity Warning */}
      <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">Proximity to Landslide Sector:</span>
          <span className={`font-bold ${
            isDiverted
              ? 'text-emerald-600'
              : convoy.distanceToHazardKm < 40
              ? 'text-rose-600 font-bold animate-pulse'
              : 'text-slate-800'
          }`}>
            {isDiverted ? 'Cleared via Bypass' : `${convoy.distanceToHazardKm} KM to Hazard`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Target Destination: {convoy.destination}</span>
          <span className="font-bold text-slate-800">ETA {convoy.eta}</span>
        </div>
      </div>

      {/* Dynamic Divert Button */}
      <div className="pt-3 flex items-center justify-between gap-2">
        {isDiverted ? (
          <div className="w-full py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Successfully Diverted onto Mandala Bypass</span>
          </div>
        ) : (
          <button
            onClick={() => divertConvoy(convoy.id)}
            className="w-full py-2.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Execute 1-Click Bypass Reroute</span>
          </button>
        )}
      </div>

    </div>
  );
};
