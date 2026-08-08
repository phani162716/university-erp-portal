# University ERP Portal

Full-stack University / Student Management ERP with React, TypeScript, Tailwind CSS, Express, Prisma, and SQLite (PostgreSQL-ready).

## Features

- **Roles:** Student, Faculty, Super Admin, University Admin (+ role enum for Exam/Finance/Hostel/Transport/HR)
- **Student:** Dashboard, profile, academics, course registration, timetable, attendance, exams, results, fees, hostel, transport, assignments, events, feedback, documents
- **Faculty:** Course roster, mark attendance, assignments
- **Admin:** Stats, students/courses overview, audit logs
- **Auth:** JWT, bcrypt passwords, RBAC, login rate limiting
- **Documents:** PDF hall tickets, fee receipts, bonafide; QR verification at `/verify/:id`
- **UX:** Dark mode, responsive layout, live notifications

## Prerequisites

- Node.js 18+
- npm 9+

## Quick start

```bash
# 1. Install root (frontend) dependencies
cd C:\Users\rayap\Downloads\ERP
npm install

# 2. Install server dependencies
cd server
npm install

# 3. Create env files (if missing)
# server/.env already ships with SQLite defaults
# root .env: VITE_API_BASE_URL=http://localhost:5000/api

# 4. Generate Prisma client, create DB, seed demo data
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start API (from server/)
npm run dev

# 6. Start frontend (new terminal, from project root)
cd ..
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  
- Health: http://localhost:5000/api/health  

Or from root after server deps are installed:

```bash
npm run server   # API on :5000
npm run dev      # Vite on :5173
```

## Demo accounts

| Role    | Login ID / Email              | Password     |
|---------|-------------------------------|--------------|
| Student | `AP2026001234` / `student@university.edu` | `Student@123` |
| Faculty | `FAC2026001` / `faculty@university.edu`   | `Faculty@123` |
| Admin   | `ADM2026001` / `admin@university.edu`     | `Admin@123`   |

First-time login tip (UI): Register Number as User ID; demo passwords are listed above (not DOB).

## Project structure

```
ERP/
  src/                 # React frontend
  server/
    prisma/            # schema + seed
    src/
      controllers/     # REST handlers
      middleware/      # JWT + RBAC
      utils/           # auth, PDF/QR
  README.md
```

## API overview

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Audit logout |
| GET | `/api/student/dashboard` | Live metrics |
| GET/PUT | `/api/student/profile` | Profile |
| GET/POST | `/api/courses`, `/register`, `/drop` | Courses |
| GET | `/api/timetable` | Weekly slots |
| GET/POST | `/api/attendance`, `/mark` | Attendance |
| GET | `/api/exams`, hall-ticket PDF | Exams |
| GET | `/api/results` | SGPA/CGPA |
| GET/POST | `/api/fees`, `/finance/pay` | Mock payments |
| GET | `/api/hostel`, `/transport` | Allocations |
| GET/POST | `/api/assignments` | Assignments |
| GET/POST | `/api/events`, `/announcements` | Campus news |
| GET | `/api/notifications` | Inbox |
| POST | `/api/feedback` | Feedback |
| GET/POST | `/api/documents` | Vault |
| GET | `/api/search?q=` | Global search |
| GET | `/api/faculty/dashboard` | Faculty |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/verify/:documentId` | Public QR verify |

## PostgreSQL (optional)

1. Set `DATABASE_URL` to a Postgres connection string in `server/.env`
2. In `server/prisma/schema.prisma`, set `provider = "postgresql"`
3. Run `npx prisma db push` and `npx prisma db seed`

Default local setup uses **SQLite** (`file:./dev.db`) so the app runs without installing a database server.

## Scripts

**Root**

- `npm run dev` — Vite frontend
- `npm run build` — Typecheck + production build
- `npm run server` — Start API (dev)
- `npm run db:push` / `npm run db:seed`

**Server**

- `npm run dev` — ts-node-dev API
- `npm run build` / `npm start`
- `npm run prisma:generate` / `prisma:db-push` / `prisma:seed`

## Security notes

- Passwords are bcrypt-hashed; never stored in plain text
- JWT secret must be changed for production
- Login is rate-limited; basic security headers enabled
- API responses strip `passwordHash` from user objects

## License

Educational / demo project.
