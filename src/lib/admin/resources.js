import {
  courseSchema, faqSchema, featureSchema, heroSlideSchema, learningStepSchema,
  menuItemSchema, pageSchema, statSchema, testimonialSchema, trainerSchema,
} from '@/lib/validation';

/**
 * RESOURCE REGISTRY
 * -----------------------------------------------------------------------------
 * One declaration per manageable entity, consumed by three things:
 *
 *   • /api/admin/[resource]       — generic list / create handlers
 *   • /api/admin/[resource]/[id]  — generic read / update / delete handlers
 *   • the admin pages             — table columns and form fields
 *
 * Adding a new manageable entity therefore means adding an entry here plus a
 * ~15-line page, rather than a new API route, validator and form each time.
 *
 * Only tables and columns named here can ever be touched by the generic
 * handlers, which is what keeps a dynamic `[resource]` route from becoming an
 * arbitrary-SQL hole: the resource key is looked up, never interpolated.
 */

const seo = [
  { name: 'meta_title', label: 'Meta title', type: 'text', group: 'SEO', help: 'Shown in search results. Falls back to the title.' },
  { name: 'meta_description', label: 'Meta description', type: 'textarea', group: 'SEO', rows: 3, help: 'Aim for 150–160 characters.' },
];

export const RESOURCES = {
  /* ============================ HERO SLIDES ============================== */
  slides: {
    key: 'slides',
    table: 'hero_slides',
    label: 'Hero Slides',
    singular: 'Slide',
    icon: 'ImageIcon',
    permission: 'content',
    schema: heroSlideSchema,
    defaultSort: 'display_order ASC, id ASC',
    searchColumns: ['title', 'eyebrow', 'description'],
    reorderable: true,
    description: 'The full-screen slider at the top of the homepage. Slides rotate every 7 seconds.',
    listColumns: [
      { key: 'title', label: 'Slide', type: 'title', secondary: 'eyebrow', thumb: 'image' },
      { key: 'text_align', label: 'Alignment', type: 'text', align: 'center' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'eyebrow', label: 'Eyebrow text', type: 'text', group: 'Content', help: 'Small label above the heading.' },
      { name: 'title', label: 'Heading', type: 'text', required: true, group: 'Content' },
      {
        name: 'highlight',
        label: 'Highlighted phrase',
        type: 'text',
        group: 'Content',
        help: 'A phrase from the heading to accent. Must appear in the heading exactly.',
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, group: 'Content' },
      { name: 'image', label: 'Background image', type: 'image', required: true, group: 'Appearance', help: 'Use a wide image, at least 1920px across.' },
      { name: 'mobile_image', label: 'Mobile image', type: 'image', group: 'Appearance', help: 'Optional portrait crop for phones.' },
      {
        name: 'overlay_opacity',
        label: 'Overlay darkness (%)',
        type: 'number',
        group: 'Appearance',
        min: 0,
        max: 100,
        help: 'Higher values darken the image so text stays readable.',
      },
      {
        name: 'text_align',
        label: 'Text alignment',
        type: 'select',
        group: 'Appearance',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Centre' },
          { value: 'right', label: 'Right' },
        ],
      },
      { name: 'primary_btn_text', label: 'Primary button text', type: 'text', group: 'Buttons' },
      { name: 'primary_btn_link', label: 'Primary button link', type: 'text', group: 'Buttons' },
      { name: 'secondary_btn_text', label: 'Secondary button text', type: 'text', group: 'Buttons' },
      { name: 'secondary_btn_link', label: 'Secondary button link', type: 'text', group: 'Buttons' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* ============================ TESTIMONIALS ============================= */
  testimonials: {
    key: 'testimonials',
    table: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    icon: 'Quote',
    permission: 'content',
    schema: testimonialSchema,
    defaultSort: 'display_order ASC, id DESC',
    searchColumns: ['name', 'designation', 'organisation', 'message'],
    reorderable: true,
    description: 'Learner quotes shown on the homepage, the About page and relevant course pages.',
    listColumns: [
      { key: 'name', label: 'Learner', type: 'title', secondary: 'designation', thumb: 'avatar' },
      { key: 'course_label', label: 'Course', type: 'text' },
      { key: 'rating', label: 'Rating', type: 'rating', align: 'center' },
      { key: 'is_featured', label: 'Featured', type: 'boolean', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, group: 'Person' },
      { name: 'designation', label: 'Job title', type: 'text', group: 'Person' },
      { name: 'organisation', label: 'Company / organisation', type: 'text', group: 'Person' },
      { name: 'avatar', label: 'Photo', type: 'image', group: 'Person' },
      { name: 'message', label: 'Testimonial', type: 'textarea', rows: 6, required: true, group: 'Quote' },
      {
        name: 'course_id',
        label: 'Course taken',
        type: 'relation',
        group: 'Quote',
        relation: { resource: 'courses', table: 'courses', valueColumn: 'id', labelColumn: 'title' },
        help: 'Links the quote to a course page. Optional.',
      },
      { name: 'course_label', label: 'Course label', type: 'text', group: 'Quote', help: 'Shown on the card. Defaults to the linked course title.' },
      { name: 'rating', label: 'Rating (1–5)', type: 'number', min: 1, max: 5, group: 'Quote' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_featured', label: 'Feature on homepage', type: 'boolean', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* ================================ PAGES ================================ */
  pages: {
    key: 'pages',
    table: 'pages',
    label: 'Pages',
    singular: 'Page',
    icon: 'FileText',
    permission: 'content',
    schema: pageSchema,
    slug: { from: 'title', field: 'slug' },
    defaultSort: 'display_order ASC, title ASC',
    searchColumns: ['title', 'slug', 'subtitle'],
    description: 'Standalone pages such as Privacy Policy and Terms. Each is published at /your-slug.',
    listColumns: [
      { key: 'title', label: 'Page', type: 'title', secondary: 'slug' },
      { key: 'page_type', label: 'Type', type: 'text', align: 'center' },
      { key: 'show_in_footer', label: 'In footer', type: 'boolean', align: 'center' },
      { key: 'updated_at', label: 'Updated', type: 'date' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    viewUrl: (row) => `/${row.slug}`,
    fields: [
      { name: 'title', label: 'Page title', type: 'text', required: true, group: 'Details' },
      { name: 'slug', label: 'URL slug', type: 'slug', group: 'Details', help: 'The page will live at /your-slug' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2, group: 'Details' },
      { name: 'banner_image', label: 'Banner image', type: 'image', group: 'Details' },
      { name: 'content', label: 'Page content', type: 'richtext', group: 'Content', full: true },
      { name: 'show_in_header', label: 'Show in header menu', type: 'boolean', group: 'Visibility' },
      { name: 'show_in_footer', label: 'Show in footer', type: 'boolean', group: 'Visibility', default: true },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Published', type: 'boolean', group: 'Visibility', default: true },
      ...seo,
      { name: 'meta_keywords', label: 'Meta keywords', type: 'text', group: 'SEO' },
    ],
  },

  /* ================================= FAQs ================================ */
  faqs: {
    key: 'faqs',
    table: 'faqs',
    label: 'FAQs',
    singular: 'FAQ',
    icon: 'MessagesSquare',
    permission: 'content',
    schema: faqSchema,
    defaultSort: 'display_order ASC, id ASC',
    searchColumns: ['question', 'answer', 'category'],
    reorderable: true,
    description: 'Questions shown on the FAQ page, and optionally on the homepage.',
    listColumns: [
      { key: 'question', label: 'Question', type: 'title', secondary: 'category' },
      { key: 'show_on_home', label: 'On homepage', type: 'boolean', align: 'center' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'question', label: 'Question', type: 'textarea', rows: 2, required: true, group: 'Content' },
      { name: 'answer', label: 'Answer', type: 'textarea', rows: 6, required: true, group: 'Content' },
      {
        name: 'category',
        label: 'Category',
        type: 'text',
        group: 'Grouping',
        help: 'Questions are grouped by this on the FAQ page, e.g. "Fees & Payment".',
      },
      { name: 'show_on_home', label: 'Show on homepage', type: 'boolean', group: 'Visibility' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* ============================ SITE FEATURES ============================ */
  features: {
    key: 'features',
    table: 'site_features',
    label: 'Benefits',
    singular: 'Benefit',
    icon: 'Sparkles',
    permission: 'content',
    schema: featureSchema,
    defaultSort: 'display_order ASC, id ASC',
    searchColumns: ['title', 'description'],
    reorderable: true,
    description: 'The "why learn with us" cards on the homepage and About page.',
    listColumns: [
      { key: 'title', label: 'Benefit', type: 'title', secondary: 'description', iconColumn: 'icon', accent: 'accent' },
      { key: 'placement', label: 'Shown on', type: 'text', align: 'center' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'Content' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, group: 'Content' },
      { name: 'icon', label: 'Icon', type: 'icon', group: 'Appearance' },
      { name: 'accent', label: 'Accent colour', type: 'color', group: 'Appearance' },
      {
        name: 'placement',
        label: 'Show on',
        type: 'select',
        group: 'Visibility',
        options: [
          { value: 'both', label: 'Homepage and About' },
          { value: 'home', label: 'Homepage only' },
          { value: 'about', label: 'About page only' },
        ],
      },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* ============================== SITE STATS ============================= */
  stats: {
    key: 'stats',
    table: 'site_stats',
    label: 'Statistics',
    singular: 'Statistic',
    icon: 'TrendingUp',
    permission: 'content',
    schema: statSchema,
    defaultSort: 'display_order ASC, id ASC',
    searchColumns: ['label'],
    reorderable: true,
    description: 'The animated counters on the homepage, in the hero and on the About page.',
    listColumns: [
      { key: 'label', label: 'Statistic', type: 'title', iconColumn: 'icon' },
      { key: 'value', label: 'Value', type: 'number', align: 'center' },
      { key: 'suffix', label: 'Suffix', type: 'text', align: 'center' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true, group: 'Content' },
      {
        name: 'value',
        label: 'Value',
        type: 'number',
        required: true,
        group: 'Content',
        help: 'Whole numbers only. For a rating out of 5, enter 48 and set the suffix to "/5" — it displays as 4.8/5.',
      },
      { name: 'prefix', label: 'Prefix', type: 'text', group: 'Content', help: 'e.g. a currency symbol' },
      { name: 'suffix', label: 'Suffix', type: 'text', group: 'Content', help: 'e.g. "+" or "/5"' },
      { name: 'icon', label: 'Icon', type: 'icon', group: 'Appearance' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* =========================== LEARNING STEPS ============================ */
  steps: {
    key: 'steps',
    table: 'learning_steps',
    label: 'Process Steps',
    singular: 'Step',
    icon: 'Workflow',
    permission: 'content',
    schema: learningStepSchema,
    defaultSort: 'display_order ASC, id ASC',
    searchColumns: ['title', 'description'],
    reorderable: true,
    description: 'The "how it works" steps explaining the enquiry journey on the homepage.',
    listColumns: [
      { key: 'title', label: 'Step', type: 'title', secondary: 'description', iconColumn: 'icon' },
      { key: 'step_label', label: 'Number', type: 'text', align: 'center' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'step_label', label: 'Step number', type: 'text', group: 'Content', help: 'e.g. 01' },
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'Content' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, group: 'Content' },
      { name: 'icon', label: 'Icon', type: 'icon', group: 'Appearance' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* =============================== TRAINERS ============================== */
  trainers: {
    key: 'trainers',
    table: 'trainers',
    label: 'Trainers',
    singular: 'Trainer',
    icon: 'UserCheck',
    permission: 'content',
    schema: trainerSchema,
    defaultSort: 'display_order ASC, name ASC',
    searchColumns: ['name', 'designation', 'expertise'],
    reorderable: true,
    description: 'Faculty profiles shown on the About page.',
    listColumns: [
      { key: 'name', label: 'Trainer', type: 'title', secondary: 'designation', thumb: 'photo' },
      { key: 'experience_years', label: 'Experience', type: 'number', align: 'center', suffix: ' yrs' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, group: 'Profile' },
      { name: 'designation', label: 'Role', type: 'text', group: 'Profile' },
      { name: 'photo', label: 'Photo', type: 'image', group: 'Profile', help: 'A portrait crop works best.' },
      { name: 'bio', label: 'Biography', type: 'textarea', rows: 6, group: 'Profile' },
      { name: 'expertise', label: 'Specialisms', type: 'text', group: 'Profile', help: 'Comma separated.' },
      { name: 'experience_years', label: 'Years of experience', type: 'number', group: 'Profile' },
      { name: 'email', label: 'Email', type: 'email', group: 'Links' },
      { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url', group: 'Links' },
      { name: 'twitter_url', label: 'X / Twitter URL', type: 'url', group: 'Links' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* ============================== MENU ITEMS ============================= */
  menus: {
    key: 'menus',
    table: 'menu_items',
    label: 'Navigation',
    singular: 'Menu link',
    icon: 'Compass',
    permission: 'content',
    schema: menuItemSchema,
    defaultSort: 'location ASC, display_order ASC',
    searchColumns: ['label', 'url'],
    reorderable: true,
    description: 'Links in the header and footer menus.',
    listColumns: [
      { key: 'label', label: 'Link', type: 'title', secondary: 'url' },
      { key: 'location', label: 'Location', type: 'text', align: 'center' },
      { key: 'display_order', label: 'Order', type: 'number', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    fields: [
      { name: 'label', label: 'Link text', type: 'text', required: true, group: 'Link' },
      { name: 'url', label: 'URL', type: 'text', required: true, group: 'Link', help: 'Internal path like /courses, or a full external URL.' },
      {
        name: 'location',
        label: 'Menu',
        type: 'select',
        group: 'Link',
        options: [
          { value: 'header', label: 'Header' },
          { value: 'footer_primary', label: 'Footer — Explore column' },
          { value: 'footer_secondary', label: 'Footer — bottom bar' },
        ],
      },
      { name: 'open_new_tab', label: 'Open in a new tab', type: 'boolean', group: 'Behaviour' },
      { name: 'display_order', label: 'Display order', type: 'number', group: 'Visibility' },
      { name: 'is_active', label: 'Active', type: 'boolean', group: 'Visibility', default: true },
    ],
  },

  /* ================================ COURSES ============================== */
  /* Listing and deletion run through the generic handlers; create and update
     use the bespoke editor, because courses own four child tables. */
  courses: {
    key: 'courses',
    table: 'courses',
    label: 'Courses',
    singular: 'Course',
    icon: 'BookOpen',
    permission: 'content',
    schema: courseSchema,
    slug: { from: 'title', field: 'slug' },
    defaultSort: 'display_order ASC, id DESC',
    searchColumns: ['title', 'slug', 'code', 'short_description'],
    customEditor: '/admin/courses',
    description: 'Every programme on the site, with its outcomes, curriculum and FAQs.',
    listColumns: [
      { key: 'title', label: 'Course', type: 'title', secondary: 'short_description', thumb: 'thumbnail' },
      { key: 'level', label: 'Level', type: 'text', align: 'center' },
      { key: 'duration', label: 'Duration', type: 'text', align: 'center' },
      { key: 'enquiry_count', label: 'Enquiries', type: 'number', align: 'center' },
      { key: 'is_featured', label: 'Featured', type: 'boolean', align: 'center' },
      { key: 'is_active', label: 'Status', type: 'status', align: 'center' },
    ],
    viewUrl: (row) => `/courses/${row.slug}`,
    fields: [],
  },
};

export function getResource(key) {
  return RESOURCES[key] || null;
}

/** Column names the generic handlers are allowed to write for a resource. */
export function writableColumns(resource) {
  return resource.fields.map((f) => f.name);
}
