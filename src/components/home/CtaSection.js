import Link from 'next/link';
import { ArrowRight, Clock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { sanitisePhone, whatsappLink } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SmartImage from '@/components/ui/SmartImage';

const DEFAULT_BG = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80';

/**
 * Closing conversion block. Offers every contact route the institute supports
 * so the visitor can use whichever one they are most comfortable with.
 */
export default function CtaSection({ settings = {} }) {
  const phone = settings.contact_phone;
  const wa = settings.contact_whatsapp;
  const waLink = wa ? whatsappLink(wa, settings.whatsapp_default_message) : '';

  return (
    <section className="relative overflow-hidden bg-ink-950 py-12">
      <SmartImage
        src={settings.home_cta_image || DEFAULT_BG}
        alt=""
        fill
        sizes="100vw"
        quality={78}
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgb(20 22 58 / 0.96) 0%, rgb(14 18 34 / 0.9) 45%, rgb(35 8 90 / 0.78) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="shell relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12">
        <div>
          <Reveal>
            <h2 className="text-display-md text-white md:text-display-lg">{settings.home_cta_title}</h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-white/75">{settings.home_cta_text}</p>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-accent btn-lg">
                Explore courses
                <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.4} />
              </Link>
              <Link href="/contact" className="btn btn-ghost-light btn-lg">
                Send an enquiry
              </Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-[0.8125rem] text-white/60">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-300" strokeWidth={2.2} />
                No payment details requested
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-300" strokeWidth={2.2} />
                Reply within 24 working hours
              </li>
            </ul>
          </Reveal>
        </div>

        {/* direct contact card */}
        <Reveal direction="left" delay={120}>
          <div className="rounded-[var(--radius-card)] border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md md:p-7">
            <h3 className="font-display text-lg font-bold text-white">Rather talk to someone now?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Our admissions desk is staffed during office hours. Pick whichever is easiest.
            </p>

            <div className="mt-6 space-y-2.5">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-white/12 bg-white/5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#25D366]/50 hover:bg-white/10"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25D366] text-white">
                    <WhatsAppIcon size={21} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-semibold text-white">WhatsApp us</span>
                    <span className="block truncate text-xs text-white/55">Usually the fastest reply</span>
                  </span>
                  <ArrowRight
                    className="ml-auto h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                    strokeWidth={2.4}
                  />
                </a>
              )}

              {phone && (
                <a
                  href={`tel:${sanitisePhone(phone)}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/12 bg-white/5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300/50 hover:bg-white/10"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500 text-white">
                    <Phone className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-semibold text-white">{phone}</span>
                    <span className="block truncate text-xs text-white/55">Call the admissions desk</span>
                  </span>
                  <ArrowRight
                    className="ml-auto h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                    strokeWidth={2.4}
                  />
                </a>
              )}

              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/12 bg-white/5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300/50 hover:bg-white/10"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-400 text-ink-950">
                    <Mail className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold text-white">
                      {settings.contact_email}
                    </span>
                    <span className="block truncate text-xs text-white/55">Email the course team</span>
                  </span>
                  <ArrowRight
                    className="ml-auto h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                    strokeWidth={2.4}
                  />
                </a>
              )}
            </div>

            {settings.contact_hours && (
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">
                {String(settings.contact_hours).split('\n')[0]}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
