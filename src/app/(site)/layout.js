import { getPublicFormSettings, getSettings } from '@/lib/settings';
import { getCourseOptions } from '@/lib/queries/courses';
import { toBool } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SiteProviders from '@/components/layout/SiteProviders';
import ShortlistDrawer from '@/components/shortlist/ShortlistDrawer';
import FloatingActions from '@/components/layout/FloatingActions';

/**
 * Public site chrome.
 *
 * The admin dashboard sits outside this route group so it gets none of this —
 * no site header, no floating WhatsApp button, no shortlist state.
 *
 * `courseOptions` is fetched once here and shared with the shortlist drawer so
 * the in-drawer enquiry form can offer every course without its own round trip.
 */
export default async function SiteLayout({ children }) {
  // `formSettings` is the narrow, publishable subset — the drawer is a Client
  // Component, so whatever it receives ends up in the page source.
  const [settings, formSettings, courseOptions] = await Promise.all([
    getSettings(),
    getPublicFormSettings(),
    getCourseOptions(),
  ]);

  return (
    <SiteProviders maxShortlist={Number(settings.enquiry_max_courses) || 8}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:font-display focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>

      <ShortlistDrawer courseOptions={courseOptions} settings={formSettings} />
      <FloatingActions
        whatsapp={settings.contact_whatsapp}
        phone={settings.contact_phone}
        whatsappMessage={settings.whatsapp_default_message}
        whatsappEnabled={toBool(settings.whatsapp_widget_enabled)}
      />
    </SiteProviders>
  );
}
