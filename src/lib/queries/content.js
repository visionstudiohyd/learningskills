import { query, queryOne, queryRaw } from '../db';
import { safe, clampLimit } from './helpers';

/* ------------------------------ HERO SLIDES ------------------------------- */
export async function getHeroSlides() {
  return safe(
    () =>
      query(
        `SELECT id, eyebrow, title, highlight, description, image, mobile_image, overlay_opacity,
                text_align, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link
           FROM hero_slides
          WHERE is_active = 1
          ORDER BY display_order ASC, id ASC`
      ),
    []
  );
}

/* ------------------------------ TESTIMONIALS ------------------------------ */
export async function getTestimonials({ limit = 9, featuredOnly = false } = {}) {
  return safe(async () => {
    const take = clampLimit(limit, 9, 60);
    const where = featuredOnly ? 'WHERE is_active = 1 AND is_featured = 1' : 'WHERE is_active = 1';
    return queryRaw(
      `SELECT id, name, designation, organisation, course_label, message, avatar, rating
         FROM testimonials
         ${where}
         ORDER BY is_featured DESC, display_order ASC, id DESC
         LIMIT ?`,
      [take]
    );
  }, []);
}

/* --------------------------- FEATURES / BENEFITS -------------------------- */
export async function getFeatures({ placement = 'home', limit = 8 } = {}) {
  return safe(async () => {
    const take = clampLimit(limit, 8, 24);
    return queryRaw(
      `SELECT id, icon, title, description, accent
         FROM site_features
        WHERE is_active = 1 AND (placement = ? OR placement = 'both')
        ORDER BY display_order ASC, id ASC
        LIMIT ?`,
      [placement, take]
    );
  }, []);
}

/* --------------------------------- STATS ---------------------------------- */
export async function getStats(limit = 4) {
  return safe(async () => {
    const take = clampLimit(limit, 4, 12);
    return queryRaw(
      `SELECT id, icon, label, value, prefix, suffix
         FROM site_stats
        WHERE is_active = 1
        ORDER BY display_order ASC, id ASC
        LIMIT ?`,
      [take]
    );
  }, []);
}

/* ---------------------------- LEARNING PROCESS ---------------------------- */
export async function getLearningSteps(limit = 6) {
  return safe(async () => {
    const take = clampLimit(limit, 6, 12);
    return queryRaw(
      `SELECT id, step_label, icon, title, description
         FROM learning_steps
        WHERE is_active = 1
        ORDER BY display_order ASC, id ASC
        LIMIT ?`,
      [take]
    );
  }, []);
}

/* -------------------------------- TRAINERS -------------------------------- */
export async function getTrainers(limit = 8) {
  return safe(async () => {
    const take = clampLimit(limit, 8, 40);
    return queryRaw(
      `SELECT id, name, designation, bio, photo, expertise, experience_years, linkedin_url, twitter_url, email
         FROM trainers
        WHERE is_active = 1
        ORDER BY display_order ASC, id ASC
        LIMIT ?`,
      [take]
    );
  }, []);
}

/* ---------------------------------- FAQs ---------------------------------- */
export async function getFaqs({ homeOnly = false, limit = 40 } = {}) {
  return safe(async () => {
    const take = clampLimit(limit, 40, 200);
    const where = homeOnly ? 'WHERE is_active = 1 AND show_on_home = 1' : 'WHERE is_active = 1';
    return queryRaw(
      `SELECT id, question, answer, category
         FROM faqs
         ${where}
         ORDER BY display_order ASC, id ASC
         LIMIT ?`,
      [take]
    );
  }, []);
}

/** FAQs grouped by category for the dedicated FAQ page. */
export async function getFaqsGrouped() {
  const rows = await getFaqs({ limit: 200 });
  const groups = new Map();
  for (const row of rows) {
    const key = row.category || 'General';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}

/* --------------------------------- PAGES ---------------------------------- */
export async function getPageBySlug(slug) {
  return safe(
    () =>
      queryOne(
        `SELECT id, title, slug, subtitle, content, banner_image, meta_title, meta_description, meta_keywords, updated_at
           FROM pages
          WHERE slug = ? AND is_active = 1
          LIMIT 1`,
        [String(slug)]
      ),
    null
  );
}

export async function getPagesForNav(location = 'footer') {
  const column = location === 'header' ? 'show_in_header' : 'show_in_footer';
  return safe(
    () =>
      query(
        `SELECT title, slug FROM pages WHERE is_active = 1 AND ${column} = 1 ORDER BY display_order ASC, title ASC`
      ),
    []
  );
}

export async function getAllPageSlugs() {
  return safe(() => query('SELECT slug, updated_at FROM pages WHERE is_active = 1'), []);
}

/* ------------------------------ NAVIGATION -------------------------------- */
/** Menu items for one location, nested one level deep. */
export async function getMenu(location = 'header') {
  const rows = await safe(
    () =>
      query(
        `SELECT id, label, url, parent_id, open_new_tab
           FROM menu_items
          WHERE location = ? AND is_active = 1
          ORDER BY display_order ASC, id ASC`,
        [location]
      ),
    []
  );

  const tops = rows.filter((r) => !r.parent_id);
  return tops.map((item) => ({
    ...item,
    children: rows.filter((r) => r.parent_id === item.id),
  }));
}
