import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Truck,
  Navigation,
  AlertTriangle,
  FileText,
  LogOut,
  User,
  Compass,
  Wifi,
  PhoneCall
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Toast } from '../layout/Toast';

export const DriverLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] text-slate-800 flex flex-col select-none">
      
      {/* Driver Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all flex-shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Driver Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900 font-display">
                  NerLogix
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Driver Cockpit
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                <span>{user?.name || 'Rohit Das'}</span>
                <span>•</span>
                <span className="font-mono text-slate-700 font-bold">{user?.assignedVehicle || 'NER-TRK-01'}</span>
              </div>
            </div>
          </div>

          {/* Right: Driver Status, Satellite Link & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* ISRO Satellite Uplink */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>GSAT-7A Uplink</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>

            {/* Live GPS Mode */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live GPS Active</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Global Toast */}
      <Toast />

      {/* Driver Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 pb-20">
        <Outlet />
      </main>

    </div>
  );
};

export default DriverLayout;
