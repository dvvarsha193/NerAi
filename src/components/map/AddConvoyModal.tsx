import React, { useState } from 'react';
import { X, Truck, Send, Radio, Fuel, Thermometer } from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { CargoCategory } from '../../types';

export const AddConvoyModal: React.FC = () => {
  const { isAddVehicleModalOpen, setIsAddVehicleModalOpen, addConvoy, primaryCorridor, bypassCorridor } = useTelemetryStore();

  const [callsign, setCallsign] = useState('CONVOY-07 // OXYGEN-EMERGENCY');
  const [operator, setOperator] = useState('Havildar K. Sharma');
  const [radioFrequency, setRadioFrequency] = useState('VHF 142.850 MHz');
  const [vehicleClass, setVehicleClass] = useState('All-Terrain 4x4 Heavy Hauler');
  const [grossWeightKg, setGrossWeightKg] = useState(14500);
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('CRYOGENIC-OXYGEN');
  const [cargoManifest, setCargoManifest] = useState('High-Pressure Portable Oxygen Cylinders for Tawang ICU');
  const [currentKm, setCurrentKm] = useState(120);
  const [speedKmh, setSpeedKmh] = useState(42);
  const [routeId, setRouteId] = useState(primaryCorridor.id);

  if (!isAddVehicleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addConvoy({
      callsign,
      operator,
      radioFrequency,
      vehicleClass,
      grossWeightKg: Number(grossWeightKg),
      cargoCategory,
      cargoManifest,
      origin: 'Guwahati Logistics Depot',
      destination: 'Tawang Apex Hospital',
      status: 'ON-ROUTE',
      currentPosition: [26.6850, 92.3480],
      headingDeg: 320,
      speedKmh: Number(speedKmh),
      altitudeMeters: 55,
      fuelPercent: 94,
      routeId,
      currentKm: Number(currentKm),
      distanceToHazardKm: Math.max(0, 416 - Number(currentKm)),
      eta: '22:15 IST',
      progressPercent: Number(((Number(currentKm) / 485) * 100).toFixed(1)),
      lastSatelliteTick: '0.2s (NavIC L5 / Manual Injection)',
    });

    setIsAddVehicleModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-800 space-y-4 shadow-2xl border border-slate-100">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Register New Vehicle / Shipment
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Add active transport convoy onto the live NH-13 corridor
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddVehicleModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Convoy Callsign</label>
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Operator</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cargo Category</label>
              <select
                value={cargoCategory}
                onChange={(e) => setCargoCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="VACCINES-COLD-CHAIN">Vaccines (Cold Chain)</option>
                <option value="CRYOGENIC-OXYGEN">Cryogenic Medical Oxygen</option>
                <option value="RATIONS-DISASTER">Disaster Food Rations</option>
                <option value="SUB-ZERO-DIESEL">Sub-Zero Arctic Diesel</option>
                <option value="BRIDGE-COMPONENTS">Bailey Bridge Spans</option>
                <option value="COMM-GEAR">Satellite Comms Gear</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cargo Manifest Description</label>
            <input
              type="text"
              value={cargoManifest}
              onChange={(e) => setCargoManifest(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gross Wt (KG)</label>
              <input
                type="number"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Starting KM</label>
              <input
                type="number"
                min="0"
                max="485"
                value={currentKm}
                onChange={(e) => setCurrentKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Speed (KM/H)</label>
              <input
                type="number"
                value={speedKmh}
                onChange={(e) => setSpeedKmh(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddVehicleModalOpen(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/25 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Deploy Convoy</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
