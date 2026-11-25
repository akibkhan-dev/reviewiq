import { ReviewAnalysisResult, SentimentType } from '../src/types';

const POSITIVE_WORDS = new Set([
  'magic', 'amazing', 'great', 'excellent', 'fantastic', 'superb', 'best', 'sublime',
  'whisper quiet', 'rapidly', 'luxury', 'seamless', 'extraordinarily', 'crisp',
  'durable', 'flawless', 'sturdy', 'blew me away', 'clean', 'pillows', 'spot on',
  'delighted', 'pleasant', 'slick', 'instantaneous', 'intuitive', 'peace of mind',
  'stunning', 'unbelievable', 'punchy', 'smooth', 'immense', 'love', 'recommend',
  'brilliant', 'wonderful', 'stellar', 'masterpiece', 'fast', 'dependable', 'solid',
  'achha', 'badhiya', 'badiya', 'shandar', 'zabardast', 'paisa vasool', 'mast'
]);

const NEGATIVE_WORDS = new Set([
  'erratic', 'frustrated', 'dropping', 'premium price tag', 'crashes', 'useless',
  'rattle', 'crushed', 'slow', 'cracked', 'broke', 'brittle', 'slipping',
  'detached', 'poor', 'agonizing', 'arguing', 'error', 'drain', 'seized',
  'abuse', 'unacceptable', 'terrible', 'horrible', 'waste', 'faulty', 'defective',
  'annoyance', 'complaint', 'refused', 'steep', 'friction', 'fails', 'worst',
  'bekar', 'kharab', 'ghatiya', 'pareshan', 'dikkat', 'dhokha', 'mat lo'
]);

const TOPIC_PATTERNS: { [topic: string]: RegExp } = {
  'Battery Performance': /\b(battery|charging|charger|hours|drain|wattage|power|standby|mah|life|backup)\b/i,
  'Product Quality': /\b(quality|build|materials|finish|chassis|hinge|screen|display|durability|broke|cracked|sturdy|plastic|aluminum|titanium|sapphire)\b/i,
  'Pricing': /\b(price|pricing|cost|worth|expensive|cheap|bracket|dollars|money|sale|value|penny|paisa|mehnga)\b/i,
  'Delivery': /\b(delivery|shipping|arrived|transit|tracking|carrier|fulfillment|package|courier|box)\b/i,
  'Customer Support': /\b(support|service|warranty|rma|representative|agent|ticket|email|help|refund|response|call)\b/i,
  'Packaging': /\b(packaging|box|unboxing|wrapped|pulp|carton|pouch|case)\b/i,
  'User Experience': /\b(app|ui|ux|comfort|fit|ear|cushions|setup|pairing|interface|ergonomic|friction|feel|haptic|buttons)\b/i,
  'Performance': /\b(performance|speed|lag|latency|crash|framing|sensor|audio|sound|noise cancellation|anc|4k|fps|heat|thermal|warm|fast|slow)\b/i,
};

export function detectLanguage(text: string): { language: string; isHindi: boolean } {
  // Check for Devanagari script: \u0900-\u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    return { language: 'Hindi (हिंदी)', isHindi: true };
  }

  // Check for Romanized Hindi / Hinglish keywords
  const hinglishKeywords = /\b(bohot|bahut|achha|accha|badiya|badhiya|kharab|bekar|ghatiya|paisa|vasool|shandar|zabardast|dikkat|chal|raha|nahi|hai|kripya)\b/i;
  if (hinglishKeywords.test(text)) {
    return { language: 'Hindi (Hinglish)', isHindi: true };
  }

  return { language: 'English', isHindi: false };
}

export function analyzeReviewHeuristic(
  reviewText: string,
  rating: number = 3,
  productName: string = 'NovaTech Product'
): ReviewAnalysisResult {
  const { language, isHindi } = detectLanguage(reviewText);
  const lower = reviewText.toLowerCase();

  let posCount = 0;
  let negCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) posCount++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negCount++;
  }

  // Sentiment calculation with rating weight
  let sentiment: SentimentType = 'Neutral';
  let confidence = 75;

  if (rating >= 4 || posCount > negCount + 1) {
    sentiment = 'Positive';
    confidence = Math.min(98, 82 + (rating >= 4 ? 8 : 0) + posCount * 3);
  } else if (rating <= 2 || negCount > posCount + 1) {
    sentiment = 'Negative';
    confidence = Math.min(98, 84 + (rating <= 2 ? 8 : 0) + negCount * 3);
  } else {
    sentiment = 'Neutral';
    confidence = Math.max(68, 78 - Math.abs(posCount - negCount) * 3);
  }

  // Detect topics
  const topics: string[] = [];
  for (const [topic, regex] of Object.entries(TOPIC_PATTERNS)) {
    if (regex.test(reviewText)) {
      topics.push(topic);
    }
  }
  if (topics.length === 0) {
    topics.push('Product Quality');
  }

  // Emotion
  let emotion = 'neutrality';
  if (sentiment === 'Positive') {
    emotion = posCount > 2 ? 'joy' : 'satisfaction';
  } else if (sentiment === 'Negative') {
    emotion = negCount > 2 ? 'frustration' : 'disappointment';
  } else {
    emotion = 'satisfaction';
  }

  // Extract key phrases
  const sentences = reviewText.split(/[.!?।]+/).map((s) => s.trim()).filter(Boolean);
  const keyPhrases = sentences.slice(0, 3).map((s) => s.slice(0, 50));

  // Positive and negative aspects
  const positiveAspects: string[] = [];
  const negativeAspects: string[] = [];

  if (sentiment === 'Positive' || posCount > 0) {
    positiveAspects.push(topics[0] ? `Solid ${topics[0].toLowerCase()} execution` : 'Reliable product performance');
    if (posCount > 1) positiveAspects.push('Exceptional build and day-to-day usability');
  }
  if (sentiment === 'Negative' || negCount > 0) {
    negativeAspects.push(topics[0] ? `Reported friction in ${topics[0].toLowerCase()}` : 'Customer experienced friction with product');
    if (negCount > 1) negativeAspects.push('Needs prompt engineering inspection or firmware remedy');
  }

  // AI explanation & Suggested action
  let aiExplanation = '';
  let suggestedAction = '';
  let translatedSummary: string | undefined = undefined;

  if (isHindi) {
    translatedSummary = sentiment === 'Positive'
      ? `Customer praises ${productName} as a high-value purchase with dependable performance.`
      : sentiment === 'Negative'
      ? `Customer notes critical disappointment with ${productName} requiring warranty or quality inspection.`
      : `Customer gives a balanced review of ${productName} noting both merits and areas for refinement.`;
  }

  if (sentiment === 'Positive') {
    aiExplanation = `Customer shared encouraging praise highlighting ${topics.slice(0, 2).join(' and ')}. Sentiment aligns strongly with ${rating}-star customer endorsement.`;
    suggestedAction = `Showcase this positive feedback on ${productName} marketing collaterals and maintain assembly standards.`;
  } else if (sentiment === 'Negative') {
    aiExplanation = `Customer expressed critical friction regarding ${topics.slice(0, 2).join(' and ')}, indicating operational or design defects that impact customer retention.`;
    suggestedAction = `Assign ticket to the product engineering & QA team to investigate ${topics[0] || 'reported defects'} for ${productName}.`;
  } else {
    aiExplanation = `Review conveys balanced feedback with both favorable remarks and noted reservations on ${topics.slice(0, 2).join(' and ')}.`;
    suggestedAction = `Monitor recurring mentions of ${topics[0] || 'product nuances'} across subsequent reviews to identify optimization areas.`;
  }

  return {
    sentiment,
    sentimentConfidence: confidence,
    keyTopics: topics,
    emotion,
    keyPhrases,
    aiExplanation,
    suggestedAction,
    language,
    originalLanguageText: reviewText,
    translatedSummary,
    positiveAspects,
    negativeAspects,
    isAiGenerated: false,
  };
}
