import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { insert, query, queryOne, execute } from './db';

/**
 * Media storage — deliberately driver-based, because the local and live
 * environments have incompatible filesystems:
 *
 *   MEDIA_DRIVER=local  writes to /public/uploads and stores a /uploads/... URL.
 *                       Right for XAMPP and for Node hosting on cPanel.
 *
 *   MEDIA_DRIVER=db     stores the bytes in the `media.file_data` LONGBLOB and
 *                       serves them from /api/media/<id>. Vercel's filesystem is
 *                       read-only, so this is the driver to use there — and it
 *                       needs no third-party storage account.
 *
 * Either way the rest of the app only ever sees a URL string, so switching
 * drivers never requires touching a component or a database column.
 */

const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function getDriver() {
  const driver = (process.env.MEDIA_DRIVER || 'local').toLowerCase();
  return driver === 'db' ? 'db' : 'local';
}

export function maxUploadBytes() {
  return Number(process.env.MEDIA_MAX_SIZE_MB || 5) * 1024 * 1024;
}

export function allowedExtensions() {
  return Object.values(ALLOWED_MIME);
}

function safeFolder(folder) {
  const clean = String(folder || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  return clean || 'general';
}

function buildFilename(originalName, mime) {
  const ext = ALLOWED_MIME[mime] || path.extname(originalName).replace('.', '').toLowerCase() || 'bin';
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'image';
  return `${base}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}.${ext}`;
}

/** Read PNG/JPEG/GIF/WebP dimensions from the header bytes (no image library). */
function readDimensions(buffer, mime) {
  try {
    if (mime === 'image/png' && buffer.length > 24) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (mime === 'image/gif' && buffer.length > 10) {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }
    if (mime === 'image/jpeg') {
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        const size = buffer.readUInt16BE(offset + 2);
        // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        offset += 2 + size;
      }
    }
    if (mime === 'image/webp' && buffer.length > 30 && buffer.toString('ascii', 12, 16) === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
  } catch {
    /* dimensions are nice-to-have, never required */
  }
  return { width: null, height: null };
}

export function validateUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'No file was received.' };
  }
  if (!ALLOWED_MIME[file.type]) {
    return { ok: false, error: `Unsupported file type. Allowed: ${allowedExtensions().join(', ')}.` };
  }
  const limit = maxUploadBytes();
  if (file.size > limit) {
    return { ok: false, error: `File is too large. Maximum size is ${Math.round(limit / 1024 / 1024)} MB.` };
  }
  if (file.size === 0) {
    return { ok: false, error: 'The file is empty.' };
  }
  return { ok: true };
}

/**
 * Persist an uploaded File (from a multipart FormData) and record it in `media`.
 * Returns the media row including the public `url`.
 */
export async function saveUpload(file, { folder = 'general', altText = null, userId = null } = {}) {
  const check = validateUpload(file);
  if (!check.ok) throw Object.assign(new Error(check.error), { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = buildFilename(file.name || 'image', file.type);
  const dir = safeFolder(folder);
  const { width, height } = readDimensions(buffer, file.type);
  const driver = getDriver();

  let url;
  let fileData = null;

  if (driver === 'local') {
    const target = path.join(UPLOAD_DIR, dir);
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, filename), buffer);
    url = `/uploads/${dir}/${filename}`;
  } else {
    fileData = buffer;
    url = ''; // filled in below once we know the row id
  }

  const id = await insert(
    `INSERT INTO media (filename, original_name, mime_type, file_size, width, height, storage_driver, url, file_data, alt_text, folder, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      filename,
      String(file.name || filename).slice(0, 255),
      file.type,
      buffer.length,
      width,
      height,
      driver,
      url,
      fileData,
      altText,
      dir,
      userId,
    ]
  );

  if (driver === 'db') {
    url = `/api/media/${id}`;
    await execute('UPDATE media SET url = ? WHERE id = ?', [url, id]);
  }

  return {
    id,
    url,
    filename,
    originalName: file.name,
    mimeType: file.type,
    fileSize: buffer.length,
    width,
    height,
    folder: dir,
    storageDriver: driver,
  };
}

/** Register an external image URL in the library without uploading bytes. */
export async function registerRemote(url, { folder = 'general', altText = null, userId = null } = {}) {
  const clean = String(url || '').trim();
  if (!/^https?:\/\//i.test(clean)) {
    throw Object.assign(new Error('Enter a full image URL starting with http:// or https://'), { status: 400 });
  }
  const filename = clean.split('/').pop()?.split('?')[0]?.slice(0, 255) || 'remote-image';
  const id = await insert(
    `INSERT INTO media (filename, original_name, mime_type, file_size, storage_driver, url, alt_text, folder, uploaded_by)
     VALUES (?, ?, ?, 0, 'remote', ?, ?, ?, ?)`,
    [filename, filename, 'image/*', clean.slice(0, 600), altText, safeFolder(folder), userId]
  );
  return { id, url: clean, filename, storageDriver: 'remote' };
}

/** Paginated library listing for the admin media picker. */
export async function listMedia({ page = 1, perPage = 30, folder = null, search = null } = {}) {
  const limit = Math.min(Math.max(Number(perPage) || 30, 1), 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  const where = [];
  const params = [];
  if (folder) {
    where.push('folder = ?');
    params.push(safeFolder(folder));
  }
  if (search) {
    where.push('(original_name LIKE ? OR alt_text LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `SELECT id, filename, original_name, mime_type, file_size, width, height, storage_driver, url, alt_text, folder, created_at
       FROM media ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  const total = await queryOne(`SELECT COUNT(*) AS total FROM media ${whereSql}`, params);

  return {
    items: rows,
    total: Number(total?.total || 0),
    page: Math.max(Number(page) || 1, 1),
    perPage: limit,
    totalPages: Math.max(Math.ceil(Number(total?.total || 0) / limit), 1),
  };
}

/** Stream payload for /api/media/[id] when the db driver is in use. */
export async function getMediaBlob(id) {
  return queryOne('SELECT mime_type, file_data, filename FROM media WHERE id = ? LIMIT 1', [Number(id)]);
}

/** Delete a media row, and its file on disk for the local driver. */
export async function deleteMedia(id) {
  const row = await queryOne('SELECT id, url, storage_driver, folder, filename FROM media WHERE id = ? LIMIT 1', [
    Number(id),
  ]);
  if (!row) return false;

  if (row.storage_driver === 'local' && row.url?.startsWith('/uploads/')) {
    try {
      await unlink(path.join(process.cwd(), 'public', row.url.replace(/^\//, '')));
    } catch {
      /* file already gone — removing the DB row is what matters */
    }
  }

  await execute('DELETE FROM media WHERE id = ?', [Number(id)]);
  return true;
}

export async function listFolders() {
  const rows = await query('SELECT folder, COUNT(*) AS total FROM media GROUP BY folder ORDER BY folder');
  return rows.map((r) => ({ folder: r.folder, total: Number(r.total) }));
}
