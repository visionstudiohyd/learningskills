'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, ExternalLink, Loader2, Save, Trash2, TriangleAlert,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import FormField from './FormField';
import Repeater from './Repeater';

/**
 * Course editor.
 *
 * Separate from the generic ResourceForm because a course is not one row: it
 * carries learning outcomes, curriculum modules, highlights and its own FAQ
 * list. The whole intended state is submitted in a single request and written
 * in one transaction, so a course can never be left half-saved.
 */

const BASIC_FIELDS = [
  { name: 'title', label: 'Course title', type: 'text', required: true },
  { name: 'slug', label: 'URL slug', type: 'slug', sourceField: 'title', help: 'Leave blank to generate from the title.' },
  { name: 'code', label: 'Course code', type: 'text', help: 'Internal reference, e.g. TECH-101.' },
  {
    name: 'short_description',
    label: 'Short description',
    type: 'textarea',
    rows: 3,
    full: true,
    help: 'One or two sentences. Used on course cards and in search results.',
  },
];

const DETAIL_FIELDS = [
  { name: 'duration', label: 'Duration (display text)', type: 'text', help: 'e.g. "16 weeks"' },
  { name: 'duration_weeks', label: 'Duration in weeks', type: 'number', help: 'Used for sorting by length.' },
  { name: 'lessons_count', label: 'Number of sessions', type: 'number' },
  {
    name: 'level',
    label: 'Level',
    type: 'select',
    required: true,
    options: [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'All Levels', label: 'All Levels' },
    ],
  },
  {
    name: 'delivery_mode',
    label: 'Delivery format',
    type: 'select',
    required: true,
    options: [
      { value: 'Online', label: 'Online' },
      { value: 'Classroom', label: 'Classroom' },
      { value: 'Hybrid', label: 'Hybrid' },
      { value: 'Self Paced', label: 'Self Paced' },
    ],
  },
  { name: 'language', label: 'Language', type: 'text' },
  { name: 'fee_text', label: 'Fee text', type: 'text', help: 'Shown publicly, e.g. "Fee on enquiry". Leave the numeric fields blank to keep fees private.' },
  { name: 'certification', label: 'Certification awarded', type: 'text' },
];

const CONTENT_FIELDS = [
  { name: 'overview', label: 'Overview', type: 'richtext', full: true },
  { name: 'who_should_attend', label: 'Who it is for', type: 'textarea', rows: 3, full: true },
  { name: 'eligibility', label: 'Entry requirements', type: 'textarea', rows: 3, full: true },
  {
    name: 'career_opportunities',
    label: 'Career opportunities',
    type: 'textarea',
    rows: 3,
    full: true,
    help: 'Comma separated — each role is shown as its own tag.',
  },
];

const MEDIA_FIELDS = [
  { name: 'thumbnail', label: 'Card image', type: 'image', folder: 'courses', help: 'Shown on course cards. Landscape works best.' },
  { name: 'banner_image', label: 'Banner image', type: 'image', folder: 'courses', help: 'Wide image behind the course page heading.' },
];

const VISIBILITY_FIELDS = [
  { name: 'is_active', label: 'Published', type: 'boolean', help: 'Unpublished courses disappear from the site but keep their data.' },
  { name: 'is_featured', label: 'Featured', type: 'boolean', help: 'Highlighted with a badge and promoted on the homepage.' },
  { name: 'is_popular', label: 'Popular', type: 'boolean', help: 'Included in the "most enquired" homepage section.' },
  { name: 'display_order', label: 'Display order', type: 'number' },
];

const SOCIAL_PROOF_FIELDS = [
  { name: 'rating', label: 'Rating (0–5)', type: 'number', step: 0.1, min: 0, max: 5 },
  { name: 'reviews_count', label: 'Number of reviews', type: 'number' },
  { name: 'students_enrolled', label: 'Learners trained', type: 'number' },
];

const SEO_FIELDS = [
  { name: 'meta_title', label: 'Meta title', type: 'text' },
  { name: 'meta_description', label: 'Meta description', type: 'textarea', rows: 3 },
  { name: 'meta_keywords', label: 'Meta keywords', type: 'text', full: true },
];

const SECTIONS = [
  { id: 'basics', label: 'Basics', fields: BASIC_FIELDS },
  { id: 'details', label: 'Course details', fields: DETAIL_FIELDS },
  { id: 'content', label: 'Description', fields: CONTENT_FIELDS },
  { id: 'media', label: 'Images', fields: MEDIA_FIELDS },
  { id: 'proof', label: 'Ratings & numbers', fields: SOCIAL_PROOF_FIELDS },
  { id: 'visibility', label: 'Visibility', fields: VISIBILITY_FIELDS },
  { id: 'seo', label: 'SEO', fields: SEO_FIELDS },
];

const DEFAULTS = {
  title: '', slug: '', code: '', short_description: '', overview: '',
  who_should_attend: '', eligibility: '', career_opportunities: '', certification: '',
  thumbnail: '', banner_image: '', duration: '', duration_weeks: '', lessons_count: '',
  level: 'All Levels', delivery_mode: 'Online', language: 'English', fee_text: '',
  rating: 4.8, reviews_count: 0, students_enrolled: 0,
  is_featured: false, is_popular: false, is_active: true, display_order: 0,
  meta_title: '', meta_description: '', meta_keywords: '',
};

export default function CourseEditor({ course = null }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(course?.id);

  const [values, setValues] = useState(() => {
    if (!course) return { ...DEFAULTS };
    const seed = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS)) {
      if (course[key] !== undefined && course[key] !== null) {
        seed[key] = ['is_featured', 'is_popular', 'is_active'].includes(key)
          ? Number(course[key]) === 1
          : course[key];
      }
    }
    return seed;
  });

  const [outcomes, setOutcomes] = useState(() => course?.outcomes?.map((o) => ({ outcome: o.outcome })) || []);
  const [highlights, setHighlights] = useState(
    () => course?.highlights?.map((h) => ({ icon: h.icon || '', title: h.title, description: h.description || '' })) || []
  );
  const [syllabus, setSyllabus] = useState(
    () =>
      course?.syllabus?.map((m) => ({
        module_title: m.module_title,
        description: m.description || '',
        topics: m.topics || '',
        duration: m.duration || '',
      })) || []
  );
  const [faqs, setFaqs] = useState(
    () => course?.faqs?.map((f) => ({ question: f.question, answer: f.answer })) || []
  );

  const [activeSection, setActiveSection] = useState('basics');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function markDirty(setter) {
    return (next) => {
      setter(next);
      setDirty(true);
    };
  }

  async function submit(event, { close = false } = {}) {
    event?.preventDefault();
    if (saving) return;

    setSaving(true);
    setErrors({});
    setFormError('');

    const payload = { ...values, outcomes, highlights, syllabus, faqs };

    try {
      const res = await fetch(isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          // Jump to the first section that has a problem so the error is visible.
          const firstKey = Object.keys(data.errors)[0];
          const section = SECTIONS.find((s) => s.fields.some((f) => f.name === firstKey));
          if (section) setActiveSection(section.id);
          toast.error(`${Object.keys(data.errors).length} field(s) need attention.`);
        } else {
          setFormError(data.error || 'Could not save the course.');
          toast.error(data.error || 'Could not save the course.');
        }
        return;
      }

      setDirty(false);
      toast.success(isEdit ? 'Course saved.' : 'Course created.');

      if (close || !isEdit) {
        router.push('/admin/courses');
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setFormError('Could not reach the server.');
      toast.error('Network error — nothing was saved.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${course.title}"? Its outcomes, curriculum and FAQs go with it. This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not delete the course.');
        setDeleting(false);
        return;
      }
      toast.success('Course deleted.');
      router.push('/admin/courses');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
      setDeleting(false);
    }
  }

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const sectionHasError = (section) => section.fields.some((f) => errors[f.name]);

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* --------------------------- sticky header -------------------------- */}
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-ink-100/95 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/courses"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900"
            aria-label="Back to courses"
          >
            <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
          </Link>
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-bold text-ink-950">
              {isEdit ? values.title || 'Edit course' : 'New course'}
            </h2>
            <p className="text-xs text-ink-500">
              {dirty ? <span className="text-accent-700">Unsaved changes</span> : isEdit ? 'All changes saved' : 'Not yet created'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEdit && course.slug && (
            <a
              href={`/courses/${course.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.3} />
              View
            </a>
          )}
          {isEdit && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting || saving}
              className="btn btn-sm border border-ink-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />}
              Delete
            </button>
          )}
          <button type="button" onClick={(e) => submit(e, { close: true })} disabled={saving} className="btn btn-outline btn-sm">
            Save &amp; close
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" strokeWidth={2.2} />
          <p className="text-sm text-rose-800">{formError}</p>
        </div>
      )}

      {/* ---------------------------- section tabs -------------------------- */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            aria-current={activeSection === section.id ? 'true' : undefined}
            className={cx(
              'shrink-0 rounded-full border px-4 py-2 font-display text-[0.8125rem] font-semibold transition-all',
              activeSection === section.id
                ? 'border-transparent bg-ink-950 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300',
              sectionHasError(section) && activeSection !== section.id && 'border-rose-300 text-rose-700'
            )}
          >
            {section.label}
            {sectionHasError(section) && <span className="ml-1.5 text-rose-500">•</span>}
          </button>
        ))}
      </div>

      {/* --------------------------- active section ------------------------- */}
      <section className="rounded-2xl border border-ink-200 bg-white p-5 md:p-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">
          {currentSection.label}
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {currentSection.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={values[field.name]}
              allValues={values}
              options={[]}
              error={errors[field.name]}
              onChange={(value) => setValue(field.name, value)}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------ repeaters --------------------------- */}
      <Repeater
        label="Learning outcomes"
        description="What a learner will be able to do by the end. Shown as a ticked list on the course page."
        items={outcomes}
        onChange={markDirty(setOutcomes)}
        addLabel="Add outcome"
        emptyHint="No outcomes yet. These are the single most persuasive part of a course page."
        titleKey="outcome"
        fields={[{ name: 'outcome', label: 'Outcome', type: 'textarea', rows: 2, full: true }]}
      />

      <Repeater
        label="Curriculum modules"
        description="The syllabus, shown as an expandable list. Put one topic per line in the topics box."
        items={syllabus}
        onChange={markDirty(setSyllabus)}
        addLabel="Add module"
        emptyHint="No modules yet."
        titleKey="module_title"
        fields={[
          { name: 'module_title', label: 'Module title', type: 'text' },
          { name: 'duration', label: 'Module duration', type: 'text', placeholder: 'e.g. 3 weeks' },
          { name: 'description', label: 'Module summary', type: 'textarea', rows: 2, full: true },
          {
            name: 'topics',
            label: 'Topics covered',
            type: 'textarea',
            rows: 5,
            full: true,
            help: 'One topic per line.',
          },
        ]}
      />

      <Repeater
        label="Key highlights"
        description="Short selling points with an icon, shown in a grid under the overview."
        items={highlights}
        onChange={markDirty(setHighlights)}
        addLabel="Add highlight"
        emptyHint="No highlights yet."
        titleKey="title"
        fields={[
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'icon', label: 'Icon', type: 'icon' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 2, full: true },
        ]}
      />

      <Repeater
        label="Course FAQs"
        description="Questions specific to this course. If left empty, the site shows the general FAQs instead."
        items={faqs}
        onChange={markDirty(setFaqs)}
        addLabel="Add question"
        emptyHint="No course-specific questions yet."
        titleKey="question"
        fields={[
          { name: 'question', label: 'Question', type: 'textarea', rows: 2, full: true },
          { name: 'answer', label: 'Answer', type: 'textarea', rows: 4, full: true },
        ]}
      />

      <div className="flex flex-wrap items-center justify-end gap-2.5 pb-4">
        <Link href="/admin/courses" className="btn btn-outline">
          Cancel
        </Link>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
          {isEdit ? 'Save changes' : 'Create course'}
        </button>
      </div>
    </form>
  );
}
