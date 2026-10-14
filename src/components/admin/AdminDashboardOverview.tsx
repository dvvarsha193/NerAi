import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Navigation,
  Sliders,
  Cpu,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Map
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

export const AdminDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { convoys, alerts, setSelectedConvoyId, navigateToIndividualVehicle } = useTelemetryStore();

  const handleVehicleClick = (convoyId: string) => {
    setSelectedConvoyId(convoyId);
    navigateToIndividualVehicle(convoyId);
    navigate('/admin/vehicle-gis');
  };

  return (
    <div className="w-full min-h-full bg-[#F3F7FA] px-4 sm:px-6 py-6 select-none text-slate-800 space-y-6">
      <div className="max-w-[1920px] mx-auto w-full space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. OPERATIONS OVERVIEW HEADER                                             */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Operations Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time overview of your NerLogix logistics network.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Network Nominal • 94.2% On-Time</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP METRICS STRIP (5 Metrics)                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* 1. Active Vehicles */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-display leading-tight">12</div>
              <div className="text-[11px] font-medium text-slate-400">Active Vehicles</div>
            </div>
          </div>

          {/* 2. In Transit */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-display leading-tight">11</div>
              <div className="text-[11px] font-medium text-slate-400">In Transit</div>
            </div>
          </div>

          {/* 3. At Risk */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600 font-display leading-tight">3</div>
              <div className="text-[11px] font-medium text-slate-400">At Risk</div>
            </div>
          </div>

          {/* 4. Pending Decisions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600 font-display leading-tight">1</div>
              <div className="text-[11px] font-medium text-slate-400">Pending Decisions</div>
            </div>
          </div>

          {/* 5. Deliveries Today */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-display leading-tight">28</div>
              <div className="text-[11px] font-medium text-slate-400">Deliveries Today</div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN SECTION: Fleet Operations + Needs Attention                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left 8 Cols: Fleet Operations Map Overview */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                  Fleet Operations (Northeast Tactical Corridor)
                </h3>
              </div>
              <button
                onClick={() => navigate('/admin/vehicle-gis')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Vehicle GIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Preview Canvas */}
            <div 
              onClick={() => navigate('/admin/vehicle-gis')}
              className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 min-h-[300px] cursor-pointer group my-2"
            >
              {/* Background map simulation graphic */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/30 to-emerald-50/30 p-6 flex flex-col justify-between">
                
                {/* Simulated Waypoints & Pins */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Guwahati Depot (Hub)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>Shillong Station</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span>Tura Delivery Center</span>
                  </div>
                </div>

                {/* Animated Convoy Track Preview */}
                <div className="relative py-8">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-3/4 rounded-full"></div>
                  </div>
                  <div className="absolute left-[38%] -top-1 bg-white p-1.5 rounded-xl border border-blue-300 shadow-md flex items-center gap-2 group-hover:scale-110 transition-transform">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-black text-slate-900">NER-TRK-01 (68%)</span>
                  </div>
                </div>

                {/* Overlay Prompt */}
                <div className="flex items-center justify-between text-xs text-slate-500 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">12 Telemetry nodes active across Assam, Meghalaya & Arunachal</span>
                  <span className="text-blue-600 font-bold group-hover:underline">Click to interact on live Leaflet GIS →</span>
                </div>

              </div>
            </div>
          </div>

          {/* Right 4 Cols: Needs Your Attention */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                Needs Your Attention
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold border border-rose-200">
                2 Critical
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Attention Item 1: Landslide Risk */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.2 rounded-md bg-rose-600 text-white text-[9px] font-black tracking-wider">
                    CRITICAL
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">10:24 AM</span>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Landslide Risk Detected</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <strong>NER-TRK-07</strong> • NH-6, Meghalaya (Mawkdok Sector)
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>AI alternate route available (-63 pts risk)</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/reroute')}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Review Reroute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Attention Item 2: Heavy Rain */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.2 rounded-md bg-amber-600 text-white text-[9px] font-black tracking-wider">
                    HEAVY RAIN
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">10:22 AM</span>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Reduced Visibility Alert</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <strong>NER-TRK-12</strong> • 32 km ahead near Nongpoh
                  </div>
                </div>
                <button
                  onClick={() => handleVehicleClick('NER-TRK-12')}
                  className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Vehicle</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* View All Alerts Link */}
            <button
              onClick={() => navigate('/admin/alerts')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 text-center w-full pt-1 cursor-pointer"
            >
              View All 18 Operational Alerts →
            </button>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. NER AI OPERATIONS BRIEF                                                */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border border-blue-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900 font-display">
                  NER AI Operations Brief
                </h4>
                <span className="px-2 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[9px] font-extrabold">
                  LIVE SYNTHESIS
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                3 vehicles currently require attention. Heavy rainfall is expected across two Meghalaya corridors. NER-TRK-07 currently has the highest predicted route risk and two alternative routes are available.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => navigate('/admin/ner-ai')}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Ask NER AI</span>
            </button>
            <button
              onClick={() => navigate('/admin/alerts')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Risks</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. TODAY'S JOURNEYS TABLE + ADMIN QUICK ACTIONS & ACTIVITY FEED           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left 8 Cols: Today's Journeys */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                Today's Journeys
              </h3>
              <span className="text-xs font-bold text-slate-400">12 Active Convoys</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400">
                    <th className="py-2.5">Vehicle</th>
                    <th className="py-2.5">Journey</th>
                    <th className="py-2.5">Progress</th>
                    <th className="py-2.5">ETA</th>
                    <th className="py-2.5">Risk</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  
                  {/* Row 1: NER-TRK-01 */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-blue-600 cursor-pointer" onClick={() => handleVehicleClick('NER-TRK-01')}>
                      NER-TRK-01
                    </td>
                    <td className="py-3 text-slate-800 font-semibold">Guwahati ➔ Shillong</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 max-w-[100px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[68%]"></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">68%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-semibold">11:42 AM</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        24 Low
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                        In Transit
                      </span>
                    </td>
                  </tr>

                  {/* Row 2: NER-TRK-02 */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-blue-600 cursor-pointer" onClick={() => handleVehicleClick('NER-TRK-02')}>
                      NER-TRK-02
                    </td>
                    <td className="py-3 text-slate-800 font-semibold">Guwahati ➔ Silchar</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 max-w-[100px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[42%]"></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">42%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-semibold">2:15 PM</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                        62 Moderate
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        Monitoring
                      </span>
                    </td>
                  </tr>

                  {/* Row 3: NER-TRK-07 */}
                  <tr className="hover:bg-slate-50/80 transition-colors bg-rose-50/20">
                    <td className="py-3 font-bold text-rose-600 cursor-pointer" onClick={() => handleVehicleClick('NER-TRK-07')}>
                      NER-TRK-07
                    </td>
                    <td className="py-3 text-slate-800 font-semibold">Shillong ➔ Tura</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 max-w-[100px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full w-[31%]"></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">31%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-semibold">3:20 PM</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                        87 Critical
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate('/admin/reroute')}
                        className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs cursor-pointer hover:bg-rose-700"
                      >
                        Reroute Required
                      </button>
                    </td>
                  </tr>

                  {/* Row 4: NER-TRK-04 */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-blue-600 cursor-pointer" onClick={() => handleVehicleClick('NER-TRK-04')}>
                      NER-TRK-04
                    </td>
                    <td className="py-3 text-slate-800 font-semibold">Tezpur ➔ Tawang (Sela Tunnel)</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 max-w-[100px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[84%]"></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">84%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-semibold">12:30 PM</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        18 Low
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Rerouted & Safe
                      </span>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4 Cols: Admin Quick Actions & Recent Activity */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. Admin Quick Actions (4 Buttons) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight font-display pb-2 border-b border-slate-100">
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigate('/admin/route-info')}
                  className="p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left transition-all cursor-pointer group"
                >
                  <Navigation className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-slate-900">Plan Journey</div>
                  <div className="text-[10px] text-slate-500">Route Info</div>
                </button>

                <button
                  onClick={() => navigate('/admin/vehicle-gis')}
                  className="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-left transition-all cursor-pointer group"
                >
                  <MapPin className="w-4 h-4 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-slate-900">Track Vehicle</div>
                  <div className="text-[10px] text-slate-500">Vehicle GIS</div>
                </button>

                <button
                  onClick={() => navigate('/admin/alerts')}
                  className="p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-all cursor-pointer group"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-slate-900">Review Alerts</div>
                  <div className="text-[10px] text-slate-500">Alerts & Risks</div>
                </button>

                <button
                  onClick={() => navigate('/admin/ner-ai')}
                  className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all cursor-pointer group"
                >
                  <Cpu className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-slate-900">Ask NER AI</div>
                  <div className="text-[10px] text-slate-500">AI Assistant</div>
                </button>
              </div>
            </div>

            {/* 2. Recent Activity Feed */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight font-display pb-2 border-b border-slate-100">
                Recent Activity
              </h3>

              <div className="space-y-2.5 text-xs">
                
                <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 w-14 flex-shrink-0">10:24 AM</span>
                  <div>
                    <span className="font-bold text-slate-900">NER-TRK-07</span>
                    <span className="text-rose-600 ml-1.5 font-semibold">Landslide risk detected</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 w-14 flex-shrink-0">10:22 AM</span>
                  <div>
                    <span className="font-bold text-slate-900">NER-TRK-12</span>
                    <span className="text-amber-600 ml-1.5 font-semibold">Heavy rainfall alert</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 w-14 flex-shrink-0">10:18 AM</span>
                  <div>
                    <span className="font-bold text-slate-900">NER-TRK-04</span>
                    <span className="text-emerald-600 ml-1.5 font-semibold">Reroute approved</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 w-14 flex-shrink-0">10:11 AM</span>
                  <div>
                    <span className="font-bold text-slate-900">NER-TRK-01</span>
                    <span className="text-slate-600 ml-1.5">Reached Nongpoh</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[10px] font-bold text-slate-400 w-14 flex-shrink-0">09:56 AM</span>
                  <div>
                    <span className="font-bold text-slate-900">NER-TRK-08</span>
                    <span className="text-blue-600 ml-1.5 font-semibold">Delivery completed</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboardOverview;
