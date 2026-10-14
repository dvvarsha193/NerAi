import React from 'react';
import { ChevronRight, Megaphone } from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

export const LiveAlertsCard: React.FC = () => {
  const { alerts, navigateToAlertsView, setIsHazardInspectorOpen } = useTelemetryStore();

  const getAlertIcon = (title: string) => {
    if (title.toLowerCase().includes('landslide')) {
      return {
        icon: '⚠️',
        bg: 'bg-rose-50 text-rose-600',
      };
    }
    if (title.toLowerCase().includes('rain')) {
      return {
        icon: '🌧️',
        bg: 'bg-blue-50 text-blue-600',
      };
    }
    if (title.toLowerCase().includes('closure') || title.toLowerCase().includes('road')) {
      return {
        icon: '⛔',
        bg: 'bg-rose-50 text-rose-600',
      };
    }
    if (title.toLowerCase().includes('flood')) {
      return {
        icon: '🌊',
        bg: 'bg-cyan-50 text-cyan-600',
      };
    }
    return {
      icon: '🚗',
      bg: 'bg-amber-50 text-amber-600',
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 flex flex-col justify-between h-full">
      
      {/* Card Header matching reference screenshot */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="text-rose-500">
            <Megaphone className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-display">
            Live Alerts
          </h3>
        </div>

        <button 
          onClick={navigateToAlertsView}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Alert List matching reference screenshot */}
      <div className="flex-1 flex flex-col justify-between gap-1">
        {alerts.slice(0, 5).map((alert) => {
          const iconMeta = getAlertIcon(alert.title);

          return (
            <div
              key={alert.id}
              onClick={() => setIsHazardInspectorOpen(true)}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${iconMeta.bg} flex items-center justify-center text-xs flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                  {iconMeta.icon}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {alert.title}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium -mt-0.5">
                    {alert.timestamp}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          );
        })}
      </div>

    </div>
  );
};
