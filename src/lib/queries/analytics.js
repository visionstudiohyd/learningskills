import { query, queryOne, queryRaw } from '../db';
import { safe } from './helpers';

/**
 * Dashboard aggregates. Every figure is computed in SQL rather than by pulling
 * rows into Node — the counts stay correct as the tables grow and the dashboard
 * keeps rendering in one round of small queries.
 */

/** Headline KPI tiles. */
export async function getDashboardStats() {
  return safe(async () => {
    const row = await queryOne(`
      SELECT
        (SELECT COUNT(*) FROM enquiries)                                             AS enquiries_total,
        (SELECT COUNT(*) FROM enquiries WHERE is_read = 0)                           AS enquiries_unread,
        (SELECT COUNT(*) FROM enquiries WHERE status = 'new')                        AS enquiries_new,
        (SELECT COUNT(*) FROM enquiries WHERE status = 'converted')                  AS enquiries_converted,
        (SELECT COUNT(*) FROM enquiries WHERE DATE(created_at) = CURDATE())          AS enquiries_today,
        (SELECT COUNT(*) FROM enquiries WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))  AS enquiries_week,
        (SELECT COUNT(*) FROM enquiries WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS enquiries_month,
        (SELECT COUNT(*) FROM enquiries
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            AND created_at <  DATE_SUB(NOW(), INTERVAL 30 DAY))                      AS enquiries_prev_month,
        (SELECT COUNT(*) FROM contact_messages)                                      AS messages_total,
        (SELECT COUNT(*) FROM contact_messages WHERE status = 'new')                 AS messages_new,
        (SELECT COUNT(*) FROM courses)                                               AS courses_total,
        (SELECT COUNT(*) FROM courses WHERE is_active = 1)                           AS courses_active,
        (SELECT COUNT(*) FROM testimonials WHERE is_active = 1)                      AS testimonials_active,
        (SELECT COUNT(*) FROM pages WHERE is_active = 1)                             AS pages_active,
        (SELECT COALESCE(SUM(views), 0) FROM courses)                                AS course_views
    `);

    const thisMonth = Number(row?.enquiries_month || 0);
    const prevMonth = Number(row?.enquiries_prev_month || 0);
    const growth = prevMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - prevMonth) / prevMonth) * 100);

    const total = Number(row?.enquiries_total || 0);
    const converted = Number(row?.enquiries_converted || 0);

    return {
      ...Object.fromEntries(Object.entries(row || {}).map(([k, v]) => [k, Number(v) || 0])),
      enquiry_growth: growth,
      conversion_rate: total ? Math.round((converted / total) * 100) : 0,
    };
  }, {});
}

/** Enquiries per day for the trend chart. */
export async function getEnquiryTrend(days = 30) {
  const span = Math.min(Math.max(Number(days) || 30, 7), 365);
  return safe(async () => {
    const rows = await queryRaw(
      `SELECT DATE(created_at) AS day, COUNT(*) AS total
         FROM enquiries
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY day ASC`,
      [span]
    );

    // Backfill the quiet days so the chart has no gaps.
    const byDay = new Map(
      rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.total)])
    );
    const series = [];
    for (let i = span - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push({
        date: key,
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        enquiries: byDay.get(key) || 0,
      });
    }
    return series;
  }, []);
}

/** Status breakdown for the pipeline donut. */
export async function getEnquiryStatusBreakdown() {
  return safe(async () => {
    const rows = await query('SELECT status, COUNT(*) AS total FROM enquiries GROUP BY status');
    return rows.map((r) => ({ status: r.status, total: Number(r.total) }));
  }, []);
}

/** Which courses generate the most enquiries. */
export async function getTopCoursesByEnquiry(limit = 8) {
  const take = Math.min(Math.max(Number(limit) || 8, 1), 25);
  return safe(
    async () => {
      const rows = await queryRaw(
        `SELECT c.id, c.title, c.slug, c.views, COUNT(ec.id) AS enquiries
           FROM courses c
           LEFT JOIN enquiry_courses ec ON ec.course_id = c.id
          GROUP BY c.id, c.title, c.slug, c.views
          ORDER BY enquiries DESC, c.views DESC
          LIMIT ?`,
        [take]
      );
      return rows.map((r) => ({ ...r, enquiries: Number(r.enquiries), views: Number(r.views) }));
    },
    []
  );
}

/** Enquiry volume per course level — shows which audience is actually enquiring. */
export async function getEnquiriesByLevel() {
  return safe(async () => {
    const rows = await query(
      `SELECT COALESCE(c.level, 'Unspecified') AS level, COUNT(ec.id) AS total
         FROM enquiry_courses ec
         LEFT JOIN courses c ON c.id = ec.course_id
        GROUP BY level
        ORDER BY total DESC`
    );
    return rows.map((r) => ({ level: r.level, total: Number(r.total) }));
  }, []);
}

/** Preferred delivery mode split, useful for batch planning. */
export async function getPreferredModeSplit() {
  return safe(async () => {
    const rows = await query('SELECT preferred_mode AS mode, COUNT(*) AS total FROM enquiries GROUP BY preferred_mode');
    return rows.map((r) => ({ mode: r.mode, total: Number(r.total) }));
  }, []);
}

/** Newest enquiries for the dashboard inbox preview. */
export async function getRecentEnquiries(limit = 6) {
  const take = Math.min(Math.max(Number(limit) || 6, 1), 20);
  return safe(
    () =>
      queryRaw(
        `SELECT e.id, e.reference, e.name, e.email, e.phone, e.status, e.is_read, e.created_at,
                (SELECT GROUP_CONCAT(ec.course_title ORDER BY ec.id SEPARATOR ', ')
                   FROM enquiry_courses ec WHERE ec.enquiry_id = e.id) AS courses
           FROM enquiries e
          ORDER BY e.created_at DESC, e.id DESC
          LIMIT ?`,
        [take]
      ),
    []
  );
}

export async function getRecentMessages(limit = 5) {
  const take = Math.min(Math.max(Number(limit) || 5, 1), 20);
  return safe(
    () =>
      queryRaw(
        `SELECT id, name, email, subject, status, created_at
           FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT ?`,
        [take]
      ),
    []
  );
}

export async function getRecentActivity(limit = 10) {
  const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
  return safe(
    () =>
      queryRaw(
        `SELECT id, actor_name, action, entity_type, entity_id, description, created_at
           FROM activity_log ORDER BY created_at DESC, id DESC LIMIT ?`,
        [take]
      ),
    []
  );
}

/** Follow-ups that are due or overdue — the "do this today" list. */
export async function getDueFollowUps(limit = 6) {
  const take = Math.min(Math.max(Number(limit) || 6, 1), 20);
  return safe(
    () =>
      queryRaw(
        `SELECT id, reference, name, phone, email, follow_up_at, status
           FROM enquiries
          WHERE follow_up_at IS NOT NULL
            AND follow_up_at <= DATE_ADD(NOW(), INTERVAL 1 DAY)
            AND status NOT IN ('converted','closed','spam')
          ORDER BY follow_up_at ASC
          LIMIT ?`,
        [take]
      ),
    []
  );
}
