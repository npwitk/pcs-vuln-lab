const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const { authenticateToken, optionalAuth } = require('./middleware/auth');

const app = express();
// VULN(misconfig): no Helmet; wide-open CORS reflecting any origin w/ credentials.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.get('/health', async (req, res) => {
  try { await db.query('SELECT 1'); res.json({ status: 'ok', service: 'peanut-dev-api', db: 'up' }); }
  catch (e) { res.status(500).json({ status: 'degraded', detail: e.message }); }
});

// VULN(info disclosure): leftover debug endpoint -> stack, env, weak JWT secret.
app.get('/debug', (req, res) => res.json({
  app: 'Peanut Cheat Sheets', environment: 'development / staging',
  host: 'dev.peanutcheatsheets.local', node: process.version,
  stack: ['express', 'pg', 'jsonwebtoken', 'react'], jwt_alg: 'HS256',
  hint: 'local login at POST /api/auth/login; admin console at /admin', env: process.env }));

// Auth mounted at BOTH /auth and /api/auth (client uses /auth/me, /auth/logout).
app.use('/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/auth'));

app.use('/api/cheatsheets', require('./routes/cheatSheets'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', authenticateToken, require('./routes/admin'));  // V4 inside
app.use('/api/cart', require('./routes/cart'));

app.use('/api/download-transfer', authenticateToken, require('./routes/downloadTransfer'));
app.use('/api/seller', authenticateToken, require('./routes/seller'));

// --- Seller summary / payroll stubs ---
app.get('/api/admin/seller-summary', authenticateToken, (req, res) => res.json({
  sellers: [], summary: { total_sellers: 0, total_sales: 0, total_revenue: 0 },
}));
app.get('/api/admin/seller-summary/:sellerId/transactions', authenticateToken, (req, res) => res.json({ transactions: [], summary: { total: 0, commission: 0, payout: 0 } }));
app.post('/api/admin/seller-summary/:sellerId/generate-pdf', authenticateToken, (req, res) => res.json({ ok: true, url: null }));
app.patch('/api/admin/sellers/:sellerId/commission', authenticateToken, (req, res) => res.json({ ok: true }));
app.get('/api/admin/sellers/:sellerId/bank', authenticateToken, (req, res) => res.json({ bank: null }));
app.put('/api/admin/sellers/:sellerId/bank', authenticateToken, (req, res) => res.json({ ok: true }));
app.get('/api/admin/payroll', authenticateToken, (req, res) => res.json({ payrolls: [] }));
app.post('/api/admin/payroll/generate', authenticateToken, (req, res) => res.json({ ok: true, token: null, url: null }));
app.post('/api/admin/payroll/send-email', authenticateToken, (req, res) => res.json({ ok: true }));

// --- Mobile app stats stub ---
app.get('/api/admin/stats/mobile-app', authenticateToken, (req, res) => res.json({
  users: { total: 0, new_30d: 0, active_7d: 0, active_30d: 0, push_enabled: 0 },
  revenue: { net: 0, gross: 0, topups: 0, buyers: 0, refunded: 0, refunds: 0, months: [], packs: [] },
  coins: { spent: 0, sheets: 0, held: 0 },
  recent_users: [],
}));

// --- Stores / flagship stubs ---
app.get('/api/stores/requests/admin/all', authenticateToken, (req, res) => res.json({ requests: [], total: 0 }));
app.get('/api/stores/admin/all', authenticateToken, (req, res) => res.json({ stores: [], total: 0 }));
app.get('/api/stores/admin/eligible-users', authenticateToken, (req, res) => res.json({ users: [] }));
app.get('/api/stores/requests/my', authenticateToken, (req, res) => res.status(404).json({ error: 'Not found' }));
app.get('/api/stores/mine', authenticateToken, (req, res) => res.status(404).json({ error: 'Not found' }));
app.post('/api/stores/requests', authenticateToken, (req, res) => res.json({ ok: true }));
app.post('/api/stores/admin/create', authenticateToken, (req, res) => res.json({ ok: true }));

// --- Benign stubs so the heavy real client boots without crashing ---
app.get('/api/institutions', (req, res) => res.json({ institutions: [] }));
app.get('/api/settings', (req, res) => res.json({ announcement: null, stripe_payments_enabled: false }));
app.get('/api/notifications', optionalAuth, (req, res) => res.json({ notifications: [], unread: 0 }));
app.get('/api/support/tickets', optionalAuth, (req, res) => res.json({ tickets: [] }));
app.get('/api/study-tags', (req, res) => res.json({ tags: [] }));
app.get('/api/upcoming-exams', (req, res) => res.json({ exams: [] }));
app.get('/api/courses/suggest', (req, res) => res.json({ courses: [] }));
app.post('/api/analytics/track', (req, res) => res.json({ ok: true }));

// Generic fallback: never 500 the SPA on an unimplemented GET. Return a shape
// that is safe to read and safe to .map/.forEach over.
app.all('/api/*', (req, res) => {
  if (req.method === 'GET') return res.json({ items: [], data: [], results: [], reviews: [], purchases: [], users: [], total: 0 });
  res.json({ ok: true });
});

app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message, stack: err.stack })); // verbose

module.exports = app;
