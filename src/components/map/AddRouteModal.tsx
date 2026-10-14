import React, { useState } from 'react';
import { X, GitFork, Plus, Layers, Navigation } from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { HighwayCorridor } from '../../types';

export const AddRouteModal: React.FC = () => {
  const { isAddRouteModalOpen, setIsAddRouteModalOpen, addRoute } = useTelemetryStore();

  const [name, setName] = useState('Kameng River Low-Elevation Gorge Bypass');
  const [highwayCode, setHighwayCode] = useState('NH-13-BYPASS-02');
  const [distanceKm, setDistanceKm] = useState(498);
  const [apexAltitudeMeters, setApexAltitudeMeters] = useState(2600);
  const [description, setDescription] = useState('Low-altitude valley bypass running along lower Kameng river drainage gullies to bypass high snowline.');

  if (!isAddRouteModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRoute: HighwayCorridor = {
      id: `corridor-${Date.now()}`,
      name,
      highwayCode,
      totalDistanceKm: Number(distanceKm),
      apexAltitudeMeters: Number(apexAltitudeMeters),
      routeType: 'DYNAMIC_BYPASS',
      waypoints: [
        [26.1445, 91.7362], // Guwahati
        [26.4385, 92.0354],
        [26.6528, 92.7926], // Tezpur
        [27.0125, 92.6508], // Bhalukpong
        [27.1820, 92.4890],
        [27.2020, 92.4010], // Rupa
        [27.1500, 92.3000], // Custom Gorge Alignment
        [27.3200, 92.1800],
        [27.4850, 92.1150], // Sela Tunnel Portal
        [27.5680, 91.9820],
        [27.5861, 91.8654], // Tawang
      ],
      surveyedPoints: [],
      riskIndex: 14,
      color: '#10B981',
      description,
    };

    addRoute(newRoute);
    setIsAddRouteModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-800 space-y-4 shadow-2xl border border-slate-100">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Define Custom Bypass Route
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Register new vector onto the live GIS digital twin
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddRouteModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Route Corridor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Highway Reference Code</label>
              <input
                type="text"
                value={highwayCode}
                onChange={(e) => setHighwayCode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Distance (KM)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Apex Altitude (Meters MSL)</label>
            <input
              type="number"
              value={apexAltitudeMeters}
              onChange={(e) => setApexAltitudeMeters(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corridor Description & Alignment Rationale</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddRouteModalOpen(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Map Alternate Corridor</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
