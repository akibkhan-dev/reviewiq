import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Review } from '../types';
import { NavTab } from './Sidebar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  onSelectReview: (review: Review) => void;
  onNavigate: (tab: NavTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  reviews,
  onSelectReview,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? reviews
        .filter(
          (r) =>
            r.reviewText.toLowerCase().includes(query.toLowerCase()) ||
            r.customerName.toLowerCase().includes(query.toLowerCase()) ||
            r.productName.toLowerCase().includes(query.toLowerCase()) ||
            r.keyTopics.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 7)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviews by customer, product, topic, or feedback..."
            className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 bg-transparent focus:outline-hidden"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Navigations */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            Jump to:
          </span>
          <button
            onClick={() => {
              onNavigate('analyzer');
              onClose();
            }}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            AI Analyzer
          </button>
          <button
            onClick={() => {
              onNavigate('explorer');
              onClose();
            }}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-medium cursor-pointer shadow-2xs"
          >
            Reviews Explorer
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              onClose();
            }}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-medium cursor-pointer shadow-2xs"
          >
            Dashboard Analytics
          </button>
          <button
            onClick={() => {
              onNavigate('intelligence');
              onClose();
            }}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-medium cursor-pointer shadow-2xs"
          >
            AI Intelligence
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Type keywords like "noise cancellation", "battery life", "trackpad", or "Marcus".
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching records for "{query}". Try another search term.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => {
                    onSelectReview(rev);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 group border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-slate-900">{rev.customerName}</span>
                      <span className="text-xs text-slate-400">• {rev.productName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          rev.sentiment === 'Positive'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rev.sentiment === 'Negative'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {rev.sentiment}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate font-normal">"{rev.reviewText}"</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-1 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
