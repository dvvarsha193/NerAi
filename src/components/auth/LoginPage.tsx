import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Success state for smooth transition
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [successUserRole, setSuccessUserRole] = useState<string | null>(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user && !loginSuccess) {
      redirectToDashboard(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/vehicle-gis', { replace: true });
        break;
      case 'DRIVER':
        navigate('/driver/dashboard', { replace: true });
        break;
      case 'SIMULATION_OPERATOR':
        navigate('/simulation/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!identifier.trim() || !password.trim()) {
      return;
    }

    try {
      const authenticatedUser = await login({
        identifier: identifier.trim(),
        password: password.trim(),
        rememberMe,
      });

      setSuccessUserRole(authenticatedUser.role);
      setLoginSuccess(true);

      // Short delay for success animation, then redirect
      setTimeout(() => {
        redirectToDashboard(authenticatedUser.role);
      }, 900);
    } catch (err) {
      // Error is stored in auth store and rendered in UI
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] flex flex-col justify-between select-none text-slate-800 p-4 sm:p-6">
      
      {/* Top Bar: Back to Home Link */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to NerLogix</span>
        </Link>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
          
          {/* Brand Logo & Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group justify-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 18L10 8L13 13L16 9L20 18H4Z" />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
                  NerLogix
                </span>
                <span className="text-xs font-bold text-blue-600 ml-0.5 relative -top-1">
                  ™
                </span>
              </div>
            </Link>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display pt-2">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sign in to continue to your NerLogix workspace.
            </p>
          </div>

          {/* Success State Overlay */}
          {loginSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Login successful
                </h3>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">
                  Opening your {successUserRole?.replace('_', ' ').toLowerCase()} workspace...
                </p>
              </div>
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-2" />
            </div>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Message Box */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Field 1: Email / Operator ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email / Operator ID
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rohit@nerlogix.in or ADM-01"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) clearError();
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact your NerLogix system administrator or control center to reset your credentials.');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Remember Me
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !identifier.trim() || !password.trim()}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading || !identifier.trim() || !password.trim()
                    ? 'bg-blue-400 cursor-not-allowed shadow-none'
                    : 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Secure Access Footer Note */}
          <div className="pt-2 text-center border-t border-slate-100">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure role-based access</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        NerLogix™ Logistics Intelligence Platform • All operations encrypted
      </div>

    </div>
  );
};

export default LoginPage;
