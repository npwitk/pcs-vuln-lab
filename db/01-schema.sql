-- ============================================================================
-- Peanut Cheat Sheets (DEV / VULNERABLE LAB)  --  schema
-- Trimmed, de-secured fork of the production PCS-Web schema.
-- FOR ISOLATED EDUCATIONAL USE ONLY (CSS484 Assessment 3).
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  user_id        SERIAL PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  email          VARCHAR(200) UNIQUE NOT NULL,
  -- VULN(V1): production has NO password column (Google OAuth only). The "dev"
  -- bolted on a local password login -> plaintext passwords + SQLi login.
  password       VARCHAR(200),
  is_admin       BOOLEAN DEFAULT FALSE,
  is_seller      BOOLEAN DEFAULT FALSE,
  is_staff       BOOLEAN DEFAULT FALSE,
  is_deactivated BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Institutions (schools). The real catalogue is tagged by institution so the
-- card can show a school logo/short-name next to the course code.
CREATE TABLE IF NOT EXISTS institutions (
  institution_id SERIAL PRIMARY KEY,
  name           VARCHAR(200),
  short_name     VARCHAR(50),
  logo_filename  VARCHAR(300)             -- bare file in web/public/logos/ or a full URL
);

-- Column set mirrors the production cheat_sheets table so the REAL exported
-- catalogue (db/03-cheatsheets.sql) loads verbatim and the UI renders like the
-- live site (preview covers, exam-type pills, page count, file size, etc.).
-- NOTE: created_by / approved_by / institution_id are plain INTEGERs (no FK)
-- on purpose -- the exported rows carry production user ids that don't exist in
-- this lab's tiny seed, and we don't want a FK to reject the import.
CREATE TABLE IF NOT EXISTS cheat_sheets (
  cheatsheet_id            SERIAL PRIMARY KEY,
  title                    VARCHAR(300) NOT NULL,
  description              TEXT,
  course_code              VARCHAR(50),
  semester                 VARCHAR(20),
  academic_year            VARCHAR(20),
  year_level               VARCHAR(40),
  exam_type                VARCHAR(40),
  price                    DECIMAL(10,2) DEFAULT 0,
  file_path                VARCHAR(500) NOT NULL,   -- local uploads/ path in this lab (prod = private GCS)
  file_hash                TEXT,
  file_version             INTEGER DEFAULT 1,
  file_version_history     JSONB,
  file_size_mb             DECIMAL(10,2),
  page_count               INTEGER,
  preview_image_path       TEXT,
  preview_text             TEXT,
  youtube_links            JSONB,
  exclusive_content        TEXT,
  is_active                BOOLEAN DEFAULT TRUE,
  is_sponsored             BOOLEAN DEFAULT FALSE,
  sponsored_at             TIMESTAMP,
  approval_status          VARCHAR(20) DEFAULT 'approved',
  approved_by              INTEGER,
  approved_at              TIMESTAMP,
  rejection_reason         TEXT,
  view_count               INTEGER DEFAULT 0,
  purchase_count           INTEGER DEFAULT 0,
  created_by               INTEGER,
  institution_id           INTEGER,
  release_at               TIMESTAMP,
  created_at               TIMESTAMP DEFAULT NOW(),
  updated_at               TIMESTAMP DEFAULT NOW(),
  full_preview_enabled     BOOLEAN DEFAULT FALSE,
  full_preview_generated_at TIMESTAMP,
  institution_restricted   BOOLEAN DEFAULT FALSE,
  preview_3d_front_path    TEXT,
  preview_3d_back_path     TEXT,
  exam_types               TEXT[]
);

CREATE TABLE IF NOT EXISTS purchases (
  order_id       SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  cheatsheet_id  INTEGER NOT NULL REFERENCES cheat_sheets(cheatsheet_id),
  payment_status VARCHAR(20) DEFAULT 'pending',   -- 'pending' | 'paid'
  payment_method VARCHAR(30) DEFAULT 'promptpay',
  payment_amount DECIMAL(10,2),
  qr_code_data   TEXT,
  download_count INTEGER DEFAULT 0,
  bundle_order_id VARCHAR(40),
  created_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, cheatsheet_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  review_id      SERIAL PRIMARY KEY,
  cheatsheet_id  INTEGER NOT NULL REFERENCES cheat_sheets(cheatsheet_id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating         INTEGER CHECK (rating BETWEEN 1 AND 5),
  body           TEXT,                     -- VULN(V6): stored verbatim, rendered unescaped client-side
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS download_logs (
  log_id         SERIAL PRIMARY KEY,
  order_id       INTEGER REFERENCES purchases(order_id),
  user_id        INTEGER REFERENCES users(user_id),
  cheatsheet_id  INTEGER REFERENCES cheat_sheets(cheatsheet_id),
  download_ip    VARCHAR(45),
  user_agent     TEXT,
  download_date  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key        VARCHAR(64) PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- A deliberately "sensitive" row to be the payoff/flag for the SQLi dump (V1).
CREATE TABLE IF NOT EXISTS admin_secrets (
  id    SERIAL PRIMARY KEY,
  label VARCHAR(100),
  secret TEXT
);

-- Cart (real, so add-to-cart / checkout work in the UI).
CREATE TABLE IF NOT EXISTS cart (
  cart_id       SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  cheatsheet_id INTEGER NOT NULL REFERENCES cheat_sheets(cheatsheet_id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, cheatsheet_id)
);
