/**
 * Shared guards for the read layer.
 *
 * Public pages are rendered on the server, so one unreachable database would
 * otherwise turn the whole site into a 500. `safe()` degrades a failed read to
 * an empty result and logs it in development instead — the page still renders,
 * the section is simply empty. Writes never use this: a failed write must throw
 * so the user is told it did not save.
 */
export async function safe(promiseFactory, fallback) {
  try {
    return await promiseFactory();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[query] ${error.code || 'ERROR'}: ${error.message}`);
    }
    return fallback;
  }
}

/** Clamp a page size so a crafted query string cannot ask for 1,000,000 rows. */
export function clampLimit(value, fallback = 12, max = 60) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, max);
}

export function clampPage(value) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) || n < 1 ? 1 : Math.min(n, 10_000);
}

/** Build a paginated envelope used by both the public listing and the admin tables. */
export function paginate(items, total, page, perPage) {
  const totalCount = Number(total) || 0;
  return {
    items,
    total: totalCount,
    page,
    perPage,
    totalPages: Math.max(Math.ceil(totalCount / perPage), 1),
    hasPrev: page > 1,
    hasNext: page * perPage < totalCount,
  };
}
