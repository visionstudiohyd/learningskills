import { can, getCurrentAdmin } from '@/lib/auth';
import { getGroupedSettings } from '@/lib/settings';
import SettingsManager from '@/components/admin/SettingsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();

  if (!admin || !can(admin.role, 'settings')) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-display text-base font-bold text-amber-900">Not available to your role</h2>
        <p className="mt-2 text-sm text-amber-800">
          Site settings can only be changed by an administrator. Ask a super admin if you need something updated here.
        </p>
      </div>
    );
  }

  const groups = await getGroupedSettings();
  return <SettingsManager groups={groups} />;
}
