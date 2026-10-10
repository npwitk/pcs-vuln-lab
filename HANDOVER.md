# Handover — CSS484 Assessment 3 (Vulnerable Lab)

**From:** Nonprawich  ·  **To:** next teammate  ·  **Assignment:** CSS484 Ethical
Hacking, Assessment 3, Option B (self-designed vulnerable app).
**Due:** report + slides PDF to Turnitin + Google Classroom **2026-11-08**;
live demos **2026-11-13 / 2026-11-20** (group ≤ 3).

## TL;DR of what's built (DONE)
A deliberately-vulnerable, fully-local replica of our Peanut Cheat Sheets site,
living at **`~/pcs-vuln-lab/`** (its own folder — NOT inside the real PCS-Web
repo, do not commit it there). It's the **real React frontend** forked verbatim
(Google login swapped for username/password) on a trimmed Express + Postgres
backend, all in Docker with fake seed data. **Six working vulnerabilities**, each
mapped to the real production control it "regressed" from (so remediation is
concrete). All six are verified working end-to-end. There's a timed demo runbook
(`DEMO.md`) and one PoC script per vuln (`exploits/`).

## How to run it
```bash
cd ~/pcs-vuln-lab
docker compose up -d                 # start (Docker Desktop must be running)
curl -s localhost:4000/health        # wait for {"status":"ok"}
# UI:  http://localhost:3000     API: http://localhost:4000  (/health, /debug)
docker compose down -v && docker compose up -d   # RESET to clean seed data
```
Login (fake accounts): `alice@dev.peanut.local` / `alice123` (buyer, owns
nothing = the attacker), `bob@…`/`bob123` (owns ITS323), `admin@…`/`admin123`.

## The six vulnerabilities (what to demo + where the code is)
| # | Vuln | Demo | Code (in lab `api/`) | Prod control it broke |
|---|------|------|----------------------|------------------------|
| V1 | SQL injection (login) | login with `x' OR '1'='1' --`; `./exploits/v1_sqli.sh` dumps the flag | `routes/auth.js` (string-concat SQL) | parameterized queries |
| V2 | IDOR (download any order) | Burp: change id in `GET /api/purchases/<id>`; `./exploits/v2_idor.sh` | `routes/purchases.js` (no `user_id` scope) | `user_id`-scoped queries |
| V3 | Forgeable JWT → admin | `./exploits/v3_forge_jwt.py` | `middleware/auth.js` (weak secret `secret`, trusts `is_admin` claim) | minimal claims + live DB role check |
| V4 | Missing admin authz | `./exploits/v4_admin_authz.sh` (buyer self-grants admin) | `routes/admin.js` (no `requireAdmin`) | `requireAdmin` on all handlers |
| V5 | Payment bypass | UI: add to cart → checkout (pending) → `./exploits/v5_payment_bypass.sh` | `routes/payments.js` `mark-paid` | Stripe-webhook ledger |
| V6 | Stored XSS → token theft → admin takeover | post payload (`exploits/payload.js`) as a review, open as admin, token exfiltrates to `python3 -m http.server 9000` | `web/src/pages/CheatSheetDetail.js` (`dangerouslySetInnerHTML`) + token in `localStorage` | React escaping + CSP |

Recon framing (CLO2): `curl localhost:3000/robots.txt` and page source leak
`dev.peanutcheatsheets.local`; `curl localhost:4000/debug` dumps stack + the weak
JWT secret. Full timed script is in **`DEMO.md`**.

## WHAT'S LEFT (your part)
1. **Write the Technical Report PDF (10–20 pages)** — the main graded artifact.
   For EACH vuln: (1) description, (2) why it occurs / root cause, (3) affected
   component, (4) numbered steps to reproduce (copy from `exploits/` + `DEMO.md`),
   (5) PoC evidence (payloads, request/response pairs, **screenshots**),
   (6) impact, (7) remediation (cite the prod control in the table above).
   Grading = exploit quality + understanding + evidence/reproducibility + demo.
2. **Capture evidence/screenshots** — run each `exploits/*` and the UI flows,
   screenshot: Burp requests/responses, the SQLi dump + flag, the stolen admin
   JWT in the listener log, the admin console reached as a buyer, etc.
3. **Make the 10-minute presentation/demo deck** and **rehearse the live demo**
   against `DEMO.md` (target slot: recon → V1 → V2 → V5 → V6 chain → V3/V4 →
   remediation).
4. **(Optional) Proposal** — topic/rationale/feasibility (assignment says optional
   but recommended).
5. **Submit** report + presentation PDFs to Turnitin (Class ID 53938998) and
   Google Classroom before 2026-11-08.

## Gotchas / things to know
- **Docker Desktop must be running** or nothing starts.
- **Reset before presenting:** `docker compose down -v && docker compose up -d`.
  The V2 IDOR story needs **Alice to own nothing** — running V5 makes Alice own
  ITS323, so do V2 first or reset between.
- The **whole real UI** is included, so pages off the demo path (seller,
  analytics, chat, mock exams…) show empty sections — that's expected (the lab
  stubs those endpoints). If any page *hard-crashes*, it's a stub-shape mismatch;
  easy one-line fix (ask Claude Code / see how Cart was fixed).
- **This is isolated, educational, fake-data only** (CLO6). Never deploy or point
  it at anything real. The README has the ethics/isolation banner.

## File map
```
~/pcs-vuln-lab/
  README.md         how to run + ethics banner
  DEMO.md           timed 10-min runbook   <-- start here for the demo
  docker-compose.yml
  db/01-schema.sql, 02-seed.sql     schema + FAKE seed data
  api/              vulnerable Express API (routes/, middleware/auth.js)
  web/              the real React client, forked (login + review XSS changed)
  exploits/         v1..v6 PoC scripts + recon.md + payload.js
```
