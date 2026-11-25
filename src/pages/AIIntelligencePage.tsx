import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Download,
  PlusCircle,
  Quote,
  ShieldAlert,
  Bot,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { AIInsightsReport, Review, ActionItem } from '../types';
import { NavTab } from '../components/Sidebar';

interface AIIntelligencePageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectReview: (review: Review) => void;
  onActionCreated?: (action: ActionItem) => void;
}

type IntelligenceSection = 'complaints' | 'praise' | 'emerging' | 'recommendations' | 'emotions';

export const AIIntelligencePage: React.FC<AIIntelligencePageProps> = ({
  onNavigate,
  onSelectReview,
  onActionCreated,
}) => {
  const [activeSection, setActiveSection] = useState<IntelligenceSection>('complaints');
  const [report, setReport] = useState<AIInsightsReport | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});
  const [convertedActions, setConvertedActions] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [insights, reviewsData] = await Promise.all([
        api.generateInsights(),
        api.getReviews({ limit: 100 }),
      ]);
      setReport(insights);
      setAllReviews(reviewsData.reviews);
    } catch (e) {
      console.error('Failed to load AI Intelligence:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleEvidence = (key: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConvertToTask = async (rec: any, index: number) => {
    const key = `rec-${index}`;
    try {
      const action = await api.createAction({
        title: rec.action.slice(0, 70),
        description: `Generated from AI Intelligence Recommendation: ${rec.action}. Impact: ${rec.impact}`,
        affectedProduct: rec.affectedProduct || 'NovaTech Products',
        supportingEvidence: rec.evidenceQuotes || [],
        suggestedAction: rec.action,
        department: rec.category === 'Customer Experience' ? 'Customer Support' : 'Engineering',
        priority: rec.priority || 'Medium',
        status: 'Open',
      });
      setConvertedActions((prev) => ({ ...prev, [key]: true }));
      if (onActionCreated) onActionCreated(action);
    } catch (e) {
      console.error('Failed to convert to action:', e);
    }
  };

  // Helper to retrieve actual supporting customer reviews for an issue/topic
  const getSupportingReviews = (keywords: string[]): Review[] => {
    return allReviews.filter((r) => {
      const text = r.reviewText.toLowerCase();
      return keywords.some((k) => text.includes(k.toLowerCase()) || r.keyTopics.some((t) => t.toLowerCase().includes(k.toLowerCase())));
    }).slice(0, 3);
  };

  // Emotion Intelligence Aggregation
  const emotionBuckets = [
    { emotion: 'Joy / Delight', count: allReviews.filter((r) => r.emotion === 'joy' || r.emotion === 'delight').length, color: '#16A34A' },
    { emotion: 'Satisfaction', count: allReviews.filter((r) => r.emotion === 'satisfaction').length, color: '#059669' },
    { emotion: 'Neutrality', count: allReviews.filter((r) => r.emotion === 'neutrality' || r.emotion === 'mixed satisfaction').length, color: '#D97706' },
    { emotion: 'Frustration', count: allReviews.filter((r) => r.emotion === 'frustration').length, color: '#DC2626' },
    { emotion: 'Disappointment', count: allReviews.filter((r) => r.emotion === 'disappointment' || r.emotion === 'anger').length, color: '#991B1B' },
  ];

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#635BFF]" />
            Evidence-Grounded Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Intelligence Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Voice of customer synthesis, evidence-backed complaints, positive drivers, and actionable recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('actions')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span>Action Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs (A - E) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'complaints', label: 'Customer Complaints', icon: AlertTriangle },
          { id: 'praise', label: 'Customer Praise', icon: CheckCircle2 },
          { id: 'emerging', label: 'Emerging Issues', icon: Flame },
          { id: 'recommendations', label: 'AI Business Recommendations', icon: Lightbulb },
          { id: 'emotions', label: 'Emotion Intelligence', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as IntelligenceSection)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION A: CUSTOMER COMPLAINTS */}
      {activeSection === 'complaints' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs text-rose-900">
            <strong>Critical Friction Points:</strong> The following issues were identified with highest frequency and negative valence. Click <em>View Evidence</em> on any card to inspect supporting customer reviews.
          </div>

          <div className="space-y-4">
            {(report?.priorityIssues || []).map((issue, idx) => {
              const isExpanded = expandedEvidence[`complaint-${idx}`];
              const evidence = getSupportingReviews([issue.affectedProduct, issue.issue.split(' ')[0], 'hinge', 'support', 'battery', 'rattle']);

              return (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            issue.severity === 'High'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {issue.severity} Priority
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {issue.occurrences} Recorded Mentions
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{issue.issue}</h3>
                      <p className="text-xs text-slate-600">
                        <strong>Affected Product:</strong> {issue.affectedProduct}
                      </p>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                        <strong>Suggested Fix:</strong> {issue.suggestedFix}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleEvidence(`complaint-${idx}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shrink-0"
                    >
                      <span>{isExpanded ? 'Hide Evidence' : 'View Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expandable Supporting Reviews Evidence */}
                  {isExpanded && (
                    <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-2.5 animate-in fade-in">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Supporting Customer Review Evidence ({evidence.length} Quotes)
                      </span>
                      {evidence.map((rev) => (
                        <div
                          key={rev.id}
                          onClick={() => onSelectReview(rev)}
                          className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{rev.customerName}</span>
                            <span className="text-amber-500 font-semibold">{rev.rating} ★</span>
                          </div>
                          <p className="text-slate-600 italic">"{rev.reviewText}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION B: CUSTOMER PRAISE */}
      {activeSection === 'praise' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
            <strong>Key Organic Strengths:</strong> Features and product attributes with highest customer delight and word-of-mouth referral velocity.
          </div>

          <div className="space-y-4">
            {(report?.positiveInsights || []).map((praise, idx) => {
              const isExpanded = expandedEvidence[`praise-${idx}`];
              const evidence = getSupportingReviews(['noise cancellation', 'battery', 'charging', 'display', 'packaging', 'stunning']);

              return (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Praise Driver #{idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">{praise}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleEvidence(`praise-${idx}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shrink-0"
                    >
                      <span>{isExpanded ? 'Hide Evidence' : 'View Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-2.5 animate-in fade-in">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Supporting Customer Testimonials
                      </span>
                      {evidence.map((rev) => (
                        <div
                          key={rev.id}
                          onClick={() => onSelectReview(rev)}
                          className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{rev.customerName} ({rev.productName})</span>
                            <span className="text-amber-500 font-semibold">{rev.rating} ★</span>
                          </div>
                          <p className="text-slate-600 italic">"{rev.reviewText}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION C: EMERGING ISSUES */}
      {activeSection === 'emerging' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900">
            <strong>Emerging Trends & Signals:</strong> Early detection of accelerating complaint topics or newly appearing customer behavioral patterns.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(report?.emergingTrends || []).map((trend, idx) => {
              const isExpanded = expandedEvidence[`trend-${idx}`];
              const evidence = getSupportingReviews(['linux', 'packaging', 'privacy', 'companion', 'cloud']);

              return (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-700 mb-1">
                      <span>Trend Vector #{idx + 1}</span>
                      <span className="bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">Growing</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{trend}</p>
                  </div>

                  <div>
                    <button
                      onClick={() => toggleEvidence(`trend-${idx}`)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 pt-2 border-t border-slate-100 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Evidence' : 'View Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="pt-3 space-y-2 text-xs animate-in fade-in">
                        {evidence.slice(0, 2).map((rev) => (
                          <div key={rev.id} className="p-2.5 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-200">
                            "{rev.reviewText.slice(0, 110)}..."
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION D: AI BUSINESS RECOMMENDATIONS */}
      {activeSection === 'recommendations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl text-xs text-indigo-900">
            <strong>Data-Grounded Business Action Plan:</strong> Initiatives prioritized by customer churn risk and projected CSAT uplift. Click <em>Convert to Action Item</em> to track in Smart Action Center.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report?.businessRecommendations || []).map((rec, idx) => {
              const key = `rec-${idx}`;
              const isConverted = convertedActions[key];
              const isExpanded = expandedEvidence[key];
              const evidence = getSupportingReviews([rec.category, 'support', 'hinge', 'care', 'firmware']);

              return (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
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
                      <span className="text-xs text-slate-400 font-medium">{rec.category}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{rec.action}</h4>
                    <p className="text-xs text-emerald-800 font-medium bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      <strong>Projected Impact:</strong> {rec.impact}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleEvidence(key)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Evidence' : 'View Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isConverted ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tracked in Actions
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConvertToTask(rec, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Track as Action</span>
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="pt-2 space-y-2 text-xs animate-in fade-in">
                      {evidence.map((rev) => (
                        <div key={rev.id} className="p-2.5 bg-slate-50 rounded-lg text-slate-600 italic border border-slate-200">
                          "{rev.reviewText}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION E: EMOTION INTELLIGENCE */}
      {activeSection === 'emotions' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-xl text-xs text-purple-900">
            <strong>Emotion vs Sentiment:</strong> Sentiment measures valence (Positive/Negative/Neutral), while Emotion detects discrete human affective states (Joy, Excitement, Satisfaction, Frustration, Disappointment).
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Granular Emotion Distribution</h3>
              <p className="text-xs text-slate-500">Discrete emotion states extracted across customer reviews</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="emotion" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Emotion Indicators & Verbatim Samples</h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <strong className="block text-emerald-800">Delight & High Excitement:</strong>
                  <p className="italic">"The active noise cancellation is practically magic on flights. Soundstage is deep, crisp highs..."</p>
                  <span className="text-[10px] text-emerald-600 block mt-1">Customer: Dr. Evelyn Reed (AudioPro ANC)</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 text-xs text-rose-900 space-y-1">
                  <strong className="block text-rose-800">Frustration & Disappointment:</strong>
                  <p className="italic">"Hinge cracked after two weeks and the trackpad has an awful rattle. Extremely disappointed for a $2000 machine..."</p>
                  <span className="text-[10px] text-rose-600 block mt-1">Customer: David Reynolds (NovaBook Ultra 16)</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-900 space-y-1">
                  <strong className="block text-amber-800">Balanced Nuance & Suggestions:</strong>
                  <p className="italic">"Charging speeds are rapid across both ports, however the adapter gets warm to touch..."</p>
                  <span className="text-[10px] text-amber-600 block mt-1">Customer: Alex Morneau (NovaCharge Duo)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
