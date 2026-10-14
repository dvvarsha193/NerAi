import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Truck,
  Flame,
  Shield,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, isAuthenticated, user, isLoading, error, clearError } = useAuthStore();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In / Common fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [googleRole, setGoogleRole] = useState<UserRole>('ADMIN');

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
        navigate('/admin/command-center', { replace: true });
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

  const handleSignIn = async (e: React.FormEvent) => {
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

      setTimeout(() => {
        redirectToDashboard(authenticatedUser.role);
      }, 700);
    } catch {
      // Error handled by store
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!identifier.trim() || !password.trim()) {
      return;
    }

    try {
      const authenticatedUser = await register({
        name: name.trim() || identifier.split('@')[0],
        email: identifier.trim(),
        password: password.trim(),
        role: selectedRole,
        rememberMe,
      });

      setSuccessUserRole(authenticatedUser.role);
      setLoginSuccess(true);

      setTimeout(() => {
        redirectToDashboard(authenticatedUser.role);
      }, 700);
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleSignInClick = () => {
    setShowGoogleModal(true);
  };

  const handleGoogleQuickAuth = async (email: string, displayName: string, role: UserRole) => {
    setShowGoogleModal(false);
    clearError();

    try {
      const authUser = await loginWithGoogle({
        email,
        name: displayName,
        role,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      });

      setSuccessUserRole(authUser.role);
      setLoginSuccess(true);

      setTimeout(() => {
        redirectToDashboard(authUser.role);
      }, 700);
    } catch {
      // Error handled by store
    }
  };

  const fillDemoAccount = (role: 'ADMIN' | 'DRIVER' | 'SIM') => {
    if (role === 'ADMIN') {
      setIdentifier('admin@nerlogix.in');
      setPassword('admin123');
      setSelectedRole('ADMIN');
    } else if (role === 'DRIVER') {
      setIdentifier('rohit@nerlogix.in');
      setPassword('driver123');
      setSelectedRole('DRIVER');
    } else {
      setIdentifier('sim@nerlogix.in');
      setPassword('sim123');
      setSelectedRole('SIMULATION_OPERATOR');
    }
    setAuthMode('signin');
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

      {/* Main Centered Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-5 relative overflow-hidden">
          {/* Brand Logo & Header */}
          <div className="text-center space-y-1.5">
            <Link to="/" className="inline-flex items-center gap-2.5 group justify-center">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 18L10 8L13 13L16 9L20 18H4Z" />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-black tracking-tight text-slate-900 font-display">
                  NerLogix
                </span>
                <span className="text-xs font-bold text-blue-600 ml-0.5 relative -top-1">™</span>
              </div>
            </Link>

            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display pt-1">
              {authMode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {authMode === 'signin'
                ? 'Enter any email or your credentials to access the workspace.'
                : 'Register with any email address to join the corridor network.'}
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
                  Authentication Successful
                </h3>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">
                  Opening your {successUserRole?.replace('_', ' ').toLowerCase()} workspace...
                </p>
              </div>
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-2" />
            </div>
          ) : (
            <>
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  or use email
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Mode Tabs: Sign In vs Sign Up */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    clearError();
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    clearError();
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
                {/* Sign Up Name Field */}
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Captain Arvind Rao"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Operator ID */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {authMode === 'signin' ? 'Email or Operator ID' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={
                        authMode === 'signin'
                          ? 'e.g. user@gmail.com or ADM-01'
                          : 'e.g. yourname@domain.com'
                      }
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) clearError();
                      }}
                      className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    {authMode === 'signin' && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Any password accepted
                      </span>
                    )}
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
                      className="w-full pl-10 pr-10 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                {/* Role Selector (Sign Up Mode) */}
                {authMode === 'signup' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Workspace Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('ADMIN')}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedRole === 'ADMIN'
                            ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px]">Admin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('DRIVER')}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedRole === 'DRIVER'
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-700 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px]">Driver</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('SIMULATION_OPERATOR')}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedRole === 'SIMULATION_OPERATOR'
                            ? 'border-purple-500 bg-purple-50/70 text-purple-700 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Flame className="w-4 h-4 text-purple-600" />
                        <span className="text-[11px]">Simulator</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                    Keep me signed in
                  </label>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isLoading || !identifier.trim() || !password.trim()}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isLoading || !identifier.trim() || !password.trim()
                      ? 'bg-blue-400 cursor-not-allowed shadow-none'
                      : 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{authMode === 'signin' ? 'Authenticating...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Complete Registration'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Account Fast-Pills for Presentations */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  1-Click Presentation Demo Logins:
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('ADMIN')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('DRIVER')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('SIM')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Simulator
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Secure Access Footer Note */}
          <div className="pt-1 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Encryption & Role-Based Access Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Sign in with Google</h3>
                <p className="text-[11px] text-slate-500">Choose an account to continue to NerLogix</p>
              </div>
            </div>

            {/* Quick Google Profiles */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleGoogleQuickAuth(
                    'commander.sen@gmail.com',
                    'Major Vikram Sen',
                    'ADMIN'
                  )
                }
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  V
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                    Major Vikram Sen
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">commander.sen@gmail.com</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleGoogleQuickAuth(
                    'rohit.driver@gmail.com',
                    'Rohit Das',
                    'DRIVER'
                  )
                }
                className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-600">
                    Rohit Das
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">rohit.driver@gmail.com</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  Driver
                </span>
              </button>
            </div>

            {/* Custom Google Account Section */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Or enter any Google Email:
              </span>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={googleCustomEmail}
                onChange={(e) => setGoogleCustomEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Display Name (optional)"
                value={googleCustomName}
                onChange={(e) => setGoogleCustomName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-600">Role:</span>
                <select
                  value={googleRole}
                  onChange={(e) => setGoogleRole(e.target.value as UserRole)}
                  className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="ADMIN">Admin (Control Center)</option>
                  <option value="DRIVER">Driver (Heavy Freight)</option>
                  <option value="SIMULATION_OPERATOR">Simulation Operator</option>
                </select>
              </div>

              <button
                type="button"
                disabled={!googleCustomEmail.trim()}
                onClick={() =>
                  handleGoogleQuickAuth(
                    googleCustomEmail.trim(),
                    googleCustomName.trim() || googleCustomEmail.split('@')[0],
                    googleRole
                  )
                }
                className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                Sign In with this Google Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        NerLogix™ Logistics Intelligence Platform • All operations encrypted
      </div>
    </div>
  );
};

export default LoginPage;
