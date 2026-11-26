import { notFound, redirect } from 'next/navigation';
import { can, getCurrentAdmin } from '@/lib/auth';
import { getCourseForEdit } from '@/lib/queries/courses';
import { plain } from '@/lib/utils';
import CourseEditor from '@/components/admin/CourseEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Courses' };

export default async function Page({ params }) {
  const { id } = await params;

  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  if (!can(admin.role, 'content')) notFound();

  const isNew = id === 'new';
  const course = isNew ? null : await getCourseForEdit(id);

  if (!isNew && !course) notFound();

  return <CourseEditor course={course ? plain(course) : null} />;
}
