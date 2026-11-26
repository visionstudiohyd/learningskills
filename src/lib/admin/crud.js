import { query, queryOne, execute, insert } from '@/lib/db';
import { clampLimit, clampPage, paginate } from '@/lib/queries/helpers';
import { slugify, toTinyInt } from '@/lib/utils';
import { invalidateSettings } from '@/lib/settings';
import { safeParse } from '@/lib/validation';
import { getNotNullColumns } from './columns';

/**
 * Generic CRUD over a registered resource.
 *
 * Every identifier that reaches SQL comes from the registry — the table name,
 * the sortable columns, the writable columns — and every value is bound as a
 * parameter. A request can name a resource key, but it can never name a table
 * or a column, so the dynamic `[resource]` route cannot be turned into
 * arbitrary SQL.
 */

/** Only these field types map to a real column we are willing to write. */
const BOOLEAN_TYPES = new Set(['boolean']);
const NUMERIC_TYPES = new Set(['number']);

function columnAllowed(resource, column) {
  return resource.fields.some((f) => f.name === column);
}

/** Build the ORDER BY clause from the registry, never from the request. */
function resolveSort(resource, sortKey, direction) {
  if (!sortKey) return resource.defaultSort || 'id DESC';
  const sortable = new Set([
    ...resource.listColumns.map((c) => c.key),
    'id',
    'created_at',
    'updated_at',
    'display_order',
  ]);
  if (!sortable.has(sortKey)) return resource.defaultSort || 'id DESC';
  // Computed list columns (e.g. course_count) are aliases, not base columns —
  // sorting by the alias is fine in MySQL's ORDER BY.
  const dir = String(direction).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return `${sortKey} ${dir}`;
}

/* -------------------------------------------------------------------------- */
/*  LIST                                                                      */
/* -------------------------------------------------------------------------- */
export async function listResource(resource, params = {}) {
  const page = clampPage(params.page);
  const perPage = clampLimit(params.perPage, 20, 100);
  const offset = (page - 1) * perPage;

  const where = [];
  const values = [];

  if (params.search && resource.searchColumns?.length) {
    const term = `%${String(params.search).trim()}%`;
    where.push(`(${resource.searchColumns.map((c) => `t.${c} LIKE ?`).join(' OR ')})`);
    resource.searchColumns.forEach(() => values.push(term));
  }

  // Simple equality filters, restricted to real fields.
  for (const [key, value] of Object.entries(params.filters || {})) {
    if (value === '' || value === undefined || value === null) continue;
    if (!columnAllowed(resource, key)) continue;
    const field = resource.fields.find((f) => f.name === key);
    where.push(`t.${key} = ?`);
    values.push(BOOLEAN_TYPES.has(field.type) ? toTinyInt(value) : value);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const extras = resource.listExtras ? `, ${resource.listExtras}` : '';
  const orderSql = resolveSort(resource, params.sort, params.direction);

  const rows = await query(
    `SELECT t.*${extras} FROM \`${resource.table}\` t ${whereSql} ORDER BY ${orderSql} LIMIT ${perPage} OFFSET ${offset}`,
    values
  );

  const totalRow = await queryOne(
    `SELECT COUNT(*) AS total FROM \`${resource.table}\` t ${whereSql}`,
    values
  );

  return paginate(rows, totalRow?.total, page, perPage);
}

/* -------------------------------------------------------------------------- */
/*  READ ONE                                                                  */
/* -------------------------------------------------------------------------- */
export async function getResourceRow(resource, id) {
  return queryOne(`SELECT * FROM \`${resource.table}\` WHERE id = ? LIMIT 1`, [Number(id)]);
}

/* -------------------------------------------------------------------------- */
/*  SLUG UNIQUENESS                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Produce a slug that is unique within the table, appending -2, -3 … when
 * needed. Done in a loop against the database rather than trusting the client,
 * because the UNIQUE index would otherwise surface as a raw duplicate-key error.
 */
export async function uniqueSlug(resource, desired, sourceValue, excludeId = null) {
  const field = resource.slug.field;
  let base = slugify(desired || sourceValue || '');
  if (!base) base = 'item';

  let candidate = base;
  let suffix = 1;

  // Bounded: a table would need thousands of identical titles to exhaust this.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const clash = await queryOne(
      `SELECT id FROM \`${resource.table}\` WHERE ${field} = ? ${excludeId ? 'AND id <> ?' : ''} LIMIT 1`,
      excludeId ? [candidate, Number(excludeId)] : [candidate]
    );
    if (!clash) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

/* -------------------------------------------------------------------------- */
/*  PAYLOAD -> COLUMNS                                                        */
/* -------------------------------------------------------------------------- */
async function toColumnValues(resource, data) {
  const columns = [];
  const values = [];
  // Columns like `faqs.category` and `site_features.icon` are NOT NULL with a
  // default, while their fields are optional — so a blank input must be skipped
  // rather than written as null. See lib/admin/columns.js.
  const notNull = await getNotNullColumns(resource.table);

  for (const field of resource.fields) {
    if (!(field.name in data)) continue;
    let value = data[field.name];

    if (BOOLEAN_TYPES.has(field.type)) value = toTinyInt(value);
    else if (NUMERIC_TYPES.has(field.type)) value = value === '' || value === null ? null : Number(value);
    else if (value === '') value = null;
    if (value === undefined) value = null;

    if (value === null && notNull.has(field.name)) continue;

    columns.push(field.name);
    values.push(value);
  }

  return { columns, values };
}

/* -------------------------------------------------------------------------- */
/*  CREATE                                                                    */
/* -------------------------------------------------------------------------- */
export async function createResourceRow(resource, payload) {
  const parsed = safeParse(resource.schema, payload);
  if (!parsed.success) return { errors: parsed.errors };

  const data = { ...parsed.data };

  if (resource.slug) {
    data[resource.slug.field] = await uniqueSlug(resource, data[resource.slug.field], data[resource.slug.from]);
  }

  const { columns, values } = await toColumnValues(resource, data);
  if (!columns.length) {
    return { errors: { form: 'Nothing to save.' } };
  }

  const id = await insert(
    `INSERT INTO \`${resource.table}\` (${columns.map((c) => `\`${c}\``).join(', ')})
     VALUES (${columns.map(() => '?').join(', ')})`,
    values
  );

  if (resource.table === 'settings') invalidateSettings();

  return { id, data };
}

/* -------------------------------------------------------------------------- */
/*  UPDATE                                                                    */
/* -------------------------------------------------------------------------- */
export async function updateResourceRow(resource, id, payload) {
  const existing = await getResourceRow(resource, id);
  if (!existing) {
    const error = new Error(`${resource.singular} not found.`);
    error.status = 404;
    throw error;
  }

  // Merge so a partial PATCH validates against the full current record.
  const merged = { ...existing, ...payload };
  const parsed = safeParse(resource.schema, merged);
  if (!parsed.success) return { errors: parsed.errors };

  const data = { ...parsed.data };

  if (resource.slug) {
    data[resource.slug.field] = await uniqueSlug(
      resource,
      data[resource.slug.field],
      data[resource.slug.from],
      id
    );
  }

  const { columns, values } = await toColumnValues(resource, data);
  if (!columns.length) return { id: Number(id), data };

  await execute(
    `UPDATE \`${resource.table}\` SET ${columns.map((c) => `\`${c}\` = ?`).join(', ')} WHERE id = ?`,
    [...values, Number(id)]
  );

  return { id: Number(id), data };
}

/* -------------------------------------------------------------------------- */
/*  DELETE                                                                    */
/* -------------------------------------------------------------------------- */
export async function deleteResourceRow(resource, id) {
  const existing = await getResourceRow(resource, id);
  if (!existing) {
    const error = new Error(`${resource.singular} not found.`);
    error.status = 404;
    throw error;
  }

  // Protect the system pages that the footer and legal links depend on.
  if (resource.table === 'pages' && existing.page_type === 'system') {
    const error = new Error(
      'This is a system page (such as the privacy policy). You can deactivate it, but it cannot be deleted.'
    );
    error.status = 409;
    throw error;
  }

  await execute(`DELETE FROM \`${resource.table}\` WHERE id = ?`, [Number(id)]);
  return existing;
}

/* -------------------------------------------------------------------------- */
/*  TOGGLE / REORDER                                                          */
/* -------------------------------------------------------------------------- */
export async function toggleResourceColumn(resource, id, column) {
  if (!columnAllowed(resource, column)) {
    const error = new Error('That field cannot be toggled.');
    error.status = 400;
    throw error;
  }
  const field = resource.fields.find((f) => f.name === column);
  if (!BOOLEAN_TYPES.has(field.type)) {
    const error = new Error('That field is not a switch.');
    error.status = 400;
    throw error;
  }

  const row = await getResourceRow(resource, id);
  if (!row) {
    const error = new Error(`${resource.singular} not found.`);
    error.status = 404;
    throw error;
  }

  const next = Number(row[column]) === 1 ? 0 : 1;
  await execute(`UPDATE \`${resource.table}\` SET \`${column}\` = ? WHERE id = ?`, [next, Number(id)]);
  return { id: Number(id), column, value: next };
}

/** Persist a new display order from a drag-and-drop reorder. */
export async function reorderResource(resource, orderedIds = []) {
  if (!resource.reorderable) {
    const error = new Error('This list cannot be reordered.');
    error.status = 400;
    throw error;
  }

  const ids = orderedIds.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0);
  if (!ids.length) return 0;

  for (const [index, id] of ids.entries()) {
    await execute(`UPDATE \`${resource.table}\` SET display_order = ? WHERE id = ?`, [index + 1, id]);
  }

  return ids.length;
}
