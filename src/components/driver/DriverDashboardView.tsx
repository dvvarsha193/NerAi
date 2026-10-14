import React, { useState } from 'react';
import {
  Navigation,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  PhoneCall,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Radio,
  RefreshCw,
  Send,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useTelemetryStore } from '../../store/useTelemetryStore';

export const DriverDashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const { submitIncidentReport, setToast } = useOfflineStore();
  const { convoys, primaryCorridor, bypassCorridor } = useTelemetryStore();

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRouteDetailModal, setShowRouteDetailModal] = useState(false);

  // Dynamic driver vehicle from live telemetry
  const activeConvoy = convoys.find(
    (c) =>
      c.id === user?.assignedVehicle ||
      c.callsign.includes(user?.assignedVehicle || 'NER-TRK-01') ||
      c.operator.toLowerCase().includes((user?.name || '').toLowerCase())
  ) || convoys[0];

  const isRerouted = activeConvoy?.status === 'DIVERTED' || activeConvoy?.routeId === bypassCorridor.id;
  const progressPercent = activeConvoy?.progressPercent || 68;
  const currentSpeed = activeConvoy?.speedKmh || 58;
  const eta = isRerouted ? '11:42 AM' : (activeConvoy?.eta || '11:24 AM');
  const riskScore = isRerouted ? 24 : 87;

  // Incident report form state
  const [incidentType, setIncidentType] = useState('LANDSLIDE');
  const [incidentSeverity, setIncidentSeverity] = useState('HIGH');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const report = {
      convoyId: activeConvoy?.id || user?.assignedVehicle || 'NER-TRK-01',
      driverName: user?.name || 'Rohit Das',
      type: incidentType,
      hazardType: incidentType,
      severity: incidentSeverity,
      kmMark: 64.2,
      coordinates: [25.82, 91.87] as [number, number],
      highway: isRerouted ? 'NH-13B Bypass Corridor' : 'NH-13 Primary Corridor',
      notes: incidentNotes || 'Immediate carriageway obstruction encountered by driver.',
    };

    await submitIncidentReport(report);
    setIsSubmitting(false);
    setShowIncidentModal(false);
    setIncidentNotes('');
  };

  return (
    <div className="space-y-5">
      
      {/* ========================================================================= */}
      {/* 1. DRIVER WELCOME HEADER                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Active Freight Mission
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">
            Welcome, {user?.name || 'Rohit'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Assigned Vehicle: <strong className="text-slate-800">{activeConvoy?.callsign || user?.assignedVehicle || 'NER-TRK-01'}</strong> • Electronics & Essentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
            isRerouted
              ? 'bg-purple-50 border-purple-200 text-purple-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRerouted ? 'bg-purple-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span>{isRerouted ? 'Status: Rerouted via Bypass' : 'Status: In Transit (Primary)'}</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROMINENT ROUTE STATUS / REROUTED NOTIFICATION CARD                    */}
      {/* ========================================================================= */}
      <div className={`p-5 rounded-3xl text-white shadow-lg transition-all duration-300 space-y-3 ${
        isRerouted
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-600/20'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-blue-600/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-md backdrop-blur-xs text-[10px] font-black uppercase tracking-wider ${
              isRerouted ? 'bg-white/25 text-white' : 'bg-white/20 text-white'
            }`}>
              {isRerouted ? 'ROUTE REROUTED BY CONTROL CENTER' : 'STANDARD ACTIVE ROUTE'}
            </span>
            <span className="text-xs font-semibold text-blue-100">NER Master Dispatch</span>
          </div>
          <span className="text-xs font-bold text-blue-200">Live Satellite Uplink</span>
        </div>

        <p className="text-sm font-bold text-white leading-relaxed">
          {isRerouted
            ? '“Control Center has approved a dynamic bypass route (NH-13B) avoiding the Mawkdok landslide hazard sector. Proceed along Western Ridge diversion.”'
            : '“Operating on primary NH-13 corridor. Caution advised near KM 414 due to active rainfall creep.”'}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/20 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-blue-100 text-[11px] block">Standard ETA</span>
              <span className={`font-bold ${isRerouted ? 'line-through text-blue-200' : 'text-white'}`}>11:24 AM</span>
            </div>
            {isRerouted && (
              <>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
                <div>
                  <span className="text-emerald-100 text-[11px] font-bold block">Updated Safe ETA</span>
                  <span className="font-black text-white text-sm">11:42 AM</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowRouteDetailModal(true)}
            className="px-4 py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isRerouted ? 'View Bypass Details' : 'View Corridor Details'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CURRENT JOURNEY & NAVIGATION CARD                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        
        {/* Journey Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Current Corridor
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Guwahati ➔ Shillong
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">101 km Total</span>
        </div>

        {/* Progress Bar & Key Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Journey Progress</span>
            <span className="text-blue-600 text-sm font-black">68%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full w-[68%] transition-all"></div>
          </div>
        </div>

        {/* 4 Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="text-[10px] font-semibold text-slate-400">Estimated Arrival</div>
            <div className="text-base font-black text-slate-900 mt-0.5">11:42 AM</div>
            <div className="text-[9.5px] text-emerald-600 font-bold">On Schedule</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="text-[10px] font-semibold text-slate-400">Next Checkpoint</div>
            <div className="text-base font-black text-slate-900 mt-0.5">Nongpoh</div>
            <div className="text-[9.5px] text-blue-600 font-bold">14 km ahead</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="text-[10px] font-semibold text-slate-400">Current Speed</div>
            <div className="text-base font-black text-slate-900 mt-0.5">58 km/h</div>
            <div className="text-[9.5px] text-slate-500">Speed Limit: 60</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="text-[10px] font-semibold text-slate-400">Route Risk Score</div>
            <div className="text-base font-black text-emerald-600 mt-0.5">24 / 100</div>
            <div className="text-[9.5px] text-emerald-700 font-bold">Low Risk (Safe)</div>
          </div>

        </div>

        {/* Large Primary Navigation Button */}
        <button
          onClick={() => setShowNavModal(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white text-base font-black transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Navigation className="w-5 h-5 stroke-[2.5]" />
          <span>Open Turn-by-Turn Navigation</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 4. DRIVER ALERTS SECTION                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
              Driver Route Alerts
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
            1 Active Weather Caution
          </span>
        </div>

        {/* Alert 1: Heavy Rain Ahead */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-xs">
            🌧️
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-amber-950">Heavy Rain Ahead</h4>
              <span className="text-[10px] text-slate-500">• 22 km ahead</span>
            </div>
            <p className="text-xs text-slate-600">
              Expected around: <strong className="text-slate-900">10:46 AM</strong>
            </p>
            <p className="text-xs font-bold text-amber-900 pt-0.5">
              Instruction: Reduce speed and follow route guidance. Keep headlights on.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DRIVER ACTIONS GRID (4 Simple Actions)                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Action 1: Open Navigation */}
        <button
          onClick={() => setShowNavModal(true)}
          className="p-4 rounded-2xl bg-white hover:bg-blue-50/60 border border-slate-200/80 shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
        >
          <Navigation className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-black text-slate-900">Open Navigation</div>
            <div className="text-[10px] text-slate-400">Live GPS & Map</div>
          </div>
        </button>

        {/* Action 2: Report Incident */}
        <button
          onClick={() => setShowIncidentModal(true)}
          className="p-4 rounded-2xl bg-white hover:bg-rose-50/60 border border-slate-200/80 shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-black text-slate-900">Report Incident</div>
            <div className="text-[10px] text-slate-400">Road Hazard / Obstruction</div>
          </div>
        </button>

        {/* Action 3: Contact Control Center */}
        <button
          onClick={() => setShowContactModal(true)}
          className="p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200/80 shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
        >
          <PhoneCall className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-black text-slate-900">Control Center</div>
            <div className="text-[10px] text-slate-400">Radio & Emergency Call</div>
          </div>
        </button>

        {/* Action 4: View Journey Details */}
        <button
          onClick={() => setShowRouteDetailModal(true)}
          className="p-4 rounded-2xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
        >
          <FileText className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-black text-slate-900">Journey Details</div>
            <div className="text-[10px] text-slate-400">Manifest & Checkpoints</div>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 6. MODALS & POPUPS                                                        */}
      {/* ========================================================================= */}
      
      {/* Incident Report Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">Report Road Incident</h3>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Incident Category</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="LANDSLIDE">Rockfall / Landslide</option>
                  <option value="FLOOD">Flash Flooding / Waterlogging</option>
                  <option value="ROAD_CLOSURE">Road Work / Blocked Passage</option>
                  <option value="ACCIDENT">Traffic Accident</option>
                  <option value="VEHICLE_BREAKDOWN">Mechanical Failure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setIncidentSeverity(sev)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        incidentSeverity === sev
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Field Notes / Details</label>
                <textarea
                  rows={3}
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder="Describe obstruction size, passage clearance..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 text-[11px] flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>GPS coordinates (25.82°N, 91.87°E) auto-attached via edge buffer.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Modal */}
      {showNavModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Turn-by-Turn GPS Navigation</h3>
              </div>
              <button
                onClick={() => setShowNavModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Next Instruction</div>
              <div className="text-lg font-black leading-tight">
                In 1.4 km, take the Umsning Bypass Interchange (Exit 4A)
              </div>
              <div className="text-xs text-slate-400">
                Speed: 58 km/h • Remaining: 32 km • Est. Arrival: 11:42 AM
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✅ Route verified clear of Sela/Mawkdok landslide hazard zone.
            </div>

            <button
              onClick={() => setShowNavModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-bold cursor-pointer"
            >
              Resume Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Contact Control Center Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Contact Control Center</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900">Guwahati Master Tactical Dispatch</div>
                <div className="text-slate-500">Frequency: VHF-142.85 MHz • Speed Dial: +91 361 289 4400</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900">Highway Emergency Patrol (NH-6)</div>
                <div className="text-slate-500">Toll Free: 1033 • Meghalaya Police Helpline: 112</div>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = 'tel:1033';
                setShowContactModal(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Control Center</span>
            </button>
          </div>
        </div>
      )}

      {/* Journey Details Modal */}
      {showRouteDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Journey Details</h3>
              </div>
              <button
                onClick={() => setShowRouteDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Cargo Manifest</span>
                <span className="font-bold text-slate-900">Electronics & Emergency Pharma</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Gross Weight</span>
                <span className="font-bold text-slate-900">14,200 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Fuel Level</span>
                <span className="font-bold text-emerald-600">84% (Sufficient)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Origin Depot</span>
                <span className="font-bold text-slate-900">Guwahati Central Logistics Hub</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Destination</span>
                <span className="font-bold text-slate-900">Shillong Main Distribution Center</span>
              </div>
            </div>

            <button
              onClick={() => setShowRouteDetailModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverDashboardView;
