import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { PAGE_SEO_KEYS } from '../../data/cmsDefaults';
import type { NavigationItem, PageSeoItem, PopupSetting, SiteSettings } from '../../types/cms';
import { AdminField, AdminModal, ConfirmDeleteModal } from './AdminField';
import { useAdminToast } from './AdminLayout';

export function SettingsPageShell({
  title,
  description,
  onSave,
  saving,
  children,
}: {
  title: string;
  description: string;
  onSave: (e: FormEvent) => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-base font-bold text-[#122B5C]">{title}</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B1D40] disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Saving...' : 'Save changes'}</span>
        </button>
      </div>

      <div className="space-y-5">{children}</div>
    </form>
  );
}

function useSiteSettingsEditor() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [draft, setDraft] = useState<SiteSettings>(() => ({ ...cms.siteSettings }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({ ...cms.siteSettings });
  }, [cms.siteSettings]);

  function updateField<K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  async function savePatch(patch: Partial<SiteSettings>) {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save settings.');
      await reloadCms();
      notify('Settings saved and updated across the website.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return { draft, setDraft, updateField, saving, savePatch };
}

export function WebsiteSettingsPage() {
  const { draft, updateField, saving, savePatch } = useSiteSettingsEditor();

  function onSave(e: FormEvent) {
    e.preventDefault();
    savePatch({
      institute_name: draft.institute_name,
      tagline: draft.tagline,
      logo_url: draft.logo_url,
      logo_width: draft.logo_width,
      logo_height: draft.logo_height,
      favicon_url: draft.favicon_url,
      announcement_enabled: draft.announcement_enabled,
      announcement_text: draft.announcement_text,
      announcement_bg_color: draft.announcement_bg_color,
      announcement_text_color: draft.announcement_text_color,
      header_bg_color: draft.header_bg_color,
      header_text_color: draft.header_text_color,
    });
  }

  return (
    <SettingsPageShell
      title="Website branding, logo, colors & announcement bar"
      description="Changes update the header, logo sizing, favicon, and top announcement banner immediately."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Identity &amp; Branding</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            id="ws_name"
            label="Institute name"
            required
            value={draft.institute_name}
            onChange={(v) => updateField('institute_name', String(v))}
          />
          <AdminField
            id="ws_tagline"
            label="Tagline"
            value={draft.tagline}
            onChange={(v) => updateField('tagline', String(v))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            id="ws_logo"
            label="Header & footer logo"
            type="image"
            value={draft.logo_url}
            onChange={(v) => updateField('logo_url', String(v))}
          />
          <AdminField
            id="ws_favicon"
            label="Browser favicon icon"
            type="image"
            value={draft.favicon_url}
            onChange={(v) => updateField('favicon_url', String(v))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            id="ws_logo_w"
            label="Logo width (px)"
            value={draft.logo_width}
            onChange={(v) => updateField('logo_width', String(v))}
          />
          <AdminField
            id="ws_logo_h"
            label="Logo height (px)"
            value={draft.logo_height}
            onChange={(v) => updateField('logo_height', String(v))}
          />
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Announcement Bar</h3>
        <AdminField
          label="Show announcement bar across website"
          hint="Displays the notice bar above the main navigation."
          type="switch"
          value={draft.announcement_enabled}
          onChange={(v) => updateField('announcement_enabled', Boolean(v))}
        />
        <AdminField
          id="ws_ann_text"
          label="Announcement message"
          value={draft.announcement_text}
          onChange={(v) => updateField('announcement_text', String(v))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            id="ws_ann_bg"
            label="Announcement background color"
            type="color"
            value={draft.announcement_bg_color}
            onChange={(v) => updateField('announcement_bg_color', String(v))}
          />
          <AdminField
            id="ws_ann_fg"
            label="Announcement text color"
            type="color"
            value={draft.announcement_text_color}
            onChange={(v) => updateField('announcement_text_color', String(v))}
          />
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Header Colors</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            id="ws_hdr_bg"
            label="Header background color"
            type="color"
            value={draft.header_bg_color}
            onChange={(v) => updateField('header_bg_color', String(v))}
          />
          <AdminField
            id="ws_hdr_fg"
            label="Header text color"
            type="color"
            value={draft.header_text_color}
            onChange={(v) => updateField('header_text_color', String(v))}
          />
        </div>
      </div>
    </SettingsPageShell>
  );
}

export function NavigationSettingsPage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NavigationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavigationItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    label: '',
    path: '/',
    location: 'header' as 'header' | 'footer',
    is_visible: true,
    open_in_new_tab: false,
  });

  function openNew(loc: 'header' | 'footer') {
    setEditing(null);
    setForm({ label: '', path: '/', location: loc, is_visible: true, open_in_new_tab: false });
    setModalOpen(true);
  }

  function openEdit(item: NavigationItem) {
    setEditing(item);
    setForm({
      label: item.label,
      path: item.path,
      location: item.location,
      is_visible: item.is_visible,
      open_in_new_tab: item.open_in_new_tab,
    });
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.path.trim()) {
      notify('Label and path are required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        editing ? `/api/cms/navigation/${editing.id}` : '/api/cms/navigation',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save navigation item.');
      await reloadCms();
      setModalOpen(false);
      notify(editing ? 'Navigation link updated.' : 'Navigation link added.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(item: NavigationItem) {
    await fetch(`/api/cms/navigation/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !item.is_visible }),
    });
    await reloadCms();
    notify(`Link "${item.label}" ${item.is_visible ? 'hidden' : 'shown'}.`);
  }

  async function moveItem(loc: 'header' | 'footer', idx: number, dir: -1 | 1) {
    const list = cms.navigationItems.filter((n) => n.location === loc);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const ids = list.map((n) => n.id);
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    await fetch('/api/cms/navigation/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    await reloadCms();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    await fetch(`/api/cms/navigation/${deleteTarget.id}`, { method: 'DELETE' });
    await reloadCms();
    setBusy(false);
    setDeleteTarget(null);
    notify('Navigation link deleted.');
  }

  function renderGroup(loc: 'header' | 'footer', title: string) {
    const list = cms.navigationItems.filter((n) => n.location === loc);
    return (
      <div className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#122B5C]">{title}</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Reorder links, edit labels or URLs, and control visibility
            </p>
          </div>
          <button
            type="button"
            onClick={() => openNew(loc)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0B1D40]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add {loc} link</span>
          </button>
        </div>

        <div className="mt-3 divide-y divide-[hsl(var(--border))]">
          {list.map((item, idx) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#122B5C]">
                  {item.label}
                  {!item.is_visible && (
                    <span className="ml-2 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                      (Hidden)
                    </span>
                  )}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                  {item.path}
                  {item.open_in_new_tab ? ' · new tab' : ''}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveItem(loc, idx, -1)}
                  disabled={idx === 0}
                  aria-label="Move up"
                  className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC] disabled:opacity-35"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(loc, idx, 1)}
                  disabled={idx === list.length - 1}
                  aria-label="Move down"
                  className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC] disabled:opacity-35"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisible(item)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                    item.is_visible
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {item.is_visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  aria-label="Edit link"
                  className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  aria-label="Delete link"
                  className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderGroup('header', 'Header Navigation')}
      {renderGroup('footer', 'Footer Navigation')}

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit navigation link' : 'Add navigation link'}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminField
            label="Menu label"
            required
            value={form.label}
            onChange={(v) => setForm((p) => ({ ...p, label: String(v) }))}
          />
          <AdminField
            label="Path or URL"
            required
            value={form.path}
            placeholder="/courses or https://..."
            onChange={(v) => setForm((p) => ({ ...p, path: String(v) }))}
          />
          <AdminField
            label="Location"
            type="select"
            value={form.location}
            options={[
              { label: 'Header navigation', value: 'header' },
              { label: 'Footer navigation', value: 'footer' },
            ]}
            onChange={(v) => setForm((p) => ({ ...p, location: v as 'header' | 'footer' }))}
          />
          <AdminField
            label="Visible on website"
            type="switch"
            value={form.is_visible}
            onChange={(v) => setForm((p) => ({ ...p, is_visible: Boolean(v) }))}
          />
          <AdminField
            label="Open in new tab"
            type="switch"
            value={form.open_in_new_tab}
            onChange={(v) => setForm((p) => ({ ...p, open_in_new_tab: Boolean(v) }))}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold text-[#122B5C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white"
            >
              {busy ? 'Saving...' : 'Save link'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete navigation link"
        description={`Remove "${deleteTarget?.label}" from ${deleteTarget?.location} navigation?`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function PopupSettingsPage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [draft, setDraft] = useState<PopupSetting>(() => ({ ...cms.popupSetting }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({ ...cms.popupSetting });
  }, [cms.popupSetting]);

  function upd<K extends keyof PopupSetting>(key: K, val: PopupSetting[K]) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/cms/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error('Could not save popup settings.');
      await reloadCms();
      notify('Admission popup settings saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell
      title="Admission Popup Modal"
      description="Configure the delayed enquiry popup shown to visitors on the public website."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <AdminField
          label="Enable admission enquiry popup"
          hint="Shows the enquiry popup automatically after the delay below."
          type="switch"
          value={draft.is_enabled}
          onChange={(v) => upd('is_enabled', Boolean(v))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Delay before appearing (seconds)"
            type="number"
            value={draft.delay_seconds}
            onChange={(v) => upd('delay_seconds', Number(v))}
          />
          <AdminField
            label="Display frequency"
            type="select"
            value={draft.frequency}
            options={[
              { label: 'Once per browser session', value: 'session' },
              { label: 'Once only', value: 'once' },
              { label: 'Every page load', value: 'always' },
            ]}
            onChange={(v) => upd('frequency', v as PopupSetting['frequency'])}
          />
        </div>
        <AdminField
          label="Popup title"
          value={draft.title}
          onChange={(v) => upd('title', String(v))}
        />
        <AdminField
          label="Popup description"
          type="textarea"
          value={draft.description}
          onChange={(v) => upd('description', String(v))}
        />
        <AdminField
          label="Submit button label"
          value={draft.submit_label}
          onChange={(v) => upd('submit_label', String(v))}
        />
        <AdminField
          label="Optional popup banner image"
          type="image"
          value={draft.image_url}
          onChange={(v) => upd('image_url', String(v))}
        />
      </div>

      <div className="surface space-y-3 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Form Fields Visibility</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField
            label="Show parent name field"
            type="switch"
            value={draft.show_parent_name}
            onChange={(v) => upd('show_parent_name', Boolean(v))}
          />
          <AdminField
            label="Show email field"
            type="switch"
            value={draft.show_email}
            onChange={(v) => upd('show_email', Boolean(v))}
          />
          <AdminField
            label="Show class dropdown"
            type="switch"
            value={draft.show_class}
            onChange={(v) => upd('show_class', Boolean(v))}
          />
          <AdminField
            label="Show course selector"
            type="switch"
            value={draft.show_course}
            onChange={(v) => upd('show_course', Boolean(v))}
          />
          <AdminField
            label="Show preferred batch dropdown"
            type="switch"
            value={draft.show_batch}
            onChange={(v) => upd('show_batch', Boolean(v))}
          />
          <AdminField
            label="Show message box"
            type="switch"
            value={draft.show_message}
            onChange={(v) => upd('show_message', Boolean(v))}
          />
        </div>
      </div>
    </SettingsPageShell>
  );
}

export function SeoSettingsPage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [siteSeo, setSiteSeo] = useState({
    seo_title: cms.siteSettings.seo_title,
    seo_description: cms.siteSettings.seo_description,
    seo_keywords: cms.siteSettings.seo_keywords,
    og_image_url: cms.siteSettings.og_image_url,
  });
  const [pageRows, setPageRows] = useState<PageSeoItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSiteSeo({
      seo_title: cms.siteSettings.seo_title,
      seo_description: cms.siteSettings.seo_description,
      seo_keywords: cms.siteSettings.seo_keywords,
      og_image_url: cms.siteSettings.og_image_url,
    });
    const byKey = new Map(cms.pageSeo.map((p) => [p.page_key, p]));
    setPageRows(
      PAGE_SEO_KEYS.map((meta) => {
        const existing = byKey.get(meta.key);
        return (
          existing || {
            id: `seo-${meta.key}`,
            page_key: meta.key,
            page_label: meta.label,
            title: '',
            description: '',
          }
        );
      })
    );
  }, [cms.siteSettings, cms.pageSeo]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/cms/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteSeo),
        }),
        fetch('/api/cms/page-seo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: pageRows }),
        }),
      ]);
      if (!res1.ok || !res2.ok) throw new Error('Could not update SEO settings.');
      await reloadCms();
      notify('Default and per-page SEO metadata saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell
      title="SEO Settings"
      description="Control default search engine meta tags and custom titles/descriptions for every route."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Global Defaults</h3>
        <AdminField
          label="Default meta title"
          value={siteSeo.seo_title}
          onChange={(v) => setSiteSeo((p) => ({ ...p, seo_title: String(v) }))}
        />
        <AdminField
          label="Default meta description"
          type="textarea"
          value={siteSeo.seo_description}
          onChange={(v) => setSiteSeo((p) => ({ ...p, seo_description: String(v) }))}
        />
        <AdminField
          label="Keywords (comma separated)"
          value={siteSeo.seo_keywords}
          onChange={(v) => setSiteSeo((p) => ({ ...p, seo_keywords: String(v) }))}
        />
        <AdminField
          label="OpenGraph social share image"
          type="image"
          value={siteSeo.og_image_url}
          onChange={(v) => setSiteSeo((p) => ({ ...p, og_image_url: String(v) }))}
        />
      </div>

      <div className="surface p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Per-Page Meta Overrides</h3>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          Leave blank to fall back to the global defaults above.
        </p>

        <div className="mt-4 divide-y divide-[hsl(var(--border))]">
          {pageRows.map((row, idx) => (
            <div key={row.page_key} className="grid gap-3 py-3 sm:grid-cols-[160px_1fr_1fr] sm:items-center">
              <div>
                <p className="text-xs font-bold text-[#122B5C]">{row.page_label}</p>
                <p className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
                  /{row.page_key === 'home' ? '' : row.page_key}
                </p>
              </div>
              <input
                type="text"
                placeholder="Page title"
                value={row.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageRows((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                  );
                }}
                className="w-full rounded-lg border border-[hsl(var(--input))] px-3 py-2 text-xs outline-none focus:border-[#122B5C]"
              />
              <input
                type="text"
                placeholder="Meta description"
                value={row.description}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageRows((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                  );
                }}
                className="w-full rounded-lg border border-[hsl(var(--input))] px-3 py-2 text-xs outline-none focus:border-[#122B5C]"
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsPageShell>
  );
}

export function FooterSettingsPage() {
  const { draft, updateField, saving, savePatch } = useSiteSettingsEditor();

  function onSave(e: FormEvent) {
    e.preventDefault();
    savePatch({
      footer_about: draft.footer_about,
      footer_copyright: draft.footer_copyright,
      privacy_content: draft.privacy_content,
      terms_content: draft.terms_content,
    });
  }

  return (
    <SettingsPageShell
      title="Footer & Legal Pages"
      description="Manage footer institute bio, copyright notice, and the Privacy Policy & Terms pages."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <AdminField
          label="Footer about paragraph"
          type="textarea"
          rows={3}
          value={draft.footer_about}
          onChange={(v) => updateField('footer_about', String(v))}
        />
        <AdminField
          label="Copyright notice"
          value={draft.footer_copyright}
          onChange={(v) => updateField('footer_copyright', String(v))}
        />
      </div>

      <div className="surface space-y-4 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Legal Page Content</h3>
        <AdminField
          label="Privacy Policy content"
          hint="Separate paragraphs with a blank line."
          type="textarea"
          rows={6}
          value={
            Array.isArray(draft.privacy_content)
              ? draft.privacy_content.join('\n\n')
              : draft.privacy_content
          }
          onChange={(v) => updateField('privacy_content', String(v))}
        />
        <AdminField
          label="Terms & Conditions content"
          hint="Separate paragraphs with a blank line."
          type="textarea"
          rows={6}
          value={
            Array.isArray(draft.terms_content)
              ? draft.terms_content.join('\n\n')
              : draft.terms_content
          }
          onChange={(v) => updateField('terms_content', String(v))}
        />
      </div>
    </SettingsPageShell>
  );
}

export function ContactSettingsPage() {
  const { draft, updateField, saving, savePatch } = useSiteSettingsEditor();

  function onSave(e: FormEvent) {
    e.preventDefault();
    savePatch({
      phone: draft.phone,
      email: draft.email,
      whatsapp: draft.whatsapp,
      office_hours: draft.office_hours,
      address: draft.address,
      map_embed_url: draft.map_embed_url,
      map_link: draft.map_link,
      facebook_url: draft.facebook_url,
      instagram_url: draft.instagram_url,
      youtube_url: draft.youtube_url,
      twitter_url: draft.twitter_url,
    });
  }

  return (
    <SettingsPageShell
      title="Contact & Social Channels"
      description="Phone numbers, WhatsApp, office hours, Google Maps embed, and social links."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Primary phone"
            value={draft.phone}
            onChange={(v) => updateField('phone', String(v))}
          />
          <AdminField
            label="WhatsApp number"
            value={draft.whatsapp}
            onChange={(v) => updateField('whatsapp', String(v))}
          />
          <AdminField
            label="Contact email"
            type="email"
            value={draft.email}
            onChange={(v) => updateField('email', String(v))}
          />
          <AdminField
            label="Office hours"
            value={draft.office_hours}
            onChange={(v) => updateField('office_hours', String(v))}
          />
        </div>
        <AdminField
          label="Campus address"
          type="textarea"
          rows={2}
          value={draft.address}
          onChange={(v) => updateField('address', String(v))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Google Maps embed URL (iframe src)"
            value={draft.map_embed_url}
            placeholder="https://www.google.com/maps/embed?..."
            onChange={(v) => updateField('map_embed_url', String(v))}
          />
          <AdminField
            label="Google Maps directions link"
            value={draft.map_link}
            placeholder="https://maps.google.com/?q=..."
            onChange={(v) => updateField('map_link', String(v))}
          />
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <h3 className="text-sm font-bold text-[#122B5C]">Social Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Facebook URL"
            value={draft.facebook_url}
            onChange={(v) => updateField('facebook_url', String(v))}
          />
          <AdminField
            label="Instagram URL"
            value={draft.instagram_url}
            onChange={(v) => updateField('instagram_url', String(v))}
          />
          <AdminField
            label="YouTube URL"
            value={draft.youtube_url}
            onChange={(v) => updateField('youtube_url', String(v))}
          />
          <AdminField
            label="X / Twitter URL"
            value={draft.twitter_url}
            onChange={(v) => updateField('twitter_url', String(v))}
          />
        </div>
      </div>
    </SettingsPageShell>
  );
}

export function PaymentSettingsPage() {
  const { draft, updateField, saving, savePatch } = useSiteSettingsEditor();

  function onSave(e: FormEvent) {
    e.preventDefault();
    savePatch({
      payments_enabled: draft.payments_enabled,
      payment_fee_label: draft.payment_fee_label,
      upi_id: draft.upi_id,
      payment_qr_url: draft.payment_qr_url,
      bank_details: draft.bank_details,
      payment_instructions: draft.payment_instructions,
    });
  }

  return (
    <SettingsPageShell
      title="Payment Settings"
      description="Enable manual UPI / bank transfer fee collection on the Admissions page and configure QR/bank details."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <AdminField
          label="Enable payment submission on Admissions page"
          hint="When turned on, applicants can view UPI/QR details and upload payment receipts."
          type="switch"
          value={draft.payments_enabled}
          onChange={(v) => updateField('payments_enabled', Boolean(v))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Fee / section heading"
            value={draft.payment_fee_label}
            onChange={(v) => updateField('payment_fee_label', String(v))}
          />
          <AdminField
            label="UPI ID"
            value={draft.upi_id}
            placeholder="gurukulclasses@upi"
            onChange={(v) => updateField('upi_id', String(v))}
          />
        </div>
        <AdminField
          label="UPI QR Code image"
          type="image"
          value={draft.payment_qr_url}
          onChange={(v) => updateField('payment_qr_url', String(v))}
        />
        <AdminField
          label="Bank account details"
          type="textarea"
          rows={3}
          value={draft.bank_details}
          placeholder="Bank Name, Account No., IFSC Code, Branch"
          onChange={(v) => updateField('bank_details', String(v))}
        />
        <AdminField
          label="Payment instructions for parents"
          type="textarea"
          rows={3}
          value={draft.payment_instructions}
          onChange={(v) => updateField('payment_instructions', String(v))}
        />
      </div>
    </SettingsPageShell>
  );
}
