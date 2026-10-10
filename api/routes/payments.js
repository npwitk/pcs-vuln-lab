const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.param('orderId', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));

const FAKE_QR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC';

// VULN(V5) -- payment bypass: flip to 'paid' with no verification / no authz
// beyond being logged in. (curl/Burp exploit.)
router.post('/:orderId/mark-paid', authenticateToken, async (req, res) => {
  const row = await db.queryOne(
    "UPDATE purchases SET payment_status='paid' WHERE order_id=$1 RETURNING order_id, payment_status", [req.params.orderId]);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, ...row });
});

// Single-item create (detail page direct buy path, if used).
router.post('/create', authenticateToken, async (req, res) => {
  const { cheatsheet_id } = req.body || {};
  const sheet = await db.queryOne('SELECT price FROM cheat_sheets WHERE cheatsheet_id=$1', [cheatsheet_id]);
  if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
  let order = await db.queryOne('SELECT order_id FROM purchases WHERE user_id=$1 AND cheatsheet_id=$2', [req.user.userId, cheatsheet_id]);
  if (!order) order = await db.queryOne(
    `INSERT INTO purchases (user_id, cheatsheet_id, payment_status, payment_amount, qr_code_data)
     VALUES ($1,$2,'pending',$3,'static-qr') RETURNING order_id`, [req.user.userId, cheatsheet_id, sheet.price]);
  res.json({ purchase: { order_id: order.order_id, amount: sheet.price, qr_code: FAKE_QR },
    instructions: 'Scan the PromptPay QR to pay (manual approval in prod).' });
});
router.get('/status/:orderId', authenticateToken, async (req, res) => {
  const row = await db.queryOne('SELECT payment_status FROM purchases WHERE order_id=$1', [req.params.orderId]);
  const st = row ? row.payment_status : 'pending';
  res.json({ status: st, payment_status: st });
});
router.get('/qr/:orderId', authenticateToken, (req, res) => res.json({ qr_code: FAKE_QR, amount: 0 }));

// Bundle (cart checkout) create + status. A bundle is the set of purchases
// sharing bundle_order_id; it reads 'paid' once all its members are paid.
router.post('/create-bundle', authenticateToken, async (req, res) => {
  const { bundle_order_id } = req.body || {};
  const t = await db.queryOne('SELECT COALESCE(SUM(payment_amount),0)::float AS v FROM purchases WHERE bundle_order_id=$1 AND user_id=$2', [bundle_order_id, req.user.userId]);
  res.json({ bundle: { order_id: bundle_order_id, qr_code: FAKE_QR, amount: t ? t.v : 0 } });
});
router.get('/bundle-status/:bundleId', authenticateToken, async (req, res) => {
  const { rows } = await db.query('SELECT payment_status FROM purchases WHERE bundle_order_id=$1 AND user_id=$2', [req.params.bundleId, req.user.userId]);
  const paid = rows.length > 0 && rows.every(r => r.payment_status === 'paid');
  res.json({ status: paid ? 'paid' : 'pending', payment_status: paid ? 'paid' : 'pending' });
});

module.exports = router;
