import { getHeaderSettings } from '@/lib/settings';
import { getMenu } from '@/lib/queries/content';
import { getMenuCourses } from '@/lib/queries/courses';
import HeaderClient from './HeaderClient';

/**
 * Server shell for the header: reads the admin-managed navigation, the courses
 * shown in the dropdown and the branding, then hands plain data to the client
 * component that owns the interactive behaviour.
 */
export default async function Header() {
  const [headerSettings, menu, menuCourses] = await Promise.all([
    getHeaderSettings(),
    getMenu('header'),
    getMenuCourses(6),
  ]);

  // Fall back to the core routes if the admin has emptied the header menu.
  const items = menu.length
    ? menu
    : [
        { id: 'home', label: 'Home', url: '/' },
        { id: 'courses', label: 'Courses', url: '/courses' },
        { id: 'about', label: 'About', url: '/about' },
        { id: 'faqs', label: 'FAQs', url: '/faqs' },
        { id: 'contact', label: 'Contact', url: '/contact' },
      ];

  return (
    <HeaderClient settings={headerSettings} menu={items} menuCourses={menuCourses} />
  );
}
