import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { HOMEPAGE_SECTION_LABELS } from '../../data/cmsDefaults';
import type {
  AboutHighlight,
  ApproachStep,
  BannerItem,
  HomepageSection,
  HomepageSectionItem,
} from '../../types/cms';
import { AdminField, AdminModal, ConfirmDeleteModal } from './AdminField';
import { useAdminToast } from './AdminLayout';
import { SettingsPageShell } from './AdminSettingsForms';
import { InstituteImage } from '../../components/BrandMark';

export function HomepageSectionsPage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HomepageSection | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    key: 'custom',
    eyebrow: '',
    title: '',
    subtitle: '',
    body: '',
    image_url: '',
    button_label: '',
    button_link: '',
    is_visible: true,
    items: [] as HomepageSectionItem[],
  });

  function openEdit(sec: HomepageSection) {
    setCreating(false);
    setEditing(sec);
    setForm({
      key: sec.key,
      eyebrow: sec.eyebrow || '',
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      body: sec.body || '',
      image_url: sec.image_url || '',
      button_label: sec.button_label || '',
      button_link: sec.button_link || '',
      is_visible: sec.is_visible !== false,
      items: (sec.items || []).map((i) => ({ ...i })),
    });
  }

  function openNewCustom() {
    setEditing(null);
    setCreating(true);
    setForm({
      key: 'custom',
      eyebrow: 'Highlight',
      title: 'New section title',
      subtitle: '',
      body: '',
      image_url: '',
      button_label: 'Learn more',
      button_link: '/courses',
      is_visible: true,
      items: [],
    });
  }

  async function moveSection(idx: number, dir: -1 | 1) {
    const list = cms.homepageSections;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const ids = list.map((s) => s.id);
    [ids[idx], ids[targetIdx]] = [ids[targetIdx], ids[idx]];
    await fetch('/api/cms/homepage/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    await reloadCms();
    notify('Homepage section order updated.');
  }

  async function toggleVisible(sec: HomepageSection) {
    await fetch(`/api/cms/homepage/${sec.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !sec.is_visible }),
    });
    await reloadCms();
    notify(`"${sec.title || sec.key}" is now ${sec.is_visible ? 'hidden' : 'visible'}.`);
  }

  async function restoreDefaults() {
    const res = await fetch('/api/cms/homepage/restore', { method: 'POST' });
    const data = await res.json();
    await reloadCms();
    notify(
      data.added > 0
        ? `Restored ${data.added} missing default section(s).`
        : 'All default homepage sections are already present.'
    );
  }

  async function saveForm(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(
        creating ? '/api/cms/homepage' : `/api/cms/homepage/${editing!.id}`,
        {
          method: creating ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error('Could not save homepage section.');
      await reloadCms();
      setEditing(null);
      setCreating(false);
      notify(creating ? 'Custom section created.' : 'Homepage section updated.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    await fetch(`/api/cms/homepage/${deleteTarget.id}`, { method: 'DELETE' });
    await reloadCms();
    setBusy(false);
    setDeleteTarget(null);
    notify('Section removed.');
  }

  function updateItem(idx: number, patch: Partial<HomepageSectionItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-base font-bold text-[#122B5C]">Homepage Sections</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Reorder sections, toggle visibility, edit content, or add custom sections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={restoreDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore defaults</span>
          </button>
          <button
            type="button"
            onClick={openNewCustom}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0B1D40]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add custom section</span>
          </button>
        </div>
      </div>

      <div className="surface divide-y divide-[hsl(var(--border))]">
        {cms.homepageSections.map((sec, idx) => (
          <div
            key={sec.id}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-mono font-semibold text-[#0785D1] tabular-nums">
                  #{idx + 1}
                </span>
                <span>·</span>
                <span>{HOMEPAGE_SECTION_LABELS[sec.key] || sec.key}</span>
                {sec.eyebrow && (
                  <>
                    <span>·</span>
                    <span>{sec.eyebrow}</span>
                  </>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm font-bold text-[#122B5C]">
                {sec.title || HOMEPAGE_SECTION_LABELS[sec.key] || sec.key}
              </p>
              {sec.subtitle && (
                <p className="mt-0.5 truncate text-xs text-[hsl(var(--muted-foreground))]">
                  {sec.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => moveSection(idx, -1)}
                disabled={idx === 0}
                aria-label="Move up"
                className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC] disabled:opacity-35"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveSection(idx, 1)}
                disabled={idx === cms.homepageSections.length - 1}
                aria-label="Move down"
                className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC] disabled:opacity-35"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(sec)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  sec.is_visible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]'
                }`}
              >
                {sec.is_visible ? 'Visible' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => openEdit(sec)}
                aria-label="Edit section"
                className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit</span>
              </button>
              {sec.key === 'custom' && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(sec)}
                  aria-label="Delete custom section"
                  className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        open={Boolean(editing) || creating}
        title={
          creating
            ? 'Add custom homepage section'
            : `Edit ${HOMEPAGE_SECTION_LABELS[form.key] || form.key}`
        }
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={saveForm} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Eyebrow label"
              value={form.eyebrow}
              onChange={(v) => setForm((p) => ({ ...p, eyebrow: String(v) }))}
            />
            <AdminField
              label="Section heading"
              value={form.title}
              onChange={(v) => setForm((p) => ({ ...p, title: String(v) }))}
            />
          </div>
          <AdminField
            label="Subtitle / lead text"
            type="textarea"
            rows={2}
            value={form.subtitle}
            onChange={(v) => setForm((p) => ({ ...p, subtitle: String(v) }))}
          />
          <AdminField
            label="Body copy"
            type="textarea"
            rows={4}
            value={form.body}
            onChange={(v) => setForm((p) => ({ ...p, body: String(v) }))}
          />
          <AdminField
            label="Section image"
            type="image"
            value={form.image_url}
            onChange={(v) => setForm((p) => ({ ...p, image_url: String(v) }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Button label"
              value={form.button_label}
              onChange={(v) => setForm((p) => ({ ...p, button_label: String(v) }))}
            />
            <AdminField
              label="Button link"
              value={form.button_link}
              onChange={(v) => setForm((p) => ({ ...p, button_link: String(v) }))}
            />
          </div>

          <AdminField
            label="Visible on homepage"
            type="switch"
            value={form.is_visible}
            onChange={(v) => setForm((p) => ({ ...p, is_visible: Boolean(v) }))}
          />

          <div className="border-t border-[hsl(var(--border))] pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#122B5C]">
                Section Items ({form.items.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    items: [...p.items, { title: '', description: '', value: '', label: '' }],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add item</span>
              </button>
            </div>

            {form.items.length > 0 && (
              <div className="mt-3 space-y-3">
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/60 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#122B5C] tabular-nums">
                        Item #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            items: p.items.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <AdminField
                        label="Title / Question"
                        value={item.title || ''}
                        onChange={(v) => updateItem(idx, { title: String(v) })}
                      />
                      <AdminField
                        label="Highlight Value (e.g. 2009)"
                        value={item.value || ''}
                        onChange={(v) => updateItem(idx, { value: String(v) })}
                      />
                    </div>
                    <AdminField
                      label="Label"
                      value={item.label || ''}
                      onChange={(v) => updateItem(idx, { label: String(v) })}
                    />
                    <AdminField
                      label="Description / Answer"
                      type="textarea"
                      rows={2}
                      value={item.description || ''}
                      onChange={(v) => updateItem(idx, { description: String(v) })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold text-[#122B5C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white"
            >
              {busy ? 'Saving...' : 'Save section'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete custom section"
        description={`Delete "${deleteTarget?.title || deleteTarget?.key}" from the homepage?`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function HeroBannersPage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BannerItem | null>(null);
  const [busy, setBusy] = useState(false);

  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    image_url: '',
    mobile_image_url: '',
    deadline: '',
    primary_label: 'Apply for admission',
    primary_url: '/admission',
    secondary_label: 'Talk to us',
    secondary_url: '/contact',
    is_active: true,
  });

  const heroSection = cms.homepageSections.find((s) => s.key === 'hero');
  const [heroShared, setHeroShared] = useState({
    eyebrow: heroSection?.eyebrow || '',
    title: heroSection?.title || '',
    subtitle: heroSection?.subtitle || '',
    button_label: heroSection?.button_label || '',
    button_link: heroSection?.button_link || '',
    items: (heroSection?.items || []) as HomepageSectionItem[],
  });

  useEffect(() => {
    if (!heroSection) return;
    setHeroShared({
      eyebrow: heroSection.eyebrow || '',
      title: heroSection.title || '',
      subtitle: heroSection.subtitle || '',
      button_label: heroSection.button_label || '',
      button_link: heroSection.button_link || '',
      items: (heroSection.items || []).map((i) => ({ ...i })),
    });
  }, [heroSection]);

  function openNewBanner() {
    setEditing(null);
    setBannerForm({
      title: '',
      description: '',
      image_url: '',
      mobile_image_url: '',
      deadline: '',
      primary_label: 'Apply for admission',
      primary_url: '/admission',
      secondary_label: 'Talk to us',
      secondary_url: '/contact',
      is_active: true,
    });
    setModalOpen(true);
  }

  function openEditBanner(b: BannerItem) {
    setEditing(b);
    setBannerForm({
      title: b.title || '',
      description: b.description || '',
      image_url: b.image_url || '',
      mobile_image_url: b.mobile_image_url || '',
      deadline: b.deadline || '',
      primary_label: b.primary_label || '',
      primary_url: b.primary_url || '',
      secondary_label: b.secondary_label || '',
      secondary_url: b.secondary_url || '',
      is_active: b.is_active !== false,
    });
    setModalOpen(true);
  }

  async function saveBanner(e: FormEvent) {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      notify('Banner headline is required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        editing ? `/api/cms/entities/banners/${editing.id}` : '/api/cms/entities/banners',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bannerForm,
            display_order: editing ? editing.display_order : cms.banners.length,
          }),
        }
      );
      if (!res.ok) throw new Error('Could not save banner.');
      await reloadCms();
      setModalOpen(false);
      notify(editing ? 'Banner updated.' : 'Banner created.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function moveBanner(idx: number, dir: -1 | 1) {
    const swap = idx + dir;
    if (swap < 0 || swap >= cms.banners.length) return;
    const ids = cms.banners.map((b) => b.id);
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    await fetch('/api/cms/banners/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    await reloadCms();
  }

  async function toggleBannerActive(b: BannerItem) {
    await fetch(`/api/cms/entities/banners/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !b.is_active }),
    });
    await reloadCms();
  }

  async function deleteBanner() {
    if (!deleteTarget) return;
    setBusy(true);
    await fetch(`/api/cms/entities/banners/${deleteTarget.id}`, { method: 'DELETE' });
    await reloadCms();
    setBusy(false);
    setDeleteTarget(null);
    notify('Banner removed.');
  }

  async function saveSharedHero(e: FormEvent) {
    e.preventDefault();
    if (!heroSection) return;
    setBusy(true);
    await fetch(`/api/cms/homepage/${heroSection.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(heroShared),
    });
    await reloadCms();
    setBusy(false);
    notify('Shared hero stats and fallback text saved.');
  }

  return (
    <div className="space-y-6">
      <div className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#122B5C]">Rotating Hero Banners</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Active slides rotate automatically on the homepage hero.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewBanner}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0B1D40]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add banner</span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {cms.banners.map((b, idx) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-white p-3.5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <InstituteImage
                  src={b.image_url}
                  alt={b.title}
                  className="h-14 w-24 shrink-0 rounded-lg"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#122B5C]">{b.title}</p>
                  <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                    {b.description}
                  </p>
                  {b.deadline && (
                    <p className="mt-0.5 text-[11px] font-semibold text-[#0785D1] tabular-nums">
                      Deadline: {b.deadline}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveBanner(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] disabled:opacity-35"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBanner(idx, 1)}
                  disabled={idx === cms.banners.length - 1}
                  className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] disabled:opacity-35"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleBannerActive(b)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                    b.is_active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Inactive'}
                </button>
                <button
                  type="button"
                  onClick={() => openEditBanner(b)}
                  className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(b)}
                  className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {heroSection && (
        <form onSubmit={saveSharedHero} className="surface space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#122B5C]">
                Shared Hero Strip &amp; Stats
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Bottom hero stats strip and eyebrow/fallback text shown alongside active banners
              </p>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save hero details</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Eyebrow text"
              value={heroShared.eyebrow}
              onChange={(v) => setHeroShared((p) => ({ ...p, eyebrow: String(v) }))}
            />
            <AdminField
              label="Fallback headline"
              value={heroShared.title}
              onChange={(v) => setHeroShared((p) => ({ ...p, title: String(v) }))}
            />
          </div>
          <AdminField
            label="Sub-headline"
            value={heroShared.subtitle}
            onChange={(v) => setHeroShared((p) => ({ ...p, subtitle: String(v) }))}
          />

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#122B5C]">Hero Stats / Highlights</p>
              <button
                type="button"
                onClick={() =>
                  setHeroShared((p) => ({
                    ...p,
                    items: [...p.items, { value: '', label: '' }],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[#122B5C]"
              >
                <Plus className="h-3 w-3" />
                <span>Add stat</span>
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {heroShared.items.map((st, i) => (
                <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-2">
                  <AdminField
                    label="Value"
                    value={st.value || ''}
                    onChange={(v) =>
                      setHeroShared((p) => ({
                        ...p,
                        items: p.items.map((row, idx) =>
                          idx === i ? { ...row, value: String(v) } : row
                        ),
                      }))
                    }
                  />
                  <AdminField
                    label="Label"
                    value={st.label || ''}
                    onChange={(v) =>
                      setHeroShared((p) => ({
                        ...p,
                        items: p.items.map((row, idx) =>
                          idx === i ? { ...row, label: String(v) } : row
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setHeroShared((p) => ({
                        ...p,
                        items: p.items.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      <AdminModal
        open={modalOpen}
        title={editing ? 'Edit hero banner' : 'Add hero banner'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveBanner} className="space-y-4">
          <AdminField
            label="Headline"
            required
            value={bannerForm.title}
            onChange={(v) => setBannerForm((p) => ({ ...p, title: String(v) }))}
          />
          <AdminField
            label="Description"
            type="textarea"
            rows={2}
            value={bannerForm.description}
            onChange={(v) => setBannerForm((p) => ({ ...p, description: String(v) }))}
          />
          <AdminField
            label="Desktop background photo"
            type="image"
            value={bannerForm.image_url}
            onChange={(v) => setBannerForm((p) => ({ ...p, image_url: String(v) }))}
          />
          <AdminField
            label="Deadline text (optional)"
            placeholder="e.g. 30 April 2026"
            value={bannerForm.deadline}
            onChange={(v) => setBannerForm((p) => ({ ...p, deadline: String(v) }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Primary CTA label"
              value={bannerForm.primary_label}
              onChange={(v) => setBannerForm((p) => ({ ...p, primary_label: String(v) }))}
            />
            <AdminField
              label="Primary CTA link"
              value={bannerForm.primary_url}
              onChange={(v) => setBannerForm((p) => ({ ...p, primary_url: String(v) }))}
            />
            <AdminField
              label="Secondary CTA label"
              value={bannerForm.secondary_label}
              onChange={(v) => setBannerForm((p) => ({ ...p, secondary_label: String(v) }))}
            />
            <AdminField
              label="Secondary CTA link"
              value={bannerForm.secondary_url}
              onChange={(v) => setBannerForm((p) => ({ ...p, secondary_url: String(v) }))}
            />
          </div>
          <AdminField
            label="Active banner"
            type="switch"
            value={bannerForm.is_active}
            onChange={(v) => setBannerForm((p) => ({ ...p, is_active: Boolean(v) }))}
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
              {busy ? 'Saving...' : 'Save banner'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete hero banner"
        description={`Remove banner "${deleteTarget?.title}"?`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteBanner}
      />
    </div>
  );
}

export function AboutPageEditor() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const s = cms.siteSettings;
  const [form, setForm] = useState({
    about_heading: s.about_heading,
    about_intro: s.about_intro,
    about_mission: s.about_mission,
    about_story: s.about_story,
    about_highlights: (s.about_highlights || []) as AboutHighlight[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      about_heading: s.about_heading,
      about_intro: s.about_intro,
      about_mission: s.about_mission,
      about_story: s.about_story,
      about_highlights: (s.about_highlights || []).map((h) => ({ ...h })),
    });
  }, [s]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/cms/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    await reloadCms();
    setSaving(false);
    notify('About page content saved.');
  }

  return (
    <SettingsPageShell
      title="About Page Content"
      description="Update the heading, mission, story paragraphs, and key institute highlights."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <AdminField
          label="Hero heading"
          value={form.about_heading}
          onChange={(v) => setForm((p) => ({ ...p, about_heading: String(v) }))}
        />
        <AdminField
          label="Intro description"
          type="textarea"
          rows={3}
          value={form.about_intro}
          onChange={(v) => setForm((p) => ({ ...p, about_intro: String(v) }))}
        />
        <AdminField
          label="Our Mission"
          type="textarea"
          rows={4}
          value={form.about_mission}
          onChange={(v) => setForm((p) => ({ ...p, about_mission: String(v) }))}
        />
        <AdminField
          label="Our Story (separate paragraphs with a blank line)"
          type="textarea"
          rows={6}
          value={form.about_story}
          onChange={(v) => setForm((p) => ({ ...p, about_story: String(v) }))}
        />
      </div>

      <div className="surface space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#122B5C]">Key Highlights</h3>
          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                about_highlights: [...p.about_highlights, { value: '', label: '' }],
              }))
            }
            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[#122B5C]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add highlight</span>
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {form.about_highlights.map((h, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-2">
              <AdminField
                label="Value (e.g. 2009)"
                value={h.value}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    about_highlights: p.about_highlights.map((row, idx) =>
                      idx === i ? { ...row, value: String(v) } : row
                    ),
                  }))
                }
              />
              <AdminField
                label="Label"
                value={h.label}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    about_highlights: p.about_highlights.map((row, idx) =>
                      idx === i ? { ...row, label: String(v) } : row
                    ),
                  }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    about_highlights: p.about_highlights.filter((_, idx) => idx !== i),
                  }))
                }
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </SettingsPageShell>
  );
}

export function CoursesPageEditor() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const s = cms.siteSettings;
  const [form, setForm] = useState({
    courses_eyebrow: s.courses_eyebrow,
    courses_title: s.courses_title,
    courses_description: s.courses_description,
    courses_badge: s.courses_badge,
    courses_approach_eyebrow: s.courses_approach_eyebrow,
    courses_approach_title: s.courses_approach_title,
    courses_approach_description: s.courses_approach_description,
    courses_approach_steps: (s.courses_approach_steps || []) as ApproachStep[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      courses_eyebrow: s.courses_eyebrow,
      courses_title: s.courses_title,
      courses_description: s.courses_description,
      courses_badge: s.courses_badge,
      courses_approach_eyebrow: s.courses_approach_eyebrow,
      courses_approach_title: s.courses_approach_title,
      courses_approach_description: s.courses_approach_description,
      courses_approach_steps: (s.courses_approach_steps || []).map((st) => ({ ...st })),
    });
  }, [s]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/cms/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    await reloadCms();
    setSaving(false);
    notify('Courses page settings saved.');
  }

  return (
    <SettingsPageShell
      title="Courses Page Header & Academic Approach"
      description="Customize the Courses page hero copy and the 3-step academic teaching methodology."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Eyebrow"
            value={form.courses_eyebrow}
            onChange={(v) => setForm((p) => ({ ...p, courses_eyebrow: String(v) }))}
          />
          <AdminField
            label="Badge highlight"
            value={form.courses_badge}
            onChange={(v) => setForm((p) => ({ ...p, courses_badge: String(v) }))}
          />
        </div>
        <AdminField
          label="Page title"
          value={form.courses_title}
          onChange={(v) => setForm((p) => ({ ...p, courses_title: String(v) }))}
        />
        <AdminField
          label="Hero description"
          type="textarea"
          rows={3}
          value={form.courses_description}
          onChange={(v) => setForm((p) => ({ ...p, courses_description: String(v) }))}
        />
      </div>

      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Approach section eyebrow"
            value={form.courses_approach_eyebrow}
            onChange={(v) => setForm((p) => ({ ...p, courses_approach_eyebrow: String(v) }))}
          />
          <AdminField
            label="Approach section title"
            value={form.courses_approach_title}
            onChange={(v) => setForm((p) => ({ ...p, courses_approach_title: String(v) }))}
          />
        </div>
        <AdminField
          label="Approach section description"
          type="textarea"
          rows={2}
          value={form.courses_approach_description}
          onChange={(v) => setForm((p) => ({ ...p, courses_approach_description: String(v) }))}
        />

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-bold text-[#122B5C]">Methodology Steps</h3>
          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                courses_approach_steps: [
                  ...p.courses_approach_steps,
                  { title: '', description: '' },
                ],
              }))
            }
            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[#122B5C]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add step</span>
          </button>
        </div>

        <div className="space-y-3">
          {form.courses_approach_steps.map((st, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#122B5C] tabular-nums">
                  Step #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      courses_approach_steps: p.courses_approach_steps.filter(
                        (_, idx) => idx !== i
                      ),
                    }))
                  }
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <AdminField
                label="Title"
                value={st.title}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    courses_approach_steps: p.courses_approach_steps.map((row, idx) =>
                      idx === i ? { ...row, title: String(v) } : row
                    ),
                  }))
                }
              />
              <AdminField
                label="Description"
                type="textarea"
                rows={2}
                value={st.description}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    courses_approach_steps: p.courses_approach_steps.map((row, idx) =>
                      idx === i ? { ...row, description: String(v) } : row
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsPageShell>
  );
}

export function CampusFacilitiesEditor() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const campusSec = cms.homepageSections.find((s) => s.key === 'campus');
  const [form, setForm] = useState({
    eyebrow: campusSec?.eyebrow || '',
    title: campusSec?.title || '',
    subtitle: campusSec?.subtitle || '',
    body: campusSec?.body || '',
    items: (campusSec?.items || []) as HomepageSectionItem[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!campusSec) return;
    setForm({
      eyebrow: campusSec.eyebrow || '',
      title: campusSec.title || '',
      subtitle: campusSec.subtitle || '',
      body: campusSec.body || '',
      items: (campusSec.items || []).map((i) => ({ ...i })),
    });
  }, [campusSec]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!campusSec) return;
    setSaving(true);
    await fetch(`/api/cms/homepage/${campusSec.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    await reloadCms();
    setSaving(false);
    notify('Campus & Residential facilities updated.');
  }

  return (
    <SettingsPageShell
      title="Campus & Student Facilities"
      description="Edit the Residential Campus, Day-Care School, and commitment banner shared on Homepage & About page."
      onSave={onSave}
      saving={saving}
    >
      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Section eyebrow"
            value={form.eyebrow}
            onChange={(v) => setForm((p) => ({ ...p, eyebrow: String(v) }))}
          />
          <AdminField
            label="Section title"
            value={form.title}
            onChange={(v) => setForm((p) => ({ ...p, title: String(v) }))}
          />
        </div>
        <AdminField
          label="Subtitle"
          type="textarea"
          rows={2}
          value={form.subtitle}
          onChange={(v) => setForm((p) => ({ ...p, subtitle: String(v) }))}
        />
        <AdminField
          label="Bottom commitment banner text"
          type="textarea"
          rows={3}
          value={form.body}
          onChange={(v) => setForm((p) => ({ ...p, body: String(v) }))}
        />
      </div>

      <div className="surface space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#122B5C]">Campus Cards</h3>
          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                items: [
                  ...p.items,
                  { title: '', description: '', image_url: '', points: [] },
                ],
              }))
            }
            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[#122B5C]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add campus card</span>
          </button>
        </div>

        <div className="space-y-4">
          {form.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#122B5C]">Card #{i + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))
                  }
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <AdminField
                label="Facility title"
                value={item.title || ''}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    items: p.items.map((row, idx) =>
                      idx === i ? { ...row, title: String(v) } : row
                    ),
                  }))
                }
              />
              <AdminField
                label="Description"
                type="textarea"
                rows={2}
                value={item.description || ''}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    items: p.items.map((row, idx) =>
                      idx === i ? { ...row, description: String(v) } : row
                    ),
                  }))
                }
              />
              <AdminField
                label="Facility photo"
                type="image"
                value={item.image_url || ''}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    items: p.items.map((row, idx) =>
                      idx === i ? { ...row, image_url: String(v) } : row
                    ),
                  }))
                }
              />
              <AdminField
                label="Key bullet points (one per line)"
                type="textarea"
                rows={4}
                value={(item.points || []).join('\n')}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    items: p.items.map((row, idx) =>
                      idx === i
                        ? {
                            ...row,
                            points: String(v)
                              .split('\n')
                              .map((l) => l.trim())
                              .filter(Boolean),
                          }
                        : row
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsPageShell>
  );
}
