import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Question, QuizSessionResult } from '../types';
import { getMultiplierForDay } from '../data/questionBank';
import { ApiService } from '../services/apiService';
import { Confetti } from './Confetti';
import {
  Flame,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';

interface QuizEnginePageProps {
  user: UserProfile;
  day: number;
  onFinishQuiz: (result: QuizSessionResult) => void;
  onCancelQuiz: () => void;
}

export const QuizEnginePage: React.FC<QuizEnginePageProps> = ({
  user,
  day,
  onFinishQuiz,
  onCancelQuiz,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answersHistory, setAnswersHistory] = useState<
    {
      questionId: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationPoints, setCelebrationPoints] = useState<number>(0);

  // Precision Speed Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [finalTimeSeconds, setFinalTimeSeconds] = useState<number>(0);
  const timerStartRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  const multiplierInfo = getMultiplierForDay(day);

  // Load 5 questions for this day and start speed timer
  useEffect(() => {
    let isMounted = true;
    const loadQuestions = async () => {
      setIsLoading(true);
      const list = await ApiService.getDailyQuestions(day);
      if (isMounted) {
        setQuestions(list);
        setIsLoading(false);
        // Start precision stopwatch timer once questions load
        timerStartRef.current = Date.now();
        timerIntervalRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - timerStartRef.current) / 1000));
        }, 1000);
      }
    };
    loadQuestions();
    return () => {
      isMounted = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [day]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const selectedIdx = currentQuestion.options.indexOf(option);
    const selectedLetter = letters[selectedIdx] || '';
    const rawCorrect = (currentQuestion.correctAnswer || '').trim().toLowerCase();

    // Flexible match: accepts full text ("Paris") or letter ("A" / "Option A")
    const isCorrect =
      option.trim().toLowerCase() === rawCorrect ||
      selectedLetter.toLowerCase() === rawCorrect ||
      `option ${selectedLetter.toLowerCase()}` === rawCorrect;

    const earnedForThisQuestion = isCorrect ? 100 * multiplierInfo.multiplier : 0;

    if (isCorrect) {
      setCelebrationPoints(earnedForThisQuestion);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedAnswer: option,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed all 5 questions - stop the stopwatch!
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const totalSeconds = Math.max(1, Math.floor((Date.now() - timerStartRef.current) / 1000));
      setFinalTimeSeconds(totalSeconds);
      setIsCompleted(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Format stopwatch time display
  const formatStopwatch = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate final score
  const correctCount = answersHistory.filter((a) => a.isCorrect).length;
  const baseParticipationBonus = 100;
  const baseAccuracyBonus = correctCount * 100;
  const subtotalBasePoints = baseParticipationBonus + baseAccuracyBonus;
  const finalTotalScore = subtotalBasePoints * multiplierInfo.multiplier;

  const handleCompleteAndReturn = () => {
    const result: QuizSessionResult = {
      day,
      correctCount,
      totalQuestions: questions.length,
      participationBonus: baseParticipationBonus,
      accuracyBonus: baseAccuracyBonus,
      multiplier: multiplierInfo.multiplier,
      totalScore: finalTotalScore,
      timeTakenSeconds: finalTimeSeconds,
      answers: answersHistory,
    };
    onFinishQuiz(result);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">Loading Questions for Day {day}...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to GEN_QUIZ Google Sheet tab</p>
      </div>
    );
  }

  // COMPLETION VIEW
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10">
        <Confetti active={showCelebration} />

        <div className="max-w-2xl mx-auto w-full my-auto bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          {/* Header Badge */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Day {day} Challenge Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Score verified and logged. This session is locked to prevent retakes.
            </p>
          </div>

          {/* Big Score Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-700/80 text-center relative overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Points Earned Today
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 my-2">
              +{finalTotalScore.toLocaleString()} pts
            </div>

            {/* Time Taken Tie-Breaker Highlight */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold my-1">
              <Timer className="w-3.5 h-3.5" />
              <span>Completion Time: {finalTimeSeconds}s ({formatStopwatch(finalTimeSeconds)})</span>
            </div>

            <div className="text-xs text-emerald-300 font-medium mt-1">
              Contributed to <strong>{user.groupName}</strong> Aggregate Standing!
            </div>
          </div>

          {/* Formula Breakdown Details */}
          <div className="space-y-2.5 text-xs sm:text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-700/60">
            <div className="flex justify-between items-center text-slate-300">
              <span>1. Base Participation Baseline (Daily Show-up)</span>
              <span className="font-mono font-semibold text-white">+100 pts</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>
                2. Base Accuracy Bonus ({correctCount} of {questions.length} correct × 100)
              </span>
              <span className="font-mono font-semibold text-white">+{baseAccuracyBonus} pts</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
              <span>Subtotal Base Points</span>
              <span className="font-mono font-bold text-white">{subtotalBasePoints} pts</span>
            </div>

            <div className="flex justify-between items-center text-amber-400 pt-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Active Multiplier (Day {day} · Phase {multiplierInfo.phase})
              </span>
              <span className="font-mono text-base font-black">× {multiplierInfo.multiplier}</span>
            </div>

            <div className="flex justify-between items-center text-sky-400 pt-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Tie-Breaker Time Logged
              </span>
              <span className="font-mono text-xs">{finalTimeSeconds} seconds</span>
            </div>

            <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-slate-700 font-bold text-sm sm:text-base">
              <span>Final Credited Daily Score</span>
              <span className="font-mono font-extrabold">{finalTotalScore.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Action Button: Return to Dashboard */}
          <button
            onClick={handleCompleteAndReturn}
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Return to Dashboard & Update Standings</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE QUESTION VIEW WITH LIVE SPEED TIMER
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <Confetti active={showCelebration} />

      {/* Top Header with Live Speed Timer */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
              Day {day} of 10 Challenge
            </span>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${multiplierInfo.tagColor}`}>
              <Flame className="w-3.5 h-3.5" />
              {multiplierInfo.multiplier}x Multiplier Active
            </span>
          </div>

          {/* Live Speed Stopwatch */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
              <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-left font-mono">
                <span className="text-xs text-slate-400 block text-[10px] leading-none">Speed Timer</span>
                <span className="text-sm font-extrabold text-amber-300">
                  {formatStopwatch(elapsedSeconds)}
                </span>
              </div>
            </div>

            <button
              onClick={onCancelQuiz}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Question Arena */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur relative">
          {/* Question Counter Progress */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-emerald-400 font-mono">
                {correctCount} correct so far
              </span>
            </div>

            {/* Stepper dots */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < currentIndex
                      ? answersHistory[i]?.isCorrect
                        ? 'bg-emerald-400'
                        : 'bg-rose-500'
                      : i === currentIndex
                      ? 'bg-amber-400 scale-125'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="mb-6 pt-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-snug tracking-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options Grid (A, B, C, D) */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = letters[idx] || String(idx + 1);
              const isSelected = selectedOption === option;
              const rawCorrect = (currentQuestion.correctAnswer || '').trim().toLowerCase();
              const isCorrectAnswer =
                option.trim().toLowerCase() === rawCorrect ||
                letter.toLowerCase() === rawCorrect ||
                `option ${letter.toLowerCase()}` === rawCorrect;

              let buttonStyle = 'bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-200';
              let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/10';
                  badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/50';
                  badgeStyle = 'bg-rose-500 text-white font-bold border-rose-500';
                } else {
                  buttonStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-4 font-medium text-sm sm:text-base ${buttonStyle} ${
                    !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${badgeStyle}`}
                    >
                      {letter}
                    </span>
                    <span>{option}</span>
                  </div>

                  {/* Feedback Icons */}
                  {isAnswered && (
                    <div className="shrink-0">
                      {isCorrectAnswer && (
                        <CheckCircle className="w-5 h-5 text-emerald-400 animate-in zoom-in" />
                      )}
                      {isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-rose-400 animate-in zoom-in" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Banner upon answering */}
          {isAnswered && (
            <div className="mt-6 pt-5 border-t border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
              <div>
                {selectedOption?.trim().toLowerCase() ===
                currentQuestion.correctAnswer.trim().toLowerCase() ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Congratulations! +{celebrationPoints} points earned!</span>
                  </div>
                ) : (
                  <div className="text-xs text-rose-300">
                    <span className="font-semibold block">Incorrect.</span>
                    <span className="text-slate-400">
                      The correct answer is:{' '}
                      <strong className="text-emerald-300">{currentQuestion.correctAnswer}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Next Question CTA */}
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'Next Question' : 'Finish & Lock Score'}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="px-6 py-3 border-t border-slate-800 text-center text-xs text-slate-500">
        100 pts Participation + 100 pts per correct answer × {multiplierInfo.multiplier}x Multiplier · Speed Timer Active for Tie-Breaking
      </footer>
    </div>
  );
};
