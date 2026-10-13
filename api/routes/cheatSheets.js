const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Validate integer URL params -> clean 404 (not an integer-cast crash).
router.param('id', (req, res, next, v) => /^\d+$/.test(v) ? next() : res.status(404).json({ error: 'Not found' }));


function cardFields(r, statusMap) {
  const st = statusMap[r.cheatsheet_id] || null;
  const now = Date.now();
  const releaseAt = r.release_at ? new Date(r.release_at) : null;
  return {
    cheatsheet_id: r.cheatsheet_id, title: r.title, description: r.description,
    course_code: r.course_code, price: r.price, preview_text: r.preview_text,
    preview_image_path: r.preview_image_path || null,
    purchase_count: r.purchase_count, view_count: r.view_count,
    created_at: r.created_at, creator_name: r.creator_name, creator_avatar: null,
    collaborators: [],
    // Institution (joined in the list/detail queries).
    institution_name: r.institution_name || null,
    institution_short_name: r.institution_short_name || null,
    institution_logo_filename: r.institution_logo_filename || null,
    institution_restricted: !!r.institution_restricted,
    // Exam metadata the card/detail render.
    exam_type: r.exam_type || null,
    exam_types: r.exam_types || (r.exam_type ? [r.exam_type] : []),
    semester: r.semester || null, academic_year: r.academic_year || null,
    year_level: r.year_level || null, page_count: r.page_count || null,
    file_size_mb: r.file_size_mb || null,
    is_sponsored: !!r.is_sponsored,
    is_pre_order: !!(releaseAt && releaseAt.getTime() > now),
    release_at: r.release_at || null,
    average_rating: r.average_rating != null ? Number(r.average_rating) : 0,
    avg_rating: r.average_rating != null ? Number(r.average_rating) : null,
    review_count: r.review_count != null ? Number(r.review_count) : 0,
    is_purchased: st === 'paid',
    purchase_status: st,
    in_library: st === 'paid',
  };
}

// Shared SELECT: cheat sheet + creator name + institution + review aggregates.
const SHEET_SELECT = `
  SELECT c.*, u.name AS creator_name,
         i.name AS institution_name, i.short_name AS institution_short_name,
         i.logo_filename AS institution_logo_filename,
         (SELECT ROUND(AVG(rating), 1) FROM reviews rv WHERE rv.cheatsheet_id = c.cheatsheet_id) AS average_rating,
         (SELECT COUNT(*) FROM reviews rv WHERE rv.cheatsheet_id = c.cheatsheet_id) AS review_count
    FROM cheat_sheets c
    LEFT JOIN users u ON u.user_id = c.created_by
    LEFT JOIN institutions i ON i.institution_id = c.institution_id`;

// POST /api/cheatsheets/upload-url -> { uploadUrl, objectPath }
router.post('/upload-url', authenticateToken, (req, res) => {
  const { course_code } = req.body || {};
  const filename = `${(course_code || 'sheet').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
  res.json({
    uploadUrl: `http://localhost:4000/api/cheatsheets/upload-file/${filename}`,
    objectPath: `local/${filename}`,
  });
});

// PUT /api/cheatsheets/upload-file/:filename -> receives raw PDF, saves to uploads/
router.put('/upload-file/:filename',
  express.raw({ type: '*/*', limit: '50mb' }),
  (req, res) => {
    const filename = path.basename(req.params.filename);
    fs.writeFile(path.join(UPLOADS_DIR, filename), req.body, (err) => {
      if (err) return res.status(500).json({ error: 'Write failed', detail: err.message });
      res.json({ ok: true });
    });
  }
);

// POST /api/cheatsheets -> save metadata, return new cheat_sheet row
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, course_code, price, pdf_object_path } = req.body || {};
  const filename = (pdf_object_path || '').replace('local/', '');
  const file_path = filename ? `uploads/${filename}` : 'uploads/placeholder.pdf';
  const row = await db.queryOne(
    `INSERT INTO cheat_sheets (title, description, course_code, price, file_path, preview_text, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING cheatsheet_id, title, description, course_code, price, file_path, created_at`,
    [title || '', description || '', course_code || '', parseFloat(price) || 0,
     file_path, (description || '').slice(0, 200), req.user.userId]
  );
  res.status(201).json({ cheat_sheet: { ...row, exam_types: [], supplementary_files: [] } });
});

// GET /api/cheatsheets  -> { cheat_sheets: [...], total }
router.get('/', optionalAuth, async (req, res) => {
  const { rows } = await db.query(
    `${SHEET_SELECT} WHERE c.is_active = TRUE ORDER BY c.cheatsheet_id`);
  const statusMap = {};
  if (req.user) {
    const r = await db.query('SELECT cheatsheet_id, payment_status FROM purchases WHERE user_id = $1', [req.user.userId]);
    r.rows.forEach(x => { statusMap[x.cheatsheet_id] = x.payment_status; });
  }
  res.json({ cheat_sheets: rows.map(r => cardFields(r, statusMap)), total: rows.length });
});

// GET /api/cheatsheets/:id -> { cheat_sheet: {...} }
router.get('/:id', optionalAuth, async (req, res) => {
  const r = await db.queryOne(`${SHEET_SELECT} WHERE c.cheatsheet_id = $1`, [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const statusMap = {};
  if (req.user) {
    const p = await db.query('SELECT cheatsheet_id, payment_status FROM purchases WHERE user_id = $1', [req.user.userId]);
    p.rows.forEach(x => { statusMap[x.cheatsheet_id] = x.payment_status; });
  }
  res.json({ cheat_sheet: { ...cardFields(r, statusMap), youtube_links: r.youtube_links || [], supplementary_files: [] } });
});

module.exports = router;
