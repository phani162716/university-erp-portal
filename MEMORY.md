# University ERP Portal — Project Memory

Last updated: 2026-08-08 (perf pass: shared Prisma, lean dashboard, sin1 region)

---

## What this project is

Full-stack **University / Student Management ERP** (student, faculty, admin portals).

- Spec source: `C:\Users\rayap\Downloads\erp_txt.txt`
- Code path: `C:\Users\rayap\Downloads\ERP`
- GitHub: https://github.com/phani162716/university-erp-portal
- Live site: **https://university-erp-portal-ten.vercel.app**

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind, Lucide, Recharts |
| Backend | Express (TypeScript), JWT, bcryptjs, Zod |
| ORM / DB | Prisma + **PostgreSQL** |
| Production DB | **Neon** free Postgres (`university-erp` project) |
| Production host | **Vercel** (static UI + serverless `/api`) |
| Local API | `server/` via `ts-node-dev` on port 5000 |

> Supabase was planned; CLI auth was not available non-interactively, so **Neon PostgreSQL** was used instead. Same Prisma setup works with Supabase if connection strings are swapped.

---

## Live deployment

| Item | Value |
|------|--------|
| Production URL | https://university-erp-portal-ten.vercel.app |
| Health check | https://university-erp-portal-ten.vercel.app/api/health |
| Vercel project | `ph-ani/university-erp-portal` |
| Vercel dashboard | https://vercel.com/ph-ani/university-erp-portal |
| Neon project | `university-erp` (id: `withered-surf-51103562`) |
| Neon region | `aws-ap-southeast-1` |
| Neon console | https://console.neon.tech |
| GitHub owner | `phani162716` |
| Vercel account | `rayapudiphanindra-3541` / team scope `ph-ani` |

### Vercel env vars (set in dashboard / CLI)

- `DATABASE_URL` — Neon **pooler** URL (`…-pooler…?sslmode=require`)
- `DIRECT_URL` — Neon **direct** URL (`sslmode=require`)
- `JWT_SECRET` — random secret
- `JWT_EXPIRES_IN` — `24h`
- `FRONTEND_URL` — `https://university-erp-portal-ten.vercel.app`
- `CORS_ORIGIN` — `https://university-erp-portal-ten.vercel.app`

Do **not** set `NODE_ENV=production` as a custom Vercel env var — it made `npm install` skip devDependencies and broke the build.

---

## Demo accounts (seeded)

| Role | Login | Password |
|------|--------|----------|
| Student | `AP2026001234` or `student@university.edu` | `Student@123` |
| Faculty | `FAC2026001` or `faculty@university.edu` | `Faculty@123` |
| Admin | `ADM2026001` or `admin@university.edu` | `Admin@123` |

Seed also creates extra students/faculty for admin stats.

---

## Local development

```powershell
cd C:\Users\rayap\Downloads\ERP

# Root deps
npm install
cd server
npm install

# server/.env must have DATABASE_URL + DIRECT_URL (Neon or Supabase Postgres)
npx prisma generate
npx prisma db push
npx prisma db seed

# Terminal 1 — API
npm run dev

# Terminal 2 — UI
cd ..
npm run dev
```

- UI: http://localhost:5173  
- API: http://localhost:5000  
- Vite proxies `/api` → `:5000`

---

## Repo layout (important paths)

```
ERP/
  api/
    index.js          # Vercel serverless entry (CJS; loads server/dist/app.js)
    package.json      # { "type": "commonjs" } so require() works
  src/                # React frontend
  server/
    prisma/           # schema.prisma + seed.ts
    src/
      app.ts          # Express app (exported, no listen)
      index.ts        # Local listen only
      controllers/
      middleware/
      utils/          # auth, pdf (QR)
  vercel.json
  DEPLOY.md
  MEMORY.md           # this file
  README.md
```

---

## How production works

```
Browser → Vercel static (dist/)
       → /api/* rewrite → api/index.js
                       → require(server/dist/app.js)  [Express]
                       → Neon PostgreSQL via Prisma
```

Build (`vercel-build`):

1. `prisma generate` in `server/`
2. `tsc` compile server → `server/dist/`
3. Frontend `tsc` + `vite build` → `dist/`
4. Assert `server/dist/app.js` exists

---

## Modules implemented

- Auth (JWT, captcha UI, rate limit, RBAC roles enum-as-string)
- Student dashboard, profile, academic, course registration
- Timetable, attendance, exams (PDF hall ticket), results
- Finance (mock pay + PDF receipt), hostel, transport
- Assignments, events, announcements, notifications
- Feedback, documents (PDF + QR verify at `/verify/:id`)
- Faculty portal (mark attendance)
- Admin dashboard (stats, audit logs)
- Dark mode, settings, responsive layout

---

## Prisma notes

- Provider: **postgresql**
- `DATABASE_URL` + `directUrl` (`DIRECT_URL`) required
- `binaryTargets`: `native`, `rhel-openssl-3.0.x` (Vercel)
- Roles stored as **string** (not Prisma enum — SQLite history; Postgres still uses strings)
- Secrets: never commit `.env` / `server/.env` (gitignored)

---

## Commands cheat sheet

```powershell
# Git
git status
git push origin main

# DB
npx prisma generate --schema=server/prisma/schema.prisma
npx prisma db push --schema=server/prisma/schema.prisma
cd server; npx prisma db seed

# Vercel
vercel whoami
vercel deploy --prod --yes
vercel env ls
vercel logs --status-code 500 --since 1h --expand

# Neon
npx neonctl projects list --org-id org-hidden-grass-41554661
```

---

## Performance notes (2026-08-08)

| Call | Before | After |
|------|--------|-------|
| Login API | ~3.0–3.5s | ~0.4s |
| Dashboard API | ~8–10s | ~0.2–0.5s |
| Main JS bundle | ~748 KB one chunk | ~71 KB core + lazy pages |

Fixes applied:
- Shared `prisma` singleton (controllers no longer each `new PrismaClient()`)
- Lean parallel dashboard queries
- React lazy routes + Vite manualChunks
- Vercel function region **`sin1`** (Singapore) next to Neon `ap-southeast-1`

Cold starts after idle can still add ~1s (serverless + Neon wake).

## Known issues / decisions

1. **Supabase vs Neon** — App is Postgres-agnostic; currently on Neon. Supabase works if URLs are replaced and re-seeded.
2. **GitHub ↔ Vercel auto-deploy** — CLI deploy works; linking GitHub may need “Login Connection” in Vercel account settings for auto-deploy on push.
3. **Serverless cold starts** — First `/api` call after idle may be slower (Neon compute may suspend).
4. **PDF QR URLs** — Use `FRONTEND_URL` / `VERCEL_URL` for verify links.
5. **Password in Neon** — Created at project bootstrap; rotate in Neon console if exposed in logs/chats.
6. **Region** — Keep Vercel `regions: ["sin1"]` aligned with Neon Singapore; US region caused multi-second DB latency.

---

## Owner / identity context

- Windows user: `rayap` / `phani\rayap`
- Student seed name used in demo: RAYAPUDI VENKATA PHANINDRA
- GitHub: `phani162716`
- Vercel: `rayapudiphanindra-3541`

---

## Next useful improvements

- [ ] Connect GitHub repo to Vercel for auto-deploy on push
- [ ] Optional: migrate Neon → Supabase if product requires Supabase brand
- [ ] Password reset + account lockout polish
- [ ] Real payment gateway (Razorpay/Stripe hooks)
- [ ] Stronger admin CRUD UI for all entities
- [ ] Rotate DB password if it was ever shared in terminal output

---

## Quick recovery

If the live site breaks:

1. Check https://university-erp-portal-ten.vercel.app/api/health  
2. `vercel logs --status-code 500 --since 1h --expand`  
3. Confirm Neon project is active and env vars still set on Vercel  
4. From local: `cd server; npx prisma db seed` if data wiped  
5. Redeploy: `vercel deploy --prod --yes`
