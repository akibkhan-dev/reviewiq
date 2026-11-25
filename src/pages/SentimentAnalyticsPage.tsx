import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Gauge,
  Sparkle,
} from 'lucide-react';
import { api } from '../services/api';
import { SentimentDistribution, ProductSentimentMetric, TopicMetric, SentimentTrendPoint } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';

export const SentimentAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('all');
  const [product, setProduct] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  const [distribution, setDistribution] = useState<SentimentDistribution[]>([]);
  const [productMetrics, setProductMetrics] = useState<ProductSentimentMetric[]>([]);
  const [topicMetrics, setTopicMetrics] = useState<TopicMetric[]>([]);
  const [trends, setTrends] = useState<SentimentTrendPoint[]>([]);
  const [ratingCounts, setRatingCounts] = useState<{ stars: string; count: number }[]>([]);
  const [topAppreciated, setTopAppreciated] = useState<{ aspect: string; mentions: number; positiveRate: string }[]>([]);
  const [topComplained, setTopComplained] = useState<{ aspect: string; severity: string; suggestedRemedy: string; mentions: number }[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getSentimentAnalytics(dateRange, product);
        setDistribution(data.distribution);
        setProductMetrics(data.productMetrics);
        setTopicMetrics(data.topicMetrics);
        setTrends(data.trends);
        setRatingCounts(data.ratingCounts);
        setTopAppreciated(data.topAppreciated);
        setTopComplained(data.topComplained);
      } catch (e) {
        console.error('Error loading sentiment analytics', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dateRange, product]);

  const totalReviews = distribution.reduce((sum, d) => sum + d.value, 0) || 1;
  const posCount = distribution.find((d) => d.name === 'Positive')?.value || 0;
  const negCount = distribution.find((d) => d.name === 'Negative')?.value || 0;
  const netSentimentScore = Math.round(((posCount - negCount) / totalReviews) * 100);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Gauge className="w-3 h-3 text-[#635BFF]" />
            Sentiment Distribution & Trends
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sentiment & Emotion Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze customer satisfaction patterns, sentiment ratios across product lines, and key voice-of-customer drivers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Product Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Products</option>
              {NOVA_TECH_PRODUCTS.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>

          {/* Time range buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All Time' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  dateRange === d.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlights: Net Sentiment Score & Ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Sentiment Index
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-extrabold ${
                  netSentimentScore >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netSentimentScore > 0 ? `+${netSentimentScore}` : netSentimentScore}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
            <p className="text-xs text-slate-500">
              Positive: {posCount} vs Negative: {negCount}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              netSentimentScore >= 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}
          >
            {netSentimentScore >= 0 ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approval to Defect Ratio
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {(posCount / (negCount || 1)).toFixed(1)} : 1
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Strong
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Positive reviews outweigh negative feedback
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Neutral & Mixed Share
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-600">
                {Math.round(((distribution.find((d) => d.name === 'Neutral')?.value || 0) / totalReviews) * 100)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">of total</span>
            </div>
            <p className="text-xs text-slate-500">
              Constructive suggestions & feature requests
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Rating Distribution & Sentiment by Product */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Distribution Bar Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rating Breakdown
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Star Rating Distribution (1 - 5 Stars)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingCounts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="stars" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} reviews`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#635BFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment by Product Comparison */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Product Analysis
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Sentiment Distribution Across Product Lines
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productMetrics.map((p) => ({
                  shortName: p.productName.replace('NovaTech ', '').replace('Nova', ''),
                  positive: p.positiveCount,
                  neutral: p.neutralCount,
                  negative: p.negativeCount,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="positive" name="Positive" fill="#10B981" stackId="a" />
                <Bar dataKey="neutral" name="Neutral" fill="#F59E0B" stackId="a" />
                <Bar dataKey="negative" name="Negative" fill="#F43F5E" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Most Appreciated Aspects vs Most Complained-About Aspects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Appreciated Aspects */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Top Praise Drivers
              </span>
              <h3 className="text-sm font-bold text-slate-900">Most Appreciated Aspects</h3>
            </div>
          </div>

          <div className="space-y-3">
            {topAppreciated.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">{item.aspect}</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    {item.positiveRate} customer approval rate
                  </p>
                </div>
                <div className="shrink-0 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                  {item.mentions} mentions
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Complained-About Aspects */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                Defect & Churn Risks
              </span>
              <h3 className="text-sm font-bold text-slate-900">Most Complained-About Aspects</h3>
            </div>
          </div>

          <div className="space-y-3">
            {topComplained.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">{item.aspect}</p>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {item.severity} severity
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Fix: {item.suggestedRemedy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
