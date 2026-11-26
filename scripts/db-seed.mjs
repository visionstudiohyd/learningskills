/**
 * Populates course_enquiry_db with launch content.
 *
 *   npm run db:seed              -> insert content, skipping anything already there
 *   npm run db:seed -- --fresh   -> TRUNCATE the content tables first, then insert
 *
 * Idempotent by default: slugs and keys are matched, so running it twice does
 * not create duplicates. The admin password is only set when the account is
 * created — re-seeding never resets a password you have changed.
 */
import process from 'node:process';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import {
  heroSlides,
  courses,
  testimonials,
  features,
  stats,
  learningSteps,
  trainers,
  faqs,
  pages,
  menuItems,
  sampleEnquiries,
  sampleMessages,
} from '../database/seed-data.mjs';
import { DEFAULT_SETTINGS } from '../src/lib/default-settings.js';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const FRESH = process.argv.includes('--fresh');

const ADMIN = {
  name: 'Site Administrator',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@learningskills.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  role: 'super_admin',
};

const c = { reset: '\x1b[0m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m' };
const log = (m) => console.log(m);
const step = (label, count) => log(`${c.green}  ok${c.reset} ${label.padEnd(26)} ${c.dim}${count}${c.reset}`);

function resolveConfig() {
  const url = (process.env.DATABASE_URL || '').trim();
  if (url) {
    const p = new URL(url);
    const ssl = p.searchParams.get('ssl') || p.searchParams.get('sslmode');
    return {
      host: p.hostname,
      port: Number(p.port || 3306),
      user: decodeURIComponent(p.username || 'root'),
      password: decodeURIComponent(p.password || ''),
      database: decodeURIComponent((p.pathname || '').replace(/^\//, '')) || 'course_enquiry_db',
      ssl: ['1', 'true', 'yes', 'require', 'required'].includes(String(ssl).toLowerCase()) ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'course_enquiry_db',
    ssl: ['1', 'true', 'yes'].includes(String(process.env.DB_SSL).toLowerCase()) ? { rejectUnauthorized: false } : undefined,
  };
}

/** Insert only if no row matches `matchSql`. Returns the row id either way. */
async function upsert(db, { table, matchSql, matchParams, columns, values }) {
  const [existing] = await db.query(`SELECT id FROM \`${table}\` WHERE ${matchSql} LIMIT 1`, matchParams);
  if (existing.length) return { id: existing[0].id, created: false };
  const placeholders = columns.map(() => '?').join(', ');
  const [res] = await db.execute(
    `INSERT INTO \`${table}\` (${columns.map((col) => `\`${col}\``).join(', ')}) VALUES (${placeholders})`,
    values
  );
  return { id: res.insertId, created: true };
}

async function main() {
  const cfg = resolveConfig();
  log('');
  log(`${c.bold}${c.cyan}  Seeding ${cfg.database} @ ${cfg.host}:${cfg.port}${c.reset}`);
  log(`${c.dim}  -----------------------------------------------${c.reset}`);

  let db;
  try {
    db = await mysql.createConnection({ ...cfg, multipleStatements: false });
  } catch (error) {
    log(`${c.red}  x  Cannot connect: ${error.code} ${error.message}${c.reset}`);
    if (error.code === 'ECONNREFUSED') {
      log(`${c.yellow}     Start MySQL from the XAMPP Control Panel, then re-run.${c.reset}`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log(`${c.yellow}     Database missing — run "npm run db:setup" first.${c.reset}`);
    }
    log('');
    process.exit(1);
  }

  if (FRESH) {
    const tables = [
      'enquiry_courses', 'enquiries', 'contact_messages', 'newsletter_subscribers', 'activity_log', 'page_views',
      'course_faqs', 'course_highlights', 'course_syllabus', 'course_outcomes', 'testimonials', 'courses',
      'hero_slides', 'site_features', 'site_stats', 'learning_steps', 'trainers',
      'faqs', 'pages', 'menu_items', 'settings', 'media',
    ];
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of tables) await db.query(`TRUNCATE TABLE \`${t}\``);
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    log(`${c.yellow}  !!${c.reset} truncated ${tables.length} content tables`);
  }

  /* ----------------------------- admin user ----------------------------- */
  const [adminRows] = await db.query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [ADMIN.email]);
  let adminId;
  let adminCreated = false;
  if (adminRows.length) {
    adminId = adminRows[0].id;
  } else {
    const hash = await bcrypt.hash(ADMIN.password, 11);
    const [res] = await db.execute(
      'INSERT INTO admin_users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
      [ADMIN.name, ADMIN.email, hash, ADMIN.role]
    );
    adminId = res.insertId;
    adminCreated = true;
  }
  step('admin account', adminCreated ? 'created' : 'already present');

  /* ------------------------------ settings ------------------------------ */
  let settingsCount = 0;
  for (const [index, s] of DEFAULT_SETTINGS.entries()) {
    const [res] = await db.execute(
      `INSERT INTO settings (setting_group, setting_key, setting_value, setting_type, label, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         setting_group = VALUES(setting_group),
         setting_type  = VALUES(setting_type),
         label         = VALUES(label),
         description   = VALUES(description),
         display_order = VALUES(display_order)`,
      [s.group, s.key, s.value ?? '', s.type, s.label, s.description || null, index]
    );
    if (res.affectedRows) settingsCount += 1;
  }
  step('settings', `${settingsCount} keys`);

  /* ----------------------------- hero slides ---------------------------- */
  let slideCount = 0;
  for (const slide of heroSlides) {
    const { created } = await upsert(db, {
      table: 'hero_slides',
      matchSql: 'title = ?',
      matchParams: [slide.title],
      columns: ['eyebrow', 'title', 'highlight', 'description', 'image', 'overlay_opacity', 'text_align', 'primary_btn_text', 'primary_btn_link', 'secondary_btn_text', 'secondary_btn_link', 'display_order', 'is_active'],
      values: [slide.eyebrow, slide.title, slide.highlight, slide.description, slide.image, slide.overlay_opacity, slide.text_align, slide.primary_btn_text, slide.primary_btn_link, slide.secondary_btn_text, slide.secondary_btn_link, slide.display_order, 1],
    });
    if (created) slideCount += 1;
  }
  step('hero slides', `${slideCount} new / ${heroSlides.length}`);

  /* -------------------------------- courses ----------------------------- */
  const courseIdBySlug = new Map();
  let courseCount = 0;
  let relationCount = 0;

  for (const course of courses) {
    const { id, created } = await upsert(db, {
      table: 'courses',
      matchSql: 'slug = ?',
      matchParams: [course.slug],
      columns: [
        'title', 'slug', 'code', 'short_description', 'overview', 'who_should_attend',
        'eligibility', 'career_opportunities', 'certification', 'thumbnail', 'banner_image', 'duration',
        'duration_weeks', 'lessons_count', 'level', 'delivery_mode', 'language', 'fee_text', 'rating',
        'reviews_count', 'students_enrolled', 'is_featured', 'is_popular', 'is_active', 'display_order',
        'meta_title', 'meta_description',
      ],
      values: [
        course.title, course.slug, course.code || null, course.short_description, course.overview,
        course.who_should_attend || null, course.eligibility || null, course.career_opportunities || null,
        course.certification || null, course.thumbnail || null, course.banner_image || null,
        course.duration || null, course.duration_weeks || null, course.lessons_count || null,
        course.level, course.delivery_mode, 'English', course.fee_text || null, course.rating ?? 4.8,
        course.reviews_count || 0, course.students_enrolled || 0, course.is_featured || 0,
        course.is_popular || 0, 1, course.display_order || 0,
        `${course.title} — Course Details, Syllabus & Fees`,
        course.short_description?.slice(0, 480) || null,
      ],
    });
    courseIdBySlug.set(course.slug, id);
    if (!created) continue;
    courseCount += 1;

    for (const [i, outcome] of (course.outcomes || []).entries()) {
      await db.execute('INSERT INTO course_outcomes (course_id, outcome, display_order) VALUES (?, ?, ?)', [id, outcome, i]);
      relationCount += 1;
    }
    for (const [i, h] of (course.highlights || []).entries()) {
      await db.execute('INSERT INTO course_highlights (course_id, icon, title, description, display_order) VALUES (?, ?, ?, ?, ?)', [id, h.icon, h.title, h.description || null, i]);
      relationCount += 1;
    }
    for (const [i, m] of (course.syllabus || []).entries()) {
      await db.execute('INSERT INTO course_syllabus (course_id, module_title, description, topics, duration, display_order) VALUES (?, ?, ?, ?, ?, ?)', [id, m.module_title, m.description || null, m.topics || null, m.duration || null, i]);
      relationCount += 1;
    }
    for (const [i, f] of (course.faqs || []).entries()) {
      await db.execute('INSERT INTO course_faqs (course_id, question, answer, display_order, is_active) VALUES (?, ?, ?, ?, 1)', [id, f.question, f.answer, i]);
      relationCount += 1;
    }
  }
  step('courses', `${courseCount} new / ${courses.length}`);
  step('course relations', `${relationCount} rows`);

  /* ----------------------------- testimonials --------------------------- */
  let testimonialCount = 0;
  for (const t of testimonials) {
    const courseId = courseIdBySlug.get(t.course_slug) || null;
    const courseLabel = courses.find((cc) => cc.slug === t.course_slug)?.title || null;
    const { created } = await upsert(db, {
      table: 'testimonials',
      matchSql: 'name = ? AND message = ?',
      matchParams: [t.name, t.message],
      columns: ['name', 'designation', 'organisation', 'course_id', 'course_label', 'message', 'avatar', 'rating', 'is_featured', 'is_active', 'display_order'],
      values: [t.name, t.designation, t.organisation, courseId, courseLabel, t.message, t.avatar, t.rating, t.is_featured || 0, 1, t.display_order],
    });
    if (created) testimonialCount += 1;
  }
  step('testimonials', `${testimonialCount} new / ${testimonials.length}`);

  /* ------------------- features / stats / steps / trainers -------------- */
  let featureCount = 0;
  for (const f of features) {
    const { created } = await upsert(db, {
      table: 'site_features',
      matchSql: 'title = ?',
      matchParams: [f.title],
      columns: ['icon', 'title', 'description', 'accent', 'placement', 'display_order', 'is_active'],
      values: [f.icon, f.title, f.description, f.accent, f.placement, f.display_order, 1],
    });
    if (created) featureCount += 1;
  }
  step('site features', `${featureCount} new / ${features.length}`);

  let statCount = 0;
  for (const s of stats) {
    const { created } = await upsert(db, {
      table: 'site_stats',
      matchSql: 'label = ?',
      matchParams: [s.label],
      columns: ['icon', 'label', 'value', 'prefix', 'suffix', 'display_order', 'is_active'],
      values: [s.icon, s.label, s.value, s.prefix || null, s.suffix || null, s.display_order, 1],
    });
    if (created) statCount += 1;
  }
  step('site stats', `${statCount} new / ${stats.length}`);

  let stepCount = 0;
  for (const s of learningSteps) {
    const { created } = await upsert(db, {
      table: 'learning_steps',
      matchSql: 'title = ?',
      matchParams: [s.title],
      columns: ['step_label', 'icon', 'title', 'description', 'display_order', 'is_active'],
      values: [s.step_label, s.icon, s.title, s.description, s.display_order, 1],
    });
    if (created) stepCount += 1;
  }
  step('learning steps', `${stepCount} new / ${learningSteps.length}`);

  let trainerCount = 0;
  for (const t of trainers) {
    const { created } = await upsert(db, {
      table: 'trainers',
      matchSql: 'name = ?',
      matchParams: [t.name],
      columns: ['name', 'designation', 'bio', 'photo', 'expertise', 'experience_years', 'linkedin_url', 'display_order', 'is_active'],
      values: [t.name, t.designation, t.bio, t.photo, t.expertise, t.experience_years || null, t.linkedin_url || null, t.display_order, 1],
    });
    if (created) trainerCount += 1;
  }
  step('trainers', `${trainerCount} new / ${trainers.length}`);

  /* --------------------------------- faqs ------------------------------- */
  let faqCount = 0;
  for (const f of faqs) {
    const { created } = await upsert(db, {
      table: 'faqs',
      matchSql: 'question = ?',
      matchParams: [f.question],
      columns: ['question', 'answer', 'category', 'show_on_home', 'display_order', 'is_active'],
      values: [f.question, f.answer, f.category, f.show_on_home || 0, f.display_order, 1],
    });
    if (created) faqCount += 1;
  }
  step('site FAQs', `${faqCount} new / ${faqs.length}`);

  /* -------------------------------- pages ------------------------------- */
  let pageCount = 0;
  for (const p of pages) {
    const { created } = await upsert(db, {
      table: 'pages',
      matchSql: 'slug = ?',
      matchParams: [p.slug],
      columns: ['title', 'slug', 'subtitle', 'content', 'page_type', 'show_in_header', 'show_in_footer', 'display_order', 'is_active', 'meta_title', 'meta_description'],
      values: [p.title, p.slug, p.subtitle || null, p.content, p.page_type || 'custom', 0, p.show_in_footer ?? 1, p.display_order || 0, 1, p.title, p.meta_description || null],
    });
    if (created) pageCount += 1;
  }
  step('CMS pages', `${pageCount} new / ${pages.length}`);

  /* ----------------------------- menu items ----------------------------- */
  let menuCount = 0;
  for (const m of menuItems) {
    const { created } = await upsert(db, {
      table: 'menu_items',
      matchSql: 'location = ? AND label = ?',
      matchParams: [m.location, m.label],
      columns: ['location', 'label', 'url', 'open_new_tab', 'display_order', 'is_active'],
      values: [m.location, m.label, m.url, 0, m.display_order, 1],
    });
    if (created) menuCount += 1;
  }
  step('menu items', `${menuCount} new / ${menuItems.length}`);

  /* ------------------------- sample leads / messages -------------------- */
  const [existingEnquiries] = await db.query('SELECT COUNT(*) AS total FROM enquiries');
  let enquiryCount = 0;
  if (Number(existingEnquiries[0].total) === 0) {
    for (const [i, e] of sampleEnquiries.entries()) {
      const reference = `ENQ-DEMO${String(i + 1).padStart(3, '0')}`;
      const [res] = await db.execute(
        `INSERT INTO enquiries (reference, name, email, phone, city, qualification, preferred_mode, message,
                                source_page, status, priority, is_read, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [
          reference, e.name, e.email, e.phone, e.city, e.qualification, e.preferred_mode, e.message,
          '/courses', e.status, e.priority, e.status === 'new' ? 0 : 1, e.days_ago, e.days_ago,
        ]
      );
      for (const slug of e.courses) {
        const courseId = courseIdBySlug.get(slug);
        const title = courses.find((cc) => cc.slug === slug)?.title || slug;
        await db.execute('INSERT INTO enquiry_courses (enquiry_id, course_id, course_title) VALUES (?, ?, ?)', [res.insertId, courseId || null, title]);
        if (courseId) await db.execute('UPDATE courses SET enquiry_count = enquiry_count + 1 WHERE id = ?', [courseId]);
      }
      enquiryCount += 1;
    }
    step('sample enquiries', `${enquiryCount} leads`);
  } else {
    step('sample enquiries', 'skipped (table not empty)');
  }

  const [existingMessages] = await db.query('SELECT COUNT(*) AS total FROM contact_messages');
  if (Number(existingMessages[0].total) === 0) {
    for (const m of sampleMessages) {
      await db.execute(
        `INSERT INTO contact_messages (name, email, phone, subject, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [m.name, m.email, m.phone || null, m.subject, m.message, m.status, m.days_ago, m.days_ago]
      );
    }
    step('contact messages', `${sampleMessages.length} messages`);
  } else {
    step('contact messages', 'skipped (table not empty)');
  }

  await db.end();

  log('');
  log(`${c.green}${c.bold}  Seed complete.${c.reset}`);
  log('');
  if (adminCreated) {
    log(`  ${c.bold}Admin login${c.reset}  ${c.cyan}http://localhost:3000/admin/login${c.reset}`);
    log(`  email      ${ADMIN.email}`);
    log(`  password   ${ADMIN.password}`);
    log(`  ${c.yellow}Change this password after your first sign-in.${c.reset}`);
  } else {
    log(`  ${c.dim}Admin account already existed — password left unchanged.${c.reset}`);
  }
  log('');
  log(`  Start the site:  ${c.cyan}npm run dev${c.reset}`);
  log('');
}

main().catch((error) => {
  log(`${c.red}  Seed failed: ${error.message}${c.reset}`);
  console.error(error);
  process.exit(1);
});
