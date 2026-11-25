import React, { useState, useEffect } from 'react';
import {
  FileText,
  PieChart,
  Layers,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Download,
  Printer,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { Review, OverviewMetrics, AIInsightsReport, QualityAuditReport } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';

type ReportType =
  | 'executive-summary'
  | 'sentiment-analysis'
  | 'product-performance'
  | 'customer-complaints'
  | 'ai-insights'
  | 'review-quality';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [loading, setLoading] = useState(false);

  // Data states for report generation
  const [reviews, setReviews] = useState<Review[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [insights, setInsights] = useState<AIInsightsReport | null>(null);
  const [qualityAudit, setQualityAudit] = useState<QualityAuditReport | null>(null);

  const reportCards = [
    {
      id: 'executive-summary' as ReportType,
      title: '1. Executive Summary',
      description: 'Comprehensive high-level synthesis of customer satisfaction, key metrics, and strategic overview.',
      icon: FileText,
      badge: 'Board-Level',
    },
    {
      id: 'sentiment-analysis' as ReportType,
      title: '2. Sentiment Analysis Report',
      description: 'Detailed valence breakdown, approval ratios, positive drivers, and negative risk factors.',
      icon: PieChart,
      badge: 'Analytics',
    },
    {
      id: 'product-performance' as ReportType,
      title: '3. Product Performance Report',
      description: 'Hardware model comparison, review volumes, star ratings, top strengths, and weaknesses.',
      icon: Layers,
      badge: 'Product QA',
    },
    {
      id: 'customer-complaints' as ReportType,
      title: '4. Customer Complaints Report',
      description: 'Prioritized audit of defect reports, friction points, affected SKUs, and recommended remedies.',
      icon: AlertTriangle,
      badge: 'Support & Ops',
    },
    {
      id: 'ai-insights' as ReportType,
      title: '5. AI Insights Report',
      description: 'Forward-looking customer trends, market opportunities, and prioritized business recommendations.',
      icon: Sparkles,
      badge: 'Strategic',
    },
    {
      id: 'review-quality' as ReportType,
      title: '6. Review Quality Report',
      description: 'Data hygiene assessment: flagged records, duplicate detection, and missing metadata audit.',
      icon: ShieldCheck,
      badge: 'Data Audit',
    },
  ];

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [revData, ovData, insData, qData] = await Promise.all([
        api.getReviews({ limit: 100 }),
        api.getOverviewAnalytics(dateRange, selectedProduct),
        api.generateInsights(),
        api.getDataQualityAudit(),
      ]);
      setReviews(revData.reviews);
      setOverview(ovData.metrics);
      setInsights(insData);
      setQualityAudit(qData);
    } catch (e) {
      console.error('Error generating report data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport) {
      loadReportData();
    }
  }, [selectedReport, dateRange, selectedProduct, selectedSentiment]);

  const filteredReviews = reviews.filter((r) => {
    if (selectedProduct !== 'All' && r.productName !== selectedProduct) return false;
    if (selectedSentiment !== 'All' && r.sentiment !== selectedSentiment) return false;
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Review ID,Customer Name,Product,Rating,Sentiment,Emotion,Topics,Feedback,Date'];
    const rows = filteredReviews.map(
      (r) =>
        `"${r.id}","${r.customerName}","${r.productName}",${r.rating},"${r.sentiment}","${r.emotion}","${r.keyTopics.join(';')}","${r.reviewText.replace(/"/g, '""')}","${r.date}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reviewiq_${selectedReport}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
            <FileText className="w-3 h-3 text-[#635BFF]" />
            Enterprise Reporting
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Report Generation Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select a specialized report format, configure parameters, and export evidence-grounded reports.
          </p>
        </div>

        {selectedReport && (
          <button
            onClick={() => setSelectedReport(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Select Different Report</span>
          </button>
        )}
      </div>

      {/* VIEW 1: REPORT SELECTOR CARDS (When no report is selected) */}
      {!selectedReport && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reportCards.map((rc) => {
              const Icon = rc.icon;
              return (
                <div
                  key={rc.id}
                  onClick={() => setSelectedReport(rc.id)}
                  className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {rc.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {rc.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {rc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                    <span>Configure Report</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: REPORT CONFIGURATION & PREVIEW */}
      {selectedReport && (
        <div className="space-y-6 animate-in fade-in">
          {/* Configuration Filter Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Report Parameters:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Time Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="all">All Available Historical Data</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Target Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 truncate"
                >
                  <option value="All">All Hardware Products</option>
                  {NOVA_TECH_PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Sentiment Cohort
                </label>
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="All">All Sentiments</option>
                  <option value="Positive">Positive Only</option>
                  <option value="Neutral">Neutral Only</option>
                  <option value="Negative">Negative Only</option>
                </select>
              </div>
            </div>

            {/* Export Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Audited Sample: <strong>{filteredReviews.length} records</strong> matching criteria
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE REPORT PREVIEW DOCUMENT */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-6 max-w-4xl mx-auto">
            {/* Report Document Header */}
            <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    RIQ
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    ReviewIQ Enterprise Intelligence
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {reportCards.find((r) => r.id === selectedReport)?.title.replace(/^\d+\.\s*/, '')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated on {new Date().toLocaleDateString()} | Filter: {selectedProduct} ({dateRange})
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <span className="font-bold text-slate-800 block">Confidential Internal</span>
                <span>NovaTech Hardware Corp</span>
              </div>
            </div>

            {/* Content Based on Report Type */}
            {selectedReport === 'executive-summary' && (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 text-sm block mb-1">Executive Briefing Memo:</strong>
                  <p>{insights?.executiveSummary || 'Compiling voice of customer synthesis...'}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-lg font-bold text-slate-900 block">{filteredReviews.length}</span>
                    <span className="text-[11px] text-slate-500">Reviews Analyzed</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <span className="text-lg font-bold text-emerald-700 block">
                      {filteredReviews.length > 0 ? Math.round((filteredReviews.filter(r => r.sentiment === 'Positive').length / filteredReviews.length) * 100) : 0}%
                    </span>
                    <span className="text-[11px] text-emerald-600">Positive Rate</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <span className="text-lg font-bold text-amber-700 block">
                      {filteredReviews.length > 0 ? (filteredReviews.reduce((a, b) => a + b.rating, 0) / filteredReviews.length).toFixed(1) : 0}★
                    </span>
                    <span className="text-[11px] text-amber-600">Average Rating</span>
                  </div>
                </div>

                <div>
                  <strong className="text-slate-900 block mb-2">Key Strategic Recommendations:</strong>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    {(insights?.businessRecommendations || []).map((b, i) => (
                      <li key={i}>
                        <strong>[{b.priority} Priority]</strong> {b.action} - <em>Impact: {b.impact}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedReport === 'customer-complaints' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  Audit of recurring product friction, hardware defects, and operational SLA delays across {filteredReviews.length} analyzed records.
                </p>

                <div className="space-y-3">
                  {(insights?.priorityIssues || []).map((issue, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-200/70 space-y-1">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span>{idx + 1}. {issue.issue}</span>
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] uppercase">{issue.severity}</span>
                      </div>
                      <p className="text-slate-600"><strong>Product:</strong> {issue.affectedProduct}</p>
                      <p className="text-slate-700"><strong>Remedy:</strong> {issue.suggestedFix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport === 'review-quality' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-lg font-bold text-slate-900 block">{qualityAudit?.totalAudited || 0}</span>
                    <span className="text-[11px] text-slate-500">Total Audited</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <span className="text-lg font-bold text-emerald-700 block">{qualityAudit?.cleanRecordsCount || 0}</span>
                    <span className="text-[11px] text-emerald-600">Clean Records</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <span className="text-lg font-bold text-amber-700 block">{qualityAudit?.duplicateCount || 0}</span>
                    <span className="text-[11px] text-amber-600">Exact Duplicates</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg">
                    <span className="text-lg font-bold text-rose-700 block">{qualityAudit?.suspiciousCount || 0}</span>
                    <span className="text-[11px] text-rose-600">Flagged Patterns</span>
                  </div>
                </div>

                <div>
                  <strong className="text-slate-900 block mb-2">Flagged Items Requiring Manual Review:</strong>
                  <div className="space-y-2">
                    {(qualityAudit?.flaggedIssues || []).slice(0, 5).map((f, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{f.customerName} - {f.productName}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{f.issueType}</span>
                        </div>
                        <p className="text-slate-600 italic">"{f.reviewText}"</p>
                        <p className="text-slate-400 text-[11px]">Audit Reason: {f.flagReason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sample Table of Filtered Reviews */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Representative Sample Records ({filteredReviews.slice(0, 5).length} of {filteredReviews.length}):
              </strong>
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5">Rating</th>
                      <th className="p-2.5">Sentiment</th>
                      <th className="p-2.5">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReviews.slice(0, 5).map((r) => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-semibold text-slate-900">{r.customerName}</td>
                        <td className="p-2.5 text-slate-600">{r.productName}</td>
                        <td className="p-2.5 text-amber-500 font-bold">{r.rating}★</td>
                        <td className="p-2.5">{r.sentiment}</td>
                        <td className="p-2.5 text-slate-600 max-w-xs truncate italic">"{r.reviewText}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
