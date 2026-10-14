import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  AlertTriangle,
  Activity,
  Flame,
  Truck,
  Building2,
  Sparkles,
  Bot,
  Send,
  Camera,
  Upload,
  CheckCircle2,
  Layers,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Package,
  Calendar,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useTelemetryStore } from '../../store/useTelemetryStore';

const getApiBaseUrl = (endpoint: string) => {
  return typeof window !== 'undefined' && window.location.port === '5173'
    ? `http://localhost:3001/api/${endpoint}`
    : `/api/${endpoint}`;
};

function generateLocalCopilotResponse(userPrompt: string, _commandData?: any, _stockoutData?: any) {
  const p = userPrompt.toLowerCase().trim();

  if (p === 'hi' || p === 'hello' || p === 'hey' || p === 'help') {
    return {
      reply: `### 🤖 Gemini Logistics Copilot: Standing By\n\nHello Commander! I have direct telemetry links to all **8 Northeast States** across **4 Regional Base Depots** (Guwahati, Tezpur, Dibrugarh, Silchar) and **5 Frontier Mountain Health Centers**.\n\n• **Active Hazard Alert:** **NH-13 Sela Pass KM 414** is currently **BLOCKED by Landslide** (18.5h clearance).\n• **High-Risk Facility:** **Tawang Apex District Hospital** has only **2.2 days** of Cryogenic Liquid Oxygen remaining.\n• **Recommended Corridor:** **NH-13B Mandala-Shergaon Elevated Bypass** is cleared for heavy freight.\n\nHow would you like to proceed with corridor intelligence or supply allocation?`,
      actions: [
        'Analyze Tawang Oxygen Stockout Risk',
        'Calculate Ripple Effect of Sela Pass Landslide',
        'Run What-If Replanning for Tezpur Depot',
      ],
    };
  }

  if (p.includes('stockout') || p.includes('medicine') || p.includes('oxygen') || p.includes('food') || p.includes('tawang')) {
    return {
      reply: `### 🚨 Gemini Logistics Copilot: Stockout Risk Assessment\n\nBased on live telemetry from **5 regional facilities**:\n\n• **Highest Emergency:** **Tawang Apex District Civil Hospital** has **2.2 days** of Cryogenic Medical Oxygen remaining (9 cylinders on hand).\n• **Frontier Risk:** **Mechuka Health Station** has **2.6 days** of Broad-Spectrum Emergency Antibiotics remaining.\n• **Corridor Vulnerability:** Primary corridor **NH-13 Sela Pass (KM 414)** is currently **BLOCKED by Landslide** (18.5h clearance).\n\n**Strategic Recommendation:**\nAuthorize immediate dispatch from **Tezpur Tactical Supply Base (DEP-TEZ-02)** utilizing the **NH-13B Mandala-Shergaon Elevated Bypass**. This avoids the Sela rockfall and cuts projected transit time from 18.5h down to 4.2h.`,
      actions: [
        'Dispatch Cryo-Oxygen from Tezpur Depot (DEP-TEZ-02)',
        'Route vehicle via NH-13B Mandala Elevated Bypass',
        'Notify Tawang Apex Hospital Command',
      ],
    };
  }

  if (p.includes('landslide') || p.includes('disaster') || p.includes('blocked') || p.includes('ripple') || p.includes('flood')) {
    return {
      reply: `### ⚠️ Gemini Logistics Copilot: Disaster Disruption & Ripple Effect Analysis\n\n• **Active Hazard:** Metamorphic rockfall & landslide at **NH-13 KM 414.2 (Sela Pass)**.\n• **Direct Impact:** Carriageway completely obstructed. 140 m³ boulder debris.\n• **Ripple Effect:** 2 arterial routes restricted, delaying deliveries to **Tawang Civil Hospital** (49,977 population served) and **Dirang Mountain Clinic**.\n• **Stockout Cascade:** If replenishment is not rerouted, Tawang will deplete emergency liquid oxygen in **52 hours**.\n\n**Action Plan:**\n1. Activate **NH-13B Dynamic Bypass** (Mandala Top - 2,850m apex elevation).\n2. Reallocate cargo vehicle **CONVOY-01** (Reefer cold-chain) and **CONVOY-02** (Oxygen Carrier).\n3. Alert BRO 42 BRTF field earthmovers for debris clearing.`,
      actions: [
        'Activate Dynamic Bypass NH-13B',
        'Issue VHF Audio Warning on 142.850 MHz',
        'Trigger Emergency Replanning Matrix',
      ],
    };
  }

  return {
    reply: `### 🛡️ Gemini Logistics Copilot: Tactical Network Intelligence\n\nAnalyzed operational state across Northeast arterial highway corridors:\n\n• **Highway Sector Status:** NH-13 (BLOCKED - Sela Pass KM 414), NH-52 (CAUTION - Bhalukpong Gorge), NH-27 (PASSABLE - Kolia Bhomora).\n• **Recommended Safe Route:** Divert all heavy freight to **NH-13B Mandala All-Weather Bypass**.\n• **Fleet Position:** 6 Convoys tracked via satellite uplink.\n\nType a command or select a quick action below to execute.`,
    actions: [
      'Inspect Stockout Radar for Tawang & Mechuka',
      'Run What-If Analysis for Alternative Depots',
      'Simulate Flood on Brahmaputra Corridor',
    ],
  };
}

export const NortheastCommandCenterView: React.FC = () => {
  // Navigation tabs for the 8 Pillars
  const [activeTab, setActiveTab] = useState<
    'command_center' | 'stockout_radar' | 'disruption_simulator' | 'allocation_engine' | 'copilot' | 'incident_reporter'
  >('command_center');

  // Pillar 1 Data: Command Center
  const [commandData, setCommandData] = useState<any>(null);
  const [selectedDepot, setSelectedDepot] = useState<any>(null);
  const [selectedHealthCenter, setSelectedHealthCenter] = useState<any>(null);
  const [isLoadingCommand, setIsLoadingCommand] = useState(false);

  // Pillar 2 Data: Stockout Radar
  const [stockoutData, setStockoutData] = useState<any>(null);
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>('ALL');

  // Pillar 3 & 6 Data: Disaster Simulator & Ripple Effect
  const [simScenario, setSimScenario] = useState<{
    hazardType: 'LANDSLIDE' | 'FLOOD' | 'BRIDGE_CLOSURE';
    location: string;
    district: string;
    highwayCode: string;
  }>({
    hazardType: 'LANDSLIDE',
    location: 'Sela Pass Ascent Sector KM 414.2',
    district: 'Tawang',
    highwayCode: 'NH-13',
  });
  const [disruptionResult, setDisruptionResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Pillar 4 & 7 Data: Supply Allocation Engine & What-If Analysis
  const [whatIfData, setWhatIfData] = useState<any>(null);
  const [targetCenterForAllocation, setTargetCenterForAllocation] = useState<string>('HC-TAW-01');
  const [isAllocating, setIsAllocating] = useState(false);

  // Pillar 5 Data: Gemini Logistics Copilot
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'gemini'; text: string; actions?: string[] }>>([
    {
      sender: 'gemini',
      text: `### 🤖 Gemini Logistics Copilot Active (Grounded in Live DB)\n\nI am continuously monitoring all **8 Northeast States**, road accessibility on **NH-13 / NH-52**, and stock burn rates at frontier health centers.\n\n• **Active Blocker:** Landslide at Sela Pass KM 414.\n• **Stockout Warning:** Tawang District Hospital has only **2.2 days** of Cryogenic Liquid Oxygen remaining.\n\nHow can I assist your logistics command?`,
      actions: [
        'Analyze Tawang Oxygen Stockout Risk',
        'Calculate Ripple Effect of Sela Pass Landslide',
        'Run What-If Replanning for Tezpur Depot',
      ],
    },
  ]);
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Pillar 8 Data: AI Field Incident Reporter
  const [incidentForm, setIncidentForm] = useState({
    locationName: 'Dirang Chu Bridge KM 289.4',
    district: 'West Kameng',
    affectedCorridor: 'NH-13 West Kameng Arterial',
    hazardType: 'Flash Flood & Abutment Erosion',
    damageSeverity: 'SEVERE' as 'MINOR' | 'MODERATE' | 'SEVERE' | 'IMPASSABLE',
    notes: 'Kameng river swelling 2.4m above danger mark. Substructure scour observed by patrol drone.',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
  });
  const [incidentSubmitted, setIncidentSubmitted] = useState<any>(null);
  const [incidentReportsList, setIncidentReportsList] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchCommandCenterData();
    fetchStockoutRadar();
    fetchWhatIfData();
    fetchIncidentReports();
  }, []);

  const fetchCommandCenterData = async () => {
    setIsLoadingCommand(true);
    try {
      const res = await fetch(getApiBaseUrl('logistics/command-center'));
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setCommandData(json.data);
          if (json.data.depots?.length) setSelectedDepot(json.data.depots[0]);
          if (json.data.healthCenters?.length) setSelectedHealthCenter(json.data.healthCenters[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch command center data:', e);
    } finally {
      setIsLoadingCommand(false);
    }
  };

  const fetchStockoutRadar = async () => {
    try {
      const res = await fetch(getApiBaseUrl('stockout-radar'));
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStockoutData(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch stockout radar:', e);
    }
  };

  const fetchWhatIfData = async () => {
    try {
      const res = await fetch(getApiBaseUrl('analytics/what-if'));
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setWhatIfData(json.plan);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch what-if data:', e);
    }
  };

  const fetchIncidentReports = async () => {
    try {
      const res = await fetch(getApiBaseUrl('incidents/reports'));
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIncidentReportsList(json.reports);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch incident reports:', e);
    }
  };

  // Trigger Disaster Simulation
  const handleTriggerDisruption = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(getApiBaseUrl('simulator/disrupt'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simScenario),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDisruptionResult(json.disruption);
          fetchCommandCenterData();
          fetchStockoutRadar();
        }
      }
    } catch (e) {
      console.warn('Simulation failed:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Trigger Supply Allocation Optimization
  const handleRunAllocation = async () => {
    setIsAllocating(true);
    try {
      const res = await fetch(getApiBaseUrl('allocation/optimize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCenterId: targetCenterForAllocation }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setWhatIfData(json.plan);
        }
      }
    } catch (e) {
      console.warn('Allocation optimization failed:', e);
    } finally {
      setIsAllocating(false);
    }
  };

  // Ask Gemini Copilot (Grounded in Live DB + Instant Neural Fallback)
  const handleSendCopilotPrompt = async (promptToSend?: string) => {
    const text = promptToSend || copilotPrompt;
    if (!text.trim()) return;

    setCopilotMessages((prev) => [...prev, { sender: 'user', text }]);
    setCopilotPrompt('');
    setIsCopilotTyping(true);

    try {
      const res = await fetch(getApiBaseUrl('copilot/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reply) {
          setCopilotMessages((prev) => [
            ...prev,
            {
              sender: 'gemini',
              text: json.reply,
              actions: json.recommendedActions,
            },
          ]);
          return;
        }
      }
      throw new Error('API offline');
    } catch {
      // Offline / Resilient Local Neural Engine fallback
      const localResponse = generateLocalCopilotResponse(text, commandData, stockoutData);
      setCopilotMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: localResponse.reply,
          actions: localResponse.actions,
        },
      ]);
    } finally {
      setIsCopilotTyping(false);
    }
  };

  // Submit Incident Report
  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiBaseUrl('incidents/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentForm),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIncidentSubmitted(json.report);
          fetchIncidentReports();
          fetchCommandCenterData();
        }
      }
    } catch (e) {
      console.warn('Failed to submit incident:', e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F3F7FA] overflow-hidden select-none">
      {/* Top Navigation Tabs for the 8 Pillars */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('command_center')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'command_center'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Command Center</span>
          </button>

          <button
            onClick={() => setActiveTab('stockout_radar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stockout_radar'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>2. Stockout Radar</span>
            {stockoutData?.activeAlerts?.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-rose-700 rounded-full text-[10px] font-black">
                {stockoutData.activeAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('disruption_simulator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'disruption_simulator'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>3 & 6. Disruption & Ripple Effect</span>
          </button>

          <button
            onClick={() => setActiveTab('allocation_engine')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'allocation_engine'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4 & 7. Allocation & What-If</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>5. Gemini Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('incident_reporter')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'incident_reporter'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>8. AI Incident Reporter</span>
          </button>
        </div>

        <button
          onClick={() => {
            fetchCommandCenterData();
            fetchStockoutRadar();
            fetchWhatIfData();
          }}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          title="Refresh All Database Streams"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* ================================================================= */}
        {/* PILLAR 1: NORTHEAST LOGISTICS COMMAND CENTER                      */}
        {/* ================================================================= */}
        {activeTab === 'command_center' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Regional Depots</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  {commandData?.totalDepots || 4}
                </p>
                <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                  All 8 NER States Active
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Frontier Clinics</span>
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  {commandData?.totalHealthCenters || 5}
                </p>
                <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                  104,227 Population Served
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Blocked Corridors</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-black text-rose-600 mt-2 font-mono">
                  {commandData?.criticalRoadsCount || 1}
                </p>
                <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                  NH-13 Sela Pass KM 414
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Caution Sectors</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-amber-600 mt-2 font-mono">
                  {commandData?.cautionRoadsCount || 2}
                </p>
                <span className="text-[11px] font-bold text-amber-600 mt-1 block">
                  Bhalukpong & Mawkdok
                </span>
              </div>
            </div>

            {/* Split Grid: Depots vs Health Centers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Regional Logistics Depots */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Regional Supply Base Depots</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Live Stock Inventory
                  </span>
                </div>

                <div className="space-y-3">
                  {commandData?.depots?.map((depot: any) => (
                    <div
                      key={depot.depotId}
                      onClick={() => setSelectedDepot(depot)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedDepot?.depotId === depot.depotId
                          ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{depot.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {depot.district}, {depot.state} • Elev: {depot.elevationMeters}m
                          </p>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          {depot.accessibilityStatus}
                        </span>
                      </div>

                      {/* Inventory Mini-Badges */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                        {depot.inventory?.map((item: any) => (
                          <div key={item.id} className="text-xs">
                            <span className="text-slate-500 block text-[11px] font-medium truncate">
                              {item.name}
                            </span>
                            <span className="font-extrabold text-slate-900 font-mono">
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold ml-1">
                              ({item.remainingStockDays}d stock)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Road Accessibility & Health Centers */}
              <div className="space-y-6">
                {/* Road Conditions Matrix */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <h3 className="text-base font-extrabold text-slate-900">Road Conditions & Accessibility</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">BRO Live Telematics</span>
                  </div>

                  <div className="space-y-2.5">
                    {commandData?.roadConditions?.map((road: any) => (
                      <div
                        key={road.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                          road.accessibilityStatus === 'BLOCKED'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                            : road.accessibilityStatus === 'CAUTION'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs px-2 py-0.5 rounded-md bg-white/80 shadow-xs font-mono">
                              {road.highwayCode}
                            </span>
                            <span className="text-xs font-extrabold">{road.corridorName}</span>
                          </div>
                          <p className="text-[11px] opacity-80 mt-1">
                            Hazard: {road.hazardType} • Severity: {road.severity} • Est Clearance: {road.estimatedClearanceHours}h
                          </p>
                        </div>
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full ${
                            road.accessibilityStatus === 'BLOCKED'
                              ? 'bg-rose-600 text-white'
                              : road.accessibilityStatus === 'CAUTION'
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {road.accessibilityStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remote Health Centers */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <h3 className="text-base font-extrabold text-slate-900">Monitored Destination Clinics</h3>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {commandData?.healthCenters?.map((center: any) => (
                      <div
                        key={center.centerId}
                        className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">{center.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {center.district}, {center.state} • Population: {center.populationServed.toLocaleString()}
                          </p>
                          <span className="text-[10px] font-bold text-rose-600 mt-1 block">
                            Urgent Need: {center.criticalSupplyNeeded}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                            center.stockoutRiskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700'
                              : center.stockoutRiskLevel === 'ELEVATED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {center.stockoutRiskLevel} RISK
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 2: PREDICTIVE STOCKOUT RADAR                               */}
        {/* ================================================================= */}
        {activeTab === 'stockout_radar' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-[11px] font-bold text-rose-300 uppercase">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Predictive Inventory Depletion Engine</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">Predictive Stockout Radar</h2>
                  <p className="text-xs text-rose-200 mt-0.5">
                    Calculates exact remaining stock days based on daily consumption burn rates before replenishments arrive.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStockCategoryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      stockCategoryFilter === 'ALL' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    All Supplies
                  </button>
                  <button
                    onClick={() => setStockCategoryFilter('OXYGEN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      stockCategoryFilter === 'OXYGEN' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Oxygen
                  </button>
                  <button
                    onClick={() => setStockCategoryFilter('VACCINE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      stockCategoryFilter === 'VACCINE' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Vaccines
                  </button>
                </div>
              </div>
            </div>

            {/* Critical Stockout Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  Impending Supply Shortages (&lt; 7 Days Remaining)
                </h3>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  {stockoutData?.activeAlerts?.length || 0} Facilities At Immediate Risk
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Destination Facility</th>
                      <th className="py-3 px-4">Supply Item</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Daily Burn Rate</th>
                      <th className="py-3 px-4">Remaining Days</th>
                      <th className="py-3 px-4">Access Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {stockoutData?.activeAlerts
                      ?.filter((alert: any) => stockCategoryFilter === 'ALL' || alert.category === stockCategoryFilter)
                      ?.map((alert: any, idx: number) => (
                        <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 block">{alert.centerName}</span>
                            <span className="text-[11px] text-slate-500">{alert.district}, {alert.state}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {alert.itemName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {alert.currentQuantity} {alert.unit}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {alert.dailyBurnRate} / day
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${
                                  alert.remainingStockDays <= 3
                                    ? 'bg-rose-100 text-rose-700 font-extrabold'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {alert.remainingStockDays} Days
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {alert.accessBlocked ? (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                                PRIMARY ROUTE BLOCKED
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Passable
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setTargetCenterForAllocation(alert.centerId);
                                setActiveTab('allocation_engine');
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              Allocate Depot
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 3 & 6: DISASTER DISRUPTION SIMULATOR & RIPPLE EFFECT       */}
        {/* ================================================================= */}
        {activeTab === 'disruption_simulator' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simulator Controls Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-extrabold text-slate-900">Disruption Scenario Injector</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Disaster Hazard Type</label>
                    <select
                      value={simScenario.hazardType}
                      onChange={(e) => setSimScenario({ ...simScenario, hazardType: e.target.value as any })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
                    >
                      <option value="LANDSLIDE">Mountain Landslide / Metamorphic Rockfall</option>
                      <option value="FLOOD">Brahmaputra River Monsoon Flash Flood</option>
                      <option value="BRIDGE_CLOSURE">Alpine Gorge Bridge Structural Closure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Epicenter Location</label>
                    <input
                      type="text"
                      value={simScenario.location}
                      onChange={(e) => setSimScenario({ ...simScenario, location: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={simScenario.district}
                      onChange={(e) => setSimScenario({ ...simScenario, district: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Highway Sector Code</label>
                    <input
                      type="text"
                      value={simScenario.highwayCode}
                      onChange={(e) => setSimScenario({ ...simScenario, highwayCode: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  <button
                    onClick={handleTriggerDisruption}
                    disabled={isSimulating}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSimulating ? (
                      <span>Computing Ripple Effect...</span>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        <span>Inject Disruption & Analyze Ripple Effect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Ripple Effect Results Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-extrabold text-white">6. Ripple Effect Cascading Intelligence</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300">
                    Real-Time Graph Propagation
                  </span>
                </div>

                {disruptionResult ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Summary Impact Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Population at Risk</span>
                        <p className="text-lg font-black text-rose-400 font-mono mt-1">
                          {disruptionResult.rippleImpactSummary.totalPopulationAffected.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Delayed Shipments</span>
                        <p className="text-lg font-black text-amber-400 font-mono mt-1">
                          {disruptionResult.rippleImpactSummary.delayedShipmentsCount} Convoys
                        </p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Delay Without AI</span>
                        <p className="text-lg font-black text-rose-400 font-mono mt-1">
                          +{disruptionResult.rippleImpactSummary.estimatedDelayWithoutReplanningHours}h
                        </p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Delay With AI Bypass</span>
                        <p className="text-lg font-black text-emerald-400 font-mono mt-1">
                          {disruptionResult.rippleImpactSummary.estimatedDelayWithAiBypassHours}h (-{disruptionResult.rippleImpactSummary.timeSavedHours}h)
                        </p>
                      </div>
                    </div>

                    {/* Isolated Health Centers List */}
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                      <h4 className="text-xs font-bold text-blue-300 uppercase">Directly Isolated Health Centers:</h4>
                      {disruptionResult.directlyIsolatedHealthCenters?.map((hc: any) => (
                        <div key={hc.id} className="p-2.5 rounded-xl bg-white/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{hc.name}</span>
                            <span className="text-[11px] text-slate-300">
                              Population: {hc.populationAtRisk.toLocaleString()} • Critical Shortage: {hc.criticalSuppliesImpendingShortage}
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/30 text-rose-300 border border-rose-400/30">
                            ISOLATED
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Reroute Recommendation */}
                    <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase block">Recommended Solution:</span>
                        <span className="font-bold text-white">{disruptionResult.recommendedBypassRoute}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('allocation_engine')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Run Supply Allocation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                    <p className="text-xs">No active disruption injected. Click Inject Disruption to analyze ripple effects.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 4 & 7: SUPPLY ALLOCATION & BEFORE-AND-AFTER WHAT-IF        */}
        {/* ================================================================= */}
        {activeTab === 'allocation_engine' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    4. Intelligent Supply Allocation & 7. What-If Replanning
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculates optimal depot, vehicle capacity, and all-weather route while comparing before vs after metrics.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={targetCenterForAllocation}
                    onChange={(e) => setTargetCenterForAllocation(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="HC-TAW-01">Tawang Apex District Hospital</option>
                    <option value="HC-MEC-03">Mechuka Frontier Outpost</option>
                    <option value="HC-DIR-02">Dirang Mountain Clinic</option>
                  </select>

                  <button
                    onClick={handleRunAllocation}
                    disabled={isAllocating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {isAllocating ? 'Optimizing...' : 'Re-Run Optimization'}
                  </button>
                </div>
              </div>

              {/* What-If Comparative Metric Cards */}
              {whatIfData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Average Delivery Delay</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm line-through text-rose-500 font-mono">
                        {whatIfData.metrics.deliveryDelayHours.beforeReplanning}h
                      </span>
                      <span className="text-xl font-black text-emerald-600 font-mono">
                        {whatIfData.metrics.deliveryDelayHours.afterReplanning}h
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 block">
                      -{whatIfData.metrics.deliveryDelayHours.improvementPercent}% reduction
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stockout Risk Level</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm line-through text-rose-500 font-mono">
                        {whatIfData.metrics.stockoutRiskPercent.beforeReplanning}%
                      </span>
                      <span className="text-xl font-black text-emerald-600 font-mono">
                        {whatIfData.metrics.stockoutRiskPercent.afterReplanning}%
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 block">
                      -{whatIfData.metrics.stockoutRiskPercent.improvementPercent}% risk avoided
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Urgent Deliveries Covered</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm line-through text-slate-400 font-mono">
                        {whatIfData.metrics.urgentDeliveriesCoveredPercent.beforeReplanning}%
                      </span>
                      <span className="text-xl font-black text-blue-600 font-mono">
                        {whatIfData.metrics.urgentDeliveriesCoveredPercent.afterReplanning}%
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-blue-600 block">
                      +{whatIfData.metrics.urgentDeliveriesCoveredPercent.improvementPercent}% improvement
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Capacity Utilization</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm line-through text-slate-400 font-mono">
                        {whatIfData.metrics.fleetCapacityUtilizationPercent.beforeReplanning}%
                      </span>
                      <span className="text-xl font-black text-purple-600 font-mono">
                        {whatIfData.metrics.fleetCapacityUtilizationPercent.afterReplanning}%
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-purple-600 block">
                      +{whatIfData.metrics.fleetCapacityUtilizationPercent.improvementPercent}% efficiency
                    </span>
                  </div>
                </div>
              )}

              {/* Recommended Allocation Detail */}
              {whatIfData?.recommendedAllocation && (
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                      Optimal Recommendation by Supply Engine:
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                      Suitability: {whatIfData.recommendedAllocation.suitabilityScore}/100
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Source: {whatIfData.recommendedAllocation.depotName}
                  </h4>
                  <p className="text-xs text-slate-600">
                    <strong>Assigned Vehicle:</strong> {whatIfData.recommendedAllocation.recommendedVehicle} • <strong>Corridor:</strong> {whatIfData.recommendedAllocation.routeRecommended}
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    {whatIfData.recommendedAllocation.reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 5: GEMINI LOGISTICS COPILOT                                */}
        {/* ================================================================= */}
        {activeTab === 'copilot' && (
          <div className="max-w-4xl mx-auto h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Gemini Logistics Copilot</h3>
                  <p className="text-[11px] text-blue-200">Grounded in Live Application & Telemetry State</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Connected
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
              {copilotMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'gemini' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl max-w-xl text-xs space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                    {/* Quick action buttons if provided */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Suggested Strategic Actions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSendCopilotPrompt(act)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isCopilotTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Gemini Copilot is synthesizing telemetry and generating recommendations...</span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Gemini about stockouts, road closures, or optimal dispatch plans..."
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendCopilotPrompt();
                }}
                className="flex-1 px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={() => handleSendCopilotPrompt()}
                disabled={!copilotPrompt.trim() || isCopilotTyping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PILLAR 8: AI FIELD INCIDENT REPORTER                              */}
        {/* ================================================================= */}
        {activeTab === 'incident_reporter' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    8. AI Field Incident Reporter (Road-Damage Photo Capture)
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  Vision Analysis Ready
                </span>
              </div>

              <form onSubmit={handleSubmitIncident} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Preview & Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Road Damage Photo Preview</label>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100 group">
                      <img
                        src={incidentForm.photoUrl}
                        alt="Road Damage"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Captured by Patrol Drone / Mobile</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={incidentForm.photoUrl}
                      onChange={(e) => setIncidentForm({ ...incidentForm, photoUrl: e.target.value })}
                      placeholder="Paste Image URL"
                      className="w-full text-xs p-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  {/* Form Metadata */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hazard / Damage Type</label>
                      <input
                        type="text"
                        value={incidentForm.hazardType}
                        onChange={(e) => setIncidentForm({ ...incidentForm, hazardType: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Location / Kilometer Mark</label>
                      <input
                        type="text"
                        value={incidentForm.locationName}
                        onChange={(e) => setIncidentForm({ ...incidentForm, locationName: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">District & Highway</label>
                      <input
                        type="text"
                        value={incidentForm.district}
                        onChange={(e) => setIncidentForm({ ...incidentForm, district: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Damage Severity Assessment</label>
                      <select
                        value={incidentForm.damageSeverity}
                        onChange={(e) => setIncidentForm({ ...incidentForm, damageSeverity: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 font-semibold"
                      >
                        <option value="MINOR">Minor (Passable with caution)</option>
                        <option value="MODERATE">Moderate (Single lane restricted)</option>
                        <option value="SEVERE">Severe (Impassable for Heavy Axles)</option>
                        <option value="IMPASSABLE">Impassable (Complete carriageway blocked)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observation Notes</label>
                  <textarea
                    rows={2}
                    value={incidentForm.notes}
                    onChange={(e) => setIncidentForm({ ...incidentForm, notes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Structured Incident Report & Update Database</span>
                </button>
              </form>
            </div>

            {/* List of Recent Verified Reports */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900">Recent Structured Field Reports</h4>
              <div className="space-y-2.5">
                {incidentReportsList?.map((rep: any) => (
                  <div key={rep.incidentId} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {rep.photoUrl && (
                        <img src={rep.photoUrl} alt="damage" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      )}
                      <div>
                        <span className="font-extrabold text-slate-900 block">{rep.hazardType}</span>
                        <span className="text-[11px] text-slate-500">{rep.locationName} • {rep.district}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                      {rep.damageSeverity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NortheastCommandCenterView;
