import { handleError, invalid, ok, readJson } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { getResource } from '@/lib/admin/resources';
import {
  deleteResourceRow, getResourceRow, toggleResourceColumn, updateResourceRow,
} from '@/lib/admin/crud';
import { saveCourse } from '@/lib/admin/courses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 *   GET    /api/admin/<resource>/<id>   read one
 *   PATCH  /api/admin/<resource>/<id>   update — or toggle a switch with
 *                                       { _action: 'toggle', column: 'is_active' }
 *   DELETE /api/admin/<resource>/<id>   delete
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

/** Human label for the audit trail, tolerant of either save-result shape. */
function describe(row, fallbackId) {
  const source = row?.data || row || {};
  return source.title || source.name || source.label || source.question || `#${fallbackId}`;
}

export async function GET(request, { params }) {
  try {
    const { resource: key, id } = await params;
    const resource = resolve(key);
    await requireAdmin(resource.permission);

    const row = await getResourceRow(resource, id);
    if (!row) return handleError(Object.assign(new Error(`${resource.singular} not found.`), { status: 404 }));

    return ok({ item: row });
  } catch (error) {
    return handleError(error, 'admin/read');
  }
}

export async function PATCH(request, { params }) {
  try {
    const { resource: key, id } = await params;
    const resource = resolve(key);
    const admin = await requireAdmin(resource.permission);

    const body = await readJson(request);

    if (body._action === 'toggle') {
      const result = await toggleResourceColumn(resource, id, body.column);
      await logActivity({
        admin,
        action: 'toggle',
        entityType: resource.table,
        entityId: Number(id),
        description: `Set ${body.column} to ${result.value ? 'on' : 'off'} on ${resource.singular.toLowerCase()} #${id}`,
        ip: getClientIp(request.headers),
      });
      return ok(result);
    }

    // Courses route through the transactional save so their child rows
    // (outcomes, syllabus, highlights, FAQs) are replaced atomically.
    const result =
      resource.key === 'courses' ? await saveCourse(body, id) : await updateResourceRow(resource, id, body);
    if (result.errors) return invalid(result.errors);

    await logActivity({
      admin,
      action: 'update',
      entityType: resource.table,
      entityId: Number(id),
      description: `Updated ${resource.singular.toLowerCase()}: ${describe(result, id)}`,
      ip: getClientIp(request.headers),
    });

    return ok({ id: result.id, message: `${resource.singular} saved.` });
  } catch (error) {
    return handleError(error, 'admin/update');
  }
}

export async function DELETE(request, { params }) {
  try {
    const { resource: key, id } = await params;
    const resource = resolve(key);
    const admin = await requireAdmin(resource.permission);

    const removed = await deleteResourceRow(resource, id);

    await logActivity({
      admin,
      action: 'delete',
      entityType: resource.table,
      entityId: Number(id),
      description: `Deleted ${resource.singular.toLowerCase()}: ${describe(removed, id)}`,
      ip: getClientIp(request.headers),
    });

    return ok({ message: `${resource.singular} deleted.` });
  } catch (error) {
    return handleError(error, 'admin/delete');
  }
}
