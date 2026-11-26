import { fail, handleError, ok } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { getDriver, listFolders, listMedia, registerRemote, saveUpload } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 *   GET  /api/admin/media   paginated library listing
 *   POST /api/admin/media   multipart upload, or { url } to register a remote image
 *
 * Note this sits at a fixed path rather than under the generic
 * /api/admin/[resource] handler: uploads are multipart, not JSON, and the
 * media table is written through the storage driver rather than directly.
 */
export async function GET(request) {
  try {
    await requireAdmin('content');
    const sp = request.nextUrl.searchParams;

    const [result, folders] = await Promise.all([
      listMedia({
        page: sp.get('page'),
        perPage: sp.get('perPage') || 30,
        folder: sp.get('folder'),
        search: sp.get('search'),
      }),
      listFolders(),
    ]);

    return ok({ ...result, folders, driver: getDriver() });
  } catch (error) {
    return handleError(error, 'media/list');
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin('content');
    const contentType = request.headers.get('content-type') || '';

    /* ----------------------- register a remote URL ----------------------- */
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      const result = await registerRemote(body.url, {
        folder: body.folder || 'general',
        altText: body.alt_text || null,
        userId: admin.id,
      });
      await logActivity({
        admin,
        action: 'create',
        entityType: 'media',
        entityId: result.id,
        description: `Linked remote image: ${result.filename}`,
        ip: getClientIp(request.headers),
      });
      return ok({ item: result, message: 'Image added to the library.' }, 201);
    }

    /* --------------------------- file upload ----------------------------- */
    if (!contentType.includes('multipart/form-data')) {
      return fail('Send a file as multipart/form-data, or a JSON body with a url.', 415);
    }

    const form = await request.formData();
    const files = form.getAll('file').filter((f) => typeof f === 'object' && f !== null);

    if (!files.length) {
      return fail('No file was received.', 400);
    }

    const folder = String(form.get('folder') || 'general');
    const altText = form.get('alt_text') ? String(form.get('alt_text')) : null;

    const uploaded = [];
    for (const file of files.slice(0, 12)) {
      // eslint-disable-next-line no-await-in-loop
      uploaded.push(await saveUpload(file, { folder, altText, userId: admin.id }));
    }

    await logActivity({
      admin,
      action: 'upload',
      entityType: 'media',
      entityId: uploaded[0]?.id || null,
      description: `Uploaded ${uploaded.length} image${uploaded.length === 1 ? '' : 's'} to ${folder}`,
      ip: getClientIp(request.headers),
    });

    return ok(
      {
        items: uploaded,
        item: uploaded[0],
        message: `${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded.`,
      },
      201
    );
  } catch (error) {
    return handleError(error, 'media/upload');
  }
}
