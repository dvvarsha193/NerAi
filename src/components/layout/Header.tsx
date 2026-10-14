import React, { useState } from 'react';
import {
  MapPin,
  Sliders,
  Navigation,
  Cpu,
  Terminal,
  Search,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Compass,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { TacticalScreen } from '../../types';

export const Header: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    alerts,
    isSoundActive,
    toggleSound
  } = useTelemetryStore();

  const {
    pendingReports,
  } = useOfflineStore();

  const [searchQuery, setSearchQuery] = useState('');

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  const navItems: { id: TacticalScreen; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'vehicle_gis', label: 'Vehicle GIS', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'reroute_console', label: 'Reroute Console', icon: <Sliders className="w-3.5 h-3.5" />, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'route_info', label: 'Route Info', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'ner_ai', label: 'NER AI', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'field_terminal', label: 'Field Terminal', icon: <Terminal className="w-3.5 h-3.5" />, badge: pendingReports.length > 0 ? pendingReports.length : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-2.5 select-none transition-all">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">

        {/* Left: Brand Identity matching reference screenshot */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-extrabold tracking-tight text-black font-brand">
              NerLogix
            </span>
            <span className="text-[10px] font-bold text-black ml-0.5 relative -top-1">
              ™
            </span>
          </div>
        </div>

        {/* Center: Clean Pill Navigation Container matching reference screenshot */}
        <nav className="hidden md:flex items-center bg-[#F4F7FB] p-1 rounded-full border border-slate-200/70">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${isActive
                    ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Search Pill, Quick Actions, Profile matching reference screenshot */}
        <div className="flex items-center gap-2.5">

          {/* Search Pill */}
          <div className="relative hidden lg:flex items-center">
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Start searching here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-full w-52 xl:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
            />
          </div>

          {/* Notification Bell Pill */}
          <button
            onClick={() => setActiveScreen('reroute_console')}
            title="Operational Alerts"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Satellite Uplink Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold">Live Uplink</span>
          </div>

          {/* User Profile Avatar with Online Status Pill */}
          <div className="flex items-center pl-1">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>

        </div>

      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around gap-1 pt-2 mt-1 border-t border-slate-100 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isActive ? 'bg-[#2563EB] text-white' : 'text-slate-600'
                }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
