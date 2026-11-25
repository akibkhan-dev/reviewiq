import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Star,
  Download,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  User,
  Package,
  Calendar,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { Review } from '../types';
import { NOVA_TECH_PRODUCTS, TOPIC_CATEGORIES } from '../data/mockReviews';

interface ReviewsExplorerPageProps {
  onSelectReview: (review: Review) => void;
  onDeleteReview?: (id: string) => void;
  refreshTrigger: number;
}

export const ReviewsExplorerPage: React.FC<ReviewsExplorerPageProps> = ({
  onSelectReview,
  onDeleteReview,
  refreshTrigger,
}) => {
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState('All');
  const [topic, setTopic] = useState('All');
  const [rating, setRating] = useState('All');
  const [product, setProduct] = useState('All');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const activeFilterCount =
    (sentiment !== 'All' ? 1 : 0) +
    (product !== 'All' ? 1 : 0) +
    (topic !== 'All' ? 1 : 0) +
    (rating !== 'All' ? 1 : 0);

  const handleClearFilters = () => {
    setSentiment('All');
    setProduct('All');
    setTopic('All');
    setRating('All');
    setSearch('');
    setPage(1);
  };

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getReviews({
        search: search.trim() || undefined,
        sentiment: sentiment !== 'All' ? sentiment : undefined,
        topic: topic !== 'All' ? topic : undefined,
        rating: rating !== 'All' ? rating : undefined,
        product: product !== 'All' ? product : undefined,
        sort,
        page,
        limit: 9,
      });
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error('Error loading reviews in explorer', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [search, sentiment, topic, rating, product, sort, page, refreshTrigger]);

  const handleExportCsv = () => {
    if (reviews.length === 0) return;
    const headers = ['Review ID,Customer Name,Product Name,Rating,Sentiment,Confidence,Topics,Review Text,Date'];
    const rows = reviews.map(
      (r) =>
        `"${r.id}","${r.customerName}","${r.productName}",${r.rating},"${r.sentiment}",${r.sentimentConfidence}%,"${r.keyTopics.join(';')}","${r.reviewText.replace(/"/g, '""')}","${r.date}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reviewiq_reviews_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Customer Reviews Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and filter verified customer reviews with detailed sentiment, topics, and AI summaries ({total} total reviews).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Search Bar & Primary Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reviews by keyword, customer, or phrase..."
              className="w-full text-sm font-normal text-slate-900 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Select */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-indigo-600 cursor-pointer shadow-xs"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>

            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear All Filters */}
            {(activeFilterCount > 0 || search) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-2 cursor-pointer transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Sentiment Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Sentiment
                </label>
                <select
                  value={sentiment}
                  onChange={(e) => {
                    setSentiment(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="All">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>

              {/* Product Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Product
                </label>
                <select
                  value={product}
                  onChange={(e) => {
                    setProduct(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-600 cursor-pointer truncate"
                >
                  <option value="All">All Products</option>
                  {NOVA_TECH_PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="All">All Topics</option>
                  {TOPIC_CATEGORIES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => {
                    setRating(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="All">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Review List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No matching reviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or removing active filters to see more results.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Attractive Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectReview(r)}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer space-y-4 group"
            >
              <div>
                {/* Header: Sentiment Badge + Rating */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r.sentiment === 'Positive'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : r.sentiment === 'Negative'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        r.sentiment === 'Positive'
                          ? 'bg-emerald-500'
                          : r.sentiment === 'Negative'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    {r.sentiment}
                  </span>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-slate-700 leading-relaxed mt-3 line-clamp-3">
                  "{r.reviewText}"
                </p>

                {/* Topic Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.keyTopics.slice(0, 2).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                  {r.keyTopics.length > 2 && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-200">
                      +{r.keyTopics.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <div className="font-semibold text-slate-800">{r.customerName}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                    {r.productName}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Sentiment</th>
                <th className="p-3.5">Topics</th>
                <th className="p-3.5">Feedback</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectReview(r)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-semibold text-slate-900">{r.customerName}</td>
                  <td className="p-3.5 text-slate-600 max-w-[150px] truncate">{r.productName}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-amber-500">{r.rating} ★</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.sentiment === 'Positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.sentiment === 'Negative'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {r.sentiment}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 max-w-[140px] truncate">
                    {r.keyTopics.join(', ')}
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate italic">
                    "{r.reviewText}"
                  </td>
                  <td className="p-3.5 text-slate-400">{r.date}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReview(r);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({total} reviews)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
