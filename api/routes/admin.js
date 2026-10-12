const express = require('express');
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Validate integer URL params -> clean 404 (not an integer-cast crash).
router.param('userId', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));


// Mounted behind authenticateToken (app.js), like prod. VULN(V4): these omit
// requireAdmin -> any logged-in buyer lists users and self-grants admin.
router.get('/users', async (req, res) => {           // <-- VULN: no requireAdmin
  const { rows } = await db.query(
    'SELECT user_id, name, email, is_admin, is_seller, is_staff, is_deactivated, created_at FROM users ORDER BY user_id');
  res.json({ users: rows, total: rows.length });
});

router.patch('/users/:userId/roles', async (req, res) => {   // <-- VULN: no requireAdmin
  const { is_admin, is_seller, is_staff } = req.body || {};
  const row = await db.queryOne(
    `UPDATE users SET is_admin = COALESCE($2,is_admin), is_seller = COALESCE($3,is_seller),
            is_staff = COALESCE($4,is_staff) WHERE user_id = $1
      RETURNING user_id, name, email, is_admin, is_seller, is_staff`,
    [req.params.userId, is_admin, is_seller, is_staff]);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json(row);
});

// Correctly gated (contrast for the demo / remediation).
router.get('/stats', requireAdmin, async (req, res) => {
  const u = await db.queryOne('SELECT COUNT(*)::int AS n FROM users');
  const s = await db.queryOne("SELECT COUNT(*)::int AS n FROM purchases WHERE payment_status='paid'");
  const rev = await db.queryOne("SELECT COALESCE(SUM(payment_amount),0)::float AS v FROM purchases WHERE payment_status='paid'");
  res.json({ total_users: u.n, total_sales: s.n, total_revenue: rev.v, users: u.n, paid_orders: s.n });
});

router.get('/settings', requireAdmin, async (req, res) => {
  const { rows } = await db.query('SELECT key, value FROM site_settings');
  const out = {}; rows.forEach(r => out[r.key] = r.value); res.json(out);
});
router.patch('/settings', requireAdmin, async (req, res) => {
  const updates = req.body || {};
  await Promise.all(Object.entries(updates).map(([key, val]) =>
    db.query(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()`,
      [key, JSON.stringify(val)]
    )
  ));
  res.json({ ok: true });
});
router.get('/purchases', requireAdmin, async (req, res) => {
  const { rows } = await db.query('SELECT order_id, user_id, cheatsheet_id, payment_status, payment_amount, created_at FROM purchases ORDER BY order_id DESC');
  res.json({ purchases: rows, total: rows.length });
});

router.post('/payments/:orderId/approve', requireAdmin, async (req, res) => {
  const row = await db.queryOne(
    "UPDATE purchases SET payment_status='paid' WHERE order_id=$1 RETURNING order_id, payment_status",
    [req.params.orderId]);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, ...row });
});

router.post('/payments/:orderId/reject', requireAdmin, async (req, res) => {
  const row = await db.queryOne(
    "UPDATE purchases SET payment_status='rejected' WHERE order_id=$1 RETURNING order_id, payment_status",
    [req.params.orderId]);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, ...row });
});

router.post('/payments/bundles/:bundleId/approve', requireAdmin, async (req, res) => {
  await db.query(
    "UPDATE purchases SET payment_status='paid' WHERE bundle_order_id=$1",
    [req.params.bundleId]);
  res.json({ ok: true });
});

router.post('/payments/bundles/:bundleId/reject', requireAdmin, async (req, res) => {
  await db.query(
    "UPDATE purchases SET payment_status='rejected' WHERE bundle_order_id=$1",
    [req.params.bundleId]);
  res.json({ ok: true });
});

router.get('/payments/pending', requireAdmin, async (req, res) => {
  const { rows } = await db.query(`
    SELECT p.order_id, p.bundle_order_id, p.payment_amount, p.payment_amount AS original_price,
           p.created_at AS purchase_date, false AS is_stripe, NULL AS discount_code,
           u.name AS user_name, u.email AS user_email, NULL AS user_avatar,
           c.title, c.course_code
      FROM purchases p
      JOIN users u ON u.user_id = p.user_id
      JOIN cheat_sheets c ON c.cheatsheet_id = p.cheatsheet_id
     WHERE p.payment_status = 'pending'
     ORDER BY p.created_at DESC`);
  res.json({ payments: rows, total: rows.length });
});

module.exports = router;
