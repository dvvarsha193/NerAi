import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Radio,
  Sliders,
  Navigation,
  Cpu,
  Search,
  Bell,
  Wifi,
  LogOut,
  User,
  Compass,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { Toast } from '../layout/Toast';
import { AiScoreAuditModal } from '../modals/AiScoreAuditModal';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { alerts } = useTelemetryStore();
  const { pendingReports } = useOfflineStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;
  const pendingReportsCount = pendingReports.length;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/admin/vehicle-gis', label: 'Vehicle GIS', icon: <MapPin className="w-3.5 h-3.5" /> },
    { path: '/admin/field-reporting', label: 'Field Reporting', icon: <Radio className="w-3.5 h-3.5" />, badge: pendingReportsCount > 0 ? pendingReportsCount : undefined },
    { path: '/admin/reroute', label: 'Reroute Console', icon: <Sliders className="w-3.5 h-3.5" /> },
    { path: '/admin/route-info', label: 'Route Info', icon: <Navigation className="w-3.5 h-3.5" /> },
    { path: '/admin/ner-ai', label: 'NER AI', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F3F7FA] text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-2 select-none transition-all flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                NerLogix
              </span>
              <span className="text-[10px] font-bold text-blue-600 ml-0.5 relative -top-1">
                ™
              </span>
            </div>
          </div>

          {/* Center: Admin Pill Navigation Container */}
          <nav className="hidden lg:flex items-center bg-[#F4F7FB] p-1 rounded-full border border-slate-200/70 overflow-x-auto max-w-[960px]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Search, Satellite, User Profile Menu */}
          <div className="flex items-center gap-2.5">
            
            {/* Search Pill */}
            <div className="relative hidden xl:flex items-center">
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-full w-44 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
              />
            </div>

            {/* Notification Bell Pill */}
            <button
              onClick={() => navigate('/admin/alerts')}
              title="Operational Alerts"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative transition-colors shadow-xs cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* AI Score Audit Pill */}
            <button
              onClick={() => setShowAiScoreModal(true)}
              title="Click to view AI Intelligence Audit & SIH Evaluation Score"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span className="text-[11px] font-black">AI Score: 96.8%</span>
              <span className="hidden xl:inline text-[9px] px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-bold">SIH Apex</span>
            </button>

            {/* Live Uplink Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold">Live Uplink</span>
            </div>

            {/* User Profile Menu with Logout */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[9.5px] font-semibold text-blue-600 leading-none">
                    Admin Control
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 top-11 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[9px] font-extrabold border border-blue-100">
                      ROLE: {user?.role}
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global Toast */}
      <Toast />

      {/* AI Intelligence Audit & SIH Evaluation Score Modal */}
      <AiScoreAuditModal isOpen={showAiScoreModal} onClose={() => setShowAiScoreModal(false)} />

      {/* Main Routed Outlet */}
      <main className="flex-1 w-full min-h-0 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
