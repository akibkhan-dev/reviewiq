import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Star,
  Download,
  RotateCcw,
  Check,
  Tag,
  ArrowRight,
  ShieldCheck,
  Brain,
  MessageSquare,
  Sparkle,
} from 'lucide-react';
import { api } from '../services/api';
import { Review, ReviewAnalysisResult } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';
import { NavTab } from '../components/Sidebar';

interface ReviewAnalyzerPageProps {
  onReviewAdded: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const ReviewAnalyzerPage: React.FC<ReviewAnalyzerPageProps> = ({
  onReviewAdded,
  onNavigate,
}) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'bulk'>('manual');

  // Manual Form States
  const [reviewText, setReviewText] = useState('');
  const [customerName, setCustomerName] = useState('Dr. Marcus Vance');
  const [productName, setProductName] = useState(NOVA_TECH_PRODUCTS[0]);
  const [rating, setRating] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReviewAnalysisResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Bulk Upload States
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkSuccessCount, setBulkSuccessCount] = useState<number | null>(null);

  // Quick Test Presets
  const samples = [
    {
      label: 'Positive Rave (ANC)',
      text: 'The active noise cancellation is practically magic on flights. Soundstage is deep, crisp highs, and the battery easily lasted through my 14-hour transpacific trip.',
      product: 'NovaTech AudioPro ANC Headphones',
      rating: 5,
      customer: 'Dr. Evelyn Reed',
    },
    {
      label: 'Negative Defect (Hinge)',
      text: 'Hinge cracked after two weeks and the trackpad has an awful rattle. Customer support took 6 days to reply with a template refusing warranty coverage. Extremely disappointed for a $2000 machine.',
      product: 'NovaBook Ultra 16',
      rating: 1,
      customer: 'David Reynolds',
    },
    {
      label: 'Hindi / Multilingual',
      text: 'बैटरी बैकअप बहुत ही शानदार है और डिस्प्ले क्रिस्प है, लेकिन ट्रैकपैड में आवाज़ आ रही है और कस्टमर सपोर्ट ने 5 दिन तक जवाब नहीं दिया।',
      product: 'NovaBook Ultra 16',
      rating: 2,
      customer: 'Rahul Sharma',
    },
    {
      label: 'Mixed Thermal (GaN 100W)',
      text: 'Charging speeds are rapid and easily hit 100W across both ports. However, the adapter gets uncomfortably hot to touch during sustained dual draws. Solid charger with slight thermal concerns.',
      product: 'NovaCharge Duo 100W',
      rating: 3,
      customer: 'Alex Morneau',
    },
  ];

  const handleApplySample = (s: typeof samples[0]) => {
    setReviewText(s.text);
    setProductName(s.product);
    setRating(s.rating);
    setCustomerName(s.customer);
    setAnalysisResult(null);
    setSavedSuccess(false);
  };

  const handleAnalyzeManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setAnalyzing(true);
    setSavedSuccess(false);
    try {
      const result = await api.analyzeReview(reviewText.trim(), rating, productName);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!analysisResult) return;

    const newRev: Review = {
      id: `rev-user-${Date.now()}`,
      customerName: customerName.trim() || 'Verified Customer',
      productName,
      rating,
      reviewText: reviewText.trim(),
      date: new Date().toISOString().split('T')[0],
      sentiment: analysisResult.sentiment,
      sentimentConfidence: analysisResult.sentimentConfidence,
      keyTopics: analysisResult.keyTopics,
      emotion: analysisResult.emotion,
      keyPhrases: analysisResult.keyPhrases,
      aiExplanation: analysisResult.aiExplanation,
      suggestedAction: analysisResult.suggestedAction,
      isDemo: false,
      analyzedAt: new Date().toISOString(),
    };

    await api.addReview(newRev);
    setSavedSuccess(true);
    onReviewAdded();
  };

  // CSV Bulk Upload handling
  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const cleanValues = match.map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cleanValues[idx] || '';
        });
        rowObj.reviewText = rowObj['Review Text'] || rowObj['reviewText'] || rowObj['Text'] || cleanValues[4] || '';
        rowObj.customerName = rowObj['Customer Name'] || rowObj['customerName'] || rowObj['Customer'] || cleanValues[1] || `Customer #${i}`;
        rowObj.productName = rowObj['Product Name'] || rowObj['productName'] || rowObj['Product'] || NOVA_TECH_PRODUCTS[0];
        rowObj.rating = parseInt(rowObj['Rating'] || rowObj['rating'] || '4', 10) || 4;
        rowObj.date = rowObj['Date'] || rowObj['date'] || new Date().toISOString().split('T')[0];

        if (rowObj.reviewText) rows.push(rowObj);
      }

      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleStartBulkAnalysis = async () => {
    if (parsedRows.length === 0) return;
    setBulkAnalyzing(true);
    setBulkProgress(20);

    try {
      const interval = setInterval(() => {
        setBulkProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const res = await api.bulkAnalyze(parsedRows);
      clearInterval(interval);
      setBulkProgress(100);
      setBulkSuccessCount(res.analyzedCount);
      onReviewAdded();
    } catch (e) {
      console.error('Bulk upload error', e);
    } finally {
      setBulkAnalyzing(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Review ID,Customer Name,Product Name,Rating,Review Text,Date\n' +
      'rev-101,Maya Johnson,NovaTech AudioPro ANC Headphones,5,"Acoustic depth and noise cancellation are simply stunning on subway commutes.",2026-10-27\n' +
      'rev-102,Tom Higgins,NovaBook Ultra 16,2,"Display colors are nice but the trackpad has severe pre-travel wobble.",2026-10-26\n' +
      'rev-103,Chloe Zhao,NovaCharge Duo 100W,4,"Very small and charges fast, warms up during simultaneous laptop charging.",2026-10-25\n' +
      'rev-104,Ethan Hunt,NovaPulse Smartwatch v2,5,"Sapphire crystal display survived a direct rock strike without a scratch.",2026-10-24\n' +
      'rev-105,Clara Oswald,NovaCam 4K Stream,1,"Software driver freezes repeatedly on Windows 11 and support took 5 days.",2026-10-23\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reviewiq_sample_reviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Sparkle className="w-3 h-3 text-[#635BFF]" />
            Natural Language Processing
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Review Analyzer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Instantly classify sentiment, identify emotional tone, extract recurring themes, and generate actionable summaries.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveMode('manual')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Review
          </button>
          <button
            onClick={() => setActiveMode('bulk')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'bulk'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk CSV Upload
          </button>
        </div>
      </div>

      {/* SINGLE REVIEW MODE */}
      {activeMode === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Column */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            {/* Quick Test Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Test Samples
              </span>
              <div className="flex flex-wrap gap-2">
                {samples.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleApplySample(s)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyzeManual} className="space-y-5">
              {/* Product & Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product
                  </label>
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-xs"
                  >
                    {NOVA_TECH_PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Dr. Marcus Vance"
                    className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  />
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                      title={`${star} Star`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-700 ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Clean Review Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Customer Review
                  </label>
                  <span className="text-xs text-slate-400">
                    {reviewText.length} characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Paste or write customer feedback here..."
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg p-3.5 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none leading-relaxed shadow-xs"
                  required
                />
              </div>

              {/* Prominent Analyze Review Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setReviewText('');
                    setAnalysisResult(null);
                    setSavedSuccess(false);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="submit"
                  disabled={analyzing || !reviewText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold tracking-wide shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>{analyzing ? 'Analyzing Review...' : 'Analyze Review'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-5 space-y-4">
            {analyzing ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Analyzing Sentiment & Topics...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Extracting key emotion vectors, praise points, and actionable summaries.
                  </p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in">
                {/* Sentiment & Confidence */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        analysisResult.sentiment === 'Positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : analysisResult.sentiment === 'Negative'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          analysisResult.sentiment === 'Positive'
                            ? 'bg-emerald-500'
                            : analysisResult.sentiment === 'Negative'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {analysisResult.sentiment} Sentiment
                    </span>

                    {/* Multilingual Language Badge */}
                    {analysisResult.language && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        🌐 {analysisResult.language}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {analysisResult.sentimentConfidence}% Confidence
                  </span>
                </div>

                {/* Emotion Profile */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">
                    Detected Emotion
                  </span>
                  <span className="font-semibold text-slate-800 capitalize bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                    {analysisResult.emotion}
                  </span>
                </div>

                {/* Positive Aspects & Negative Aspects */}
                {((analysisResult.positiveAspects && analysisResult.positiveAspects.length > 0) ||
                  (analysisResult.negativeAspects && analysisResult.negativeAspects.length > 0)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {analysisResult.positiveAspects && analysisResult.positiveAspects.length > 0 && (
                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Praise & Strengths
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.positiveAspects.map((pos, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 shadow-2xs"
                            >
                              ✓ {pos}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.negativeAspects && analysisResult.negativeAspects.length > 0 && (
                      <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                          Complaints & Pain Points
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.negativeAspects.map((neg, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200 shadow-2xs"
                            >
                              ✕ {neg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Translated Summary for Multilingual Reviews */}
                {analysisResult.translatedSummary && (
                  <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>English Translation & Summary</span>
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      {analysisResult.translatedSummary}
                    </p>
                  </div>
                )}

                {/* Topics */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Key Topics Identified
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keyTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Phrases */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Key Phrases
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keyPhrases.map((phrase, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Explanation / Summary */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Analysis Summary</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysisResult.aiExplanation}
                  </p>
                </div>

                {/* Recommended Action */}
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recommended Action</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {analysisResult.suggestedAction}
                  </p>
                </div>

                {/* Save to Database */}
                <div className="pt-2">
                  {savedSuccess ? (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Saved to review database
                      </span>
                      <button
                        onClick={() => onNavigate('explorer')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        View in Explorer →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveToDatabase}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Save Review to Database</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Awaiting Input
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Enter a review on the left or select a sample preset to see real-time AI sentiment classification and insights.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK CSV MODE */}
      {activeMode === 'bulk' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulk Customer Review Upload
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload CSV datasets for batch AI sentiment classification and topic mapping.
              </p>
            </div>

            <button
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 text-center transition-colors bg-slate-50/50 cursor-pointer"
          >
            <input
              type="file"
              accept=".csv"
              id="csv-file-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {csvFile ? csvFile.name : 'Select or drop your CSV file here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported columns: Review ID, Customer Name, Product Name, Rating, Review Text, Date
              </p>
            </label>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Preview: {parsedRows.length} valid records ready
                </span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ✓ Valid Format
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Review Text</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="p-3 font-semibold text-slate-900">{row.customerName}</td>
                        <td className="p-3 text-slate-600">{row.productName}</td>
                        <td className="p-3 font-bold text-amber-500">{row.rating} ★</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate italic">"{row.reviewText}"</td>
                        <td className="p-3 text-slate-500">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Progress & Submit */}
              {bulkAnalyzing ? (
                <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Processing bulk reviews with AI...</span>
                    <span>{bulkProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${bulkProgress}%` }}
                    />
                  </div>
                </div>
              ) : bulkSuccessCount !== null ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Successfully analyzed and saved {bulkSuccessCount} reviews!</span>
                  </div>
                  <button
                    onClick={() => onNavigate('explorer')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Open Reviews Explorer →
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartBulkAnalysis}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Start Bulk AI Analysis ({parsedRows.length} Reviews)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
