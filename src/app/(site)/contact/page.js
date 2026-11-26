import Link from 'next/link';
import {
  Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send, Twitter, Youtube,
} from 'lucide-react';
import { getPublicFormSettings, getSettings } from '@/lib/settings';
import { getCourseOptions } from '@/lib/queries/courses';
import { getFaqs } from '@/lib/queries/content';
import { sanitisePhone, whatsappLink } from '@/lib/utils';
import PageHero from '@/components/layout/PageHero';
import Accordion from '@/components/ui/Accordion';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import Icon, { WhatsAppIcon } from '@/components/ui/Icon';
import EnquiryForm from '@/components/forms/EnquiryForm';
import ContactForm from '@/components/forms/ContactForm';

export const revalidate = 300;

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  telegram: Send,
};

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: s.contact_page_title || 'Contact Us',
    description: s.contact_page_text || s.seo_description,
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage() {
  const [settings, formSettings, courseOptions, faqs] = await Promise.all([
    getSettings(),
    getPublicFormSettings(),
    getCourseOptions(),
    getFaqs({ limit: 6 }),
  ]);

  const addressLines = String(settings.contact_address || '').split('\n').filter(Boolean);
  const hourLines = String(settings.contact_hours || '').split('\n').filter(Boolean);
  const waLink = settings.contact_whatsapp ? whatsappLink(settings.contact_whatsapp, settings.whatsapp_default_message) : '';

  const socials = [
    { key: 'facebook', url: settings.social_facebook, label: 'Facebook' },
    { key: 'instagram', url: settings.social_instagram, label: 'Instagram' },
    { key: 'linkedin', url: settings.social_linkedin, label: 'LinkedIn' },
    { key: 'youtube', url: settings.social_youtube, label: 'YouTube' },
    { key: 'twitter', url: settings.social_twitter, label: 'X' },
    { key: 'telegram', url: settings.social_telegram, label: 'Telegram' },
  ].filter((s) => s.url);

  /* Contact routes, ordered by how quickly the visitor gets an answer. */
  const channels = [
    waLink && {
      key: 'whatsapp',
      href: waLink,
      external: true,
      title: 'WhatsApp',
      value: settings.contact_whatsapp,
      note: 'Usually the fastest reply',
      colour: '#25D366',
      custom: true,
    },
    settings.contact_phone && {
      key: 'phone',
      href: `tel:${sanitisePhone(settings.contact_phone)}`,
      title: 'Call the admissions desk',
      value: settings.contact_phone,
      note: settings.contact_phone_alt ? `Also: ${settings.contact_phone_alt}` : 'During office hours',
      icon: Phone,
      colour: settings.brand_color,
    },
    settings.contact_email && {
      key: 'email',
      href: `mailto:${settings.contact_email}`,
      title: 'Email us',
      value: settings.contact_email,
      note: settings.contact_response_time || 'We reply within 24 working hours',
      icon: Mail,
      colour: settings.brand_accent_color,
    },
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="We are easy to reach"
        title={settings.contact_page_title}
        text={settings.contact_page_text}
        image={settings.contact_page_banner}
        crumbs={[{ label: 'Contact Us' }]}
      />

      {/* --------------------------- contact channels ----------------------- */}
      <section className="border-b border-ink-200 bg-white py-10 md:py-12">
        <div className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel, i) => (
            <Reveal key={channel.key} delay={i * 80}>
              <a
                href={channel.href}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noopener noreferrer' : undefined}
                className="group flex h-full items-start gap-4 rounded-[var(--radius-card)] border border-ink-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-lift)]"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: channel.colour }}
                >
                  {channel.custom ? <WhatsAppIcon size={22} /> : <channel.icon className="h-6 w-6" strokeWidth={2.1} />}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.8125rem] font-bold uppercase tracking-wide text-ink-400">
                    {channel.title}
                  </span>
                  <span className="mt-1 block break-words font-display text-[1.0625rem] font-bold text-ink-950 transition-colors group-hover:text-brand-700">
                    {channel.value}
                  </span>
                  <span className="mt-1 block text-xs text-ink-500">{channel.note}</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------- enquiry + details grid --------------------- */}
      <section className="section bg-ink-50">
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
          {/* course enquiry form — the primary action on this page */}
          <div id="enquiry">
            <SectionHeading
              eyebrow="Course enquiry"
              title="Tell us what you want to learn"
              highlight="what you want to learn"
              text="Select every course you are considering — your advisor will cover them all on one call."
              align="left"
            />
            <EnquiryForm courseOptions={courseOptions} settings={formSettings} className="mt-7" />
          </div>

          {/* visit + hours + social */}
          <div className="space-y-5">
            {addressLines.length > 0 && (
              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <MapPin className="h-5.5 w-5.5" strokeWidth={2.1} />
                    </span>
                    <h2 className="font-display text-lg font-bold text-ink-950">Visit the campus</h2>
                  </div>
                  <address className="mt-4 not-italic leading-relaxed text-[0.9375rem] text-ink-600">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                  <p className="mt-4 text-xs text-ink-500">
                    Drop-in visits are welcome during office hours, though booking ahead means a trainer can meet you.
                  </p>
                </div>
              </Reveal>
            )}

            {hourLines.length > 0 && (
              <Reveal delay={80}>
                <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <Clock className="h-5.5 w-5.5" strokeWidth={2.1} />
                    </span>
                    <h2 className="font-display text-lg font-bold text-ink-950">Office hours</h2>
                  </div>
                  <dl className="mt-4 divide-y divide-ink-200 text-[0.9375rem]">
                    {hourLines.map((line) => {
                      const [day, ...time] = line.split(':');
                      return (
                        <div key={line} className="flex items-center justify-between gap-4 py-2.5">
                          <dt className="text-ink-600">{day}</dt>
                          <dd className="font-medium text-ink-900">{time.join(':').trim() || '—'}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              </Reveal>
            )}

            {socials.length > 0 && (
              <Reveal delay={160}>
                <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
                  <h2 className="font-display text-lg font-bold text-ink-950">Follow along</h2>
                  <p className="mt-2 text-sm text-ink-600">
                    Batch announcements, learner work and the occasional free workshop.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {socials.map((social) => {
                      const SocialIcon = SOCIAL_ICONS[social.key] || Send;
                      return (
                        <a
                          key={social.key}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="grid h-11 w-11 place-items-center rounded-xl border border-ink-200 bg-ink-50 text-ink-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-brand-500 hover:text-white"
                        >
                          <SocialIcon className="h-5 w-5" strokeWidth={2} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={220}>
              <div className="rounded-[var(--radius-card)] border border-accent-200 bg-accent-50/70 p-6">
                <h2 className="font-display text-base font-bold text-ink-950">Corporate or group training?</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  Closed cohorts for six or more learners are adapted to your sector and systems, and attract group
                  pricing. Mention it in your enquiry and an advisor will scope it with you.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------- map -------------------------------- */}
      {settings.contact_map_embed && (
        <section className="relative">
          <div className="h-[22rem] w-full overflow-hidden bg-ink-100 md:h-[26rem]">
            <iframe
              src={settings.contact_map_embed}
              title={`Map showing the location of ${settings.site_name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* --------------------- general message + FAQs ----------------------- */}
      <section className="section bg-white">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ContactForm />

          <div>
            <SectionHeading
              eyebrow="Before you write"
              title="These come up most often"
              highlight="most often"
              text="Your answer may already be here."
              align="left"
            />
            <Accordion className="mt-7" items={faqs} defaultOpen={[0]} />
            <div className="mt-6">
              <Link href="/faqs" className="btn btn-outline btn-sm">
                Read all FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
