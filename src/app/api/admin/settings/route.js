import { handleError, ok, readJson } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { getGroupedSettings, saveSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 *   GET  /api/admin/settings   grouped, typed settings for the form
 *   PUT  /api/admin/settings   save a batch of changes
 *
 * Keys not present in the settings registry are silently ignored by
 * saveSettings, so a crafted payload cannot introduce new keys or overwrite
 * anything the UI does not expose.
 */
export async function GET() {
  try {
    await requireAdmin('settings');
    const groups = await getGroupedSettings();
    return ok({ groups });
  } catch (error) {
    return handleError(error, 'settings/get');
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin('settings');
    const body = await readJson(request);

    const patch = body.settings && typeof body.settings === 'object' ? body.settings : body;
    const count = await saveSettings(patch);

    await logActivity({
      admin,
      action: 'settings',
      entityType: 'settings',
      description: `Updated ${count} setting${count === 1 ? '' : 's'}${body.group ? ` in ${body.group}` : ''}`,
      ip: getClientIp(request.headers),
    });

    return ok({ saved: count, message: `${count} setting${count === 1 ? '' : 's'} saved.` });
  } catch (error) {
    return handleError(error, 'settings/put');
  }
}
