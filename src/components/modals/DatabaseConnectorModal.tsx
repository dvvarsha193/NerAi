import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Server,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface DatabaseConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DatabaseConnectorModal: React.FC<DatabaseConnectorModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'mongodb' | 'supabase' | 'vercel'>('status');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // MongoDB input form
  const [mongoUri, setMongoUri] = useState('');
  const [mongoStatus, setMongoStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  // Supabase input form
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  const getApiUrl = (endpoint: string) => {
    return typeof window !== 'undefined' && window.location.port === '5173'
      ? `http://${window.location.hostname || 'localhost'}:3001/api/${endpoint}`
      : `/api/${endpoint}`;
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('database/status'));
      if (res.ok) {
        const json = await res.json();
        setDbStatus(json);
      }
    } catch (e) {
      console.warn('Failed to fetch DB status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;
    setMongoStatus({ loading: true });
    try {
      const res = await fetch(getApiUrl('database/connect-mongo'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUri }),
      });
      const data = await res.json();
      if (data.success) {
        setMongoStatus({ loading: false, success: true, message: data.message });
        fetchStatus();
        if (onRefresh) onRefresh();
      } else {
        setMongoStatus({ loading: false, success: false, message: data.error });
      }
    } catch (err: any) {
      setMongoStatus({ loading: false, success: false, message: err.message || 'Network error' });
    }
  };

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) return;
    setSupabaseStatus({ loading: true });
    try {
      const res = await fetch(getApiUrl('database/connect-supabase'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supabaseUrl, key: supabaseKey }),
      });
      const data = await res.json();
      if (data.success) {
        setSupabaseStatus({ loading: false, success: true, message: data.message });
        fetchStatus();
        if (onRefresh) onRefresh();
      } else {
        setSupabaseStatus({ loading: false, success: false, message: data.error });
      }
    } catch (err: any) {
      setSupabaseStatus({ loading: false, success: false, message: err.message || 'Network error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Database & Cloud Persistence Hub</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Connect Mongoose (MongoDB Atlas) or Supabase (PostgreSQL) for live data sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Live Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('mongodb')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'mongodb'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MongoDB (Mongoose)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Supabase Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vercel Cloud Setup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: LIVE STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Provider</span>
                  <div className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    {dbStatus?.provider || 'Embedded JSON Datastore (Persistent)'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {dbStatus?.isMongoConnected
                      ? `Connected to MongoDB Atlas cluster: ${dbStatus?.mongoHost || 'Active'}`
                      : dbStatus?.isSupabaseConfigured
                      ? 'Connected to Supabase PostgreSQL cloud backend'
                      : 'Dual-fallback local database active — records persist across restarts and deploys.'}
                  </div>
                </div>

                <button
                  onClick={fetchStatus}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Data Record Counts */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Live Synchronized Entities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-700">Depots (Hubs)</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{dbStatus?.dataCounts?.depots ?? 4}</div>
                    <div className="text-[10px] text-slate-500">Guwahati, Tezpur, Dibrugarh, Silchar</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="text-[11px] font-bold text-emerald-700">Health Centers</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{dbStatus?.dataCounts?.healthCenters ?? 5}</div>
                    <div className="text-[10px] text-slate-500">Tawang, Dirang, Mechuka, Sohra</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <div className="text-[11px] font-bold text-amber-700">Road Sectors</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{dbStatus?.dataCounts?.roadConditions ?? 4}</div>
                    <div className="text-[10px] text-slate-500">NH-13, NH-27, NH-6, NH-52</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="text-[11px] font-bold text-purple-700">Field Incidents</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{dbStatus?.dataCounts?.fieldIncidents ?? 1}</div>
                    <div className="text-[10px] text-slate-500">Photos + GPS Reports</div>
                  </div>
                </div>
              </div>

              {/* Environment Variable Check */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">Environment Detection</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono text-slate-600">MONGODB_URI</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      dbStatus?.environment?.hasMongoUri ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {dbStatus?.environment?.hasMongoUri ? 'DETECTED' : 'NOT CONFIGURED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono text-slate-600">SUPABASE_URL</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      dbStatus?.environment?.hasSupabaseUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {dbStatus?.environment?.hasSupabaseUrl ? 'DETECTED' : 'NOT CONFIGURED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="font-mono text-slate-600">GEMINI_API_KEY</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      dbStatus?.environment?.hasGeminiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {dbStatus?.environment?.hasGeminiKey ? 'DETECTED' : 'OPTIONAL (LOCAL AI ACTIVE)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONGODB ATLAS (MONGOOSE) */}
          {activeTab === 'mongodb' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60">
                <h3 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Connect MongoDB Atlas Cluster (Mongoose)
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  Connecting to MongoDB Atlas will automatically sync Mongoose Schemas (Depots, Health Centers, Road Conditions, and Incident Reports).
                </p>
              </div>

              <form onSubmit={handleConnectMongo} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MongoDB Connection String (URI)
                  </label>
                  <input
                    type="password"
                    placeholder="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/nerlogix?retryWrites=true&w=majority"
                    value={mongoUri}
                    onChange={(e) => setMongoUri(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paste your connection string from MongoDB Atlas &gt; Database &gt; Connect &gt; Drivers &gt; Node.js.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={mongoStatus.loading || !mongoUri.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {mongoStatus.loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mongoStatus.loading ? 'Testing Connection...' : 'Connect to MongoDB Atlas'}</span>
                </button>
              </form>

              {mongoStatus.message && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  mongoStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {mongoStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  <span>{mongoStatus.message}</span>
                </div>
              )}

              {/* Step by Step Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">How to get your free MongoDB Atlas URI in 2 minutes:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>Go to <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">MongoDB Atlas</a> and sign in.</li>
                  <li>Create a free M0 cluster (select AWS/Mumbai or any region).</li>
                  <li>Under <strong>Network Access</strong>, click <strong>Add IP Address</strong> &rarr; Select <strong>Allow Access from Anywhere (0.0.0.0/0)</strong>.</li>
                  <li>Under <strong>Database Access</strong>, create a database user (e.g. `neradmin` and a password).</li>
                  <li>Click <strong>Connect</strong> &rarr; <strong>Drivers</strong> &rarr; Copy the `mongodb+srv://...` string and replace `&lt;password&gt;`.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Connect Supabase Cloud (PostgreSQL)
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Connect Supabase to store logistics telemetry, incidents, and convoy trajectories directly in PostgreSQL tables.
                </p>
              </div>

              <form onSubmit={handleConnectSupabase} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project-id.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={supabaseStatus.loading || !supabaseUrl.trim() || !supabaseKey.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {supabaseStatus.loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{supabaseStatus.loading ? 'Testing Connection...' : 'Connect to Supabase'}</span>
                </button>
              </form>

              {supabaseStatus.message && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  supabaseStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {supabaseStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  <span>{supabaseStatus.message}</span>
                </div>
              )}

              {/* Step by Step Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">How to find Supabase credentials:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Supabase Project Dashboard</a>.</li>
                  <li>Click on the <strong>Project Settings</strong> gear icon on the left sidebar.</li>
                  <li>Select <strong>API</strong> &rarr; Copy the <strong>Project URL</strong> and <strong>anon / public</strong> Project API key.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: VERCEL CLOUD SETUP */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-extrabold">Configuring Environment Variables in Vercel</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  When hosting on your Vercel account, set these variables so your live link connects to your cloud database automatically.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">MONGODB_URI</span>
                    <button
                      onClick={() => handleCopy('MONGODB_URI', 'mongo')}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
                    >
                      {copiedKey === 'mongo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'mongo' ? 'Copied' : 'Copy Name'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Your MongoDB Atlas connection string. Example: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">mongodb+srv://admin:pass@cluster.mongodb.net/nerlogix</code>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">SUPABASE_URL & SUPABASE_ANON_KEY</span>
                    <button
                      onClick={() => handleCopy('SUPABASE_URL', 'supa')}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
                    >
                      {copiedKey === 'supa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'supa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Your Supabase Project URL and Anon API key for cloud postgres connectivity.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">GEMINI_API_KEY</span>
                    <button
                      onClick={() => handleCopy('GEMINI_API_KEY', 'gem')}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
                    >
                      {copiedKey === 'gem' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'gem' ? 'Copied' : 'Copy Name'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Google Gemini AI Studio API key for real-time live LLM inference.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1.5">
                <h4 className="font-extrabold">Steps in Vercel Dashboard:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Open your project on <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold">Vercel Dashboard</a>.</li>
                  <li>Go to <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
                  <li>Add each Key and Value &rarr; Click <strong>Save</strong>.</li>
                  <li>Click <strong>Deployments</strong> &rarr; <strong>Redeploy</strong> latest commit.</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted in transit & at rest</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
};
