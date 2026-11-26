import { handleError, invalid, ok, readJson } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { enquiryUpdateSchema, safeParse } from '@/lib/validation';
import { deleteEnquiry, getEnquiryById, updateEnquiry } from '@/lib/queries/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enquiry management.
 *
 *   PATCH  /api/admin/enquiries/<id>   status, priority, notes, owner, follow-up date
 *   DELETE /api/admin/enquiries/<id>
 *
 * Enquiries are not in the generic resource registry: they are inbound records
 * rather than editable content, so only the handful of workflow fields above
 * can ever be written. The visitor's own details are never modified here.
 */
export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin('enquiries');
    const { id } = await params;

    const body = await readJson(request);
    const parsed = safeParse(enquiryUpdateSchema, body);
    if (!parsed.success) return invalid(parsed.errors);

    const existing = await getEnquiryById(id);
    if (!existing) {
      return handleError(Object.assign(new Error('Enquiry not found.'), { status: 404 }));
    }

    const changed = await updateEnquiry(id, parsed.data);

    // Only log a meaningful change, not every "mark as read" on page view.
    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity({
        admin,
        action: 'update',
        entityType: 'enquiries',
        entityId: Number(id),
        description: `Enquiry ${existing.reference} moved from ${existing.status} to ${parsed.data.status}`,
        ip: getClientIp(request.headers),
      });
    }

    return ok({ updated: changed, message: 'Enquiry updated.' });
  } catch (error) {
    return handleError(error, 'enquiries/update');
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin('enquiries');
    const { id } = await params;

    const existing = await getEnquiryById(id);
    if (!existing) {
      return handleError(Object.assign(new Error('Enquiry not found.'), { status: 404 }));
    }

    await deleteEnquiry(id);

    await logActivity({
      admin,
      action: 'delete',
      entityType: 'enquiries',
      entityId: Number(id),
      description: `Deleted enquiry ${existing.reference} from ${existing.name}`,
      ip: getClientIp(request.headers),
    });

    return ok({ message: 'Enquiry deleted.' });
  } catch (error) {
    return handleError(error, 'enquiries/delete');
  }
}
