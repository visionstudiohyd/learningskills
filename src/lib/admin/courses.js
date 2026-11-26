import { transaction, queryOne } from '@/lib/db';
import { courseSchema, safeParse } from '@/lib/validation';
import { nullIfBlank, slugify, toTinyInt } from '@/lib/utils';
import { getNotNullColumns } from './columns';

/**
 * Course writes.
 *
 * A course owns four child tables — outcomes, highlights, syllabus modules and
 * FAQs. They are replaced wholesale inside one transaction rather than diffed:
 * the editor submits the complete intended state, so delete-then-insert is both
 * simpler and immune to the ordering bugs a partial diff invites. If any part
 * fails, the whole save rolls back and the course is left exactly as it was.
 */

const COURSE_COLUMNS = [
  'title', 'slug', 'code', 'short_description', 'overview', 'who_should_attend',
  'eligibility', 'career_opportunities', 'certification', 'thumbnail', 'banner_image', 'duration',
  'duration_weeks', 'lessons_count', 'level', 'delivery_mode', 'language', 'fee_text', 'price',
  'discount_price', 'rating', 'reviews_count', 'students_enrolled', 'is_featured', 'is_popular',
  'is_active', 'display_order', 'meta_title', 'meta_description', 'meta_keywords',
];

const BOOLEAN_COLUMNS = new Set(['is_featured', 'is_popular', 'is_active']);
const NULLABLE_NUMBERS = new Set(['duration_weeks', 'lessons_count', 'price', 'discount_price']);

/** Ensure the slug is unique within `courses`, excluding the row being edited. */
async function uniqueCourseSlug(desired, title, excludeId = null) {
  let base = slugify(desired || title || '') || 'course';
  let candidate = base;

  for (let i = 2; i < 60; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const clash = await queryOne(
      `SELECT id FROM courses WHERE slug = ? ${excludeId ? 'AND id <> ?' : ''} LIMIT 1`,
      excludeId ? [candidate, Number(excludeId)] : [candidate]
    );
    if (!clash) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function toCourseValues(data) {
  const columns = [];
  const values = [];
  // Columns such as `language` are NOT NULL with a default; a blank input
  // becomes null, so they are skipped rather than written as null.
  const notNull = await getNotNullColumns('courses');

  for (const column of COURSE_COLUMNS) {
    if (!(column in data)) continue;
    let value = data[column];

    if (BOOLEAN_COLUMNS.has(column)) {
      value = toTinyInt(value);
    } else if (NULLABLE_NUMBERS.has(column)) {
      value = value === '' || value === null || value === undefined ? null : Number(value);
    } else if (typeof value === 'string') {
      value = nullIfBlank(value);
    } else if (value === undefined) {
      value = null;
    }

    if (value === null && notNull.has(column)) continue;

    columns.push(column);
    values.push(value);
  }

  return { columns, values };
}

/** Replace a course's child rows. Runs inside the caller's transaction. */
async function replaceChildren(conn, courseId, data) {
  const children = [
    {
      table: 'course_outcomes',
      rows: (data.outcomes || []).filter((o) => o.outcome?.trim()),
      columns: ['outcome', 'display_order'],
      map: (row, i) => [row.outcome.trim(), i],
    },
    {
      table: 'course_highlights',
      rows: (data.highlights || []).filter((h) => h.title?.trim()),
      columns: ['icon', 'title', 'description', 'display_order'],
      map: (row, i) => [nullIfBlank(row.icon) || 'Sparkles', row.title.trim(), nullIfBlank(row.description), i],
    },
    {
      table: 'course_syllabus',
      rows: (data.syllabus || []).filter((m) => m.module_title?.trim()),
      columns: ['module_title', 'description', 'topics', 'duration', 'display_order'],
      map: (row, i) => [
        row.module_title.trim(),
        nullIfBlank(row.description),
        nullIfBlank(row.topics),
        nullIfBlank(row.duration),
        i,
      ],
    },
    {
      table: 'course_faqs',
      rows: (data.faqs || []).filter((f) => f.question?.trim() && f.answer?.trim()),
      columns: ['question', 'answer', 'display_order', 'is_active'],
      map: (row, i) => [row.question.trim(), row.answer.trim(), i, 1],
    },
  ];

  for (const child of children) {
    // eslint-disable-next-line no-await-in-loop
    await conn.execute(`DELETE FROM \`${child.table}\` WHERE course_id = ?`, [courseId]);

    for (const [index, row] of child.rows.entries()) {
      const columns = ['course_id', ...child.columns];
      const values = [courseId, ...child.map(row, index)];
      // eslint-disable-next-line no-await-in-loop
      await conn.execute(
        `INSERT INTO \`${child.table}\` (${columns.map((c) => `\`${c}\``).join(', ')})
         VALUES (${columns.map(() => '?').join(', ')})`,
        values
      );
    }
  }
}

/**
 * Create or update a course and all of its children.
 * @returns {{ id?: number, slug?: string, errors?: object }}
 */
export async function saveCourse(payload, id = null) {
  const isUpdate = Boolean(id);

  let base = payload;
  if (isUpdate) {
    const existing = await queryOne('SELECT * FROM courses WHERE id = ? LIMIT 1', [Number(id)]);
    if (!existing) {
      const error = new Error('Course not found.');
      error.status = 404;
      throw error;
    }
    // Merge so a partial submission still validates against the full record.
    base = { ...existing, ...payload };
  }

  const parsed = safeParse(courseSchema, base);
  if (!parsed.success) return { errors: parsed.errors };

  const data = parsed.data;
  data.slug = await uniqueCourseSlug(data.slug, data.title, isUpdate ? id : null);

  const { columns, values } = await toCourseValues(data);

  return transaction(async (conn) => {
    let courseId = Number(id);

    if (isUpdate) {
      await conn.execute(
        `UPDATE courses SET ${columns.map((c) => `\`${c}\` = ?`).join(', ')} WHERE id = ?`,
        [...values, courseId]
      );
    } else {
      const [result] = await conn.execute(
        `INSERT INTO courses (${columns.map((c) => `\`${c}\``).join(', ')})
         VALUES (${columns.map(() => '?').join(', ')})`,
        values
      );
      courseId = result.insertId;
    }

    await replaceChildren(conn, courseId, data);

    return { id: courseId, slug: data.slug, title: data.title };
  });
}
