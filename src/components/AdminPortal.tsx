import React, { useState, useEffect } from 'react';
import { ApiService, HARDCODED_SHEET_IDS } from '../services/apiService';
import { CentralTimeService, CompetitionConfig } from '../services/centralTimeService';
import { IndividualLeaderboardEntry, LeaderboardData } from '../types';
import { getAvatarImage } from '../data/avatars';
import { TEAMS } from '../data/seedData';
import {
  Shield,
  Key,
  Database,
  Trash2,
  Calendar,
  Clock,
  Globe,
  RefreshCw,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Users,
  Award,
  Zap,
  ArrowRight,
  Lock,
  Unlock,
} from 'lucide-react';

interface AdminPortalProps {
  onClose: () => void;
  onRosterUpdated?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose, onRosterUpdated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(CentralTimeService.isAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Roster & Config state
  const [staffList, setStaffList] = useState<IndividualLeaderboardEntry[]>([]);
  const [userProfilesMap, setUserProfilesMap] = useState<Record<string, any>>({});
  const [config, setConfig] = useState<CompetitionConfig>(CentralTimeService.getCompetitionConfig());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');

  // Apps Script & sheet status
  const [gasUrlInput, setGasUrlInput] = useState<string>(ApiService.getStoredGasUrl());
  const [isTestingUrl, setIsTestingUrl] = useState<boolean>(false);
  const [urlMessage, setUrlMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Sheet Initialization
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [showInitConfirm, setShowInitConfirm] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string>('');

  // Live Central Clock
  const [centralTimeDisplay, setCentralTimeDisplay] = useState<string>('');
  const [midnightCountdown, setMidnightCountdown] = useState<string>('');

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/Code.gs');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch (e) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Load data
  const loadRosterData = async () => {
    const list = ApiService.getLocalDrivers();
    setStaffList(list);
    setUserProfilesMap(ApiService.getUserProfilesMap());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadRosterData();
    }
  }, [isAuthenticated]);

  // Live clock interval
  useEffect(() => {
    const updateClock = () => {
      setCentralTimeDisplay(CentralTimeService.getCentralTimeFormatted());
      const remaining = CentralTimeService.getTimeUntilCentralMidnight();
      setMidnightCountdown(
        `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (CentralTimeService.verifyAdminPassword(passwordInput.trim())) {
      setIsAuthenticated(true);
      loadRosterData();
    } else {
      setAuthError('Incorrect admin password. Default is: admin123');
    }
  };

  const handleLogoutAdmin = () => {
    CentralTimeService.logoutAdmin();
    setIsAuthenticated(false);
  };

  // Change Active Day
  const handleSetGlobalDay = (day: number | null) => {
    CentralTimeService.setGlobalDay(day);
    setConfig(CentralTimeService.getCompetitionConfig());
    setActionSuccessNotice(
      day === null
        ? 'Global challenge day set to Auto-Calendar Progression (1 day per 24h).'
        : `Global challenge day locked to Day ${day} for all staff worldwide!`
    );
    setTimeout(() => setActionSuccessNotice(''), 4000);
    if (onRosterUpdated) onRosterUpdated();
  };

  // Change Timezone
  const handleTimezoneChange = (tz: string) => {
    CentralTimeService.saveCompetitionConfig({ timezone: tz });
    setConfig(CentralTimeService.getCompetitionConfig());
    setActionSuccessNotice(`Central timezone updated to ${tz}. All staff midnight lock anchored here.`);
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  // 1-Click Initialize Sheet
  const handleExecuteInitializeSheet = async () => {
    setIsInitializing(true);
    setShowInitConfirm(false);
    try {
      const res = await ApiService.initializeDatabaseSheet();
      await loadRosterData();
      setActionSuccessNotice(res.message);
      if (onRosterUpdated) onRosterUpdated();
    } catch (e: any) {
      setActionSuccessNotice(`Initialization error: ${e.message}`);
    } finally {
      setIsInitializing(false);
      setTimeout(() => setActionSuccessNotice(''), 6000);
    }
  };

  // Delete individual staff member
  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to delete staff member "${staffName}" (${staffId})?`)) {
      await ApiService.deleteStaffMember(staffId);
      await loadRosterData();
      setActionSuccessNotice(`Staff member "${staffName}" (${staffId}) removed.`);
      setTimeout(() => setActionSuccessNotice(''), 4000);
      if (onRosterUpdated) onRosterUpdated();
    }
  };

  // Test Apps Script URL
  const handleTestGasUrl = async () => {
    setIsTestingUrl(true);
    setUrlMessage(null);
    try {
      ApiService.setGasUrl(gasUrlInput);
      const res = await ApiService.pingGasBackend(gasUrlInput);
      setUrlMessage({
        success: res.success,
        text: res.message,
      });
    } catch (e: any) {
      setUrlMessage({
        success: false,
        text: e.message || 'Connection test failed',
      });
    } finally {
      setIsTestingUrl(false);
    }
  };

  // Export Roster as CSV
  const handleExportCsv = () => {
    if (staffList.length === 0) {
      alert('No staff registered to export.');
      return;
    }

    const headers = [
      'Staff_ID',
      'Staff_Name',
      'Group_Name',
      'Avatar_ID',
      'Day1',
      'Day2',
      'Day3',
      'Day4',
      'Day5',
      'Day6',
      'Day7',
      'Day8',
      'Day9',
      'Day10',
      'Total_Points',
      'Total_Time_Seconds',
      'Last_Completed_Day',
    ];

    const rows = staffList.map((stf) => {
      const prof = userProfilesMap[stf.staffId.toUpperCase()] || {};
      const scores = prof.scores || {};
      return [
        stf.staffId,
        `"${stf.staffName.replace(/"/g, '""')}"`,
        `"${stf.groupName}"`,
        stf.avatarId,
        scores.Day1 || 0,
        scores.Day2 || 0,
        scores.Day3 || 0,
        scores.Day4 || 0,
        scores.Day5 || 0,
        scores.Day6 || 0,
        scores.Day7 || 0,
        scores.Day8 || 0,
        scores.Day9 || 0,
        scores.Day10 || 0,
        stf.totalPoints,
        stf.totalTimeSeconds,
        stf.lastCompletedDay,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Roster_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((stf) => {
    const matchesSearch =
      stf.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeamFilter === 'ALL' || stf.groupName === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  const activeGlobalDay = CentralTimeService.getGlobalActiveChallengeDay();

  // 1. Password Screen if not logged in
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <span>Admin Operational Authentication</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter the competition administrator password to access the staff roster, 1-click sheet initialization, and central day controller.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password (default: admin123)"
                className="w-full pl-9 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
                required
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Default operational password: <code className="text-emerald-400 font-mono">admin123</code>
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Admin Command Center</span>
          </button>
        </form>
      </div>
    );
  }

  // 2. Full Admin Command Center
  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Operational Command Center
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized competition controller, staff roster viewer, and sheet initialization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogoutAdmin}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Lock Admin
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Exit to Registration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success notification banner */}
      {actionSuccessNotice && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Cloud Sync Status Alert for Multi-User & Vercel */}
      {!ApiService.isCloudConnected() ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Shared Cloud Database Status: Standalone Mode (Offline)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your friends are each seeing a separate single-user quiz because the central Google Apps Script Web App URL has not been connected to the app. Without this URL, each browser stores data only on its own phone or computer!
          </p>
          <div className="text-[11px] text-amber-200/90 bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between gap-2">
            <span>Deploy the script in your Google Sheet once (Section 4 below) to link all friends together live!</span>
            <a
              href="#google-script-setup"
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 transition-colors"
            >
              See 3-Step Setup ↓
            </a>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Live Shared Cloud Database Active:</strong> Registrations and quiz scores automatically save to Google Sheet User_Scores_DB and sync across all devices!</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
            Live Synced
          </span>
        </div>
      )}

      {/* Stats Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Registered Staff
          </span>
          <span className="text-xl font-black text-white font-mono mt-0.5 block">
            {staffList.length} <span className="text-xs text-slate-500 font-normal">/ 50 max</span>
          </span>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Active Global Day
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
            Day {activeGlobalDay}
          </span>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Central Time ({config.timezone.split('/')[1] || config.timezone})
          </span>
          <span className="text-sm font-bold text-slate-200 font-mono mt-1 block truncate">
            {centralTimeDisplay || '--:--:--'}
          </span>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Midnight Window
          </span>
          <span className="text-sm font-black text-amber-400 font-mono mt-1 block">
            ⏱ {midnightCountdown || '--:--'}
          </span>
        </div>
      </div>

      {/* SECTION 1: 1-CLICK INITIALIZE / CLEAR SHEET */}
      <div className="p-4 bg-slate-900/90 border border-rose-500/30 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Database className="w-4 h-4 text-rose-400" />
              <span>1-Click Initialize Sheet (User_Scores_DB)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Purges all staff data, clears any test registrations (like Kamlesh or testing IDs), and initializes clean headers in <code className="text-amber-300">User_Scores_DB</code> so the competition starts with exactly 0 staff.
            </p>
          </div>

          <button
            type="button"
            disabled={isInitializing}
            onClick={() => setShowInitConfirm(true)}
            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isInitializing ? 'Initializing Database...' : 'Initialize / Reset Sheet'}</span>
          </button>
        </div>

        {/* Confirmation Modal / Strip */}
        {showInitConfirm && (
          <div className="mt-3 p-3.5 bg-rose-950/80 border border-rose-500 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Confirm Database Reset</span>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure? This will wipe the registered staff roster back to 0. Real staff will be logged fresh upon registration.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteInitializeSheet}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Yes, Reset Everything Now
              </button>
              <button
                type="button"
                onClick={() => setShowInitConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: SYNCHRONIZED GLOBAL CHALLENGE DAY CONTROLLER */}
      <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Calendar className="w-4 h-4" />
              <span>Synchronized Global Challenge Day (Day 1..10)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              All staff receive this exact same day. If staff joins on Day 3, they get Day 3 (Days 1 & 2 marked missed).
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Active: <strong>Day {activeGlobalDay}</strong> {config.manualDayOverride ? '(Manual Override)' : '(Auto Calendar)'}
          </div>
        </div>

        {/* Day Selector Buttons */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select Active Challenge Day Worldwide:
          </span>
          <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5 text-xs">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => {
              const isCurrent = config.manualDayOverride === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSetGlobalDay(d)}
                  className={`py-2 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Day {d}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleSetGlobalDay(null)}
              className={`py-2 px-1 rounded-lg font-bold transition-all text-center col-span-5 sm:col-span-1 cursor-pointer ${
                config.manualDayOverride === null
                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
              }`}
              title="Automatically advance 1 day every 24h at central midnight"
            >
              Auto 📅
            </button>
          </div>
        </div>

        {/* Central Timezone Control */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Central Operations Timezone (Anti-Cheat Anchor):
            </label>
            <select
              value={config.timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-400 focus:outline-none"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30) - Central Operations</option>
              <option value="Asia/Manila">Asia/Manila (PHT +08:00) - Philippines</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-slate-400 leading-tight">
              Midnight countdown is strictly synchronized to this timezone. Moving local device clock forward cannot bypass this lock.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: REGISTERED STAFF INFORMATION & ROSTER VIEWER */}
      <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>Registered Staff Roster Information ({staffList.length})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect all registered staff, assigned railway teams, daily scores, total points, and elapsed time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={loadRosterData}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
              title="Refresh Roster"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name, ID (e.g. 1024), or group..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-400"
          >
            <option value="ALL">All 10 Railway Teams</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto max-h-[360px] rounded-xl border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Staff</th>
                <th className="py-2.5 px-3">Railway Group</th>
                <th className="py-2.5 px-3 text-center">Day 1..10 Breakdown</th>
                <th className="py-2.5 px-3 text-center">Total Time</th>
                <th className="py-2.5 px-3 text-right">Points</th>
                <th className="py-2.5 px-3 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {staffList.length === 0
                      ? 'No staff registered yet. Registration is clean and ready for staff!'
                      : 'No staff match the search filter.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((stf) => {
                  const prof = userProfilesMap[stf.staffId.toUpperCase()] || {};
                  const scores = prof.scores || {};
                  return (
                    <tr key={stf.staffId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={getAvatarImage(stf.avatarId)}
                            alt={stf.staffName}
                            className="w-7 h-7 rounded-lg object-cover bg-slate-800 border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">{stf.staffName}</span>
                            <span className="font-mono text-[10px] text-emerald-400">{stf.staffId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300">
                          {stf.groupName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => {
                            const val = scores[`Day${d}`];
                            const isMissed = d < activeGlobalDay && !val;
                            return (
                              <span
                                key={d}
                                title={`Day ${d}: ${val ? val + ' pts' : isMissed ? 'Missed' : 'Upcoming'}`}
                                className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-mono ${
                                  val
                                    ? 'bg-emerald-500 text-slate-950 font-bold'
                                    : isMissed
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {val ? '✓' : isMissed ? '—' : d}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono text-amber-300 text-[11px]">
                        {stf.totalTimeSeconds ? `${stf.totalTimeSeconds}s` : '--'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-xs">
                        {stf.totalPoints.toLocaleString()} pts
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(stf.staffId, stf.staffName)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete staff record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: GOOGLE SHEETS & APPS SCRIPT SETUP (SHARED CLOUD DATABASE) */}
      <div id="google-script-setup" className="p-4 sm:p-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>Connect Shared Google Sheets Backend (For Vercel & All Devices)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow this 2-minute setup to enable real multi-user synchronization. All registrations and quiz scores will log into Google Sheets live!
            </p>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border w-fit ${
            ApiService.isCloudConnected()
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            {ApiService.isCloudConnected() ? '● Cloud Connected' : '● Standalone Mode'}
          </span>
        </div>

        {/* 3 Step Deployment Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">
                1
              </span>
              <span>Open Apps Script</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Open your Google Sheet{' '}
              <a
                href={`https://docs.google.com/spreadsheets/d/${HARDCODED_SHEET_IDS.USER_SCORES_DB}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline font-bold"
              >
                User_Scores_DB ↗
              </a>
              . In the top menu, click <strong>Extensions</strong> &rarr; <strong>Apps Script</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">
                  2
                </span>
                <span>Paste Code.gs</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
              >
                {copiedCode ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Delete any default code in the editor, paste the copied <code className="text-emerald-300">Code.gs</code> script, then press <kbd className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">Ctrl+S</kbd> to save.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">
                3
              </span>
              <span>Deploy Web App</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Click blue <strong>Deploy</strong> &rarr; <strong>New Deployment</strong> &rarr; Select <strong>Web app</strong>. Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>. Click Deploy and copy the Web App URL!
            </p>
          </div>
        </div>

        {/* Input box to save and test */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Google Apps Script Web App URL:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={gasUrlInput}
              onChange={(e) => setGasUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={isTestingUrl}
              onClick={handleTestGasUrl}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isTestingUrl ? 'Pinging Backend...' : 'Save & Ping'}
            </button>
          </div>
          {urlMessage && (
            <p className={`text-xs mt-1.5 ${urlMessage.success ? 'text-emerald-400' : 'text-rose-400'}`}>
              {urlMessage.text}
            </p>
          )}
        </div>

        {/* Vercel Tip & Direct Links */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="text-[11px] text-slate-400">
            💡 <strong>Vercel Deployment Tip:</strong> In your Vercel project dashboard, go to <em>Settings &gt; Environment Variables</em> and add <code className="text-emerald-400 font-mono font-bold">VITE_GAS_URL</code> with your Web App URL. That way, all friends get the cloud connection automatically!
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://docs.google.com/spreadsheets/d/${HARDCODED_SHEET_IDS.USER_SCORES_DB}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>User_Scores_DB</span>
            </a>
            <span className="text-slate-600">·</span>
            <a
              href={`https://docs.google.com/spreadsheets/d/${HARDCODED_SHEET_IDS.GEN_QUIZ}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>GEN_QUIZ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
