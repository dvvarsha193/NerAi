import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Sliders,
  History,
  LogOut,
  Compass,
  Zap,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Toast } from '../layout/Toast';

export const SimulationLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] text-slate-800 flex flex-col select-none">
      
      {/* Simulation Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 transition-all flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Simulation Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900 font-display">
                  NerLogix
                </span>
                <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                  Simulation Operator
                </span>
              </div>
            </div>
          </div>

          {/* Right: Operator Name & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {user?.name || 'Simulation Operator'}
              </div>
              <div className="text-[10px] font-semibold text-purple-600 leading-none">
                Tactical Stress Console
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-full bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Global Toast */}
      <Toast />

      {/* Main Outlet */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-20">
        <Outlet />
      </main>

    </div>
  );
};

export default SimulationLayout;
