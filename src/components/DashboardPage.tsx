import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, LeaderboardData } from '../types';
import { getAvatarImage } from '../data/avatars';
import { getMultiplierForDay } from '../data/questionBank';
import { ApiService } from '../services/apiService';
import { CentralTimeService } from '../services/centralTimeService';
import {
  Trophy,
  Users,
  Clock,
  Play,
  CheckCircle2,
  HelpCircle,
  LogOut,
  Flame,
  Award,
  Calendar,
  Zap,
  Timer,
  Lock,
  Target,
  Sparkles,
  Info,
  Copy,
  Check,
  RefreshCw,
  Database,
} from 'lucide-react';

interface DashboardPageProps {
  user: UserProfile;
  leaderboard: LeaderboardData;
  activeChallengeDay: number;
  onSelectDay: (day: number) => void;
  onStartQuiz: (day: number) => void;
  onSignOut: () => void;
  onOpenSOPRules: () => void;
  onRefreshData: () => void;
  onOpenBackendSetup?: () => void;
  isGasConnected?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  leaderboard,
  activeChallengeDay,
  onSelectDay,
  onStartQuiz,
  onSignOut,
  onOpenSOPRules,
  onRefreshData,
  onOpenBackendSetup,
  isGasConnected = false,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, timezone: 'Asia/Kolkata' });
  const [showSheetNotice, setShowSheetNotice] = useState<boolean>(false);
  const [gasUrlInput, setGasUrlInput] = useState<string>(ApiService.getStoredGasUrl());
  const [isTestingUrl, setIsTestingUrl] = useState<boolean>(false);
  const [urlTestMessage, setUrlTestMessage] = useState<{ success?: boolean; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const myRowRef = useRef<HTMLTableRowElement | null>(null);

  // Authoritative Central Countdown timer to midnight (anti-clock-tampering)
  useEffect(() => {
    const updateTimer = () => {
      const remaining = CentralTimeService.getTimeUntilCentralMidnight();
      setTimeRemaining({
        hours: remaining.hours,
        minutes: remaining.minutes,
        seconds: remaining.seconds,
        timezone: remaining.timezone,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const globalActiveDay = CentralTimeService.getGlobalActiveChallengeDay();
  const multiplierInfo = getMultiplierForDay(activeChallengeDay);
  const userAvatarUrl = getAvatarImage(user.avatarId);

  const centralTodayStr = CentralTimeService.getCentralDateString();
  const hasCompletedToday = Boolean(user.lastCompletedDate === centralTodayStr);

  // Check if user completed the active challenge day
  const isDayCompleted = !!user.scores[`Day${activeChallengeDay}`];
  const dayScoreEarned = user.scores[`Day${activeChallengeDay}`] || 0;

  // Find user's group standings
  const userGroup = leaderboard.groups.find((g) => g.teamName === user.groupName);
  
  // Find user's actual rank among all registered staff
  const normalizedUserStaffId = String(user?.staffId ?? '').trim().toUpperCase();
  const userRankIndex = (leaderboard?.individuals || []).findIndex(
    (i) => String(i?.staffId ?? '').trim().toUpperCase() === normalizedUserStaffId
  );
  const actualRank = userRankIndex >= 0 ? userRankIndex + 1 : '-';

  const formatTime = (secs: number) => {
    if (!secs || secs <= 0) return '--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    return `${s}s`;
  };

  const topThreeIndividuals = leaderboard.individuals.slice(0, 3);
  const allStaffList = leaderboard.individuals;

  const scrollToMyRank = () => {
    if (myRowRef.current) {
      myRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 1. Header Section: User Profile & Siemens Standard Theme */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={userAvatarUrl}
                alt={user.staffName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400 shadow-md bg-slate-800"
              />
              <span className="absolute -bottom-1 -right-1 text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full shadow">
                #{actualRank}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {user.staffName}
                </h2>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {user.staffId}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-bold">{user.groupName}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-slate-300">
                  <strong className="text-white font-bold">{user.totalPoints.toLocaleString()}</strong> pts
                </span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-amber-400 flex items-center gap-0.5 text-[11px]">
                  <Timer className="w-3 h-3 inline" />
                  {formatTime(user.totalTimeSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls: Clean Live Sync Display */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-800/80 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-medium">Google Sheets: Synced</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            </div>

            <button
              onClick={onOpenSOPRules}
              title="View Challenge Rules & Multipliers"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Rules & Multipliers</span>
            </button>

            <button
              onClick={onSignOut}
              title="Switch Staff Profile"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 2. Challenge Day & Timer Hero Banner */}
        <section className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Day & Multiplier info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Day {activeChallengeDay} of 10 Challenge
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${multiplierInfo.tagColor}`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  {multiplierInfo.name}
                </span>

                <span className="text-xs text-slate-400">
                  Phase {multiplierInfo.phase} of 3
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Day {activeChallengeDay} Operational Quiz Window
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {multiplierInfo.description}. 100 pt baseline + 100 pt accuracy bonus × {multiplierInfo.multiplier}x multiplier.
                </p>
              </div>

              {/* Informational Progression Strip (READ-ONLY, Locked to Current Day) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    10-Day Progression (Synchronized Global Schedule):
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Today is Global Day {globalActiveDay}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => {
                    const isSelected = d === activeChallengeDay;
                    const hasDone = !!user.scores[`Day${d}`];
                    const isMissed = d < globalActiveDay && !hasDone;
                    const isTodayActive = d === globalActiveDay && !hasDone;
                    const isLockedFuture = d > globalActiveDay;
                    const mult = getMultiplierForDay(d).multiplier;

                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => onSelectDay(d)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex flex-col items-center gap-0.5 cursor-pointer select-none ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
                            : hasDone
                            ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30 hover:bg-slate-800/80'
                            : isTodayActive
                            ? 'bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800/80 animate-pulse'
                            : isMissed
                            ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/30 opacity-70'
                            : 'bg-slate-900/60 text-slate-500 border border-slate-800 hover:bg-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {hasDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {isMissed && <span className="text-[10px] text-rose-400 font-bold">✕</span>}
                          {isLockedFuture && <Lock className="w-3 h-3 text-slate-500" />}
                          {isTodayActive && <Flame className="w-3 h-3 text-amber-400" />}
                          <span className="text-xs">Day {d}</span>
                        </div>
                        <span className="text-[9px] opacity-80">
                          {hasDone
                            ? `Done`
                            : isMissed
                            ? `Missed`
                            : isTodayActive
                            ? `Active (${mult}x)`
                            : `Locked`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Synchronized Competition: Everyone takes today's active quiz (Day {globalActiveDay}). Missed days cannot be retaken. Midnight unlock is anchored to Central Time ({timeRemaining.timezone}).
                </p>
              </div>
            </div>

            {/* Right: Timer Widget & Action Button (STRICT NO-RETAKE RULE) */}
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-xl border border-slate-700/80">
              {/* Dynamic Countdown Timer */}
              <div className="w-full text-left lg:text-right">
                <div className="flex items-center lg:justify-end gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Central Midnight Window ({timeRemaining.timezone}):</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-wider flex items-center lg:justify-end gap-1">
                  <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </span>
                  <span>:</span>
                  <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </span>
                  <span>:</span>
                  <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-400">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Universal unlock at 00:00 midnight Central Time
                </p>
              </div>

              {/* Action Button: Enforces Strict 1-Quiz-Per-Day rule */}
              <div className="w-full">
                {isDayCompleted ? (
                  <div className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3.5 text-center space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Day {activeChallengeDay} Quiz Completed</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Logged <strong className="text-emerald-300 font-mono">+{dayScoreEarned} pts</strong> for {user.groupName}.
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 mt-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>{hasCompletedToday ? `Completed today. Next quiz window opens at midnight Central Time (${timeRemaining.timezone})!` : 'Completed. No retakes permitted.'}</span>
                    </div>
                  </div>
                ) : (activeChallengeDay < globalActiveDay) ? (
                  <div className="w-full bg-slate-950/90 border border-rose-500/30 rounded-xl p-3.5 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-sm">
                      <span>Day {activeChallengeDay} Window Closed (Missed)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      This date was missed (0 pts). The active competition is currently on Day {globalActiveDay}.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectDay(globalActiveDay)}
                      className="mt-1 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Go to Today's Active Quiz (Day {globalActiveDay})
                    </button>
                  </div>
                ) : (activeChallengeDay > globalActiveDay) ? (
                  <div className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3.5 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-slate-400 font-bold text-sm">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>Day {activeChallengeDay} Locked (Upcoming)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Opens automatically when the global competition calendar reaches Day {activeChallengeDay}.
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1.5 px-3 font-mono font-bold mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Next Window in: {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}</span>
                    </div>
                  </div>
                ) : hasCompletedToday ? (
                  <div className="w-full bg-slate-950/90 border border-amber-500/40 rounded-xl p-3.5 text-center space-y-2 shadow-inner">
                    <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-sm">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Shift Completed for Today</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Shift rules strictly permit <strong>1 challenge per calendar day</strong>. Next day quiz unlocks at 00:00 midnight in Central Time ({timeRemaining.timezone}).
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1.5 px-3 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Next Window in: {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onStartQuiz(activeChallengeDay)}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                    <span>Start Day {activeChallengeDay} Quiz</span>
                    <span className="text-xs font-bold bg-slate-950/20 px-2 py-0.5 rounded-full ml-1">
                      Up to {multiplierInfo.maxDaily} pts
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Team Standing Highlight */}
        {userGroup && (
          <section className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                #{userGroup.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{userGroup.teamName}</h3>
                  <span className="text-xs text-slate-400">· {userGroup.memberCount} of 5 Active Staff</span>
                </div>
                <p className="text-xs text-slate-400">
                  Combined team aggregate: <strong className="text-emerald-300 font-mono font-bold">{userGroup.aggregatePoints.toLocaleString()} pts</strong>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Full 5-member participation beats spotty brilliance!</span>
            </div>
          </section>
        )}

        {/* 4. Leaderboard Hub */}
        <section className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Challenge Standings & Leaderboards</span>
                </h2>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {allStaffList.length} Staff Registered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tie-Breaker Rule: When points are tied, staff with lowest completion time ranks higher.
              </p>
            </div>

            {/* Segmented Tab Controls & Quick Jump */}
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === 'individual' && actualRank !== '-' && (
                <button
                  onClick={scrollToMyRank}
                  className="px-2.5 py-1.5 text-xs text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jump to My Rank (#{actualRank})</span>
                </button>
              )}

              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setActiveTab('individual')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'individual'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Individual Standings ({allStaffList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('group')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'group'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All 10 Groups</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: INDIVIDUAL LEADERBOARD WITH SCROLLABLE STAFF TABLE */}
          {activeTab === 'individual' && (
            <div className="mt-6 space-y-6">
              {/* Podium for Top 3 Individuals */}
              {topThreeIndividuals.length >= 3 ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto pt-4 pb-2 items-end">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center order-1 text-center">
                    <div className="relative mb-2">
                      <img
                        src={getAvatarImage(topThreeIndividuals[1].avatarId)}
                        alt={topThreeIndividuals[1].staffName}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-slate-400 shadow-md bg-slate-800"
                      />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 text-slate-950 text-xs font-black flex items-center justify-center">
                        2
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[100px] block">
                      {topThreeIndividuals[1].staffName}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                      {topThreeIndividuals[1].groupName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                      {topThreeIndividuals[1].totalPoints.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5">
                      <Timer className="w-2.5 h-2.5 inline" />
                      {formatTime(topThreeIndividuals[1].totalTimeSeconds)}
                    </span>
                    <div className="w-full h-16 sm:h-20 bg-slate-900 rounded-t-lg mt-2 border-t border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                      2nd Place
                    </div>
                  </div>

                  {/* 1st Champion */}
                  <div className="flex flex-col items-center order-2 text-center -mt-4">
                    <div className="relative mb-2">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400">
                        <Trophy className="w-5 h-5 fill-amber-400 animate-bounce" />
                      </div>
                      <img
                        src={getAvatarImage(topThreeIndividuals[0].avatarId)}
                        alt={topThreeIndividuals[0].staffName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-4 ring-amber-400 shadow-lg shadow-amber-400/20 bg-slate-800"
                      />
                      <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                        1
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[120px] block">
                      {topThreeIndividuals[0].staffName}
                    </span>
                    <span className="text-[11px] text-emerald-400 truncate max-w-[100px]">
                      {topThreeIndividuals[0].groupName}
                    </span>
                    <span className="text-sm font-mono font-black text-amber-300 mt-0.5">
                      {topThreeIndividuals[0].totalPoints.toLocaleString()} pts
                    </span>
                    <span className="text-[11px] font-mono text-amber-300 flex items-center gap-0.5 font-bold">
                      <Timer className="w-3 h-3 inline" />
                      {formatTime(topThreeIndividuals[0].totalTimeSeconds)}
                    </span>
                    <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-900 to-amber-950/40 rounded-t-lg mt-2 border-t-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-300">
                      1st Champion
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center order-3 text-center">
                    <div className="relative mb-2">
                      <img
                        src={getAvatarImage(topThreeIndividuals[2].avatarId)}
                        alt={topThreeIndividuals[2].staffName}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-2 ring-amber-700 shadow-md bg-slate-800"
                      />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-slate-100 text-xs font-black flex items-center justify-center">
                        3
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[100px] block">
                      {topThreeIndividuals[2].staffName}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                      {topThreeIndividuals[2].groupName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                      {topThreeIndividuals[2].totalPoints.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5">
                      <Timer className="w-2.5 h-2.5 inline" />
                      {formatTime(topThreeIndividuals[2].totalTimeSeconds)}
                    </span>
                    <div className="w-full h-12 sm:h-16 bg-slate-900 rounded-t-lg mt-2 border-t border-amber-700/80 flex items-center justify-center text-xs font-bold text-amber-500">
                      3rd Place
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/60 text-center text-xs text-slate-400">
                  <span>Podium champions will unlock as staff register and complete quizzes!</span>
                </div>
              )}

              {/* Scrollable Container showing all registered staff members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Showing all {allStaffList.length} staff rankings (scrollable table):</span>
                  <span>⚡ Tie-Breaker: Lower Total Time Ranks Higher</span>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-xl border border-slate-700/80 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-900 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-700/80 shadow-sm">
                      <tr>
                        <th className="py-3 px-4 w-16">Rank</th>
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Group</th>
                        <th className="py-3 px-4 text-center">Days Done</th>
                        <th className="py-3 px-4 text-center">Total Time ⏱️</th>
                        <th className="py-3 px-4 text-right">Total Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {allStaffList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-700">
                              <Users className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-white text-sm">No Staff Registered Yet</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                              As staff members register on Page 1, their scores, teams, and completion times will automatically appear here live!
                            </p>
                          </td>
                        </tr>
                      ) : (
                        allStaffList.map((member) => {
                          const memberId = String(member?.staffId ?? '').trim();
                          const isCurrentUser = memberId.toUpperCase() === normalizedUserStaffId;
                          return (
                            <tr
                              key={memberId || `staff-${member.rank}`}
                              ref={isCurrentUser ? myRowRef : null}
                              className={`transition-colors ${
                                isCurrentUser
                                  ? 'bg-emerald-500/15 font-bold ring-1 ring-emerald-500/40'
                                  : 'hover:bg-slate-800/40'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                    member.rank === 1
                                      ? 'bg-amber-400 text-slate-950 font-black'
                                      : member.rank === 2
                                      ? 'bg-slate-300 text-slate-950 font-black'
                                      : member.rank === 3
                                      ? 'bg-amber-700 text-white font-black'
                                      : isCurrentUser
                                      ? 'bg-emerald-500 text-slate-950 font-black'
                                      : 'text-slate-400 bg-slate-800'
                                  }`}
                                >
                                  {member.rank}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={getAvatarImage(member.avatarId)}
                                    alt={member.staffName}
                                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700 bg-slate-800"
                                  />
                                  <div>
                                    <span className="font-semibold text-white block">
                                      {member.staffName}
                                      {isCurrentUser && (
                                        <span className="ml-1.5 text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                          You
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400">
                                      {member.staffId}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-300">
                                <span className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                                  {member.groupName}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-slate-400">
                                {member.lastCompletedDay} / 10
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-amber-300 text-xs">
                                {formatTime(member.totalTimeSeconds)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                                {member.totalPoints.toLocaleString()} pts
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* TAB 2: GROUP LEADERBOARD */}
          {activeTab === 'group' && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leaderboard.groups.map((group) => {
                  const isUserTeam = group.teamName === user.groupName;
                  return (
                    <div
                      key={group.teamName}
                      className={`p-4 rounded-xl border transition-all ${
                        isUserTeam
                          ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/15'
                          : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                              group.rank === 1
                                ? 'bg-amber-400 text-slate-950'
                                : group.rank === 2
                                ? 'bg-slate-300 text-slate-950'
                                : group.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            #{group.rank}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{group.teamName}</h4>
                              {isUserTeam && (
                                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  Your Team
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {group.memberCount} of 5 Active Staff · Cumulative Time: {formatTime(group.aggregateTimeSeconds)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-base font-black text-white block">
                            {group.aggregatePoints.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-400">Combined pts</span>
                        </div>
                      </div>

                      {/* Member list preview */}
                      {group.members.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-slate-500">Staff:</span>
                          {group.members.map((m, idx) => (
                            <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                              {m.name}: <strong className="font-mono text-white">{m.points}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Google Sheets Sync Explanatory Modal */}
      {showSheetNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                <span>Google Sheets Connection & Publishing Guide</span>
              </h3>
              <button
                onClick={() => setShowSheetNotice(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <strong className="text-emerald-400 block mb-1">
                  1. Why are names/scores not appearing in your Google Sheet yet?
                </strong>
                <p>
                  Google Sheets is protected by Google security. A browser cannot directly write to a private Google Sheet. To sync real submissions into <code className="text-amber-300">User_Scores_DB</code>, the provided <code className="text-emerald-300">Code.gs</code> script must be deployed once as a <strong>Web App</strong> in your Google Sheet (Extensions &rarr; Apps Script &rarr; Deploy &rarr; Web app with access: "Anyone").
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-sky-300 block mb-1">
                  2. Why did Day 7 show different questions?
                </strong>
                <p>
                  Your Google Sheet <code className="text-amber-300">GEN_QUIZ</code> is currently set to <strong>"Restricted"</strong>. When restricted, Google blocks external web access (HTTP 401).
                  To make the app pull your custom questions from Day 1 to Day 10 directly:
                </p>
                <ol className="list-decimal list-inside mt-1.5 space-y-1 text-slate-400">
                  <li>Open your Google Sheet: <code className="text-white">GEN_QUIZ</code></li>
                  <li>Click the blue <strong>Share</strong> button in the top-right corner.</li>
                  <li>Under <em>General Access</em>, change from <strong>Restricted</strong> to <strong>"Anyone with the link can view"</strong>.</li>
                  <li>Once set, this app will instantly load your exact questions from each Day tab!</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSheetNotice(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/95 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        <span>10-Day Quiz Challenge · Operational Excellence · Connected to Google Sheets</span>
        {onOpenBackendSetup && (
          <button
            onClick={onOpenBackendSetup}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            ⚙ Admin Backend Settings
          </button>
        )}
      </footer>
    </div>
  );
};
