import slugifyLib from 'slugify';

/** Join class names, dropping falsy values. */
export function cx(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ');
}

/** URL-safe slug. */
export function slugify(value) {
  return slugifyLib(String(value || ''), {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@?]/g,
  });
}

/** Coerce DB tinyint(1) / "0" / "false" into a real boolean. */
export function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return false;
  const s = String(value).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/** DB tinyint for writes. */
export function toTinyInt(value) {
  return toBool(value) ? 1 : 0;
}

/** Null-safe integer. */
export function toInt(value, fallback = null) {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

/** Null-safe decimal. */
export function toNum(value, fallback = null) {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

/** Empty string -> null, so optional DB columns stay NULL rather than ''. */
export function nullIfBlank(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

/** 1234567 -> "1.2M", 4500 -> "4.5K" */
export function compactNumber(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

/** 12345 -> "12,345" */
export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

const DATE_OPTS = { day: 'numeric', month: 'short', year: 'numeric' };

export function formatDate(value, withTime = false) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', withTime ? { ...DATE_OPTS, hour: '2-digit', minute: '2-digit' } : DATE_OPTS);
}

/** "3 hours ago" style label for the dashboard. */
export function timeAgo(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

/** Strip HTML tags, then truncate on a word boundary. */
export function excerpt(html, maxLength = 160) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, text.lastIndexOf(' ', maxLength)).trim()}…`;
}

/** Newline-separated textarea -> trimmed array (used for syllabus topics). */
export function linesToArray(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Digits-only phone for tel: / wa.me links. */
export function sanitisePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
}

/** Build a wa.me deep link with a prefilled message. */
export function whatsappLink(number, message = '') {
  const digits = sanitisePhone(number);
  if (!digits) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

/** Human-readable reference: ENQ-5F3A2B */
export function makeReference(prefix = 'ENQ') {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${stamp}${rand}`;
}

/** Client IP behind Vercel / cPanel proxies. */
export function getClientIp(headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 60);
  return (headers.get('x-real-ip') || headers.get('cf-connecting-ip') || '').slice(0, 60) || null;
}

/** Deterministic pick from a palette, so the same id always gets the same colour. */
export function pickByIndex(list, index) {
  if (!list.length) return undefined;
  return list[Math.abs(Number(index) || 0) % list.length];
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

/** Plain JSON clone — strips Date/Decimal wrappers before crossing to Client Components. */
export function plain(value) {
  return JSON.parse(JSON.stringify(value, (_key, v) => (v instanceof Date ? v.toISOString() : v)));
}
