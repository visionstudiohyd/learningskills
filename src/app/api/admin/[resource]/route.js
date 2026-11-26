import { handleError, invalid, ok, readJson } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { getResource } from '@/lib/admin/resources';
import { createResourceRow, listResource, reorderResource } from '@/lib/admin/crud';
import { saveCourse } from '@/lib/admin/courses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generic collection endpoint for every registered resource.
 *
 *   GET  /api/admin/<resource>   list (search, filter, sort, paginate)
 *   POST /api/admin/<resource>   create — or reorder, with { _action: 'reorder' }
 *
 * The resource key is resolved through the registry, so an unknown key is a
 * 404 rather than an attempt to query a table named by the caller.
 */

function resolve(key) {
  const resource = getResource(key);
  if (!resource) {
    const error = new Error('Unknown resource.');
    error.status = 404;
    throw error;
  }
  return resource;
}

export async function GET(request, { params }) {
  try {
    const { resource: key } = await params;
    const resource = resolve(key);
    const admin = await requireAdmin(resource.permission);

    const sp = request.nextUrl.searchParams;

    // Any query param matching a resource field becomes an equality filter.
    const filters = {};
    for (const field of resource.fields) {
      const value = sp.get(field.name);
      if (value !== null && value !== '') filters[field.name] = value;
    }

    const result = await listResource(resource, {
      page: sp.get('page'),
      perPage: sp.get('perPage'),
      search: sp.get('search'),
      sort: sp.get('sort'),
      direction: sp.get('direction'),
      filters,
    });

    return ok({ ...result, resource: resource.key, role: admin.role });
  } catch (error) {
    return handleError(error, 'admin/list');
  }
}

export async function POST(request, { params }) {
  try {
    const { resource: key } = await params;
    const resource = resolve(key);
    const admin = await requireAdmin(resource.permission);

    const body = await readJson(request);

    // Reorder shares the collection endpoint so the client needs one URL.
    if (body._action === 'reorder') {
      const count = await reorderResource(resource, body.ids);
      await logActivity({
        admin,
        action: 'reorder',
        entityType: resource.table,
        description: `Reordered ${count} ${resource.label.toLowerCase()}`,
        ip: getClientIp(request.headers),
      });
      return ok({ reordered: count });
    }

    // Courses own four child tables, so they are written by a dedicated
    // transactional save rather than the generic single-row insert.
    const result =
      resource.key === 'courses' ? await saveCourse(body) : await createResourceRow(resource, body);
    if (result.errors) return invalid(result.errors);

    // createResourceRow returns { id, data }; saveCourse returns { id, title },
    // so read a human label from either shape.
    const created = result.data || result;
    await logActivity({
      admin,
      action: 'create',
      entityType: resource.table,
      entityId: result.id,
      description: `Created ${resource.singular.toLowerCase()}: ${
        created.title || created.name || created.label || created.question || `#${result.id}`
      }`,
      ip: getClientIp(request.headers),
    });

    return ok({ id: result.id, message: `${resource.singular} created.` }, 201);
  } catch (error) {
    return handleError(error, 'admin/create');
  }
}
