import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  Send,
  History,
  CheckCircle2,
  Trash2,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  RotateCcw,
  Timer
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useOfflineStore } from '../../store/useOfflineStore';

export const SimulationDashboardView: React.FC = () => {
  const { convoys, simulationHistory, runSimulation, resetSimulation } = useTelemetryStore();
  const { setToast } = useOfflineStore();

  const [selectedVehicle, setSelectedVehicle] = useState('NER-TRK-01');
  const [incidentType, setIncidentType] = useState('Landslide');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Moderate' | 'Low'>('Critical');
  const [location, setLocation] = useState('NH-6 Near Mawkdok, Meghalaya');
  const [duration, setDuration] = useState('3 Hours');
  const [details, setDetails] = useState('140 m³ metamorphic rockfall blocking primary carriageway.');
  const [isInjecting, setIsInjecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const incidentOptions = [
    'Landslide',
    'Flood',
    'Heavy Rainfall',
    'Traffic Congestion',
    'Road Blockage',
    'Accident',
    'Route Closure',
    'Vehicle Breakdown',
    'Low Visibility',
  ];

  const locationOptions = [
    'NH-6 Near Mawkdok, Meghalaya',
    'Sela Pass Corridor, Arunachal Pradesh',
    'NH-27 Jorabat Interchange, Assam',
    'NH-6 Nongpoh Mountain Slope, Meghalaya',
    'Silchar–Aizawl Canyon (NH-306)',
    'Kaliabor Bridge Approach (NH-27)',
  ];

  const durationOptions = [
    '45 Minutes',
    '1.5 Hours',
    '3 Hours',
    '6 Hours',
    '12 Hours',
    'Indefinite Blockage',
  ];

  const handleInjectIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);

    try {
      await runSimulation({
        vehicleId: selectedVehicle,
        incidentType,
        severity,
        location,
        duration,
        details: details || `${incidentType} (${severity}) simulated at ${location}. Expected duration: ${duration}.`,
      });

      setToast(
        '⚡ Simulation Triggered',
        `${incidentType} dispatched! Affected corridor flagged on Rerouting Console.`,
        'warning'
      );
    } catch (err) {
      console.error('[Simulation] Injection error:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleResetSimulation = async () => {
    setIsResetting(true);
    try {
      await resetSimulation();
      setToast(
        '↺ Simulation Reset',
        'Routes and vehicles restored to clean baseline state.',
        'success'
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ========================================================================= */}
      {/* 1. HEADER & INJECTION FORM                                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Stress-Testing & Disaster Simulation
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display mt-1">
              Inject Incident Scenario
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Simulate disruptions to immediately test the Rerouting Console, detect affected vehicles, and evaluate AI rerouting.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetSimulation}
            disabled={isResetting}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            title="Restore all routes and vehicles to original state"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Simulation'}</span>
          </button>
        </div>

        <form onSubmit={handleInjectIncident} className="space-y-5 text-xs">
          
          {/* Row 1: Vehicle & Incident Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Select Vehicle */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Target Vehicle / Route</span>
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {convoys.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.callsign || c.id} — {c.vehicleNo || 'NL-01-AB-4582'} ({c.origin} ➔ {c.destination})
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Incident */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Incident Type</span>
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {incidentOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Row 2: Severity, Route Location & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Select Severity */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Select Severity</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Critical', 'High', 'Moderate', 'Low'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      severity === sev
                        ? sev === 'Critical'
                          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                          : sev === 'High'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                          : 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Route Location */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Select Route Location</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Duration */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-purple-600" />
                <span>Disruption Duration</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {durationOptions.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Optional Details */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Optional Details / Simulation Parameters</label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific notes on debris volume, weather radar readings, or estimated clearance time..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <button
              type="submit"
              disabled={isInjecting}
              className="sm:col-span-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] text-white text-xs font-extrabold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isInjecting ? 'Simulating Incident & Propagating...' : 'Run Simulation (Affect Route in Reroute Console)'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetSimulation}
              disabled={isResetting}
              className="sm:col-span-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset State</span>
            </button>
          </div>

        </form>

      </div>

      {/* ========================================================================= */}
      {/* 2. SIMULATION HISTORY TABLE                                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
              Simulation History & Live Dispatch Status
            </h3>
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            {simulationHistory.length} Scenarios Logged
          </span>
        </div>

        {simulationHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No active simulated scenarios. Run a simulation above to test reroute triggers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400">
                  <th className="py-2.5">Sim ID</th>
                  <th className="py-2.5">Vehicle</th>
                  <th className="py-2.5">Incident</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Location</th>
                  <th className="py-2.5">Duration</th>
                  <th className="py-2.5">Details</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {simulationHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-purple-600">{h.id}</td>
                    <td className="py-3 font-bold text-slate-900">{h.vehicleId}</td>
                    <td className="py-3 font-semibold text-slate-800">{h.incidentType}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.severity === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : h.severity === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {h.severity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 truncate max-w-[160px]">{h.location}</td>
                    <td className="py-3 text-slate-500 font-semibold">{h.duration || '3 Hours'}</td>
                    <td className="py-3 text-slate-500 truncate max-w-[200px]" title={h.details}>{h.details}</td>
                    <td className="py-3 text-slate-400 font-medium">{h.timestamp}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[9.5px] border ${
                          h.status === 'REROUTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : h.status === 'REJECTED'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
                        }`}
                      >
                        {h.status === 'PROPAGATED' ? 'AWAITING REROUTE' : h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default SimulationDashboardView;

