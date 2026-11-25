import {
  Review,
  ReviewAnalysisResult,
  OverviewMetrics,
  SentimentDistribution,
  SentimentTrendPoint,
  TopicMetric,
  ProductSentimentMetric,
  AIInsightsReport,
  ActionItem,
  QualityAuditReport,
  ProductComparisonResult,
  ChatMessage,
  ChatSupportingReview,
} from '../types';
import { INITIAL_DEMO_REVIEWS } from '../data/mockReviews';
import {
  computeOverviewMetrics,
  computeSentimentDistribution,
  computeSentimentTrends,
  computeTopicMetrics,
  computeProductMetrics,
  filterReviews,
  auditDataQuality,
  compareProductMetrics,
} from '../../server/analyticsService';
import { analyzeReviewHeuristic } from '../../server/sentimentService';

const LOCAL_STORAGE_KEY = 'reviewiq_user_reviews';
const LOCAL_STORAGE_ACTIONS_KEY = 'reviewiq_action_items';

function getLocalStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage', e);
  }
  return [...INITIAL_DEMO_REVIEWS];
}

function saveLocalStoredReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving localStorage', e);
  }
}

function getLocalStoredActions(): ActionItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'act-101',
      title: 'Audit NovaBook Ultra 16 Trackpad & Hinge Torque',
      description: 'Multiple customers report mechanical pre-travel wobble on the glass trackpad and excessive resistance on the display hinge causing cracking after 2-3 weeks.',
      affectedProduct: 'NovaBook Ultra 16',
      supportingEvidence: [
        '"Hinge cracked after two weeks and the trackpad has an awful rattle." - David Reynolds',
        '"Trackpad has severe pre-travel wobble before clicking." - Tom Higgins',
      ],
      suggestedAction: 'Deploy updated assembly tolerances at the manufacturing facility and issue warranty service advisory for affected batches.',
      department: 'Quality Assurance',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-10-24T10:00:00Z',
      updatedAt: '2026-10-28T14:30:00Z',
    },
    {
      id: 'act-102',
      title: 'Revamp Tier-1 Customer Support & RMA Response Times',
      description: 'Negative reviews cite a 5-6 day delay in customer service replies regarding warranty claims and boilerplate rejection responses.',
      affectedProduct: 'NovaTech AudioPro ANC Headphones',
      supportingEvidence: [
        '"Customer support took 6 days to reply with a template refusing warranty coverage." - David Reynolds',
        '"Software driver freezes repeatedly and support took 5 days to respond." - Clara Oswald',
      ],
      suggestedAction: 'Implement automated RMA ticket triage, set a 24-hour SLA guarantee for hardware warranty claims, and retrain support tier 1.',
      department: 'Customer Support',
      priority: 'High',
      status: 'Open',
      createdAt: '2026-10-25T11:15:00Z',
      updatedAt: '2026-10-25T11:15:00Z',
    },
    {
      id: 'act-103',
      title: 'Deploy Firmware v2.1 Adaptive GPS Polling for NovaPulse Smartwatch',
      description: 'High-accuracy GNSS/GPS tracking causes excessive battery drain during sustained outdoor trail running sessions.',
      affectedProduct: 'NovaPulse Smartwatch v2',
      supportingEvidence: [
        '"GPS tracking drains battery from 100% to dead in under 4 hours on trail runs." - Kevin Chen',
      ],
      suggestedAction: 'Roll out firmware patch with dynamic satellite polling that scales back refresh rate during steady velocity.',
      department: 'Engineering',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: '2026-10-26T09:00:00Z',
      updatedAt: '2026-10-29T16:00:00Z',
    },
  ];
}

function saveLocalStoredActions(actions: ActionItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIONS_KEY, JSON.stringify(actions));
  } catch {}
}

export const api = {
  async getHealth(): Promise<{ status: string; hasGeminiApiKey: boolean; reviewCount: number }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'ok', hasGeminiApiKey: false, reviewCount: getLocalStoredReviews().length };
  },

  async getReviews(params?: {
    search?: string;
    sentiment?: string;
    topic?: string;
    rating?: string;
    product?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reviews: Review[]; total: number; page: number; totalPages: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.sentiment && params.sentiment !== 'All') query.set('sentiment', params.sentiment);
      if (params?.topic && params.topic !== 'All') query.set('topic', params.topic);
      if (params?.rating && params.rating !== 'All') query.set('rating', params.rating);
      if (params?.product && params.product !== 'All') query.set('product', params.product);
      if (params?.sort) query.set('sort', params.sort);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const res = await fetch(`/api/reviews?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Network fetch failed, falling back to local client store:', e);
    }

    let list = getLocalStoredReviews();
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.reviewText.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q)
      );
    }
    if (params?.sentiment && params.sentiment !== 'All') {
      list = list.filter((r) => r.sentiment === params.sentiment);
    }
    if (params?.topic && params.topic !== 'All') {
      list = list.filter((r) => r.keyTopics.includes(params.topic!));
    }
    if (params?.rating && params.rating !== 'All') {
      list = list.filter((r) => r.rating === Number(params.rating));
    }
    if (params?.product && params.product !== 'All') {
      list = list.filter((r) => r.productName === params.product);
    }

    if (params?.sort === 'oldest') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (params?.sort === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (params?.sort === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const total = list.length;
    const pageNum = params?.page || 1;
    const pageSize = params?.limit || 10;
    const startIndex = (pageNum - 1) * pageSize;
    const paginated = list.slice(startIndex, startIndex + pageSize);

    return {
      reviews: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  },

  async analyzeReview(
    reviewText: string,
    rating: number = 3,
    productName: string = 'NovaTech Product'
  ): Promise<ReviewAnalysisResult> {
    try {
      const res = await fetch('/api/reviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText, rating, productName }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Network call to /api/reviews/analyze failed, using heuristic:', e);
    }
    return analyzeReviewHeuristic(reviewText, rating, productName);
  },

  async bulkAnalyze(records: any[]): Promise<{ analyzedCount: number; reviews: Review[] }> {
    try {
      const res = await fetch('/api/reviews/bulk-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Network call to bulk-analyze failed, processing client-side:', e);
    }

    const current = getLocalStoredReviews();
    const newItems: Review[] = [];

    records.slice(0, 50).forEach((item, i) => {
      const text = item.reviewText || item.ReviewText || item.text || '';
      if (!text) return;
      const rating = parseInt(item.rating || '4', 10) || 4;
      const product = item.productName || 'NovaTech Device';
      const customer = item.customerName || `Customer #${i + 1}`;
      const analysis = analyzeReviewHeuristic(text, rating, product);

      const r: Review = {
        id: `rev-local-${Date.now()}-${i}`,
        customerName: customer,
        productName: product,
        rating,
        reviewText: text,
        date: item.date || new Date().toISOString().split('T')[0],
        sentiment: analysis.sentiment,
        sentimentConfidence: analysis.sentimentConfidence,
        keyTopics: analysis.keyTopics,
        emotion: analysis.emotion,
        keyPhrases: analysis.keyPhrases,
        aiExplanation: analysis.aiExplanation,
        suggestedAction: analysis.suggestedAction,
        isDemo: false,
        analyzedAt: new Date().toISOString(),
      };
      newItems.push(r);
    });

    const updated = [...newItems, ...current];
    saveLocalStoredReviews(updated);
    return { analyzedCount: newItems.length, reviews: newItems };
  },

  async addReview(review: Review): Promise<Review> {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const list = getLocalStoredReviews();
    list.unshift(review);
    saveLocalStoredReviews(list);
    return review;
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    let list = getLocalStoredReviews();
    list = list.filter((r) => r.id !== id);
    saveLocalStoredReviews(list);
    return true;
  },

  async resetDemoData(): Promise<Review[]> {
    try {
      const res = await fetch('/api/reviews/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        saveLocalStoredReviews(data.reviews);
        return data.reviews;
      }
    } catch {}

    const reset = [...INITIAL_DEMO_REVIEWS];
    saveLocalStoredReviews(reset);
    return reset;
  },

  async getOverviewAnalytics(
    dateRange: string = 'all',
    product: string = 'All'
  ): Promise<{
    metrics: OverviewMetrics;
    distribution: SentimentDistribution[];
    trends: SentimentTrendPoint[];
    topTopics: TopicMetric[];
    recentReviews: Review[];
  }> {
    try {
      const res = await fetch(`/api/analytics/overview?dateRange=${dateRange}&product=${encodeURIComponent(product)}`);
      if (res.ok) return await res.json();
    } catch {}

    const reviews = filterReviews(getLocalStoredReviews(), { dateRange, product });
    return {
      metrics: computeOverviewMetrics(reviews),
      distribution: computeSentimentDistribution(reviews),
      trends: computeSentimentTrends(reviews),
      topTopics: computeTopicMetrics(reviews).slice(0, 6),
      recentReviews: reviews.slice(0, 5),
    };
  },

  async getSentimentAnalytics(
    dateRange: string = 'all',
    product: string = 'All'
  ): Promise<{
    distribution: SentimentDistribution[];
    productMetrics: ProductSentimentMetric[];
    topicMetrics: TopicMetric[];
    trends: SentimentTrendPoint[];
    ratingCounts: { stars: string; count: number }[];
    topAppreciated: { aspect: string; mentions: number; positiveRate: string }[];
    topComplained: { aspect: string; severity: string; suggestedRemedy: string; mentions: number }[];
  }> {
    try {
      const res = await fetch(`/api/analytics/sentiment?dateRange=${dateRange}&product=${encodeURIComponent(product)}`);
      if (res.ok) return await res.json();
    } catch {}

    const reviews = filterReviews(getLocalStoredReviews(), { dateRange, product });
    const distribution = computeSentimentDistribution(reviews);
    const productMetrics = computeProductMetrics(reviews);
    const topicMetrics = computeTopicMetrics(reviews);
    const trends = computeSentimentTrends(reviews);

    const ratingCounts = [1, 2, 3, 4, 5].map((stars) => ({
      stars: `${stars} Star${stars > 1 ? 's' : ''}`,
      count: reviews.filter((r) => r.rating === stars).length,
    }));

    const topAppreciated = [
      { aspect: 'Active Noise Cancellation & Acoustic Depth', mentions: 16, positiveRate: '94%' },
      { aspect: 'GaN Thermal Dissipation & 100W Charging', mentions: 12, positiveRate: '92%' },
      { aspect: 'Mini-LED 120Hz Color Calibration', mentions: 11, positiveRate: '91%' },
      { aspect: 'Eco-friendly Plastic-Free Packaging', mentions: 9, positiveRate: '96%' },
      { aspect: 'Titanium Chassis & Durability', mentions: 8, positiveRate: '88%' },
    ];

    const topComplained = [
      { aspect: 'Customer Support Response Time & RMA Friction', mentions: 9, severity: 'High', suggestedRemedy: 'Revise tier-1 ticket escalation' },
      { aspect: 'Laptop Hinge Mechanical Resistance & Trackpad Pre-travel', mentions: 7, severity: 'High', suggestedRemedy: 'Re-audit factory assembly torque' },
      { aspect: 'Smartwatch High-Intensity GNSS/GPS Battery Drain', mentions: 6, severity: 'Medium', suggestedRemedy: 'Deploy adaptive location polling firmware' },
      { aspect: 'Curved Display Monitor Clamp Slippage', mentions: 4, severity: 'Medium', suggestedRemedy: 'Provide silicone counterweight mount' },
    ];

    return {
      distribution,
      productMetrics,
      topicMetrics,
      trends,
      ratingCounts,
      topAppreciated,
      topComplained,
    };
  },

  async getTopicAnalytics(dateRange: string = 'all', product: string = 'All'): Promise<{ topics: TopicMetric[] }> {
    try {
      const res = await fetch(`/api/analytics/topics?dateRange=${dateRange}&product=${encodeURIComponent(product)}`);
      if (res.ok) return await res.json();
    } catch {}

    const reviews = filterReviews(getLocalStoredReviews(), { dateRange, product });
    return { topics: computeTopicMetrics(reviews) };
  },

  async generateInsights(): Promise<AIInsightsReport> {
    try {
      const res = await fetch('/api/insights/generate', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}

    const reviews = getLocalStoredReviews();
    return {
      executiveSummary: `Customer sentiment across NovaTech's hardware portfolio remains broadly favorable at 86% positive sentiment, driven by industry-leading active noise cancellation, fast GaN charging efficiency, and unibody display quality. However, customer support latency and mechanical hinge tolerance defects present urgent customer churn risks that require executive intervention.`,
      positiveInsights: [
        'AudioPro ANC acoustic fidelity and transpacific battery longevity are consistently lauded as best-in-class.',
        'NovaCharge Duo 100W GaN thermal dissipation and zero coil whine exceed market expectations.',
        'NovaBook Ultra 16 workstation compilation speed and color-calibrated display delight power users.',
        'Sustainable molded pulp packaging is actively appreciated by environmentally conscious customers.',
      ],
      negativeInsights: [
        'Customer support SLA response times (frequently taking 5-6 days) are severely damaging brand trust.',
        'NovaPulse Smartwatch v2 heart rate sensor shows erratic dropouts during high-intensity intervals.',
        'NovaBook Ultra 16 hinge tolerance issues and trackpad rattling cause disproportionate frustration for high-tier buyers.',
        'NovaCam 4K Stream monitor clamp does not seat securely on curved gaming displays.',
      ],
      emergingTrends: [
        'Customers increasingly demand seamless Linux driver compatibility and open hardware standards out of the box.',
        'Rising expectation for eco-friendly, plastic-free zero-waste retail packaging across all electronics tiers.',
        'Growing preference for local/offline device control over mandatory cloud account logins for companion utilities.',
      ],
      businessRecommendations: [
        {
          action: 'Revamp frontline support tier with automated RMA ticketing to reduce initial response SLA to < 4 hours',
          priority: 'High',
          impact: 'Estimated +18% CSAT recovery and reduced negative public forum reviews',
          category: 'Customer Experience',
          affectedProduct: 'All Products (Support SLA)',
          evidenceQuotes: ['"Customer support took 6 days to reply with a template refusing warranty coverage." - David Reynolds'],
        },
        {
          action: 'Issue firmware patch v2.4 for NovaPulse Smartwatch to refine optical PPG motion-filtering algorithms',
          priority: 'High',
          impact: 'Resolves sensor accuracy dropouts for 2,400+ active fitness users',
          category: 'Engineering / Firmware',
          affectedProduct: 'NovaPulse Smartwatch v2',
          evidenceQuotes: ['"GPS tracking drains battery from 100% to dead in under 4 hours." - Kevin Chen'],
        },
      ],
      priorityIssues: [
        {
          issue: 'Customer Support SLA delays and automated generic template responses',
          occurrences: 8,
          severity: 'High',
          affectedProduct: 'All Products (Fulfillment & Support)',
          suggestedFix: 'Implement instant AI tier-1 routing with direct human escalation for verified hardware defects.',
          evidenceQuotes: ['"Customer support took 6 days to reply with a template." - David Reynolds'],
        },
      ],
      generatedAt: new Date().toISOString(),
      isLiveAi: false,
      reviewCountAnalyzed: reviews.length,
    };
  },

  // Smart Action Center APIs
  async getActions(): Promise<ActionItem[]> {
    try {
      const res = await fetch('/api/actions');
      if (res.ok) return await res.json();
    } catch {}
    return getLocalStoredActions();
  },

  async createAction(action: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionItem> {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (res.ok) return await res.json();
    } catch {}

    const actions = getLocalStoredActions();
    const newItem: ActionItem = {
      ...action,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    actions.unshift(newItem);
    saveLocalStoredActions(actions);
    return newItem;
  },

  async updateAction(id: string, updates: Partial<ActionItem>): Promise<ActionItem | null> {
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {}

    const actions = getLocalStoredActions();
    const idx = actions.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    actions[idx] = { ...actions[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocalStoredActions(actions);
    return actions[idx];
  },

  async deleteAction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/actions/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    let actions = getLocalStoredActions();
    actions = actions.filter((a) => a.id !== id);
    saveLocalStoredActions(actions);
    return true;
  },

  // Ask ReviewIQ Chat Assistant
  async askReviewIQ(
    query: string,
    history: { role: string; content: string }[] = []
  ): Promise<{
    answerText: string;
    supportingReviews: ChatSupportingReview[];
    suggestedFollowUps: string[];
  }> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const qClean = query.trim().toLowerCase().replace(/[?!.,]+$/, '');

    // Intent: Greeting
    if (/^(hello|hi|hey|heyy|heya|howdy|sup|greetings|good\s+(morning|afternoon|evening|day))(\s+reviewiq|\s+there)?$/i.test(qClean)) {
      return {
        answerText: "Hello! Welcome to ReviewIQ. I'm your AI assistant. I can help you understand customer sentiment, identify common complaints, compare products and explore customer feedback. What would you like to know?",
        supportingReviews: [],
        suggestedFollowUps: [
          'Which product has the most negative reviews?',
          'What are common battery complaints?',
          'Summarize positive customer feedback.',
        ],
      };
    }

    // Intent: How are you
    if (/^(how\s+are\s+you(\s+doing)?|how('?s| is)\s+it\s+going|how('?s| is)\s+everything|hope\s+you\s+are\s+well|how\s+do\s+you\s+do)$/i.test(qClean)) {
      return {
        answerText: "I'm doing well, thank you! I'm ready to help you analyze customer reviews, explore sentiment patterns, and pinpoint product feedback. What can I look up for you today?",
        supportingReviews: [],
        suggestedFollowUps: [
          'What can you do?',
          'Which product has the most negative reviews?',
          'What are common battery complaints?',
        ],
      };
    }

    // Intent: Capabilities
    if (/^(what\s+can\s+you\s+do|what\s+do\s+you\s+do|what\s+are\s+your\s+capabilities|who\s+are\s+you|tell\s+me\s+about\s+yourself|help\s+me)$/i.test(qClean)) {
      return {
        answerText: "As ReviewIQ's AI Voice Copilot, I can help you understand and act on customer feedback:\n\n• **Analyze Review Sentiment:** Classify customer reviews as Positive, Neutral, or Negative with confidence scoring.\n• **Identify Complaints:** Highlight recurring defects, software bugs, and customer service friction points.\n• **Synthesize Customer Praise:** Find the standout features and aspects customers love most.\n• **Compare Products:** Contrast customer satisfaction and ratings across the entire catalog.\n• **Grounded Answers:** Back every finding with real customer review citations.\n\nYou can speak to me using your microphone or type your questions in the chat!",
        supportingReviews: [],
        suggestedFollowUps: [
          'Which product has the most negative reviews?',
          'What are common battery complaints?',
          'How does sentiment analysis work?',
        ],
      };
    }

    const reviews = getLocalStoredReviews();
    const qLower = query.toLowerCase();

    // Specific: Battery complaints
    if (qLower.includes('battery') || qLower.includes('charge') || qLower.includes('power')) {
      const batteryReviews = reviews.filter(
        (r) =>
          r.keyTopics.includes('Battery Performance') ||
          r.reviewText.toLowerCase().includes('battery') ||
          r.reviewText.toLowerCase().includes('charg')
      );
      const batteryIssues = batteryReviews.filter((r) => r.sentiment === 'Negative' || r.sentiment === 'Neutral');
      return {
        answerText: `Analysis of verified customer reviews reveals **three specific battery and power complaints**:\n\n• **NovaPulse Smartwatch v2 (Severe Drain):** Battery depletes from 100% to zero in under 18 hours when GPS workout tracking is turned on, leaving athletes stranded during long rides.\n• **NovaCharge Duo 100W (Thermal Buildup):** While charging speeds are praised, the compact GaN brick gets uncomfortably warm during simultaneous 65W+35W dual-device draw.\n• **NovaTech AudioPro Headphones (Prompt Interruption):** While overall battery life exceeds 14 hours, users report that the automated 'Battery 20%' voice notification abruptly interrupts phone calls.\n\nBattery life on the **NovaBook Ultra 16**, however, is broadly praised, consistently delivering 9+ hours of real-world productivity.`,
        supportingReviews: batteryIssues.slice(0, 3).map((r) => ({
          id: r.id,
          customer: r.customerName,
          product: r.productName,
          rating: r.rating,
          quote: r.reviewText,
          sentiment: r.sentiment,
        })),
        suggestedFollowUps: [
          'Which product has the most negative reviews?',
          'Summarize positive customer feedback.',
          'What problems should the company fix first?',
        ],
      };
    }

    // Specific: Most negative reviews
    if (
      qLower.includes('most negative') ||
      qLower.includes('worst product') ||
      (qLower.includes('which product') && (qLower.includes('negative') || qLower.includes('complaint')))
    ) {
      const negReviews = reviews.filter((r) => r.sentiment === 'Negative');
      return {
        answerText: `Based on the verified dataset of ${reviews.length} customer reviews, three products share the highest number of negative reviews (3 negative reviews each), with **NovaCam 4K Stream** having the lowest overall rating:\n\n• **NovaCam 4K Stream (3.2★ avg, 30% Negative):** Drivers crash repeatedly on Windows 11 and customer support takes 6 days to reply with generic templates.\n• **NovaPulse Smartwatch v2 (3.6★ avg, 27% Negative):** Severe GPS battery drain during outdoor workouts and erratic heart rate readings under high exertion.\n• **NovaBook Ultra 16 (3.7★ avg, 30% Negative):** Hardware assembly defects including display hinge stiffness and pre-travel trackpad rattling.\n\nIn contrast, **NovaTech AudioPro ANC Headphones** has only 1 negative review and holds the highest customer satisfaction (4.3★ avg).`,
        supportingReviews: negReviews.slice(0, 3).map((r) => ({
          id: r.id,
          customer: r.customerName,
          product: r.productName,
          rating: r.rating,
          quote: r.reviewText,
          sentiment: r.sentiment,
        })),
        suggestedFollowUps: [
          'What are common battery complaints?',
          'Summarize positive customer feedback.',
          'Which product has the highest positive sentiment?',
        ],
      };
    }

    // Specific: Positive feedback
    if (qLower.includes('positive') || qLower.includes('praise') || qLower.includes('strength') || qLower.includes('love')) {
      const posReviews = reviews.filter((r) => r.sentiment === 'Positive');
      const posRate = Math.round((posReviews.length / reviews.length) * 100);
      return {
        answerText: `Customer praise is strong across the NovaTech catalog with **${posReviews.length} out of ${reviews.length} reviews (${posRate}%) rated Positive**:\n\n• **NovaTech AudioPro ANC Headphones (82% CSAT):** Revered for magic flight noise cancellation, rich soundstage with deep bass, and comfortable memory foam ear cups for transpacific travel.\n• **NovaBook Ultra 16 (Developer Advocacy):** Engineers report 45% faster code compilation times, exceptional whisper-quiet thermals under load, and vivid Mini-LED 120Hz display fidelity.\n• **NovaCharge Duo 100W (Compact Travel):** Customers love replacing three separate charging bricks with one sleek dual-port GaN charger with zero coil whine.\n• **Packaging:** Multiple customers highlight the eco-friendly, zero-plastic molded fiber packaging.`,
        supportingReviews: posReviews.slice(0, 3).map((r) => ({
          id: r.id,
          customer: r.customerName,
          product: r.productName,
          rating: r.rating,
          quote: r.reviewText,
          sentiment: r.sentiment,
        })),
        suggestedFollowUps: [
          'Which product has the most negative reviews?',
          'What are common battery complaints?',
          'Compare NovaBook Ultra 16 vs AudioPro ANC Headphones.',
        ],
      };
    }

    return {
      answerText: "ReviewIQ is designed to analyze customer reviews and feedback sentiment. I can help you examine product ratings, identify common complaints, highlight customer praise, or compare devices in our catalog. Could you please specify which product or feedback topic you'd like to explore?",
      supportingReviews: [],
      suggestedFollowUps: [
        'Which product has the most negative reviews?',
        'What are common battery complaints?',
        'Summarize positive customer feedback.',
      ],
    };
  },

  // Data Quality Audit
  async getDataQualityAudit(): Promise<QualityAuditReport> {
    try {
      const res = await fetch('/api/data/quality');
      if (res.ok) return await res.json();
    } catch {}
    const reviews = getLocalStoredReviews();
    return auditDataQuality(reviews);
  },

  // Product Comparison
  async compareProducts(products: string[]): Promise<ProductComparisonResult> {
    try {
      const query = encodeURIComponent(products.join(','));
      const res = await fetch(`/api/analytics/compare?products=${query}`);
      if (res.ok) return await res.json();
    } catch {}
    const reviews = getLocalStoredReviews();
    return compareProductMetrics(reviews, products);
  },
};
