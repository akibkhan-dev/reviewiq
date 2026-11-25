import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  FileText,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { Review, QualityAuditReport, QualityIssue } from '../types';
import { NOVA_TECH_PRODUCTS } from '../data/mockReviews';

interface DataManagementPageProps {
  onResetDemo: () => void;
  reviewCount: number;
  onReviewsUpdated: () => void;
}

type DataTab = 'overview' | 'quality' | 'upload' | 'backup';

export const DataManagementPage: React.FC<DataManagementPageProps> = ({
  onResetDemo,
  reviewCount,
  onReviewsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<DataTab>('overview');
  const [auditReport, setAuditReport] = useState<QualityAuditReport | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // CSV Ingestion states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [audit, revsData] = await Promise.all([
        api.getDataQualityAudit(),
        api.getReviews({ limit: 100 }),
      ]);
      setAuditReport(audit);
      setReviews(revsData.reviews);
    } catch (e) {
      console.error('Error loading data management data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reviewCount]);

  const handleReset = async () => {
    await onResetDemo();
    setIsResetConfirmOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3500);
    loadData();
  };

  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
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
        rowObj.reviewText = rowObj['Review Text'] || rowObj['reviewText'] || cleanValues[4] || '';
        rowObj.customerName = rowObj['Customer Name'] || rowObj['customerName'] || cleanValues[1] || `Customer #${i}`;
        rowObj.productName = rowObj['Product Name'] || rowObj['productName'] || cleanValues[2] || NOVA_TECH_PRODUCTS[0];
        rowObj.rating = parseInt(rowObj['Rating'] || cleanValues[3] || '4', 10) || 4;
        rowObj.date = rowObj['Date'] || new Date().toISOString().split('T')[0];

        if (rowObj.reviewText) rows.push(rowObj);
      }
      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleStartIngestion = async () => {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    try {
      const res = await api.bulkAnalyze(parsedRows);
      setUploadSuccess(res.analyzedCount);
      onReviewsUpdated();
      loadData();
    } catch (e) {
      console.error('Ingestion failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(reviews, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reviewiq_database_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFlaggedCsv = () => {
    if (!auditReport || auditReport.flaggedIssues.length === 0) return;
    const headers = ['Review ID,Customer Name,Product,Rating,Issue Type,Flag Reason,Severity,Date'];
    const rows = auditReport.flaggedIssues.map(
      (f) => `"${f.reviewId}","${f.customerName}","${f.productName}",${f.rating},"${f.issueType}","${f.flagReason}","${f.severity}","${f.date}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reviewiq_quality_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReviews = reviews.filter((r) =>
    r.reviewText.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
            <Database className="w-3 h-3 text-[#635BFF]" />
            Dataset Health & Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data Management & Quality Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor dataset cleanliness, audit duplicates and spam, manage CSV imports, and create backups.
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>The initial 52 verified NovaTech reviews have been restored to clean state!</span>
        </div>
      )}

      {/* Dataset Health Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Records</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">{reviews.length}</span>
          <span className="text-[11px] text-slate-400">Indexed in memory</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Clean Records</span>
          <span className="text-2xl font-bold text-emerald-700 block mt-1">{auditReport?.cleanRecordsCount || 0}</span>
          <span className="text-[11px] text-emerald-600">Passed all quality checks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Flagged for Audit</span>
          <span className="text-2xl font-bold text-amber-700 block mt-1">{auditReport?.flaggedCount || 0}</span>
          <span className="text-[11px] text-amber-600">Needs manual review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Exact Duplicates</span>
          <span className="text-2xl font-bold text-rose-700 block mt-1">{auditReport?.duplicateCount || 0}</span>
          <span className="text-[11px] text-rose-600">Duplicate review texts</span>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Dataset Preview', icon: Database },
          { id: 'quality', label: 'Review Quality & Spam Audit', icon: ShieldCheck },
          { id: 'upload', label: 'Bulk CSV Ingestion', icon: Upload },
          { id: 'backup', label: 'Export & Backup', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DataTab)}
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

      {/* TAB 1: DATASET PREVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Live Dataset Inspection</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search raw records..."
                className="text-xs font-normal text-slate-900 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Review Text</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{r.id.slice(0, 10)}</td>
                    <td className="p-3 font-semibold text-slate-900">{r.customerName}</td>
                    <td className="p-3 text-slate-600 max-w-[140px] truncate">{r.productName}</td>
                    <td className="p-3 font-bold text-amber-500">{r.rating}★</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        r.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        r.sentiment === 'Negative' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {r.sentiment}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">{r.language || 'English'}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate italic">"{r.reviewText}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW QUALITY & SPAM AUDIT */}
      {activeTab === 'quality' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start justify-between gap-4 text-xs text-amber-900">
            <div>
              <strong>Review Quality Governance:</strong> Records are flagged with neutral diagnostic labels like <em>"Needs Manual Review"</em> or <em>"Potentially Suspicious"</em> based on text length, duplicates, or rating incongruity. Records are never deleted automatically.
            </div>
            <button
              onClick={handleExportFlaggedCsv}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-50 shrink-0 cursor-pointer shadow-2xs"
            >
              Export Flagged CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {(auditReport?.flaggedIssues || []).map((issue, idx) => (
              <div key={idx} className="p-4 space-y-2 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {issue.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{issue.issueType}</span>
                    <span className="text-xs text-slate-400">• Customer: {issue.customerName}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{issue.date}</span>
                </div>

                <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  "{issue.reviewText}"
                </p>

                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">Audit Diagnosis:</strong> {issue.flagReason} (Assigned {issue.rating}★ for {issue.productName})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BULK CSV INGESTION */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ingest Review Batch</h3>
            <p className="text-xs text-slate-500">Upload CSV with columns: Review Text, Customer Name, Product Name, Rating, Date</p>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-50/50 cursor-pointer"
          >
            <input
              type="file"
              accept=".csv"
              id="data-csv-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />
            <label htmlFor="data-csv-input" className="cursor-pointer block space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                {csvFile ? csvFile.name : 'Choose a CSV file or drag and drop here'}
              </p>
              <p className="text-xs text-slate-400">Comma-separated review export files supported</p>
            </label>
          </div>

          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{parsedRows.length} valid records ready for batch analysis</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Validated
                </span>
              </div>

              {uploadSuccess ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                  ✓ Successfully analyzed and added {uploadSuccess} reviews to active store!
                </div>
              ) : (
                <button
                  onClick={handleStartIngestion}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Analyzing Batch...' : `Start Batch Ingestion (${parsedRows.length} Reviews)`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXPORT & BACKUP */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Export & System Backup</h3>
            <p className="text-xs text-slate-500">Download customer intelligence records in standard portable formats</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Complete JSON Database Backup</span>
              <p className="text-xs text-slate-500">Includes all reviews, extracted sentiment, emotion tags, topics, and AI explanations.</p>
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full JSON</span>
              </button>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Quality Audit CSV Export</span>
              <p className="text-xs text-slate-500">Download list of flagged items, duplicate records, and diagnostic audit logs.</p>
              <button
                onClick={handleExportFlaggedCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reset to Initial Demo Dataset?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will restore the 52 verified NovaTech reviews and reset custom additions.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
