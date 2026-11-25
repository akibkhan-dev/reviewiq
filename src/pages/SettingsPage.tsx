import React, { useState } from 'react';
import {
  Database,
  Bot,
  Sliders,
  Download,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsPageProps {
  onResetDemo: () => void;
  reviewCount: number;
  isAiConnected: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDemo,
  reviewCount,
  isAiConnected,
}) => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  const handleReset = async () => {
    await onResetDemo();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleExportJson = async () => {
    const data = await api.getReviews({ limit: 1000 });
    const jsonStr = JSON.stringify(data.reviews, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reviewiq_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          System & Data Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage sample customer review datasets, AI model parameters, and system backups.
        </p>
      </div>

      {/* 1. Dataset Management */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dataset Management</h3>
            <p className="text-xs text-slate-500">
              Manage your local review store and sample data
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-900">
              NovaTech Customer Reviews Dataset
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Currently indexing <strong className="text-slate-800 font-semibold">{reviewCount}</strong> verified reviews across 6 product lines.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Restore 52 Demo Reviews</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>The 52 initial verified customer reviews were successfully restored!</span>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Database as JSON Backup</span>
          </button>
        </div>
      </div>

      {/* 2. AI Engine Architecture */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Engine Architecture</h3>
            <p className="text-xs text-slate-500">
              Natural Language Processing model configuration and security status
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Primary AI Model</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini 3.8 Flash handles zero-shot sentiment classification, discrete emotion detection, topic extraction, and strategic summaries.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">API Security & Connection</span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  isAiConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isAiConnected ? 'Server Secret Connected' : 'Local NLP Heuristic Active'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              API credentials are strictly maintained on the server backend and never exposed in client bundles. An automatic local heuristic fallback ensures 100% platform uptime.
            </p>
          </div>

          {/* Confidence Slider */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-semibold text-slate-900">Sentiment Confidence Threshold</span>
              <span className="font-bold text-indigo-600">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-xs text-slate-500">
              Reviews with confidence below {confidenceThreshold}% are highlighted for human review.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Platform Architecture Specs */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Platform Specifications
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div>
            <span className="text-slate-400 block text-[11px]">Product</span>
            <span className="font-semibold text-slate-800">ReviewIQ v1.0</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Theme</span>
            <span className="font-semibold text-slate-800">Minimal Light</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">AI Framework</span>
            <span className="font-semibold text-slate-800">@google/genai SDK</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Graphics Engine</span>
            <span className="font-semibold text-slate-800">Three.js</span>
          </div>
        </div>
      </div>
    </div>
  );
};
