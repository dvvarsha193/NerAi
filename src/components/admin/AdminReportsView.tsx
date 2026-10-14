import React from 'react';
import { FileText, Download, CheckCircle2, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const reports = [
    {
      title: 'NH-6 Meghalaya Monsoon Landslide Impact Assessment',
      date: '16 Oct 2024, 08:30 AM',
      type: 'GEOLOGICAL RISK AUDIT',
      status: 'VERIFIED',
      convoysProtected: 4,
      author: 'ISRO Bhuvan & NER AI LEWS',
    },
    {
      title: 'Sela Tunnel / Trans-Himalayan Winter Resilience Dossier',
      date: '15 Oct 2024, 04:15 PM',
      type: 'INFRASTRUCTURE STATUS',
      status: 'OPERATIONAL',
      convoysProtected: 6,
      author: 'Border Roads Organization (BRO)',
    },
    {
      title: 'Guwahati Logistics Hub Weekly Safety Compliance Summary',
      date: '14 Oct 2024, 06:00 PM',
      type: 'FLEET COMPLIANCE',
      status: 'NOMINAL',
      convoysProtected: 12,
      author: 'NerLogix Operational Command',
    },
    {
      title: 'Silchar–Aizawl Heavy Precipitation & Drainage Clearance',
      date: '13 Oct 2024, 11:20 AM',
      type: 'WEATHER AUDIT',
      status: 'MITIGATING',
      convoysProtected: 2,
      author: 'IMD Doppler Cell',
    },
  ];

  return (
    <div className="w-full min-h-full bg-[#F3F7FA] px-4 sm:px-6 py-6 select-none text-slate-800 space-y-6">
      <div className="max-w-[1920px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              System Audit & Operational Reports
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Certified hazard logs, reroute decisions, and field compliance dossiers.
            </p>
          </div>

          <button className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto">
            <FileText className="w-3.5 h-3.5" />
            <span>Generate New Audit Report</span>
          </button>
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-100">
                    {r.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{r.date}</span>
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 leading-snug">
                  {r.title}
                </h3>

                <div className="text-[11px] text-slate-500">
                  Compiled by: <strong>{r.author}</strong> • {r.convoysProtected} convoys safeguarded
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{r.status}</span>
                </span>

                <button className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminReportsView;
