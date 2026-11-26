import { handleError, invalid, ok, readJson } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { contactUpdateSchema, safeParse } from '@/lib/validation';
import { deleteContactMessage, getContactMessageById, updateContactMessage } from '@/lib/queries/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** PATCH / DELETE a contact-form message. Only status and internal notes are writable. */
export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin('enquiries');
    const { id } = await params;

    const body = await readJson(request);
    const parsed = safeParse(contactUpdateSchema, body);
    if (!parsed.success) return invalid(parsed.errors);

    const existing = await getContactMessageById(id);
    if (!existing) {
      return handleError(Object.assign(new Error('Message not found.'), { status: 404 }));
    }

    await updateContactMessage(id, parsed.data);

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity({
        admin,
        action: 'update',
        entityType: 'contact_messages',
        entityId: Number(id),
        description: `Message from ${existing.name} marked ${parsed.data.status}`,
        ip: getClientIp(request.headers),
      });
    }

    return ok({ message: 'Message updated.' });
  } catch (error) {
    return handleError(error, 'messages/update');
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin('enquiries');
    const { id } = await params;

    const existing = await getContactMessageById(id);
    if (!existing) {
      return handleError(Object.assign(new Error('Message not found.'), { status: 404 }));
    }

    await deleteContactMessage(id);

    await logActivity({
      admin,
      action: 'delete',
      entityType: 'contact_messages',
      entityId: Number(id),
      description: `Deleted message from ${existing.name}`,
      ip: getClientIp(request.headers),
    });

    return ok({ message: 'Message deleted.' });
  } catch (error) {
    return handleError(error, 'messages/delete');
  }
}
