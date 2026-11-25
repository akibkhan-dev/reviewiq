export type SentimentType = 'Positive' | 'Negative' | 'Neutral';

export interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number; // 1 to 5
  reviewText: string;
  date: string; // YYYY-MM-DD
  sentiment: SentimentType;
  sentimentConfidence: number; // 0 to 100
  keyTopics: string[];
  emotion: string; // 'satisfaction', 'frustration', 'excitement', 'disappointment', 'neutrality', 'joy', 'anger', etc.
  keyPhrases: string[];
  aiExplanation: string;
  suggestedAction: string;
  language?: string; // 'English' | 'Hindi' | 'Hinglish' | 'Other'
  originalLanguageText?: string;
  translatedSummary?: string;
  positiveAspects?: string[];
  negativeAspects?: string[];
  isDemo?: boolean;
  analyzedAt: string;
}

export interface ReviewAnalysisResult {
  sentiment: SentimentType;
  sentimentConfidence: number;
  keyTopics: string[];
  emotion: string;
  keyPhrases: string[];
  aiExplanation: string;
  suggestedAction: string;
  language?: string;
  originalLanguageText?: string;
  translatedSummary?: string;
  positiveAspects?: string[];
  negativeAspects?: string[];
  isAiGenerated: boolean;
}

export interface OverviewMetrics {
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageRating: number;
  satisfactionScore: number; // 0 to 100
  positiveTrend: number; // e.g. +4.2%
  negativeTrend: number;
  neutralTrend: number;
  satisfactionTrend: number;
  volumeTrend: number;
}

export interface SentimentDistribution {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  avgRating: number;
}

export interface TopicMetric {
  topic: string;
  totalMentions: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  overallSentiment: SentimentType;
  sentimentScore: number; // -1 to +1 or 0-100
  excerpts: { text: string; sentiment: SentimentType; rating: number; customer: string }[];
}

export interface ProductSentimentMetric {
  productName: string;
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageRating: number;
  satisfactionScore: number;
}

export interface BusinessRecommendation {
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  impact: string;
  category: string;
  affectedProduct?: string;
  evidenceQuotes?: string[];
}

export interface PriorityIssue {
  issue: string;
  occurrences: number;
  severity: 'High' | 'Medium' | 'Low';
  affectedProduct: string;
  suggestedFix: string;
  evidenceQuotes?: string[];
}

export interface AIInsightsReport {
  executiveSummary: string;
  positiveInsights: string[];
  negativeInsights: string[];
  emergingTrends: string[];
  businessRecommendations: BusinessRecommendation[];
  priorityIssues: PriorityIssue[];
  generatedAt: string;
  isLiveAi: boolean;
  reviewCountAnalyzed: number;
}

// Enterprise Action Center Task
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  affectedProduct: string;
  supportingEvidence: string[];
  suggestedAction: string;
  department: 'Engineering' | 'Customer Support' | 'Product Design' | 'Quality Assurance' | 'Operations' | 'Marketing';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

// Ask ReviewIQ Chat Message
export interface ChatSupportingReview {
  id: string;
  customer: string;
  product: string;
  rating: number;
  quote: string;
  sentiment: SentimentType;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  supportingReviews?: ChatSupportingReview[];
  suggestedFollowUps?: string[];
}

// Data Quality & Spam Flag
export interface QualityIssue {
  reviewId: string;
  customerName: string;
  productName: string;
  rating: number;
  reviewText: string;
  issueType: 'Exact Duplicate' | 'Repetitive Pattern' | 'Incomplete/Short Text' | 'Suspicious Pattern' | 'Missing Information';
  flagReason: string;
  severity: 'Needs Manual Review' | 'Potentially Suspicious';
  date: string;
}

export interface QualityAuditReport {
  totalAudited: number;
  cleanRecordsCount: number;
  flaggedCount: number;
  duplicateCount: number;
  missingDataCount: number;
  suspiciousCount: number;
  flaggedIssues: QualityIssue[];
  auditTimestamp: string;
}

// Product Comparison Result
export interface ProductComparisonDetail {
  productName: string;
  totalReviews: number;
  avgRating: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  topStrengths: string[];
  topWeaknesses: string[];
  sampleQuotes: { customer: string; quote: string; sentiment: SentimentType; rating: number }[];
}

export interface ProductComparisonResult {
  products: string[];
  details: Record<string, ProductComparisonDetail>;
  bestPerformer: string;
  mostComplaints: string;
  comparisonSummary: string;
}
