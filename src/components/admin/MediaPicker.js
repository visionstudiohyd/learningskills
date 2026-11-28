'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check, ImagePlus, Link2, Loader2, Search, Trash2, Upload, X,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import { useToast } from '@/components/ui/Toast';

/**
 * Media library modal — browse, upload, link a remote URL, pick or delete.
 *
 * Opened by <ImageField>. Uploads go through /api/admin/media, which writes via
 * whichever storage driver is configured, so the same UI works on XAMPP (files
 * on disk) and on Vercel (bytes in MySQL).
 */
export default function MediaPicker({ open, onClose, onSelect, folder = 'general', currentValue = '' }) {
  const toast = useToast();
  const inputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [driver, setDriver] = useState('local');
  const [dragging, setDragging] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [showRemote, setShowRemote] = useState(false);

  const load = useCallback(
    async (nextPage = 1, term = '') => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page: String(nextPage), perPage: '24' });
        if (term) qs.set('search', term);
        const res = await fetch(`/api/admin/media?${qs}`);
        const data = await res.json();
        if (res.ok) {
          setItems(data.items || []);
          setTotalPages(data.totalPages || 1);
          setPage(data.page || 1);
          setDriver(data.driver || 'local');
        } else {
          toast.error(data.error || 'Could not load the media library.');
        }
      } catch {
        toast.error('Could not reach the server.');
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (open) load(1, '');
  }, [open, load]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
      // Select immediately when a single file was uploaded — that is almost
      // always what the admin wanted next.
      if (data.items?.length === 1) {
        onSelect(data.items[0].url);
        onClose();
        return;
      }
      load(1, search);
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
      onSelect(data.item.url);
      onClose();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this image from the library? Anywhere it is used will fall back to a placeholder.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not delete that image.');
        return;
      }
      toast.success('Image deleted.');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('Could not reach the server.');
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media library"
        className="relative flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[80dvh] sm:rounded-2xl"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 border-b border-ink-200 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink-950">Media library</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Pick an image, or upload a new one
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media library"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-5 py-3">
          <div className="relative min-w-[12rem] flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              strokeWidth={2.2}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  load(1, search);
                }
              }}
              placeholder="Search by file name…"
              aria-label="Search media"
              className="field !py-2 pl-10 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary btn-sm"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" strokeWidth={2.4} />}
            Upload
          </button>

          <button type="button" onClick={() => setShowRemote((v) => !v)} className="btn btn-outline btn-sm">
            <Link2 className="h-4 w-4" strokeWidth={2.4} />
            From URL
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>

        {showRemote && (
          <div className="flex flex-wrap items-center gap-2.5 border-b border-ink-200 bg-brand-50/60 px-5 py-3">
            <input
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-…"
              aria-label="Remote image URL"
              className="field !py-2 min-w-[14rem] flex-1 text-sm"
            />
            <button type="button" onClick={addRemote} disabled={uploading} className="btn btn-primary btn-sm">
              Add image
            </button>
          </div>
        )}

        {/* grid */}
        <div
          className={cx(
            'flex-1 overflow-y-auto p-5 transition-colors',
            dragging && 'bg-brand-50 ring-2 ring-inset ring-brand-400'
          )}
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
        >
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-ink-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading library…
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                <ImagePlus className="h-8 w-8" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">The library is empty</h3>
              <p className="mt-2 max-w-sm text-sm text-ink-500">
                Drag images here, press Upload, or paste a URL from an image host.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => {
                const selected = currentValue === item.url;
                return (
                  <li key={item.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className={cx(
                        'relative block w-full overflow-hidden rounded-xl border-2 bg-ink-100 transition-all',
                        selected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-transparent hover:border-brand-300'
                      )}
                    >
                      <span className="relative block aspect-4/3">
                        <SmartImage src={item.url} alt={item.alt_text || item.original_name} fill sizes="200px" />
                      </span>
                      {selected && (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>

                    <p className="mt-1.5 truncate text-[0.6875rem] text-ink-500" title={item.original_name}>
                      {item.original_name}
                    </p>

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Delete ${item.original_name}`}
                      className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-ink-600 opacity-0 shadow-sm transition-all hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* footer / pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-5 py-3">
            <button
              type="button"
              onClick={() => load(page - 1, search)}
              disabled={page <= 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            <span className="text-xs text-ink-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => load(page + 1, search)}
              disabled={page >= totalPages}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
