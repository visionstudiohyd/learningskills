import { query } from '@/lib/db';

/**
 * NOT NULL column introspection.
 *
 * Several columns are `NOT NULL DEFAULT '…'` in the schema — `courses.language`
 * ('English'), `faqs.category` ('General'), `site_features.icon` ('Sparkles'),
 * `learning_steps.step_label` ('01') and others. The Zod schemas treat those
 * fields as optional and normalise an empty input to `null`, which MySQL then
 * rejects outright: "Column 'language' cannot be null".
 *
 * Rather than hand-maintaining a list that would silently rot whenever the
 * schema changes, we ask the database which columns refuse NULL and skip those
 * from the statement when the value is null. The effect is what the admin
 * expects:
 *
 *   • on INSERT the column is omitted, so the schema's DEFAULT applies;
 *   • on UPDATE the column is left alone, so the existing value survives.
 *
 * The answer is cached per table for the lifetime of the process — the schema
 * does not change at runtime, and it keeps this to one small query per table.
 */

const globalForColumns = globalThis;

function cache() {
  if (!globalForColumns.__cepNotNullColumns) {
    globalForColumns.__cepNotNullColumns = new Map();
  }
  return globalForColumns.__cepNotNullColumns;
}

/**
 * Column names in `table` that reject NULL and have a default to fall back on.
 * Returns an empty set if introspection fails, which degrades to the previous
 * behaviour rather than blocking the save.
 */
export async function getNotNullColumns(table) {
  const store = cache();
  if (store.has(table)) return store.get(table);

  let columns = new Set();
  try {
    const rows = await query(
      `SELECT COLUMN_NAME AS name
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND IS_NULLABLE = 'NO'`,
      [table]
    );
    columns = new Set(rows.map((r) => r.name));
  } catch {
    /* introspection unavailable — fall through with an empty set */
  }

  store.set(table, columns);
  return columns;
}

/** Forget the cached shape of a table (used by the migration/test helpers). */
export function invalidateColumnCache(table = null) {
  const store = cache();
  if (table) store.delete(table);
  else store.clear();
}
