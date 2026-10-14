import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CloudRain, 
  Waves, 
  Radio, 
  Compass, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert,
  Wind,
  Gauge,
  Activity,
  MapPin,
  Clock,
  Eye,
  GitFork
} from 'lucide-react';

export type HazardAlertType = 'rainfall' | 'landslide' | 'floods';

interface HazardDetailModalProps {
  alertType: HazardAlertType | null;
  onClose: () => void;
  onCenterMap?: (coords: [number, number]) => void;
}

interface AlertData {
  id: string;
  type: HazardAlertType;
  icon: string;
  title: string;
  badge: string;
  badgeColor: string;
  sector: string;
  corridor: string;
  coords: [number, number];
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  description: string;
  metrics: { label: string; value: string; icon?: React.ReactNode; color?: string }[];
  advisory: string[];
  affectedConvoys: string[];
  broadcastChannel: string;
  lastUpdated: string;
}

const HAZARD_ALERTS_MAP: Record<HazardAlertType, AlertData> = {
  rainfall: {
    id: 'haz-rain-01',
    type: 'rainfall',
    icon: '🌧️',
    title: 'Heavy Rainfall & Severe Weather Storm',
    badge: 'Torrential Storm Warning',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    sector: 'Western Foothills / NH-13 Foothill Pass',
    corridor: 'KM 160 – KM 210 (Guwahati ➔ Bhalukpong Corridor)',
    coords: [26.95, 92.10],
    severity: 'HIGH',
    description: 'Doppler weather radar detects an active monsoon convective storm cell producing sustained precipitation of 78 mm/hr. Severe reduction in roadway visibility with pooling on asphalt.',
    metrics: [
      { label: 'Rainfall Intensity', value: '78 mm/hr', color: 'text-blue-600' },
      { label: 'Visibility Range', value: '< 65 meters', color: 'text-rose-600' },
      { label: 'Wind Gusts', value: '48 km/h (WSW)', color: 'text-slate-800' },
      { label: 'Surface Grip Index', value: '0.38 (Aquaplaning)', color: 'text-amber-600' },
    ],
    advisory: [
      'Engage mandatory 4-wheel drive and high-output fog lamps.',
      'Maintain minimum 50-meter vehicle headway distance.',
      'Limit convoy transit speed to maximum 25 km/h.',
      'Temporary shelter bay operational at KM 185 roadside depot.',
    ],
    affectedConvoys: ['TRK-017', 'TRK-042', 'TRK-091'],
    broadcastChannel: 'VHF 142.850 MHz (NER-WeatherRelay)',
    lastUpdated: '3 mins ago (IMD Radar Feed)',
  },
  landslide: {
    id: 'haz-landslide-01',
    type: 'landslide',
    icon: '⚠️',
    title: 'Active Landslide & Slope Subsidence Alert',
    badge: 'Critical Geological Risk',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    sector: 'Bomdila – Bhalukpong Mountain Sector',
    corridor: 'KM 254 – KM 282 (Trans-Himalayan Arterial NH-13)',
    coords: [27.35, 92.45],
    severity: 'CRITICAL',
    description: 'InSAR satellite interferometry indicates active slope shear displacement along a 42° metamorphic rock face. Soil saturation exceeds 94% following continuous rain, creating high hazard of rockfall.',
    metrics: [
      { label: 'Landslide Risk Score', value: '86% Critical', color: 'text-rose-600' },
      { label: 'InSAR Shift Rate', value: '14.2 mm/hr', color: 'text-rose-600' },
      { label: 'Soil Saturation', value: '94.5%', color: 'text-amber-600' },
      { label: 'Slope Gradient', value: '42° Metamorphic Face', color: 'text-slate-800' },
    ],
    advisory: [
      'Execute preemptive detour via Mandala-Shergaon bypass corridor.',
      'High danger zone active between milestone KM 262 and KM 274.',
      'Border Roads Organisation (BRO) earthmovers stationed at KM 255.',
      'Convoys carrying volatile hazardous cargo must hold at Bhalukpong checkpoint.',
    ],
    affectedConvoys: ['TRK-042', 'TRK-103', 'TRK-126'],
    broadcastChannel: 'VHF 142.920 MHz (BRO-Tactical)',
    lastUpdated: 'Just now (Geological Survey of India)',
  },
  floods: {
    id: 'haz-flood-01',
    type: 'floods',
    icon: '🌊',
    title: 'Flash Flood & River Inundation Warning',
    badge: 'Riverbank Inundation Alert',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    sector: 'Brahmaputra Floodplain & Nagaon Lowlands',
    corridor: 'KM 95 – KM 140 (Kaziranga-Nagaon Basin Arterial)',
    coords: [26.50, 93.18],
    severity: 'HIGH',
    description: 'Brahmaputra tributary water surge has breached secondary containment berms. Water level is +1.95m above high flood danger level with rapid current across lower causeways.',
    metrics: [
      { label: 'River Water Surge', value: '+1.95m (Over Danger Mark)', color: 'text-rose-600' },
      { label: 'Flow Velocity', value: '3.4 m/s (High Speed)', color: 'text-cyan-700' },
      { label: 'Submerged Stretch', value: '1.8 km Causeway', color: 'text-rose-600' },
      { label: 'Floodplain State', value: 'Active Silt Inundation', color: 'text-slate-800' },
    ],
    advisory: [
      'Heavy freight convoys (>15 ton) must divert to elevated embankment NH-715.',
      'Zero night transit permitted through low-lying culvert sections.',
      'State Disaster Response Force (SDRF) rescue boat relays on standby at Nagaon.',
      'Check axle clearance before attempting any shallow fording.',
    ],
    affectedConvoys: ['TRK-028', 'TRK-118', 'TRK-139'],
    broadcastChannel: 'VHF 142.450 MHz (SDRF-Emergency)',
    lastUpdated: '8 mins ago (Central Water Commission)',
  },
};

export const HazardDetailModal: React.FC<HazardDetailModalProps> = ({
  alertType,
  onClose,
  onCenterMap,
}) => {
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);

  if (!alertType) return null;
  const alert = HAZARD_ALERTS_MAP[alertType];
  if (!alert) return null;

  const handleBroadcast = () => {
    setIsBroadcastSent(true);
    setTimeout(() => setIsBroadcastSent(false), 4000);
  };

  const handleLocateOnMap = () => {
    if (onCenterMap) {
      onCenterMap(alert.coords);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className={`p-4 sm:p-5 flex items-start justify-between border-b ${
          alert.severity === 'CRITICAL' 
            ? 'bg-amber-50/80 border-amber-100' 
            : alert.type === 'floods'
            ? 'bg-cyan-50/80 border-cyan-100'
            : 'bg-blue-50/80 border-blue-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl flex-shrink-0 border border-slate-200/80">
              {alert.icon}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${alert.badgeColor}`}>
                  {alert.badge}
                </span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{alert.lastUpdated}</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
                {alert.title}
              </h2>

              <div className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>{alert.sector}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Corridor Tag */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
            <span className="font-semibold text-slate-500">Affected Highway Sector:</span>
            <span className="font-extrabold text-slate-900">{alert.corridor}</span>
          </div>

          {/* Alert Situation Description */}
          <div className="text-xs text-slate-700 leading-relaxed bg-white rounded-xl p-3 border border-slate-100 shadow-xs">
            <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Situation Summary</span>
            </p>
            {alert.description}
          </div>

          {/* Real-time Telemetry Metrics Grid */}
          <div>
            <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              <span>Sensor & Radar Telemetry</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {alert.metrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {m.label}
                  </div>
                  <div className={`text-sm font-extrabold mt-0.5 ${m.color || 'text-slate-900'}`}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Advisory List */}
          <div>
            <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Tactical Driver & Fleet Advisory</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1.5">
              {alert.advisory.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></span>
                  <span className="font-medium">{adv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Approaching Fleet Vehicles */}
          <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-700">
                Approaching Convoys in Hazard Buffer:
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {alert.affectedConvoys.map((code) => (
                  <span key={code} className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-700 font-extrabold text-[10px] shadow-xs">
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-semibold text-slate-400">Emergency VHF Channel</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                <Radio className="w-3 h-3 text-blue-600" />
                <span>{alert.broadcastChannel.split(' ')[1] || '142.85 MHz'}</span>
              </div>
            </div>
          </div>

          {/* Broadcast Confirmation Banner */}
          {isBroadcastSent && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Hazard Advisory broadcasted to all active fleet radios on {alert.broadcastChannel}.</span>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={handleLocateOnMap}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Center on Map</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBroadcast}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Advisory</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
