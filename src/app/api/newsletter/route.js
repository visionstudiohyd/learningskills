import { guard, handleError, ok } from '@/lib/api';
import { newsletterSchema } from '@/lib/validation';
import { subscribeNewsletter } from '@/lib/queries/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/newsletter — footer subscription.
 *
 * Re-subscribing an existing address is treated as success rather than a
 * duplicate error (the INSERT ... ON DUPLICATE KEY reactivates the row), so a
 * visitor who already signed up is never told they did something wrong.
 */
export async function POST(request) {
  try {
    const { error, data, meta } = await guard(request, newsletterSchema, { key: 'newsletter', limit: 5 });
    if (error) return error;

    await subscribeNewsletter({ email: data.email, name: data.name, ip: meta.ip });

    return ok({ message: 'You are on the list — look out for next month’s batch dates.' }, 201);
  } catch (error) {
    return handleError(error, 'newsletter');
  }
}
