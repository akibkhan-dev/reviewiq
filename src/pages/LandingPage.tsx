import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquareCode,
  BarChart3,
  Database,
  CheckCircle2,
  Zap,
  Layers,
  Star,
  Quote,
} from 'lucide-react';
import { AIVoiceAssistantHero } from '../components/AIVoiceAssistantHero';
import { ReviewIQNeuralCore } from '../components/ReviewIQNeuralCore';
import { NavTab } from '../components/Sidebar';
import { Review } from '../types';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
  onResetDemo: () => void;
  reviewCount: number;
  onOpenDemoVideo?: () => void;
  onSelectReview?: (review: Review) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onResetDemo,
  reviewCount,
  onOpenDemoVideo,
  onSelectReview,
}) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Large Premium Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-6 sm:px-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#635BFF]" />
              <span>AI-Powered Review &amp; Sentiment Analytics</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Turn Customer Feedback Into{' '}
              <span className="text-[#635BFF]">Better Decisions.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              ReviewIQ automatically analyzes thousands of customer reviews, detects subtle sentiment shifts, extracts recurring complaints and praise, and delivers actionable business insights.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => onNavigate('analyzer')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold border border-slate-200 transition-all hover:border-slate-300 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-[#635BFF]" />
                <span>Analyze Reviews</span>
              </button>
            </div>

            {/* Quick Demo Info */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Database className="w-4 h-4 text-[#F97316]" />
                <span>Loaded with {reviewCount} verified NovaTech customer reviews</span>
              </div>
              <span>•</span>
              <button
                onClick={onResetDemo}
                className="text-[#635BFF] hover:underline font-semibold cursor-pointer"
              >
                Reset Demo
              </button>
            </div>
          </div>

          {/* Right Hero Visual Column (Interactive Voice Assistant) */}
          <div className="lg:col-span-6">
            <AIVoiceAssistantHero onSelectReview={onSelectReview} />
          </div>
        </div>
      </section>

      {/* AI Sentiment Engine – Neural Intelligence Core Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <ReviewIQNeuralCore
          onNavigate={onNavigate}
          onSelectReview={onSelectReview}
          reviewCount={reviewCount}
        />
      </section>

      {/* Section A: Platform Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#635BFF]">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Understand Customer Voices
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate manual spreadsheet analysis. ReviewIQ automatically structures customer feedback into clear sentiment classifications and strategic recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="minimal-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Intelligent Sentiment Detection
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Multi-dimensional classification of Positive, Neutral, and Negative reviews with accurate confidence scores and emotion detection.
            </p>
          </div>

          <div className="minimal-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#635BFF] flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI-Powered Review Summaries
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Google Gemini distill hundreds of customer opinions into executive briefings, identifying recurring complaints and top praise points.
            </p>
          </div>

          <div className="minimal-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Automatic Topic Extraction
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Automatically identifies discussions about battery life, pricing, build quality, delivery speed, customer service, and usability.
            </p>
          </div>

          <div className="minimal-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Analytics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Clean sentiment distribution donuts, time-series trends, rating breakdowns, and searchable review explorers with multi-criteria filters.
            </p>
          </div>
        </div>
      </section>

      {/* Section B: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200/80">
          <div className="max-w-xl mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">
              Simple 4-Step Process
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              From Raw Feedback to Clear Direction
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              See how ReviewIQ transforms fragmented text into actionable insights in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-[#635BFF] bg-indigo-50 px-2.5 py-1 rounded-md">
                Step 1
              </span>
              <h4 className="text-sm font-bold text-slate-900">Upload or Enter Reviews</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste single customer reviews or bulk upload CSV files with column validation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-[#635BFF] bg-indigo-50 px-2.5 py-1 rounded-md">
                Step 2
              </span>
              <h4 className="text-sm font-bold text-slate-900">AI Analyses the Text</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini NLP models evaluate tone, context, nuances, and underlying customer emotions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-[#635BFF] bg-indigo-50 px-2.5 py-1 rounded-md">
                Step 3
              </span>
              <h4 className="text-sm font-bold text-slate-900">Sentiment &amp; Topics Identified</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Classifies sentiment as Positive, Neutral, or Negative, tags topics, and extracts key phrases.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-[#635BFF] bg-indigo-50 px-2.5 py-1 rounded-md">
                Step 4
              </span>
              <h4 className="text-sm font-bold text-slate-900">Insights are Generated</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive charts and prioritized recommendations help you make data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Verified Demo Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="minimal-card p-6 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              98.4%
            </span>
            <p className="text-xs font-semibold text-slate-500">Sentiment Precision</p>
            <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
              Validated on Tech Reviews
            </span>
          </div>

          <div className="minimal-card p-6 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#635BFF] tracking-tight">
              142ms
            </span>
            <p className="text-xs font-semibold text-slate-500">Average Processing Time</p>
            <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1">
              Fast Response Latency
            </span>
          </div>

          <div className="minimal-card p-6 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              8 Topics
            </span>
            <p className="text-xs font-semibold text-slate-500">Automated Clusters</p>
            <span className="inline-block text-[10px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full mt-1">
              Zero-Shot Theme Mapping
            </span>
          </div>

          <div className="minimal-card p-6 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">
              +22%
            </span>
            <p className="text-xs font-semibold text-slate-500">CSAT Uplift Opportunity</p>
            <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
              Through Proactive Triage
            </span>
          </div>
        </div>
      </section>

      {/* Section D: Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-14 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="max-w-xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to transform your customer feedback?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore the live NovaTech product analytics dashboard or test the AI Review Analyzer with custom text.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onNavigate('analyzer')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              Analyze a Review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
