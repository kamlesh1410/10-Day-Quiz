import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, LeaderboardData, QuizSessionResult } from './types';
import { ApiService } from './services/apiService';
import { CentralTimeService } from './services/centralTimeService';
import { RegistrationPage } from './components/RegistrationPage';
import { DashboardPage } from './components/DashboardPage';
import { QuizEnginePage } from './components/QuizEnginePage';
import { SOPRulesModal } from './components/SOPRulesModal';
import { BackendSetupModal } from './components/BackendSetupModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'registration' | 'dashboard' | 'quiz'>('registration');
  const [activeChallengeDay, setActiveChallengeDay] = useState<number>(CentralTimeService.getGlobalActiveChallengeDay());
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({
    individuals: [],
    groups: [],
    allIndividuals: [],
  });

  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isGasConnected, setIsGasConnected] = useState<boolean>(Boolean(ApiService.getStoredGasUrl()));
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Load initial data
  const loadLeaderboard = useCallback(async () => {
    setIsGasConnected(Boolean(ApiService.getStoredGasUrl()));
    const data = await ApiService.getLeaderboardData();
    setLeaderboard(data);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      setIsLoadingInitial(true);
      // 1. Authoritative Cloud Time Sync (Anti-Clock-Tampering)
      await CentralTimeService.syncCloudTime();

      // 2. Fetch Leaderboard & Current User
      const storedUser = ApiService.getCurrentUser();
      await loadLeaderboard();

      // 3. Synchronized Global Challenge Day (Day 1..10 for everyone)
      const globalDay = CentralTimeService.getGlobalActiveChallengeDay();
      setActiveChallengeDay(globalDay);

      if (storedUser) {
        setCurrentUser(storedUser);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('registration');
      }
      setIsLoadingInitial(false);
    };

    initApp();
  }, [loadLeaderboard]);

  // Page 1 -> Page 2 (Registration or Sign-In Success)
  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Always align to current global competition day
    const globalDay = CentralTimeService.getGlobalActiveChallengeDay();
    setActiveChallengeDay(globalDay);
    setCurrentPage('dashboard');
    loadLeaderboard();
  };

  // Page 2 -> Page 3 (Quiz Start with anti-cheat validation)
  const handleStartQuiz = (day: number) => {
    const globalDay = CentralTimeService.getGlobalActiveChallengeDay();
    if (day !== globalDay) {
      // Must take today's active quiz (cannot take past missed days or future locked days)
      return;
    }
    if (currentUser?.scores[`Day${day}`]) {
      // Prevent retake if already completed
      return;
    }
    const centralTodayStr = CentralTimeService.getCentralDateString();
    if (currentUser?.lastCompletedDate === centralTodayStr) {
      // Prevent taking another quiz on the same calendar day
      return;
    }
    setActiveChallengeDay(day);
    setCurrentPage('quiz');
  };

  // Page 3 -> Page 2 (Quiz Completion with Speed Timer)
  const handleFinishQuiz = async (result: QuizSessionResult) => {
    if (!currentUser) return;

    // Submit score and time taken
    const updated = await ApiService.submitDailyScore(
      currentUser.staffId,
      result.day,
      result.totalScore,
      result.correctCount,
      result.timeTakenSeconds
    );

    // Refresh current user
    const freshUser = ApiService.getCurrentUser();
    if (freshUser) {
      setCurrentUser(freshUser);
    }

    setLeaderboard(updated.leaderboard);
    setCurrentPage('dashboard');
  };

  const handleCancelQuiz = () => {
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    ApiService.clearCurrentUser();
    setCurrentUser(null);
    setCurrentPage('registration');
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Synchronizing Central Competition Time & Roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {currentPage === 'registration' && (
        <RegistrationPage
          onRegisterSuccess={handleRegisterSuccess}
          onOpenBackendSetup={() => setIsBackendModalOpen(true)}
          isGasConnected={isGasConnected}
        />
      )}

      {currentPage === 'dashboard' && currentUser && (
        <DashboardPage
          user={currentUser}
          leaderboard={leaderboard}
          activeChallengeDay={activeChallengeDay}
          onSelectDay={(day) => setActiveChallengeDay(day)}
          onStartQuiz={handleStartQuiz}
          onSignOut={handleSignOut}
          onOpenSOPRules={() => setIsRulesModalOpen(true)}
          onRefreshData={loadLeaderboard}
          onOpenBackendSetup={() => setIsBackendModalOpen(true)}
          isGasConnected={isGasConnected}
        />
      )}

      {currentPage === 'quiz' && currentUser && (
        <QuizEnginePage
          user={currentUser}
          day={activeChallengeDay}
          onFinishQuiz={handleFinishQuiz}
          onCancelQuiz={handleCancelQuiz}
        />
      )}

      {/* SOP Rules & Multiplier Modal */}
      <SOPRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Google Sheets & Apps Script Architecture Modal */}
      <BackendSetupModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onUrlUpdated={() => {
          setIsGasConnected(Boolean(ApiService.getStoredGasUrl()));
          loadLeaderboard();
        }}
      />
    </div>
  );
}
