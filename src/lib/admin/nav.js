/**
 * Dashboard navigation.
 *
 * `permission` maps to the role capabilities in lib/auth.js, so an editor
 * simply never sees Settings or Users. `badge` names a counter the layout
 * resolves (unread leads, new messages) and renders as a live pill.
 */
export const ADMIN_NAV = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', permission: 'content', exact: true }],
  },
  {
    group: 'Leads',
    items: [
      { label: 'Course Enquiries', href: '/admin/enquiries', icon: 'Inbox', permission: 'enquiries', badge: 'enquiries' },
      { label: 'Contact Messages', href: '/admin/messages', icon: 'Mail', permission: 'enquiries', badge: 'messages' },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { label: 'Courses', href: '/admin/courses', icon: 'BookOpen', permission: 'content' },
    ],
  },
  {
    group: 'Homepage',
    items: [
      { label: 'Hero Slides', href: '/admin/slides', icon: 'ImageIcon', permission: 'content' },
      { label: 'Benefits', href: '/admin/features', icon: 'Sparkles', permission: 'content' },
      { label: 'Statistics', href: '/admin/stats', icon: 'TrendingUp', permission: 'content' },
      { label: 'Process Steps', href: '/admin/steps', icon: 'Workflow', permission: 'content' },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Pages', href: '/admin/pages', icon: 'FileText', permission: 'content' },
      { label: 'FAQs', href: '/admin/faqs', icon: 'MessagesSquare', permission: 'content' },
      { label: 'Testimonials', href: '/admin/testimonials', icon: 'Quote', permission: 'content' },
      { label: 'Trainers', href: '/admin/trainers', icon: 'UserCheck', permission: 'content' },
      { label: 'Navigation', href: '/admin/menus', icon: 'Compass', permission: 'content' },
    ],
  },
  {
    group: 'Library',
    items: [{ label: 'Media', href: '/admin/media', icon: 'ImageIcon', permission: 'content' }],
  },
  {
    group: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: 'Settings', permission: 'settings' },
      { label: 'Admin Users', href: '/admin/users', icon: 'Users', permission: 'users' },
      { label: 'Activity Log', href: '/admin/activity', icon: 'ListChecks', permission: 'settings' },
    ],
  },
];
