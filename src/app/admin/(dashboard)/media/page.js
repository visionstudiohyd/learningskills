import { listFolders, listMedia, maxUploadBytes } from '@/lib/storage';
import { plain } from '@/lib/utils';
import MediaBrowser from '@/components/admin/MediaBrowser';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Media Library' };

export default async function MediaPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const [result, folders] = await Promise.all([
    listMedia({
      page: sp.page,
      perPage: 36,
      folder: typeof sp.folder === 'string' ? sp.folder : null,
      search: typeof sp.search === 'string' ? sp.search : null,
    }).catch(() => ({ items: [], total: 0, page: 1, perPage: 36, totalPages: 1 })),
    listFolders().catch(() => []),
  ]);

  return (
    <MediaBrowser
      initialItems={plain(result.items)}
      total={result.total}
      folders={plain(folders)}
      maxSizeMb={Math.round(maxUploadBytes() / 1024 / 1024)}
    />
  );
}
