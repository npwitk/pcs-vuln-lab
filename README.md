# Peanut Cheat Sheets — Vulnerable Training Lab

> ⚠️ **INTENTIONALLY VULNERABLE. ISOLATED EDUCATIONAL USE ONLY.**
> Built for **CSS484 Ethical Hacking & Cybersecurity, Assessment 3 (Option B)**.
> Run **only** on an isolated local machine / VM / container. **Never deploy
> this, never expose it to a network, never point it at real data.** All users,
> passwords, payments, PDFs and "secrets" in here are **fake**. It is a
> deliberately de-secured fork of the author's own PCS-Web project, used to
> demonstrate and then remediate common web vulnerabilities (CLO6: ethical,
> sandboxed operation).

## What this is

This is the **real PCS-Web React client, forked verbatim**, with Google OAuth
swapped for a local username/password login, served against a trimmed Express +
Postgres backend. It mirrors the real app's look exactly but with six classic web vulnerabilities
deliberately reintroduced. Each one maps back to a **real security control that
exists in production PCS-Web**, so remediation is concrete.

| # | Vulnerability | Class |
|---|---------------|-------|
| V1 | SQL injection (login) | Injection |
| V2 | IDOR / broken object-level authz (download any order) | Access control |
| V3 | Forgeable JWT (weak secret + trusted `is_admin` claim) | Authentication |
| V4 | Missing server-side admin authorization | Access control |
| V5 | Payment bypass (client-settable `paid`) | Business logic |
| V6 | Stored XSS → `localStorage` token theft → admin takeover | Injection → Auth |

## Run it

```bash
docker compose up -d --build     # db + api + web, no external dependencies
```
- Web (SPA):  http://localhost:3000
- API:        http://localhost:4000  (`/health`, and the leaky `/debug`)

**Reset to clean seed data** (do this before each demo run):
```bash
docker compose down -v && docker compose up -d
```

## Seed accounts (all fake)

| role | email | password |
|------|-------|----------|
| admin  | admin@dev.peanut.local  | admin123  |
| seller | seller@dev.peanut.local | seller123 |
| buyer  | alice@dev.peanut.local  | alice123  |
| buyer  | bob@dev.peanut.local    | bob123    |
| buyer  | carol@dev.peanut.local  | carol123  |

Bob & Carol own the premium ITS323 sheet; Alice owns nothing (she's the attacker).

## Exploits

Each script in `exploits/` is one vulnerability, and doubles as the report's
"Steps to Reproduce". Run them against a freshly reset stack:

```bash
cd exploits
cat recon.md                 # CLO2 recon framing
./v1_sqli.sh                 # SQLi: auth bypass + dump the flag
./v2_idor.sh                 # IDOR: read/download another buyer's order
./v3_forge_jwt.py            # forge an admin JWT
./v4_admin_authz.sh          # reach admin API as a plain buyer; self-grant admin
./v5_payment_bypass.sh       # get the premium sheet for free
cat v6_xss_steal_token.md    # stored XSS token-theft chain (browser + listener)
```

See `DEMO.md` for the timed 10-minute runbook.

## Layout
```
db/        schema + fake seed (auto-loaded by Postgres on first boot)
api/       intentionally vulnerable Express app (routes mirror PCS-Web)
web/       minimal React SPA (served by nginx); token kept in localStorage
uploads/   fake placeholder PDFs
exploits/  one PoC per vulnerability + recon notes
```

## UI scope (verbatim client fork)

The whole real frontend is included, so it looks like the production site. Only
the pages used by the demo are wired to this trimmed API and fully functional:

- **Sign in** (`/login`) — username/password (SQL-injectable, V1)
- **Home** — cheat-sheet grid
- **Cheat-sheet detail** — reviews box (stored-XSS target, V6)
- **My Purchases** — order list + IDOR surface (V2)
- **Admin → Users** — reachable without authz (V4)

Other pages (seller, analytics, chat, mock exams, etc.) are left in place but
hit endpoints this lab doesn't implement; the API returns benign empty shapes so
the app never crashes, and those sections simply render empty. That's expected.
