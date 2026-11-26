import { notFound, redirect } from 'next/navigation';
import { can, getCurrentAdmin } from '@/lib/auth';
import { getResource } from '@/lib/admin/resources';
import { getResourceRow } from '@/lib/admin/crud';
import { query } from '@/lib/db';
import { plain } from '@/lib/utils';
import ResourceForm from './ResourceForm';

/**
 * Server half of every create/edit screen.
 *
 * Resolves the record (or an empty one for "new") plus the option lists any
 * relation fields need, then renders the generic form.
 */
export default async function ResourceEditPage({ resourceKey, id = null }) {
  const resource = getResource(resourceKey);
  if (!resource) notFound();

  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  if (!can(admin.role, resource.permission)) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-display text-base font-bold text-amber-900">Not available to your role</h2>
        <p className="mt-2 text-sm text-amber-800">You do not have permission to edit {resource.label.toLowerCase()}.</p>
      </div>
    );
  }

  const isNew = id === null || id === 'new';
  let item = null;

  if (!isNew) {
    item = await getResourceRow(resource, id);
    if (!item) notFound();
  }

  /* Option lists for relation fields. The table and columns come from the
     registry, never from the request. */
  const relationOptions = {};
  for (const field of resource.fields) {
    if (field.type !== 'relation' || !field.relation) continue;
    const { table, valueColumn, labelColumn } = field.relation;
    // eslint-disable-next-line no-await-in-loop
    const rows = await query(
      `SELECT \`${valueColumn}\` AS value, \`${labelColumn}\` AS label FROM \`${table}\` ORDER BY \`${labelColumn}\` ASC`
    ).catch(() => []);
    relationOptions[field.name] = rows.map((r) => ({ value: r.value, label: r.label }));
  }

  return (
    <ResourceForm
      resource={{
        key: resource.key,
        label: resource.label,
        singular: resource.singular,
        fields: resource.fields,
        slug: resource.slug || null,
      }}
      item={item ? plain(item) : null}
      relationOptions={relationOptions}
      backHref={`/admin/${resource.key}`}
      viewUrl={item && resource.viewUrl ? resource.viewUrl(item) : null}
    />
  );
}
