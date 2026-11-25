import React, { useState, useEffect } from 'react';
import {
  Tag,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Quote,
  Layers,
  Network,
} from 'lucide-react';
import { api } from '../services/api';
import { TopicMetric } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';

export const TopicAnalysisPage: React.FC = () => {
  const [topics, setTopics] = useState<TopicMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('Product Quality');
  const [product, setProduct] = useState<string>('All');

  useEffect(() => {
    async function loadTopics() {
      setLoading(true);
      try {
        const data = await api.getTopicAnalytics('all', product);
        setTopics(data.topics);
        if (data.topics.length > 0 && !selectedTopic) {
          setSelectedTopic(data.topics[0].topic);
        }
      } catch (e) {
        console.error('Error loading topics', e);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, [product]);

  const activeTopicData = topics.find((t) => t.topic === selectedTopic) || topics[0];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Network className="w-3 h-3 text-[#635BFF]" />
            Thematic Classification
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Topic & Theme Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover recurring customer conversation topics, cluster frequencies, and underlying sentiment orientations.
          </p>
        </div>

        {/* Product Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs self-start sm:self-auto">
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
      </div>

      {/* Interactive Topic Bubble Matrix */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Topic Volume & Sentiment
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Interactive Topic Clusters
            </h3>
            <p className="text-xs text-slate-500">
              Click any circle to examine breakdown metrics and verbatim customer quotes.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Neutral
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Negative
            </span>
          </div>
        </div>

        {/* Bubble Cluster Display */}
        <div className="flex flex-wrap items-center justify-center gap-5 py-8 bg-slate-50/70 rounded-xl border border-slate-200/80 min-h-[220px]">
          {topics.map((t) => {
            const isSelected = selectedTopic === t.topic;
            const size = Math.max(92, Math.min(145, 80 + t.totalMentions * 3.8));

            let colorBorder = 'border-emerald-300 bg-emerald-50/70 text-emerald-800';
            if (t.overallSentiment === 'Negative') {
              colorBorder = 'border-rose-300 bg-rose-50/70 text-rose-800';
            } else if (t.overallSentiment === 'Neutral') {
              colorBorder = 'border-amber-300 bg-amber-50/70 text-amber-800';
            }

            return (
              <button
                key={t.topic}
                onClick={() => setSelectedTopic(t.topic)}
                style={{ width: `${size}px`, height: `${size}px` }}
                className={`rounded-full border flex flex-col items-center justify-center text-center p-3 transition-all cursor-pointer shadow-xs ${colorBorder} ${
                  isSelected
                    ? 'ring-3 ring-indigo-500 scale-105 shadow-md bg-white'
                    : 'hover:scale-102 hover:bg-white'
                }`}
              >
                <span className="text-xs font-bold leading-tight">
                  {t.topic}
                </span>
                <span className="text-[11px] font-semibold mt-1 text-slate-600">
                  {t.totalMentions} reviews
                </span>
                <span className="text-[10px] font-medium uppercase mt-0.5 opacity-80">
                  {t.overallSentiment}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Topic Deep Dive */}
      {activeTopicData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Stats for Selected Topic */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {activeTopicData.topic}
                </h3>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  activeTopicData.overallSentiment === 'Positive'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : activeTopicData.overallSentiment === 'Negative'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {activeTopicData.overallSentiment}
              </span>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <ThumbsUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-emerald-700">
                  {activeTopicData.positiveMentions}
                </span>
                <span className="text-[11px] text-slate-500 block">Positive</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                <Minus className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-amber-700">
                  {activeTopicData.neutralMentions}
                </span>
                <span className="text-[11px] text-slate-500 block">Neutral</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                <ThumbsDown className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-rose-700">
                  {activeTopicData.negativeMentions}
                </span>
                <span className="text-[11px] text-slate-500 block">Negative</span>
              </div>
            </div>

            {/* Proportions Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Sentiment Ratio</span>
                <span className="font-semibold text-slate-800">{activeTopicData.totalMentions} total mentions</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${(activeTopicData.positiveMentions / (activeTopicData.totalMentions || 1)) * 100}%`,
                  }}
                  title="Positive"
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{
                    width: `${(activeTopicData.neutralMentions / (activeTopicData.totalMentions || 1)) * 100}%`,
                  }}
                  title="Neutral"
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{
                    width: `${(activeTopicData.negativeMentions / (activeTopicData.totalMentions || 1)) * 100}%`,
                  }}
                  title="Negative"
                />
              </div>
            </div>

            {/* Assessment Memo */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block mb-1">
                Executive Synthesis:
              </span>
              {activeTopicData.overallSentiment === 'Positive'
                ? `Customer reviews repeatedly celebrate NovaTech's execution on ${activeTopicData.topic.toLowerCase()}. This represents a strong organic driver of brand loyalty.`
                : activeTopicData.overallSentiment === 'Negative'
                ? `Mentions of ${activeTopicData.topic.toLowerCase()} contain notable friction points. Prioritizing fixes in this area will yield immediate satisfaction gains.`
                : `Feedback around ${activeTopicData.topic.toLowerCase()} is balanced. Customers acknowledge baseline quality while requesting ongoing refinements.`}
            </div>
          </div>

          {/* Right Verbatim Review Excerpts */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Quote className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer Quotes
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Representative Excerpts for {activeTopicData.topic}
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              {activeTopicData.excerpts.length > 0 ? (
                activeTopicData.excerpts.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{ex.customer}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold">{ex.rating} ★</span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            ex.sentiment === 'Positive'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ex.sentiment === 'Negative'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {ex.sentiment}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{ex.text}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  No direct excerpts found for this topic filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
