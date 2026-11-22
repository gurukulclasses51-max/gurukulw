import fs from 'fs';
import os from 'os';
import path from 'path';
import { createDefaultCms, DEFAULT_ADMIN_ACCOUNT, ORIGINAL_IMAGES } from '../data/cmsDefaults.ts';
import type {
  AdminAccount,
  AdminActivityItem,
  AdmissionRecord,
  CmsBundle,
  EnquiryRecord,
  PaymentSubmission,
} from '../types/cms.ts';

export interface StoreData {
  enquiries: EnquiryRecord[];
  admissions: AdmissionRecord[];
  payments: PaymentSubmission[];
}

export interface CmsPersisted extends CmsBundle {
  adminActivity: AdminActivityItem[];
  adminAccount: AdminAccount;
}

export interface UploadedBinary {
  buffer: Buffer;
  contentType: string;
}

export interface MediaAssetItem {
  id: string;
  filename: string;
  label: string;
  file_url: string;
  contentType: string;
  size: number;
  source: 'builtin' | 'upload' | 'blob';
  created_at?: string;
}

const KEY_CMS = 'gsk:cms:v1';
const KEY_SUBMISSIONS = 'gsk:submissions:v1';
const KEY_UPLOAD_PREFIX = 'gsk:upload:v1:';
const KEY_UPLOAD_INDEX = 'gsk:uploads:index:v1';

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);

function resolveDataDir(): string {
  if (isVercel) {
    return path.join(os.tmpdir(), 'gurukul-data');
  }
  return path.resolve(process.cwd(), 'data');
}

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (url && token) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

export function getStorageStatus() {
  const redisConfigured = Boolean(getRedisConfig());
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const mode: 'redis' | 'tmp' | 'disk' = redisConfigured
    ? 'redis'
    : isVercel
      ? 'tmp'
      : 'disk';
  return {
    mode,
    redisConfigured,
    blobConfigured,
    runtime: isVercel ? 'vercel' : 'node',
  };
}

export function getStorageMode(): 'redis' | 'tmp' | 'disk' {
  return getStorageStatus().mode;
}

async function redisCommand<T = unknown>(args: string[]): Promise<T | null> {
  const cfg = getRedisConfig();
  if (!cfg) return null;
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Redis storage error (${res.status}): ${txt}`);
  }
  const data = (await res.json()) as { result?: T };
  return data.result ?? null;
}

function ensureLocalDirs(): { dataDir: string; uploadsDir: string } {
  const dataDir = resolveDataDir();
  const uploadsDir = path.join(dataDir, 'uploads');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  return { dataDir, uploadsDir };
}

export function createInitialPersistedCms(): CmsPersisted {
  const base = createDefaultCms();
  return {
    ...base,
    adminActivity: [],
    adminAccount: { ...DEFAULT_ADMIN_ACCOUNT },
  };
}

function hydrateCms(parsed: Partial<CmsPersisted> | null): CmsPersisted {
  const defaults = createInitialPersistedCms();
  if (!parsed) return defaults;
  return {
    siteSettings: { ...defaults.siteSettings, ...(parsed.siteSettings || {}) },
    navigationItems: Array.isArray(parsed.navigationItems)
      ? parsed.navigationItems
      : defaults.navigationItems,
    homepageSections: Array.isArray(parsed.homepageSections)
      ? parsed.homepageSections
      : defaults.homepageSections,
    banners: Array.isArray(parsed.banners) ? parsed.banners : defaults.banners,
    popupSetting: { ...defaults.popupSetting, ...(parsed.popupSetting || {}) },
    pageSeo: Array.isArray(parsed.pageSeo) ? parsed.pageSeo : defaults.pageSeo,
    courses: Array.isArray(parsed.courses) ? parsed.courses : defaults.courses,
    exams: Array.isArray(parsed.exams) ? parsed.exams : defaults.exams,
    lectures: Array.isArray(parsed.lectures) ? parsed.lectures : defaults.lectures,
    results: Array.isArray(parsed.results) ? parsed.results : defaults.results,
    faculty: Array.isArray(parsed.faculty) ? parsed.faculty : defaults.faculty,
    testimonials: Array.isArray(parsed.testimonials)
      ? parsed.testimonials
      : defaults.testimonials,
    galleryAlbums: Array.isArray(parsed.galleryAlbums)
      ? parsed.galleryAlbums
      : defaults.galleryAlbums,
    galleryMedia: Array.isArray(parsed.galleryMedia)
      ? parsed.galleryMedia
      : defaults.galleryMedia,
    blogs: Array.isArray(parsed.blogs) ? parsed.blogs : defaults.blogs,
    adminActivity: Array.isArray(parsed.adminActivity) ? parsed.adminActivity : [],
    adminAccount: { ...defaults.adminAccount, ...(parsed.adminAccount || {}) },
  };
}

function hydrateStore(parsed: Partial<StoreData> | null): StoreData {
  if (!parsed) return { enquiries: [], admissions: [], payments: [] };
  return {
    enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    admissions: Array.isArray(parsed.admissions) ? parsed.admissions : [],
    payments: Array.isArray(parsed.payments) ? parsed.payments : [],
  };
}

export async function readCms(): Promise<CmsPersisted> {
  if (getRedisConfig()) {
    try {
      const raw = await redisCommand<string>(['GET', KEY_CMS]);
      if (!raw) {
        const initial = createInitialPersistedCms();
        await redisCommand(['SET', KEY_CMS, JSON.stringify(initial)]);
        return initial;
      }
      return hydrateCms(JSON.parse(raw) as Partial<CmsPersisted>);
    } catch {
      return createInitialPersistedCms();
    }
  }

  try {
    const { dataDir } = ensureLocalDirs();
    const cmsPath = path.join(dataDir, 'cms.json');
    if (!fs.existsSync(cmsPath)) {
      const initial = createInitialPersistedCms();
      fs.writeFileSync(cmsPath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(cmsPath, 'utf8');
    return hydrateCms(JSON.parse(raw) as Partial<CmsPersisted>);
  } catch {
    return createInitialPersistedCms();
  }
}

export async function writeCms(data: CmsPersisted): Promise<void> {
  if (getRedisConfig()) {
    await redisCommand(['SET', KEY_CMS, JSON.stringify(data)]);
    return;
  }
  const { dataDir } = ensureLocalDirs();
  fs.writeFileSync(path.join(dataDir, 'cms.json'), JSON.stringify(data, null, 2), 'utf8');
}

export async function readStore(): Promise<StoreData> {
  if (getRedisConfig()) {
    try {
      const raw = await redisCommand<string>(['GET', KEY_SUBMISSIONS]);
      if (!raw) {
        const initial: StoreData = { enquiries: [], admissions: [], payments: [] };
        await redisCommand(['SET', KEY_SUBMISSIONS, JSON.stringify(initial)]);
        return initial;
      }
      return hydrateStore(JSON.parse(raw) as Partial<StoreData>);
    } catch {
      return { enquiries: [], admissions: [], payments: [] };
    }
  }

  try {
    const { dataDir } = ensureLocalDirs();
    const storePath = path.join(dataDir, 'submissions.json');
    if (!fs.existsSync(storePath)) {
      const initial: StoreData = { enquiries: [], admissions: [], payments: [] };
      fs.writeFileSync(storePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(storePath, 'utf8');
    return hydrateStore(JSON.parse(raw) as Partial<StoreData>);
  } catch {
    return { enquiries: [], admissions: [], payments: [] };
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  if (getRedisConfig()) {
    await redisCommand(['SET', KEY_SUBMISSIONS, JSON.stringify(data)]);
    return;
  }
  const { dataDir } = ensureLocalDirs();
  fs.writeFileSync(
    path.join(dataDir, 'submissions.json'),
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

async function readUploadIndex(): Promise<MediaAssetItem[]> {
  if (getRedisConfig()) {
    const raw = await redisCommand<string>(['GET', KEY_UPLOAD_INDEX]);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as MediaAssetItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function writeUploadIndex(items: MediaAssetItem[]): Promise<void> {
  if (getRedisConfig()) {
    await redisCommand(['SET', KEY_UPLOAD_INDEX, JSON.stringify(items)]);
  }
}

export async function saveUploadedFile(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const blobRes = await fetch(`https://blob.vercel-storage.com/uploads/${filename}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${blobToken}`,
        'content-type': contentType,
        'x-content-type': contentType,
        'x-api-version': '7',
        'x-add-random-suffix': '0',
      },
      body: new Uint8Array(buffer),
    });
    if (blobRes.ok) {
      const json = (await blobRes.json()) as { url?: string };
      if (json.url) {
        if (getRedisConfig()) {
          const idx = await readUploadIndex();
          idx.unshift({
            id: filename,
            filename,
            label: filename,
            file_url: json.url,
            contentType,
            size: buffer.length,
            source: 'blob',
            created_at: new Date().toISOString(),
          });
          await writeUploadIndex(idx);
        }
        return json.url;
      }
    }
  }

  if (getRedisConfig()) {
    const payload = JSON.stringify({
      contentType,
      base64: buffer.toString('base64'),
    });
    await redisCommand(['SET', `${KEY_UPLOAD_PREFIX}${filename}`, payload]);
    const idx = await readUploadIndex();
    idx.unshift({
      id: filename,
      filename,
      label: filename,
      file_url: `/uploads/${filename}`,
      contentType,
      size: buffer.length,
      source: 'upload',
      created_at: new Date().toISOString(),
    });
    await writeUploadIndex(idx);
    return `/uploads/${filename}`;
  }

  const { uploadsDir } = ensureLocalDirs();
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function readUploadedFile(filename: string): Promise<UploadedBinary | null> {
  const safeFile = path.basename(filename);
  if (getRedisConfig()) {
    const raw = await redisCommand<string>(['GET', `${KEY_UPLOAD_PREFIX}${safeFile}`]);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { contentType?: string; base64?: string };
        if (parsed.base64) {
          return {
            buffer: Buffer.from(parsed.base64, 'base64'),
            contentType: parsed.contentType || 'application/octet-stream',
          };
        }
      } catch {
        // fallback below
      }
    }
  }

  const { uploadsDir } = ensureLocalDirs();
  const fullPath = path.join(uploadsDir, safeFile);
  if (!fs.existsSync(fullPath)) return null;
  const ext = path.extname(safeFile).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };
  return {
    buffer: fs.readFileSync(fullPath),
    contentType: mimeMap[ext] || 'application/octet-stream',
  };
}

const BUILTIN_LABELS: Record<keyof typeof ORIGINAL_IMAGES, string> = {
  logo: 'Institute Logo',
  favicon: 'Browser Favicon',
  hero: 'Hero Classroom Photo',
  mentoring: 'Study Group Mentoring',
  residential: 'Residential Campus Facility',
  dayboarding: 'Day-Care School Campus',
  jee: 'IIT-JEE Program Banner',
  neet: 'NEET Medical Program Banner',
  fiveYear: '5-Year Integrated Course',
  fourYear: '4-Year Integrated Course',
  threeYear: '3-Year Integrated Course',
  resultAtharv: 'Result Poster — Atharv Nandapurkar AIR 3',
  galleryClassroom: 'Gallery — Classroom Session',
  galleryMentoring: 'Gallery — Faculty Mentoring',
  galleryDesk: 'Gallery — Supervised Study Desk',
  galleryExam: 'Gallery — Weekly Test & Evaluation',
};

export async function listAllMediaAssets(): Promise<MediaAssetItem[]> {
  const uploads: MediaAssetItem[] = [];

  if (getRedisConfig()) {
    const idx = await readUploadIndex();
    uploads.push(...idx);
  } else {
    const { uploadsDir } = ensureLocalDirs();
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const f of files) {
        const full = path.join(uploadsDir, f);
        try {
          const st = fs.statSync(full);
          if (!st.isFile()) continue;
          const ext = path.extname(f).toLowerCase();
          uploads.push({
            id: f,
            filename: f,
            label: f,
            file_url: `/uploads/${f}`,
            contentType: ext === '.pdf' ? 'application/pdf' : `image/${ext.replace('.', '') || 'png'}`,
            size: st.size,
            source: 'upload',
            created_at: st.mtime.toISOString(),
          });
        } catch {
          // ignore unreadable entries
        }
      }
      uploads.sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      );
    }
  }

  const builtins: MediaAssetItem[] = (
    Object.entries(ORIGINAL_IMAGES) as Array<[keyof typeof ORIGINAL_IMAGES, string]>
  ).map(([key, url]) => ({
    id: `builtin-${key}`,
    filename: path.basename(url),
    label: BUILTIN_LABELS[key] || key,
    file_url: url,
    contentType: 'image/png',
    size: 0,
    source: 'builtin',
  }));

  return [...uploads, ...builtins];
}

export async function deleteMediaAsset(filename: string): Promise<boolean> {
  const safeFile = path.basename(filename);
  if (getRedisConfig()) {
    await redisCommand(['DEL', `${KEY_UPLOAD_PREFIX}${safeFile}`]);
    const idx = await readUploadIndex();
    const filtered = idx.filter((item) => item.filename !== safeFile);
    await writeUploadIndex(filtered);
    return filtered.length !== idx.length;
  }

  const { uploadsDir } = ensureLocalDirs();
  const fullPath = path.join(uploadsDir, safeFile);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}

export async function exportFullBackup() {
  const [cms, store, media] = await Promise.all([
    readCms(),
    readStore(),
    listAllMediaAssets(),
  ]);
  return {
    exported_at: new Date().toISOString(),
    version: 1,
    cms,
    submissions: store,
    media_count: media.length,
  };
}

export async function importFullBackup(payload: {
  cms?: Partial<CmsPersisted>;
  submissions?: Partial<StoreData>;
}) {
  if (payload.cms) {
    const nextCms = hydrateCms(payload.cms);
    await writeCms(nextCms);
  }
  if (payload.submissions) {
    const nextStore = hydrateStore(payload.submissions);
    await writeStore(nextStore);
  }
}
