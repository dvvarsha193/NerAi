import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Clock, 
  Share2, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Navigation, 
  Truck, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Gauge, 
  Zap, 
  CloudRain, 
  Flag,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { CompletedJourneyMap } from './CompletedJourneyMap';

export interface CompletedDelivery {
  id: string;
  deliveryId: string;
  date: string;
  vehicle: string;
  origin: string;
  destination: string;
  route: string;
  cargo: string;
  cargoIcon: string;
  cargoColor: string;
  cargoTypeFull: string;
  distanceKm: number;
  journeyTime: string;
  plannedTime: string;
  status: 'On Time' | 'Delayed';
  avgSpeedKmh: number;
  departureTime: string;
  arrivalTime: string;
  plannedDistanceKm: number;
  actualDistanceKm: number;
  plannedRiskScore: number;
  actualRiskScore: number;
  riskReductionPercent: number;
  timeline: {
    time: string;
    label: string;
    location: string;
    icon: string;
    type: 'start' | 'waypoint' | 'weather' | 'hazard' | 'end';
  }[];
  impactPoints: string[];
}

const COMPLETED_DATA: CompletedDelivery[] = [
  {
    id: 'del-01',
    deliveryId: 'DEL-2026-0916-042',
    date: '16 Sep 2026',
    vehicle: 'TRK-042',
    origin: 'Guwahati',
    destination: 'Itanagar',
    route: 'Guwahati → Itanagar',
    cargo: 'Medical',
    cargoIcon: '➕',
    cargoColor: 'text-rose-600 bg-rose-50',
    cargoTypeFull: 'Medical Supplies',
    distanceKm: 545,
    journeyTime: '11h 32m',
    plannedTime: '10h 50m',
    status: 'On Time',
    avgSpeedKmh: 43,
    departureTime: '08:10 AM',
    arrivalTime: '07:42 PM',
    plannedDistanceKm: 545,
    actualDistanceKm: 563,
    plannedRiskScore: 61,
    actualRiskScore: 37,
    riskReductionPercent: 39,
    timeline: [
      { time: '08:10', label: 'Departed', location: 'Guwahati', icon: '📍', type: 'start' },
      { time: '10:02', label: 'Reached', location: 'Nagaon', icon: '🔵', type: 'waypoint' },
      { time: '12:31', label: 'Heavy Rain', location: 'Tezpur', icon: '🌧️', type: 'weather' },
      { time: '15:46', label: 'Landslide Risk', location: 'Bhalukpong', icon: '⚠️', type: 'hazard' },
      { time: '19:42', label: 'Delivered', location: 'Itanagar', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Avoided high-risk segment',
      'Risk reduced by 39%',
      'Delivery completed safely'
    ]
  },
  {
    id: 'del-02',
    deliveryId: 'DEL-2026-0915-091',
    date: '15 Sep 2026',
    vehicle: 'TRK-091',
    origin: 'Tezpur',
    destination: 'Tawang',
    route: 'Tezpur → Tawang',
    cargo: 'Supplies',
    cargoIcon: '📦',
    cargoColor: 'text-blue-600 bg-blue-50',
    cargoTypeFull: 'Relief Provisions',
    distanceKm: 448,
    journeyTime: '10h 28m',
    plannedTime: '9h 15m',
    status: 'Delayed',
    avgSpeedKmh: 38,
    departureTime: '06:30 AM',
    arrivalTime: '04:58 PM',
    plannedDistanceKm: 448,
    actualDistanceKm: 462,
    plannedRiskScore: 78,
    actualRiskScore: 45,
    riskReductionPercent: 42,
    timeline: [
      { time: '06:30', label: 'Departed', location: 'Tezpur', icon: '📍', type: 'start' },
      { time: '09:15', label: 'Crossed', location: 'Bhalukpong', icon: '🔵', type: 'waypoint' },
      { time: '12:40', label: 'Fog & Ice', location: 'Sela Pass', icon: '❄️', type: 'weather' },
      { time: '16:58', label: 'Delivered', location: 'Tawang', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Protected sensitive electronics cargo',
      'Dynamic speed mitigation applied',
      'Zero vehicle damage reported'
    ]
  },
  {
    id: 'del-03',
    deliveryId: 'DEL-2026-0915-126',
    date: '15 Sep 2026',
    vehicle: 'TRK-126',
    origin: 'Dimapur',
    destination: 'Kohima',
    route: 'Dimapur → Kohima',
    cargo: 'Food',
    cargoIcon: '🌿',
    cargoColor: 'text-emerald-600 bg-emerald-50',
    cargoTypeFull: 'Perishable Produce',
    distanceKm: 74,
    journeyTime: '3h 21m',
    plannedTime: '3h 30m',
    status: 'On Time',
    avgSpeedKmh: 32,
    departureTime: '09:00 AM',
    arrivalTime: '12:21 PM',
    plannedDistanceKm: 74,
    actualDistanceKm: 74,
    plannedRiskScore: 40,
    actualRiskScore: 22,
    riskReductionPercent: 45,
    timeline: [
      { time: '09:00', label: 'Departed', location: 'Dimapur Depot', icon: '📍', type: 'start' },
      { time: '10:45', label: 'Ascended', location: 'Chumukedima', icon: '🔵', type: 'waypoint' },
      { time: '12:21', label: 'Delivered', location: 'Kohima Market', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'On-time farm-to-table delivery',
      'Cold storage efficiency preserved',
      'Optimal route gradient selected'
    ]
  },
  {
    id: 'del-04',
    deliveryId: 'DEL-2026-0914-028',
    date: '14 Sep 2026',
    vehicle: 'TRK-028',
    origin: 'Guwahati',
    destination: 'Shillong',
    route: 'Guwahati → Shillong',
    cargo: 'Electronics',
    cargoIcon: '📦',
    cargoColor: 'text-purple-600 bg-purple-50',
    cargoTypeFull: 'Precision Sensors',
    distanceKm: 102,
    journeyTime: '4h 10m',
    plannedTime: '4h 00m',
    status: 'On Time',
    avgSpeedKmh: 36,
    departureTime: '11:00 AM',
    arrivalTime: '03:10 PM',
    plannedDistanceKm: 102,
    actualDistanceKm: 105,
    plannedRiskScore: 35,
    actualRiskScore: 18,
    riskReductionPercent: 48,
    timeline: [
      { time: '11:00', label: 'Departed', location: 'Guwahati Air Cargo', icon: '📍', type: 'start' },
      { time: '12:30', label: 'Passed', location: 'Nongpoh', icon: '🔵', type: 'waypoint' },
      { time: '15:10', label: 'Delivered', location: 'Shillong Tech Hub', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Vibration damper monitoring active',
      'Zero component shock incidents',
      'Fast-track transit via expressway'
    ]
  },
  {
    id: 'del-05',
    deliveryId: 'DEL-2026-0914-139',
    date: '14 Sep 2026',
    vehicle: 'TRK-139',
    origin: 'Silchar',
    destination: 'Aizawl',
    route: 'Silchar → Aizawl',
    cargo: 'Construction',
    cargoIcon: '🛠️',
    cargoColor: 'text-amber-600 bg-amber-50',
    cargoTypeFull: 'Bridge Steel Materials',
    distanceKm: 310,
    journeyTime: '9h 05m',
    plannedTime: '8h 00m',
    status: 'Delayed',
    avgSpeedKmh: 34,
    departureTime: '05:30 AM',
    arrivalTime: '02:35 PM',
    plannedDistanceKm: 310,
    actualDistanceKm: 328,
    plannedRiskScore: 72,
    actualRiskScore: 48,
    riskReductionPercent: 33,
    timeline: [
      { time: '05:30', label: 'Departed', location: 'Silchar Rail Yard', icon: '📍', type: 'start' },
      { time: '09:15', label: 'Passed', location: 'Vairengte Border', icon: '🔵', type: 'waypoint' },
      { time: '11:45', label: 'Muddy Ridge', location: 'Kolasib Bypass', icon: '⚠️', type: 'hazard' },
      { time: '14:35', label: 'Delivered', location: 'Aizawl North', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Heavy axle load escort provided',
      'Assisted detour around soft shoulder',
      'Successful delivery to construction site'
    ]
  },
  {
    id: 'del-06',
    deliveryId: 'DEL-2026-0913-103',
    date: '13 Sep 2026',
    vehicle: 'TRK-103',
    origin: 'Jorhat',
    destination: 'Itanagar',
    route: 'Jorhat → Itanagar',
    cargo: 'Supplies',
    cargoIcon: '📦',
    cargoColor: 'text-blue-600 bg-blue-50',
    cargoTypeFull: 'General Merchandise',
    distanceKm: 420,
    journeyTime: '12h 18m',
    plannedTime: '12h 00m',
    status: 'On Time',
    avgSpeedKmh: 41,
    departureTime: '07:00 AM',
    arrivalTime: '07:18 PM',
    plannedDistanceKm: 420,
    actualDistanceKm: 426,
    plannedRiskScore: 52,
    actualRiskScore: 29,
    riskReductionPercent: 44,
    timeline: [
      { time: '07:00', label: 'Departed', location: 'Jorhat Hub', icon: '📍', type: 'start' },
      { time: '11:20', label: 'Passed', location: 'Lakhimpur', icon: '🔵', type: 'waypoint' },
      { time: '19:18', label: 'Delivered', location: 'Itanagar Depot', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Smooth Brahmaputra crossing bridge corridor',
      'Telemetry synchronized without packet drop',
      'Fuel efficiency index +12%'
    ]
  },
  {
    id: 'del-07',
    deliveryId: 'DEL-2026-0912-056',
    date: '12 Sep 2026',
    vehicle: 'TRK-056',
    origin: 'Imphal',
    destination: 'Dimapur',
    route: 'Imphal → Dimapur',
    cargo: 'Fuel',
    cargoIcon: '💧',
    cargoColor: 'text-yellow-600 bg-yellow-50',
    cargoTypeFull: 'High Altitude Diesel',
    distanceKm: 215,
    journeyTime: '6h 42m',
    plannedTime: '6h 30m',
    status: 'On Time',
    avgSpeedKmh: 37,
    departureTime: '08:00 AM',
    arrivalTime: '02:42 PM',
    plannedDistanceKm: 215,
    actualDistanceKm: 215,
    plannedRiskScore: 48,
    actualRiskScore: 25,
    riskReductionPercent: 48,
    timeline: [
      { time: '08:00', label: 'Departed', location: 'Imphal Refinery', icon: '📍', type: 'start' },
      { time: '11:15', label: 'Passed', location: 'Senapati Pass', icon: '🔵', type: 'waypoint' },
      { time: '14:42', label: 'Delivered', location: 'Dimapur Station', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Hazardous tanker escort protocol maintained',
      'Pressure monitoring valve secure',
      'Compliant with regional safety standards'
    ]
  },
  {
    id: 'del-08',
    deliveryId: 'DEL-2026-0912-077',
    date: '12 Sep 2026',
    vehicle: 'TRK-077',
    origin: 'Guwahati',
    destination: 'Tezpur',
    route: 'Guwahati → Tezpur',
    cargo: 'Food',
    cargoIcon: '🌿',
    cargoColor: 'text-emerald-600 bg-emerald-50',
    cargoTypeFull: 'Fresh Dairy & Bakery',
    distanceKm: 184,
    journeyTime: '4h 56m',
    plannedTime: '5h 00m',
    status: 'On Time',
    avgSpeedKmh: 46,
    departureTime: '05:00 AM',
    arrivalTime: '09:56 AM',
    plannedDistanceKm: 184,
    actualDistanceKm: 184,
    plannedRiskScore: 30,
    actualRiskScore: 15,
    riskReductionPercent: 50,
    timeline: [
      { time: '05:00', label: 'Departed', location: 'Guwahati Central', icon: '📍', type: 'start' },
      { time: '07:30', label: 'Passed', location: 'Mangaldai', icon: '🔵', type: 'waypoint' },
      { time: '09:56', label: 'Delivered', location: 'Tezpur Base', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Early morning departure beat highway traffic',
      '100% on-time freshness rating',
      'Low fuel consumption route achieved'
    ]
  },
  {
    id: 'del-09',
    deliveryId: 'DEL-2026-0911-042',
    date: '11 Sep 2026',
    vehicle: 'TRK-042',
    origin: 'Tezpur',
    destination: 'Bhalukpong',
    route: 'Tezpur → Bhalukpong',
    cargo: 'Medical',
    cargoIcon: '➕',
    cargoColor: 'text-rose-600 bg-rose-50',
    cargoTypeFull: 'Cold Chain Vaccines',
    distanceKm: 210,
    journeyTime: '5h 38m',
    plannedTime: '5h 30m',
    status: 'On Time',
    avgSpeedKmh: 42,
    departureTime: '01:00 PM',
    arrivalTime: '06:38 PM',
    plannedDistanceKm: 210,
    actualDistanceKm: 212,
    plannedRiskScore: 55,
    actualRiskScore: 28,
    riskReductionPercent: 49,
    timeline: [
      { time: '13:00', label: 'Departed', location: 'Tezpur Medical Depot', icon: '📍', type: 'start' },
      { time: '15:20', label: 'Passed', location: 'Charduar Checkpost', icon: '🔵', type: 'waypoint' },
      { time: '18:38', label: 'Delivered', location: 'Bhalukpong Clinic', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Temperature strictly kept at 3.8°C',
      'Hospital priority clearance granted',
      'Zero spoilage validation certificate logged'
    ]
  },
  {
    id: 'del-10',
    deliveryId: 'DEL-2026-0911-091',
    date: '11 Sep 2026',
    vehicle: 'TRK-091',
    origin: 'Aizawl',
    destination: 'Silchar',
    route: 'Aizawl → Silchar',
    cargo: 'Supplies',
    cargoIcon: '📦',
    cargoColor: 'text-blue-600 bg-blue-50',
    cargoTypeFull: 'Telecom Spares',
    distanceKm: 306,
    journeyTime: '8h 24m',
    plannedTime: '7h 30m',
    status: 'Delayed',
    avgSpeedKmh: 36,
    departureTime: '07:00 AM',
    arrivalTime: '03:24 PM',
    plannedDistanceKm: 306,
    actualDistanceKm: 318,
    plannedRiskScore: 68,
    actualRiskScore: 42,
    riskReductionPercent: 38,
    timeline: [
      { time: '07:00', label: 'Departed', location: 'Aizawl East', icon: '📍', type: 'start' },
      { time: '11:10', label: 'Hairpin Slowdown', location: 'Durtlang Ridge', icon: '⚠️', type: 'hazard' },
      { time: '15:24', label: 'Delivered', location: 'Silchar Station', icon: '🏁', type: 'end' }
    ],
    impactPoints: [
      'Critical tower maintenance equipment safely arrived',
      'Dynamic descent braking advice used',
      'No hardware dislocation during mountain transit'
    ]
  }
];

interface CompletedDeliveriesViewProps {
  onBackToFleet?: () => void;
}

export const CompletedDeliveriesView: React.FC<CompletedDeliveriesViewProps> = ({ onBackToFleet }) => {
  const { setActiveScreen } = useTelemetryStore();

  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>(COMPLETED_DATA);
  const [selectedId, setSelectedId] = useState<string>('del-01');
  const [activeTab, setActiveTab] = useState<'All Deliveries' | 'On-Time' | 'Delayed' | 'By Vehicle' | 'By Route' | 'By Cargo Type'>('All Deliveries');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [inspectorSubtab, setInspectorSubtab] = useState<'Journey Overview' | 'Route & Map' | 'Events' | 'Impact Analysis'>('Journey Overview');
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(1);

  // Selected item
  const selectedDelivery = useMemo(() => {
    return deliveries.find((d) => d.id === selectedId) || deliveries[0];
  }, [deliveries, selectedId]);

  // Filtered list
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Tab filter
      if (activeTab === 'On-Time' && item.status !== 'On Time') return false;
      if (activeTab === 'Delayed' && item.status !== 'Delayed') return false;
      if (activeTab === 'By Vehicle' && !item.vehicle.includes('TRK-042')) return true; // Show all
      
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.vehicle.toLowerCase().includes(q) ||
          item.route.toLowerCase().includes(q) ||
          item.cargo.toLowerCase().includes(q) ||
          item.origin.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [deliveries, activeTab, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Vehicle', 'Route', 'Cargo', 'Distance (km)', 'Journey Time', 'Status', 'Delivery ID'];
    const rows = deliveries.map((d) => [
      d.date,
      d.vehicle,
      `"${d.route}"`,
      d.cargo,
      d.distanceKm,
      d.journeyTime,
      d.status,
      d.deliveryId
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Completed_Deliveries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Replay animation trigger
  const handleReplay = () => {
    setIsReplaying(true);
    setReplayProgress(0);
    let curr = 0;
    const interval = setInterval(() => {
      curr += 0.15;
      if (curr >= 1) {
        setReplayProgress(1);
        setIsReplaying(false);
        clearInterval(interval);
      } else {
        setReplayProgress(curr);
      }
    }, 250);
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-60px)] bg-[#F4F7FB] px-3 sm:px-6 py-4 overflow-y-auto select-none text-slate-800">
      <div className="max-w-[1920px] mx-auto flex flex-col gap-4">
        
        {/* ========================================================================= */}
        {/* 1. TOP TITLE & ACTIONS HEADER (Matching reference screenshot)             */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-display">
              Completed Deliveries
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Journey history, performance insights and real impact across North East India
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker Pill */}
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01 Sep 2026 - 16 Sep 2026</span>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP 4 KPI METRIC CARDS (Exact match from reference screenshot)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Completed Deliveries */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">
                Completed Deliveries
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-1 font-display">
                186
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <span>↑ +24% from last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: On-Time Deliveries */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-xs">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">
                On-Time Deliveries
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-1 font-display">
                91%
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">
                170 of 186 deliveries
              </div>
            </div>
          </div>

          {/* Card 3: Total Distance Covered */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Share2 className="w-6 h-6 text-blue-600 rotate-45" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">
                Total Distance Covered
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-1 font-display">
                1,24,560 km
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <span>↑ +18% from last month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Avg. Journey Time */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
              <BarChart2 className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">
                Avg. Journey Time
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mt-1 font-display">
                7h 42m
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <span>↓ 14% from last month</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN SPLIT CONTENT (Left Table Matrix + Right Detail Inspector)        */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* LEFT SECTION: Tabs + Table Matrix */}
          <div className={`flex-1 flex flex-col gap-3.5 transition-all w-full ${isDetailOpen ? 'lg:w-[60%]' : 'w-full'}`}>
            
            {/* Filter Pill Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {(['All Deliveries', 'On-Time', 'Delayed', 'By Vehicle', 'By Route', 'By Cargo Type'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-xs shadow-blue-500/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Search Box & Filter Button */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by vehicle, route, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-full w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
                  />
                </div>

                <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-slate-500" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* DATA TABLE MATRIX */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-3.5">DATE</th>
                      <th className="py-3 px-3">VEHICLE</th>
                      <th className="py-3 px-3">ROUTE</th>
                      <th className="py-3 px-3">CARGO</th>
                      <th className="py-3 px-3">DISTANCE</th>
                      <th className="py-3 px-3">JOURNEY TIME</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredDeliveries.map((del) => {
                      const isSelected = del.id === selectedId;

                      return (
                        <tr
                          key={del.id}
                          onClick={() => {
                            setSelectedId(del.id);
                            setIsDetailOpen(true);
                          }}
                          className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/70 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                            {del.date}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900">
                            {del.vehicle}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700 text-xs">
                            {del.route}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                              <span className="text-xs">{del.cargoIcon}</span>
                              <span>{del.cargo}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                            {del.distanceKm} km
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                            {del.journeyTime}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {del.status === 'On Time' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>On Time</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>Delayed</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(del.id);
                                setIsDetailOpen(true);
                              }}
                              className="px-3 py-1 rounded-md text-xs font-bold text-blue-600 hover:bg-blue-100/60 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 bg-[#F8FAFC] border-t border-slate-200/80 text-xs text-slate-500">
                <div>
                  Showing 1-10 of 186 deliveries
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    1
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-white flex items-center justify-center text-xs font-medium">
                    2
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-white flex items-center justify-center text-xs font-medium">
                    3
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-white flex items-center justify-center text-xs font-medium">
                    4
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-white flex items-center justify-center text-xs font-medium">
                    5
                  </button>
                  <span className="px-1 text-slate-400 font-bold">...</span>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-white flex items-center justify-center text-xs font-medium">
                    19
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. BOTTOM SECTION: INSIGHTS FROM COMPLETED DELIVERIES (4 Cards)          */}
            {/* ========================================================================= */}
            <div className="flex flex-col gap-2.5 mt-1">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-display">
                Insights from Completed Deliveries
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Most Reliable Route */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">
                      Most Reliable Route
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      Guwahati → Shillong
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                      96% on-time rate
                    </div>
                  </div>
                </div>

                {/* 2. Most Challenging Route */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">
                      Most Challenging Route
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      Tezpur → Tawang
                    </div>
                    <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                      42% on-time rate
                    </div>
                  </div>
                </div>

                {/* 3. Highest Avg. Delay */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                    <Clock className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">
                      Highest Avg. Delay
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      Itanagar region
                    </div>
                    <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                      +1h 28m
                    </div>
                  </div>
                </div>

                {/* 4. Most Transported Cargo */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">
                      Most Transported Cargo
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      Supplies
                    </div>
                    <div className="text-[11px] font-bold text-purple-600 mt-0.5">
                      38% of total deliveries
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 5. RIGHT INSPECTOR PANEL: SELECTED DELIVERY DETAILS (Matching Screenshot) */}
          {/* ========================================================================= */}
          {isDetailOpen && (
            <div className="w-full lg:w-[40%] bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-black text-slate-900 font-display">
                        {selectedDelivery.vehicle}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Delivered</span>
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedDelivery.route}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                    <span>📅 {selectedDelivery.date}</span>
                    <span>🕒 {selectedDelivery.departureTime} - {selectedDelivery.arrivalTime}</span>
                    <span className="text-emerald-600 font-bold">● {selectedDelivery.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    Delivery ID: {selectedDelivery.deliveryId}
                  </span>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Metric Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-1">
                {/* Distance */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="text-blue-600 text-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      {selectedDelivery.distanceKm} km
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Distance
                    </div>
                  </div>
                </div>

                {/* Journey Time */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="text-blue-600 text-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      {selectedDelivery.journeyTime}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium line-clamp-1">
                      Planned: {selectedDelivery.plannedTime}
                    </div>
                  </div>
                </div>

                {/* Avg Speed */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="text-blue-600 text-sm">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      {selectedDelivery.avgSpeedKmh} km/h
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Avg. Speed
                    </div>
                  </div>
                </div>

                {/* Cargo Type */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="text-purple-600 text-sm">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 line-clamp-1">
                      {selectedDelivery.cargoTypeFull}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Cargo Type
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex items-center gap-1 border-b border-slate-100 pb-1">
                {(['Journey Overview', 'Route & Map', 'Events', 'Impact Analysis'] as const).map((tab) => {
                  const isActive = inspectorSubtab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setInspectorSubtab(tab)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                        isActive
                          ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* INTERACTIVE COMPLETED JOURNEY LEAFLET MAP */}
              <CompletedJourneyMap delivery={selectedDelivery} />

              {/* JOURNEY TIMELINE HORIZONTAL PROGRESS */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-900 tracking-tight font-display">
                    Journey Timeline
                  </div>
                  <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700">
                    View All Events
                  </button>
                </div>

                {/* Timeline Visual Line with Milestones */}
                <div className="relative pt-4 pb-1">
                  {/* Base track */}
                  <div className="absolute top-6 left-3 right-3 h-0.5 bg-slate-200"></div>

                  <div className="relative flex items-start justify-between">
                    {selectedDelivery.timeline.map((point, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center max-w-[70px]">
                        {/* Milestone Marker */}
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-xs z-10 mb-1.5">
                          {point.type === 'start' && <MapPin className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />}
                          {point.type === 'waypoint' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>}
                          {point.type === 'weather' && <CloudRain className="w-3.5 h-3.5 text-blue-600" />}
                          {point.type === 'hazard' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {point.type === 'end' && <Flag className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />}
                        </div>

                        {/* Time & Label */}
                        <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                          {point.time}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {point.label}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">
                          {point.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COMPARISON CARDS: Planned vs Actual & NerLogix Impact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                
                {/* Planned vs Actual Card */}
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between">
                  <div className="text-[11px] font-extrabold text-slate-900 mb-2">
                    Planned vs Actual
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    {/* Planned */}
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Planned
                      </div>
                      <div className="font-extrabold text-slate-800 mt-0.5">
                        {selectedDelivery.plannedDistanceKm} km
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {selectedDelivery.plannedTime}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Risk: {selectedDelivery.plannedRiskScore}/100
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-slate-400 px-1">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Actual */}
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Actual
                      </div>
                      <div className="font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                        <span>{selectedDelivery.actualDistanceKm} km</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-50 text-rose-600 font-bold">+18 km</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <span>{selectedDelivery.journeyTime}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-50 text-rose-600 font-bold">+42 min</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <span>Risk: {selectedDelivery.actualRiskScore}/100</span>
                        <span className="text-[9px] text-emerald-600 font-bold">↓ {selectedDelivery.riskReductionPercent}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NerLogix Impact Card */}
                <div className="bg-[#F0FDF4] rounded-xl p-3 border border-emerald-200/80 flex flex-col justify-between">
                  <div className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>NerLogix Impact</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-emerald-800 font-semibold">
                    {selectedDelivery.impactPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
