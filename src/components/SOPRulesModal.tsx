import React from 'react';
import { X, Flame, Award, Users, BookOpen, Clock, ShieldCheck } from 'lucide-react';

interface SOPRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOPRulesModal: React.FC<SOPRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              10-Day Challenge Guidelines & Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300">
          {/* Program Flow & Schedule */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Program Structure: 50 Staff Members, 10 Groups, 1 Quiz a Day</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              50 operational staff members are organized equally into 10 groups of 5 members.
              The program runs across 10 days of continuous learning, building standard operating excellence and keeping knowledge top-of-mind on every shift.
            </p>
          </div>

          {/* Daily 3-Step Routine */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Daily Routine (Under 10 Minutes per Shift)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">01. Open the Link</span>
                <p className="text-xs text-slate-400">
                  Access the daily quiz challenge app on mobile or desktop before shift end (window closes at 23:59).
                </p>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">02. Answer 5 Questions</span>
                <p className="text-xs text-slate-400">
                  Complete today's 5 multiple-choice questions with speed and precision.
                </p>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">03. Take the Quiz</span>
                <p className="text-xs text-slate-400">
                  Complete 5 targeted multiple-choice checks to log your individual and group score.
                </p>
              </div>
            </div>
          </div>

          {/* Scoring Formula */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Scoring Formula: 100 for Showing Up + 100 per Right Answer</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xl font-extrabold text-white font-mono block">100 pts</span>
                <span className="text-[11px] text-slate-400">Participation Baseline (awarded automatically)</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xl font-extrabold text-emerald-400 font-mono block">5 × 100 pts</span>
                <span className="text-[11px] text-slate-400">Accuracy Bonus (up to 500 base points)</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xl font-extrabold text-amber-400 font-mono block">600 pts</span>
                <span className="text-[11px] text-slate-400">Base Max Daily (before multipliers)</span>
              </div>
            </div>
          </div>

          {/* Multiplier Phases */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Race Accelerators: 3 Multiplier Phases</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-xs font-bold text-slate-300 block">Phase 1 · Days 1-4</span>
                <span className="text-lg font-black font-mono text-white block my-1">1× Standard</span>
                <p className="text-[11px] text-slate-400">
                  Up to 600 pts/staff daily.<br />
                  3,000 max group surge daily.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-amber-500/40">
                <span className="text-xs font-bold text-amber-400 block">Phase 2 · Days 5-7</span>
                <span className="text-lg font-black font-mono text-amber-300 block my-1">2× Double Points</span>
                <p className="text-[11px] text-slate-400">
                  Up to 1,200 pts/staff daily.<br />
                  6,000 max group surge daily.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-emerald-500/40">
                <span className="text-xs font-bold text-emerald-400 block">Phase 3 · Days 8-10</span>
                <span className="text-lg font-black font-mono text-emerald-300 block my-1">4× Super Multiplier</span>
                <p className="text-[11px] text-slate-400">
                  Up to 2,400 pts/staff daily.<br />
                  12,000 max group surge daily.
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
              Note: Because of the 4× booster window in Days 8-10, <strong>no team is out of contention</strong> until Day 10 finishes!
            </p>
          </div>

          {/* Group Dynamics */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Group Dynamics: Teams of 5 Win Only When Everyone Plays</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Group standing combines all 5 member points. Full participation lifts the entire group:
              a 100-point show-up baseline across 5 staff members beats spotty individual brilliance.
              Individual and Group podium prizes will be awarded at the Day 10 operations debrief!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
          >
            Got it, Let's Compete!
          </button>
        </div>
      </div>
    </div>
  );
};
