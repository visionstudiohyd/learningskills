'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  Check, Copy, ImagePlus, Info, Link2, Loader2, Trash2, Upload,
} from 'lucide-react';
import { cx, formatDate } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import { useToast } from '@/components/ui/Toast';

/**
 * Full-page media library.
 *
 * Upload, browse, copy and delete the images used across the site.
 */
export default function MediaBrowser({ initialItems = [], total = 0, folders = [], maxSizeMb = 5 }) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef(null);

  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [folder, setFolder] = useState('general');

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const form = new FormData();
      files.slice(0, 12).forEach((file) => form.append('file', file));
      form.append('folder', folder);

      const res = await fetch('/api/admin/media', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Upload failed.');
        return;
      }

      toast.success(data.message || 'Uploaded.');
      setItems((prev) => [...(data.items || []), ...prev]);
      router.refresh();
    } catch {
      toast.error('Upload failed — could not reach the server.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function addRemote() {
    if (!remoteUrl.trim()) return;
    setUploading(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: remoteUrl.trim(), folder }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'That URL could not be added.');
        return;
      }
      toast.success('Image linked.');
      setRemoteUrl('');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setUploading(false);
    }
  }

  async function remove(item) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${item.original_name}"? Anywhere it is used will fall back to a placeholder.`)) return;
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not delete.');
        return;
      }
      toast.success('Deleted.');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    }
  }

  async function copyUrl(item) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Clipboard access was blocked by the browser.');
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">Media library</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Every image used across the site. Upload here, or pick from this library wherever an image field appears.
          </p>
        </div>
      </header>

      {/* upload guidance */}
      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" strokeWidth={2.2} />
        <p className="text-sm leading-relaxed text-ink-700">
          JPG, PNG, WebP, GIF, AVIF and SVG are supported, up to {maxSizeMb} MB per file. Anything you
          upload stays in this library, so the same image can be reused anywhere on the site.
        </p>
      </div>

      {/* upload row */}
      <div className="rounded-2xl border border-ink-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="media-folder" className="text-xs font-medium text-ink-500">
            Folder
          </label>
          <input
            id="media-folder"
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            list="media-folders"
            className="field !py-2 w-36 text-sm"
          />
          <datalist id="media-folders">
            {folders.map((f) => (
              <option key={f.folder} value={f.folder} />
            ))}
          </datalist>

          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn btn-primary btn-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" strokeWidth={2.4} />}
            Upload images
          </button>

          <span className="mx-1 hidden h-6 w-px bg-ink-200 sm:block" aria-hidden="true" />

          <div className="flex min-w-[16rem] flex-1 items-center gap-2">
            <input
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="…or paste an image URL"
              aria-label="Remote image URL"
              className="field !py-2 flex-1 text-sm"
            />
            <button type="button" onClick={addRemote} disabled={uploading || !remoteUrl.trim()} className="btn btn-outline btn-sm shrink-0">
              <Link2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              Link
            </button>
          </div>

          <p className="ml-auto pr-1 text-sm text-ink-500">
            <span className="font-display font-bold text-ink-950">{total}</span> files
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {/* grid / dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cx(
          'rounded-2xl border-2 border-dashed p-4 transition-colors',
          dragging ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white'
        )}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">
              <ImagePlus className="h-8 w-8" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-ink-900">No images yet</h3>
            <p className="mt-2 max-w-sm text-sm text-ink-500">
              Drag files anywhere in this panel, press Upload, or paste a URL from an image host.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => (
              <li key={item.id} className="group overflow-hidden rounded-xl border border-ink-200 bg-white">
                <span className="relative block aspect-4/3 bg-ink-100">
                  <SmartImage src={item.url} alt={item.alt_text || item.original_name} fill sizes="240px" />

                  <span className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-linear-to-t from-ink-950/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => copyUrl(item)}
                      aria-label={`Copy URL for ${item.original_name}`}
                      title="Copy URL"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-ink-700 transition-colors hover:bg-brand-500 hover:text-white"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-teal-600" strokeWidth={3} />
                      ) : (
                        <Copy className="h-3.5 w-3.5" strokeWidth={2.3} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.original_name}`}
                      title="Delete"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-ink-700 transition-colors hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.3} />
                    </button>
                  </span>
                </span>

                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-ink-800" title={item.original_name}>
                    {item.original_name}
                  </p>
                  <p className="mt-0.5 truncate text-[0.6875rem] text-ink-400">
                    {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                    {item.file_size ? `${Math.max(Math.round(item.file_size / 1024), 1)} KB` : '—'}
                  </p>
                  <p className="text-[0.6875rem] text-ink-400">{formatDate(item.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
