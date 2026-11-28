import { z } from 'zod';

/**
 * Validation schemas shared by the public forms and the admin API.
 * Validating on the server is what actually matters — the client-side
 * react-hook-form resolvers reuse these so the rules can never drift apart.
 */

const trimmed = (schema) => z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), schema);
const optionalText = (max) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().max(max).optional().nullable().transform((v) => (v === '' ? null : (v ?? null)))
  );

export const nameSchema = trimmed(
  z
    .string()
    .min(2, 'Please enter your full name')
    .max(140, 'Name is too long')
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, 'Name may only contain letters, spaces, apostrophes and hyphens')
);

export const emailSchema = trimmed(
  z.string().min(5, 'Email is required').max(190, 'Email is too long').email('Please enter a valid email address')
);

export const phoneSchema = trimmed(
  z
    .string()
    .min(7, 'Please enter a valid phone number')
    .max(40, 'Phone number is too long')
    .regex(/^[+]?[\d\s()-]{7,20}$/, 'Phone may only contain digits, spaces, +, - and ()')
);

/* --------------------------------------------------------------------------
   PUBLIC: course enquiry (supports multiple selected courses)
   -------------------------------------------------------------------------- */
export const enquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  city: optionalText(120),
  qualification: optionalText(160),
  preferred_mode: z.enum(['Online', 'Classroom', 'Hybrid', 'No Preference']).default('No Preference'),
  preferred_time: optionalText(120),
  message: optionalText(2000),
  course_ids: z
    .array(z.coerce.number().int().positive())
    .max(20, 'Please select fewer courses')
    .optional()
    .default([]),
  source_page: optionalText(300),
  consent: z.coerce.boolean().refine((v) => v === true, 'Please accept the contact consent to continue'),
  // Honeypot. Accepted by the schema on purpose: the route silently discards a
  // submission that filled it, so a bot gets a 200 and learns nothing about
  // which field gave it away.
  company: z.string().max(200).optional(),
});

/* --------------------------------------------------------------------------
   PUBLIC: contact form
   -------------------------------------------------------------------------- */
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalText(40),
  subject: optionalText(250),
  message: trimmed(z.string().min(10, 'Please write at least 10 characters').max(3000, 'Message is too long')),
  company: z.string().max(200).optional(), // honeypot — see enquirySchema
});

/* --------------------------------------------------------------------------
   ADMIN: auth
   -------------------------------------------------------------------------- */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters').max(200),
});

export const adminUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalText(40),
  role: z.enum(['super_admin', 'admin', 'editor']).default('admin'),
  password: z.string().min(8, 'Use at least 8 characters').max(200).optional().or(z.literal('')),
  is_active: z.coerce.boolean().default(true),
});

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    new_password: z.string().min(8, 'Use at least 8 characters').max(200),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'The two passwords do not match',
    path: ['confirm_password'],
  });

/* --------------------------------------------------------------------------
   ADMIN: content entities
   -------------------------------------------------------------------------- */
const slugField = optionalText(220);
const seoFields = {
  meta_title: optionalText(255),
  meta_description: optionalText(500),
  meta_keywords: optionalText(500),
};

export const courseSchema = z.object({
  title: trimmed(z.string().min(3, 'Title is required').max(200)),
  slug: slugField,
  code: optionalText(40),
  short_description: optionalText(500),
  overview: optionalText(60000),
  who_should_attend: optionalText(3000),
  eligibility: optionalText(3000),
  career_opportunities: optionalText(3000),
  certification: optionalText(255),
  thumbnail: optionalText(600),
  banner_image: optionalText(600),
  duration: optionalText(80),
  duration_weeks: z.coerce.number().int().min(0).max(520).nullable().optional(),
  lessons_count: z.coerce.number().int().min(0).max(9999).nullable().optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).default('All Levels'),
  delivery_mode: z.enum(['Online', 'Classroom', 'Hybrid', 'Self Paced']).default('Online'),
  language: optionalText(80),
  fee_text: optionalText(120),
  price: z.coerce.number().min(0).max(99999999).nullable().optional(),
  discount_price: z.coerce.number().min(0).max(99999999).nullable().optional(),
  rating: z.coerce.number().min(0).max(5).default(4.8),
  reviews_count: z.coerce.number().int().min(0).default(0),
  students_enrolled: z.coerce.number().int().min(0).default(0),
  is_featured: z.coerce.boolean().default(false),
  is_popular: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  ...seoFields,
  outcomes: z.array(z.object({ outcome: trimmed(z.string().min(1).max(400)) })).optional().default([]),
  highlights: z
    .array(
      z.object({
        icon: optionalText(60),
        title: trimmed(z.string().min(1).max(200)),
        description: optionalText(400),
      })
    )
    .optional()
    .default([]),
  syllabus: z
    .array(
      z.object({
        module_title: trimmed(z.string().min(1).max(250)),
        description: optionalText(2000),
        topics: optionalText(4000),
        duration: optionalText(80),
      })
    )
    .optional()
    .default([]),
  faqs: z
    .array(
      z.object({
        question: trimmed(z.string().min(1).max(400)),
        answer: trimmed(z.string().min(1).max(4000)),
      })
    )
    .optional()
    .default([]),
});

export const heroSlideSchema = z.object({
  eyebrow: optionalText(120),
  title: trimmed(z.string().min(3, 'Title is required').max(220)),
  highlight: optionalText(120),
  description: optionalText(600),
  image: trimmed(z.string().min(1, 'A background image is required').max(600)),
  mobile_image: optionalText(600),
  overlay_opacity: z.coerce.number().int().min(0).max(100).default(65),
  text_align: z.enum(['left', 'center', 'right']).default('left'),
  primary_btn_text: optionalText(80),
  primary_btn_link: optionalText(300),
  secondary_btn_text: optionalText(80),
  secondary_btn_link: optionalText(300),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: trimmed(z.string().min(2, 'Name is required').max(140)),
  designation: optionalText(180),
  organisation: optionalText(180),
  course_id: z.coerce.number().int().positive().nullable().optional(),
  course_label: optionalText(200),
  message: trimmed(z.string().min(10, 'Please add the testimonial text').max(3000)),
  avatar: optionalText(600),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  is_featured: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const pageSchema = z.object({
  title: trimmed(z.string().min(2, 'Title is required').max(200)),
  slug: slugField,
  subtitle: optionalText(400),
  content: optionalText(200000),
  banner_image: optionalText(600),
  show_in_header: z.coerce.boolean().default(false),
  show_in_footer: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
  ...seoFields,
});

export const faqSchema = z.object({
  question: trimmed(z.string().min(5, 'Question is required').max(400)),
  answer: trimmed(z.string().min(5, 'Answer is required').max(4000)),
  category: optionalText(100),
  show_on_home: z.coerce.boolean().default(false),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

export const featureSchema = z.object({
  icon: optionalText(60),
  title: trimmed(z.string().min(2, 'Title is required').max(200)),
  description: optionalText(600),
  accent: optionalText(20),
  placement: z.enum(['home', 'about', 'both']).default('both'),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

export const statSchema = z.object({
  icon: optionalText(60),
  label: trimmed(z.string().min(2, 'Label is required').max(160)),
  value: z.coerce.number().int().min(0).max(999999999).default(0),
  prefix: optionalText(20),
  suffix: optionalText(20),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

export const learningStepSchema = z.object({
  step_label: optionalText(20),
  icon: optionalText(60),
  title: trimmed(z.string().min(2, 'Title is required').max(200)),
  description: optionalText(600),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

export const trainerSchema = z.object({
  name: trimmed(z.string().min(2, 'Name is required').max(140)),
  designation: optionalText(180),
  bio: optionalText(3000),
  photo: optionalText(600),
  expertise: optionalText(400),
  experience_years: z.coerce.number().int().min(0).max(70).nullable().optional(),
  linkedin_url: optionalText(400),
  twitter_url: optionalText(400),
  email: optionalText(190),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

export const menuItemSchema = z.object({
  location: z.enum(['header', 'footer_primary', 'footer_secondary']).default('header'),
  label: trimmed(z.string().min(1, 'Label is required').max(120)),
  url: trimmed(z.string().min(1, 'URL is required').max(400)),
  parent_id: z.coerce.number().int().positive().nullable().optional(),
  open_new_tab: z.coerce.boolean().default(false),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.coerce.boolean().default(true),
});

/* --------------------------------------------------------------------------
   ADMIN: lead management
   -------------------------------------------------------------------------- */
export const enquiryUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up', 'converted', 'closed', 'spam']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  admin_notes: optionalText(5000),
  assigned_to: z.coerce.number().int().positive().nullable().optional(),
  follow_up_at: optionalText(40),
  is_read: z.coerce.boolean().optional(),
});

export const contactUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'archived', 'spam']).optional(),
  admin_notes: optionalText(5000),
});

/* --------------------------------------------------------------------------
   Helper: flatten Zod errors into { field: message } for form display
   -------------------------------------------------------------------------- */
export function formatZodErrors(error) {
  const out = {};
  for (const issue of error.issues || []) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Parse and return { success, data, errors }. */
export function safeParse(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) return { success: true, data: result.data, errors: null };
  return { success: false, data: null, errors: formatZodErrors(result.error) };
}
