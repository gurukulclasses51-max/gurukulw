import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { FileText, FolderOpen, Loader2, Trash2, Upload, X } from 'lucide-react';
import { InstituteImage } from '../../components/BrandMark';
import { uploadMediaFile } from '../../utils/imageUpload';

export const adminInputCls =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15';

export interface FieldOption {
  label: string;
  value: string;
}

interface MediaAssetOption {
  id: string;
  label: string;
  file_url: string;
  contentType: string;
  source: string;
}

export interface AdminFieldProps {
  id?: string;
  label: string;
  hint?: string;
  required?: boolean;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'time'
    | 'textarea'
    | 'select'
    | 'switch'
    | 'color'
    | 'image'
    | 'file';
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  placeholder?: string;
  rows?: number;
  options?: FieldOption[];
  disabled?: boolean;
}

export function AdminField({
  id,
  label,
  hint,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
  rows = 3,
  options = [],
  disabled = false,
}: AdminFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetOption[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  async function openPicker() {
    setPickerOpen(true);
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/cms/media');
      const data = await res.json();
      setMediaAssets(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoadingMedia(false);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const fileUrl = await uploadMediaFile(file);
      onChange(fileUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  if (type === 'switch') {
    const checked = Boolean(value);
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#122B5C]">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
            checked ? 'bg-[#122B5C]' : 'bg-slate-300'
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    );
  }

  if (type === 'image' || type === 'file') {
    const strVal = String(value || '');
    const isPdf = strVal.toLowerCase().endsWith('.pdf');
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#122B5C]">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC]/50 p-3">
          <div className="flex flex-wrap items-center gap-3">
            {strVal ? (
              <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white">
                {isPdf ? (
                  <div className="flex flex-col items-center text-[#122B5C]">
                    <FileText className="h-5 w-5 text-[#0785D1]" />
                    <span className="text-[10px] font-bold">PDF</span>
                  </div>
                ) : (
                  <InstituteImage
                    src={strVal}
                    alt={label}
                    fit="contain"
                    className="h-full w-full"
                  />
                )}
              </div>
            ) : (
              <div className="grid h-16 w-24 shrink-0 place-items-center rounded-lg border border-dashed border-[hsl(var(--border))] bg-white text-[11px] text-[hsl(var(--muted-foreground))]">
                {type === 'file' ? 'No file' : 'No image'}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]">
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {uploading
                      ? 'Uploading...'
                      : type === 'file'
                        ? 'Upload PDF / image'
                        : 'Upload image'}
                  </span>
                  <input
                    type="file"
                    accept={type === 'file' ? 'image/*,application/pdf' : 'image/*'}
                    onChange={handleFileChange}
                    disabled={disabled || uploading}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={openPicker}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-[#0785D1]" />
                  <span>Choose from storage</span>
                </button>

                {strVal && (
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <input
                id={id}
                type="text"
                className={adminInputCls}
                value={strVal}
                placeholder={placeholder || 'Or paste URL (/uploads/... or https://...)'}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          {uploadError && <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>}
          {hint && !uploadError && (
            <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
          )}
        </div>

        <AdminModal
          open={pickerOpen}
          title="Choose asset from website storage"
          subtitle="Select any uploaded file or built-in photo to link directly."
          onClose={() => setPickerOpen(false)}
          maxWidth="max-w-3xl"
        >
          {loadingMedia ? (
            <p className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Loading website storage...
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {mediaAssets
                .filter((a) =>
                  type === 'image' ? a.contentType !== 'application/pdf' : true
                )
                .map((asset) => {
                  const assetPdf =
                    asset.contentType === 'application/pdf' ||
                    asset.file_url.endsWith('.pdf');
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onChange(asset.file_url);
                        setPickerOpen(false);
                      }}
                      className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white text-left transition hover:border-[#122B5C]"
                    >
                      <div className="h-28 bg-[#F4F7FC]">
                        {assetPdf ? (
                          <div className="flex h-full items-center justify-center text-[#0785D1]">
                            <FileText className="h-8 w-8" />
                          </div>
                        ) : (
                          <InstituteImage
                            src={asset.file_url}
                            alt={asset.label}
                            fit="contain"
                            className="h-full w-full"
                          />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="truncate text-xs font-bold text-[#122B5C]">{asset.label}</p>
                        <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
                          {asset.source}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </AdminModal>
      </div>
    );
  }

  if (type === 'color') {
    const strVal = String(value || '#122B5C');
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-semibold text-[#122B5C]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(strVal) ? strVal : '#122B5C'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label={`${label} color picker`}
            className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-[hsl(var(--input))] bg-white p-0.5"
          />
          <input
            id={id}
            type="text"
            className={`${adminInputCls} font-mono uppercase`}
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        {hint && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-[#122B5C]">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          className={adminInputCls}
          value={String(value ?? '')}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          className={adminInputCls}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className={adminInputCls}
          value={value === undefined || value === null ? '' : String(value)}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(type === 'number' ? Number(e.target.value || 0) : e.target.value)
          }
          disabled={disabled}
        />
      )}

      {hint && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
    </div>
  );
}

export function AdminModal({
  open,
  title,
  subtitle,
  onClose,
  maxWidth = 'max-w-2xl',
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidth?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-2.5 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))] px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#122B5C] sm:text-lg">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[#F4F7FC] hover:text-[#122B5C]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({
  open,
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal open={open} title={title} onClose={onCancel} maxWidth="max-w-md">
      <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{description}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {busy ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </AdminModal>
  );
}
