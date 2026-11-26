import { Inter, Sora } from 'next/font/google';
import { getSettings } from '@/lib/settings';
import { themeStyle } from '@/lib/palette';
import { toBool } from '@/lib/utils';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata() {
  const s = await getSettings();
  const indexable = toBool(s.seo_robots_index);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.seo_title || s.site_name,
      template: s.seo_title_template || `%s | ${s.site_name}`,
    },
    description: s.seo_description || s.site_description,
    keywords: s.seo_keywords ? s.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
    applicationName: s.site_name,
    icons: s.site_favicon ? { icon: s.site_favicon } : undefined,
    openGraph: {
      type: 'website',
      siteName: s.site_name,
      title: s.seo_title || s.site_name,
      description: s.seo_description || s.site_description,
      url: SITE_URL,
      images: s.seo_og_image ? [{ url: s.seo_og_image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: s.seo_title || s.site_name,
      description: s.seo_description || s.site_description,
      images: s.seo_og_image ? [s.seo_og_image] : undefined,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    verification: s.seo_google_verification ? { google: s.seo_google_verification } : undefined,
  };
}

export async function generateViewport() {
  const s = await getSettings();
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: s.brand_color || '#382418',
    colorScheme: 'light',
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        {/* Brand colours chosen in Admin → Settings → Branding. */}
        <style dangerouslySetInnerHTML={{ __html: themeStyle(settings) }} />
        {children}
      </body>
    </html>
  );
}
