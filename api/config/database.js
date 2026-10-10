// Postgres pool helper -- same shape as production PCS-Web server/config/database.js.
// NOTE: the helper itself is fine; the vulnerability in V1 is a route that bypasses
// it and concatenates strings instead of using these parameterized methods.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/pcs',
  ssl: false,
});

const db = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  queryOne: async (sql, params) => {
    const { rows } = await pool.query(sql, params);
    return rows[0] || null;
  },
  findUserById: async (userId) => {
    const { rows } = await pool.query(
      'SELECT user_id, name, email, is_admin, is_seller, is_staff, is_deactivated FROM users WHERE user_id = $1',
      [userId]
    );
    return rows[0] || null;
  },
};

module.exports = db;
