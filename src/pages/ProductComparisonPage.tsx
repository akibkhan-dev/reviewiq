import React, { useState, useEffect } from 'react';
import {
  Scale,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Layers,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  MessageSquare,
  CheckCircle2,
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
import { ProductComparisonResult, Review } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';

interface ProductComparisonPageProps {
  onSelectReview: (review: Review) => void;
}

type ComparisonMode = 'summary' | 'ratings' | 'sentiment' | 'volume' | 'feedback';

export const ProductComparisonPage: React.FC<ProductComparisonPageProps> = ({
  onSelectReview,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    NOVA_TECH_PRODUCTS[0], // NovaTech AudioPro ANC Headphones
    NOVA_TECH_PRODUCTS[1], // NovaBook Ultra 16
  ]);
  const [comparison, setComparison] = useState<ProductComparisonResult | null>(null);
  const [activeMode, setActiveMode] = useState<ComparisonMode>('summary');
  const [loading, setLoading] = useState<boolean>(true);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await api.compareProducts(selectedProducts);
      setComparison(data);
    } catch (e) {
      console.error('Error loading product comparison:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [selectedProducts]);

  const toggleProduct = (prod: string) => {
    if (selectedProducts.includes(prod)) {
      if (selectedProducts.length <= 2) return; // keep at least 2
      setSelectedProducts(selectedProducts.filter((p) => p !== prod));
    } else {
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const chartData = comparison
    ? Object.values(comparison.details).map((d) => ({
        name: d.productName.replace('NovaTech ', '').replace('Nova', ''),
        fullName: d.productName,
        rating: d.avgRating,
        total: d.totalReviews,
        positive: d.positivePercent,
        negative: d.negativePercent,
        neutral: d.neutralPercent,
      }))
    : [];

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
            <Scale className="w-3 h-3 text-[#635BFF]" />
            Side-by-Side Product Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Advanced Product Comparison
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Compare customer ratings, sentiment proportions, and feedback drivers across multiple hardware lines.
          </p>
        </div>
      </div>

      {/* Product Selectors */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Select Hardware Products to Compare (Select 2 or more):
        </span>
        <div className="flex flex-wrap gap-2">
          {NOVA_TECH_PRODUCTS.map((prod) => {
            const isSelected = selectedProducts.includes(prod);
            return (
              <button
                key={prod}
                onClick={() => toggleProduct(prod)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && '✓ '}
                {prod}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison View Navigation Buttons (as requested) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'summary', label: 'Comparison Summary', icon: Sparkles },
          { id: 'ratings', label: 'Compare Ratings', icon: Star },
          { id: 'sentiment', label: 'Compare Sentiment', icon: PieIcon },
          { id: 'volume', label: 'Compare Review Volume', icon: BarChart3 },
          { id: 'feedback', label: 'Compare Customer Feedback', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as ComparisonMode)}
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

      {/* INITIAL / SUMMARY VIEW */}
      {activeMode === 'summary' && comparison && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Comparison Callout */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 rounded-xl border border-indigo-100 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Automated Comparison Insight</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-normal">
              {comparison.comparisonSummary}
            </p>
          </div>

          {/* Best Performer vs Most Complaints Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Top Performing Product
                </span>
                <h3 className="text-sm font-bold text-slate-900">{comparison.bestPerformer}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rating: <strong>{comparison.details[comparison.bestPerformer]?.avgRating}★</strong> | Positive: <strong>{comparison.details[comparison.bestPerformer]?.positivePercent}%</strong>
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Highest Defect & Complaint Share
                </span>
                <h3 className="text-sm font-bold text-slate-900">{comparison.mostComplaints}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Negative Share: <strong>{comparison.details[comparison.mostComplaints]?.negativePercent}%</strong> of reviews
                </p>
              </div>
            </div>
          </div>

          {/* Product Cards Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.values(comparison.details).map((prod) => (
              <div key={prod.productName} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{prod.productName}</h4>
                    <span className="text-xs text-slate-400">{prod.totalReviews} Customer Reviews</span>
                  </div>
                  <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {prod.avgRating}
                  </span>
                </div>

                {/* Key Strengths & Weaknesses */}
                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-emerald-800 uppercase text-[10px] tracking-wider block mb-1">
                      Key Strengths
                    </strong>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.topStrengths.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong className="text-rose-800 uppercase text-[10px] tracking-wider block mb-1">
                      Reported Friction Points
                    </strong>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.topWeaknesses.map((w, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-100">
                          ⚠ {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RATINGS COMPARISON VIEW */}
      {activeMode === 'ratings' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Average Star Rating Comparison</h3>
            <p className="text-xs text-slate-500">Calculated directly from verified customer rating inputs</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="rating" fill="#F59E0B" name="Average Stars" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SENTIMENT COMPARISON VIEW */}
      {activeMode === 'sentiment' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sentiment Distribution Comparison (%)</h3>
            <p className="text-xs text-slate-500">Proportion of Positive, Neutral, and Negative feedback</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="positive" fill="#16A34A" name="Positive %" />
                <Bar dataKey="neutral" fill="#D97706" name="Neutral %" />
                <Bar dataKey="negative" fill="#E11D48" name="Negative %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VOLUME COMPARISON VIEW */}
      {activeMode === 'volume' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Total Review Volume Comparison</h3>
            <p className="text-xs text-slate-500">Total customer opinions logged per product model</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#635BFF" name="Total Reviews" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FEEDBACK COMPARISON VIEW */}
      {activeMode === 'feedback' && comparison && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.values(comparison.details).map((prod) => (
              <div key={prod.productName} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900">{prod.productName} - Recent Customer Quotes</h4>
                <div className="space-y-2">
                  {prod.sampleQuotes.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-200/80">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{q.customer}</span>
                        <span className="text-amber-500">{q.rating} ★</span>
                      </div>
                      <p className="text-slate-600 italic">"{q.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
