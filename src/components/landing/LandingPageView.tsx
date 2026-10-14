import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Navigation,
  MapPin,
  Cpu,
  Sliders,
  Sparkles,
  Layers,
  CloudRain,
  Mountain,
  Radio,
  Activity,
  AlertTriangle,
  ChevronRight,
  Truck,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LandingPageView: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Simple simulated vehicle progression on the hero graphic
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleLoginClick = () => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/command-center');
          break;
        case 'DRIVER':
          navigate('/driver/dashboard');
          break;
        case 'SIMULATION_OPERATOR':
          navigate('/simulation/dashboard');
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 sm:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 18L10 8L13 13L16 9L20 18H4Z" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                NerLogix
              </span>
              <span className="text-[10px] font-bold text-blue-600 ml-0.5 relative -top-1">
                ™
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-blue-600 font-bold transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('platform-capabilities')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('intelligence-sources')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Main CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoginClick}
              className="px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Workspace' : 'Login'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative px-6 sm:px-12 pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Trans-Himalayan AI Routing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-display">
              AI-Powered Logistics Intelligence <br />
              <span className="text-[#2563EB]">for North East India</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Predict risks before departure, monitor vehicles in real time and intelligently respond to disruptions throughout the journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={handleLoginClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-sm font-extrabold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Login to NerLogix</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => scrollToSection('platform-capabilities')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 text-slate-700 text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Platform</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-[11px] font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ISRO & IMD Integrated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>Satellite Offline Cache</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Logistics Visual */}
          <div className="lg:col-span-6 flex items-center justify-center">
            
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-5 relative">
              
              {/* Card Header: Route Route Segment */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Live Corridor Monitor
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  Guwahati ➔ Shillong
                </span>
              </div>

              {/* Graphical Route Segment Simulation */}
              <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-4">
                
                {/* Waypoints line */}
                <div className="flex items-center justify-between relative px-2">
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0"></div>
                  <div 
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full transition-all duration-700 z-0"
                    style={{ width: `${(activeStep / 3) * 100}%` }}
                  ></div>

                  {/* Waypoint 1: Guwahati */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      G
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 mt-1">Guwahati</span>
                  </div>

                  {/* Waypoint 2: Nongpoh */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                      N
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 mt-1">Nongpoh</span>
                  </div>

                  {/* Waypoint 3: Mawkdok */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs animate-bounce">
                      ⚠️
                    </div>
                    <span className="text-[10px] font-bold text-rose-600 mt-1">Mawkdok</span>
                  </div>

                  {/* Waypoint 4: Shillong */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      S
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 mt-1">Shillong</span>
                  </div>
                </div>

                {/* Vehicle Pill */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">NER-TRK-01</div>
                      <div className="text-[10px] text-slate-400">Electronics & Essentials • 68 km/h</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-100">
                    In Transit
                  </span>
                </div>

              </div>

              {/* Disruption Alert Card */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs">
                  ⚠️
                </div>
                <div>
                  <div className="text-xs font-extrabold text-rose-900">
                    Landslide Disruption Ahead
                  </div>
                  <div className="text-[11px] text-rose-700 leading-tight mt-0.5">
                    NH-6 near Mawkdok blocked by 140 m³ loose metamorphic debris.
                  </div>
                </div>
              </div>

              {/* NER AI Solution & Comparison */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-950">
                      NER AI Safer Route Identified
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-extrabold">
                    -63 pts risk
                  </span>
                </div>

                {/* Comparison metric boxes */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-white/90 border border-rose-200 text-center">
                    <div className="text-[10px] font-semibold text-slate-500">Current Risk</div>
                    <div className="text-xl font-black text-rose-600 font-display">87<span className="text-xs text-rose-400 font-medium">/100</span></div>
                    <span className="text-[9px] font-bold text-rose-700">Critical Risk</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-300 text-center">
                    <div className="text-[10px] font-semibold text-slate-500">Alternative Risk</div>
                    <div className="text-xl font-black text-emerald-600 font-display">24<span className="text-xs text-emerald-400 font-medium">/100</span></div>
                    <span className="text-[9px] font-bold text-emerald-700">Safe Bypass</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. PLATFORM CAPABILITIES (4 CARDS)                                        */}
      {/* ========================================================================= */}
      <section id="platform-capabilities" className="px-6 sm:px-12 py-20 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest">
              Platform Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              Engineered for the Himalayan & Northeast Terrain
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive mission-critical tools designed specifically for treacherous mountain corridors, blind-spot canyons, and extreme monsoon weather.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: Route Intelligence */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Navigation className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  Route Intelligence
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Understand weather, terrain, road conditions and predicted journey risks before departure.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>Explore Route Info</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* CARD 2: Vehicle GIS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  Vehicle GIS
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Monitor fleet location, journey progress and operational conditions in real time.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>View Fleet GIS</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* CARD 3: Intelligent Rerouting */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Sliders className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  Intelligent Rerouting
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Respond to landslides, floods, weather and road disruptions using NER AI.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>Open Reroute Console</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* CARD 4: NER AI Assistant */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  NER AI Assistant
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ask about routes, vehicles, incidents and operations — and perform actions conversationally.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                <span>Talk with AI</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW NERLOGIX WORKS (CONNECTED PIPELINE)                                 */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="px-6 sm:px-12 py-20 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest">
              How NerLogix Works
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              End-to-End Operational Lifecycle
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A unified pipeline connecting departure planning to live monitoring, hazard detection, and rapid rerouting.
            </p>
          </div>

          {/* 4 Connected Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1: PLAN */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-3 text-center relative">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
                Step 01 // PLAN
              </span>
              <h4 className="text-base font-black text-slate-900">Route Info</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-departure analysis, risk scores, departure time optimization, and segment hazards.
              </p>
            </div>

            {/* Step 2: MONITOR */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-3 text-center relative">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                Step 02 // MONITOR
              </span>
              <h4 className="text-base font-black text-slate-900">Vehicle GIS</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time convoy telemetry, live canyon altitude tracking, and blind-spot edge caching.
              </p>
            </div>

            {/* Step 3: DETECT */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-3 text-center relative">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider">
                Step 03 // DETECT
              </span>
              <h4 className="text-base font-black text-slate-900">Alerts & Risk Intelligence</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Satellite InSAR ground shift, Doppler monsoon cells, and automated hazard threshold alerts.
              </p>
            </div>

            {/* Step 4: RESPOND */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-3 text-center relative">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                Step 04 // RESPOND
              </span>
              <h4 className="text-base font-black text-slate-900">Reroute Console</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                One-click dynamic detour approval, driver dispatch alerts, and consignments protection.
              </p>
            </div>

          </div>

          {/* Cross-Cutting AI Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold font-display">
                  NER AI: Intelligence Across All Modules
                </h4>
                <p className="text-xs text-blue-100">
                  Continuous machine learning models evaluating satellite, radar, and vehicle telemetry at every moment.
                </p>
              </div>
            </div>

            <button
              onClick={handleLoginClick}
              className="px-5 py-2.5 rounded-full bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Explore NER AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTELLIGENCE SOURCES (HORIZONTAL STRIP)                                */}
      {/* ========================================================================= */}
      <section id="intelligence-sources" className="px-6 sm:px-12 py-16 bg-[#F4F7FB] border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-1.5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Multi-Source Sensor Integration
            </h2>
            <h3 className="text-xl font-bold text-slate-800">
              Live Intelligence Feeds Driving NerLogix
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Satellite InSAR</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <CloudRain className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Doppler Weather</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <Mountain className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">Terrain Models</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Road Sensors</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <Navigation className="w-5 h-5 text-rose-600" />
              <span className="text-xs font-bold text-slate-800">Traffic Congestion</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">Historical Risks</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Vehicle Telemetry</span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FINAL CTA                                                              */}
      {/* ========================================================================= */}
      <section className="px-6 sm:px-12 py-20 bg-white text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display">
            Connected Northeast. <br />
            <span className="text-[#2563EB]">Smarter Logistics.</span>
          </h2>
          <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            Enter the NerLogix operations platform.
          </p>
          <div className="pt-2">
            <button
              onClick={handleLoginClick}
              className="px-8 py-4 rounded-full bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-sm font-extrabold transition-all shadow-xl shadow-blue-600/30 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Login to NerLogix</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="mt-auto px-6 sm:px-12 py-8 bg-slate-50 border-t border-slate-200/80 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 font-display">NerLogix™</span>
            <span>•</span>
            <span>AI-powered logistics intelligence for North East India.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => scrollToSection('platform-capabilities')} className="hover:text-slate-900 cursor-pointer">Platform</button>
            <a href="#privacy" className="hover:text-slate-900">Privacy</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPageView;
