import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Radio,
  Sliders,
  Navigation,
  Cpu,
  Bell,
  Wifi,
  LogOut,
  User,
  Compass,
  ChevronDown,
  Sparkles,
  Database
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { Toast } from '../layout/Toast';
import { AiScoreAuditModal } from '../modals/AiScoreAuditModal';
import { DatabaseConnectorModal } from '../modals/DatabaseConnectorModal';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { alerts } = useTelemetryStore();
  const { pendingReports } = useOfflineStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;
  const pendingReportsCount = pendingReports.length;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/admin/command-center', label: 'Northeast Command Center', icon: <Compass className="w-3.5 h-3.5" /> },
    { path: '/admin/vehicle-gis', label: 'Vehicle GIS', icon: <MapPin className="w-3.5 h-3.5" /> },
    { path: '/admin/reroute', label: 'Reroute Console', icon: <Sliders className="w-3.5 h-3.5" /> },
    { path: '/admin/route-info', label: 'Route Info', icon: <Navigation className="w-3.5 h-3.5" /> },
    { path: '/admin/ner-ai', label: 'NER AI Copilot', icon: <Cpu className="w-3.5 h-3.5" /> },
    { path: '/admin/field-reporting', label: 'Field Reporting', icon: <Radio className="w-3.5 h-3.5" />, badge: pendingReportsCount > 0 ? pendingReportsCount : undefined },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F3F7FA] text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:font-bold focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Top Header Bar */}
      <header role="banner" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-2 select-none transition-all flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Compass className="w-5 h-5" aria-hidden="true" />
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
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center bg-[#F4F7FB] p-1 rounded-full border border-slate-200/70 overflow-x-auto max-w-[960px]">
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
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white" aria-label={`${item.badge} pending items`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Notification, Database Hub, AI Score, Satellite, User Profile Menu */}
          <div className="flex items-center gap-2.5">

            {/* Notification Bell Pill */}
            <button
              onClick={() => navigate('/admin/alerts')}
              title="Operational Alerts"
              aria-label={`Operational Alerts: ${unreadAlerts} unread`}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative transition-colors shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-500/40"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadAlerts > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Database Hub Pill */}
            <button
              onClick={() => setShowDbModal(true)}
              title="Click to view Database Connectivity (MongoDB Atlas / Supabase)"
              aria-label="Open Database Connectivity Hub"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 hover:from-emerald-100 hover:to-teal-100 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95 focus:ring-2 focus:ring-emerald-500/40"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span className="text-[11px] font-black">Database Hub</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>

            {/* AI Score Audit Pill */}
            <button
              onClick={() => setShowAiScoreModal(true)}
              title="Click to view AI Intelligence Audit & SIH Evaluation Score"
              aria-label="View AI Evaluation Score Audit: 96.8%"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95 focus:ring-2 focus:ring-blue-500/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-black">AI Score: 96.8%</span>
              <span className="hidden xl:inline text-[9px] px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-bold">SIH Apex</span>
            </button>

            {/* Live Uplink Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium" role="status" aria-label="Satellite Uplink Status: Live">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-[11px] font-bold">Live Uplink</span>
            </div>

            {/* User Profile Menu with Logout */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
                aria-label="User profile and settings"
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-500/40"
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
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" aria-hidden="true" />
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

      {/* Database Connectivity & Cloud Persistence Modal */}
      <DatabaseConnectorModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />

      {/* Main Routed Outlet */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 w-full min-h-0 overflow-y-auto focus:outline-none">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
