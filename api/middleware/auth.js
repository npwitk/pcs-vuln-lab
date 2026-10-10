// ============================================================================
// VULNERABLE auth middleware (CSS484 lab).  Contrast with production PCS-Web
// server/middleware/auth.js, which is secure.
//
// VULN(V3):
//   * Hardcoded WEAK secret 'secret' (prod: process.env.JWT_SECRET, strong).
//   * Token payload carries is_admin, and we TRUST it (prod: payload is
//     { userId } only, and privileges are re-fetched live from the DB each
//     request via findUserById -- a stolen/old/forged token cannot assert role).
//   * algorithms allows 'none' as an extra footgun.
// ============================================================================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';   // VULN: weak + hardcoded fallback

function generateToken(user) {
  // VULN: baking privileges into the token.
  return jwt.sign(
    { userId: user.user_id, email: user.email, is_admin: user.is_admin, is_seller: user.is_seller },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    // VULN: weak secret + 'none' accepted + we trust whatever the payload says.
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256', 'none'] });
    req.user = decoded;          // <-- trusts is_admin straight from the token
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token', detail: e.message });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) { req.user = null; return next(); }
  try { req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256', 'none'] }); }
  catch { req.user = null; }
  next();
}

// Still present and used on SOME admin routes -- but trusts token is_admin (V3),
// and V4 is that other admin routes forget to use it at all.
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!req.user.is_admin) return res.status(403).json({ error: 'Admin only' });
  next();
}

module.exports = { generateToken, authenticateToken, optionalAuth, requireAdmin, JWT_SECRET };
