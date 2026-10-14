import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  MoreHorizontal, 
  Clock, 
  Navigation, 
  Plus, 
  Download, 
  Maximize2,
  Minimize2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Gauge,
  Phone,
  User,
  Package,
  MapPin,
  Compass,
  Radio,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  RotateCw,
  TrendingUp,
  Activity,
  X,
  Bell
} from 'lucide-react';
import { NerMap } from '../map/NerMap';
import { CorridorElevationProfile } from '../map/CorridorElevationProfile';
import { ConvoyTelemetryHud } from '../map/ConvoyTelemetryHud';
import { HazardSectorHud } from '../map/HazardSectorHud';
import { AddConvoyModal } from '../map/AddConvoyModal';
import { AddRouteModal } from '../map/AddRouteModal';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { NER_ROUTE_SCHEDULE } from '../../data/mockData';
import { vehicleAnimationService } from '../../services/vehicleAnimationService';

export const TacticalGisView: React.FC = () => {
  const {
    convoys,
    selectedConvoyId,
    setSelectedConvoyId,
    navigateToFleetView,
    isHazardInspectorOpen,
    setIsHazardInspectorOpen,
    setIsAddVehicleModalOpen,
    setIsAddRouteModalOpen,
    tickTelemetry,
    vehicleProgress,
  } = useTelemetryStore();

  const [isFullGisExpanded, setIsFullGisExpanded] = useState(false);
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(true);

  // Active selected convoy (defaults to TRK-042)
  const selectedConvoy = convoys.find((c) => c.id === selectedConvoyId) || convoys[0];

  useEffect(() => {
    if (selectedConvoy?.id) {
      vehicleAnimationService.setPrimaryVehicleId(selectedConvoy.id);
    }
  }, [selectedConvoy?.id]);

  // Dynamic synchronized metrics from real-time vehicle movement
  const liveProgressPercent = Math.round((vehicleProgress || 0.68) * 100);
  const liveDistanceDone = Math.round((vehicleProgress || 0.68) * 312);
  const liveDistanceLeft = Math.max(0, 312 - liveDistanceDone);
  const hoursRemaining = liveDistanceLeft / Math.max(20, selectedConvoy.speedKmh || 46);
  const etaHrs = Math.floor(hoursRemaining);
  const etaMins = Math.round((hoursRemaining - etaHrs) * 60);
  const liveEta = `${etaHrs}h ${etaMins.toString().padStart(2, '0')}m`;

  // Helper for status badge styling
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Moving':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'Idle':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Stopped':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-[#F4F7FB] px-4 sm:px-6 lg:px-8 py-5 select-none text-slate-800">
      
      {/* Subheader Greeting & Action Buttons matching reference screenshot */}
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={navigateToFleetView}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-2 shadow-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>← Back to Vehicle Fleet</span>
          </button>
          <div className="text-sm font-medium text-slate-500">
            Good afternoon,
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
            John Williamson!
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export CSV
          </button>

          <button 
            onClick={() => setIsAddRouteModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add route
          </button>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto flex flex-col gap-6">

        {/* ========================================================================= */}
        {/* ROW 1: 4 LIVE TELEMETRY KPI CARDS (SPEED, DISTANCE, ETA, CARGO TYPE)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Current Speed & Movement Status */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">Current Speed</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedConvoy.movementStatus || 'Moving')}`}>
                ● {selectedConvoy.movementStatus || 'Moving'}
              </span>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  {selectedConvoy.speedKmh} <span className="text-base font-normal text-slate-500">km/h</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  GPS Heading: {selectedConvoy.headingDeg}° N
                </div>
              </div>

              {/* Mini Speed Meter Bars */}
              <div className="flex items-end gap-1 h-10">
                <div className={`w-2 rounded-full ${selectedConvoy.speedKmh > 10 ? 'h-4 bg-blue-600' : 'h-2 bg-slate-200'}`} />
                <div className={`w-2 rounded-full ${selectedConvoy.speedKmh > 20 ? 'h-6 bg-blue-600' : 'h-2 bg-slate-200'}`} />
                <div className={`w-2 rounded-full ${selectedConvoy.speedKmh > 30 ? 'h-8 bg-blue-600' : 'h-2 bg-slate-200'}`} />
                <div className={`w-2 rounded-full ${selectedConvoy.speedKmh > 40 ? 'h-10 bg-orange-400' : 'h-2 bg-slate-200'}`} />
              </div>
            </div>
          </div>

          {/* 2. Distance Tracking (Completed vs Remaining) */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">Distance Tracking</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {liveDistanceLeft} km left
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                  {liveDistanceDone} <span className="text-sm font-normal text-slate-500">km completed</span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {liveProgressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2 p-0.5">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${liveProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Estimated Travel Time (ETA) */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">Estimated Travel Time</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live GPS Sync
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  {liveEta}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Est. Arrival: <span className="font-bold text-slate-800">{liveEta}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Terminus</div>
                <div className="text-xs font-bold text-slate-800">Itanagar</div>
              </div>
            </div>
          </div>

          {/* 4. Load / Cargo Type */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">Load / Cargo Type</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {selectedConvoy.cargoCategory}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-lg font-bold text-slate-900 truncate" title={selectedConvoy.cargoManifest}>
                {selectedConvoy.cargoManifest.split('(')[0]}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-1">
                <span>Payload: <strong className="text-slate-800">{selectedConvoy.grossWeightKg.toLocaleString()} kg</strong></span>
                {selectedConvoy.cargoTempCelsius !== undefined && (
                  <span className="text-blue-600 font-bold">{selectedConvoy.cargoTempCelsius}°C Cold Chain</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 2: 3 CORE FEATURE CARDS (VEHICLE SHOWCASE, CURRENT TRIP, LIVE MAP)    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 1. Delivery Vehicle Showcase Card (Left, 5 cols) */}
          <div className="lg:col-span-5 saas-card p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 font-display">
                    Vehicle No: {selectedConvoy.vehicleNo || 'Truck #TRK-042'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    ID: {selectedConvoy.id.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {selectedConvoy.vehicleClass}
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedConvoy.movementStatus || 'Moving')}`}>
                {selectedConvoy.movementStatus || 'Moving'}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center my-3">
              {/* Left Spec Pill Blocks */}
              <div className="col-span-5 flex flex-col gap-2.5">
                {/* Driver Name & Contact */}
                <div className="bg-[#F0F6FF] rounded-xl p-2.5 border border-blue-50">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-600" />
                    Driver Name & Contact
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {selectedConvoy.operator}
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    {selectedConvoy.driverContact || '+91 94360 28194'}
                  </div>
                </div>

                {/* Current Location */}
                <div className="bg-[#F0F6FF] rounded-xl p-2.5 border border-blue-50">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    Current Location
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    KM {liveDistanceDone}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {Math.round(55 + (liveProgressPercent * 7))}m MSL
                  </div>
                </div>

                {/* Speed & Cargo */}
                <div className="bg-[#F0F6FF] rounded-xl p-2.5 border border-blue-50">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Package className="w-3 h-3 text-blue-600" />
                    Load & Cargo Type
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    {selectedConvoy.cargoCategory}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Gross: {selectedConvoy.grossWeightKg.toLocaleString()} kg
                  </div>
                </div>
              </div>

              {/* Right: Realistic 3D White Cargo Truck Visual with Transparent Background */}
              <div className="col-span-7 flex items-center justify-center relative p-1">
                <img
                  src="/truck.png"
                  alt="Delivery Truck"
                  className="w-full h-auto object-contain max-h-[180px] drop-shadow-sm transition-transform duration-300 hover:scale-105 pointer-events-none select-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Current Trip Journey Card (Middle, 3.5 cols) */}
          <div className="lg:col-span-3 saas-card p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  CURRENT ROUTE
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug font-display">
                  {selectedConvoy.currentRoute || 'Guwahati ➔ Tezpur ➔ Bhalukpong ➔ Itanagar'}
                </h3>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Journey Milestone Timeline: Start Location, Current Location, Destination */}
            <div className="my-3 space-y-2">
              {/* Start Location */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </div>
                  <div className="w-0.5 h-7 border-l-2 border-dotted border-blue-300 my-0.5" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 font-medium">Start Location</div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedConvoy.startLocation || 'Guwahati, Assam (Starting Point)'}
                  </div>
                </div>
              </div>

              {/* Current Location */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                  <div className="w-0.5 h-7 border-l-2 border-dotted border-blue-300 my-0.5" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 font-medium">Current Location</div>
                  <div className="text-xs font-bold text-slate-900">
                    KM {selectedConvoy.currentKm} • {selectedConvoy.altitudeMeters}m MSL
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    Speed: {selectedConvoy.speedKmh} km/h • {selectedConvoy.movementStatus || 'Moving'}
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 font-medium">Destination</div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedConvoy.destination || 'Itanagar, Arunachal Pradesh (Destination)'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    ETA: {selectedConvoy.eta || '6h 45m'}
                  </div>
                </div>
              </div>
            </div>

            {/* Distance & Travel Time Status Pill */}
            <div className="p-2.5 rounded-2xl bg-[#F0F6FF] border border-blue-50 space-y-1 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Distance Completed:</span>
                <span className="font-bold text-slate-900">{liveDistanceDone} km</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Distance Remaining:</span>
                <span className="font-bold text-blue-600">{liveDistanceLeft} km</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-blue-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  Est. Travel Time:
                </span>
                <span className="font-bold text-slate-900">{liveEta}</span>
              </div>
            </div>
          </div>

          {/* 3. Live Route Map Card (Right, 3.5 cols) - FIRSTLY ONLY MAP IS VISIBLE, CLICKS TO EXPAND FULL SCREEN */}
          <div className="lg:col-span-4 saas-card p-5 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Live Route Map
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tracking {selectedConvoy.vehicleNo || 'Truck #TRK-042'} • Real-time
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFullGisExpanded(true)}
                  title="Click to Expand Full Screen Live Tracking"
                  className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Leaflet Route Map (Firstly only map is visible, clicking opens full-screen photo layout) */}
            <div 
              onClick={() => setIsFullGisExpanded(true)}
              className="w-full h-[255px] rounded-2xl overflow-hidden relative border border-slate-200/90 shadow-inner cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all"
            >
              <NerMap isCompact={true} singleVehicleOnly={true} onExpandClick={() => setIsFullGisExpanded(true)} />
              
              {/* Subtle hover prompt overlay */}
              <div className="absolute inset-x-0 bottom-0 py-1.5 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold">
                Click anywhere to expand full map
              </div>
            </div>
          </div>

        </div>

      </div>

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
                          {selectedConvoy?.vehicleNo || 'Truck #TRK-042'}
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
                  singleVehicleOnly={true}
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
                        Moderate Risk
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

      {/* Floating Selected Convoy Telemetry HUD */}
      {selectedConvoyId && (
        <ConvoyTelemetryHud
          convoy={selectedConvoy}
          onClose={() => setSelectedConvoyId(null)}
        />
      )}

      {/* Floating Hazard Sector Inspector HUD */}
      {isHazardInspectorOpen && (
        <HazardSectorHud
          onClose={() => setIsHazardInspectorOpen(false)}
        />
      )}

      {/* Add Convoy / Vehicle Modal */}
      <AddConvoyModal />

      {/* Add Custom Route Modal */}
      <AddRouteModal />

    </div>
  );
};
