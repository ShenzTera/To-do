import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeMode } from '../types';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onSignup: (name: string, email: string, pass: string) => Promise<boolean>;
  onDemoLogin: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

export function AuthScreen({
  onLogin,
  onSignup,
  onDemoLogin,
  isLoading,
  error,
  clearError,
  theme,
  setTheme,
  isDark,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      await onLogin(email, password);
    } else {
      await onSignup(name, email, password);
    }
  };

  const handleTabSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    clearError();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle theme={theme} setTheme={setTheme} isDark={isDark} />
      </div>

      {/* Main Glass Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/15 dark:bg-indigo-400/15 border border-indigo-600/30 dark:border-indigo-400/30 text-indigo-700 dark:text-indigo-400 mb-3 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-heading">
              {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {mode === 'signin'
                ? 'Sign in to access your Supabase cloud-synced tasks'
                : 'Sign up for a personal account backed by Supabase cloud storage'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl glass-pill mb-6 relative">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => handleTabSwitch('signin')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer text-center relative z-10 flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
              {mode === 'signin' && (
                <motion.div
                  layoutId="auth-active-tab"
                  className="absolute inset-0 rounded-lg bg-white dark:bg-slate-800 shadow-xs backdrop-blur-md border border-slate-300/80 dark:border-slate-700/60 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
            </button>

            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer text-center relative z-10 flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
              {mode === 'signup' && (
                <motion.div
                  layoutId="auth-active-tab"
                  className="absolute inset-0 rounded-lg bg-white dark:bg-slate-800 shadow-xs backdrop-blur-md border border-slate-300/80 dark:border-slate-700/60 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="signup-name-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden ring-1 ring-transparent focus:ring-indigo-500/40 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden ring-1 ring-transparent focus:ring-indigo-500/40 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden ring-1 ring-transparent focus:ring-indigo-500/40 transition-all font-medium"
                />
                <button
                  type="button"
                  id="toggle-auth-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300/80 dark:border-slate-700/60" />
            </div>
            <span className="relative px-3 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase bg-white/90 dark:bg-slate-900/90 rounded-full">
              Quick Test
            </span>
          </div>

          {/* Quick Demo Login Button */}
          <button
            type="button"
            id="auth-demo-login-btn"
            onClick={onDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sign in as Demo User (Alex Rivera)</span>
          </button>
        </div>

        {/* Security / Privacy Footnote */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Backed by Supabase Auth & real-time PostgreSQL database
          </p>
        </div>
      </motion.div>
    </div>
  );
}
