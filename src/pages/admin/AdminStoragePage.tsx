import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Check,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { uploadMediaFile } from '../../utils/imageUpload';
import { InstituteImage } from '../../components/BrandMark';
import { ConfirmDeleteModal } from './AdminField';
import { useAdminToast } from './AdminLayout';

interface MediaAsset {
  id: string;
  filename: string;
  label: string;
  file_url: string;
  contentType: string;
  size: number;
  source: 'builtin' | 'upload' | 'blob';
  created_at?: string;
}

interface StorageStatusInfo {
  mode: 'redis' | 'tmp' | 'disk';
  redisConfigured: boolean;
  blobConfigured: boolean;
  runtime: 'vercel' | 'node';
}

function formatBytes(bytes: number): string {
  if (!bytes) return 'Built-in asset';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminStoragePage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'upload' | 'builtin'>('all');
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [busy, setBusy] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/media');
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      if (data.storage) setStorageInfo(data.storage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Compute where each asset URL is actively linked in the website
  const usageMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const track = (url: string | undefined, place: string) => {
      if (!url) return;
      const list = map.get(url) || [];
      list.push(place);
      map.set(url, list);
    };

    const s = cms.siteSettings;
    track(s.logo_url, 'Site Logo');
    track(s.favicon_url, 'Favicon');
    track(s.og_image_url, 'SEO Share Image');
    track(s.payment_qr_url, 'Payment QR');
    track(cms.popupSetting.image_url, 'Admission Popup');

    cms.banners.forEach((b, i) => track(b.image_url, `Banner #${i + 1}`));
    cms.homepageSections.forEach((sec) => {
      track(sec.image_url, `Section: ${sec.key}`);
      (sec.items || []).forEach((it) => track(it.image_url, `Section Item: ${it.title || sec.key}`));
    });
    cms.courses.forEach((c) => track(c.image_url, `Course: ${c.name}`));
    cms.results.forEach((r) => {
      track(r.photo_url, `Result: ${r.student_name}`);
      track(r.document_url, `Result Doc: ${r.student_name}`);
    });
    cms.faculty.forEach((f) => track(f.photo_url, `Faculty: ${f.name}`));
    cms.testimonials.forEach((t) => track(t.photo_url, `Testimonial: ${t.display_name}`));
    cms.galleryAlbums.forEach((a) => track(a.cover_image_url, `Album: ${a.title}`));
    cms.galleryMedia.forEach((g) => track(g.file_url, `Gallery: ${g.title || 'Photo'}`));
    cms.blogs.forEach((b) => track(b.featured_image_url, `Blog: ${b.title}`));

    return map;
  }, [cms]);

  const filtered = useMemo(() => {
    if (filterSource === 'all') return items;
    if (filterSource === 'upload') return items.filter((i) => i.source !== 'builtin');
    return items.filter((i) => i.source === 'builtin');
  }, [items, filterSource]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadMediaFile(file);
      await loadMedia();
      notify('File uploaded and linked to website storage.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleImportBackup(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/cms/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed.');
      await reloadCms();
      await loadMedia();
      notify('Full website backup restored successfully.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Invalid backup file.', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  async function copyUrl(asset: MediaAsset) {
    try {
      const fullUrl = asset.file_url.startsWith('/')
        ? `${window.location.origin}${asset.file_url}`
        : asset.file_url;
      await navigator.clipboard.writeText(asset.file_url.startsWith('/src/') || asset.file_url.startsWith('/uploads/') ? asset.file_url : fullUrl);
      setCopiedId(asset.id);
      notify('Asset path copied to clipboard.');
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notify('Could not copy automatically.', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await fetch(`/api/cms/media/${encodeURIComponent(deleteTarget.filename)}`, {
      method: 'DELETE',
    });
    setBusy(false);
    setDeleteTarget(null);
    if (res.ok) {
      await loadMedia();
      notify('Uploaded file removed from storage.');
    } else {
      notify('Could not delete file.', 'error');
    }
  }

  const modeLabel =
    storageInfo?.mode === 'redis'
      ? 'Upstash Redis / Vercel KV (Permanent Cloud)'
      : storageInfo?.mode === 'tmp'
        ? 'Vercel Ephemeral /tmp (Connect KV/Redis for permanent storage)'
        : 'Local Server Disk (./data)';

  return (
    <div className="space-y-6">
      {/* Storage Connection & Backup */}
      <div className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F4F7FC] text-[#122B5C]">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#122B5C]">
                Website Storage &amp; Media Links
              </h2>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                Active driver: <span className="font-semibold text-[#122B5C]">{modeLabel}</span>
                {storageInfo?.blobConfigured ? ' · Vercel Blob connected' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/cms/export"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export backup JSON</span>
            </a>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]">
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FolderOpen className="h-3.5 w-3.5" />
              )}
              <span>{importing ? 'Restoring...' : 'Restore JSON backup'}</span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportBackup}
                disabled={importing}
                className="sr-only"
              />
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B1D40]">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>{uploading ? 'Uploading...' : 'Upload photo / PDF'}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/60 p-3.5">
            <p className="font-semibold text-[hsl(var(--muted-foreground))]">Total stored assets</p>
            <p className="mt-1 text-xl font-bold text-[#122B5C] tabular-nums">{items.length}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/60 p-3.5">
            <p className="font-semibold text-[hsl(var(--muted-foreground))]">Uploaded custom files</p>
            <p className="mt-1 text-xl font-bold text-[#122B5C] tabular-nums">
              {items.filter((i) => i.source !== 'builtin').length}
            </p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/60 p-3.5">
            <p className="font-semibold text-[hsl(var(--muted-foreground))]">Active CMS links</p>
            <p className="mt-1 text-xl font-bold text-[#122B5C] tabular-nums">
              {usageMap.size}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-[#F4F7FC] p-1">
          {[
            { key: 'all', label: `All files (${items.length})` },
            {
              key: 'upload',
              label: `Uploaded (${items.filter((i) => i.source !== 'builtin').length})`,
            },
            {
              key: 'builtin',
              label: `Built-in assets (${items.filter((i) => i.source === 'builtin').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterSource(tab.key as 'all' | 'upload' | 'builtin')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums transition ${
                filterSource === tab.key
                  ? 'bg-[#122B5C] text-white'
                  : 'text-[hsl(var(--foreground))] hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Every uploaded or built-in asset can be linked directly from any image field in Admin.
        </p>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="surface p-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
          Loading storage index...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => {
            const links = usageMap.get(asset.file_url) || [];
            const isPdf = asset.contentType === 'application/pdf' || asset.file_url.endsWith('.pdf');
            return (
              <article
                key={asset.id}
                className="surface flex flex-col overflow-hidden"
              >
                <div className="relative h-44 bg-[#0B1D40]/5">
                  {isPdf ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-[#122B5C]">
                      <FileText className="h-10 w-10 text-[#0785D1]" />
                      <span className="text-xs font-bold">PDF Document</span>
                    </div>
                  ) : (
                    <InstituteImage
                      src={asset.file_url}
                      alt={asset.label}
                      fit="contain"
                      className="h-full w-full bg-[#F4F7FC]"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#122B5C]">
                        {asset.label}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
                        {asset.file_url}
                      </p>
                    </div>
                    <HardDrive className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                  </div>

                  <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                    {formatBytes(asset.size)} ·{' '}
                    {links.length > 0 ? `Linked in ${links.join(', ')}` : 'Not linked yet'}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--border))] pt-3 mt-3">
                    <button
                      type="button"
                      onClick={() => copyUrl(asset)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-[11px] font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                    >
                      {copiedId === asset.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedId === asset.id ? 'Copied' : 'Copy link'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={asset.file_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${asset.label}`}
                        className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {asset.source !== 'builtin' && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(asset)}
                          aria-label={`Delete ${asset.label}`}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete uploaded file"
        description={`Delete "${deleteTarget?.label}" from website storage? Any pages using this URL will fall back cleanly.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
