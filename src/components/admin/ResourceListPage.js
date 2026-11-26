import { notFound, redirect } from 'next/navigation';
import { can, getCurrentAdmin } from '@/lib/auth';
import { getResource } from '@/lib/admin/resources';
import { listResource } from '@/lib/admin/crud';
import { plain } from '@/lib/utils';
import ResourceTable from './ResourceTable';

/**
 * Server half of every resource list screen.
 *
 * Reads the registry, runs the query, hands plain rows to the client table.
 * Each concrete page file is then a three-line wrapper around this.
 */
export default async function ResourceListPage({ resourceKey, searchParams, canCreate = true }) {
  const resource = getResource(resourceKey);
  if (!resource) notFound();

  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  if (!can(admin.role, resource.permission)) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-display text-base font-bold text-amber-900">Not available to your role</h2>
        <p className="mt-2 text-sm text-amber-800">
          Your account has the {admin.role.replace('_', ' ')} role, which does not include access to{' '}
          {resource.label.toLowerCase()}.
        </p>
      </div>
    );
  }

  const sp = (await searchParams) || {};
  const search = typeof sp.search === 'string' ? sp.search : '';

  const result = await listResource(resource, {
    page: sp.page,
    perPage: 20,
    search,
  });

  const basePath = `/admin/${resource.key}`;

  return (
    <ResourceTable
      resource={{
        key: resource.key,
        label: resource.label,
        singular: resource.singular,
        description: resource.description,
        listColumns: resource.listColumns,
        reorderable: Boolean(resource.reorderable),
        customEditor: resource.customEditor || null,
        // `viewUrl` is a function in the registry and cannot cross to the
        // client, so each row's public URL is resolved here instead.
        viewUrl: null,
      }}
      rows={plain(
        result.items.map((row) => ({
          ...row,
          __viewUrl: resource.viewUrl ? resource.viewUrl(row) : null,
        }))
      )}
      pagination={{
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasPrev: result.hasPrev,
        hasNext: result.hasNext,
      }}
      basePath={basePath}
      search={search}
      canCreate={canCreate}
    />
  );
}
