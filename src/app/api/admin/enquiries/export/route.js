import { handleError } from '@/lib/api';
import { logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { getEnquiries } from '@/lib/queries/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLUMNS = [
  ['reference', 'Reference'],
  ['created_at', 'Received'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['city', 'City'],
  ['courses', 'Courses'],
  ['preferred_mode', 'Preferred format'],
  ['status', 'Status'],
  ['priority', 'Priority'],
  ['assignee_name', 'Assigned to'],
  ['source_page', 'Submitted from'],
];

/**
 * Escape a value for CSV.
 *
 * Also neutralises formula injection: a cell beginning =, +, - or @ is treated
 * as a formula by Excel and Sheets, so a lead who typed `=HYPERLINK(...)` into
 * the message box could otherwise run code on the staff member's machine when
 * they open the export. Prefixing a tab keeps the text readable but inert.
 */
function csvCell(value) {
  if (value === null || value === undefined) return '""';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `\t${text}`;
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

/** GET /api/admin/enquiries/export?status=…&search=… — CSV of the current filter. */
export async function GET(request) {
  try {
    const admin = await requireAdmin('enquiries');
    const sp = request.nextUrl.searchParams;

    const { items } = await getEnquiries({
      search: sp.get('search') || '',
      status: sp.get('status') || '',
      priority: sp.get('priority') || '',
      unreadOnly: sp.get('unread') === '1',
      from: sp.get('from') || '',
      to: sp.get('to') || '',
      page: 1,
      perPage: 100,
    });

    const header = COLUMNS.map(([, label]) => csvCell(label)).join(',');
    const rows = items.map((item) => COLUMNS.map(([key]) => csvCell(item[key])).join(','));
    // BOM so Excel opens UTF-8 names correctly.
    const csv = `﻿${[header, ...rows].join('\r\n')}`;

    await logActivity({
      admin,
      action: 'export',
      entityType: 'enquiries',
      description: `Exported ${items.length} enquiries to CSV`,
      ip: getClientIp(request.headers),
    });

    const stamp = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="enquiries-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return handleError(error, 'enquiries/export');
  }
}
