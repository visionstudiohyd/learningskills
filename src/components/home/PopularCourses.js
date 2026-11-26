import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CourseCard from '@/components/course/CourseCard';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/** Most-enquired programmes, with a shortcut into the full catalogue. */
export default function PopularCourses({ settings = {}, courses = [] }) {
  if (!courses.length) return null;

  return (
    <section className="section bg-white">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={settings.home_courses_eyebrow}
            title={settings.home_courses_title}
            highlight="ask about most"
            text={settings.home_courses_text}
            align="left"
            className="lg:max-w-2xl"
          />
          <Reveal delay={120}>
            <Link href="/courses" className="btn btn-outline shrink-0">
              All {courses.length > 0 ? 'courses' : 'programmes'}
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <Reveal key={course.id} delay={i * 70}>
              <CourseCard course={course} priority={i < 3} className="h-full" />
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-7 flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-brand-200 bg-brand-50/60 px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-display text-base font-bold text-ink-950">
                Weighing up more than one programme?
              </p>
              <p className="mt-1 text-sm text-ink-600">
                Add each one to your shortlist and send a single enquiry — your advisor will compare them with you.
              </p>
            </div>
            <Link href="/courses" className="btn btn-primary shrink-0">
              Start shortlisting
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
