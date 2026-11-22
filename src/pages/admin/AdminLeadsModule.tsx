import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Eye, MessageSquarePlus, Pencil, Search, Trash2 } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import type { FollowUpNote } from '../../types/cms';
import { InstituteImage } from '../../components/BrandMark';
import { AdminField, AdminModal, ConfirmDeleteModal } from './AdminField';
import { useAdminToast } from './AdminLayout';

interface LeadsFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  options?: { label: string; value: string }[];
}

interface LeadsModuleConfig {
  endpoint: '/api/enquiries' | '/api/admissions' | '/api/payments';
  title: string;
  description: string;
  singular: string;
  statuses: string[];
  editableFields: LeadsFieldConfig[];
  detailFields: { key: string; label: string }[];
}

function LeadsManager({ config }: { config: LeadsModuleConfig }) {
  const { adminUser } = useCms();
  const { notify } = useAdminToast();
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, unknown>>({});
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(config.endpoint);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((row) => {
      if (statusFilter && String(row.status || '') !== statusFilter) return false;
      if (!q) return true;
      return JSON.stringify(row).toLowerCase().includes(q);
    });
  }, [items, query, statusFilter]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`${config.endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      if (viewing && viewing.id === id) {
        setViewing((prev) => (prev ? { ...prev, status } : prev));
      }
      notify(`Status updated to "${status.replace('_', ' ')}".`);
    }
  }

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!viewing || !noteText.trim()) return;
    setBusy(true);
    const prevNotes = Array.isArray(viewing.notes) ? (viewing.notes as FollowUpNote[]) : [];
    const nextNotes: FollowUpNote[] = [
      {
        text: noteText.trim(),
        author: adminUser?.email || 'Admin',
        created_at: new Date().toISOString(),
      },
      ...prevNotes,
    ];
    const res = await fetch(`${config.endpoint}/${viewing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: nextNotes }),
    });
    setBusy(false);
    if (res.ok) {
      setViewing((prev) => (prev ? { ...prev, notes: nextNotes } : prev));
      setItems((prev) =>
        prev.map((r) => (r.id === viewing.id ? { ...r, notes: nextNotes } : r))
      );
      setNoteText('');
      notify('Follow-up note added.');
    }
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    const res = await fetch(`${config.endpoint}/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDraft),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok && data.item) {
      setItems((prev) => prev.map((r) => (r.id === editing.id ? data.item : r)));
      setEditing(null);
      notify(`${config.singular} record updated.`);
    } else {
      notify(data.error || 'Could not update record.', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    await fetch(`${config.endpoint}/${deleting.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((r) => r.id !== deleting.id));
    setBusy(false);
    setDeleting(null);
    notify(`${config.singular} deleted.`);
  }

  return (
    <div className="space-y-5">
      <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-base font-bold text-[#122B5C]">{config.title}</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{config.description}</p>
        </div>
        <span className="text-xs font-bold text-[#122B5C] tabular-nums">
          Total: {items.length}
        </span>
      </div>

      {/* Filters */}
      <div className="surface grid gap-3 p-4 sm:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.title.toLowerCase()} by name, phone, course...`}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#122B5C]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-xs outline-none focus:border-[#122B5C]"
        >
          <option value="">All statuses</option>
          {config.statuses.map((st) => (
            <option key={st} value={st}>
              {st.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Card List + Desktop Table */}
      <div className="surface overflow-hidden">
        <div className="divide-y divide-[hsl(var(--border))] md:hidden">
          {loading ? (
            <p className="px-4 py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Loading records...
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              No {config.title.toLowerCase()} matching the filter.
            </p>
          ) : (
            filtered.map((row) => (
              <div key={String(row.id)} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#122B5C]">{String(row.student_name || '')}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#122B5C] tabular-nums">
                      {String(row.phone || '')}
                    </p>
                    {Boolean(row.reference) && (
                      <p className="font-mono text-[11px] text-[#0785D1] tabular-nums">
                        {String(row.reference)}
                      </p>
                    )}
                    {Boolean(row.amount) && (
                      <p className="text-xs font-semibold text-emerald-700 tabular-nums">
                        {String(row.amount)} · {String(row.method || '')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                    {new Date(String(row.created_at)).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {[row.class_level, row.course_name, row.application_reference]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <select
                    value={String(row.status)}
                    onChange={(e) => updateStatus(String(row.id), e.target.value)}
                    aria-label={`Status for ${String(row.student_name)}`}
                    className="rounded-lg border border-[hsl(var(--input))] bg-white px-2.5 py-1.5 text-xs font-semibold capitalize text-[#122B5C]"
                  >
                    {config.statuses.map((st) => (
                      <option key={st} value={st}>
                        {st.replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setViewing(row);
                        setNoteText('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(row);
                        setEditDraft({ ...row });
                      }}
                      aria-label="Edit record"
                      className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(row)}
                      aria-label="Delete record"
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-[hsl(var(--border))] bg-[#F4F7FC] text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="px-4 py-3">Student / Applicant</th>
                <th className="px-4 py-3">Contact &amp; Info</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                    Loading records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                    No {config.title.toLowerCase()} matching the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={String(row.id)} className="hover:bg-[#F4F7FC]/40">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#122B5C]">{String(row.student_name || '')}</p>
                      {Boolean(row.reference) && (
                        <p className="font-mono text-[11px] text-[#0785D1] tabular-nums">
                          {String(row.reference)}
                        </p>
                      )}
                      {Boolean(row.amount) && (
                        <p className="font-semibold text-emerald-700 tabular-nums">
                          {String(row.amount)} · {String(row.method || '')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      <p className="tabular-nums font-semibold text-[#122B5C]">
                        {String(row.phone || '')}
                      </p>
                      <p className="text-[11px]">
                        {[row.class_level, row.course_name, row.application_reference]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] tabular-nums">
                      {new Date(String(row.created_at)).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={String(row.status)}
                        onChange={(e) => updateStatus(String(row.id), e.target.value)}
                        aria-label={`Status for ${String(row.student_name)}`}
                        className="rounded-lg border border-[hsl(var(--input))] bg-white px-2.5 py-1 text-xs font-semibold capitalize text-[#122B5C]"
                      >
                        {config.statuses.map((st) => (
                          <option key={st} value={st}>
                            {st.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewing(row);
                            setNoteText('');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-[11px] font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(row);
                            setEditDraft({ ...row });
                          }}
                          aria-label="Edit record"
                          className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[#122B5C] hover:bg-[#F4F7FC]"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(row)}
                          aria-label="Delete record"
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details + Follow-Up Notes Modal */}
      <AdminModal
        open={Boolean(viewing)}
        title={`${config.singular} Details`}
        subtitle={viewing ? String(viewing.student_name || '') : undefined}
        onClose={() => setViewing(null)}
        maxWidth="max-w-xl"
      >
        {viewing && (
          <div className="space-y-5">
            <dl className="grid gap-3 rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/60 p-4 sm:grid-cols-2">
              {config.detailFields.map((df) => (
                <div key={df.key}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    {df.label}
                  </dt>
                  <dd className="mt-0.5 text-xs font-semibold text-[#122B5C]">
                    {String(viewing[df.key] || '—')}
                  </dd>
                </div>
              ))}
            </dl>

            {typeof viewing.proof_url === 'string' && viewing.proof_url && (
              <div>
                <p className="mb-1.5 text-xs font-bold text-[#122B5C]">Payment proof</p>
                <InstituteImage
                  src={viewing.proof_url}
                  alt="Payment proof"
                  fit="contain"
                  className="max-h-60 w-full rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]"
                />
              </div>
            )}

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#122B5C]">
                <MessageSquarePlus className="h-3.5 w-3.5 text-[#0785D1]" />
                <span>Staff follow-up notes</span>
              </h3>

              <form onSubmit={handleAddNote} className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add call log or follow-up note..."
                  className="flex-1 rounded-lg border border-[hsl(var(--input))] px-3 py-2 text-xs outline-none focus:border-[#122B5C]"
                />
                <button
                  type="submit"
                  disabled={busy || !noteText.trim()}
                  className="shrink-0 rounded-lg bg-[#122B5C] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  Add note
                </button>
              </form>

              <div className="mt-3 space-y-2">
                {Array.isArray(viewing.notes) && viewing.notes.length > 0 ? (
                  (viewing.notes as FollowUpNote[]).map((n, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[hsl(var(--border))] bg-white p-3 text-xs"
                    >
                      <p className="text-[#122B5C]">{n.text}</p>
                      <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                        {n.author} · {new Date(n.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    No follow-up notes recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal
        open={Boolean(editing)}
        title={`Edit ${config.singular}`}
        onClose={() => setEditing(null)}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {config.editableFields.map((f) => (
            <AdminField
              key={f.key}
              label={f.label}
              type={f.type || 'text'}
              options={f.options}
              value={(editDraft[f.key] as string) ?? ''}
              onChange={(v) => setEditDraft((prev) => ({ ...prev, [f.key]: v }))}
            />
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold text-[#122B5C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white"
            >
              {busy ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        title={`Delete ${config.singular.toLowerCase()}`}
        description={`Delete record for "${String(deleting?.student_name || '')}"?`}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function EnquiriesAdminPage() {
  return (
    <LeadsManager
      config={{
        endpoint: '/api/enquiries',
        title: 'Enquiries',
        description: 'Manage parent & student enquiries submitted via homepage, contact page, and popup.',
        singular: 'Enquiry',
        statuses: ['new', 'contacted', 'follow_up', 'interested', 'admitted', 'closed'],
        editableFields: [
          { key: 'student_name', label: 'Student name' },
          { key: 'parent_name', label: 'Parent name' },
          { key: 'phone', label: 'Phone number' },
          { key: 'email', label: 'Email' },
          { key: 'class_level', label: 'Class' },
          { key: 'course_name', label: 'Course interest' },
          { key: 'preferred_batch', label: 'Preferred batch' },
          { key: 'message', label: 'Message', type: 'textarea' },
        ],
        detailFields: [
          { key: 'student_name', label: 'Student name' },
          { key: 'parent_name', label: 'Parent name' },
          { key: 'phone', label: 'Mobile number' },
          { key: 'email', label: 'Email' },
          { key: 'class_level', label: 'Class' },
          { key: 'course_name', label: 'Course' },
          { key: 'preferred_batch', label: 'Batch' },
          { key: 'source', label: 'Source' },
          { key: 'message', label: 'Message / Query' },
        ],
      }}
    />
  );
}

export function AdmissionsAdminPage() {
  return (
    <LeadsManager
      config={{
        endpoint: '/api/admissions',
        title: 'Admissions',
        description: 'Review formal admission applications, update statuses and record counselling notes.',
        singular: 'Application',
        statuses: ['pending', 'under_review', 'approved', 'rejected', 'enrolled'],
        editableFields: [
          { key: 'student_name', label: 'Student name' },
          { key: 'parent_name', label: 'Parent name' },
          { key: 'phone', label: 'Phone number' },
          { key: 'email', label: 'Email' },
          { key: 'class_level', label: 'Class' },
          { key: 'course_name', label: 'Course interest' },
          { key: 'preferred_batch', label: 'Preferred batch' },
          { key: 'school', label: 'Current school' },
          { key: 'address', label: 'Address', type: 'textarea' },
          { key: 'message', label: 'Notes / Message', type: 'textarea' },
        ],
        detailFields: [
          { key: 'reference', label: 'Reference' },
          { key: 'student_name', label: 'Student name' },
          { key: 'parent_name', label: 'Parent name' },
          { key: 'phone', label: 'Mobile number' },
          { key: 'email', label: 'Email' },
          { key: 'class_level', label: 'Class' },
          { key: 'course_name', label: 'Course' },
          { key: 'preferred_batch', label: 'Preferred batch' },
          { key: 'school', label: 'School' },
          { key: 'address', label: 'Residential address' },
          { key: 'message', label: 'Additional details' },
        ],
      }}
    />
  );
}

export function PaymentsAdminPage() {
  return (
    <LeadsManager
      config={{
        endpoint: '/api/payments',
        title: 'Payments',
        description: 'Verify manual UPI / bank fee receipts submitted by families.',
        singular: 'Payment',
        statuses: ['pending', 'verified', 'rejected'],
        editableFields: [
          { key: 'student_name', label: 'Student name' },
          { key: 'phone', label: 'Phone number' },
          { key: 'application_reference', label: 'Application ref' },
          { key: 'amount', label: 'Amount paid' },
          { key: 'method', label: 'Method' },
          { key: 'reference_note', label: 'UTR / Transaction ID' },
        ],
        detailFields: [
          { key: 'student_name', label: 'Student name' },
          { key: 'phone', label: 'Mobile number' },
          { key: 'application_reference', label: 'Application ref' },
          { key: 'amount', label: 'Amount' },
          { key: 'method', label: 'Payment method' },
          { key: 'reference_note', label: 'Transaction reference' },
        ],
      }}
    />
  );
}
