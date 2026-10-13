const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Validate integer URL params -> clean 404 (not an integer-cast crash).
router.param('orderId', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));
router.param('cheatsheetId', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));

const UPLOADS = path.join(__dirname, '..', 'uploads');

// GET /api/purchases/my -> { purchases: [...] }  (correctly scoped)
router.get('/my', authenticateToken, async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.order_id, p.cheatsheet_id, p.bundle_order_id, p.payment_status, p.payment_amount,
            p.payment_amount AS original_price, p.download_count,
            p.created_at, c.title, c.course_code
       FROM purchases p JOIN cheat_sheets c ON c.cheatsheet_id = p.cheatsheet_id
      WHERE p.user_id = $1 ORDER BY p.order_id DESC`, [req.user.userId]);
  res.json({ purchases: rows });
});

// GET /api/purchases/check/:cheatsheetId -> { purchased }
router.get('/check/:cheatsheetId', authenticateToken, async (req, res) => {
  const row = await db.queryOne(
    "SELECT order_id FROM purchases WHERE user_id = $1 AND cheatsheet_id = $2 AND payment_status = 'paid'",
    [req.user.userId, req.params.cheatsheetId]);
  res.json({ purchased: !!row, order_id: row ? row.order_id : null });
});

// POST /api/purchases -> create pending order
router.post('/', authenticateToken, async (req, res) => {
  const { cheatsheet_id } = req.body || {};
  const sheet = await db.queryOne('SELECT price FROM cheat_sheets WHERE cheatsheet_id = $1', [cheatsheet_id]);
  if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
  const existing = await db.queryOne('SELECT order_id, payment_status FROM purchases WHERE user_id = $1 AND cheatsheet_id = $2', [req.user.userId, cheatsheet_id]);
  if (existing) return res.json(existing);
  const row = await db.queryOne(
    `INSERT INTO purchases (user_id, cheatsheet_id, payment_status, payment_amount, qr_code_data)
     VALUES ($1,$2,'pending',$3,'static-promptpay-qr-no-reference') RETURNING order_id, payment_status`,
    [req.user.userId, cheatsheet_id, sheet.price]);
  res.status(201).json(row);
});

// VULN(V2) -- IDOR. No "AND user_id" scope: any logged-in user reads any order.
router.get('/:orderId', authenticateToken, async (req, res) => {
  const row = await db.queryOne(
    `SELECT p.*, c.title, c.file_path, u.email AS buyer_email
       FROM purchases p JOIN cheat_sheets c ON c.cheatsheet_id = p.cheatsheet_id
       JOIN users u ON u.user_id = p.user_id WHERE p.order_id = $1`, [req.params.orderId]);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  res.json(row);
});

// VULN(V2) -- IDOR download. No ownership check.
router.get('/:orderId/download', authenticateToken, async (req, res) => {
  const row = await db.queryOne(
    `SELECT p.order_id, p.payment_status, c.title, c.file_path
       FROM purchases p JOIN cheat_sheets c ON c.cheatsheet_id = p.cheatsheet_id
      WHERE p.order_id = $1`, [req.params.orderId]);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  if (row.payment_status !== 'paid') return res.status(402).json({ error: 'Not paid' });
  await db.query('INSERT INTO download_logs (order_id, user_id, download_ip, user_agent) VALUES ($1,$2,$3,$4)',
    [row.order_id, req.user.userId, req.ip, req.headers['user-agent'] || '']);
  // The exported catalogue points at (unreachable) production storage paths, so
  // fall back to the bundled mock PDF -- every sheet still downloads a real file.
  let file = path.join(UPLOADS, path.basename(row.file_path));
  if (!fs.existsSync(file)) file = path.join(UPLOADS, 'sample-cheatsheet.pdf');
  if (!fs.existsSync(file)) return res.json({ note: 'PDF placeholder', served_file: row.file_path, title: row.title });
  res.download(file, `${row.title}.pdf`);
});

module.exports = router;
