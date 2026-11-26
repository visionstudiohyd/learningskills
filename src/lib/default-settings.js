/**
 * SETTINGS REGISTRY
 * -----------------------------------------------------------------------------
 * Single source of truth for every admin-editable site setting. It drives:
 *   1. the seed script (rows inserted into `settings`),
 *   2. the admin Settings screens (groups -> labelled, typed fields),
 *   3. runtime fallbacks, so the site renders sensibly even with an empty DB.
 *
 * Adding a setting here is all that is needed for it to appear in the dashboard.
 */

export const SETTING_GROUPS = [
  { key: 'brand', label: 'Branding', icon: 'Palette', description: 'Institute name, logo, favicon, site colours and brand voice.' },
  { key: 'contact', label: 'Contact Details', icon: 'PhoneCall', description: 'Phone, email, address, map and office hours.' },
  { key: 'social', label: 'Social Links', icon: 'Share2', description: 'Social profiles shown in the header and footer.' },
  { key: 'home', label: 'Homepage Content', icon: 'LayoutDashboard', description: 'Section headings and copy on the homepage.' },
  { key: 'pages', label: 'Page Banners', icon: 'FileText', description: 'Headings and intro copy for the inner pages.' },
  { key: 'enquiry', label: 'Enquiry & Forms', icon: 'Inbox', description: 'Form behaviour, thank-you message and notifications.' },
  { key: 'seo', label: 'SEO & Sharing', icon: 'Search', description: 'Default meta tags, Open Graph image and verification.' },
  { key: 'footer', label: 'Footer', icon: 'PanelBottom', description: 'Footer blurb, newsletter and copyright.' },
  { key: 'integrations', label: 'Integrations', icon: 'Plug', description: 'Analytics and third-party scripts.' },
];

/**
 * key, label, type, value (default), group, description?, options?
 * type: text | textarea | richtext | image | color | number | boolean | select | email | url | tel | json
 */
export const DEFAULT_SETTINGS = [
  /* ------------------------------- BRANDING ------------------------------- */
  { key: 'site_name', label: 'Institute name', type: 'text', group: 'brand', value: 'Learning Skills' },
  { key: 'site_short_name', label: 'Short name / initials', type: 'text', group: 'brand', value: 'Learning Skills', description: 'Used in tight spaces such as the mobile header.' },
  { key: 'site_tagline', label: 'Tagline', type: 'text', group: 'brand', value: 'Learn with direction' },
  { key: 'site_logo', label: 'Logo (light background)', type: 'image', group: 'brand', value: '' },
  { key: 'site_logo_light', label: 'Logo (dark background)', type: 'image', group: 'brand', value: '', description: 'Shown on the dark site header. Falls back to the light-background logo when empty.' },
  { key: 'site_favicon', label: 'Favicon', type: 'image', group: 'brand', value: '' },
  { key: 'brand_color', label: 'Primary brand colour', type: 'color', group: 'brand', value: '#382418', description: 'Dark surfaces: header, footer, headlines and dark sections.' },
  { key: 'brand_accent_color', label: 'Button / accent colour', type: 'color', group: 'brand', value: '#8ec5ff', description: 'All buttons, badges, links and highlights.' },
  { key: 'brand_surface_color', label: 'Page background colour', type: 'color', group: 'brand', value: '#f2e8da', description: 'The light background used behind sections across the site.' },
  { key: 'site_description', label: 'One-line description', type: 'textarea', group: 'brand', value: 'Career-focused short courses and professional certifications taught by industry practitioners, online and in the classroom.' },

  /* -------------------------------- CONTACT ------------------------------- */
  { key: 'contact_phone', label: 'Primary phone', type: 'tel', group: 'contact', value: '+91 98765 43210' },
  { key: 'contact_phone_alt', label: 'Secondary phone', type: 'tel', group: 'contact', value: '' },
  { key: 'contact_whatsapp', label: 'WhatsApp number', type: 'tel', group: 'contact', value: '+91 98765 43210', description: 'Include the country code. Used for the floating WhatsApp button.' },
  { key: 'contact_email', label: 'Primary email', type: 'email', group: 'contact', value: 'admissions@learningskills.com' },
  { key: 'contact_email_alt', label: 'Support email', type: 'email', group: 'contact', value: '' },
  { key: 'contact_address', label: 'Address', type: 'textarea', group: 'contact', value: 'Level 3, Cyber Towers, HITEC City\nMadhapur, Hyderabad, Telangana 500081\nIndia' },
  { key: 'contact_map_embed', label: 'Google Maps embed URL', type: 'url', group: 'contact', value: 'https://www.google.com/maps?q=HITEC+City+Hyderabad&output=embed', description: 'Paste the src URL from the Google Maps "Embed a map" share tab.' },
  { key: 'contact_hours', label: 'Office hours', type: 'textarea', group: 'contact', value: 'Monday – Friday: 9:00 AM – 7:00 PM\nSaturday: 10:00 AM – 4:00 PM\nSunday: Closed' },
  { key: 'contact_response_time', label: 'Stated response time', type: 'text', group: 'contact', value: 'We reply to every enquiry within 24 working hours.' },

  /* --------------------------------- SOCIAL ------------------------------- */
  { key: 'social_facebook', label: 'Facebook URL', type: 'url', group: 'social', value: 'https://facebook.com' },
  { key: 'social_instagram', label: 'Instagram URL', type: 'url', group: 'social', value: 'https://instagram.com' },
  { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url', group: 'social', value: 'https://linkedin.com' },
  { key: 'social_youtube', label: 'YouTube URL', type: 'url', group: 'social', value: 'https://youtube.com' },
  { key: 'social_twitter', label: 'X / Twitter URL', type: 'url', group: 'social', value: '' },
  { key: 'social_telegram', label: 'Telegram URL', type: 'url', group: 'social', value: '' },

  /* ------------------------------- HOMEPAGE ------------------------------- */
  { key: 'home_intro_eyebrow', label: 'Intro · eyebrow', type: 'text', group: 'home', value: 'Who we are' },
  { key: 'home_intro_title', label: 'Intro · heading', type: 'text', group: 'home', value: 'A learning partner built around where you want to go next' },
  { key: 'home_intro_text', label: 'Intro · paragraph', type: 'textarea', group: 'home', value: 'Learning Skills exists for one reason: to turn ambition into a qualification that employers recognise. Every programme is shaped with hiring managers, taught by practitioners, and sized to fit around a working week.' },
  { key: 'home_intro_image', label: 'Intro · image', type: 'image', group: 'home', value: '' },
  { key: 'home_intro_secondary_image', label: 'Intro · second image', type: 'image', group: 'home', value: '' },

  { key: 'home_courses_eyebrow', label: 'Popular courses · eyebrow', type: 'text', group: 'home', value: 'Most enquired' },
  { key: 'home_courses_title', label: 'Popular courses · heading', type: 'text', group: 'home', value: 'Programmes our learners ask about most' },
  { key: 'home_courses_text', label: 'Popular courses · subheading', type: 'textarea', group: 'home', value: 'Short, intensive and career-mapped. Pick the ones that interest you and send a single enquiry.' },


  { key: 'home_features_eyebrow', label: 'Benefits · eyebrow', type: 'text', group: 'home', value: 'Why Learning Skills' },
  { key: 'home_features_title', label: 'Benefits · heading', type: 'text', group: 'home', value: 'Built for people who have a job, a life, and a goal' },
  { key: 'home_features_text', label: 'Benefits · subheading', type: 'textarea', group: 'home', value: 'The things learners tell us made the difference.' },

  { key: 'home_process_eyebrow', label: 'Process · eyebrow', type: 'text', group: 'home', value: 'How it works' },
  { key: 'home_process_title', label: 'Process · heading', type: 'text', group: 'home', value: 'From first question to first class in four steps' },
  { key: 'home_process_text', label: 'Process · subheading', type: 'textarea', group: 'home', value: 'No application fees, no entrance exams, no pressure.' },


  { key: 'home_testimonials_eyebrow', label: 'Testimonials · eyebrow', type: 'text', group: 'home', value: 'Learner stories' },
  { key: 'home_testimonials_title', label: 'Testimonials · heading', type: 'text', group: 'home', value: 'What changed after the course' },
  { key: 'home_testimonials_text', label: 'Testimonials · subheading', type: 'textarea', group: 'home', value: 'Unedited words from recent cohorts.' },

  { key: 'home_faq_eyebrow', label: 'FAQ · eyebrow', type: 'text', group: 'home', value: 'Good questions' },
  { key: 'home_faq_title', label: 'FAQ · heading', type: 'text', group: 'home', value: 'Everything you are probably wondering' },
  { key: 'home_faq_text', label: 'FAQ · subheading', type: 'textarea', group: 'home', value: 'Still unsure? Our admissions team answers in plain language.' },

  { key: 'home_cta_title', label: 'Final CTA · heading', type: 'text', group: 'home', value: 'Tell us what you want to learn. We will map the rest.' },
  { key: 'home_cta_text', label: 'Final CTA · paragraph', type: 'textarea', group: 'home', value: 'Send one enquiry, pick as many courses as you like, and get a call back from a real course advisor — not a chatbot.' },
  { key: 'home_cta_image', label: 'Final CTA · background image', type: 'image', group: 'home', value: '' },

  /* ------------------------------ PAGE BANNERS --------------------------- */
  { key: 'courses_page_title', label: 'Courses · heading', type: 'text', group: 'pages', value: 'Explore our courses' },
  { key: 'courses_page_text', label: 'Courses · intro', type: 'textarea', group: 'pages', value: 'Filter by field, level and delivery mode. Shortlist as many programmes as you like, then send one enquiry.' },
  { key: 'courses_page_banner', label: 'Courses · banner image', type: 'image', group: 'pages', value: '' },
  { key: 'about_page_title', label: 'About · heading', type: 'text', group: 'pages', value: 'The academy behind the outcomes' },
  { key: 'about_page_text', label: 'About · intro', type: 'textarea', group: 'pages', value: 'Founded by practitioners who were tired of training that did not translate into work.' },
  { key: 'about_page_banner', label: 'About · banner image', type: 'image', group: 'pages', value: '' },
  { key: 'contact_page_title', label: 'Contact · heading', type: 'text', group: 'pages', value: 'Talk to a course advisor' },
  { key: 'contact_page_text', label: 'Contact · intro', type: 'textarea', group: 'pages', value: 'Call, message on WhatsApp, email, or drop into the campus. Whichever is easiest.' },
  { key: 'contact_page_banner', label: 'Contact · banner image', type: 'image', group: 'pages', value: '' },
  { key: 'faq_page_title', label: 'FAQ · heading', type: 'text', group: 'pages', value: 'Frequently asked questions' },
  { key: 'faq_page_text', label: 'FAQ · intro', type: 'textarea', group: 'pages', value: 'Admissions, fees, certificates, schedules — answered.' },

  /* ------------------------------- ENQUIRY ------------------------------- */
  { key: 'enquiry_form_title', label: 'Form heading', type: 'text', group: 'enquiry', value: 'Request course details' },
  { key: 'enquiry_form_text', label: 'Form subheading', type: 'textarea', group: 'enquiry', value: 'Takes under a minute. No payment details, ever.' },
  { key: 'enquiry_success_title', label: 'Thank-you heading', type: 'text', group: 'enquiry', value: 'Enquiry received' },
  { key: 'enquiry_success_text', label: 'Thank-you message', type: 'textarea', group: 'enquiry', value: 'Thank you — a course advisor will contact you within 24 working hours with the prospectus, fees and upcoming batch dates.' },
  { key: 'enquiry_notify_email', label: 'Send new-enquiry alerts to', type: 'email', group: 'enquiry', value: '', description: 'Leave blank to use the primary contact email.' },
  { key: 'enquiry_require_city', label: 'Make "city" a required field', type: 'boolean', group: 'enquiry', value: '0' },
  { key: 'enquiry_max_courses', label: 'Max courses per enquiry', type: 'number', group: 'enquiry', value: '8' },
  { key: 'enquiry_consent_text', label: 'Consent checkbox text', type: 'textarea', group: 'enquiry', value: 'I agree to be contacted about my enquiry by phone, email or WhatsApp.' },
  { key: 'whatsapp_widget_enabled', label: 'Show floating WhatsApp button', type: 'boolean', group: 'enquiry', value: '1' },
  { key: 'whatsapp_default_message', label: 'WhatsApp prefilled message', type: 'textarea', group: 'enquiry', value: 'Hello! I would like to know more about your courses.' },

  /* ---------------------------------- SEO -------------------------------- */
  { key: 'seo_title', label: 'Default page title', type: 'text', group: 'seo', value: 'Learning Skills — Career-focused courses & professional certifications' },
  { key: 'seo_title_template', label: 'Title template', type: 'text', group: 'seo', value: '%s | Learning Skills', description: 'Use %s where the page name should appear.' },
  { key: 'seo_description', label: 'Default meta description', type: 'textarea', group: 'seo', value: 'Industry-designed short courses in technology, business, healthcare and design. Flexible online and classroom batches, practitioner trainers, and recognised certification.' },
  { key: 'seo_keywords', label: 'Default meta keywords', type: 'textarea', group: 'seo', value: 'professional courses, short courses, certification, online learning, career training' },
  { key: 'seo_og_image', label: 'Social share image', type: 'image', group: 'seo', value: '', description: 'Recommended 1200 × 630 px.' },
  { key: 'seo_google_verification', label: 'Google site verification', type: 'text', group: 'seo', value: '' },
  { key: 'seo_robots_index', label: 'Allow search engines to index the site', type: 'boolean', group: 'seo', value: '1' },

  /* --------------------------------- FOOTER ------------------------------ */
  { key: 'footer_about_text', label: 'Footer blurb', type: 'textarea', group: 'footer', value: 'Learning Skills trains working professionals and recent graduates in the skills employers are actually hiring for — with batches that fit around real life.' },
  { key: 'footer_newsletter_enabled', label: 'Show newsletter signup', type: 'boolean', group: 'footer', value: '0' },
  { key: 'footer_newsletter_title', label: 'Newsletter heading', type: 'text', group: 'footer', value: 'New batches, in your inbox' },
  { key: 'footer_newsletter_text', label: 'Newsletter subheading', type: 'textarea', group: 'footer', value: 'One short email a month: new courses, upcoming batch dates and scholarship windows.' },
  { key: 'footer_copyright', label: 'Copyright line', type: 'text', group: 'footer', value: 'Learning Skills. All rights reserved.' },
  { key: 'footer_badge_text', label: 'Trust badge text', type: 'text', group: 'footer', value: 'ISO 9001:2015 certified training provider' },

  /* ------------------------------ INTEGRATIONS --------------------------- */
  { key: 'integration_ga_id', label: 'Google Analytics measurement ID', type: 'text', group: 'integrations', value: '', description: 'e.g. G-XXXXXXXXXX. Leave blank to disable.' },
  { key: 'integration_gtm_id', label: 'Google Tag Manager ID', type: 'text', group: 'integrations', value: '', description: 'e.g. GTM-XXXXXXX' },
  { key: 'integration_head_scripts', label: 'Custom <head> code', type: 'textarea', group: 'integrations', value: '', description: 'Injected site-wide. Only paste code you trust.' },
];

/** Flat { key: defaultValue } map used as the runtime fallback. */
export const SETTINGS_FALLBACK = Object.freeze(
  DEFAULT_SETTINGS.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {})
);

/** Lookup of field metadata by key, for the admin settings forms. */
export const SETTINGS_META = Object.freeze(
  DEFAULT_SETTINGS.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {})
);
