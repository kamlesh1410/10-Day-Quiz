import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  Database,
  FileCode,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface BackendSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: () => void;
}

export const BackendSetupModal: React.FC<BackendSetupModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
}) => {
  const [gasUrl, setGasUrl] = useState<string>('');
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false });
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [codeGsContent, setCodeGsContent] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setGasUrl(ApiService.getStoredGasUrl());
      setTestStatus({ tested: false });
    }
  }, [isOpen]);

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestStatus({ tested: false });

    ApiService.setGasUrl(gasUrl);
    onUrlUpdated();

    if (!gasUrl.trim()) {
      setTestStatus({
        tested: true,
        success: true,
        message: 'Running in Local Storage Mode (Real staff register live, starting with blank roster).',
      });
      setIsTesting(false);
      return;
    }

    const res = await ApiService.pingGasBackend(gasUrl);
    setTestStatus({
      tested: true,
      success: res.success,
      message: res.message,
    });
    setIsTesting(false);
  };

  const handleCopyCode = async () => {
    try {
      // Fetch Code.gs from workspace root or static
      const res = await fetch('/Code.gs');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      // Fallback
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Google Sheets & Apps Script Connection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Step 1: Web App URL Connection */}
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>1. Connect Deployed Web App API URL</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Integration
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your deployed Google Apps Script Web App URL below (the link ending in <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">/exec</code> from <em>Deploy &rarr; Manage deployments</em>).
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={handleSaveAndTest}
                disabled={isTesting}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Save & Test Ping</span>
              </button>
            </div>

            {testStatus.tested && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {testStatus.success ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <div>
                  <span className="font-semibold block">
                    {testStatus.success ? 'Status: Online' : 'Connection Note:'}
                  </span>
                  <span>{testStatus.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Deployment Guide */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>2. How to Deploy `Code.gs` in Google Sheets (5 Minutes)</span>
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 leading-relaxed">
              <li>
                Create a new spreadsheet on{' '}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 underline"
                >
                  sheets.new
                </a>
                .
              </li>
              <li>
                Go to <strong className="text-white">Extensions</strong> &rarr;{' '}
                <strong className="text-white">Apps Script</strong>.
              </li>
              <li>
                Delete existing placeholder code and paste the contents of{' '}
                <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">Code.gs</code>.
              </li>
              <li>
                In Apps Script toolbar, select the function{' '}
                <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">
                  setupInitialSpreadsheets
                </code>{' '}
                and click <strong className="text-white">Run</strong>. This creates the clean{' '}
                <code className="text-white">User_Scores_DB</code> header row with 0 staff so real staff will be added live as they register!
              </li>
              <li>
                Click <strong className="text-white">Deploy</strong> &rarr;{' '}
                <strong className="text-white">New deployment</strong> &rarr; Select type:{' '}
                <strong className="text-white">Web app</strong>.
              </li>
              <li>
                Set <em>"Execute as: Me"</em> and{' '}
                <em>"Who has access: Anyone"</em>. Click <strong className="text-white">Deploy</strong>.
              </li>
              <li>
                Copy the Web App URL and paste it into the box above!
              </li>
            </ol>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied Code.gs to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Full `Code.gs` Script</span>
                  </>
                )}
              </button>

              <a
                href="/Code.gs"
                download="Code.gs"
                className="text-xs text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Download Code.gs file</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step 3: Google Sheets Architecture Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Spreadsheet Structure Enforced:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">
                  Sheet 1: User_Scores_DB
                </span>
                <span className="text-slate-400 text-[11px] block leading-tight">
                  Col A: Staff_ID<br />
                  Col B: Staff_Name<br />
                  Col C: Avatar_ID<br />
                  Col D: Group_Name (10 Groups)<br />
                  Col E..N: Day1_Score..Day10_Score<br />
                  Col O: Total_Points (=SUM(E2:N2))<br />
                  Col P: Last_Completed_Day
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-sky-400 block mb-1">
                  Sheet 2: GEN_QUIZ (Tabs Day1..Day10)
                </span>
                <span className="text-slate-400 text-[11px] block leading-tight">
                  Each Day tab has 10 questions:<br />
                  Col A: Question<br />
                  Col B: Option A<br />
                  Col C: Option B<br />
                  Col D: Option C<br />
                  Col E: Option D<br />
                  Col F: Correct Answer (Exact text)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
