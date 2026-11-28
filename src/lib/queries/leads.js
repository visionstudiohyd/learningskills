import { query, queryOne, queryRaw, execute, insert, transaction } from '../db';
import { clampLimit, clampPage, paginate } from './helpers';
import { makeReference } from '../utils';

/* ===========================================================================
   ENQUIRIES  (writes — these intentionally throw so the form can report failure)
   =========================================================================== */

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New', tone: 'brand' },
  { value: 'contacted', label: 'Contacted', tone: 'teal' },
  { value: 'follow_up', label: 'Follow up', tone: 'accent' },
  { value: 'converted', label: 'Converted', tone: 'success' },
  { value: 'closed', label: 'Closed', tone: 'neutral' },
  { value: 'spam', label: 'Spam', tone: 'danger' },
];

/**
 * Store an enquiry and its selected courses atomically: a lead with a missing
 * course list is worse than no lead, so both inserts share one transaction.
 */
export async function createEnquiry(data, meta = {}) {
  const reference = makeReference('ENQ');

  return transaction(async (conn) => {
    const [result] = await conn.execute(
      `INSERT INTO enquiries
         (reference, name, email, phone, city, qualification, preferred_mode, preferred_time,
          message, source_page, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reference,
        data.name,
        data.email,
        data.phone,
        data.city ?? null,
        data.qualification ?? null,
        data.preferred_mode || 'No Preference',
        data.preferred_time ?? null,
        data.message ?? null,
        data.source_page ?? null,
        meta.ip ?? null,
        meta.userAgent ? String(meta.userAgent).slice(0, 400) : null,
      ]
    );

    const enquiryId = result.insertId;
    const ids = Array.isArray(data.course_ids) ? data.course_ids.filter(Boolean) : [];

    if (ids.length) {
      const [courses] = await conn.query(
        `SELECT id, title FROM courses WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      );
      for (const course of courses) {
        await conn.execute(
          'INSERT INTO enquiry_courses (enquiry_id, course_id, course_title) VALUES (?, ?, ?)',
          [enquiryId, course.id, course.title]
        );
      }
      if (courses.length) {
        await conn.query(
          `UPDATE courses SET enquiry_count = enquiry_count + 1 WHERE id IN (${courses.map(() => '?').join(',')})`,
          courses.map((c) => c.id)
        );
      }
    }

    return { id: enquiryId, reference, courseCount: ids.length };
  });
}

export async function getEnquiries({
  search = '',
  status = '',
  priority = '',
  courseId = null,
  unreadOnly = false,
  from = '',
  to = '',
  page = 1,
  perPage = 20,
} = {}) {
  const currentPage = clampPage(page);
  const limit = clampLimit(perPage, 20, 100);
  const offset = (currentPage - 1) * limit;

  const where = [];
  const params = [];

  if (search) {
    where.push('(e.name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.reference LIKE ?)');
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term, term);
  }
  if (status && ENQUIRY_STATUSES.some((s) => s.value === status)) {
    where.push('e.status = ?');
    params.push(status);
  }
  if (priority && ['low', 'medium', 'high'].includes(priority)) {
    where.push('e.priority = ?');
    params.push(priority);
  }
  if (unreadOnly) where.push('e.is_read = 0');
  if (courseId) {
    where.push('EXISTS (SELECT 1 FROM enquiry_courses ec WHERE ec.enquiry_id = e.id AND ec.course_id = ?)');
    params.push(Number(courseId));
  }
  if (from) {
    where.push('e.created_at >= ?');
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where.push('e.created_at <= ?');
    params.push(`${to} 23:59:59`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const items = await query(
    `SELECT e.id, e.reference, e.name, e.email, e.phone, e.city, e.preferred_mode, e.status,
            e.priority, e.is_read, e.created_at, e.follow_up_at, e.source_page,
            u.name AS assignee_name,
            (SELECT GROUP_CONCAT(ec.course_title ORDER BY ec.id SEPARATOR ' | ')
               FROM enquiry_courses ec WHERE ec.enquiry_id = e.id) AS courses
       FROM enquiries e
       LEFT JOIN admin_users u ON u.id = e.assigned_to
       ${whereSql}
       ORDER BY e.created_at DESC, e.id DESC
       LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const totalRow = await queryOne(`SELECT COUNT(*) AS total FROM enquiries e ${whereSql}`, params);
  return paginate(items, totalRow?.total, currentPage, limit);
}

export async function getEnquiryById(id) {
  const enquiry = await queryOne(
    `SELECT e.*, u.name AS assignee_name
       FROM enquiries e
       LEFT JOIN admin_users u ON u.id = e.assigned_to
      WHERE e.id = ? LIMIT 1`,
    [Number(id)]
  );
  if (!enquiry) return null;

  const courses = await query(
    `SELECT ec.course_id, ec.course_title, c.slug, c.duration, c.level
       FROM enquiry_courses ec
       LEFT JOIN courses c ON c.id = ec.course_id
      WHERE ec.enquiry_id = ?
      ORDER BY ec.id`,
    [enquiry.id]
  );

  return { ...enquiry, courses };
}

export async function markEnquiryRead(id) {
  return execute('UPDATE enquiries SET is_read = 1 WHERE id = ?', [Number(id)]);
}

export async function updateEnquiry(id, patch) {
  const fields = [];
  const params = [];

  const map = {
    status: 'status',
    priority: 'priority',
    admin_notes: 'admin_notes',
    assigned_to: 'assigned_to',
    follow_up_at: 'follow_up_at',
    is_read: 'is_read',
  };

  for (const [key, column] of Object.entries(map)) {
    if (patch[key] === undefined) continue;
    let value = patch[key];
    if (key === 'is_read') value = value ? 1 : 0;
    if (key === 'follow_up_at' && !value) value = null;
    if (key === 'assigned_to' && !value) value = null;
    fields.push(`${column} = ?`);
    params.push(value);
  }

  if (!fields.length) return 0;
  params.push(Number(id));
  return execute(`UPDATE enquiries SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function deleteEnquiry(id) {
  return execute('DELETE FROM enquiries WHERE id = ?', [Number(id)]);
}

/** CSV export of the current filter selection. */
export async function exportEnquiries(filters = {}) {
  const { items } = await getEnquiries({ ...filters, page: 1, perPage: 100 });
  return items;
}

/* ===========================================================================
   CONTACT MESSAGES
   =========================================================================== */

export async function createContactMessage(data, meta = {}) {
  return insert(
    `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.name, data.email, data.phone ?? null, data.subject ?? null, data.message, meta.ip ?? null]
  );
}

export async function getContactMessages({ search = '', status = '', page = 1, perPage = 20 } = {}) {
  const currentPage = clampPage(page);
  const limit = clampLimit(perPage, 20, 100);
  const offset = (currentPage - 1) * limit;

  const where = [];
  const params = [];
  if (search) {
    where.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term, term);
  }
  if (status && ['new', 'read', 'replied', 'archived', 'spam'].includes(status)) {
    where.push('status = ?');
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const items = await query(
    `SELECT id, name, email, phone, subject, message, status, created_at
       FROM contact_messages
       ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  const totalRow = await queryOne(`SELECT COUNT(*) AS total FROM contact_messages ${whereSql}`, params);
  return paginate(items, totalRow?.total, currentPage, limit);
}

export async function getContactMessageById(id) {
  return queryOne('SELECT * FROM contact_messages WHERE id = ? LIMIT 1', [Number(id)]);
}

export async function updateContactMessage(id, patch) {
  const fields = [];
  const params = [];
  if (patch.status !== undefined) {
    fields.push('status = ?');
    params.push(patch.status);
  }
  if (patch.admin_notes !== undefined) {
    fields.push('admin_notes = ?');
    params.push(patch.admin_notes);
  }
  if (!fields.length) return 0;
  params.push(Number(id));
  return execute(`UPDATE contact_messages SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function deleteContactMessage(id) {
  return execute('DELETE FROM contact_messages WHERE id = ?', [Number(id)]);
}

