const express = require('express');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Validate integer URL params -> clean 404 (not an integer-cast crash).
router.param('id', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));


// GET /api/reviews/cheatsheet/:id -> { reviews: [...] }
router.get('/cheatsheet/:id', optionalAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT r.review_id, r.rating, r.body AS comment, r.created_at, u.name AS user_name
       FROM reviews r JOIN users u ON u.user_id = r.user_id
      WHERE r.cheatsheet_id = $1 ORDER BY r.review_id DESC`, [req.params.id]);
  res.json({ reviews: rows, total: rows.length });
});

// GET /api/reviews/my-review/:id -> { review: {...}|null }
router.get('/my-review/:id', authenticateToken, async (req, res) => {
  const row = await db.queryOne(
    'SELECT review_id, rating, body AS comment FROM reviews WHERE cheatsheet_id = $1 AND user_id = $2',
    [req.params.id, req.user.userId]);
  res.json({ review: row || null });
});

// VULN(V6) -- stored XSS. Body stored verbatim; rendered UNESCAPED client-side.
// Accepts both field names: "body" (raw API / exploit scripts) and "comment" (React client).
router.post('/', authenticateToken, async (req, res) => {
  const { cheatsheet_id, rating, body, comment } = req.body || {};
  const reviewBody = body || comment || '';
  const existing = await db.queryOne('SELECT review_id FROM reviews WHERE cheatsheet_id = $1 AND user_id = $2', [cheatsheet_id, req.user.userId]);
  if (existing) {
    await db.query('UPDATE reviews SET rating = $1, body = $2 WHERE review_id = $3', [rating || 5, reviewBody, existing.review_id]);
    return res.json({ review_id: existing.review_id });
  }
  const row = await db.queryOne(
    'INSERT INTO reviews (cheatsheet_id, user_id, rating, body) VALUES ($1,$2,$3,$4) RETURNING review_id',
    [cheatsheet_id, req.user.userId, rating || 5, reviewBody]);
  res.status(201).json({ review_id: row.review_id });
});

router.delete('/:id', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM reviews WHERE review_id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
  res.json({ ok: true });
});

module.exports = router;
