import React from 'react';
import { X, Star, Sparkles, Bot, Tag, Lightbulb, Trash2, Calendar, User, Package } from 'lucide-react';
import { Review } from '../types';

interface ReviewDetailsModalProps {
  review: Review | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  onClose,
  onDelete,
}) => {
  if (!review) return null;

  const getSentimentTheme = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return {
          border: 'border-emerald-200',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Negative':
        return {
          border: 'border-rose-200',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          border: 'border-amber-200',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
    }
  };

  const theme = getSentimentTheme(review.sentiment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Customer Review Details
              </h3>
              <p className="text-xs text-slate-400">
                ID: {review.id}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Top Meta Specifications */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-900 text-sm">{review.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-slate-700 font-medium">{review.productName}</span>
              </div>
            </div>

            <div className="text-right">
              {/* Star Rating */}
              <div className="flex items-center gap-1 justify-end mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-800 ml-1.5">{review.rating}.0</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-end">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{review.date}</span>
              </div>
            </div>
          </div>

          {/* Sentiment & Emotion Telemetry */}
          <div className={`p-4 rounded-xl bg-white border ${theme.border} flex items-center justify-between shadow-2xs`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
              <div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                  {review.sentiment} Sentiment
                </span>
                <p className="text-xs text-slate-600 mt-1 capitalize">
                  Detected Emotion: <strong className="text-slate-900">{review.emotion}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">{review.sentimentConfidence}%</span>
              <p className="text-[11px] text-slate-400">Confidence</p>
            </div>
          </div>

          {/* Customer Quote */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Customer Feedback
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed italic">
              "{review.reviewText}"
            </div>
          </div>

          {/* Topics & Salient Phrases */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Identified Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {review.keyTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Key Phrases
              </span>
              <div className="flex flex-wrap gap-1.5">
                {review.keyPhrases.map((phrase, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Analysis Summary</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {review.aiExplanation}
            </p>
          </div>

          {/* Suggested Action */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Action</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {review.suggestedAction}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(review.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Review</span>
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
