import React, { useState } from 'react';
import { KAHOOT_AVATARS } from '../data/avatars';
import { ApiService } from '../services/apiService';
import { UserProfile } from '../types';
import { AdminPortal } from './AdminPortal';
import { Check, ShieldCheck, ArrowRight, User, Hash, Zap, LogIn, UserPlus, Settings, Shield } from 'lucide-react';

interface RegistrationPageProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onOpenBackendSetup?: () => void;
  isGasConnected?: boolean;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onRegisterSuccess,
  onOpenBackendSetup,
  isGasConnected = false,
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'admin'>('register');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(KAHOOT_AVATARS[0].id);
  const [staffId, setStaffId] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  const selectedAvatar = KAHOOT_AVATARS.find((a) => a.id === selectedAvatarId) || KAHOOT_AVATARS[0];

  // New Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!staffId.trim()) {
      setErrorMessage('Please enter your Staff ID (e.g. DRV-1024).');
      return;
    }
    if (!staffName.trim()) {
      setErrorMessage('Please enter your full name or callsign.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await ApiService.registerUser(staffId, staffName, selectedAvatarId);
      onRegisterSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Returning Staff Sign-In Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!staffId.trim()) {
      setErrorMessage('Please enter your Staff ID to sign in.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await ApiService.loginUser(staffId);
      setSuccessNotice(`Welcome back, ${user.staffName}! Loading your dashboard...`);
      setTimeout(() => {
        onRegisterSuccess(user);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not find your Staff ID. Please register first.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Bar - Siemens Slate & Emerald Palette */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
              10D
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                10-Day Railway Challenge
              </h1>
              <p className="text-xs text-slate-400">Railway Operations & General Knowledge</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                ApiService.isCloudConnected()
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ApiService.isCloudConnected() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">{ApiService.isCloudConnected() ? 'Google Sheets: Synced' : 'Cloud Sync: Standalone Mode'}</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Admin Tab</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Staff Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Registration / Login / Admin Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={`w-full ${
            mode === 'admin' ? 'max-w-4xl' : 'max-w-2xl'
          } bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur transition-all duration-300`}
        >
          {/* Header & 3-Way Mode Switcher */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 w-fit">
                {mode === 'admin' ? 'Page 1 · Admin Control Center' : 'Page 1 · Staff Registration'}
              </span>

              {/* Seamless 3-Way Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700/80 w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Registration</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Returning Staff Sign-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('admin');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    mode === 'admin'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-amber-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Tab</span>
                </button>
              </div>
            </div>

            {mode !== 'admin' && (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {mode === 'register' ? 'Select Character & Register' : 'Welcome Back! Quick Sign-In'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {mode === 'register'
                    ? 'First time here? Select your operator avatar and credentials to join the 10-day challenge.'
                    : 'Already registered? Enter your Staff ID to restore your group standing and resume your quizzes.'}
                </p>
              </>
            )}
          </div>

          {/* MODE 1: NEW REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Avatar Selector Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    1. Select Operator Avatar (30 Characters)
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Selected: <strong>{selectedAvatar.name}</strong>
                  </span>
                </div>

                {/* 30 Avatars Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5 max-h-[200px] overflow-y-auto p-2 bg-slate-900/80 rounded-xl border border-slate-700/80 scrollbar-thin scrollbar-thumb-slate-700">
                  {KAHOOT_AVATARS.map((avatar) => {
                    const isSelected = avatar.id === selectedAvatarId;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`relative group rounded-xl p-1 transition-all text-center focus:outline-none cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 bg-emerald-500/15 scale-105'
                            : 'hover:bg-slate-700/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                          <img
                            src={avatar.image}
                            alt={avatar.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="mt-1">
                          <p className="text-[10px] font-bold text-white truncate">{avatar.name}</p>
                        </div>

                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center shadow font-black text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Avatar Banner */}
                <div className="mt-3 bg-slate-900/70 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3">
                  <img
                    src={selectedAvatar.image}
                    alt={selectedAvatar.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400 shadow-sm"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white text-sm block">
                      {selectedAvatar.name}
                    </span>
                    <span className="text-emerald-400">Ready to represent your group!</span>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="staffId"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    2. Staff ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      id="staffId"
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. STF-1051 or 8820"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="staffName"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    3. Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="staffName"
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Jordan Blake"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Error Feedback */}
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 text-sm tracking-wide cursor-pointer"
              >
                {isLoading ? (
                  <span>Registering & Drafting into Team...</span>
                ) : (
                  <>
                    <span>Submit & Register to Challenge</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: RETURNING STAFF QUICK SIGN-IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Resume Challenge on Any Device</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your assigned Staff ID. The system will look up your registration, restore your group name, and resume your challenge right where you left off.
                </p>
              </div>

              <div>
                <label
                  htmlFor="loginStaffId"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Enter Your Staff ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="loginStaffId"
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="Enter your exact Staff ID (e.g. STF-1025)"
                    className="w-full pl-9 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}
              {successNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                  {successNotice}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 text-sm tracking-wide cursor-pointer"
              >
                {isLoading ? (
                  <span>Checking Roster & Loading Standing...</span>
                ) : (
                  <>
                    <span>Sign In & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: ADMIN PORTAL */}
          {mode === 'admin' && (
            <AdminPortal onClose={() => setMode('register')} />
          )}

          {/* Operational Footnote & Automatic Device Persistence Notice */}
          {mode !== 'admin' && (
            <div className="mt-6 pt-5 border-t border-slate-700/60 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50 Staff Members · 10 Railway Groups · Equal automated team distribution</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Auto-Save Active</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                💡 <strong>Centralized Day Sync:</strong> All staff participate on the exact same challenge day simultaneously. New registrants start immediately on today's active day, with past missed days scored 0.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        Operations 10-Day Challenge · Google Sheets & Central Time Architecture
      </footer>
    </div>
  );
};
