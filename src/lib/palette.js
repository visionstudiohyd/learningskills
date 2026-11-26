/**
 * COLOUR PALETTE
 * -----------------------------------------------------------------------------
 * The site's theme colours are stored as three admin-editable settings
 * (primary, accent and background). This module turns those three hex values
 * into the full shade scales the Tailwind theme expects, so an admin can pick
 * any colour and the whole site re-tints without a redeploy.
 *
 * The generated CSS variables override the defaults declared in globals.css.
 */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function clamp(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function hexToRgb(hex) {
  const clean = String(hex || '').trim().replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function isHexColor(value) {
  return hexToRgb(value) !== null;
}

function toHex({ r, g, b }) {
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`;
}

/** Mix `hex` toward `target` ('#ffffff' or '#000000') by `amount` (0–1). */
function mix(hex, target, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  if (!a || !b) return hex;
  const t = Math.min(1, Math.max(0, amount));
  return toHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

/**
 * Build a 50–950 shade scale from one base colour.
 * `anchor` is the step that keeps the exact base value.
 */
export function shadeScale(hex, anchor) {
  const base = hexToRgb(hex);
  if (!base) return null;

  const scale = {};
  for (const step of STEPS) {
    if (step === anchor) {
      scale[step] = toHex(base);
    } else if (step < anchor) {
      const amount = ((anchor - step) / (anchor - 50)) * 0.94;
      scale[step] = mix(hex, '#ffffff', amount);
    } else if (anchor >= 700) {
      const amount = ((step - anchor) / (950 - anchor)) * 0.62;
      scale[step] = mix(hex, '#000000', amount);
    } else {
      // Light accents need a much deeper dark end so the 700–950 steps stay
      // readable as text on light backgrounds.
      const amount = 0.55 + ((step - 700) / 250) * 0.31;
      scale[step] = mix(hex, '#000000', amount);
    }
  }
  return scale;
}

export const DEFAULT_PRIMARY = '#382418';
export const DEFAULT_ACCENT = '#8ec5ff';
export const DEFAULT_SURFACE = '#f2e8da';

/**
 * Inline CSS that re-points the theme variables at the colours chosen in
 * Admin → Settings → Branding. Rendered in the root layout, so it is present
 * before any component paints.
 */
export function themeStyle(settings = {}) {
  const primary = isHexColor(settings.brand_color) ? settings.brand_color : DEFAULT_PRIMARY;
  const accent = isHexColor(settings.brand_accent_color) ? settings.brand_accent_color : DEFAULT_ACCENT;
  const surface = isHexColor(settings.brand_surface_color) ? settings.brand_surface_color : DEFAULT_SURFACE;

  const brand = shadeScale(primary, 700);
  const accentScale = shadeScale(accent, 600);

  const vars = [];
  for (const step of STEPS) vars.push(`--color-brand-${step}:${brand[step]};`);
  for (const step of STEPS) vars.push(`--color-accent-${step}:${accentScale[step]};`);
  vars.push(`--color-action:${accentScale[600]};`);
  vars.push(`--color-action-hover:color-mix(in srgb, ${accentScale[600]} 85%, ${brand[700]});`);
  vars.push(`--color-action-ink:${brand[950]};`);
  vars.push(`--surface:${surface};`);

  return `:root{${vars.join('')}}`;
}
