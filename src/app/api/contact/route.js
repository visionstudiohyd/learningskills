import { guard, handleError, ok } from '@/lib/api';
import { contactSchema } from '@/lib/validation';
import { createContactMessage } from '@/lib/queries/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/contact — general contact-form message. */
export async function POST(request) {
  try {
    const { error, data, meta } = await guard(request, contactSchema, { key: 'contact', limit: 6 });
    if (error) return error;

    if (data.company) {
      return ok({ message: 'Message received.' });
    }

    const id = await createContactMessage(data, meta);

    return ok(
      {
        id,
        message: 'Thank you — your message has reached our team and we will reply shortly.',
      },
      201
    );
  } catch (error) {
    return handleError(error, 'contact');
  }
}
