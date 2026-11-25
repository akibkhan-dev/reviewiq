import React, { useState } from 'react';
import { X, Play, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { NavTab } from './Sidebar';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Review Ingestion & Processing',
      badge: 'Step 1 of 4',
      description:
        'Customer feedback enters seamlessly via single review submission or bulk CSV file upload. Reviews are validated and prepared for AI analysis.',
      metric: '< 150ms Processing Speed',
      status: 'Active',
    },
    {
      title: 'Sentiment & Emotion Classification',
      badge: 'Step 2 of 4',
      description:
        'Google Gemini 3.8 Flash classifies sentiment into Positive, Neutral, or Negative while extracting granular emotional undertones such as satisfaction or frustration.',
      metric: 'High-Precision Classification',
      status: 'Calibrated',
    },
    {
      title: 'Topic & Theme Extraction',
      badge: 'Step 3 of 4',
      description:
        'Natural Language Processing categorizes feedback into recurring themes: Battery Performance, Product Quality, Customer Support, and Pricing.',
      metric: 'Automated Clustering',
      status: 'Ready',
    },
    {
      title: 'Executive Insights & Actionable Decisions',
      badge: 'Step 4 of 4',
      description:
        'ReviewIQ automatically generates executive summaries, key customer praise and complaint drivers, and prioritized business recommendations.',
      metric: 'Data-Driven Action Plan',
      status: 'Complete',
    },
  ];

  const current = tourSteps[activeStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ReviewIQ Platform Walkthrough
              </h3>
              <p className="text-xs text-slate-500">
                Interactive overview of core AI analytics features
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cinematic Step Viewer */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Step Progress Stepper */}
          <div className="grid grid-cols-4 gap-2">
            {tourSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeStep === idx
                    ? 'bg-indigo-600'
                    : activeStep > idx
                    ? 'bg-slate-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Current Step Card */}
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {current.badge}
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {current.status}
              </span>
            </div>

            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              {current.title}
            </h4>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {current.description}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200/80 text-xs">
              <span className="text-slate-500">Feature Highlight:</span>
              <span className="font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                {current.metric}
              </span>
            </div>
          </div>

          {/* Step Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
            >
              ← Previous Step
            </button>

            {activeStep < tourSteps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onNavigate('dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
