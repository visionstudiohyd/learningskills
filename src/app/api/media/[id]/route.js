import { getMediaBlob } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * GET /api/media/<id> — serves an image stored in MySQL.
 *
 * Only used when MEDIA_DRIVER=db, which is the Vercel-friendly mode: the
 * filesystem there is read-only, so uploads live in the `media.file_data`
 * LONGBLOB and are streamed from here instead of from /public.
 *
 * Public on purpose — these are site images. They are immutable once uploaded
 * (a replacement gets a new row and a new id), so they can be cached hard.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return new Response('Not found', { status: 404 });
  }

  let row;
  try {
    row = await getMediaBlob(numericId);
  } catch {
    return new Response('Image temporarily unavailable', { status: 503 });
  }

  if (!row || !row.file_data) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(row.file_data, {
    status: 200,
    headers: {
      'Content-Type': row.mime_type || 'application/octet-stream',
      'Content-Length': String(row.file_data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${encodeURIComponent(row.filename || `image-${numericId}`)}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
