import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { plain } from '@/lib/utils';
import ProfileForm from '@/components/admin/ProfileForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Profile' };

export default async function ProfilePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  return <ProfileForm admin={plain(admin)} />;
}
