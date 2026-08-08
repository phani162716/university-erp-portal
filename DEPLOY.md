# Deploy University ERP → Vercel + Supabase

This app uses:

| Layer | Service |
|-------|---------|
| Frontend (React/Vite) | **Vercel** |
| API (Express serverless) | **Vercel** `/api` |
| Database (PostgreSQL) | **Supabase** |

---

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) → **New project**
2. Choose a name, database password, and region
3. Wait until the project is ready

### Get connection strings

**Project Settings → Database → Connection string**

You need **two** URLs:

#### A) Transaction pooler (app / Vercel) — port **6543**

```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### B) Session / Direct (migrations & seed) — port **5432**

```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

> Replace `YOUR_PASSWORD` with the database password you set.  
> URL-encode special characters in the password (e.g. `@` → `%40`).

---

## 2. Push schema & seed data

On your machine (with Node.js):

```powershell
cd C:\Users\rayap\Downloads\ERP

# Install deps
npm install
cd server
npm install
cd ..

# Create server/.env from the example and paste Supabase URLs
copy server\.env.example server\.env
# Edit server\.env → set DATABASE_URL and DIRECT_URL
```

Example `server/.env`:

```env
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
JWT_SECRET="pick-a-long-random-string"
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

Then:

```powershell
npx prisma generate --schema=server/prisma/schema.prisma
npx prisma db push --schema=server/prisma/schema.prisma
cd server
npx prisma db seed
cd ..
```

Demo logins after seed:

| Role | Login | Password |
|------|--------|----------|
| Student | `AP2026001234` or `student@university.edu` | `Student@123` |
| Faculty | `FAC2026001` or `faculty@university.edu` | `Faculty@123` |
| Admin | `ADM2026001` or `admin@university.edu` | `Admin@123` |

---

## 3. Deploy to Vercel

### Option A — Vercel website (easiest)

1. Go to [https://vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub repo: **`phani162716/university-erp-portal`**
3. Framework: leave as **Other** (vercel.json handles it)
4. Add **Environment Variables**:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase **pooler** URL (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **session/direct** URL (port 5432) |
| `JWT_SECRET` | Long random secret |
| `JWT_EXPIRES_IN` | `24h` |
| `CORS_ORIGIN` | `https://your-project.vercel.app` (update after first deploy if needed) |
| `FRONTEND_URL` | `https://your-project.vercel.app` |
| `NODE_ENV` | `production` |

5. Click **Deploy**

After deploy, set `CORS_ORIGIN` and `FRONTEND_URL` to the real Vercel URL and **Redeploy**.

### Option B — Vercel CLI

```powershell
npm i -g vercel
cd C:\Users\rayap\Downloads\ERP
vercel login
vercel

# Production
vercel --prod
```

Add the same env vars when prompted, or in the Vercel dashboard.

---

## 4. How routing works on Vercel

- Static UI → Vite build output in `dist/`
- `GET /api/*` → Express app in `api/index.ts` (serverless)
- SPA routes (`/dashboard`, `/login`, …) → `index.html`

Locally:

```powershell
# Terminal 1 — API
cd server
npm run dev

# Terminal 2 — UI
cd ..
npm run dev
```

For local UI against production API (optional):

```env
# root .env
VITE_API_BASE_URL=https://your-app.vercel.app/api
```

On Vercel, leave `VITE_API_BASE_URL` **empty** so the browser calls same-origin `/api`.

---

## 5. Checklist if something fails

| Problem | Fix |
|---------|-----|
| Prisma / DB connection error | Check password encoding; use pooler for `DATABASE_URL` |
| `db push` fails | Use `DIRECT_URL` on port 5432; disable IPv6-only issues by using pooler host |
| 500 on `/api/health` | Confirm env vars on Vercel; check Function logs |
| CORS errors | Set `CORS_ORIGIN` to your exact Vercel URL |
| Empty database | Run `prisma db push` + `prisma db seed` against Supabase |
| Build fails on Prisma | Ensure `postinstall` / `vercel-build` runs `prisma generate` |

Test API after deploy:

```
https://YOUR-APP.vercel.app/api/health
```

Should return: `{ "status": "ok", "service": "university-erp-api", ... }`

---

## 6. Optional: Supabase dashboard

- **Table Editor** — browse `User`, `StudentProfile`, etc.
- **SQL Editor** — run queries
- You do **not** need Supabase Auth for this app (JWT is handled by Express)

---

## Architecture

```
Browser  →  Vercel (React static)
              │
              └─ /api/*  →  Express serverless  →  Supabase PostgreSQL
```
