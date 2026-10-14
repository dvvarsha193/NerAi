import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Columns, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { Convoy } from '../../types';

export const FleetTelemetryMatrix: React.FC = () => {
  const { convoys, navigateToIndividualVehicle, setSelectedConvoyId } = useTelemetryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | 'Moving' | 'Delayed' | 'Idle'>('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter convoys
  const filteredConvoys = convoys.filter((c) => {
    const matchesSearch = 
      (c.vehicleNo?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (c.callsign.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.operator.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.cargoCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.currentRoute?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (c.destination.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      activeStatusFilter === 'ALL' || 
      c.movementStatus === activeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredConvoys.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredConvoys.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRowClick = (convoyId: string) => {
    navigateToIndividualVehicle(convoyId);
  };

  const getStatusPill = (status?: string) => {
    switch (status) {
      case 'Moving':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Moving
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Delayed
          </span>
        );
      case 'Idle':
      case 'Stopped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Idle
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {status || 'Active'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col gap-4 select-none">
      
      {/* Table Header Controls matching reference screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
            Fleet Telemetry & Real-Time Tracking Matrix
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Full overview of all active transport convoys on NH-13 and connected routes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vehicle ID, driver or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-full w-60 sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                activeStatusFilter !== 'ALL' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter {activeStatusFilter !== 'ALL' ? `(${activeStatusFilter})` : ''}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 space-y-1">
                <button
                  onClick={() => { setActiveStatusFilter('ALL'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${activeStatusFilter === 'ALL' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  All Statuses
                </button>
                <button
                  onClick={() => { setActiveStatusFilter('Moving'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${activeStatusFilter === 'Moving' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  ● Moving Only
                </button>
                <button
                  onClick={() => { setActiveStatusFilter('Delayed'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${activeStatusFilter === 'Delayed' ? 'bg-rose-50 text-rose-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  ● Delayed Only
                </button>
                <button
                  onClick={() => { setActiveStatusFilter('Idle'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${activeStatusFilter === 'Idle' ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  ● Idle Only
                </button>
              </div>
            )}
          </div>

          {/* Columns Button */}
          <button className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-slate-500" />
            <span>Columns</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredConvoys.length && filteredConvoys.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Vehicle No & ID</th>
              <th className="py-3 px-3">Driver & Contact</th>
              <th className="py-3 px-3">Current Location</th>
              <th className="py-3 px-3">Speed</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Load / Cargo Type</th>
              <th className="py-3 px-3">Current Route</th>
              <th className="py-3 px-3">Start ➔ Destination</th>
              <th className="py-3 px-3">Distance (Done / Left)</th>
              <th className="py-3 px-3">ETA</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {filteredConvoys.map((convoy) => {
              const isSelected = selectedIds.includes(convoy.id);

              return (
                <tr
                  key={convoy.id}
                  onClick={() => handleRowClick(convoy.id)}
                  className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                    isSelected ? 'bg-blue-50/60' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(convoy.id, e as any)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Vehicle No & ID */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display">
                          {convoy.vehicleNo || convoy.callsign}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          {convoy.callsign}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Driver & Contact */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">
                      {convoy.operator}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {convoy.driverContact || '+91 94360 28194'}
                    </div>
                  </td>

                  {/* Current Location */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">
                      KM {convoy.currentKm}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {convoy.altitudeMeters}m MSL
                    </div>
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {convoy.speedKmh} km/h
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusPill(convoy.movementStatus)}
                  </td>

                  {/* Load / Cargo Type */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 truncate max-w-[150px]" title={convoy.cargoCategory}>
                      {convoy.cargoCategory}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {convoy.grossWeightKg.toLocaleString()} kg
                    </div>
                  </td>

                  {/* Current Route */}
                  <td className="py-3 px-3 text-slate-600 max-w-[170px] truncate" title={convoy.currentRoute}>
                    {convoy.currentRoute || 'NH-13 Trans-Himalayan'}
                  </td>

                  {/* Start ➔ Destination */}
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-semibold truncate max-w-[180px]">
                      {convoy.origin.split(',')[0]} ➔ {convoy.destination.split('➔')[0]}
                    </div>
                    {convoy.destination.includes('➔') && (
                      <div className="text-[10px] text-blue-600 font-medium truncate max-w-[180px]">
                        ➔ {convoy.destination.split('➔')[1]}
                      </div>
                    )}
                  </td>

                  {/* Distance (Done / Left) */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{convoy.distanceCompletedKm} km</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-blue-600 font-semibold">{convoy.distanceRemainingKm} km left</span>
                  </td>

                  {/* ETA */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      {convoy.eta}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {convoy.estimatedTravelTime?.split('(')[1]?.replace(')', '') || 'Live GPS'}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRowClick(convoy.id)}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition-all shadow-xs"
                      >
                        View
                      </button>
                      <button
                        title="More Options"
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
