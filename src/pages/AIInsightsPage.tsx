import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  ShieldAlert,
  Sparkle,
} from 'lucide-react';
import { api } from '../services/api';
import { AIInsightsReport } from '../types';

export const AIInsightsPage: React.FC = () => {
  const [report, setReport] = useState<AIInsightsReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await api.generateInsights();
      setReport(data);
    } catch (e) {
      console.error('Failed to generate insights', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleExportReport = () => {
    if (!report) return;
    const content = `# ReviewIQ Strategic Customer Intelligence Report
Generated: ${new Date(report.generatedAt).toLocaleString()}
Model: ${report.isLiveAi ? 'Google Gemini 3.8 Flash' : 'NLP Heuristic Engine'}
Reviews Analyzed: ${report.reviewCountAnalyzed}

## Executive Summary
${report.executiveSummary}

## What Customers Appreciate Most (Positive Drivers)
${report.positiveInsights.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Critical Customer Pain Points (Negative Drivers)
${report.negativeInsights.map((n, i) => `${i + 1}. ${n}`).join('\n')}

## Emerging Market & Product Trends
${report.emergingTrends.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Prioritized Business Recommendations
${report.businessRecommendations
  .map(
    (b, i) =>
      `### ${i + 1}. [${b.priority} Priority] ${b.action}\n- Impact: ${b.impact}\n- Department: ${b.category}`
  )
  .join('\n\n')}

## High-Urgency Priority Issues
${report.priorityIssues
  .map(
    (p, i) =>
      `### Issue #${i + 1}: ${p.issue}\n- Severity: ${p.severity}\n- Occurrences: ${p.occurrences}\n- Affected: ${p.affectedProduct}\n- Fix: ${p.suggestedFix}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reviewiq_executive_memo_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Sparkle className="w-3 h-3 text-[#635BFF]" />
            AI Executive Synthesis
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Strategic AI Insights & Executive Memo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data-grounded qualitative analysis and strategic roadmaps synthesized from customer feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportReport}
            disabled={!report}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold tracking-wide shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Refresh Insights'}</span>
          </button>
        </div>
      </div>

      {/* AI Processing Meta Badge */}
      {report && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-900">
              {report.isLiveAi ? 'Google Gemini 3.8 Flash' : 'NLP Heuristic Engine'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Analyzed {report.reviewCountAnalyzed} customer reviews
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Generated {new Date(report.generatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* A. Executive Summary Card */}
      <div className="p-7 sm:p-8 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Executive Summary Memorandum</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          State of Voice of Customer & Brand Health
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed max-w-4xl">
          {report ? report.executiveSummary : 'Generating customer opinion synthesis...'}
        </p>
      </div>

      {/* B & C: What Customers Appreciate Most vs Critical Pain Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B. Positive Insights */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Organic Strengths
              </span>
              <h4 className="text-sm font-bold text-slate-900">What Customers Appreciate Most</h4>
            </div>
          </div>

          <div className="space-y-3">
            {report?.positiveInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* C. Negative Insights */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                Friction Points
              </span>
              <h4 className="text-sm font-bold text-slate-900">What Customers Complain About Most</h4>
            </div>
          </div>

          <div className="space-y-3">
            {report?.negativeInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* D. Emerging Market & Product Trends */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
              Market Trends
            </span>
            <h4 className="text-sm font-bold text-slate-900">Emerging Customer Expectations & Trends</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report?.emergingTrends.map((trend, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Trend {idx + 1}</span>
                <span className="bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                  Growing
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* E. Prioritized Business Recommendations */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
              Action Plan
            </span>
            <h4 className="text-sm font-bold text-slate-900">Prioritized Business Recommendations</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.businessRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                    rec.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : rec.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {rec.priority} Priority
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {rec.category}
                </span>
              </div>

              <h5 className="text-xs font-bold text-slate-900 leading-snug">{rec.action}</h5>

              <p className="text-xs text-emerald-800 font-medium bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                <strong>Projected Impact:</strong> {rec.impact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* F. Priority Issues Requiring Urgent Resolution */}
      <div className="p-6 sm:p-7 rounded-xl bg-rose-50/40 border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
          <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Urgent Attention Required
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Critical Defects & Churn Drivers
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          {report?.priorityIssues.map((issue, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white border border-rose-200 shadow-xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{issue.issue}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {issue.severity} Severity
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {issue.occurrences} mentions
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Affected Product:</strong> {issue.affectedProduct}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900">Recommended Remedy:</strong> {issue.suggestedFix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
