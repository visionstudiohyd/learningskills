import { handleError, ok } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { deleteMedia } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** DELETE /api/admin/media/<id> — removes the row and, for the local driver, the file. */
export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin('content');
    const { id } = await params;

    const removed = await deleteMedia(id);
    if (!removed) {
      return handleError(Object.assign(new Error('That media item no longer exists.'), { status: 404 }));
    }

    await logActivity({
      admin,
      action: 'delete',
      entityType: 'media',
      entityId: Number(id),
      description: `Deleted media #${id}`,
      ip: getClientIp(request.headers),
    });

    return ok({ message: 'Image deleted.' });
  } catch (error) {
    return handleError(error, 'media/delete');
  }
}
