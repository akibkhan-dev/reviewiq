import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { reviewStore } from './server/reviewStore';
import { actionStore } from './server/actionStore';
import {
  filterReviews,
  computeOverviewMetrics,
  computeSentimentDistribution,
  computeSentimentTrends,
  computeTopicMetrics,
  computeProductMetrics,
  auditDataQuality,
  compareProductMetrics,
} from './server/analyticsService';
import {
  analyzeReviewWithGemini,
  generateAIInsightsWithGemini,
  chatWithGroundedReviews,
  isGeminiConfigured,
} from './server/geminiService';
import { Review } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // 1. Health check & AI config status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: isGeminiConfigured(),
      timestamp: new Date().toISOString(),
      reviewCount: reviewStore.getCount(),
    });
  });

  // 2. GET all reviews (with optional query filters: search, sentiment, topic, rating, product, sort)
  app.get('/api/reviews', (req, res) => {
    try {
      const { search, sentiment, topic, rating, product, sort, page = '1', limit = '10' } = req.query;
      let reviews = reviewStore.getAllReviews();

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        reviews = reviews.filter(
          (r) =>
            r.reviewText.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.productName.toLowerCase().includes(q)
        );
      }

      if (sentiment && sentiment !== 'All') {
        reviews = reviews.filter((r) => r.sentiment === sentiment);
      }

      if (topic && topic !== 'All') {
        reviews = reviews.filter((r) => r.keyTopics.includes(String(topic)));
      }

      if (rating && rating !== 'All') {
        reviews = reviews.filter((r) => r.rating === Number(rating));
      }

      if (product && product !== 'All') {
        reviews = reviews.filter((r) => r.productName === product);
      }

      // Sort
      if (sort === 'oldest') {
        reviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (sort === 'highest') {
        reviews.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'lowest') {
        reviews.sort((a, b) => a.rating - b.rating);
      } else {
        // default newest
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      const total = reviews.length;
      const pageNum = parseInt(String(page), 10) || 1;
      const pageSize = parseInt(String(limit), 10) || 10;
      const startIndex = (pageNum - 1) * pageSize;
      const paginated = reviews.slice(startIndex, startIndex + pageSize);

      res.json({
        reviews: paginated,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / pageSize) || 1,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
    }
  });

  // 3. POST /api/reviews/analyze - Analyze single review text
  app.post('/api/reviews/analyze', async (req, res) => {
    try {
      const { reviewText, rating = 3, productName = 'NovaTech Product' } = req.body;
      if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length === 0) {
        return res.status(400).json({ error: 'reviewText is required' });
      }

      const analysis = await analyzeReviewWithGemini(reviewText.trim(), Number(rating), productName);
      res.json(analysis);
    } catch (err: any) {
      console.error('Error analyzing review:', err);
      res.status(500).json({ error: err.message || 'Analysis error' });
    }
  });

  // 4. POST /api/reviews/bulk-analyze - Process array of CSV reviews
  app.post('/api/reviews/bulk-analyze', async (req, res) => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'records array is required' });
      }

      const toProcess = records.slice(0, 100);
      const results: Review[] = [];

      for (let i = 0; i < toProcess.length; i++) {
        const item = toProcess[i];
        const text = String(item.reviewText || item.ReviewText || item.text || '').trim();
        if (!text) continue;

        const customer = String(item.customerName || item.CustomerName || item.customer || `Customer #${i + 1}`);
        const product = String(item.productName || item.ProductName || item.product || 'NovaTech Device');
        const rating = Math.min(5, Math.max(1, parseInt(item.rating || item.Rating || '3', 10) || 3));
        const date = item.date || item.Date || new Date().toISOString().split('T')[0];

        const analysis = await analyzeReviewWithGemini(text, rating, product);

        const newReview: Review = {
          id: `rev-upload-${Date.now()}-${i}`,
          customerName: customer,
          productName: product,
          rating,
          reviewText: text,
          date,
          sentiment: analysis.sentiment,
          sentimentConfidence: analysis.sentimentConfidence,
          keyTopics: analysis.keyTopics,
          emotion: analysis.emotion,
          keyPhrases: analysis.keyPhrases,
          aiExplanation: analysis.aiExplanation,
          suggestedAction: analysis.suggestedAction,
          language: analysis.language,
          originalLanguageText: text,
          translatedSummary: analysis.translatedSummary,
          positiveAspects: analysis.positiveAspects,
          negativeAspects: analysis.negativeAspects,
          isDemo: false,
          analyzedAt: new Date().toISOString(),
        };

        results.push(newReview);
      }

      reviewStore.addBulkReviews(results);

      res.json({
        success: true,
        analyzedCount: results.length,
        reviews: results,
      });
    } catch (err: any) {
      console.error('Bulk analysis error:', err);
      res.status(500).json({ error: err.message || 'Bulk analysis failed' });
    }
  });

  // 5. POST /api/reviews - Add review
  app.post('/api/reviews', (req, res) => {
    try {
      const review: Review = req.body;
      if (!review.reviewText) {
        return res.status(400).json({ error: 'Review text required' });
      }
      const saved = reviewStore.addReview({
        ...review,
        id: review.id || `rev-${Date.now()}`,
        analyzedAt: review.analyzedAt || new Date().toISOString(),
      });
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. DELETE /api/reviews/:id - Delete review
  app.delete('/api/reviews/:id', (req, res) => {
    try {
      const { id } = req.params;
      const success = reviewStore.deleteReview(id);
      if (success) {
        res.json({ success: true, message: 'Review deleted' });
      } else {
        res.status(404).json({ error: 'Review not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. POST /api/reviews/reset-demo - Restore demo data
  app.post('/api/reviews/reset-demo', (req, res) => {
    try {
      const reset = reviewStore.resetToDemo();
      actionStore.reset();
      res.json({ success: true, count: reset.length, reviews: reset });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. GET /api/analytics/overview
  app.get('/api/analytics/overview', (req, res) => {
    try {
      const { dateRange = 'all', product = 'All' } = req.query;
      const allReviews = reviewStore.getAllReviews();
      const filtered = filterReviews(allReviews, {
        dateRange: String(dateRange),
        product: String(product),
      });

      const metrics = computeOverviewMetrics(filtered);
      const distribution = computeSentimentDistribution(filtered);
      const trends = computeSentimentTrends(filtered);
      const topicMetrics = computeTopicMetrics(filtered).slice(0, 6);
      const recentReviews = filtered.slice(0, 5);

      res.json({
        metrics,
        distribution,
        trends,
        topTopics: topicMetrics,
        recentReviews,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. GET /api/analytics/sentiment
  app.get('/api/analytics/sentiment', (req, res) => {
    try {
      const { dateRange = 'all', product = 'All' } = req.query;
      const allReviews = reviewStore.getAllReviews();
      const filtered = filterReviews(allReviews, {
        dateRange: String(dateRange),
        product: String(product),
      });

      const distribution = computeSentimentDistribution(filtered);
      const productMetrics = computeProductMetrics(filtered);
      const topicMetrics = computeTopicMetrics(filtered);
      const trends = computeSentimentTrends(filtered);

      const ratingCounts = [1, 2, 3, 4, 5].map((stars) => ({
        stars: `${stars} Star${stars > 1 ? 's' : ''}`,
        count: filtered.filter((r) => r.rating === stars).length,
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

      res.json({
        distribution,
        productMetrics,
        topicMetrics,
        trends,
        ratingCounts,
        topAppreciated,
        topComplained,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. GET /api/analytics/topics
  app.get('/api/analytics/topics', (req, res) => {
    try {
      const { dateRange = 'all', product = 'All' } = req.query;
      const allReviews = reviewStore.getAllReviews();
      const filtered = filterReviews(allReviews, {
        dateRange: String(dateRange),
        product: String(product),
      });

      const topicMetrics = computeTopicMetrics(filtered);
      res.json({ topics: topicMetrics });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. POST /api/insights/generate - AI executive report
  app.post('/api/insights/generate', async (req, res) => {
    try {
      const reviews = reviewStore.getAllReviews();
      const report = await generateAIInsightsWithGemini(reviews);
      res.json(report);
    } catch (err: any) {
      console.error('Insights generation error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate insights' });
    }
  });

  // 12. Smart Action Center Routes
  app.get('/api/actions', (req, res) => {
    try {
      res.json(actionStore.getAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/actions', (req, res) => {
    try {
      const { title, description, affectedProduct, supportingEvidence, suggestedAction, department, priority, status } = req.body;
      if (!title || !affectedProduct) {
        return res.status(400).json({ error: 'Title and affectedProduct required' });
      }
      const created = actionStore.add({
        title,
        description: description || '',
        affectedProduct,
        supportingEvidence: Array.isArray(supportingEvidence) ? supportingEvidence : [],
        suggestedAction: suggestedAction || '',
        department: department || 'Engineering',
        priority: priority || 'Medium',
        status: status || 'Open',
      });
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/actions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = actionStore.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Action item not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/actions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const success = actionStore.delete(id);
      if (success) {
        res.json({ success: true, message: 'Action item deleted' });
      } else {
        res.status(404).json({ error: 'Action item not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. POST /api/chat - Ask ReviewIQ Grounded AI Assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { query, history = [] } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }
      const allReviews = reviewStore.getAllReviews();
      const answer = await chatWithGroundedReviews(query, history, allReviews);
      res.json(answer);
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: err.message || 'Chat failed' });
    }
  });

  // 14. GET /api/data/quality - Data Management Quality Audit
  app.get('/api/data/quality', (req, res) => {
    try {
      const allReviews = reviewStore.getAllReviews();
      const report = auditDataQuality(allReviews);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 15. GET /api/analytics/compare - Product Comparison
  app.get('/api/analytics/compare', (req, res) => {
    try {
      const { products } = req.query;
      let productList: string[] = [];
      if (typeof products === 'string') {
        productList = products.split(',').map((p) => p.trim()).filter(Boolean);
      }
      const allReviews = reviewStore.getAllReviews();
      const comparison = compareProductMetrics(allReviews, productList);
      res.json(comparison);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mount Vite middleware in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReviewIQ Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
