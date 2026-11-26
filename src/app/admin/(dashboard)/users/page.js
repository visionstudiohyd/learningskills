import { can, getCurrentAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { plain } from '@/lib/utils';
import UserManager from '@/components/admin/UserManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Users' };

export default async function UsersPage() {
  const admin = await getCurrentAdmin();

  if (!admin || !can(admin.role, 'users')) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-display text-base font-bold text-amber-900">Not available to your role</h2>
        <p className="mt-2 text-sm text-amber-800">
          Only a super admin can manage dashboard accounts. You can still change your own details under
          My&nbsp;profile.
        </p>
      </div>
    );
  }

  const users = await query(
    `SELECT id, name, email, phone, role, is_active, last_login_at, created_at
       FROM admin_users ORDER BY name ASC`
  ).catch(() => []);

  return <UserManager users={plain(users)} currentUserId={admin.id} />;
}
