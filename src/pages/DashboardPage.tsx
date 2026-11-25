import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Star,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import {
  OverviewMetrics,
  SentimentDistribution,
  SentimentTrendPoint,
  TopicMetric,
  ProductSentimentMetric,
  Review,
} from '../types';
import { NOVA_TECH_PRODUCTS, TOPIC_CATEGORIES } from '../data/mockReviews';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectReview: (review: Review) => void;
}

type DashboardSubTab =
  | 'overview'
  | 'sentiment'
  | 'products'
  | 'rating-trends'
  | 'topics'
  | 'segmentation';

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectReview,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardSubTab>('overview');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [distribution, setDistribution] = useState<SentimentDistribution[]>([]);
  const [trends, setTrends] = useState<SentimentTrendPoint[]>([]);
  const [topTopics, setTopTopics] = useState<TopicMetric[]>([]);
  const [productMetrics, setProductMetrics] = useState<ProductSentimentMetric[]>([]);
  const [ratingCounts, setRatingCounts] = useState<{ stars: string; count: number }[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  // Accordion toggle states in Sentiment Analytics tab
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    distribution: true,
    overTime: false,
    posVsNeg: false,
    productSentiment: false,
    changeDetection: false,
  });

  // Customer Segmentation filter states
  const [segSentiment, setSegSentiment] = useState<string>('All');
  const [segRating, setSegRating] = useState<string>('All');
  const [segProduct, setSegProduct] = useState<string>('All');
  const [segTopic, setSegTopic] = useState<string>('All');

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, sentimentData, reviewsData] = await Promise.all([
        api.getOverviewAnalytics(dateRange, selectedProduct),
        api.getSentimentAnalytics(dateRange, selectedProduct),
        api.getReviews({ limit: 100 }),
      ]);

      setMetrics(overviewData.metrics);
      setDistribution(overviewData.distribution);
      setTrends(overviewData.trends);
      setTopTopics(overviewData.topTopics);
      setProductMetrics(sentimentData.productMetrics);
      setRatingCounts(sentimentData.ratingCounts);
      setAllReviews(reviewsData.reviews);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, selectedProduct]);

  // Filtered reviews for Segmentation tab
  const segmentedReviews = allReviews.filter((r) => {
    if (segSentiment !== 'All' && r.sentiment !== segSentiment) return false;
    if (segRating !== 'All' && r.rating !== Number(segRating)) return false;
    if (segProduct !== 'All' && r.productName !== segProduct) return false;
    if (segTopic !== 'All' && !r.keyTopics.includes(segTopic)) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header & Context Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Customer Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time customer satisfaction analytics, sentiment metrics, and operational signals.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Product Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
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

          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  dateRange === d.id
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ESSENTIAL KPI CARDS (Always visible initially as requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total Reviews */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Reviews
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics ? metrics.totalReviews : '...'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +14%
            </span>
          </div>
        </div>

        {/* Positive Reviews */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            Positive
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {metrics ? metrics.positiveCount : '...'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {metrics ? Math.round((metrics.positiveCount / (metrics.totalReviews || 1)) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Neutral Reviews */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-amber-600" />
            Neutral
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {metrics ? metrics.neutralCount : '...'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {metrics ? Math.round((metrics.neutralCount / (metrics.totalReviews || 1)) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Negative Reviews */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
            Negative
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {metrics ? metrics.negativeCount : '...'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {metrics ? Math.round((metrics.negativeCount / (metrics.totalReviews || 1)) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Avg Rating
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics ? metrics.averageRating : '...'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS (A - F) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'sentiment', label: 'Sentiment Analytics', icon: PieIcon },
          { id: 'products', label: 'Product Performance', icon: Layers },
          { id: 'rating-trends', label: 'Rating Trends', icon: TrendingUp },
          { id: 'topics', label: 'Topic Analysis', icon: Activity },
          { id: 'segmentation', label: 'Customer Segmentation', icon: Filter },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardSubTab)}
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

      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Deep-Dive Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Sentiment Breakdown
                </span>
                <h3 className="text-sm font-bold text-slate-900">Net Sentiment Score</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Positive sentiment leads by 4.2x over critical defect feedback.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('sentiment')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <span>View Sentiment Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Product Comparison
                </span>
                <h3 className="text-sm font-bold text-slate-900">Hardware Catalog Performance</h3>
                <p className="text-xs text-slate-500 mt-1">
                  AudioPro ANC and NovaCharge Duo hold highest satisfaction ratings.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <span>View Product Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
                  Actionable Tasks
                </span>
                <h3 className="text-sm font-bold text-slate-900">Smart Action Center</h3>
                <p className="text-xs text-slate-500 mt-1">
                  5 operational tasks tracked across Support and Engineering QA.
                </p>
              </div>
              <button
                onClick={() => onNavigate('actions')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
              >
                <span>Open Action Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Sentiment & Recent Reviews Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Overall Sentiment Ratio</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-semibold">
                {distribution.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5" style={{ color: d.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.percentage}%)
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Customer Voices</h3>
                <button
                  onClick={() => onNavigate('explorer')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View All Reviews →
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {allReviews.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onSelectReview(r)}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors cursor-pointer rounded-lg px-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{r.customerName}</span>
                        <span className="text-xs text-slate-400">• {r.productName}</span>
                      </div>
                      <p className="text-xs text-slate-600 truncate italic">"{r.reviewText}"</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                        r.sentiment === 'Positive'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.sentiment === 'Negative'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {r.sentiment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: SENTIMENT ANALYTICS (With expandable sections as specified) */}
      {activeTab === 'sentiment' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-800">
            <strong>Interactive Mode:</strong> Click any section header below to expand its dedicated chart and analytics.
          </div>

          {/* 1. Sentiment Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleSection('distribution')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">1. Sentiment Distribution Breakdown</h3>
                <p className="text-xs text-slate-500">Proportional valence breakdown across current review slice</p>
              </div>
              {expandedSections.distribution ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedSections.distribution && (
              <div className="p-6 border-t border-slate-100">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                      <Bar dataKey="value" fill="#635BFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 2. Sentiment Over Time */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleSection('overTime')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Sentiment Trajectory Over Time</h3>
                <p className="text-xs text-slate-500">Weekly and daily volume progression tracking</p>
              </div>
              {expandedSections.overTime ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedSections.overTime && (
              <div className="p-6 border-t border-slate-100">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="total" stroke="#635BFF" strokeWidth={2} name="Total Reviews" />
                      <Line type="monotone" dataKey="positive" stroke="#16A34A" strokeWidth={2} name="Positive" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 3. Positive vs Negative Trends */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleSection('posVsNeg')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Positive vs Negative Head-to-Head</h3>
                <p className="text-xs text-slate-500">Compare satisfaction drivers directly against friction spikes</p>
              </div>
              {expandedSections.posVsNeg ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedSections.posVsNeg && (
              <div className="p-6 border-t border-slate-100">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="positive" fill="#16A34A" name="Positive" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="negative" fill="#E11D48" name="Negative" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 4. Product-wise Sentiment */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleSection('productSentiment')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">4. Product-Wise Sentiment Distribution</h3>
                <p className="text-xs text-slate-500">Stacked breakdown across all 6 core product models</p>
              </div>
              {expandedSections.productSentiment ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedSections.productSentiment && (
              <div className="p-6 border-t border-slate-100">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productMetrics.map((p) => ({
                        name: p.productName.replace('NovaTech ', '').replace('Nova', ''),
                        positive: p.positiveCount,
                        neutral: p.neutralCount,
                        negative: p.negativeCount,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="positive" stackId="a" fill="#16A34A" name="Positive" />
                      <Bar dataKey="neutral" stackId="a" fill="#D97706" name="Neutral" />
                      <Bar dataKey="negative" stackId="a" fill="#E11D48" name="Negative" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 5. Sentiment Change Detection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleSection('changeDetection')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">5. Sentiment Change Detection & Anomalies</h3>
                <p className="text-xs text-slate-500">Automated alerts on sudden shifts in customer feedback velocity</p>
              </div>
              {expandedSections.changeDetection ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedSections.changeDetection && (
              <div className="p-6 border-t border-slate-100 space-y-3">
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Negative Sentiment Acceleration on NovaBook Ultra 16:</strong>
                    <p className="mt-0.5 text-amber-800">
                      Complaints about trackpad wobble and hinge stiffness increased by +28% in recent feedback batches.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Positive Trend on AudioPro ANC Headphones:</strong>
                    <p className="mt-0.5 text-emerald-800">
                      Noise cancellation praise maintains 94% customer approval rate over consecutive weeks.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C: PRODUCT PERFORMANCE */}
      {activeTab === 'products' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hardware Product Performance Matrix</h3>
              <p className="text-xs text-slate-500">Review volumes, ratings, strengths, and weaknesses per product</p>
            </div>
            <button
              onClick={() => onNavigate('comparison')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
            >
              <span>View Detailed Performance Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productMetrics.map((p) => {
              const posPercent = p.totalReviews > 0 ? Math.round((p.positiveCount / p.totalReviews) * 100) : 0;
              const negPercent = p.totalReviews > 0 ? Math.round((p.negativeCount / p.totalReviews) * 100) : 0;
              return (
                <div key={p.productName} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{p.productName}</h4>
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {p.averageRating}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="font-bold text-slate-900 block">{p.totalReviews}</span>
                        <span className="text-[10px] text-slate-400">Reviews</span>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <span className="font-bold text-emerald-700 block">{posPercent}%</span>
                        <span className="text-[10px] text-emerald-600">Positive</span>
                      </div>
                      <div className="p-2 bg-rose-50 rounded-lg">
                        <span className="font-bold text-rose-700 block">{negPercent}%</span>
                        <span className="text-[10px] text-rose-600">Negative</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Satisfaction: <strong>{p.satisfactionScore}%</strong></span>
                    <button
                      onClick={() => onNavigate('comparison')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Compare →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB D: RATING TRENDS */}
      {activeTab === 'rating-trends' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Star Rating Breakdown</h3>
              <p className="text-xs text-slate-500 mb-4">Total reviews categorized from 1 to 5 stars</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="stars" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#635BFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average rating over time */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Average Rating Trajectory</h3>
              <p className="text-xs text-slate-500 mb-4">Tracking customer rating evolution over time</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="avgRating" stroke="#F59E0B" strokeWidth={2.5} name="Average Stars" dot={{ fill: '#F59E0B' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: TOPIC ANALYSIS */}
      {activeTab === 'topics' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Topic Frequency & Sentiment Distribution</h3>
              <p className="text-xs text-slate-500">Unsupervised thematic cluster tracking from customer feedback</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topTopics.map((t) => (
              <div key={t.topic} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{t.topic}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      t.overallSentiment === 'Positive'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : t.overallSentiment === 'Negative'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {t.overallSentiment}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs text-slate-500">
                  <span>Total Mentions</span>
                  <span className="font-bold text-slate-900">{t.totalMentions} reviews</span>
                </div>

                {/* Sentiment distribution bar for topic */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(t.positiveMentions / (t.totalMentions || 1)) * 100}%` }}
                    title={`Positive: ${t.positiveMentions}`}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${(t.neutralMentions / (t.totalMentions || 1)) * 100}%` }}
                    title={`Neutral: ${t.neutralMentions}`}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(t.negativeMentions / (t.totalMentions || 1)) * 100}%` }}
                    title={`Negative: ${t.negativeMentions}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB F: CUSTOMER SEGMENTATION */}
      {activeTab === 'segmentation' && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Multi-Dimensional Customer Segmentation</h3>
            <p className="text-xs text-slate-500">Isolate review cohorts based on sentiment, rating, product, and topic</p>
          </div>

          {/* Filter Bar for Segmentation */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sentiment Cohort
              </label>
              <select
                value={segSentiment}
                onChange={(e) => setSegSentiment(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden"
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive Only</option>
                <option value="Neutral">Neutral Only</option>
                <option value="Negative">Negative Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Rating Cohort
              </label>
              <select
                value={segRating}
                onChange={(e) => setSegRating(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Product Line
              </label>
              <select
                value={segProduct}
                onChange={(e) => setSegProduct(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden truncate"
              >
                <option value="All">All Products</option>
                {NOVA_TECH_PRODUCTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Topic Category
              </label>
              <select
                value={segTopic}
                onChange={(e) => setSegTopic(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden"
              >
                <option value="All">All Topics</option>
                {TOPIC_CATEGORIES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count & Segment review list */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Segment Matches: <strong>{segmentedReviews.length} customer reviews</strong></span>
            <button
              onClick={() => {
                setSegSentiment('All');
                setSegRating('All');
                setSegProduct('All');
                setSegTopic('All');
              }}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              Reset Cohort Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segmentedReviews.slice(0, 9).map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectReview(r)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{r.customerName}</span>
                    <span className="text-xs font-bold text-amber-500">{r.rating} ★</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate">{r.productName}</span>
                  <p className="text-xs text-slate-600 line-clamp-3 italic mt-1">"{r.reviewText}"</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full border ${
                      r.sentiment === 'Positive'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : r.sentiment === 'Negative'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {r.sentiment}
                  </span>
                  <span className="text-indigo-600 font-semibold hover:underline">View Dossier →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
