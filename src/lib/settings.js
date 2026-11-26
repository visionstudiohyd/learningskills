import { query, execute } from './db';
import { SETTINGS_FALLBACK, SETTING_GROUPS, SETTINGS_META } from './default-settings';
import { toBool } from './utils';

/**
 * Settings accessor.
 *
 * Every public page needs these, so they are read once per request and memoised
 * for the lifetime of the render. If the database is unreachable (e.g. XAMPP
 * MySQL not started yet, or a cold cPanel host) we fall back to the registry
 * defaults instead of throwing — the site stays up, just with default copy.
 */

const CACHE_TTL_MS = 30_000;
const globalForSettings = globalThis;

function cache() {
  if (!globalForSettings.__cepSettingsCache) {
    globalForSettings.__cepSettingsCache = { value: null, expires: 0, degraded: false };
  }
  return globalForSettings.__cepSettingsCache;
}

/** Drop the cache so the next read reflects what the admin just saved. */
export function invalidateSettings() {
  const c = cache();
  c.value = null;
  c.expires = 0;
}

/**
 * All settings as a flat object. Registry defaults fill any key that is missing
 * from the database, so new settings work before the seed is re-run.
 */
export async function getSettings() {
  const c = cache();
  if (c.value && c.expires > Date.now()) return c.value;

  try {
    const rows = await query('SELECT setting_key, setting_value FROM settings');
    const fromDb = {};
    for (const row of rows) {
      fromDb[row.setting_key] = row.setting_value;
    }
    c.value = { ...SETTINGS_FALLBACK, ...fromDb };
    c.degraded = false;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[settings] database unavailable (${error.code || error.message}) — using defaults`);
    }
    c.value = { ...SETTINGS_FALLBACK };
    c.degraded = true;
  }

  c.expires = Date.now() + CACHE_TTL_MS;
  return c.value;
}

/** True when the last read fell back to defaults. */
export function settingsAreDegraded() {
  return cache().degraded === true;
}

/** One setting, with an optional per-call fallback. */
export async function getSetting(key, fallback = '') {
  const all = await getSettings();
  const value = all[key];
  return value === undefined || value === null || value === '' ? fallback : value;
}

/** One setting coerced to boolean. */
export async function getSettingBool(key, fallback = false) {
  const all = await getSettings();
  const value = all[key];
  if (value === undefined || value === null || value === '') return fallback;
  return toBool(value);
}

/** Settings for the admin UI, grouped and annotated with field metadata. */
export async function getGroupedSettings() {
  let rows = [];
  try {
    rows = await query(
      'SELECT setting_key, setting_value, setting_group, setting_type, label, description, options, display_order FROM settings ORDER BY setting_group, display_order, id'
    );
  } catch {
    rows = [];
  }

  const byKey = new Map(rows.map((r) => [r.setting_key, r]));

  return SETTING_GROUPS.map((group) => {
    const fields = Object.values(SETTINGS_META)
      .filter((meta) => meta.group === group.key)
      .map((meta) => {
        const row = byKey.get(meta.key);
        return {
          key: meta.key,
          label: row?.label || meta.label,
          type: row?.setting_type || meta.type,
          description: row?.description ?? meta.description ?? null,
          options: row?.options ?? meta.options ?? null,
          value: row ? (row.setting_value ?? '') : meta.value,
        };
      });
    return { ...group, fields };
  }).filter((group) => group.fields.length > 0);
}

/** Persist a batch of settings. Unknown keys are ignored. */
export async function saveSettings(patch) {
  const entries = Object.entries(patch).filter(([key]) => Boolean(SETTINGS_META[key]));
  if (!entries.length) return 0;

  for (const [key, rawValue] of entries) {
    const meta = SETTINGS_META[key];
    const value =
      meta.type === 'boolean'
        ? toBool(rawValue)
          ? '1'
          : '0'
        : rawValue === null || rawValue === undefined
          ? ''
          : String(rawValue);

    await execute(
      `INSERT INTO settings (setting_group, setting_key, setting_value, setting_type, label, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [meta.group, key, value, meta.type, meta.label, meta.description || null, 0]
    );
  }

  invalidateSettings();
  return entries.length;
}

/**
 * The only settings the public enquiry forms need.
 *
 * Client Components receive their props serialised into the page's HTML, so
 * handing them the whole settings object would publish every key — including
 * internal ones like the notification email, the analytics IDs and any custom
 * head scripts. This returns the narrow subset the forms actually read.
 */
const PUBLIC_FORM_KEYS = [
  'enquiry_form_title',
  'enquiry_form_text',
  'enquiry_success_title',
  'enquiry_success_text',
  'enquiry_consent_text',
  'enquiry_max_courses',
  'enquiry_require_city',
];

export async function getPublicFormSettings() {
  const all = await getSettings();
  const subset = {};
  for (const key of PUBLIC_FORM_KEYS) subset[key] = all[key];
  return subset;
}

/** Branding and contact values the interactive header needs — same reasoning. */
const HEADER_KEYS = [
  'site_name',
  'site_tagline',
  'site_logo',
  'site_logo_light',
  'contact_phone',
  'contact_email',
];

export async function getHeaderSettings() {
  const all = await getSettings();
  const subset = {};
  for (const key of HEADER_KEYS) subset[key] = all[key];
  return subset;
}

/** Derived values the header, footer and floating widgets all need. */
export async function getSiteContext() {
  const s = await getSettings();
  return {
    settings: s,
    siteName: s.site_name,
    tagline: s.site_tagline,
    logo: s.site_logo,
    logoLight: s.site_logo_light || s.site_logo,
    phone: s.contact_phone,
    email: s.contact_email,
    whatsapp: s.contact_whatsapp,
    address: s.contact_address,
    socials: [
      { key: 'facebook', url: s.social_facebook, label: 'Facebook' },
      { key: 'instagram', url: s.social_instagram, label: 'Instagram' },
      { key: 'linkedin', url: s.social_linkedin, label: 'LinkedIn' },
      { key: 'youtube', url: s.social_youtube, label: 'YouTube' },
      { key: 'twitter', url: s.social_twitter, label: 'X' },
      { key: 'telegram', url: s.social_telegram, label: 'Telegram' },
    ].filter((item) => item.url),
  };
}
