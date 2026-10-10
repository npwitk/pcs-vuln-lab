const express = require('express');
const db = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Validate integer URL params -> clean 404 (not an integer-cast crash).
router.param('id', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));


function cardFields(r, statusMap) {
  const st = statusMap[r.cheatsheet_id] || null;
  return {
    cheatsheet_id: r.cheatsheet_id, title: r.title, description: r.description,
    course_code: r.course_code, price: r.price, preview_text: r.preview_text,
    preview_image_path: null, purchase_count: r.purchase_count, view_count: r.view_count,
    created_at: r.created_at, creator_name: r.creator_name, creator_avatar: null,
    collaborators: [], institution_name: null, institution_short_name: null,
    institution_logo_filename: null, institution_restricted: false,
    is_pre_order: false, is_sponsored: false, release_at: null,
    avg_rating: null, review_count: 0, file_size_mb: null,
    is_purchased: st === 'paid',
    purchase_status: st,
    in_library: st === 'paid',
  };
}

// GET /api/cheatsheets  -> { cheat_sheets: [...], total }
router.get('/', optionalAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, u.name AS creator_name FROM cheat_sheets c
       LEFT JOIN users u ON u.user_id = c.created_by
      WHERE c.is_active = TRUE ORDER BY c.cheatsheet_id`);
  const statusMap = {};
  if (req.user) {
    const r = await db.query('SELECT cheatsheet_id, payment_status FROM purchases WHERE user_id = $1', [req.user.userId]);
    r.rows.forEach(x => { statusMap[x.cheatsheet_id] = x.payment_status; });
  }
  res.json({ cheat_sheets: rows.map(r => cardFields(r, statusMap)), total: rows.length });
});

// GET /api/cheatsheets/:id -> { cheat_sheet: {...} }
router.get('/:id', optionalAuth, async (req, res) => {
  const r = await db.queryOne(
    `SELECT c.*, u.name AS creator_name FROM cheat_sheets c
       LEFT JOIN users u ON u.user_id = c.created_by WHERE c.cheatsheet_id = $1`, [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const statusMap = {};
  if (req.user) {
    const p = await db.query('SELECT cheatsheet_id, payment_status FROM purchases WHERE user_id = $1', [req.user.userId]);
    p.rows.forEach(x => { statusMap[x.cheatsheet_id] = x.payment_status; });
  }
  res.json({ cheat_sheet: { ...cardFields(r, statusMap), exam_types: [], supplementary_files: [] } });
});

module.exports = router;
