import { guard, handleError, invalid, ok } from '@/lib/api';
import { enquirySchema } from '@/lib/validation';
import { createEnquiry } from '@/lib/queries/leads';
import { getSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/enquiries — public course enquiry submission.
 *
 * The body is re-validated here with the same Zod schema the form uses, because
 * client-side validation is a convenience for the visitor, not a security
 * control. Course titles are snapshotted into enquiry_courses at write time so
 * a later rename or deletion never rewrites the historical lead.
 */
export async function POST(request) {
  try {
    const { error, data, meta } = await guard(request, enquirySchema, { key: 'enquiry', limit: 6 });
    if (error) return error;

    // Honeypot: a filled hidden field means a bot. Answer 200 so it learns
    // nothing from the response, but store nothing.
    if (data.company) {
      return ok({ reference: null, message: 'Enquiry received.' });
    }

    const settings = await getSettings();

    // "City required" is an admin toggle rather than a schema rule, so it is
    // enforced here instead of inside the shared Zod schema.
    if (settings.enquiry_require_city === '1' && !data.city) {
      return invalid({ city: 'Please tell us which city you are in.' });
    }

    const result = await createEnquiry(data, meta);

    return ok(
      {
        reference: result.reference,
        courseCount: result.courseCount,
        title: settings.enquiry_success_title,
        message: settings.enquiry_success_text,
      },
      201
    );
  } catch (error) {
    return handleError(error, 'enquiries');
  }
}
