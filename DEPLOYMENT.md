# Deployment Guide

Taking this project from XAMPP on your machine to a live site: **Next.js app on Vercel**, **MySQL
database on cPanel**.

Nothing in the code needs to change. Everything that differs between local and live is an
environment variable.

---

## The shape of it

```
   Visitor ──▶ Vercel (Next.js app, serverless)
                  │
                  └──▶ cPanel MySQL  (remote connection, port 3306)
```

Two things about this arrangement are worth understanding before you start, because they are the
cause of nearly every problem people hit:

1. **Vercel's filesystem is read-only.** Image uploads cannot be written to `/public/uploads` there.
   Set `MEDIA_DRIVER=db` and uploads are stored in the database instead — no third-party storage
   account needed.
2. **cPanel MySQL refuses outside connections by default.** You must explicitly enable *Remote
   MySQL* and whitelist the connecting addresses, or every request will time out.

> **Latency note.** Vercel's functions and your cPanel host are in different data centres, so every
> query crosses the public internet. Pick the Vercel region closest to your hosting (Project →
> Settings → Functions → Region) and the difference is usually unnoticeable. If your host is slow or
> far away and the site feels sluggish, the better long-term answer is a managed MySQL near your
> Vercel region (PlanetScale, Railway, Aiven) — the app connects to any of them with the same
> `DATABASE_URL`.

---

## Part 1 — Prepare the cPanel database

### 1.1 Create the database and user

In cPanel → **MySQL® Databases**:

1. **Create New Database** — e.g. `course_enquiry_db`
   cPanel prefixes it with your account name, so the real name becomes something like
   `cpaneluser_course_enquiry_db`. Note the full name.
2. **Add New User** — pick a strong, generated password. Note the full username
   (`cpaneluser_dbuser`).
3. **Add User To Database** → grant **ALL PRIVILEGES**.

Write down all four values — you will need them twice:

| | Example |
|---|---|
| Host | `your-domain.com` or the server IP |
| Database | `cpaneluser_course_enquiry_db` |
| User | `cpaneluser_dbuser` |
| Password | *(the generated one)* |

### 1.2 Enable Remote MySQL

cPanel → **Remote MySQL** → add an access host.

Vercel does not publish a fixed IP range for serverless functions on the Hobby and Pro plans, so in
practice you have three options:

| Option | How | Trade-off |
|---|---|---|
| **Wildcard `%`** | Add `%` as the access host | Works immediately. Any host may *attempt* to connect, so the database password is your only protection — use a long generated one and never reuse it. |
| **Vercel Secure Compute** | Enterprise feature giving static egress IPs; whitelist those | Properly locked down, but requires an Enterprise plan. |
| **Managed MySQL instead** | Use PlanetScale / Railway / Aiven and skip cPanel for the database | Best latency and security; a second service to pay for. |

If you use `%`, compensate for it: a 32-character generated password, a database user with rights to
this one database only, and never the cPanel account's own MySQL user.

### 1.3 Import the schema

Two equivalent routes.

**From your machine** (easiest — it also verifies the connection works):

```bash
# In .env.local, temporarily point at the live database
DATABASE_URL="mysql://cpaneluser_dbuser:THEPASSWORD@your-domain.com:3306/cpaneluser_course_enquiry_db"

npm run db:check     # confirm you can reach it at all
npm run db:setup     # create the 24 tables
npm run db:seed      # load settings, an admin account and the starter content
```

Then **remove `DATABASE_URL` from `.env.local` again** so local development goes back to XAMPP.

**Or via phpMyAdmin:**

1. cPanel → phpMyAdmin → select your database
2. **Import** → choose `database/schema.sql` → **Go**
3. Seeding has to be done from the command line (`npm run db:seed`) because it hashes the admin
   password. Point `DATABASE_URL` at the live database for that one command.

> `db:setup` is safe to re-run — it uses `CREATE TABLE IF NOT EXISTS`. Only `--force` drops anything.

### 1.4 Decide what content goes live

- **Seeded content as a starting point:** run `db:seed` and then edit everything through the
  dashboard. Easiest path; remember to delete the 18 sample enquiries and 5 sample messages before
  launch (they are clearly fictional, but they will skew your dashboard numbers).
- **Clean slate:** run `db:setup`, then seed and immediately delete the demo courses. You still need
  the seed for the `settings` rows and the admin account.

---

## Part 2 — Deploy to Vercel

### 2.1 Push to Git

```bash
git init
git add .
git commit -m "Course enquiry platform"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`.gitignore` already excludes `.env.local`, `node_modules`, `.next` and uploaded files. **Confirm
`.env.local` is not in the commit** before pushing — it holds your database password.

### 2.2 Import the project

Vercel → **Add New → Project** → import the repository.

Framework preset, build command and output directory are all detected automatically. Do not override
them.

### 2.3 Environment variables

Project → **Settings → Environment Variables**. Add these for **Production** (and Preview, if you
want previews to work):

| Variable | Value |
|---|---|
| `DATABASE_URL` | `mysql://cpaneluser_dbuser:THEPASSWORD@your-domain.com:3306/cpaneluser_course_enquiry_db` |
| `AUTH_SECRET` | A fresh 48-byte random string — **not** the development one |
| `AUTH_COOKIE_NAME` | `cep_session` |
| `AUTH_SESSION_HOURS` | `12` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
| `MEDIA_DRIVER` | `db` ← **required on Vercel** |
| `MEDIA_MAX_SIZE_MB` | `5` |
| `DB_SSL` | `true` only if your host requires TLS for MySQL |

Generate the secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

If your password contains `@`, `:`, `/` or `#`, URL-encode it inside `DATABASE_URL`
(`@` → `%40`), or use the discrete `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` / `DB_PORT`
variables instead — the app accepts either and ignores `DATABASE_URL` when it is empty.

### 2.4 Deploy

Press **Deploy**. The build runs `next build`, which pre-renders the static pages and all course
pages. It needs the database to be reachable at build time — if the build fails on data fetching,
your Remote MySQL whitelist is the first thing to check.

### 2.5 Custom domain

Project → **Settings → Domains** → add your domain, then point DNS at Vercel (an `A` record to
`76.76.21.21`, or a `CNAME` to `cname.vercel-dns.com` — Vercel shows the exact values). HTTPS is
issued automatically.

Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy, so canonical URLs, the sitemap and
Open Graph tags all point at the right host.

---

## Part 3 — After the first deploy

Work through this in order.

- [ ] Visit `/admin/login` and sign in with the seeded account
- [ ] **Change the admin password immediately** (My profile → Change password)
- [ ] Create a personal account for each person who will use the dashboard, then deactivate the
      generic `admin@` one — the activity log is only useful if actions trace to a person
- [ ] Settings → **Branding**: institute name, logo, favicon, colours
- [ ] Settings → **Contact**: real phone, WhatsApp (with country code), email, address, map embed,
      office hours
- [ ] Settings → **Social**: your actual profiles; clear the placeholder links
- [ ] Settings → **SEO**: title, description, share image, Google verification
- [ ] Settings → **Integrations**: Google Analytics / Tag Manager ID
- [ ] Replace the Unsplash seed imagery with your own photography (Media Library)
- [ ] Review the three legal pages — Privacy, Terms, Refund — they are drafted around a generic
      institute and **must** be checked against how you actually operate
- [ ] Delete the sample enquiries and contact messages
- [ ] Submit a real test enquiry and confirm it appears in the dashboard
- [ ] Test the WhatsApp button on an actual phone
- [ ] Check `https://your-domain.com/sitemap.xml` and `/robots.txt`
- [ ] Submit the sitemap in Google Search Console

---

## Alternative: deploy entirely on cPanel

If you would rather keep everything on one host, cPanel's **Setup Node.js App** can run Next.js —
and the database connection becomes `localhost`, which removes the latency and Remote MySQL
questions altogether.

1. Upload the project (exclude `node_modules` and `.next`)
2. cPanel → **Setup Node.js App** → create an application
   - Node version: 20 or newer
   - Application root: your upload directory
   - Startup file: `node_modules/next/dist/bin/next`
3. Add the environment variables from §2.3, except:
   - `DB_HOST=localhost` (discrete variables are simpler here than a URL)
   - `MEDIA_DRIVER=local` — a real filesystem is available, so disk uploads work
4. Run `npm install` then `npm run build` from the app's terminal
5. Set the start command to `next start -p $PORT`

Trade-off: you lose Vercel's CDN, image optimisation pipeline and automatic deploys, and shared
hosting is typically slower under load. You gain a single bill, `localhost` database access and
writable uploads.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Build fails fetching data | Remote MySQL not whitelisted | Add `%` (or the right IP) in cPanel → Remote MySQL |
| `ETIMEDOUT` in function logs | Same — the connection is being dropped silently | As above; verify with `npm run db:check` pointed at the live DB |
| `ER_ACCESS_DENIED_ERROR` | Wrong user/password, or user not added to the database | Re-add the user to the database with ALL PRIVILEGES; URL-encode special characters |
| `ER_BAD_DB_ERROR` | Database name missing the cPanel prefix | Use the full `cpaneluser_dbname` |
| Image uploads fail on Vercel | `MEDIA_DRIVER` is `local` | Set it to `db` and redeploy |
| Uploaded images 404 after redeploy | Files were written to the ephemeral filesystem | Set `MEDIA_DRIVER=db`; re-upload |
| Admin login redirects back to login | `AUTH_SECRET` missing, too short, or changed between deploys | Set a 24+ character secret and keep it stable — changing it signs everyone out |
| Site shows default copy, not your settings | Database unreachable, so settings fell back to defaults | Check the connection; the dashboard shows a warning banner when this happens |
| Content edits do not appear | Page-level revalidation window (60s–5min) | Wait, or redeploy to purge |
| `Too many connections` | Several serverless instances each holding a pool | Lower `DB_CONNECTION_LIMIT` to `3`–`5`; raise `max_connections` on the host |

### Reading the logs

Vercel → your deployment → **Functions** → pick a route. Database errors surface with their MySQL
error code, which maps directly to the table above. Locally, `npm run db:check` answers the same
questions faster.

---

## Backups

The database is the entire product — courses, enquiries, settings and media all live in it.

- cPanel → **Backup** → download a full MySQL backup before any significant change
- Set up a scheduled backup with your host if one is available
- To take an ad-hoc dump from your machine:

  ```bash
  mysqldump -h your-domain.com -u cpaneluser_dbuser -p \
    cpaneluser_course_enquiry_db > backup-$(date +%F).sql
  ```

With `MEDIA_DRIVER=db`, images are inside that dump too — which is convenient, but means the dumps
grow. Keep an eye on their size, and consider offloading to object storage if the library gets large.
