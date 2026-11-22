import { useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import type { CmsBundle } from '../../types/cms';
import { InstituteImage } from '../../components/BrandMark';
import { AdminField, AdminModal, ConfirmDeleteModal, type FieldOption } from './AdminField';
import { useAdminToast } from './AdminLayout';

type ModuleKey = 'courses' | 'exams' | 'lectures' | 'results' | 'faculty' | 'testimonials' | 'blogs';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'switch' | 'image' | 'file';
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  options?: FieldOption[];
  isLinesArray?: boolean;
  defaultValue?: string | number | boolean;
}

interface ModuleConfig {
  entity: ModuleKey;
  singular: string;
  plural: string;
  description: string;
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  filterKey?: string;
  fields: FieldDef[];
}

const MODULE_CONFIGS: Record<ModuleKey, ModuleConfig> = {
  courses: {
    entity: 'courses',
    singular: 'Course',
    plural: 'Courses',
    description: 'Manage batches, syllabus highlights, eligibility, methodology, fees and admission status.',
    titleKey: 'name',
    subtitleKey: 'category',
    imageKey: 'image_url',
    filterKey: 'admission_status',
    fields: [
      { key: 'name', label: 'Course name', type: 'text', required: true },
      { key: 'slug', label: 'URL slug (auto if blank)', type: 'text' },
      { key: 'category', label: 'Category (e.g. Foundation, IIT-JEE, NEET)', type: 'text' },
      { key: 'class_level', label: 'Class / Target students', type: 'text' },
      { key: 'subjects', label: 'Subjects', type: 'text' },
      { key: 'target_exams', label: 'Target exams', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'text' },
      { key: 'batch_info', label: 'Batch timings / schedule', type: 'text' },
      { key: 'fee', label: 'Fee note', type: 'text' },
      {
        key: 'admission_status',
        label: 'Admission status',
        type: 'select',
        defaultValue: 'open',
        options: [
          { label: 'Admissions open', value: 'open' },
          { label: 'Closing soon', value: 'closing_soon' },
          { label: 'Closed', value: 'closed' },
        ],
      },
      { key: 'image_url', label: 'Course cover image', type: 'image' },
      { key: 'description', label: 'Course description', type: 'textarea', rows: 3 },
      {
        key: 'highlights',
        label: 'Key highlights (one per line)',
        type: 'textarea',
        rows: 4,
        isLinesArray: true,
      },
      {
        key: 'eligibility',
        label: 'Eligibility points (one per line)',
        type: 'textarea',
        rows: 3,
        isLinesArray: true,
      },
      {
        key: 'exam_preparation',
        label: 'Exam preparation coverage (one per line)',
        type: 'textarea',
        rows: 3,
        isLinesArray: true,
      },
      {
        key: 'methodology',
        label: 'Teaching methodology (one per line)',
        type: 'textarea',
        rows: 3,
        isLinesArray: true,
      },
      { key: 'display_order', label: 'Display order', type: 'number', defaultValue: 0 },
      { key: 'is_featured', label: 'Featured course', type: 'switch', defaultValue: true },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
  exams: {
    entity: 'exams',
    singular: 'Exam',
    plural: 'Exams',
    description: 'Schedule scholarship exams (GPAT), aptitude tests, timings and registration links.',
    titleKey: 'title',
    subtitleKey: 'course_category',
    filterKey: 'status',
    fields: [
      { key: 'title', label: 'Exam title', type: 'text', required: true },
      { key: 'class_level', label: 'Eligible classes', type: 'text' },
      { key: 'course_category', label: 'Exam category / test series', type: 'text' },
      { key: 'exam_date', label: 'Exam date', type: 'date' },
      { key: 'start_time', label: 'Start time', type: 'text', placeholder: '10:00 AM' },
      { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number', defaultValue: 90 },
      {
        key: 'status',
        label: 'Exam status',
        type: 'select',
        defaultValue: 'upcoming',
        options: [
          { label: 'Upcoming', value: 'upcoming' },
          { label: 'Registration open', value: 'open' },
          { label: 'Closed', value: 'closed' },
          { label: 'Completed', value: 'completed' },
        ],
      },
      { key: 'registration_url', label: 'Registration / Portal URL', type: 'text' },
      { key: 'instructions', label: 'Syllabus & exam instructions', type: 'textarea', rows: 4 },
      { key: 'display_order', label: 'Display order', type: 'number', defaultValue: 0 },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
  lectures: {
    entity: 'lectures',
    singular: 'Lecture',
    plural: 'Lectures',
    description: 'Publish recorded video lectures (YouTube/Vimeo/MP4) with custom thumbnails.',
    titleKey: 'title',
    subtitleKey: 'subject',
    imageKey: 'thumbnail_url',
    filterKey: 'subject',
    fields: [
      { key: 'title', label: 'Lecture title', type: 'text', required: true },
      { key: 'subject', label: 'Subject', type: 'text' },
      { key: 'class_level', label: 'Class level', type: 'text' },
      { key: 'duration_label', label: 'Duration label (e.g. 42 min)', type: 'text' },
      { key: 'video_url', label: 'Video URL (YouTube / Vimeo / direct)', type: 'text' },
      { key: 'thumbnail_url', label: 'Thumbnail image', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { key: 'display_order', label: 'Display order', type: 'number', defaultValue: 0 },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
  results: {
    entity: 'results',
    singular: 'Result',
    plural: 'Results',
    description: 'Publish verified student achievements, ranks, posters and scorecards.',
    titleKey: 'student_name',
    subtitleKey: 'achievement_title',
    imageKey: 'photo_url',
    filterKey: 'academic_year',
    fields: [
      { key: 'student_name', label: 'Student name', type: 'text', required: true },
      { key: 'achievement_title', label: 'Achievement / Rank title', type: 'text', required: true },
      { key: 'class_level', label: 'Program / Class', type: 'text' },
      { key: 'score', label: 'Score / Rank', type: 'text' },
      { key: 'academic_year', label: 'Academic year', type: 'text' },
      { key: 'photo_url', label: 'Student photo / Poster', type: 'image' },
      { key: 'document_url', label: 'Result PDF / Scorecard', type: 'file' },
      { key: 'display_order', label: 'Display order', type: 'number', defaultValue: 0 },
      { key: 'is_featured', label: 'Featured on homepage', type: 'switch', defaultValue: true },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
  faculty: {
    entity: 'faculty',
    singular: 'Faculty member',
    plural: 'Faculty',
    description: 'Manage faculty mentors, qualifications, experience, and subject expertise.',
    titleKey: 'name',
    subtitleKey: 'role',
    imageKey: 'photo_url',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true },
      { key: 'role', label: 'Role / Designation', type: 'text' },
      { key: 'subjects', label: 'Subjects taught', type: 'text' },
      { key: 'qualification', label: 'Qualification', type: 'text' },
      { key: 'experience', label: 'Teaching experience', type: 'text' },
      { key: 'photo_url', label: 'Portrait photo', type: 'image' },
      { key: 'description', label: 'Bio & teaching focus', type: 'textarea', rows: 4 },
      { key: 'display_order', label: 'Display order', type: 'number', defaultValue: 0 },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
  testimonials: {
    entity: 'testimonials',
    singular: 'Testimonial',
    plural: 'Testimonials',
    description: 'Publish parent and student testimonials with star ratings.',
    titleKey: 'display_name',
    subtitleKey: 'program',
    imageKey: 'photo_url',
    fields: [
      { key: 'display_name', label: 'Student / Parent name', type: 'text', required: true },
      { key: 'program', label: 'Program / Batch', type: 'text' },
      { key: 'rating', label: 'Rating (1–5)', type: 'number', defaultValue: 5 },
      { key: 'photo_url', label: 'Optional avatar photo', type: 'image' },
      { key: 'quote', label: 'Testimonial quote', type: 'textarea', rows: 4, required: true },
      { key: 'display_order', label: 'Display order', type: 'number', defaultValue: 0 },
      { key: 'is_featured', label: 'Featured on homepage', type: 'switch', defaultValue: true },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
  blogs: {
    entity: 'blogs',
    singular: 'Article',
    plural: 'Blogs & Articles',
    description: 'Publish institute notices, preparation guides, and announcements.',
    titleKey: 'title',
    subtitleKey: 'category',
    imageKey: 'featured_image_url',
    filterKey: 'category',
    fields: [
      { key: 'title', label: 'Article headline', type: 'text', required: true },
      { key: 'slug', label: 'URL slug (auto if blank)', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'published_date', label: 'Published date', type: 'date' },
      { key: 'author', label: 'Author name', type: 'text' },
      { key: 'featured_image_url', label: 'Featured image', type: 'image' },
      { key: 'excerpt', label: 'Short summary', type: 'textarea', rows: 2 },
      {
        key: 'content',
        label: 'Full article body (use "## " for subheadings, blank line between paragraphs)',
        type: 'textarea',
        rows: 8,
      },
      { key: 'seo_title', label: 'Optional SEO title', type: 'text' },
      { key: 'seo_description', label: 'Optional SEO description', type: 'textarea', rows: 2 },
      { key: 'is_published', label: 'Published on website', type: 'switch', defaultValue: true },
    ],
  },
};

function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminCrudModule() {
  const { module } = useParams();
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const config = MODULE_CONFIGS[(module as ModuleKey) || 'courses'];

  const [query, setQuery] = useState('');
  const [filterVal, setFilterVal] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'title'>('order');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, unknown>>({});
  const [deleteItem, setDeleteItem] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);

  const rawItems = useMemo(() => {
    if (!config) return [];
    return (cms[config.entity as keyof CmsBundle] as unknown as Array<Record<string, unknown>>) || [];
  }, [cms, config]);

  const filterChoices = useMemo(() => {
    if (!config?.filterKey) return [];
    return [...new Set(rawItems.map((r) => String(r[config.filterKey!] || '')).filter(Boolean))];
  }, [rawItems, config]);

  const filtered = useMemo(() => {
    if (!config) return [];
    const q = query.trim().toLowerCase();
    const list = rawItems.filter((item) => {
      if (filterVal && config.filterKey && String(item[config.filterKey] || '') !== filterVal) {
        return false;
      }
      if (!q) return true;
      return JSON.stringify(item).toLowerCase().includes(q);
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'title') {
        return String(a[config.titleKey] || '').localeCompare(String(b[config.titleKey] || ''));
      }
      return Number(a.display_order ?? 0) - Number(b.display_order ?? 0);
    });
  }, [rawItems, config, filterVal, query, sortBy]);

  if (!config) {
    return (
      <div className="surface p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Unknown admin module.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function openCreate() {
    const initial: Record<string, unknown> = {};
    for (const f of config.fields) {
      if (f.isLinesArray) {
        initial[f.key] = '';
      } else if (f.defaultValue !== undefined) {
        initial[f.key] = f.defaultValue;
      } else if (f.key === 'display_order') {
        initial[f.key] = rawItems.length;
      } else if (f.key === 'published_date') {
        initial[f.key] = new Date().toISOString().slice(0, 10);
      } else {
        initial[f.key] = f.type === 'number' ? 0 : f.type === 'switch' ? true : '';
      }
    }
    setEditingId(null);
    setFormState(initial);
    setModalOpen(true);
  }

  function openEdit(item: Record<string, unknown>) {
    const draft: Record<string, unknown> = { ...item };
    for (const f of config.fields) {
      if (f.isLinesArray) {
        const val = item[f.key];
        draft[f.key] = Array.isArray(val) ? val.join('\n') : String(val || '');
      }
    }
    setEditingId(String(item.id));
    setFormState(draft);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    for (const f of config.fields) {
      if (f.required && !String(formState[f.key] || '').trim()) {
        notify(`${f.label} is required.`, 'error');
        return;
      }
    }

    const payload: Record<string, unknown> = { ...formState };
    for (const f of config.fields) {
      if (f.isLinesArray) {
        payload[f.key] = String(formState[f.key] || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
      }
    }

    if ('slug' in payload && !String(payload.slug || '').trim()) {
      const titleVal = String(payload[config.titleKey] || '');
      payload.slug = makeSlug(titleVal) || `${config.entity}-${Date.now()}`;
    }

    setBusy(true);
    try {
      const res = await fetch(
        editingId
          ? `/api/cms/entities/${config.entity}/${editingId}`
          : `/api/cms/entities/${config.entity}`,
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Could not save ${config.singular}.`);
      await reloadCms();
      setModalOpen(false);
      notify(editingId ? `${config.singular} updated.` : `${config.singular} created.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(item: Record<string, unknown>) {
    const nextVal = item.is_published === false;
    await fetch(`/api/cms/entities/${config.entity}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: nextVal }),
    });
    await reloadCms();
    notify(`${config.singular} ${nextVal ? 'published' : 'hidden'}.`);
  }

  async function handleConfirmDelete() {
    if (!deleteItem) return;
    setBusy(true);
    await fetch(`/api/cms/entities/${config.entity}/${deleteItem.id}`, { method: 'DELETE' });
    await reloadCms();
    setBusy(false);
    setDeleteItem(null);
    notify(`${config.singular} deleted.`);
  }

  return (
    <div className="space-y-5">
      <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-base font-bold text-[#122B5C]">{config.plural}</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{config.description}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B1D40]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New {config.singular.toLowerCase()}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="surface grid gap-3 p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${config.plural.toLowerCase()}...`}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#122B5C]"
          />
        </div>

        {config.filterKey ? (
          <select
            value={filterVal}
            onChange={(e) => {
              setFilterVal(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-xs outline-none focus:border-[#122B5C]"
          >
            <option value="">All filters</option>
            {filterChoices.map((choice) => (
              <option key={choice} value={choice}>
                {choice.replace('_', ' ')}
              </option>
            ))}
          </select>
        ) : (
          <div />
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'order' | 'title')}
          className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-xs outline-none focus:border-[#122B5C]"
        >
          <option value="order">Sort by display order</option>
          <option value="title">Sort alphabetically</option>
        </select>
      </div>

      {/* Mobile Card List + Desktop Table */}
      <div className="surface overflow-hidden">
        <div className="divide-y divide-[hsl(var(--border))] md:hidden">
          {paged.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
              No matching records found.
            </p>
          ) : (
            paged.map((item) => {
              const title = String(item[config.titleKey] || 'Untitled');
              const sub = config.subtitleKey ? String(item[config.subtitleKey] || '') : '';
              const img = config.imageKey ? String(item[config.imageKey] || '') : '';
              const published = item.is_published !== false;
              return (
                <div key={String(item.id)} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    {img && (
                      <InstituteImage
                        src={img}
                        alt={title}
                        className="h-12 w-16 shrink-0 rounded-md"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#122B5C]">{title}</p>
                      {sub && (
                        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                          {sub}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        Order {item.display_order !== undefined ? String(item.display_order) : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => togglePublish(item)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                        published
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {published ? 'Published' : 'Hidden'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteItem(item)}
                        aria-label={`Delete ${title}`}
                        className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-[hsl(var(--border))] bg-[#F4F7FC] text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="px-4 py-3">{config.singular}</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-xs text-[hsl(var(--muted-foreground))]"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paged.map((item) => {
                  const title = String(item[config.titleKey] || 'Untitled');
                  const sub = config.subtitleKey ? String(item[config.subtitleKey] || '') : '';
                  const img = config.imageKey ? String(item[config.imageKey] || '') : '';
                  const published = item.is_published !== false;
                  return (
                    <tr key={String(item.id)} className="hover:bg-[#F4F7FC]/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img && (
                            <InstituteImage
                              src={img}
                              alt={title}
                              className="h-10 w-14 shrink-0 rounded-md"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-[#122B5C]">{title}</p>
                            {sub && (
                              <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                                {sub}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {config.entity === 'courses' && (
                          <span className="capitalize">
                            {String(item.class_level || '')} ·{' '}
                            {String(item.admission_status || 'open').replace('_', ' ')}
                          </span>
                        )}
                        {config.entity === 'exams' && (
                          <span className="tabular-nums capitalize">
                            {String(item.exam_date || '')} · {String(item.status || 'upcoming')}
                          </span>
                        )}
                        {config.entity === 'lectures' && (
                          <span className="tabular-nums">
                            {String(item.class_level || '')} · {String(item.duration_label || '')}
                          </span>
                        )}
                        {config.entity === 'results' && (
                          <span className="tabular-nums">
                            {String(item.score || '')} · {String(item.academic_year || '')}
                          </span>
                        )}
                        {config.entity === 'faculty' && (
                          <span>
                            {String(item.subjects || '')} · {String(item.experience || '')}
                          </span>
                        )}
                        {config.entity === 'testimonials' && (
                          <span className="tabular-nums">
                            Rating {String(item.rating || 5)}/5
                          </span>
                        )}
                        {config.entity === 'blogs' && (
                          <span className="tabular-nums">
                            {String(item.published_date || '')} · {String(item.author || '')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[hsl(var(--muted-foreground))] tabular-nums">
                        {item.display_order !== undefined ? String(item.display_order) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => togglePublish(item)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                            published
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]'
                          }`}
                        >
                          {published ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-[11px] font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteItem(item)}
                            aria-label={`Delete ${title}`}
                            className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--border))] px-4 py-3 text-xs">
            <span className="text-[hsl(var(--muted-foreground))] tabular-nums">
              Page {safePage} of {totalPages} ({filtered.length} records)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[hsl(var(--border))] px-3 py-1 font-semibold text-[#122B5C] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[hsl(var(--border))] px-3 py-1 font-semibold text-[#122B5C] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        title={editingId ? `Edit ${config.singular}` : `New ${config.singular}`}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((f) => (
            <AdminField
              key={f.key}
              id={`crud_${f.key}`}
              label={f.label}
              type={f.type}
              required={f.required}
              placeholder={f.placeholder}
              rows={f.rows}
              options={f.options}
              value={(formState[f.key] as string | number | boolean) ?? ''}
              onChange={(v) => setFormState((prev) => ({ ...prev, [f.key]: v }))}
            />
          ))}

          <div className="flex justify-end gap-2.5 border-t border-[hsl(var(--border))] pt-4">
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
              {busy ? 'Saving...' : `Save ${config.singular.toLowerCase()}`}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={Boolean(deleteItem)}
        title={`Delete ${config.singular.toLowerCase()}`}
        description={`Are you sure you want to delete "${String(
          deleteItem?.[config.titleKey] || ''
        )}"? This action cannot be undone.`}
        busy={busy}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
