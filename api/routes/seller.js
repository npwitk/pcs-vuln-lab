const express = require('express');
const db = require('../config/database');
const router = express.Router();

// GET /api/seller/payouts -> overview shape expected by MyEarnings
router.get('/payouts', async (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { rows } = await db.query(
    `SELECT p.order_id, p.payment_amount, p.created_at, c.title, c.course_code
       FROM purchases p
       JOIN cheat_sheets c ON c.cheatsheet_id = p.cheatsheet_id
      WHERE c.created_by = $1 AND p.payment_status = 'paid'
      ORDER BY p.created_at DESC`, [req.user.userId]);

  const total = rows.reduce((s, r) => s + parseFloat(r.payment_amount || 0), 0);
  const commission = total * 0.2;
  const payout = total - commission;

  const payout_date = new Date(year, month, 5).toISOString().slice(0, 10);

  res.json({
    current: {
      year, month, payout_date, status: 'estimated',
      totals: {
        collected: total, discount_covered: 0, commission,
        sponsorship: 0, payout, sales_count: rows.length, commission_percent: 20,
      },
      commission: { source: 'standard', issued_at: null },
    },
    bank: null,
    history: [],
  });
});

// GET /api/seller/payouts/:year/:month -> statement shape
router.get('/payouts/:year/:month', async (req, res) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);

  const { rows } = await db.query(
    `SELECT p.order_id, p.payment_amount, p.created_at, c.title, c.course_code
       FROM purchases p
       JOIN cheat_sheets c ON c.cheatsheet_id = p.cheatsheet_id
      WHERE c.created_by = $1 AND p.payment_status = 'paid'
        AND EXTRACT(YEAR FROM p.created_at) = $2
        AND EXTRACT(MONTH FROM p.created_at) = $3
      ORDER BY p.created_at DESC`, [req.user.userId, year, month]);

  const transactions = rows.map(r => {
    const amount = parseFloat(r.payment_amount || 0);
    const commission = amount * 0.2;
    return {
      order_id: r.order_id, date: r.created_at,
      cheat_sheet: r.title, course: r.course_code,
      amount, discount_covered: 0, commission, sponsorship: 0,
      payout: amount - commission,
    };
  });

  const collected = transactions.reduce((s, t) => s + t.amount, 0);
  const commission = transactions.reduce((s, t) => s + t.commission, 0);
  const payout = collected - commission;

  res.json({
    year, month, status: 'estimated',
    commission: { source: 'standard', issued_at: null },
    totals: {
      collected, discount_covered: 0, commission, sponsorship: 0,
      payout, sales_count: transactions.length, commission_percent: 20,
    },
    transactions,
  });
});

// GET /api/seller/cheatsheets -> list seller's own sheets
router.get('/cheatsheets', async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, u.name AS creator_name FROM cheat_sheets c
       LEFT JOIN users u ON u.user_id = c.created_by
      WHERE c.created_by = $1 ORDER BY c.cheatsheet_id DESC`, [req.user.userId]);
  res.json({ cheat_sheets: rows, total: rows.length });
});

module.exports = router;
