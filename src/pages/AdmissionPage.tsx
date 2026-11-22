import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Loader2,
  Phone,
  Upload,
  Users,
} from 'lucide-react';
import { BATCH_PREFERENCES, CLASS_LEVELS } from '../data/cmsDefaults';
import { useCms } from '../context/CmsContext';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';
import { uploadImageFile } from '../utils/imageUpload';

const inputCls =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15';

const STEPS = [
  {
    icon: FileText,
    title: 'Submit the application',
    text: 'Fill the form on this page. You receive a reference number immediately.',
  },
  {
    icon: Phone,
    title: 'Counselling call',
    text: "Our team calls to understand the student's class, subjects and current performance.",
  },
  {
    icon: Users,
    title: 'Visit and interaction',
    text: 'Visit the institute, meet the subject teacher and review the batch schedule.',
  },
  {
    icon: ClipboardCheck,
    title: 'Confirm the seat',
    text: 'Fee and documents are completed at the institute. Admission is confirmed only then.',
  },
];

function validPhone(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

function validEmail(v: string) {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function AdmissionPage() {
  const { cms } = useCms();
  const s = cms.siteSettings;
  const courses = cms.courses.filter((c) => c.is_published !== false);

  const [searchParams] = useSearchParams();
  const initialCourse = searchParams.get('course') || '';

  const [form, setForm] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    email: '',
    class_level: '',
    course_name: initialCourse,
    preferred_batch: '',
    school: '',
    address: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [refCode, setRefCode] = useState('');

  // Manual Payment Form state (when payments_enabled === true)
  const [payForm, setPayForm] = useState({
    student_name: '',
    phone: '',
    application_reference: '',
    amount: '',
    method: 'UPI',
    reference_note: '',
    proof_url: '',
  });
  const [payStatus, setPayStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>(
    'idle'
  );
  const [payError, setPayError] = useState('');

  const update =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.student_name.trim()) next.student_name = "Please enter the student's name.";
    if (!form.parent_name.trim())
      next.parent_name = "Please enter the parent or guardian's name.";
    if (!form.phone.trim()) next.phone = 'Please enter a mobile number.';
    else if (!validPhone(form.phone))
      next.phone = 'Enter a valid mobile number (10–13 digits).';
    if (!validEmail(form.email)) next.email = 'Enter a valid email address.';
    if (!form.class_level) next.class_level = 'Please select the class.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('saving');
    setServerError('');

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit application.');
      setRefCode(data.reference);
      setPayForm((prev) => ({
        ...prev,
        student_name: form.student_name,
        phone: form.phone,
        application_reference: data.reference,
      }));
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error
          ? err.message
          : 'We could not save your application. Please try again, or call the institute.'
      );
    }
  }

  async function handleProofUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayStatus('uploading');
    setPayError('');
    try {
      const fileUrl = await uploadImageFile(file);
      setPayForm((prev) => ({ ...prev, proof_url: fileUrl }));
      setPayStatus('idle');
    } catch (err) {
      setPayStatus('error');
      setPayError(err instanceof Error ? err.message : 'Could not upload receipt.');
    }
  }

  async function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!payForm.student_name.trim() || !payForm.phone.trim() || !payForm.amount.trim()) {
      setPayStatus('error');
      setPayError('Student name, phone number, and amount paid are required.');
      return;
    }
    setPayStatus('saving');
    setPayError('');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not record payment submission.');
      setPayStatus('done');
    } catch (err) {
      setPayStatus('error');
      setPayError(err instanceof Error ? err.message : 'Could not submit payment.');
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Admissions"
        title="Apply for admission"
        description="Submit the application below. Our team will call you to explain batch timings, subjects and the fee structure before you confirm a seat."
      >
        <a
          href={`tel:${s.phone}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#FFBE1B] hover:underline"
        >
          <Phone className="h-4 w-4" />
          <span className="tabular-nums">Prefer to talk? Call {s.phone}</span>
        </a>
      </PageHero>

      <section className="shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-8">
          <div className="surface p-5 sm:p-7">
            <h2 className="display-face text-2xl text-[#122B5C]">Admission application</h2>
            <p className="mb-5 mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Fields marked with * are required.
            </p>

            {status === 'done' ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" />
                <h3 className="mt-3 text-lg font-bold text-emerald-950">
                  Application received
                </h3>
                <p className="mt-1.5 text-sm text-emerald-800">
                  Save your reference number{' '}
                  <span className="font-bold tabular-nums">{refCode}</span>. The admissions
                  team will contact you to verify details and confirm the batch.
                </p>
                <p className="mt-2 text-xs text-emerald-700">
                  Admission is confirmed only at the institute after fee payment and document
                  verification.
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
                      course_name: '',
                      preferred_batch: '',
                      school: '',
                      address: '',
                      message: '',
                    });
                  }}
                  className="mt-5 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="a_student" className="mb-1 block text-xs font-semibold">
                      Student name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="a_student"
                      className={inputCls}
                      value={form.student_name}
                      onChange={update('student_name')}
                    />
                    {errors.student_name && (
                      <p className="mt-1 text-xs text-red-600">{errors.student_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="a_parent" className="mb-1 block text-xs font-semibold">
                      Parent / guardian name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="a_parent"
                      className={inputCls}
                      value={form.parent_name}
                      onChange={update('parent_name')}
                    />
                    {errors.parent_name && (
                      <p className="mt-1 text-xs text-red-600">{errors.parent_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="a_phone" className="mb-1 block text-xs font-semibold">
                      Mobile number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="a_phone"
                      type="tel"
                      inputMode="tel"
                      className={inputCls}
                      value={form.phone}
                      onChange={update('phone')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="a_email" className="mb-1 block text-xs font-semibold">
                      Email address
                    </label>
                    <input
                      id="a_email"
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={update('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="a_class" className="mb-1 block text-xs font-semibold">
                      Class <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="a_class"
                      className={inputCls}
                      value={form.class_level}
                      onChange={update('class_level')}
                    >
                      <option value="">Select class</option>
                      {CLASS_LEVELS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.class_level && (
                      <p className="mt-1 text-xs text-red-600">{errors.class_level}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="a_course" className="mb-1 block text-xs font-semibold">
                      Course of interest
                    </label>
                    <select
                      id="a_course"
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

                  <div>
                    <label htmlFor="a_batch" className="mb-1 block text-xs font-semibold">
                      Preferred batch
                    </label>
                    <select
                      id="a_batch"
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

                  <div>
                    <label htmlFor="a_school" className="mb-1 block text-xs font-semibold">
                      Current school
                    </label>
                    <input
                      id="a_school"
                      className={inputCls}
                      value={form.school}
                      onChange={update('school')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="a_address" className="mb-1 block text-xs font-semibold">
                    Residential address
                  </label>
                  <textarea
                    id="a_address"
                    rows={2}
                    className={inputCls}
                    value={form.address}
                    onChange={update('address')}
                  />
                </div>

                <div>
                  <label htmlFor="a_message" className="mb-1 block text-xs font-semibold">
                    Anything else we should know?
                  </label>
                  <textarea
                    id="a_message"
                    rows={3}
                    className={inputCls}
                    value={form.message}
                    onChange={update('message')}
                  />
                </div>

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
                  <span>{status === 'saving' ? 'Submitting...' : 'Submit application'}</span>
                </button>

                {!s.payments_enabled && (
                  <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                    No online payment is collected here. Your details are visible only to
                    authorised institute staff.
                  </p>
                )}
              </form>
            )}
          </div>

          {s.payments_enabled && (
            <div className="surface p-5 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#0785D1]">
                <CreditCard className="h-4 w-4" />
                <span>{s.payment_fee_label || 'Registration / Fee Payment'}</span>
              </div>
              <h3 className="display-face mt-1.5 text-xl text-[#122B5C]">
                Submit fee payment details
              </h3>
              {s.payment_instructions && (
                <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {s.payment_instructions}
                </p>
              )}

              {(s.upi_id || s.payment_qr_url || s.bank_details) && (
                <div className="mt-4 grid gap-4 rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC] p-4 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {s.upi_id && (
                      <p>
                        <span className="font-bold text-[#122B5C]">UPI ID: </span>
                        <span className="font-semibold text-[#122B5C]">{s.upi_id}</span>
                      </p>
                    )}
                    {s.bank_details && (
                      <p className="whitespace-pre-line">{s.bank_details}</p>
                    )}
                  </div>
                  {s.payment_qr_url && (
                    <InstituteImage
                      src={s.payment_qr_url}
                      alt="Payment QR code"
                      fit="contain"
                      className="h-28 w-28 rounded-lg border border-[hsl(var(--border))] bg-white p-1"
                    />
                  )}
                </div>
              )}

              {payStatus === 'done' ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-700" />
                  <p className="mt-2 text-sm font-bold text-emerald-950">
                    Payment record submitted for verification
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPayStatus('idle');
                      setPayForm({
                        student_name: '',
                        phone: '',
                        application_reference: '',
                        amount: '',
                        method: 'UPI',
                        reference_note: '',
                        proof_url: '',
                      });
                    }}
                    className="mt-3 rounded-lg border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-900"
                  >
                    Submit another payment
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3" noValidate>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className={inputCls}
                      placeholder="Student name *"
                      value={payForm.student_name}
                      onChange={(e) =>
                        setPayForm((p) => ({ ...p, student_name: e.target.value }))
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="Phone number *"
                      value={payForm.phone}
                      onChange={(e) => setPayForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                    <input
                      className={inputCls}
                      placeholder="Application ref (optional)"
                      value={payForm.application_reference}
                      onChange={(e) =>
                        setPayForm((p) => ({ ...p, application_reference: e.target.value }))
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="Amount paid (e.g. Rs. 2,000) *"
                      value={payForm.amount}
                      onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
                    />
                    <select
                      className={inputCls}
                      value={payForm.method}
                      onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                      <option value="Cash at Office">Cash at Office</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                    <input
                      className={inputCls}
                      placeholder="Transaction / UTR number"
                      value={payForm.reference_note}
                      onChange={(e) =>
                        setPayForm((p) => ({ ...p, reference_note: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[#F4F7FC] px-3.5 py-2 text-xs font-semibold text-[#122B5C] hover:bg-white">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {payStatus === 'uploading'
                          ? 'Uploading receipt...'
                          : payForm.proof_url
                            ? 'Receipt attached'
                            : 'Upload payment screenshot'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="sr-only"
                      />
                    </label>
                    {payForm.proof_url && (
                      <span className="text-xs font-medium text-emerald-700">Ready</span>
                    )}
                  </div>

                  {payStatus === 'error' && payError && (
                    <p className="text-xs text-red-600">{payError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={payStatus === 'saving' || payStatus === 'uploading'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#122B5C] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0B1D40] disabled:opacity-60"
                  >
                    {payStatus === 'saving' ? 'Submitting...' : 'Submit payment details'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#0785D1]">
            How admission works
          </h2>
          {STEPS.map(({ icon: Icon, title, text }, idx) => (
            <div key={title} className="surface flex gap-3.5 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#122B5C] text-[#FFBE1B]">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#122B5C] tabular-nums">
                  {idx + 1}. {title}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {text}
                </p>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[#F4F7FC] p-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            <p className="font-semibold text-[#122B5C]">Institute address</p>
            <p className="mt-1">{s.address}</p>
            <p className="mt-1">{s.office_hours}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
