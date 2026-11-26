# Learning Skills — Course Enquiry Platform

A complete educational course showcase and lead-generation platform: public marketing site, course
catalogue, multi-course enquiry system, and a full admin dashboard that manages every piece of
content without touching code.

Built with **Next.js 16**, **React 19**, **Tailwind CSS 4** and **MySQL/MariaDB** — plain JavaScript
throughout, no TypeScript.

> **Learning Skills** is the placeholder brand this project ships with. The institute name, logo,
> colours, contact details and every line of copy are database-driven and editable from
> **Settings** — no code change needed to rebrand.

---

## Quick start

```bash
# 1. Start MySQL in the XAMPP Control Panel  (port 3306)

# 2. Install dependencies
npm install

# 3. Create the database and all 23 tables
npm run db:setup

# 4. Load the launch content (21 courses, settings, sample leads)
npm run db:seed

# 5. Run it
npm run dev
```

| What | Where |
|---|---|
| Public site | <http://localhost:3000> |
| Admin dashboard | <http://localhost:3000/admin> |
| Default login | `admin@learningskills.com` / `Admin@12345` |

**Change that password** from *My profile* after signing in the first time.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run db:check` | Connection + schema + content health report |
| `npm run db:setup` | Create the database and apply `database/schema.sql` |
| `npm run db:setup -- --force` | **Drops** the database first, then recreates it |
| `npm run db:seed` | Insert launch content (idempotent — safe to re-run) |
| `npm run db:seed -- --fresh` | Truncate content tables, then re-seed |
| `npm run db:reset` | Full rebuild: drop, create, seed |

`db:check` is the first thing to run when something is not working — it distinguishes "MySQL is not
running" from "wrong credentials" from "tables missing" and tells you the fix.

---

## What the site does

### Public

| Page | Route | Notes |
|---|---|---|
| Homepage | `/` | Full-screen hero slider, intro, popular courses, benefits, process, animated stats, testimonials, FAQs, closing CTA |
| Course catalogue | `/courses` | Search, level and format filters, sorting, grid & list views, pagination — all URL-driven and shareable |
| Course detail | `/courses/[slug]` | Overview, highlights, learning outcomes, expandable curriculum, entry requirements, careers, testimonials, FAQs, related courses, enquiry form |
| About | `/about` | Story, timeline, mission pillars, teaching method, trainer profiles |
| Contact | `/contact` | Contact channels, course enquiry form, map, office hours, general message form |
| FAQs | `/faqs` | Grouped by category with a jump list |
| CMS pages | `/[slug]` | Privacy policy, terms, refund policy + anything the admin creates |
| SEO | `/sitemap.xml`, `/robots.txt` | Generated from the database |

### The conversion mechanic

Visitors shortlist **multiple courses** across the site and submit **one** enquiry covering all of
them:

1. **Add to enquiry** on any course card or detail page
2. The shortlist persists in `localStorage` — it survives navigation, refresh and returning days later
3. A floating button and header badge show the running count
4. The shortlist drawer contains the enquiry form, so submitting never requires leaving the page
5. One `enquiries` row is written with a `enquiry_courses` row per selected course, in a single transaction

Course titles are snapshotted onto the enquiry at write time, so renaming or deleting a course later
never rewrites history.

### Admin dashboard

| Area | What it manages |
|---|---|
| **Dashboard** | KPI tiles, 30-day enquiry trend, pipeline breakdown, demand by course and by level, format preferences, follow-ups due, recent activity |
| **Course Enquiries** | Filterable inbox, per-lead workspace (status, priority, owner, follow-up date, internal notes), click-to-call / WhatsApp / email, CSV export |
| **Contact Messages** | Expanding list with status workflow and reply shortcuts |
| **Subscribers** | Newsletter signups with bulk email copy |
| **Courses** | Full editor including learning outcomes, curriculum modules, highlights and course FAQs |
| **Hero Slides** | Homepage slider — content, image, overlay, alignment, buttons, order |
| **Benefits / Statistics / Process Steps** | The homepage content blocks |
| **Pages / FAQs / Testimonials / Trainers / Navigation** | Site content and menus |
| **Media** | Upload, link, browse and delete images |
| **Settings** | 88 settings across 9 groups — branding, contact, social, homepage copy, page banners, enquiry behaviour, SEO, footer, integrations |
| **Admin Users** | Accounts and roles (super admin / admin / editor) |
| **Activity Log** | Audit trail of who changed what |

---

## Architecture

```
src/
├─ app/
│  ├─ (site)/              Public pages — own layout, header, footer, shortlist
│  ├─ admin/
│  │  ├─ login/            Sign-in (outside the authenticated shell)
│  │  └─ (dashboard)/      Authenticated dashboard + sidebar
│  ├─ api/
│  │  ├─ enquiries|contact|newsletter   Public form endpoints
│  │  ├─ media/[id]                     Serves DB-stored images
│  │  ├─ auth/login|logout
│  │  └─ admin/
│  │     ├─ [resource]/[id]             Generic CRUD for every registered entity
│  │     ├─ enquiries|messages|users    Workflow-specific endpoints
│  │     ├─ media|settings|profile
│  ├─ globals.css          Design system (tokens, components, animations)
│  ├─ sitemap.js, robots.js
│  └─ proxy.js → src/proxy.js  Admin route guard (edge)
├─ components/
│  ├─ ui/                  Icon, SmartImage, Reveal, Counter, Accordion, Toast…
│  ├─ layout/              Header, Footer, PageHero, FloatingActions
│  ├─ home/                The homepage sections
│  ├─ course/ courses/     Cards, catalogue, filters
│  ├─ shortlist/           Multi-course enquiry state + drawer
│  ├─ forms/               Enquiry, contact, newsletter
│  └─ admin/               Shell, tables, forms, editors, charts
└─ lib/
   ├─ db.js                Pooled MySQL, env-driven
   ├─ auth.js              JWT sessions, bcrypt, roles
   ├─ validation.js        Zod schemas shared by client and server
   ├─ settings.js          Cached settings with fallbacks
   ├─ storage.js           Media drivers (disk / database)
   ├─ queries/             Read layer
   └─ admin/               Resource registry + generic CRUD engine
```

### Three ideas worth knowing

**1. One registry drives the admin.**
`src/lib/admin/resources.js` declares each manageable entity once — its table, validation schema,
list columns and form fields. The generic API routes and the generic table/form components both read
from it. Adding a new managed entity means one registry entry plus a three-line page file, not a new
API route, validator and form.

It is also the security boundary: a request can name a *resource key*, never a table or column. The
key is looked up in the registry, so the dynamic `[resource]` route cannot be turned into arbitrary
SQL.

**2. Validation is written once.**
Every Zod schema in `src/lib/validation.js` is used by the browser form *and* re-run on the server.
Client-side validation is a convenience for the visitor; the server copy is the one that matters, and
because it is literally the same object the two can never drift apart.

**3. The site degrades instead of crashing.**
Public read queries are wrapped so that an unreachable database renders an empty section rather than
a 500, and settings fall back to their registry defaults. The site builds and serves with MySQL
stopped — which is also what makes the first-run experience survivable.

### Security

- Passwords hashed with bcrypt (cost 11)
- Sessions are signed JWTs in `httpOnly`, `SameSite=Lax` cookies; `secure` in production
- Every admin API route calls `requireAdmin()` itself — the edge guard is defence in depth, not the only check
- All SQL is parameterised; `ORDER BY` is interpolated only from registry allow-lists
- Rate limiting on login (5/min/IP) and the public forms (5–6/min/IP)
- Honeypot fields on both public forms, silently discarded so bots learn nothing
- CSV export neutralises formula injection (`=`, `+`, `-`, `@`)
- Role capabilities: `editor` → content; `admin` → + enquiries & settings; `super_admin` → + accounts
- The last active super admin cannot be deleted, deactivated or demoted
- `/admin` and `/api` are excluded from `robots.txt`, and the dashboard sets `noindex`

---

## Design system

Defined entirely in `src/app/globals.css` as Tailwind 4 `@theme` tokens.

| Role | Colour | Used for |
|---|---|---|
| Brand | Indigo `#4f5bd5` | Primary actions, links, chart marks |
| Accent | Saffron `#ffb224` | Enquiry CTAs, highlights, badges |
| Support | Teal `#0fb9a8` | Success, progress, confirmation |
| Neutral | Custom cool "Ink" scale | Text, borders, surfaces |

Typography pairs **Sora** (display) with **Inter** (body/UI), both self-hosted through
`next/font`. Accessibility is built in rather than retrofitted: visible focus rings, `prefers-reduced-motion`
honoured throughout, labelled form controls, `aria-live` regions on async results, keyboard-operable
carousels and accordions, and a skip-to-content link.

The admin brand colour and accent are editable in Settings; the dashboard charts follow the same
palette rules (one series per chart, so identity comes from labels rather than hue).

---

## Configuration

All configuration is environment-driven — see `.env.example` for the full list.

```env
# Local (XAMPP)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=course_enquiry_db

# Or a single connection string, which takes priority when set
DATABASE_URL="mysql://user:pass@host:3306/dbname?ssl=true"

AUTH_SECRET=<long random string>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MEDIA_DRIVER=local            # local = /public/uploads · db = MySQL blob (Vercel-safe)
```

### Media storage

Two drivers, because local and serverless filesystems are incompatible:

- **`local`** — writes to `/public/uploads`. Right for XAMPP and Node hosting on cPanel.
- **`db`** — stores bytes in `media.file_data` and streams them from `/api/media/[id]`. Required on
  Vercel, whose filesystem is read-only, and needs no third-party storage account.

Switching drivers never requires a code or schema change. Remote image URLs can also be registered
in the library without uploading anything.

---

## Going live

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full walkthrough: Vercel for the app, cPanel MySQL for
the database, remote access, SSL, and the pre-launch checklist.

---

## Notes

- Images in the seed data are Unsplash URLs. `SmartImage` falls back to a branded placeholder if any
  URL stops resolving, and every image is replaceable from the Media Library.
- ESLint is not configured (`next lint` was removed in Next.js 16). `npm run build` is the compile
  gate; add `eslint` with `eslint-config-next` and a flat config if you want linting.
- The schema deliberately avoids MySQL-8-only syntax, so the same `database/schema.sql` imports on
  MariaDB 10.4 (XAMPP) and MySQL 5.7/8 (most cPanel hosts).
