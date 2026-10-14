import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Wifi, 
  WifiOff, 
  Database, 
  Send, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock,
  Radio,
  Camera,
  Layers
} from 'lucide-react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { soundEffects } from '../../services/soundEffects';

export const FieldTerminalView: React.FC = () => {
  const { 
    isOffline,
    pendingReports, 
    submitIncidentReport, 
    syncPendingReports, 
    isSyncing,
    loadPendingReports 
  } = useOfflineStore();

  const [hazardType, setHazardType] = useState<any>('Landslide');
  const [highway, setHighway] = useState('NH-13 Trans-Himalayan Highway');
  const [kilometerMark, setKilometerMark] = useState('KM 414.2 (Sela Pass Ascent Sector)');
  const [severity, setSeverity] = useState<any>('Impassable');
  const [reporterName, setReporterName] = useState('Subedar D. Dorjee (BRO 42 BRTF)');
  const [notes, setNotes] = useState('Debris breach across hairpin 12. Metamorphic boulder block estimated 140 cubic meters. Heavy dozer required.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPendingReports();
  }, [loadPendingReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await submitIncidentReport({
      hazardType,
      highway,
      kilometerMark,
      coordinates: [27.5050, 92.1050],
      severity,
      reporterName,
      notes,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-[#F4F7FB] px-4 sm:px-6 lg:px-8 py-6 select-none text-slate-800 space-y-6">
      <div className="max-w-[1720px] mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>HIGH-ALTITUDE CANYON OPERATING TERMINAL // FIELD INCIDENT DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Field Terminal & Incident Dispatch
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Satellite State Indicator */}
            <div className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
              <Wifi className="w-4 h-4" />
              <span>Active Satellite Link</span>
            </div>

            {pendingReports.length > 0 && (
              <button
                onClick={() => syncPendingReports()}
                disabled={isSyncing}
                className="px-4 py-2 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {pendingReports.length} Queued</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Incident Reporting Form + Edge Cache Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Incident Submission Form (7 cols) */}
          <div className="lg:col-span-7 saas-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Field Hazard Report
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Direct dispatch to NER-LOGIX central operations and tactical map
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                Direct Uplink Mode
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hazard Classification
                  </label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Landslide">Landslide / Boulder Block</option>
                    <option value="FlashFlood">Flash Flood / Mudflow</option>
                    <option value="Snowpack">Snowpack / Black Ice</option>
                    <option value="BridgeFailure">Bridge Structural Damage</option>
                    <option value="ConvoyBreakdown">Convoy Mechanical Stoppage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Passage Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Impassable">Road Impassable (Severed)</option>
                    <option value="SingleLaneOnly">Single Lane Caution</option>
                    <option value="HighClearanceOnly">4x4 High-Clearance Only</option>
                    <option value="Monitoring">Observation / Active Creep</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corridor Kilometre Mark
                  </label>
                  <input
                    type="text"
                    value={kilometerMark}
                    onChange={(e) => setKilometerMark(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reporting Officer / Unit
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tactical Observations & Clearing Requirement
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isOffline
                      ? 'Commit to Local IndexedDB Cache'
                      : 'Transmit Directly to Highway Operations'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Edge Persistence Store Queue (5 cols) */}
          <div className="lg:col-span-5 saas-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Local Edge Persistence Cache
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  {pendingReports.length} Buffered
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {pendingReports.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">IndexedDB Buffer Clear</p>
                    <p className="text-[11px] mt-1">All tactical field entries synced with satellite uplink</p>
                  </div>
                ) : (
                  pendingReports.map((report) => (
                    <div key={report.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{report.hazardType}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {report.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {report.kilometerMark}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {report.notes}
                      </div>
                      <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Reported by: {report.reporterName}</span>
                        <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                IndexedDB Store-and-Forward Engine active • Zero-loss guarantee
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
