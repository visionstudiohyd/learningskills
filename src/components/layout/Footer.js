import Link from 'next/link';
import { ArrowRight, Clock, Facebook, Flag, Instagram, Linkedin, Mail, MapPin, Phone, Send, Twitter, Youtube } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { getMenu } from '@/lib/queries/content';
import { getMenuCourses } from '@/lib/queries/courses';
import { sanitisePhone, toBool } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import NewsletterForm from '@/components/forms/NewsletterForm';

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  telegram: Send,
};

export default async function Footer() {
  const [settings, secondary, popularCourses] = await Promise.all([
    getSettings(),
    getMenu('footer_secondary'),
    getMenuCourses(6),
  ]);

  const socials = [
    { key: 'facebook', url: settings.social_facebook, label: 'Facebook' },
    { key: 'instagram', url: settings.social_instagram, label: 'Instagram' },
    { key: 'linkedin', url: settings.social_linkedin, label: 'LinkedIn' },
    { key: 'youtube', url: settings.social_youtube, label: 'YouTube' },
    { key: 'twitter', url: settings.social_twitter, label: 'X (Twitter)' },
    { key: 'telegram', url: settings.social_telegram, label: 'Telegram' },
  ].filter((s) => s.url);

  const addressLines = String(settings.contact_address || '').split('\n').filter(Boolean);
  const hourLines = String(settings.contact_hours || '').split('\n').filter(Boolean);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-brand-900 text-white">
      {/* --------------------------- advisor prompt -------------------------- */}
      <div className="relative border-b border-white/10 bg-ink-50 text-ink-800">
        <div className="shell flex flex-col items-center gap-6 py-12 text-center">
          <Flag className="h-10 w-10 text-brand-600" strokeWidth={1.8} />
          <h2 className="max-w-2xl font-display text-2xl font-bold text-ink-950 md:text-3xl">
            Still deciding whether we are the right fit?
          </h2>
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-ink-600">
            Ask an advisor directly. They are measured on whether learners finish and benefit, not on how many they
            enrol — so you will get a straight answer about whether a programme suits your goal.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-primary btn-lg">
              Talk to an advisor
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.4} />
            </Link>
            <Link href="/courses" className="btn btn-outline btn-lg">
              Browse all programmes
            </Link>
          </div>
        </div>
      </div>

      {/* ----------------------------- newsletter ---------------------------- */}
      {toBool(settings.footer_newsletter_enabled) && (
        <div className="relative border-b border-white/10">
          <div className="shell grid gap-6 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10 md:py-12">
            <div>
              <h2 className="font-display text-2xl font-bold text-white md:text-[1.75rem]">
                {settings.footer_newsletter_title}
              </h2>
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-white/65">
                {settings.footer_newsletter_text}
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      )}

      {/* ------------------------------- columns ----------------------------- */}
      <div className="relative">
        <div className="shell grid gap-10 py-12 md:grid-cols-3 md:gap-8">
          {/* brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${settings.site_name} — home`}>
              {settings.site_logo_light || settings.site_logo ? (
                <span className="relative block h-10 w-40">
                  <SmartImage
                    src={settings.site_logo_light || settings.site_logo}
                    alt={settings.site_name}
                    fill
                    className="object-contain object-left"
                    sizes="200px"
                  />
                </span>
              ) : (
                <>
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl bg-accent-600 font-display text-lg font-extrabold text-brand-950"
                    aria-hidden="true"
                  >
                    {String(settings.site_name || 'L').charAt(0)}
                  </span>
                  <span className="font-display text-[1.0625rem] font-extrabold tracking-tight text-white">
                    {settings.site_name}
                  </span>
                </>
              )}
            </Link>

            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/60">
              {settings.footer_about_text}
            </p>

            {settings.footer_badge_text && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                {settings.footer_badge_text}
              </p>
            )}

            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((social) => {
                  const SocialIcon = SOCIAL_ICONS[social.key] || Send;
                  return (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/5 text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-brand-500 hover:text-white"
                    >
                      <SocialIcon className="h-4.5 w-4.5" strokeWidth={2} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* popular courses */}
          <nav aria-label="Popular courses">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/50">Courses</h3>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              {popularCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-block text-white/65 transition-all duration-200 hover:translate-x-0.5 hover:text-accent-300"
                  >
                    {course.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/courses"
                  className="inline-block font-semibold text-accent-300 transition-all duration-200 hover:translate-x-0.5"
                >
                  All courses →
                </Link>
              </li>
            </ul>
          </nav>

          {/* contact */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/50">Get in touch</h3>
            <ul className="mt-5 space-y-4 text-[0.9375rem]">
              {addressLines.length > 0 && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-300" strokeWidth={2} />
                  <address className="not-italic leading-relaxed text-white/65">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-300" strokeWidth={2} />
                  <span className="flex flex-col">
                    <a href={`tel:${sanitisePhone(settings.contact_phone)}`} className="text-white/80 transition-colors hover:text-accent-300">
                      {settings.contact_phone}
                    </a>
                    {settings.contact_phone_alt && (
                      <a href={`tel:${sanitisePhone(settings.contact_phone_alt)}`} className="text-white/60 transition-colors hover:text-accent-300">
                        {settings.contact_phone_alt}
                      </a>
                    )}
                  </span>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-300" strokeWidth={2} />
                  <a href={`mailto:${settings.contact_email}`} className="break-all text-white/80 transition-colors hover:text-accent-300">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {hourLines.length > 0 && (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-300" strokeWidth={2} />
                  <span className="leading-relaxed text-white/65">
                    {hourLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ------------------------------- bottom ------------------------------ */}
      <div className="relative border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-4 py-5 text-[0.8125rem] text-white/50 sm:flex-row">
          <p>
            © {year} {settings.footer_copyright}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {secondary.map((item) => (
              <li key={item.id}>
                <Link href={item.url} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
