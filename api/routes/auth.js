const express = require('express');
const db = require('../config/database');
const { generateToken, optionalAuth } = require('../middleware/auth');
const router = express.Router();

function publicUser(u) {
  return {
    user_id: u.user_id, name: u.name, email: u.email,
    is_admin: u.is_admin, is_seller: u.is_seller, is_staff: u.is_staff,
    institution_id: null, institution_short_name: null, university_group: null,
    year_level: u.year_level || null, picture: null, avatar_url: null,
    study_profile_due: false, study_tag_ids: [],
  };
}

// VULN(V1) -- SQL INJECTION in local login (string-concatenated query).
//   Bypass:  email = x' OR '1'='1' --
//   Dump:    email = x' UNION SELECT 1,label,secret,secret,null,true,false,false,now() FROM admin_secrets --
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const sql = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "'";
  console.log('[VULN-SQL]', sql);
  try {
    const { rows } = await db.query(sql);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    return res.json({ token: generateToken(user), user: publicUser(user), rows });
  } catch (e) {
    return res.status(500).json({ error: 'Query failed', sql, detail: e.message }); // verbose
  }
});

// Current user -- client calls GET /auth/me and expects { user }.
router.get('/me', optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const u = await db.findUserById(req.user.userId);
  if (!u) return res.status(401).json({ error: 'User not found' });
  res.json({ user: publicUser(u) });
});

router.post('/logout', (req, res) => res.json({ ok: true }));
router.patch('/year-level', optionalAuth, (req, res) => res.json({ ok: true }));
router.patch('/social', optionalAuth, (req, res) => res.json({ ok: true }));

// Convenience dev-login (NOT production-fenced here).
router.get('/dev-login', async (req, res) => {
  const map = { admin:'admin@dev.peanut.local', seller:'seller@dev.peanut.local',
    alice:'alice@dev.peanut.local', bob:'bob@dev.peanut.local', carol:'carol@dev.peanut.local' };
  const user = await db.queryOne('SELECT * FROM users WHERE email = $1', [map[req.query.as] || map.alice]);
  res.json({ token: generateToken(user), user: publicUser(user) });
});

module.exports = router;
