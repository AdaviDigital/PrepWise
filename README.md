# PrepWise API

The backend for PrepWise — Nigeria's AI-powered study assistant and exam
preparation platform. Node.js + Express + Prisma, built to sit behind the
static `prepwise` frontend and power authentication, the AI Study
Assistant, the CBT exam engine, the question bank, payments and every
dashboard.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+, Express 4 |
| Database | PostgreSQL (Neon), via Prisma ORM |
| Cache / rate limiting | Redis (Upstash) |
| Auth | JWT (access + refresh, httpOnly cookies), bcrypt, Google & Microsoft OAuth |
| AI | OpenAI API (chat completions + embeddings for RAG) |
| File storage | Cloudinary (primary), AWS S3 (alternative) |
| Payments | Paystack, Flutterwave, Stripe-ready |
| Notifications | Nodemailer (email), Termii (SMS), WhatsApp Cloud API |
| Security | Helmet, CORS allow-list, express-rate-limit, Zod validation, RBAC |

## Project layout

```
prepwise-api/
├── prisma/
│   ├── schema.prisma      Full data model (users, schools, questions, CBT, payments, AI chat, etc.)
│   └── seed.js            Seeds subjects, sample WAEC questions, a demo CBT exam, an admin user
├── src/
│   ├── app.js             Express app: security headers, CORS, routes, error handling
│   ├── server.js          Entry point + graceful shutdown
│   ├── config/            env.js (env var loader), db.js (Prisma singleton)
│   ├── middleware/        auth.js (JWT + RBAC), rateLimit.js, validate.js, errorHandler.js
│   ├── services/          openai.js, paystack.js, flutterwave.js, cloudinary.js, notification.js
│   ├── controllers/       auth, ai, questions, exams (CBT), payments, dashboard, studyplan, uploads, content
│   ├── routes/            One router per feature, mounted in routes/index.js
│   └── utils/             jwt.js, password.js, apiResponse.js, schemas.js (Zod)
├── Dockerfile
├── render.yaml            One-click Render blueprint
├── .env.example
└── package.json
```

## 1. Local setup

```bash
cp .env.example .env        # fill in real values (see "Environment variables" below)
npm install                  # also runs `prisma generate` automatically (postinstall)
npx prisma migrate dev --name init   # creates tables in your Neon database
npm run seed                 # optional: sample subjects, questions, a demo CBT exam, admin user
npm run dev                   # starts the API on http://localhost:4000 with nodemon
```

Health check: `GET http://localhost:4000/health` → `{ "status": "ok" }`

> Note: `prisma generate` downloads a small query-engine binary from
> `binaries.prisma.sh` the first time you install. This requires normal
> outbound internet access — it works automatically on Render, Cloud Run,
> AWS, or any developer machine with unrestricted internet.

## 2. Database (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string it gives you (includes `?sslmode=require`) into
   `DATABASE_URL` and `DIRECT_URL` in `.env`.
3. Run `npx prisma migrate dev --name init` locally once to create every
   table described in `prisma/schema.prisma` — users, schools, subjects,
   questions, CBT exams/attempts, AI chat sessions, study plans, flashcards,
   subscriptions, payments, notifications, blog posts, support tickets.
4. In production, run `npx prisma migrate deploy` instead (no interactive
   prompts) — see the deploy steps below.
5. **Optional — enable pgvector for real RAG search:** run
   `CREATE EXTENSION IF NOT EXISTS vector;` in the Neon SQL editor, then
   switch `DocumentEmbedding.embedding` in `schema.prisma` from `Json` to
   `Unsupported("vector(1536)")` and query nearest neighbours with raw SQL
   (`$queryRaw`) using the `<=>` cosine-distance operator. The schema ships
   with a plain `Json` column so the project runs without that extension
   until you're ready for it.

## 3. Environment variables

Every variable is documented in `.env.example`. The ones you need for a
minimum working deployment:

- `DATABASE_URL`, `DIRECT_URL` — from Neon
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` — any long random strings (`openssl rand -hex 32`)
- `OPENAI_API_KEY` — for the AI Study Assistant (the API runs in a clearly-labelled "demo mode" and still responds without it, so you can deploy and test everything else first)
- `FRONTEND_URL` / `CORS_ORIGINS` — your deployed frontend origin(s), e.g. `https://www.prepwise.ng`
- `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` — for payments
- `CLOUDINARY_*` — for homework image/PDF uploads

Everything else (Flutterwave, SMS, WhatsApp, Google/Microsoft OAuth) is
optional and degrades gracefully — routes that need a missing key return a
clear `501`/error message instead of crashing the server.

## 4. API reference

All responses follow `{ success: true, data, meta? }` or
`{ success: false, error: { message, details? } }`. Protected routes expect
either an `Authorization: Bearer <accessToken>` header or the `accessToken`
httpOnly cookie set at login.

### Auth — `/api/auth`
| Method | Path | Notes |
|---|---|---|
| POST | `/register` | `{ firstName, lastName, email, password, role?, level? }` |
| POST | `/login` | `{ email, password }` |
| POST | `/google` | `{ idToken }` from Google Identity Services on the frontend |
| POST | `/microsoft` | `{ accessToken }` from MSAL.js on the frontend |
| POST | `/refresh` | Rotates the refresh token, issues a new access token |
| POST | `/logout` | Revokes the current refresh token |
| GET | `/me` | Current user + profile (auth required) |

### AI Study Assistant — `/api/ai` (all auth required)
| Method | Path | Notes |
|---|---|---|
| POST | `/sessions` | Start a new tutoring conversation |
| GET | `/sessions` | List a student's conversations |
| GET | `/sessions/:id` | Full transcript |
| POST | `/sessions/:id/messages` | `{ message }` → AI tutor reply (rate-limited) |
| POST | `/homework` | `{ question, fileUrl?, subjectHint? }` — Homework Helper |
| POST | `/questions/:id/explain` | AI-generated explanation for a question bank item (cached after first call) |

### Question bank — `/api/questions`
`GET /` filters: `?subject=<slug>&examBody=WAEC&year=2024&difficulty=MEDIUM&topic=<id>&page=&limit=`
`POST /`, `PATCH /:id`, `DELETE /:id` — teacher/school-admin/admin only.
`POST /:id/bookmark` — toggle a bookmark (auth required).

### CBT exam engine — `/api/exams`
| Method | Path | Notes |
|---|---|---|
| GET | `/` | List published exams |
| GET | `/leaderboard?examBody=` | Top scores |
| POST | `/` | Create an exam from question IDs (teacher/school-admin/admin) |
| POST | `/:id/start` | Creates an attempt, returns questions **without** answers |
| POST | `/attempts/:attemptId/answer` | Autosave one answer `{ questionId, selectedKey, isFlagged? }` |
| POST | `/attempts/:attemptId/submit` | Auto-grades, awards points/XP |
| GET | `/attempts/:attemptId/review` | Full breakdown with correct answers + explanations |
| GET | `/attempts` | A student's exam history |

### Study planner — `/api/study-plans` (auth required)
`POST /` `{ title, examBody, examDate, items: [{ subjectName, topic, scheduledFor, durationMinutes }] }`,
`GET /`, `PATCH /items/:itemId { isCompleted }`.

### Payments — `/api/payments` (auth required except the webhook)
`POST /paystack/init { plan }` → `{ authorizationUrl, reference }` to redirect the user to.
`GET /paystack/verify/:reference` — call after the user returns from checkout.
`POST /paystack/webhook` — **source of truth**; verifies the HMAC signature server-side before activating a subscription. Configure this URL in your Paystack dashboard.
`POST /flutterwave/init { plan }` — same pattern for Flutterwave.

### Dashboards — `/api/dashboard` (auth required, role-matched)
`GET /student`, `GET /parent`, `GET /teacher`, `GET /school`.

### Uploads — `POST /api/uploads` (auth required)
`multipart/form-data`, field name `file`. Accepts JPG/PNG/WEBP/PDF up to 15MB, streams straight to Cloudinary, returns `{ url, publicId }`.

### Content — `/api/blog`, `/api/blog/:slug`, `POST /api/contact` (public)

## 5. Connecting the existing frontend

In the static site's `js/` folder, add a small config and point your forms
at this API's base URL:

```js
// js/config.js
window.PREPWISE_API = "https://api.prepwise.ng"; // or http://localhost:4000 in dev
```

Then, e.g. in `login.html`'s script:

```js
const res = await fetch(`${window.PREPWISE_API}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // sends/receives the httpOnly cookies
  body: JSON.stringify({ email, password }),
});
const { success, data, error } = await res.json();
if (success) window.location.href = "dashboard-student.html";
```

Remember to add your deployed frontend origin to `CORS_ORIGINS` in the
API's environment variables, and set `credentials: "include"` on every
authenticated `fetch()` call from the frontend.

## 6. Deploying

### Render (recommended, matches `render.yaml`)
1. Push this folder to its own GitHub repo (`prepwise-api`).
2. In Render: **New → Blueprint**, point at the repo — `render.yaml` provisions the web service and generates JWT/cookie secrets automatically.
3. Fill in the remaining env vars flagged `sync: false` in the Render dashboard (`DATABASE_URL`, `OPENAI_API_KEY`, `PAYSTACK_SECRET_KEY`, etc.).
4. After the first deploy, open the Render shell and run `npx prisma migrate deploy` (or add it as a Render **Pre-Deploy Command**).

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/prepwise-api
gcloud run deploy prepwise-api \
  --image gcr.io/YOUR_PROJECT/prepwise-api \
  --platform managed --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DATABASE_URL=...,JWT_ACCESS_SECRET=...
```
Cloud Run injects `PORT` automatically — `env.js` already reads it.

### Hostinger VPS
```bash
git clone <your-repo> && cd prepwise-api
npm ci --omit=dev
npx prisma migrate deploy
npm install -g pm2
pm2 start src/server.js --name prepwise-api
pm2 save && pm2 startup
```
Put Nginx in front as a reverse proxy to port 4000 and issue an SSL
certificate with Certbot.

### AWS (ECS/Fargate or Elastic Beanstalk)
Build and push the included `Dockerfile` to ECR, then run it as a Fargate
service (or Elastic Beanstalk Docker environment) with the same environment
variables. Point RDS/Neon's connection string at `DATABASE_URL`.

## 7. Security checklist before going live
- [ ] Rotate every secret in `.env.example` — never reuse the examples.
- [ ] Set `CORS_ORIGINS` to your exact production frontend domain(s) only.
- [ ] Confirm the Paystack/Flutterwave **webhook** URLs are configured in their dashboards and that `verifyWebhookSignature` is passing (check logs).
- [ ] Serve the API only over HTTPS (Render/Cloud Run/Cloudflare do this by default; on a raw VPS, terminate TLS at Nginx).
- [ ] Review `RATE_LIMIT_*` and `AI_RATE_LIMIT_MAX` for your expected traffic.
- [ ] Change the seeded admin password immediately (`npm run seed` creates `admin@prepwise.ng` / `ChangeMe123!`).
- [ ] Turn on Neon's automated backups (on by default on paid tiers) and note their retention window for NDPA/GDPR-aware handling of student data.

## 8. What's stubbed vs. fully wired

Fully implemented and testable end-to-end: registration/login/JWT
refresh/logout, Google & Microsoft OAuth token verification, the AI Study
Assistant chat loop (with a working no-key demo mode), the full CBT
exam engine (start → autosave → auto-grade → review → leaderboard), the
question bank with filters/bookmarks, study plans, file uploads to
Cloudinary, Paystack/Flutterwave checkout + webhook verification, all four
dashboards, blog, and the contact form.

Intentionally left as clear extension points rather than over-built for a
first release: SMS/WhatsApp delivery (methods exist and log to the console
in dev — plug in real Termii/WhatsApp credentials to go live), semantic
search over uploaded textbooks (the `DocumentEmbedding` table and OpenAI
embedding call are in place; wire up pgvector as described above when
you're ready for it), and an admin panel UI (the API endpoints an admin
panel would call — question/exam CRUD, user management — already exist;
only a dedicated frontend for them is not included).
