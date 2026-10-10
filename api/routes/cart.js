const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.param('cartId', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));

async function cartPayload(userId) {
  const { rows } = await db.query(
    `SELECT ci.cart_id, ci.cheatsheet_id, c.title, c.course_code, c.price, NULL AS preview_image_path
       FROM cart ci JOIN cheat_sheets c ON c.cheatsheet_id = ci.cheatsheet_id
      WHERE ci.user_id = $1 ORDER BY ci.cart_id`, [userId]);
  const subtotal = rows.reduce((s, r) => s + parseFloat(r.price || 0), 0);
  return { cart_items: rows, summary: { subtotal, discount: 0, total: subtotal, item_count: rows.length } };
}

router.get('/', authenticateToken, async (req, res) => res.json(await cartPayload(req.user.userId)));
router.get('/count', authenticateToken, async (req, res) => {
  const r = await db.queryOne('SELECT COUNT(*)::int AS n FROM cart WHERE user_id = $1', [req.user.userId]);
  res.json({ count: r.n });
});

router.post('/add', authenticateToken, async (req, res) => {
  const { cheatsheet_id } = req.body || {};
  if (!/^\d+$/.test(String(cheatsheet_id))) return res.status(400).json({ error: 'bad id' });
  const owned = await db.queryOne("SELECT 1 FROM purchases WHERE user_id=$1 AND cheatsheet_id=$2 AND payment_status='paid'", [req.user.userId, cheatsheet_id]);
  if (owned) return res.status(409).json({ message: 'Already owned' });
  const existing = await db.queryOne('SELECT cart_id FROM cart WHERE user_id=$1 AND cheatsheet_id=$2', [req.user.userId, cheatsheet_id]);
  if (existing) return res.json({ ok: true, already_in_cart: true, cart_id: existing.cart_id });
  const row = await db.queryOne('INSERT INTO cart (user_id, cheatsheet_id) VALUES ($1,$2) RETURNING cart_id', [req.user.userId, cheatsheet_id]);
  res.status(201).json({ ok: true, already_in_cart: false, cart_id: row.cart_id });
});

router.delete('/:cartId', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM cart WHERE cart_id=$1 AND user_id=$2', [req.params.cartId, req.user.userId]);
  res.json({ ok: true });
});
router.delete('/', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM cart WHERE user_id=$1', [req.user.userId]);
  res.json({ ok: true });
});

// Checkout -> create a pending "bundle" of purchases (one row per cart item),
// clear the cart. Legacy rail: stays pending until payment (or until V5 flips it).
router.post('/checkout', authenticateToken, async (req, res) => {
  const { rows: items } = await db.query(
    `SELECT ci.cheatsheet_id, c.price FROM cart ci JOIN cheat_sheets c ON c.cheatsheet_id = ci.cheatsheet_id WHERE ci.user_id = $1`,
    [req.user.userId]);
  if (!items.length) return res.status(400).json({ message: 'Cart is empty' });
  const bundle = 'B' + Date.now();
  let total = 0;
  for (const it of items) {
    total += parseFloat(it.price || 0);
    await db.query(
      `INSERT INTO purchases (user_id, cheatsheet_id, payment_status, payment_amount, qr_code_data, bundle_order_id)
       VALUES ($1,$2,'pending',$3,'static-qr',$4)
       ON CONFLICT (user_id, cheatsheet_id) DO UPDATE SET payment_status='pending', bundle_order_id=$4`,
      [req.user.userId, it.cheatsheet_id, it.price, bundle]);
  }
  await db.query('DELETE FROM cart WHERE user_id=$1', [req.user.userId]);
  res.json({ bundle_order_id: bundle, total_amount: total, fully_covered: false });
});

module.exports = router;
