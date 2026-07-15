# PrepWise — Nigeria's AI-Powered Study Assistant & Exam Prep Platform

Learn Smarter. Prepare Better. Succeed with Confidence.

This package is the **static front-end website** for PrepWise: a fully-linked,
responsive, multi-page marketing site plus demo dashboards for students,
parents, teachers and schools. It is built with plain HTML5, CSS3 and
vanilla JavaScript (no build step, no framework, no dependencies) so it can
be uploaded as-is to any static host.

> Note: This package delivers the **front-end** described in the product
> brief (pages, layout, UI, navigation, SEO files, PWA manifest). The AI
> tutor, authentication, database, payments and CBT auto-grading are
> presented as realistic interactive UI/demo flows (see `js/script.js`)
> ready to be wired up to real backend services (Node.js/Express,
> PostgreSQL/MongoDB, OpenAI API, Paystack/Flutterwave/Stripe, etc.) as
> described in the technology stack section of the brief.

## What's included

```
prepwise/
├── index.html                 Homepage
├── about.html                 About PrepWise
├── ai-assistant.html          AI Study Assistant
├── examinations.html          Examination modules (Common Entrance → professional)
├── question-bank.html         Categorised question bank + filters
├── cbt-exam.html               CBT exam engine + interactive demo mock
├── study-planner.html         AI personal study planner
├── digital-library.html       Digital library (books, notes, past questions)
├── gamification.html          Points, XP, badges, leaderboards
├── parents.html                For Parents (Parent Dashboard preview)
├── teachers.html               For Teachers (Teacher Dashboard preview)
├── schools.html                 For Schools (Institution Dashboard preview)
├── pricing.html                Plans & pricing comparison
├── blog.html / blog-post.html  Education blog + article template
├── faq.html                    Frequently asked questions (accordion)
├── contact.html                Contact form, WhatsApp, phone, map
├── login.html / register.html  Authentication UI (Google/Microsoft/email)
├── dashboard-student.html      Student dashboard shell
├── dashboard-parent.html       Parent dashboard shell
├── dashboard-teacher.html      Teacher dashboard shell
├── dashboard-school.html       School/institution dashboard shell
├── terms.html / privacy.html   Legal pages (NDPA/GDPR-aware)
├── 404.html                    Custom not-found page
├── css/style.css               Shared design system & styles
├── js/script.js                Shared interactivity (nav, tabs, accordion,
│                                dark mode, countdown, demo CBT engine, forms)
├── images/                     Logo, favicons, PWA icons, blog imagery
├── site.webmanifest            PWA manifest
├── robots.txt                  Search engine crawl rules
├── sitemap.xml                 XML sitemap for SEO
└── README.md                   This file
```

## Design system

- **Palette:** Navy `#0B1E42`, Blue `#1C4FD6`, Emerald `#16A987`, Gold `#F2A93B`, Paper `#FAF9F5`
- **Type:** Sora (display), Inter (body), IBM Plex Mono (data/codes) via Google Fonts
- **Signature element:** the "exam ticket" card — a WAEC/JAMB-style paper header motif used across hero sections and feature cards, reflecting the Nigerian exam-paper context
- Fully responsive (mobile-first), keyboard-accessible focus states, dark mode toggle, reduced-motion support

## Local preview

No build tools are required. From inside the `prepwise/` folder run any static server, e.g.:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Or simply open `index.html` directly in a browser.

## Deploying

The site is plain static HTML/CSS/JS and works unmodified on:

- **Vercel:** drag-and-drop the folder or run `vercel deploy` from inside it (no framework preset needed — choose "Other").
- **Render:** create a new **Static Site**, set the publish directory to the project root, no build command required.
- **Hostinger VPS / any Apache/Nginx host:** upload the contents of this folder to your web root (e.g. `public_html/`).
- **Google Cloud Hosting (Cloud Storage + Cloud CDN, or Firebase Hosting):** upload the folder as your static bucket / hosting root; set `index.html` as the index document and `404.html` as the custom 404 page.
- **Neon:** Neon is a managed Postgres database, not a static host — use it as the database once you connect this front-end to a real backend (see "Next steps" below).

Update `SITE_URL` references in `sitemap.xml`, `robots.txt` and each page's
`<link rel="canonical">` / Open Graph tags if you deploy under a different
domain than `https://www.prepwise.ng`.

## Next steps to go full-stack

This front-end was designed to plug into the technology stack from the
product brief:

- **Backend:** Node.js + Express REST/GraphQL API
- **Database:** PostgreSQL (relational data) + MongoDB (content/AI logs) + Redis (caching/sessions)
- **Auth:** JWT + OAuth (Google, Microsoft)
- **AI:** OpenAI API with a RAG architecture over a vector database for curriculum-grounded answers, plus Speech-to-Text/Text-to-Speech and OCR for homework uploads
- **Storage:** Cloudinary / AWS S3 for uploaded documents and media
- **Payments:** Paystack, Flutterwave, Stripe
- **Notifications:** Email, SMS, WhatsApp, push
- **Hosting:** Vercel/AWS/Cloudflare for the app, with Neon/AWS RDS for managed Postgres

## Contact

- Email: olatundeajayi87@yahoo.com
- WhatsApp: +234 806 217 7435
- Phone: +234 913 587 8155
- Location: Lagos, Nigeria

&copy; 2026 PrepWise. All rights reserved.
