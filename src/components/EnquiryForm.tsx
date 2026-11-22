import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { BATCH_PREFERENCES, CLASS_LEVELS } from '../data/cmsDefaults';

interface EnquiryFormProps {
  source?: string;
  courseName?: string;
  submitLabel?: string;
  dense?: boolean;
  showParentName?: boolean;
  showEmail?: boolean;
  showClass?: boolean;
  showCourse?: boolean;
  showBatch?: boolean;
  showMessage?: boolean;
  onSuccess?: () => void;
}

const inputCls =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15';

function validPhone(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

function validEmail(v: string) {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function EnquiryForm({
  source = 'website',
  courseName = '',
  submitLabel = 'Submit enquiry',
  dense = false,
  showParentName = true,
  showEmail = true,
  showClass = true,
  showCourse = true,
  showBatch = true,
  showMessage = true,
  onSuccess,
}: EnquiryFormProps) {
  const { cms } = useCms();
  const courses = cms.courses.filter((c) => c.is_published !== false);

  const [form, setForm] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    email: '',
    class_level: '',
    course_name: courseName,
    preferred_batch: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.student_name.trim()) {
      nextErrors.student_name = "Please enter the student's name.";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'Please enter a mobile number.';
    } else if (!validPhone(form.phone)) {
      nextErrors.phone = 'Enter a valid mobile number (10–13 digits).';
    }
    if (showEmail && !validEmail(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('saving');
    setServerError('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not save your enquiry.');
      }
      setStatus('done');
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error
          ? err.message
          : 'We could not save your enquiry just now. Please call the institute directly.'
      );
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-700" />
        <h3 className="mt-3 text-lg font-bold text-emerald-950">Enquiry received</h3>
        <p className="mt-1 text-sm text-emerald-800">
          Thank you. Your details have been saved and our admissions team will contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setForm({
              student_name: '',
              parent_name: '',
              phone: '',
              email: '',
              class_level: '',
              course_name: courseName,
              preferred_batch: '',
              message: '',
            });
          }}
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={dense ? 'space-y-3' : 'space-y-4'} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`enq_student_${source}`} className="mb-1 block text-xs font-semibold">
            Student name <span className="text-red-600">*</span>
          </label>
          <input
            id={`enq_student_${source}`}
            className={inputCls}
            value={form.student_name}
            onChange={update('student_name')}
            placeholder="Full name"
            autoComplete="name"
          />
          {errors.student_name && (
            <p className="mt-1 text-xs text-red-600">{errors.student_name}</p>
          )}
        </div>

        {showParentName && (
          <div>
            <label htmlFor={`enq_parent_${source}`} className="mb-1 block text-xs font-semibold">
              Parent name
            </label>
            <input
              id={`enq_parent_${source}`}
              className={inputCls}
              value={form.parent_name}
              onChange={update('parent_name')}
              placeholder="Parent or guardian"
            />
          </div>
        )}

        <div>
          <label htmlFor={`enq_phone_${source}`} className="mb-1 block text-xs font-semibold">
            Mobile number <span className="text-red-600">*</span>
          </label>
          <input
            id={`enq_phone_${source}`}
            type="tel"
            inputMode="tel"
            className={inputCls}
            value={form.phone}
            onChange={update('phone')}
            placeholder="+91 98609 68994"
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {showEmail && (
          <div>
            <label htmlFor={`enq_email_${source}`} className="mb-1 block text-xs font-semibold">
              Email address
            </label>
            <input
              id={`enq_email_${source}`}
              type="email"
              className={inputCls}
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        )}

        {showClass && (
          <div>
            <label htmlFor={`enq_class_${source}`} className="mb-1 block text-xs font-semibold">
              Class
            </label>
            <select
              id={`enq_class_${source}`}
              className={inputCls}
              value={form.class_level}
              onChange={update('class_level')}
            >
              <option value="">Select class</option>
              {CLASS_LEVELS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        )}

        {showCourse && (
          <div>
            <label htmlFor={`enq_course_${source}`} className="mb-1 block text-xs font-semibold">
              Course of interest
            </label>
            <select
              id={`enq_course_${source}`}
              className={inputCls}
              value={form.course_name}
              onChange={update('course_name')}
            >
              <option value="">Not sure yet</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showBatch && (
          <div className={showCourse ? 'sm:col-span-2' : ''}>
            <label htmlFor={`enq_batch_${source}`} className="mb-1 block text-xs font-semibold">
              Preferred batch
            </label>
            <select
              id={`enq_batch_${source}`}
              className={inputCls}
              value={form.preferred_batch}
              onChange={update('preferred_batch')}
            >
              <option value="">Any batch</option>
              {BATCH_PREFERENCES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showMessage && (
        <div>
          <label htmlFor={`enq_msg_${source}`} className="mb-1 block text-xs font-semibold">
            Message
          </label>
          <textarea
            id={`enq_msg_${source}`}
            rows={dense ? 2 : 3}
            className={inputCls}
            value={form.message}
            onChange={update('message')}
            placeholder="Anything you would like us to know?"
          />
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-3 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211] disabled:opacity-60"
      >
        {status === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{status === 'saving' ? 'Saving...' : submitLabel}</span>
      </button>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Your details are visible only to authorised institute staff.
      </p>
    </form>
  );
}

export function CourseEnquiryModal({
  courseName,
  open,
  onClose,
}: {
  courseName: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/70 p-3 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-enquiry-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#122B5C] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FFBE1B]">
              Course Enquiry
            </p>
            <h2 id="course-enquiry-modal-title" className="mt-1 text-lg font-bold">
              {courseName}
            </h2>
            <p className="mt-1 text-xs text-white/75">
              Share your details and our admissions team will call with batch timings and fee structure.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-white/75 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <EnquiryForm
            source={`course-enquiry:${courseName}`}
            courseName={courseName}
            submitLabel="Submit enquiry"
            dense
          />
        </div>
      </div>
    </div>
  );
}
