import { query, queryOne, queryRaw, execute } from '../db';
import { safe, clampLimit, clampPage, paginate } from './helpers';

/* ===========================================================================
   COURSE LISTING  (search + filters + sorting + pagination)
   =========================================================================== */

const SORT_OPTIONS = {
  featured: 'c.is_featured DESC, c.display_order ASC, c.id DESC',
  popular: 'c.is_popular DESC, c.students_enrolled DESC, c.id DESC',
  newest: 'c.created_at DESC, c.id DESC',
  title_asc: 'c.title ASC',
  title_desc: 'c.title DESC',
  rating: 'c.rating DESC, c.reviews_count DESC',
  duration: 'c.duration_weeks IS NULL, c.duration_weeks ASC',
};

export const SORT_LABELS = [
  { value: 'featured', label: 'Recommended' },
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest first' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'duration', label: 'Shortest duration' },
  { value: 'title_asc', label: 'Title A – Z' },
];

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
export const DELIVERY_MODES = ['Online', 'Classroom', 'Hybrid', 'Self Paced'];

const CARD_FIELDS = `c.id, c.title, c.slug, c.short_description, c.thumbnail, c.duration, c.duration_weeks,
  c.lessons_count, c.level, c.delivery_mode, c.language, c.fee_text, c.price, c.discount_price, c.rating,
  c.reviews_count, c.students_enrolled, c.is_featured, c.is_popular, c.certification`;

/**
 * The public /courses query. Every filter is optional and every value is bound
 * as a parameter; only the ORDER BY is interpolated, and only from the
 * SORT_OPTIONS allow-list.
 */
export async function getCourses({
  search = '',
  level = '',
  mode = '',
  sort = 'featured',
  page = 1,
  perPage = 9,
  activeOnly = true,
  featuredOnly = false,
} = {}) {
  const currentPage = clampPage(page);
  const limit = clampLimit(perPage, 9, 48);
  const offset = (currentPage - 1) * limit;

  return safe(async () => {
    const where = [];
    const params = [];

    if (activeOnly) where.push('c.is_active = 1');
    if (featuredOnly) where.push('c.is_featured = 1');

    if (search) {
      where.push('(c.title LIKE ? OR c.short_description LIKE ? OR c.code LIKE ?)');
      const term = `%${String(search).trim()}%`;
      params.push(term, term, term);
    }

    const levels = (Array.isArray(level) ? level : [level]).filter((v) => LEVELS.includes(v));
    if (levels.length) {
      where.push(`c.level IN (${levels.map(() => '?').join(',')})`);
      params.push(...levels);
    }

    const modes = (Array.isArray(mode) ? mode : [mode]).filter((v) => DELIVERY_MODES.includes(v));
    if (modes.length) {
      where.push(`c.delivery_mode IN (${modes.map(() => '?').join(',')})`);
      params.push(...modes);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = SORT_OPTIONS[sort] || SORT_OPTIONS.featured;

    const items = await query(
      `SELECT ${CARD_FIELDS}
         FROM courses c
         ${whereSql}
         ORDER BY ${orderSql}
         LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const totalRow = await queryOne(`SELECT COUNT(*) AS total FROM courses c ${whereSql}`, params);

    return paginate(items, totalRow?.total, currentPage, limit);
  }, paginate([], 0, currentPage, limit));
}

export async function getFeaturedCourses(limit = 6) {
  return safe(async () => {
    const take = clampLimit(limit, 6, 24);
    return queryRaw(
      `SELECT ${CARD_FIELDS}
         FROM courses c
        WHERE c.is_active = 1
        ORDER BY c.is_featured DESC, c.display_order ASC, c.id DESC
        LIMIT ?`,
      [take]
    );
  }, []);
}

export async function getPopularCourses(limit = 6) {
  return safe(async () => {
    const take = clampLimit(limit, 6, 24);
    return queryRaw(
      `SELECT ${CARD_FIELDS}
         FROM courses c
        WHERE c.is_active = 1
        ORDER BY c.is_popular DESC, c.students_enrolled DESC, c.display_order ASC
        LIMIT ?`,
      [take]
    );
  }, []);
}

/**
 * Courses listed in the header dropdown and the footer column.
 * Featured first, then the most enrolled — so the menu leads with the
 * programmes most likely to be wanted.
 */
export async function getMenuCourses(limit = 6) {
  return safe(async () => {
    const take = clampLimit(limit, 6, 12);
    return queryRaw(
      `SELECT c.id, c.title, c.slug, c.duration, c.level, c.delivery_mode, c.thumbnail
         FROM courses c
        WHERE c.is_active = 1
        ORDER BY c.is_featured DESC, c.is_popular DESC, c.students_enrolled DESC, c.display_order ASC
        LIMIT ?`,
      [take]
    );
  }, []);
}

export async function getRelatedCourses(courseId, limit = 3) {
  return safe(async () => {
    const take = clampLimit(limit, 3, 12);
    return queryRaw(
      `SELECT ${CARD_FIELDS}
         FROM courses c
        WHERE c.is_active = 1 AND c.id <> ?
        ORDER BY c.is_featured DESC, c.is_popular DESC, c.students_enrolled DESC
        LIMIT ?`,
      [Number(courseId), take]
    );
  }, []);
}

/** Minimal list used by the enquiry form's multi-select and the shortlist drawer. */
export async function getCourseOptions() {
  return safe(
    () =>
      query(
        `SELECT c.id, c.title, c.slug, c.duration, c.level
           FROM courses c
          WHERE c.is_active = 1
          ORDER BY c.display_order ASC, c.title ASC`
      ),
    []
  );
}

export async function getCoursesByIds(ids = []) {
  const clean = (Array.isArray(ids) ? ids : [ids])
    .map((v) => Number.parseInt(v, 10))
    .filter((v) => Number.isInteger(v) && v > 0)
    .slice(0, 30);
  if (!clean.length) return [];

  return safe(
    () =>
      query(
        `SELECT c.id, c.title, c.slug, c.duration, c.level, c.thumbnail
           FROM courses c
          WHERE c.id IN (${clean.map(() => '?').join(',')}) AND c.is_active = 1
          ORDER BY c.title ASC`,
        clean
      ),
    []
  );
}

/* ===========================================================================
   SINGLE COURSE  (+ all relations)
   =========================================================================== */

export async function getCourseBySlug(slug) {
  return safe(async () => {
    const course = await queryOne(
      `SELECT c.* FROM courses c WHERE c.slug = ? AND c.is_active = 1 LIMIT 1`,
      [String(slug)]
    );
    if (!course) return null;

    const [outcomes, syllabus, highlights, faqs, testimonials] = await Promise.all([
      query('SELECT id, outcome FROM course_outcomes WHERE course_id = ? ORDER BY display_order, id', [course.id]),
      query(
        'SELECT id, module_title, description, topics, duration FROM course_syllabus WHERE course_id = ? ORDER BY display_order, id',
        [course.id]
      ),
      query(
        'SELECT id, icon, title, description FROM course_highlights WHERE course_id = ? ORDER BY display_order, id',
        [course.id]
      ),
      query(
        'SELECT id, question, answer FROM course_faqs WHERE course_id = ? AND is_active = 1 ORDER BY display_order, id',
        [course.id]
      ),
      query(
        `SELECT id, name, designation, organisation, message, avatar, rating, course_label
           FROM testimonials WHERE course_id = ? AND is_active = 1 ORDER BY display_order, id LIMIT 4`,
        [course.id]
      ),
    ]);

    return { ...course, outcomes, syllabus, highlights, faqs, testimonials };
  }, null);
}

/** Admin editor fetch — ignores is_active so drafts can be opened. */
export async function getCourseForEdit(id) {
  const course = await queryOne('SELECT * FROM courses WHERE id = ? LIMIT 1', [Number(id)]);
  if (!course) return null;

  const [outcomes, syllabus, highlights, faqs] = await Promise.all([
    query('SELECT id, outcome FROM course_outcomes WHERE course_id = ? ORDER BY display_order, id', [course.id]),
    query(
      'SELECT id, module_title, description, topics, duration FROM course_syllabus WHERE course_id = ? ORDER BY display_order, id',
      [course.id]
    ),
    query('SELECT id, icon, title, description FROM course_highlights WHERE course_id = ? ORDER BY display_order, id', [
      course.id,
    ]),
    query('SELECT id, question, answer FROM course_faqs WHERE course_id = ? ORDER BY display_order, id', [course.id]),
  ]);

  return { ...course, outcomes, syllabus, highlights, faqs };
}

export async function getAllCourseSlugs() {
  return safe(() => query('SELECT slug, updated_at FROM courses WHERE is_active = 1'), []);
}

/** Fire-and-forget view counter — must never block or break a page render. */
export async function incrementCourseViews(courseId) {
  try {
    await execute('UPDATE courses SET views = views + 1 WHERE id = ?', [Number(courseId)]);
  } catch {
    /* non-critical */
  }
}
