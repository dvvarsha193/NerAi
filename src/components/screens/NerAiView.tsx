import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  MapPin,
  Sliders,
  Trash2,
  Plus,
  MessageSquare,
  Check,
  CheckCheck,
  CheckCircle2,
  Sparkles,
  Bot,
  Map,
  Compass,
  ArrowRight,
  TrendingDown,
  Clock,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  Truck,
  Activity,
  Zap,
  X,
  Radio,
  Fuel,
  Gauge,
  Thermometer,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { Convoy, TacticalAlert, HighwayCorridor, HazardSectorData } from '../../types';
import { STRATEGIC_RIVERS, MOUNTAIN_PEAKS } from '../../data/geographicFeatures';
import { NER_ROUTE_SCHEDULE } from '../../data/mockData';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface PendingReroute {
  convoyId: string;
  convoyCallsign: string;
  driverName: string;
  cargo: string;
  currentRoute: string;
  bypassRoute: string;
  currentRisk: number;
  newRisk: number;
  hazardAvoided: string;
  additionalKm: number;
  newEta: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  suggestionPills?: string[];
  pendingReroute?: PendingReroute;
  isExecutedReroute?: boolean;
  executedDetails?: {
    convoyCallsign: string;
    newRoute: string;
    eta: string;
    divertedAt: string;
  };
  richFleetSummary?: boolean;
  richAlertsSummary?: boolean;
  richRouteInfo?: boolean;
  richVehicleCard?: Convoy;
  quickNavigate?: {
    label: string;
    path: string;
  };
}

interface ConversationItem {
  id: string;
  title: string;
  timestamp: string;
}

export const NerAiView: React.FC = () => {
  const navigate = useNavigate();

  // Telemetry Zustand store
  const {
    convoys,
    alerts,
    primaryCorridor,
    bypassCorridor,
    hazardSector,
    divertConvoy,
    acknowledgeAlert,
    setSelectedConvoyId,
    navigateToIndividualVehicle
  } = useTelemetryStore();

  const [activeConversationId, setActiveConversationId] = useState('conv-sih-01');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePendingReroute, setActivePendingReroute] = useState<PendingReroute | null>(null);

  // Recent conversations customized for SIH live evaluation
  const recentConversations: ConversationItem[] = [
    { id: 'conv-sih-01', title: 'Live SIH Evaluation Session', timestamp: 'Just now' },
    { id: 'conv-1', title: 'Emergency Reroute CONVOY-04', timestamp: 'Today, 10:24 AM' },
    { id: 'conv-2', title: 'Corridor Analysis: Guwahati ➔ Itanagar', timestamp: 'Today, 09:12 AM' },
    { id: 'conv-3', title: 'Dimapur NH-2 Landslide Assessment', timestamp: 'Yesterday, 06:43 PM' },
    { id: 'conv-4', title: 'Cold-Chain Telemetry (CONVOY-01)', timestamp: 'Yesterday, 04:20 PM' },
    { id: 'conv-5', title: 'InSAR Subsidence & Doppler Forecast', timestamp: '15 Oct, 11:08 AM' },
  ];

  // Initial welcome message with complete context ready for judges
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: '10:20 AM',
      text: `Hello! I am **NerLogix AI Command Assistant**, deployed for Northeast Trans-Himalayan Logistics Intelligence.

I have direct, real-time telemetry access to:
• **All 6 Active Convoys** (positions, cargo telemetry, speeds, fuel, cold-chain temps)
• **Highway Corridors** (NH-27 / NH-52 primary & NH-52-ALT bypass)
• **Real-Time Hazards** (ISRO InSAR ground subsidence & IMD Doppler radar)
• **Autonomous Rerouting Engine** with operator approval loops

Ask me anything about any vehicle, corridor, alert, or instruct me to reroute!`,
      suggestionPills: [
        '🚨 Which convoys are in danger right now?',
        '⚡ Reroute CONVOY-04 to safe bypass',
        '🚛 Show full fleet status & cargo',
        '⚠️ What are the critical hazard alerts?',
        '🗺️ Route details: Guwahati to Itanagar',
        '🧊 Cold-chain status of CONVOY-01'
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ─── AI Response Brain ──────────────────────────────────────────────────────
  const processQuery = (rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. APPROVAL OF PENDING REROUTE
    if (
      (q === 'approve' || q === 'yes' || q === 'confirm' || q === 'reroute now' || q === 'execute' || q.includes('approve reroute')) &&
      activePendingReroute
    ) {
      handleExecuteReroute(activePendingReroute);
      return;
    }

    if (q === 'decline' || q === 'cancel' || q === 'no') {
      if (activePendingReroute) {
        setActivePendingReroute(null);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Reroute request for **${activePendingReroute.convoyCallsign}** has been cancelled. The vehicle remains on its current corridor (${activePendingReroute.currentRoute}). Let me know if you need another analysis.`,
            suggestionPills: ['Show fleet status', 'Check hazard alerts', 'Open live map'],
          },
        ]);
        return;
      }
    }

    // 2. REROUTING REQUESTS (Specific or general)
    if (
      q.includes('reroute') ||
      q.includes('divert') ||
      q.includes('bypass') ||
      q.includes('change route') ||
      q.includes('alternate route')
    ) {
      // Check which vehicle is referenced
      let targetConvoy: Convoy | undefined;

      if (q.includes('04') || q.includes('convoy-04') || q.includes('convoy 4') || q.includes('fuel') || q.includes('phurba')) {
        targetConvoy = convoys.find((c) => c.id === 'convoy-04' || c.callsign.includes('04'));
      } else if (q.includes('01') || q.includes('convoy-01') || q.includes('convoy 1') || q.includes('pharma') || q.includes('tashi')) {
        targetConvoy = convoys.find((c) => c.id === 'convoy-trk-042' || c.callsign.includes('01'));
      } else if (q.includes('02') || q.includes('convoy-02') || q.includes('convoy 2') || q.includes('oxygen') || q.includes('biren')) {
        targetConvoy = convoys.find((c) => c.id === 'convoy-02' || c.callsign.includes('02'));
      } else if (q.includes('03') || q.includes('convoy-03') || q.includes('convoy 3') || q.includes('rations')) {
        targetConvoy = convoys.find((c) => c.id === 'convoy-03' || c.callsign.includes('03'));
      } else if (q.includes('05') || q.includes('convoy-05') || q.includes('convoy 5') || q.includes('bridge')) {
        targetConvoy = convoys.find((c) => c.id === 'convoy-05' || c.callsign.includes('05'));
      } else if (q.includes('06') || q.includes('convoy-06') || q.includes('convoy 6') || q.includes('comms')) {
        targetConvoy = convoys.find((c) => c.id === 'convoy-06' || c.callsign.includes('06'));
      } else {
        // Find most critical convoy (HAZ-ALERT or closest to hazard)
        targetConvoy = convoys.find((c) => c.status === 'HAZ-ALERT') ||
          convoys.find((c) => c.distanceToHazardKm < 30 && c.status !== 'DIVERTED') ||
          convoys[0];
      }

      if (targetConvoy) {
        if (targetConvoy.status === 'DIVERTED') {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'assistant',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `ℹ️ **${targetConvoy!.callsign}** (${targetConvoy!.vehicleNo || targetConvoy!.id}) is **already actively diverted** onto the **${bypassCorridor.name}**!\n\n• **Status:** DIVERTED\n• **Hazard Exposure:** 0 km (Safely Bypassed)\n• **Updated ETA:** ${targetConvoy!.eta}\n• **Driver Radio:** ${targetConvoy!.radioFrequency}`,
              suggestionPills: ['Show fleet status', 'Check other convoys', 'View on Live Map'],
              quickNavigate: { label: 'Track on Tactical GIS Map', path: '/admin/vehicle-gis' },
            },
          ]);
          return;
        }

        const pending: PendingReroute = {
          convoyId: targetConvoy.id,
          convoyCallsign: targetConvoy.callsign,
          driverName: targetConvoy.operator,
          cargo: targetConvoy.cargoManifest,
          currentRoute: targetConvoy.currentRoute || primaryCorridor.name,
          bypassRoute: bypassCorridor.name,
          currentRisk: targetConvoy.status === 'HAZ-ALERT' ? 68 : primaryCorridor.riskIndex,
          newRisk: bypassCorridor.riskIndex,
          hazardAvoided: hazardSector.name,
          additionalKm: 14,
          newEta: '3h 26m IST',
        };

        setActivePendingReroute(pending);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `⚠️ **AI REROUTE PROPOSAL & APPROVAL DISPATCH**\n\nI have generated an optimized bypass vector for **${targetConvoy!.callsign}** currently facing critical hazard exposure near **${hazardSector.name}** (${targetConvoy!.distanceToHazardKm} km away).\n\nReview the telemetry assessment below. Click **"Approve & Execute Reroute"** to mutate vehicle trajectory across all dashboard modules.`,
            pendingReroute: pending,
            suggestionPills: [
              'Approve',
              'Decline',
              'Show fleet status',
              'Why is this route safer?'
            ],
          },
        ]);
        return;
      }
    }

    // 3. HAZARDS / AT RISK / DANGER QUERIES
    if (
      q.includes('danger') ||
      q.includes('hazard') ||
      q.includes('risk') ||
      q.includes('who is in danger') ||
      q.includes('which convoy is at risk') ||
      q.includes('landslide') ||
      q.includes('threat')
    ) {
      const atRiskConvoys = convoys.filter((c) => c.status === 'HAZ-ALERT' || c.distanceToHazardKm <= 25);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🚨 **Hazard Threat Intelligence Summary:**\n\n• **Active Hazard:** ${hazardSector.name} (Sector km 254-278)\n• **Landslide Risk Score:** ${hazardSector.landslideRiskScore} / 100 (CRITICAL)\n• **Doppler Precipitation:** ${hazardSector.dopplerRainfallMmPerHour} mm/hr torrential cloudburst\n• **InSAR Slope Subsidence:** ${hazardSector.insarSubsidenceMmPerHour} mm/hr deformation detected\n• **Soil Saturation:** ${hazardSector.soilSaturationPercent}%\n\n**Impacted Vehicles:**\n${atRiskConvoys
            .map(
              (c) =>
                `• **${c.callsign}** (${c.vehicleNo}) — Operator: ${c.operator} | Distance to Hazard: **${c.distanceToHazardKm} km** | Cargo: ${c.cargoCategory} | Status: **${c.status}**`
            )
            .join('\n')}\n\n**AI Recommendation:** Immediate dynamic diversion via **NH-52 Elevated Bypass** reduces composite risk by **${primaryCorridor.riskIndex - bypassCorridor.riskIndex} points**.`,
          suggestionPills: [
            '⚡ Reroute CONVOY-04 to safe bypass',
            'View all alerts',
            'Show fleet status',
            'Open Live Map'
          ],
          quickNavigate: { label: 'Inspect Hazard Sector on GIS Map', path: '/admin/vehicle-gis' },
        },
      ]);
      return;
    }

    // 4. FLEET STATUS / ALL VEHICLES
    if (
      q.includes('fleet') ||
      q.includes('all vehicles') ||
      q.includes('all convoys') ||
      q.includes('list vehicles') ||
      q.includes('vehicle status') ||
      q.includes('how many vehicles')
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `📊 **Live NER Trans-Himalayan Fleet Telemetry (6 Active Units):**\n\nAll units are monitored via GPS-L5 & IRNSS military-grade satellite telemetry. Here is the active manifest:`,
          richFleetSummary: true,
          suggestionPills: [
            'Reroute CONVOY-04',
            'Check CONVOY-01 cold-chain',
            'Check CONVOY-02 oxygen',
            'What are the alerts?'
          ],
        },
      ]);
      return;
    }

    // 5. SPECIFIC VEHICLE LOOKUPS
    const foundConvoy = convoys.find((c) => {
      const callsignMatch = q.includes(c.callsign.toLowerCase()) || q.includes(c.id.toLowerCase());
      const numMatch =
        (q.includes('convoy 1') || q.includes('convoy-01') || q.includes('trk-01') || q.includes('trk-042')) && c.callsign.includes('01') ||
        (q.includes('convoy 2') || q.includes('convoy-02') || q.includes('trk-02')) && c.callsign.includes('02') ||
        (q.includes('convoy 3') || q.includes('convoy-03') || q.includes('trk-03')) && c.callsign.includes('03') ||
        (q.includes('convoy 4') || q.includes('convoy-04') || q.includes('trk-04') || q.includes('fuel truck')) && c.callsign.includes('04') ||
        (q.includes('convoy 5') || q.includes('convoy-05') || q.includes('trk-05')) && c.callsign.includes('05') ||
        (q.includes('convoy 6') || q.includes('convoy-06') || q.includes('trk-06')) && c.callsign.includes('06');
      const driverMatch = c.operator && q.includes(c.operator.toLowerCase().split(' ')[0]);
      const cargoMatch = c.cargoCategory && q.includes(c.cargoCategory.toLowerCase().replace('-', ' '));

      return callsignMatch || numMatch || driverMatch || cargoMatch;
    });

    if (foundConvoy) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🛰️ **Live Telematics Record: ${foundConvoy.callsign}** (${foundConvoy.vehicleNo || foundConvoy.id})`,
          richVehicleCard: foundConvoy,
          suggestionPills: [
            foundConvoy.status !== 'DIVERTED' ? `⚡ Reroute ${foundConvoy.callsign}` : 'Show fleet status',
            'View on Live Map',
            'Contact Driver via VHF',
            'Check current alerts'
          ],
          quickNavigate: { label: `Focus ${foundConvoy.callsign} on Map`, path: '/admin/vehicle-gis' },
        },
      ]);
      return;
    }

    // 6. ALERTS & NOTIFICATIONS
    if (
      q.includes('alert') ||
      q.includes('warning') ||
      q.includes('notification') ||
      q.includes('incident') ||
      q.includes('dimapur') ||
      q.includes('imphal') ||
      q.includes('cherrapunji') ||
      q.includes('subansiri')
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ **Tactical Alerts & Regional Hazard Incidents:**\n\nThere are **${alerts.length} active alerts** currently ingested via Geological Survey of India, BRO, and Meghalaya PWD sensors:`,
          richAlertsSummary: true,
          suggestionPills: [
            'Reroute CONVOY-04 (Dimapur hazard)',
            'Check flood warning at Subansiri',
            'Show fleet status'
          ],
        },
      ]);
      return;
    }

    // 7. ROUTE INFORMATION & WAYPOINTS
    if (
      q.includes('route') ||
      q.includes('corridor') ||
      q.includes('waypoint') ||
      q.includes('milestone') ||
      q.includes('highway') ||
      q.includes('guwahati') ||
      q.includes('itanagar') ||
      q.includes('tezpur') ||
      q.includes('bhalukpong') ||
      q.includes('nh-27') ||
      q.includes('nh-52') ||
      q.includes('nh-13') ||
      q.includes('distance')
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🗺️ **Corridor Infrastructure & Waypoint Intelligence:**\n\nAnalysis of the arterial logistics route between **Guwahati Depot (Assam)** and **Itanagar (Arunachal Pradesh)**:`,
          richRouteInfo: true,
          suggestionPills: [
            'Compare with NH-52 Elevated Bypass',
            'Which convoys are on this route?',
            'Reroute CONVOY-04',
            'Open Route Info Console'
          ],
          quickNavigate: { label: 'Open Comprehensive Route Info', path: '/admin/route-info' },
        },
      ]);
      return;
    }

    // 8. WEATHER & SATELLITE READINGS
    if (
      q.includes('weather') ||
      q.includes('rain') ||
      q.includes('monsoon') ||
      q.includes('insar') ||
      q.includes('satellite') ||
      q.includes('radar') ||
      q.includes('precipitation')
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🌧️ **Meteorological & Geotechnical Radar Telemetry:**\n\n• **Doppler Rain Intensity:** ${hazardSector.dopplerRainfallMmPerHour} mm/hr (Heavy cloudburst band over Western Arunachal & Meghalaya border)\n• **Soil Liquefaction Saturation:** ${hazardSector.soilSaturationPercent}% (Threshold critical level > 80%)\n• **InSAR Interferometric Subsidence:** ${hazardSector.insarSubsidenceMmPerHour} mm/hr displacement on 38° mountain cut-slopes\n• **Cherrapunji Station:** 75.0 mm/hr torrential rainfall\n• **Sela Pass (4,170m):** Sub-zero black ice advisory; chains mandated\n• **Brahmaputra Basin Water Level:** +1.2m above warning datum near Subansiri confluence\n\n**Tactical Advice:** Maintain 25 km/h convoy velocity limit and utilize elevated bypass where available.`,
          suggestionPills: [
            'Reroute CONVOY-04',
            'Show fleet status',
            'Open Tactical GIS Map'
          ],
        },
      ]);
      return;
    }

    // 9. NAVIGATION SHORTCUTS
    if (q.includes('open map') || q.includes('gis') || q.includes('show map') || q.includes('live map')) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Navigating you directly to the **Tactical GIS Live Map** with 3D terrain and real-time vehicle positioning.`,
          quickNavigate: { label: 'Click here to Open GIS Map', path: '/admin/vehicle-gis' },
        },
      ]);
      navigate('/admin/vehicle-gis');
      return;
    }

    if (q.includes('reroute console') || q.includes('dispatch console')) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Navigating you to the **Dispatch & Reroute Command Console**.`,
          quickNavigate: { label: 'Open Reroute Console', path: '/admin/reroute' },
        },
      ]);
      navigate('/admin/reroute');
      return;
    }

    // 10. GENERAL / HELP QUERY
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I've analyzed your query: **"${rawQuery}"** against our live Northeast logistics database.\n\n• **Active Convoys:** 6 tracking live (1 Hazard-Alert, 4 On-Route, 1 Stationary)\n• **Primary Arterial:** NH-27 / NH-52 (312 km, Guwahati ➔ Itanagar)\n• **Bypass Readiness:** NH-52 Elevated Bypass operational (Risk 14/100)\n• **Active Risk Sector:** Sela Mountain Pass Hazard (Risk 68/100, 42 mm/hr rain)\n\nYou can ask me to reroute vehicles, query individual driver telemetry, check hazard radars, or open map screens!`,
        suggestionPills: [
          '⚡ Reroute CONVOY-04 (Hazard Alert)',
          '🚛 Show all 6 convoys',
          '⚠️ What are the critical alerts?',
          '🗺️ Show route waypoints',
          'Open GIS Map'
        ],
      },
    ]);
  };

  // ─── Execute Reroute Action ───────────────────────────────────────────────
  const handleExecuteReroute = async (pending: PendingReroute) => {
    // 1. Mutate Zustand Store state
    await divertConvoy(pending.convoyId, {
      reason: 'AI Autonomous Reroute approved by Commander. Landslide hazard avoided.',
      approvedBy: 'NerLogix AI Command & SIH Controller',
      newEta: pending.newEta,
    });

    setActivePendingReroute(null);

    // 2. Add confirmation receipt message in chat
    const confirmMessage: ChatMessage = {
      id: `exec-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✅ **REROUTE EXECUTED & TRANSMITTED TO VEHICLE**\n\nAutonomous telemetry packet has been broadcast to **${pending.convoyCallsign}** over **VHF 142.850 MHz** and satellite transponder.`,
      isExecutedReroute: true,
      executedDetails: {
        convoyCallsign: pending.convoyCallsign,
        newRoute: pending.bypassRoute,
        eta: pending.newEta,
        divertedAt: new Date().toLocaleTimeString(),
      },
      suggestionPills: [
        'Track on Tactical GIS Map',
        'Show updated fleet status',
        'Check remaining alerts'
      ],
      quickNavigate: {
        label: `View ${pending.convoyCallsign} on Live GIS Map`,
        path: '/admin/vehicle-gis',
      },
    };

    setMessages((prev) => [...prev, confirmMessage]);
  };

  // ─── Handle Send ──────────────────────────────────────────────────────────
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Realistic AI latency simulation (400ms)
    setTimeout(() => {
      processQuery(text);
      setIsTyping(false);
    }, 450);
  };

  const handleClearChat = () => {
    setActivePendingReroute(null);
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Session reset. **NerLogix AI** is standing by with live access to all 6 convoys, active corridors, and ISRO InSAR sensor telemetry. How can I assist your presentation?`,
        suggestionPills: [
          '🚨 Which convoys are in danger right now?',
          '⚡ Reroute CONVOY-04 to safe bypass',
          '🚛 Show full fleet status & cargo',
          '⚠️ What are the critical hazard alerts?',
          '🗺️ Route details: Guwahati to Itanagar'
        ],
      },
    ]);
  };

  return (
    <div className="w-full h-full flex bg-[#F4F7FB] overflow-hidden select-none text-slate-800 font-sans">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR                                                           */}
      {/* ========================================================================= */}
      <aside className="w-64 xl:w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 h-full p-4">
        <div className="space-y-4">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 18L10 8L13 13L16 9L20 18H4Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-lg font-black tracking-tight text-slate-900 font-display">
                  NerLogix
                </span>
                <span className="text-[10px] font-bold text-slate-700 ml-0.5">™</span>
              </div>
              <div className="text-[9.5px] font-medium text-slate-400 leading-tight">
                Connected Northeast. Safer Logistics.
              </div>
            </div>
          </div>

          {/* + New Chat Button */}
          <button
            onClick={handleClearChat}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New SIH Presentation Chat</span>
          </button>

          {/* Recent Conversations */}
          <div className="pt-2">
            <div className="text-[10px] font-black text-slate-900 uppercase tracking-wider px-1 mb-2 flex items-center justify-between">
              <span>Recent Sessions</span>
              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">6 Convoys Live</span>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
              {recentConversations.map((item) => {
                const isActive = activeConversationId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveConversationId(item.id);
                      if (item.id === 'conv-1') handleSendMessage('Reroute CONVOY-04');
                      if (item.id === 'conv-2') handleSendMessage('Route info Guwahati to Itanagar');
                      if (item.id === 'conv-3') handleSendMessage('Landslide risk at Dimapur');
                      if (item.id === 'conv-4') handleSendMessage('Check CONVOY-01 cold-chain');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/80 text-blue-900 border border-blue-100/80 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs truncate ${isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Navigation to Other Modules */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => navigate('/admin/vehicle-gis')}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Map className="w-4 h-4 text-blue-500" />
              <span>Tactical GIS Map</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <button
            onClick={() => navigate('/admin/reroute')}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>Reroute Console</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <button
            onClick={() => navigate('/admin/route-info')}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Navigation className="w-4 h-4 text-indigo-500" />
              <span>Route Intelligence</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CHAT CONTAINER                                                    */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col justify-between h-full min-w-0 bg-[#F4F7FB] p-4 lg:p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between h-full min-h-0 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Top Header Bar */}
          <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs relative">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-display">
                    NerLogix AI Assistant
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Live Telemetry Connected</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                    SIH Evaluator Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  Autonomous corridor rerouting • InSAR hazard detection • 6 active trans-Himalayan convoys
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSendMessage('Show full fleet status')}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                title="List all 6 convoys"
              >
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>6 Convoys</span>
              </button>
              <button
                onClick={() => handleSendMessage('Reroute CONVOY-04')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all cursor-pointer"
                title="Reroute vehicle closest to hazard"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Reroute CONVOY-04</span>
              </button>
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                title="Reset conversation"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isAssistant ? 'items-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}

                  <div className={`max-w-2xl space-y-3 ${isAssistant ? 'flex-1' : ''}`}>
                    {/* Main Bubble Text */}
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isAssistant
                          ? 'bg-[#F4F7FB] text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-xs'
                          : 'bg-[#2563EB] text-white font-medium rounded-tr-sm ml-auto shadow-sm shadow-blue-500/20'
                      }`}
                    >
                      <div className="whitespace-pre-line space-y-1">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx}>
                            {paragraph.split('**').map((chunk, cIdx) =>
                              cIdx % 2 === 1 ? (
                                <strong key={cIdx} className={isAssistant ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
                                  {chunk}
                                </strong>
                              ) : (
                                chunk
                              )
                            )}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* ────────────────────────────────────────────────────────── */}
                    {/* 1. INTERACTIVE REROUTE PROPOSAL CARD                       */}
                    {/* ────────────────────────────────────────────────────────── */}
                    {msg.pendingReroute && (
                      <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-slate-800 shadow-md space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
                            <div>
                              <span className="text-sm font-extrabold text-amber-950 font-display">
                                Dynamic Reroute Authorization Required
                              </span>
                              <div className="text-[10px] text-amber-800">
                                Autonomous bypass trajectory computed by NerLogix LEWS Engine
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                            ACTION NEEDED
                          </span>
                        </div>

                        {/* Comparison Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-white/90 p-3 rounded-xl border border-amber-200">
                          <div className="space-y-1 border-r border-amber-100 pr-2">
                            <span className="text-[10px] uppercase font-bold text-red-600 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Current Path (Critical)
                            </span>
                            <div className="font-bold text-slate-900">{msg.pendingReroute.convoyCallsign}</div>
                            <div className="text-slate-600 text-[11px]">{msg.pendingReroute.currentRoute}</div>
                            <div className="text-red-700 font-extrabold">Risk Score: {msg.pendingReroute.currentRisk} / 100</div>
                            <div className="text-[10px] text-slate-500">Approaching: {msg.pendingReroute.hazardAvoided}</div>
                          </div>
                          <div className="space-y-1 pl-2">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Proposed Safe Bypass
                            </span>
                            <div className="font-bold text-emerald-950">{msg.pendingReroute.bypassRoute}</div>
                            <div className="text-emerald-700 font-extrabold">Risk Score: {msg.pendingReroute.newRisk} / 100 (-54 pts)</div>
                            <div className="text-slate-700 text-[11px]">Deviation: +{msg.pendingReroute.additionalKm} km (+18 min)</div>
                            <div className="text-slate-700 text-[11px]">New ETA: {msg.pendingReroute.newEta}</div>
                          </div>
                        </div>

                        {/* Driver & Cargo Details */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-900 bg-amber-100/60 px-3 py-1.5 rounded-lg">
                          <span><strong>Driver:</strong> {msg.pendingReroute.driverName}</span>
                          <span><strong>Cargo:</strong> {msg.pendingReroute.cargo}</span>
                        </div>

                        {/* Interactive Approval Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleExecuteReroute(msg.pendingReroute!)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Approve & Execute Reroute</span>
                          </button>
                          <button
                            onClick={() => {
                              setActivePendingReroute(null);
                              handleSendMessage('Decline reroute');
                            }}
                            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ────────────────────────────────────────────────────────── */}
                    {/* 2. EXECUTED REROUTE CONFIRMATION CARD                      */}
                    {/* ────────────────────────────────────────────────────────── */}
                    {msg.isExecutedReroute && msg.executedDetails && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-slate-800 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-extrabold text-emerald-950 font-display">
                              Reroute Confirmed & Active on Live Map
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                            DIVERTED
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 space-y-1">
                          <div><strong>Unit:</strong> {msg.executedDetails.convoyCallsign}</div>
                          <div><strong>Assigned Highway:</strong> {msg.executedDetails.newRoute}</div>
                          <div><strong>Updated Arrival:</strong> {msg.executedDetails.eta}</div>
                          <div><strong>Timestamp:</strong> {msg.executedDetails.divertedAt}</div>
                        </div>
                        <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-800 font-medium">
                            ✓ Driver acknowledged via VHF radio
                          </span>
                          <button
                            onClick={() => navigate('/admin/vehicle-gis')}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open GIS Map</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ────────────────────────────────────────────────────────── */}
                    {/* 3. RICH FLEET STATUS SUMMARY CARD                          */}
                    {/* ────────────────────────────────────────────────────────── */}
                    {msg.richFleetSummary && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {convoys.map((convoy) => (
                            <div
                              key={convoy.id}
                              className={`p-3 rounded-xl border transition-all ${
                                convoy.status === 'HAZ-ALERT'
                                  ? 'bg-red-50/80 border-red-300'
                                  : convoy.status === 'DIVERTED'
                                  ? 'bg-emerald-50/80 border-emerald-300'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                                  {convoy.callsign} ({convoy.vehicleNo})
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                    convoy.status === 'HAZ-ALERT'
                                      ? 'bg-red-200 text-red-900 animate-pulse'
                                      : convoy.status === 'DIVERTED'
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {convoy.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 space-y-0.5">
                                <div><strong>Driver:</strong> {convoy.operator}</div>
                                <div><strong>Cargo:</strong> {convoy.cargoManifest}</div>
                                <div className="flex justify-between pt-1 text-[10px] text-slate-500">
                                  <span>Speed: {convoy.speedKmh} km/h</span>
                                  <span>Fuel: {convoy.fuelPercent}%</span>
                                  <span>ETA: {convoy.eta}</span>
                                </div>
                              </div>
                              {convoy.status === 'HAZ-ALERT' && (
                                <button
                                  onClick={() => handleSendMessage(`Reroute ${convoy.callsign}`)}
                                  className="mt-2 w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Trigger Dynamic Bypass</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ────────────────────────────────────────────────────────── */}
                    {/* 4. RICH INDIVIDUAL VEHICLE CARD                            */}
                    {/* ────────────────────────────────────────────────────────── */}
                    {msg.richVehicleCard && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900">
                                {msg.richVehicleCard.callsign} — {msg.richVehicleCard.vehicleNo}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Class: {msg.richVehicleCard.vehicleClass} | Gross: {msg.richVehicleCard.grossWeightKg.toLocaleString()} kg
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              msg.richVehicleCard.status === 'HAZ-ALERT'
                                ? 'bg-red-100 text-red-800'
                                : msg.richVehicleCard.status === 'DIVERTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {msg.richVehicleCard.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="space-y-1">
                            <div><span className="text-slate-400">Operator:</span> <strong>{msg.richVehicleCard.operator}</strong></div>
                            <div><span className="text-slate-400">Driver Contact:</span> <strong>{msg.richVehicleCard.driverContact || '+91 94360 28194'}</strong></div>
                            <div><span className="text-slate-400">Radio VHF:</span> <strong>{msg.richVehicleCard.radioFrequency}</strong></div>
                            <div><span className="text-slate-400">Cargo Category:</span> <strong>{msg.richVehicleCard.cargoCategory}</strong></div>
                            <div><span className="text-slate-400">Cargo Manifest:</span> <strong>{msg.richVehicleCard.cargoManifest}</strong></div>
                          </div>
                          <div className="space-y-1">
                            <div><span className="text-slate-400">Route:</span> <strong>{msg.richVehicleCard.currentRoute || primaryCorridor.name}</strong></div>
                            <div><span className="text-slate-400">Speed:</span> <strong>{msg.richVehicleCard.speedKmh} km/h</strong></div>
                            <div><span className="text-slate-400">Fuel Level:</span> <strong>{msg.richVehicleCard.fuelPercent}%</strong></div>
                            <div><span className="text-slate-400">Distance to Hazard:</span> <strong className={msg.richVehicleCard.distanceToHazardKm < 20 ? 'text-red-600 font-extrabold' : ''}>{msg.richVehicleCard.distanceToHazardKm} km</strong></div>
                            <div><span className="text-slate-400">Est. Arrival (ETA):</span> <strong>{msg.richVehicleCard.eta}</strong></div>
                          </div>
                        </div>

                        {msg.richVehicleCard.cargoTempCelsius !== undefined && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                            <Thermometer className="w-4 h-4 text-blue-600" />
                            <span><strong>Cold-Chain Telemetry:</strong> Cryo-Chamber is at <strong>{msg.richVehicleCard.cargoTempCelsius}°C</strong> (Nominal safe range 2°C - 8°C).</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedConvoyId(msg.richVehicleCard!.id);
                              navigate('/admin/vehicle-gis');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Convoy on Tactical GIS</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          {msg.richVehicleCard.status !== 'DIVERTED' && (
                            <button
                              onClick={() => handleSendMessage(`Reroute ${msg.richVehicleCard!.callsign}`)}
                              className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Reroute This Vehicle
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ────────────────────────────────────────────────────────── */}
                    {/* 5. RICH ALERTS SUMMARY CARD                                */}
                    {/* ────────────────────────────────────────────────────────── */}
                    {msg.richAlertsSummary && (
                      <div className="space-y-2">
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                              alert.level === 'CRITICAL'
                                ? 'bg-red-50 border-red-200'
                                : alert.level === 'WARNING'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle
                                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                  alert.level === 'CRITICAL'
                                    ? 'text-red-600'
                                    : alert.level === 'WARNING'
                                    ? 'text-amber-600'
                                    : 'text-slate-500'
                                }`}
                              />
                              <div>
                                <div className="text-xs font-extrabold text-slate-900">
                                  {alert.title}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {alert.details}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                                  <span>Sector: <strong>{alert.sector}</strong></span>
                                  <span>Logged: {alert.timestamp}</span>
                                </div>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                alert.level === 'CRITICAL'
                                  ? 'bg-red-200 text-red-900'
                                  : alert.level === 'WARNING'
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {alert.level}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ────────────────────────────────────────────────────────── */}
                    {/* 6. RICH ROUTE INFO CARD                                    */}
                    {/* ────────────────────────────────────────────────────────── */}
                    {msg.richRouteInfo && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900 font-display">
                              {primaryCorridor.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Highway: {primaryCorridor.highwayCode} • Total: {primaryCorridor.totalDistanceKm} km • Apex: {primaryCorridor.apexAltitudeMeters}m ASL
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold">
                            Primary Arterial
                          </span>
                        </div>

                        {/* Waypoints timeline */}
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Key Milestone Schedule:</div>
                          <div className="grid grid-cols-5 gap-1 text-center">
                            {NER_ROUTE_SCHEDULE.map((m, idx) => (
                              <div key={m.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px]">
                                <div className="font-bold text-slate-800 truncate">{m.name.split(' ')[0]}</div>
                                <div className="text-slate-500 text-[9px]">{m.kmMark} km</div>
                                <div className="text-blue-600 font-semibold text-[9px]">{m.time}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bypass Option Comparison */}
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-emerald-950">Dynamic Bypass: {bypassCorridor.name}</div>
                            <div className="text-[11px] text-emerald-800">
                              326 km (+14 km) • Apex: 810m • Risk Index: <strong>14 / 100</strong> (mitigates low-lying flash flood corridors)
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-extrabold">
                            -60% Risk
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quick Navigate Link */}
                    {msg.quickNavigate && (
                      <div className="pt-1">
                        <button
                          onClick={() => navigate(msg.quickNavigate!.path)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{msg.quickNavigate.label}</span>
                        </button>
                      </div>
                    )}

                    {/* Quick Suggestion Pills */}
                    {msg.suggestionPills && msg.suggestionPills.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Suggested Commands:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestionPills.map((pill, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(pill)}
                              className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              {pill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] text-slate-400 flex items-center gap-1 ${
                        isAssistant ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isAssistant && <CheckCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-slate-200/80 rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3.5 border-t border-slate-100 bg-white">
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xs focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all p-2.5">
              <input
                type="text"
                placeholder="Ask about convoys, reroute vehicles, check InSAR hazards or road conditions..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent px-2 pt-1 pb-3 focus:outline-none"
              />

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80">
                {/* Left quick tags */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleSendMessage('Show full fleet status')}
                    title="Fleet Overview"
                    className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px] font-semibold">Fleet</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Reroute CONVOY-04')}
                    title="Reroute Danger Convoy"
                    className="p-1.5 rounded-lg hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline text-[10px] font-semibold text-amber-700">Reroute</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Route info Guwahati to Itanagar')}
                    title="Route Waypoints"
                    className="p-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px] font-semibold">Corridor</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Show all hazard alerts')}
                    title="Live Alerts"
                    className="p-1.5 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px] font-semibold">Alerts</span>
                  </button>
                </div>

                {/* Right Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                    inputText.trim()
                      ? 'bg-[#2563EB] hover:bg-blue-700 shadow-sm shadow-blue-500/30 active:scale-95'
                      : 'bg-[#2563EB]/40 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 translate-x-0.2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NerAiView;
