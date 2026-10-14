import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, Clock, MapPin, Download } from 'lucide-react';

const WEEKLY_RISK_DATA = [
  { day: 'Mon', onTime: 96, riskScore: 22, reroutes: 1 },
  { day: 'Tue', onTime: 92, riskScore: 35, reroutes: 2 },
  { day: 'Wed', onTime: 88, riskScore: 58, reroutes: 4 },
  { day: 'Thu', onTime: 94, riskScore: 28, reroutes: 1 },
  { day: 'Fri', onTime: 98, riskScore: 18, reroutes: 0 },
  { day: 'Sat', onTime: 95, riskScore: 24, reroutes: 1 },
  { day: 'Sun', onTime: 97, riskScore: 20, reroutes: 0 },
];

const CORRIDOR_EFFICIENCY = [
  { name: 'NH-27 Guwahati ⇄ Tezpur', efficiency: 98, avgSpeed: 72 },
  { name: 'NH-6 Guwahati ⇄ Shillong', efficiency: 84, avgSpeed: 48 },
  { name: 'NH-13 Bhalukpong ⇄ Tawang', efficiency: 76, avgSpeed: 38 },
  { name: 'NH-306 Silchar ⇄ Aizawl', efficiency: 82, avgSpeed: 42 },
];

export const AdminAnalyticsView: React.FC = () => {
  return (
    <div className="w-full min-h-full bg-[#F3F7FA] px-4 sm:px-6 py-6 select-none text-slate-800 space-y-6">
      <div className="max-w-[1920px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Network Analytics & Telemetry Performance
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Longitudinal corridor risk trends, on-time reliability, and dynamic reroute efficiency.
            </p>
          </div>

          <button className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto">
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics CSV</span>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Chart 1: On-time vs Risk Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 tracking-tight font-display">
                Weekly Corridor Performance & Risk Index
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Past 7 Days</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_RISK_DATA}>
                  <defs>
                    <linearGradient id="onTimeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="onTime" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#onTimeGrad)" name="On-Time %" />
                  <Area type="monotone" dataKey="riskScore" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Avg Risk Index" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Corridor Efficiency Breakdown */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-display pb-2 border-b border-slate-100">
              Corridor Efficiency Score
            </h3>

            <div className="space-y-4">
              {CORRIDOR_EFFICIENCY.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="font-black text-blue-600">{c.efficiency}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.efficiency}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400">Avg Speed: {c.avgSpeed} km/h</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✨ AI rerouting saved <strong>14.2 hours</strong> across all active corridors this week.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsView;
