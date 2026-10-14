import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CloudRain, 
  Waves, 
  Truck, 
  GitFork, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Calendar, 
  Eye, 
  Radio, 
  SlidersHorizontal,
  Thermometer,
  Navigation,
  Construction,
  Ban,
  Wind,
  Layers,
  Sparkles,
  RefreshCw,
  Compass
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

export interface AlertItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  type: 'Natural' | 'Weather' | 'Road' | 'Infrastructure' | 'Cargo' | 'Vehicle';
  location: string;
  state: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedVehiclesCount: number;
  affectedVehiclesCodes: string;
  impact: string;
  time: string;
  status: 'Active' | 'Monitoring' | 'Investigating' | 'Resolved';
  icon: string;
  iconBg: string;
  iconColor: string;
  // Detail sidebar metadata
  reportedTime: string;
  lastUpdated: string;
  aiSummary: string;
  riskScore: number;
  confidencePercent: number;
  estimatedDelay: string;
  distanceFromNearest: string;
  nearestVehicle: string;
  whyAlertReasons: string[];
  affectedVehiclesList: {
    code: string;
    distance: string;
    eta: string;
    isUrgent?: boolean;
  }[];
  recommendedReroute: {
    title: string;
    extraKm: string;
    extraMin: string;
    riskReduction: string;
  };
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    code: 'LANDSLIDE-BHALUKPONG',
    title: 'Landslide Risk',
    subtitle: 'High probability (AI)',
    type: 'Natural',
    location: 'NH-13 near Bhalukpong',
    state: 'Arunachal Pradesh',
    severity: 'Critical',
    affectedVehiclesCount: 3,
    affectedVehiclesCodes: 'TRK-042, TRK-091 +1',
    impact: '+1h 20m',
    time: '12 min ago',
    status: 'Active',
    icon: '⚠️',
    iconBg: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
    reportedTime: '12 min ago',
    lastUpdated: '5 min ago',
    aiSummary: 'High probability of landslide in next 6 hours due to heavy rainfall and unstable terrain.',
    riskScore: 91,
    confidencePercent: 86,
    estimatedDelay: '+1h 20m',
    distanceFromNearest: '18 km (TRK-042)',
    nearestVehicle: 'TRK-042',
    whyAlertReasons: [
      'Heavy rainfall (74 mm in last 6 hours)',
      'High landslide susceptibility (terrain analysis)',
      'Historical incident data in this region',
      'TRK-042 will reach the zone in ~24 minutes',
    ],
    affectedVehiclesList: [
      { code: 'TRK-042', distance: '18 km away', eta: '24 min', isUrgent: true },
      { code: 'TRK-091', distance: '42 km away', eta: '1h 05m' },
      { code: 'TRK-139', distance: '67 km away', eta: '1h 40m' },
    ],
    recommendedReroute: {
      title: 'Reroute via Tezpur – Bomdila corridor',
      extraKm: '+31 km',
      extraMin: '+22 min',
      riskReduction: 'Risk 63% ↓',
    },
  },
  {
    id: 'alt-02',
    code: 'RAIN-CHERRA',
    title: 'Heavy Rainfall Forecast',
    subtitle: 'Next 6 hours',
    type: 'Weather',
    location: 'Cherrapunji route (NH-6)',
    state: 'Meghalaya',
    severity: 'High',
    affectedVehiclesCount: 5,
    affectedVehiclesCodes: 'TRK-117, TRK-126 +3',
    impact: '+50 min',
    time: '28 min ago',
    status: 'Active',
    icon: '🌧️',
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    reportedTime: '28 min ago',
    lastUpdated: '10 min ago',
    aiSummary: 'Continuous monsoon precipitation detected. Surface hydroplaning risk index high on mountain hairpin turns.',
    riskScore: 78,
    confidencePercent: 92,
    estimatedDelay: '+50 min',
    distanceFromNearest: '24 km (TRK-117)',
    nearestVehicle: 'TRK-117',
    whyAlertReasons: [
      'Doppler radar confirms heavy cloudburst formation',
      'Roadway visibility reduced to below 70 meters',
      'Speed limit automatically restricted to 30 km/h',
    ],
    affectedVehiclesList: [
      { code: 'TRK-117', distance: '24 km away', eta: '45 min', isUrgent: true },
      { code: 'TRK-126', distance: '55 km away', eta: '1h 20m' },
      { code: 'TRK-017', distance: '82 km away', eta: '2h 10m' },
    ],
    recommendedReroute: {
      title: 'Hold at Shillong Transit Hub until storm passes',
      extraKm: '+0 km',
      extraMin: '+45 min',
      riskReduction: 'Risk 80% ↓',
    },
  },
  {
    id: 'alt-03',
    code: 'ROAD-CLOSURE-IMPHAL',
    title: 'Road Closure',
    subtitle: 'Due to accident',
    type: 'Road',
    location: 'Imphal-Ukhrul stretch',
    state: 'Manipur',
    severity: 'High',
    affectedVehiclesCount: 2,
    affectedVehiclesCodes: 'TRK-028, TRK-103',
    impact: '+2h 10m',
    time: '1 hour ago',
    status: 'Active',
    icon: '🚫',
    iconBg: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
    reportedTime: '1 hour ago',
    lastUpdated: '15 min ago',
    aiSummary: 'Multi-vehicle blockage on single-lane mountain highway. Local traffic police clearing wreckage.',
    riskScore: 84,
    confidencePercent: 95,
    estimatedDelay: '+2h 10m',
    distanceFromNearest: '12 km (TRK-028)',
    nearestVehicle: 'TRK-028',
    whyAlertReasons: [
      'Police incident report #MN-8849 logged',
      'Both uphill and downhill lanes completely obstructed',
      'Cranes dispatched from Imphal depot',
    ],
    affectedVehiclesList: [
      { code: 'TRK-028', distance: '12 km away', eta: '20 min', isUrgent: true },
      { code: 'TRK-103', distance: '38 km away', eta: '1h 00m' },
    ],
    recommendedReroute: {
      title: 'Divert via Secondary Highway SH-10 bypass',
      extraKm: '+28 km',
      extraMin: '+35 min',
      riskReduction: 'Risk 95% ↓',
    },
  },
  {
    id: 'alt-04',
    code: 'FLOOD-SUBANSIRI',
    title: 'Flood Alert',
    subtitle: 'Rising water levels',
    type: 'Natural',
    location: 'Subansiri region',
    state: 'Arunachal Pradesh',
    severity: 'Medium',
    affectedVehiclesCount: 1,
    affectedVehiclesCodes: 'TRK-139',
    impact: '+1h 30m',
    time: '2 hours ago',
    status: 'Active',
    icon: '🌊',
    iconBg: 'bg-cyan-50 border-cyan-200',
    iconColor: 'text-cyan-700',
    reportedTime: '2 hours ago',
    lastUpdated: '20 min ago',
    aiSummary: 'River water level breached +1.5m above danger mark. Low-lying causeways submerged.',
    riskScore: 68,
    confidencePercent: 88,
    estimatedDelay: '+1h 30m',
    distanceFromNearest: '45 km (TRK-139)',
    nearestVehicle: 'TRK-139',
    whyAlertReasons: [
      'Central Water Commission flood bulletin active',
      'Subansiri lower bridge deck water clearance < 1.2m',
      'Heavy freight convoys advised to take elevated bridge route',
    ],
    affectedVehiclesList: [
      { code: 'TRK-139', distance: '45 km away', eta: '1h 15m' },
    ],
    recommendedReroute: {
      title: 'Reroute via Elevated NH-715 Embankment',
      extraKm: '+19 km',
      extraMin: '+25 min',
      riskReduction: 'Risk 70% ↓',
    },
  },
  {
    id: 'alt-05',
    code: 'TRAFFIC-GUWAHATI',
    title: 'Heavy Traffic',
    subtitle: 'Congestion detected',
    type: 'Road',
    location: 'Guwahati bypass (NH-27)',
    state: 'Assam',
    severity: 'Medium',
    affectedVehiclesCount: 4,
    affectedVehiclesCodes: 'TRK-042, TRK-091 +2',
    impact: '+45 min',
    time: '3 hours ago',
    status: 'Active',
    icon: '🚗',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-700',
    reportedTime: '3 hours ago',
    lastUpdated: '35 min ago',
    aiSummary: 'High volume freight bottleneck near Khanapara toll gate. Average speed reduced to 8 km/h.',
    riskScore: 62,
    confidencePercent: 90,
    estimatedDelay: '+45 min',
    distanceFromNearest: '8 km (TRK-042)',
    nearestVehicle: 'TRK-042',
    whyAlertReasons: [
      'Toll plaza optical sensor queue overflow',
      'Rush hour peak commercial transit window',
    ],
    affectedVehiclesList: [
      { code: 'TRK-042', distance: '8 km away', eta: '15 min' },
      { code: 'TRK-091', distance: '14 km away', eta: '30 min' },
    ],
    recommendedReroute: {
      title: 'Use VIP Ring Road Northern Bypass',
      extraKm: '+9 km',
      extraMin: '+8 min',
      riskReduction: 'Risk 55% ↓',
    },
  },
  {
    id: 'alt-06',
    code: 'BRIDGE-DIBANG',
    title: 'Bridge Inspection',
    subtitle: 'Restricted passage',
    type: 'Infrastructure',
    location: 'Dibang Valley',
    state: 'Arunachal Pradesh',
    severity: 'Low',
    affectedVehiclesCount: 0,
    affectedVehiclesCodes: '0 vehicles',
    impact: '-',
    time: '4 hours ago',
    status: 'Monitoring',
    icon: '🌉',
    iconBg: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600',
    reportedTime: '4 hours ago',
    lastUpdated: '1 hour ago',
    aiSummary: 'Scheduled structural beam ultrasound audit. Single-file slow transit permitted for light vehicles.',
    riskScore: 35,
    confidencePercent: 98,
    estimatedDelay: '-',
    distanceFromNearest: 'None in buffer zone',
    nearestVehicle: 'None',
    whyAlertReasons: [
      'Standard BRO bi-monthly safety certification',
      'No immediate bridge closure planned',
    ],
    affectedVehiclesList: [],
    recommendedReroute: {
      title: 'No detour required. Maintain posted 10 km/h limit.',
      extraKm: '+0 km',
      extraMin: '+0 min',
      riskReduction: 'Normal',
    },
  },
  {
    id: 'alt-07',
    code: 'CONST-TEZPUR',
    title: 'Road Construction',
    subtitle: 'Lane closure',
    type: 'Road',
    location: 'Tezpur–Nagaon (NH-15)',
    state: 'Assam',
    severity: 'Low',
    affectedVehiclesCount: 1,
    affectedVehiclesCodes: 'TRK-126',
    impact: '+25 min',
    time: '5 hours ago',
    status: 'Active',
    icon: '🚧',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    reportedTime: '5 hours ago',
    lastUpdated: '2 hours ago',
    aiSummary: 'Four-laning tarmac resurfacing work between KM 145 and 152. Flagged pilot vehicle operating.',
    riskScore: 40,
    confidencePercent: 95,
    estimatedDelay: '+25 min',
    distanceFromNearest: '32 km (TRK-126)',
    nearestVehicle: 'TRK-126',
    whyAlertReasons: [
      'National Highways & Infrastructure Development Corporation notice',
      'Temporary single lane shared traffic flow',
    ],
    affectedVehiclesList: [
      { code: 'TRK-126', distance: '32 km away', eta: '50 min' },
    ],
    recommendedReroute: {
      title: 'Continue on current corridor with reduced throttle',
      extraKm: '+0 km',
      extraMin: '+25 min',
      riskReduction: 'Safe',
    },
  },
  {
    id: 'alt-08',
    code: 'STORM-TAWANG',
    title: 'Storm Warning',
    subtitle: 'High wind alert',
    type: 'Weather',
    location: 'Tawang region',
    state: 'Arunachal Pradesh',
    severity: 'Medium',
    affectedVehiclesCount: 2,
    affectedVehiclesCodes: 'TRK-091, TRK-139',
    impact: '+1h 10m',
    time: '6 hours ago',
    status: 'Active',
    icon: '⛈️',
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    reportedTime: '6 hours ago',
    lastUpdated: '2 hours ago',
    aiSummary: 'Gale force alpine winds exceeding 65 km/h across Sela Pass high altitude ridgeline.',
    riskScore: 65,
    confidencePercent: 89,
    estimatedDelay: '+1h 10m',
    distanceFromNearest: '52 km (TRK-091)',
    nearestVehicle: 'TRK-091',
    whyAlertReasons: [
      'High-profile cargo bowzers at risk of crosswind buffeting',
      'Sub-zero windchill causing ice glaze on road',
    ],
    affectedVehiclesList: [
      { code: 'TRK-091', distance: '52 km away', eta: '1h 30m' },
      { code: 'TRK-139', distance: '85 km away', eta: '2h 45m' },
    ],
    recommendedReroute: {
      title: 'Hold at Dirang Base Camp until wind drops <40 km/h',
      extraKm: '+0 km',
      extraMin: '+1h 10m',
      riskReduction: 'Risk 75% ↓',
    },
  },
  {
    id: 'alt-09',
    code: 'TEMP-COLD-CHAIN',
    title: 'Temperature Deviation',
    subtitle: 'Cold chain risk',
    type: 'Cargo',
    location: 'En route to Itanagar',
    state: 'Arunachal Pradesh',
    severity: 'High',
    affectedVehiclesCount: 1,
    affectedVehiclesCodes: 'TRK-042',
    impact: '+40 min',
    time: '7 hours ago',
    status: 'Active',
    icon: '🌡️',
    iconBg: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
    reportedTime: '7 hours ago',
    lastUpdated: '45 min ago',
    aiSummary: 'Reefer compressor container temperature climbed from +4°C to +8.2°C. Perishable vaccine cargo alert.',
    riskScore: 79,
    confidencePercent: 96,
    estimatedDelay: '+40 min',
    distanceFromNearest: 'Live Telemetry (TRK-042)',
    nearestVehicle: 'TRK-042',
    whyAlertReasons: [
      'Auxiliary battery voltage dropped below 11.8V',
      'Driver notified via in-cab display to reset breaker',
    ],
    affectedVehiclesList: [
      { code: 'TRK-042', distance: '0 km (Self)', eta: 'Immediate', isUrgent: true },
    ],
    recommendedReroute: {
      title: 'Pull over at next authorized service bay (KM 215)',
      extraKm: '+0 km',
      extraMin: '+15 min',
      riskReduction: 'Safe',
    },
  },
  {
    id: 'alt-10',
    code: 'GPS-LOST-ZIRO',
    title: 'GPS Signal Lost',
    subtitle: 'No signal for 15 mins',
    type: 'Vehicle',
    location: 'Near Ziro',
    state: 'Arunachal Pradesh',
    severity: 'Medium',
    affectedVehiclesCount: 1,
    affectedVehiclesCodes: 'TRK-028',
    impact: '-',
    time: '8 hours ago',
    status: 'Investigating',
    icon: '📍',
    iconBg: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    reportedTime: '8 hours ago',
    lastUpdated: '1 hour ago',
    aiSummary: 'Vehicle entered deep gorge terrain with dense canopy cover. NavIC fallback relay active.',
    riskScore: 55,
    confidencePercent: 82,
    estimatedDelay: '-',
    distanceFromNearest: 'Last recorded KM 188',
    nearestVehicle: 'TRK-028',
    whyAlertReasons: [
      'Satellite geometric dilution of precision (GDOP) high',
      'Dead reckoning estimated position tracking enabled',
    ],
    affectedVehiclesList: [
      { code: 'TRK-028', distance: 'KM 188', eta: 'Tracking' },
    ],
    recommendedReroute: {
      title: 'Monitoring via VHF repeater network relay',
      extraKm: '+0 km',
      extraMin: '+0 min',
      riskReduction: 'Normal',
    },
  },
];

interface AlertsRiskIntelligenceViewProps {
  onBackToFleet?: () => void;
}

export const AlertsRiskIntelligenceView: React.FC<AlertsRiskIntelligenceViewProps> = ({ onBackToFleet }) => {
  const { setActiveScreen } = useTelemetryStore();

  const [alertsList, setAlertsList] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('alt-01');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Predictive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState('All Types');
  const [stateFilter, setStateFilter] = useState('All States');
  const [routeFilter, setRouteFilter] = useState('All Routes');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [statusFilter, setStatusFilter] = useState('Active');
  
  // Right panel subtab
  const [detailTab, setDetailTab] = useState<'Overview' | 'Affected Vehicles' | 'AI Analysis' | 'Timeline'>('Overview');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);

  // Manual Alert Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [manualSeverity, setManualSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');

  // Active selected alert
  const selectedAlert = useMemo(() => {
    return alertsList.find((a) => a.id === selectedAlertId) || alertsList[0];
  }, [alertsList, selectedAlertId]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alertsList.filter((item) => {
      // Tab filter
      if (severityFilter === 'Critical' && item.severity !== 'Critical') return false;
      if (severityFilter === 'High' && item.severity !== 'High') return false;
      if (severityFilter === 'Medium' && item.severity !== 'Medium') return false;
      if (severityFilter === 'Low' && item.severity !== 'Low') return false;
      if (severityFilter === 'Predictive' && !item.subtitle.includes('(AI)') && !item.title.includes('Forecast')) return false;

      // Dropdown filters
      if (alertTypeFilter !== 'All Types' && item.type !== alertTypeFilter) return false;
      if (stateFilter !== 'All States' && !item.state.toLowerCase().includes(stateFilter.toLowerCase())) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (vehicleFilter !== 'All Vehicles' && !item.affectedVehiclesCodes.includes(vehicleFilter)) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.affectedVehiclesCodes.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [alertsList, severityFilter, alertTypeFilter, stateFilter, statusFilter, vehicleFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Location', 'State', 'Severity', 'Impact', 'Status', 'Vehicles'];
    const rows = alertsList.map((a) => [
      a.code,
      `"${a.title}"`,
      a.type,
      `"${a.location}"`,
      `"${a.state}"`,
      a.severity,
      a.impact,
      a.status,
      `"${a.affectedVehiclesCodes}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NER_Risk_Alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAcknowledge = (id: string) => {
    setAlertsList((prev) => 
      prev.map((item) => item.id === id ? { ...item, status: 'Monitoring' } : item)
    );
  };

  const handleCreateManualAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      code: `MANUAL-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: manualTitle,
      subtitle: 'Manual operator dispatch',
      type: 'Road',
      location: manualLocation || 'NH-13 Trans-Himalayan Highway',
      state: 'Arunachal Pradesh',
      severity: manualSeverity,
      affectedVehiclesCount: 1,
      affectedVehiclesCodes: 'TRK-042',
      impact: '+30 min',
      time: 'Just now',
      status: 'Active',
      icon: manualSeverity === 'Critical' ? '⚠️' : '📢',
      iconBg: manualSeverity === 'Critical' ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200',
      iconColor: manualSeverity === 'Critical' ? 'text-rose-600' : 'text-blue-600',
      reportedTime: 'Just now',
      lastUpdated: 'Just now',
      aiSummary: 'Operator broadcasted hazard notice for logistics transport units.',
      riskScore: manualSeverity === 'Critical' ? 88 : 55,
      confidencePercent: 100,
      estimatedDelay: '+30 min',
      distanceFromNearest: 'In sector',
      nearestVehicle: 'TRK-042',
      whyAlertReasons: ['Operator logged field report via Control Hub'],
      affectedVehiclesList: [{ code: 'TRK-042', distance: '12 km away', eta: '20 min', isUrgent: true }],
      recommendedReroute: {
        title: 'Maintain alert readiness and adjust speed',
        extraKm: '+0 km',
        extraMin: '+10 min',
        riskReduction: 'Safe',
      },
    };

    setAlertsList([newAlert, ...alertsList]);
    setSelectedAlertId(newAlert.id);
    setIsManualModalOpen(false);
    setManualTitle('');
    setManualLocation('');
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-60px)] bg-[#F4F7FB] px-3 sm:px-6 py-4 overflow-y-auto select-none text-slate-800">
      <div className="max-w-[1920px] mx-auto flex flex-col gap-4">
        
        {/* ========================================================================= */}
        {/* 1. TOP TITLE & ACTIONS HEADER                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-display">
              Alerts & Risk Intelligence
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time and predictive alerts for safer and smarter logistics across North East India
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dynamic Date/Time */}
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tue, 16 Sep 2026  03:24 PM</span>
            </div>

            {/* + New Alert (Manual) Button */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Alert (Manual)</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP 4 KPI METRIC CARDS                                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Active Alerts */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xl font-bold shadow-xs">
                ⚠️
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none font-display">
                  18
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Active Alerts
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>↓ 27% from last week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Critical Alerts */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xl font-bold shadow-xs">
                ⭕
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none font-display">
                  3
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Critical Alerts
                </div>
                <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                  <span>↑ 1 from yesterday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Vehicles Affected */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shadow-xs">
                🚚
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none font-display">
                  12
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Vehicles Affected
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>↑ 4 from yesterday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Routes at Risk */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shadow-xs">
                🔀
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none font-display">
                  4
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Routes at Risk
                </div>
                <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                  <span>↑ 2 from yesterday</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. TABS & SEARCH / FILTER ROW                                            */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col gap-3">
          
          {/* Top Row: Horizontal Severity Tabs + Search Box + Filter Button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
              {[
                { id: 'All', label: 'All Alerts (18)' },
                { id: 'Critical', label: 'Critical (3)' },
                { id: 'High', label: 'High (6)' },
                { id: 'Medium', label: 'Medium (7)' },
                { id: 'Low', label: 'Low (2)' },
                { id: 'Predictive', label: 'Predictive (5)' },
              ].map((tab) => {
                const isActive = severityFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSeverityFilter(tab.id as any)}
                    className={`pb-2 px-2 whitespace-nowrap transition-all relative cursor-pointer ${
                      isActive ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563EB] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Filter Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search alerts, location or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
              </div>

              <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>
            </div>

          </div>

          {/* Bottom Row: 5 Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alert Type</label>
              <select
                value={alertTypeFilter}
                onChange={(e) => setAlertTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Natural">Natural</option>
                <option value="Weather">Weather</option>
                <option value="Road">Road</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Cargo">Cargo</option>
                <option value="Vehicle">Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All States">All States</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Manipur">Manipur</option>
                <option value="Nagaland">Nagaland</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Route</label>
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Routes">All Routes</option>
                <option value="NH-13">NH-13 Trans-Himalayan</option>
                <option value="NH-6">NH-6 Cherrapunji Route</option>
                <option value="NH-27">NH-27 Guwahati Bypass</option>
                <option value="NH-15">NH-15 Tezpur-Nagaon</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Affected Vehicle</label>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Vehicles">All Vehicles</option>
                <option value="TRK-042">TRK-042</option>
                <option value="TRK-017">TRK-017</option>
                <option value="TRK-028">TRK-028</option>
                <option value="TRK-091">TRK-091</option>
                <option value="TRK-103">TRK-103</option>
                <option value="TRK-118">TRK-118</option>
                <option value="TRK-126">TRK-126</option>
                <option value="TRK-139">TRK-139</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="All">All Statuses</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. MAIN 2-COLUMN SECTION: DATA TABLE (LEFT) + DETAIL SIDEBAR (RIGHT)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT: ALERTS DATA TABLE (COL SPAN 8 OR 12 IF PANEL CLOSED)              */}
          {/* ======================================================================= */}
          <div className={`${isDetailPanelOpen ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col transition-all`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="py-3 px-3.5">Alert / Event</th>
                    <th className="py-3 px-2.5">Type</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-2.5">Severity</th>
                    <th className="py-3 px-3">Affected Vehicles</th>
                    <th className="py-3 px-2.5">Impact</th>
                    <th className="py-3 px-2.5">Time</th>
                    <th className="py-3 px-2.5">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold text-xs">
                        No alerts matching current filters
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((item) => {
                      const isSelected = item.id === selectedAlertId;

                      // Severity pill styling
                      const getSeverityBadge = (sev: string) => {
                        switch (sev) {
                          case 'Critical':
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span>Critical</span>
                              </span>
                            );
                          case 'High':
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                                <span>High</span>
                              </span>
                            );
                          case 'Medium':
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span>Medium</span>
                              </span>
                            );
                          case 'Low':
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                <span>Low</span>
                              </span>
                            );
                          default:
                            return <span>{sev}</span>;
                        }
                      };

                      // Status pill styling
                      const getStatusBadge = (st: string) => {
                        switch (st) {
                          case 'Active':
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                <span>Active</span>
                              </span>
                            );
                          case 'Monitoring':
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span>Monitoring</span>
                              </span>
                            );
                          case 'Investigating':
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                <span>Investigating</span>
                              </span>
                            );
                          default:
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                <span>{st}</span>
                              </span>
                            );
                        }
                      };

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setSelectedAlertId(item.id);
                            setIsDetailPanelOpen(true);
                          }}
                          className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          {/* Alert / Event */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-xs border ${item.iconBg}`}>
                                {item.icon}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors font-display text-xs">
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {item.subtitle}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3 px-2.5 text-slate-600 font-semibold text-xs">
                            {item.type}
                          </td>

                          {/* Location */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800 text-xs">
                              {item.location}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {item.state}
                            </div>
                          </td>

                          {/* Severity */}
                          <td className="py-3 px-2.5 whitespace-nowrap">
                            {getSeverityBadge(item.severity)}
                          </td>

                          {/* Affected Vehicles */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800 text-xs">
                              {item.affectedVehiclesCount} vehicles
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                              {item.affectedVehiclesCodes}
                            </div>
                          </td>

                          {/* Impact */}
                          <td className="py-3 px-2.5 font-bold text-xs whitespace-nowrap">
                            <span className={item.impact !== '-' ? 'text-rose-600' : 'text-slate-400'}>
                              {item.impact}
                            </span>
                          </td>

                          {/* Time */}
                          <td className="py-3 px-2.5 text-slate-500 font-medium text-[11px] whitespace-nowrap">
                            {item.time}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-2.5 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedAlertId(item.id);
                                  setIsDetailPanelOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleAcknowledge(item.id)}
                                title="Acknowledge Alert"
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Pagination */}
            <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Showing <strong className="text-slate-800">{Math.min(filteredAlerts.length, 10)}</strong> of <strong className="text-slate-800">{alertsList.length}</strong> alerts
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1 text-[11px]">
                  <span>Rows per page:</span>
                  <select className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-700">
                    <option value="10">10</option>
                    <option value="25">25</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-6 h-6 rounded-md bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                    1
                  </button>
                  <button className="w-6 h-6 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center cursor-pointer">
                    2
                  </button>
                  <button className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* RIGHT: COMPREHENSIVE ALERT INTELLIGENCE INSPECTOR (COL SPAN 4)           */}
          {/* ======================================================================= */}
          {isDetailPanelOpen && (
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col transition-all">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-[#FAFCFF]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl shadow-xs">
                      {selectedAlert.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900 font-display">
                          {selectedAlert.title}
                        </h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedAlert.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-orange-50 text-orange-600 border border-orange-200'
                        }`}>
                          ● {selectedAlert.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{selectedAlert.location}, {selectedAlert.state}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDetailPanelOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100/80">
                  Reported {selectedAlert.reportedTime} · Last updated {selectedAlert.lastUpdated}
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="px-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-500 bg-white">
                {[
                  { id: 'Overview', label: 'Overview' },
                  { id: 'Affected Vehicles', label: `Affected Vehicles (${selectedAlert.affectedVehiclesCount})` },
                  { id: 'AI Analysis', label: 'AI Analysis' },
                  { id: 'Timeline', label: 'Timeline' },
                ].map((tab) => {
                  const isActive = detailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as any)}
                      className={`py-2.5 transition-all relative cursor-pointer ${
                        isActive ? 'text-[#2563EB]' : 'hover:text-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563EB] rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Body Content based on Tab */}
              <div className="p-4 space-y-4 text-xs">
                
                {/* AI Summary Highlight Box */}
                <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-slate-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed text-slate-800">
                    {selectedAlert.aiSummary}
                  </p>
                </div>

                {/* KPI Metrics Row 1 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Risk Score</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedAlert.riskScore} <span className="text-xs text-slate-400 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedAlert.confidencePercent}%
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Row 2 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated Delay</div>
                    <div className="text-sm font-black text-rose-600 mt-0.5">
                      {selectedAlert.estimatedDelay}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Distance from Nearest Vehicle</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">
                      {selectedAlert.distanceFromNearest}
                    </div>
                  </div>
                </div>

                {/* Why this alert? Section */}
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-2">
                    Why this alert?
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {selectedAlert.whyAlertReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 text-xs mt-0.5">◆</span>
                        <span className="font-medium text-slate-700">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affected Vehicles (3) Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-900">
                      Affected Vehicles ({selectedAlert.affectedVehiclesCount})
                    </div>
                    <button className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedAlert.affectedVehiclesList.map((v, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-extrabold text-slate-900 text-xs">{v.code}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-600 font-medium">{v.distance}</span>
                          <span className={`ml-2 text-xs font-bold ${v.isUrgent ? 'text-rose-600' : 'text-slate-600'}`}>
                            ETA {v.eta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Action Section */}
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-2">
                    Recommended Action
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-emerald-950">
                        {selectedAlert.recommendedReroute.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 mt-1">
                        <span>{selectedAlert.recommendedReroute.extraKm}</span>
                        <span>·</span>
                        <span>{selectedAlert.recommendedReroute.extraMin}</span>
                        <span>·</span>
                        <span className="text-emerald-800 font-black">{selectedAlert.recommendedReroute.riskReduction}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveScreen('reroute_console');
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Analyze Reroute</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Mark as Acknowledged
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Manual Alert Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-md text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Create Manual Alert</h2>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualAlert} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alert Title / Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mudslide near Bhalukpong"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location & Sector</label>
                <input
                  type="text"
                  placeholder="e.g. NH-13 KM 262 Pass"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setManualSeverity(sev)}
                      className={`py-1.5 rounded-lg font-bold text-xs transition-all ${
                        manualSeverity === sev
                          ? sev === 'Critical' ? 'bg-rose-500 text-white' : sev === 'High' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold shadow-sm shadow-blue-500/25"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
