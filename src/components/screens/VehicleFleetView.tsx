import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Truck, 
  Map, 
  Bell, 
  Plus, 
  Download, 
  RotateCw, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Play, 
  Package, 
  CheckCircle2,
  Calendar,
  Maximize2,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { NerMap } from '../map/NerMap';
import { LiveAlertsCard } from '../fleet/LiveAlertsCard';
import { FleetTelemetryMatrix } from '../fleet/FleetTelemetryMatrix';
import { FleetMapDashboard } from '../fleet/FleetMapDashboard';
import { AlertsRiskIntelligenceView } from '../alerts/AlertsRiskIntelligenceView';
import { CompletedDeliveriesView } from '../fleet/CompletedDeliveriesView';
import { AddConvoyModal } from '../map/AddConvoyModal';
import { AddRouteModal } from '../map/AddRouteModal';
import { HazardSectorHud } from '../map/HazardSectorHud';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { NER_ROUTE_SCHEDULE } from '../../data/mockData';

export const VehicleFleetView: React.FC = () => {
  const {
    convoys,
    alerts,
    activeFleetTab,
    setActiveFleetTab,
    setIsAddVehicleModalOpen,
    setIsAddRouteModalOpen,
    isHazardInspectorOpen,
    setIsHazardInspectorOpen,
    navigateToIndividualVehicle,
    tickTelemetry,
    vehicleProgress
  } = useTelemetryStore();

  const activeSidebarTab = activeFleetTab;
  const setActiveSidebarTab = setActiveFleetTab;
  const [currentDateStr, setCurrentDateStr] = useState('Tue, 16 Sep 2026 03:24 PM');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullGisExpanded, setIsFullGisExpanded] = useState(false);
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(true);

  const liveProgressPercent = Math.round((vehicleProgress || 0.68) * 100);
  const liveDistanceDone = Math.round((vehicleProgress || 0.68) * 312);
  const liveDistanceLeft = Math.max(0, 312 - liveDistanceDone);
  const hoursRemaining = liveDistanceLeft / 46;
  const etaHrs = Math.floor(hoursRemaining);
  const etaMins = Math.round((hoursRemaining - etaHrs) * 60);
  const liveEta = `${etaHrs}h ${etaMins.toString().padStart(2, '0')}m`;

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentDateStr(now.toLocaleDateString('en-GB', options).replace(',', ''));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    tickTelemetry();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const sidebarNav = [
    { id: 'grid', label: '', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'fleet', label: 'Fleet', icon: <Truck className="w-5 h-5" /> },
    { id: 'map', label: 'Map', icon: <Map className="w-5 h-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" />, badge: 5 },
    { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-[#F4F7FB] flex select-none text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. COMPACT LEFT ICON SIDEBAR (Matching reference screenshot)              */}
      {/* ========================================================================= */}
      <aside className="w-16 sm:w-20 bg-white border-r border-slate-200/80 flex flex-col items-center py-4 flex-shrink-0 z-10">
        <div className="flex flex-col items-center gap-2 w-full">
          {sidebarNav.map((item) => {
            const isActive = activeSidebarTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id !== 'grid') {
                    setActiveSidebarTab(item.id as any);
                  }
                }}
                className={`relative w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center transition-all group ${
                  isActive
                    ? 'bg-[#EBF2FE] text-[#2563EB] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label && (
                  <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.label}
                  </span>
                )}

                {item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN VEHICLE FLEET / MAP / ALERTS / COMPLETED VIEW SWITCHER           */}
      {/* ========================================================================= */}
      {activeSidebarTab === 'map' ? (
        <FleetMapDashboard onBackToFleet={() => setActiveSidebarTab('fleet')} />
      ) : activeSidebarTab === 'alerts' ? (
        <AlertsRiskIntelligenceView onBackToFleet={() => setActiveSidebarTab('fleet')} />
      ) : activeSidebarTab === 'completed' ? (
        <CompletedDeliveriesView onBackToFleet={() => setActiveSidebarTab('fleet')} />
      ) : (
        <div className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-3 sm:py-4 overflow-y-auto">
          <div className="max-w-[1920px] mx-auto flex flex-col gap-3.5">
            
            {/* Top Page Header & Actions Bar matching reference screenshot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
                  Vehicle Fleet
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Monitor and manage all active convoys across the North East
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Dynamic Timestamp */}
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{currentDateStr}</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  title="Refresh Fleet Telemetry"
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3 h-3 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {/* Add Vehicle Button */}
                <button
                  onClick={() => setIsAddVehicleModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Vehicle</span>
                </button>

                {/* Export CSV Button */}
                <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5">
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. 6 KPI METRIC CARDS (Exact match from reference screenshot)             */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              
              {/* 1. Active Vehicles */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#EBF2FE] flex items-center justify-center text-[#2563EB]">
                    <Truck className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Active Vehicles</span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    248
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <span>↑ 12%</span>
                    <span className="font-normal text-slate-400">from last week</span>
                  </div>
                </div>
              </div>

              {/* 2. Moving */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Moving</span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    182
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-0.5">
                    <span>73% of total</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full w-[73%]"></div>
                  </div>
                </div>
              </div>

              {/* 3. Delayed */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Delayed</span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    14
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-0.5">
                    <span>6% of total</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-500 rounded-full w-[14%]"></div>
                  </div>
                </div>
              </div>

              {/* 4. Route Alerts */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Route Alerts</span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    6
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Require attention
                  </div>
                </div>
              </div>

              {/* 5. Avg Accessibility Score */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Avg Accessibility</span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    7.8 <span className="text-sm font-normal text-slate-400">/ 10</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <span>↑ 0.4</span>
                    <span className="font-normal text-slate-400">this week</span>
                  </div>
                </div>
              </div>

              {/* 6. Total Cargo */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#EBF2FE] flex items-center justify-center text-[#2563EB]">
                    <Package className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Total Cargo</span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    286.5 <span className="text-sm font-normal text-slate-400">Tons</span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Across all vehicles
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 4. MAIN MIDDLE GRID: EXACT LIVE ROUTE MAP (LEFT 8) + LIVE ALERTS (RIGHT 4)*/}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              
              {/* Left: Exact Live Route Map (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-3.5 flex flex-col gap-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-blue-600">
                      <Map className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-display">
                      Live Route Map
                    </h3>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live GPS Telematics</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveSidebarTab('map')}
                    title="Open Full Fleet Map Dashboard"
                    className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Open Fleet Map</span>
                  </button>
                </div>

                {/* Exact Google Map from Individual Vehicle Dashboard */}
                <div className="w-full h-[250px] sm:h-[265px] lg:h-[275px] rounded-xl overflow-hidden relative border border-slate-200/90 shadow-inner">
                  <NerMap isCompact={false} />
                </div>
              </div>

              {/* Right: Compact Live Alerts Card (4 cols) */}
              <div className="lg:col-span-4 h-full">
                <LiveAlertsCard />
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 5. BOTTOM FLEET TELEMETRY MATRIX TABLE (PROMINENT & IMMEDIATELY VISIBLE) */}
            {/* ========================================================================= */}
            <FleetTelemetryMatrix />

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN EXPANDED MODAL (EXACT PHOTO LAYOUT WITH SIDEBAR, MAP & STRIP) */}
      {/* ========================================================================= */}
      {isFullGisExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
          <div className="bg-white w-full h-full max-w-[1920px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            
            {/* Top Modal Header */}
            <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white shadow-sm p-1.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M14 6l7 12H7l7-12z" fill="#FFFFFF" opacity="0.95" />
                    <path d="M7 10l5 8H2l5-8z" fill="#93C5FD" opacity="0.85" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <span>NER Logistics</span>
                    <span className="text-xs text-slate-400 font-normal">|</span>
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Live Vehicle Tracking
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium -mt-0.5">
                    Smarter Routes. Safer Deliveries.
                  </div>
                </div>
              </div>

              {/* Close / Exit Full Screen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullGisExpanded(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Exit Full Screen</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Left Sidebar + Center Map Canvas */}
            <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 overflow-hidden bg-[#F4F7FB]">
              
              {/* Left Column (Col span 3.5) */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3 overflow-y-auto pr-1">
                
                {/* 1. Live Vehicle Tracking Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                      <span className="text-base text-blue-600">📍</span>
                      <span>Live Vehicle Tracking</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Real-time
                      </span>
                      <button 
                        onClick={() => tickTelemetry()}
                        title="Refresh Signal"
                        className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Truck Profile Banner */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M17 8h3l3 4.5V17h-2a3 3 0 01-6 0H9a3 3 0 01-6 0H1V6a2 2 0 012-2h12v4zm0 2V6H3v8.5a3 3 0 002.83 2h8.34A3 3 0 0017 15V10zm2 1.5l-1.5-2H17v3.5h3.5l-1-1.5zM6 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 font-display">
                          {convoys[0]?.vehicleNo || 'AS-01-HC-4821'}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          On Route
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Origin & Destination Nodes */}
                  <div className="space-y-2.5 px-1 py-0.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                        📍
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">From</div>
                        <div className="font-bold text-slate-900">
                          Guwahati, Assam
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          (Starting Point)
                        </div>
                      </div>
                    </div>

                    <div className="ml-2 w-0.5 h-3 border-l-2 border-dotted border-slate-300 -my-1"></div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                        📍
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">To</div>
                        <div className="font-bold text-slate-900">
                          Itanagar, Arunachal Pradesh
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          (Destination)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Columns: Distance, ETA, Progress */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                    <div className="bg-[#F8FAFC] rounded-xl p-2 text-center border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Distance</div>
                      <div className="text-sm font-black text-slate-900 font-display mt-0.5">
                        312 km
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl p-2 text-center border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">ETA</div>
                      <div className="text-sm font-black text-slate-900 font-display mt-0.5">
                        {liveEta}
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl p-2 text-center border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Progress</div>
                        <div className="text-sm font-black text-slate-900 font-display mt-0.5">
                          {liveProgressPercent}%
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${liveProgressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Route Details Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col">
                  <button 
                    onClick={() => setIsRouteDetailsOpen(!isRouteDetailsOpen)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                      <span className="text-blue-600">📍</span>
                      <span>Route Details</span>
                    </div>
                    <div className="text-slate-400 hover:text-slate-600">
                      {isRouteDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isRouteDetailsOpen && (
                    <div className="mt-4 pl-1 space-y-4">
                      {NER_ROUTE_SCHEDULE.map((milestone, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === NER_ROUTE_SCHEDULE.length - 1;

                        return (
                          <div key={milestone.id} className="relative flex items-start gap-3">
                            {!isLast && (
                              <div className="absolute left-[7px] top-[14px] bottom-[-16px] w-[2px] bg-blue-200"></div>
                            )}

                            <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isFirst 
                                ? 'bg-emerald-500 ring-2 ring-emerald-200' 
                                : isLast 
                                ? 'bg-rose-500 ring-2 ring-rose-200' 
                                : 'bg-blue-600 ring-2 ring-blue-100'
                            }`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            </div>

                            <div className="flex-1 flex items-baseline justify-between">
                              <span className={`text-xs font-bold ${
                                isFirst ? 'text-slate-900' : isLast ? 'text-slate-900' : 'text-slate-800'
                              }`}>
                                {milestone.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {milestone.time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Center Map (Col span 8.5) */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm relative">
                <NerMap 
                  isCompact={false} 
                  isExpandedModal={true}
                  onExpandClick={() => setIsFullGisExpanded(false)} 
                />
              </div>

            </div>

            {/* Modal Bottom Strip: Journey Progress + Alert Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 py-3 bg-white border-t border-slate-200 flex-shrink-0">
              
              {/* Journey Progress Horizontal Timeline */}
              <div className="lg:col-span-8 bg-[#F8FAFC] rounded-2xl p-3 border border-slate-200/80 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-900 mb-1">
                  Journey Progress
                </div>

                <div className="relative pt-3 pb-1 px-3">
                  <div className="absolute top-[20px] left-5 right-5 h-1 bg-blue-200 rounded-full"></div>
                  <div 
                    className="absolute top-[20px] left-5 h-1 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(90, liveProgressPercent)}%` }}
                  ></div>

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1.5">Guwahati</div>
                      <div className="text-[10px] text-slate-400 font-medium">10:15 AM</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-2">Nagaon</div>
                      <div className="text-[10px] text-slate-400 font-medium">11:20 AM</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-2">Tezpur</div>
                      <div className="text-[10px] text-slate-400 font-medium">12:45 PM</div>
                    </div>

                    {/* Synchronized Moving White Cargo Truck indicator on Journey Progress line */}
                    <div 
                      className="absolute -top-[12px] -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
                      style={{ left: `${Math.min(94, Math.max(6, liveProgressPercent))}%` }}
                    >
                      <div className="w-9 h-7 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center p-0.5 animate-pulse">
                        <img 
                          src="/truck.png" 
                          alt="Truck" 
                          className="w-full h-full object-contain pointer-events-none select-none -scale-x-100" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-2">Bhalukpong</div>
                      <div className="text-[10px] text-slate-400 font-medium">3:10 PM</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white ring-2 ring-rose-200 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1.5">Itanagar</div>
                      <div className="text-[10px] text-slate-400 font-medium">5:00 PM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Cards */}
              <div className="lg:col-span-4 flex flex-col gap-2 justify-center">
                <div 
                  onClick={() => setIsHazardInspectorOpen(true)}
                  className="bg-[#EFF6FF] hover:bg-blue-100/80 border border-blue-200/90 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm shadow-sm">
                      🌧️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Heavy Rainfall Ahead
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Near Bhalukpong (in 12 km)
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                </div>

                <div 
                  onClick={() => setIsHazardInspectorOpen(true)}
                  className="bg-[#FEF2F2] hover:bg-rose-100/80 border border-rose-200/90 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-sm shadow-sm">
                      ⚠️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Landslide Risk
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Moderate Risk • Sela Alpine Sector
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-500" />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Global Modals */}
      <AddConvoyModal />
      <AddRouteModal />
      {isHazardInspectorOpen && <HazardSectorHud onClose={() => setIsHazardInspectorOpen(false)} />}

    </div>
  );
};
