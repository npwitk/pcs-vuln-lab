const express = require('express');
const db = require('../config/database');
const router = express.Router();

const codes = new Map(); // code -> { orderId, userId, expiresAt }

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// POST /api/download-transfer/:orderId/generate
router.post('/:orderId/generate', async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) return res.status(404).json({ error: 'Not found' });

  const row = await db.queryOne(
    "SELECT order_id FROM purchases WHERE order_id=$1 AND user_id=$2 AND payment_status='paid'",
    [orderId, req.user.userId]);
  if (!row) return res.status(403).json({ error: 'Order not found or not paid' });

  const code = randomCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  codes.set(code, { orderId, userId: req.user.userId, expiresAt });
  res.json({ code, expires_at: expiresAt.toISOString() });
});

// GET /api/download-transfer/:code
router.get('/:code', (req, res) => {
  const entry = codes.get(req.params.code.toUpperCase());
  if (!entry || entry.expiresAt < new Date()) return res.status(404).json({ error: 'Invalid or expired code' });
  res.json({ order_id: entry.orderId, expires_at: entry.expiresAt });
});

// POST /api/download-transfer/:code/download
router.post('/:code/download', async (req, res) => {
  const entry = codes.get(req.params.code.toUpperCase());
  if (!entry || entry.expiresAt < new Date()) return res.status(404).json({ error: 'Invalid or expired code' });
  codes.delete(req.params.code.toUpperCase());
  res.json({ ok: true, order_id: entry.orderId });
});

module.exports = router;
