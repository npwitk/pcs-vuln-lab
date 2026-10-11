-- ============================================================================
-- Seed data -- ALL FAKE. Clearly non-real emails/passwords. Educational lab.
-- ============================================================================

-- Users. Passwords are plaintext on purpose (part of the V1 lesson).
INSERT INTO users (name, email, password, is_admin, is_seller, is_staff) VALUES
  ('Dev Admin',   'admin@dev.peanut.local',  'admin123',   TRUE,  TRUE,  TRUE),
  ('Sara Seller', 'seller@dev.peanut.local', 'seller123',  FALSE, TRUE,  FALSE),
  ('Alice Buyer', 'alice@dev.peanut.local',  'alice123',   FALSE, FALSE, FALSE),
  ('Bob Buyer',   'bob@dev.peanut.local',    'bob123',     FALSE, FALSE, FALSE),
  ('Carol Buyer', 'carol@dev.peanut.local',  'carol123',   FALSE, FALSE, FALSE);

-- Cheat sheets. created_by = seller (user_id 2).
INSERT INTO cheat_sheets (title, description, course_code, price, file_path, preview_text, created_by, purchase_count) VALUES
  ('CSS484 Ethical Hacking - Midterm Crib', 'Recon, Burp, injection cheat sheet', 'CSS484', 0,   'uploads/css484-free.pdf',    'Free sample: nmap flags, Burp workflow...', 2, 0),
  ('ITS323 Networking - Full Notes',        'Subnetting, TCP/IP, routing',        'ITS323', 59,  'uploads/its323-premium.pdf', 'Premium: full subnetting worked examples (locked)', 2, 2),
  ('MTH205 Calculus II - Formula Sheet',    'Integrals, series, tricks',          'MTH205', 39,  'uploads/mth205.pdf',         'Premium: integral tables (locked)', 2, 0);

-- Purchases: Bob (user 4) legitimately bought the premium ITS323 sheet (cheatsheet 2).
-- Alice (user 3) has NOT bought it -> she is the IDOR/payment-bypass attacker in the demo.
INSERT INTO purchases (user_id, cheatsheet_id, payment_status, payment_amount) VALUES
  (4, 2, 'paid', 59),      -- Bob owns ITS323 (order_id 1)
  (5, 2, 'paid', 59);      -- Carol owns ITS323 (order_id 2)

-- Reviews (seed one benign review so the box isn't empty).
INSERT INTO reviews (cheatsheet_id, user_id, rating, body) VALUES
  (2, 4, 5, 'Super helpful for the midterm, thanks!');

-- Feature flags (mirror prod shape).
INSERT INTO site_settings (key, value) VALUES
  ('stripe_payments_enabled', 'false'::jsonb),
  ('announcement', '"Welcome to the DEV staging box"'::jsonb),
  ('promptpay_phone', '"0660000000"'::jsonb);

-- The SQLi payoff / flag.
INSERT INTO admin_secrets (label, secret) VALUES
  ('prod_db_url',       'postgres://REDACTED-FAKE-ONLY@prod.internal/pcs'),
  ('stripe_test_key',   'sk_test_FAKE_DO_NOT_USE_0000000000'),
  ('flag',              'CSS484{sql1_dump3d_th3_s3cr3ts}');
