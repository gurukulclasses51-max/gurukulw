import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Clock, ExternalLink, FileText } from 'lucide-react';
import type { ExamItem } from '../types/cms';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'To be announced';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${(mStr || '00').padStart(2, '0')} ${suffix}`;
}

const STATUS_META: Record<ExamItem['status'], { label: string; colorClass: string }> = {
  open: { label: 'Registration open', colorClass: 'text-emerald-700' },
  upcoming: { label: 'Upcoming', colorClass: 'text-[#0785D1]' },
  closed: { label: 'Registration closed', colorClass: 'text-slate-600' },
  completed: { label: 'Completed', colorClass: 'text-slate-500' },
};

export function ExamCard({ exam }: { exam: ExamItem }) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_META[exam.status] || STATUS_META.open;

  return (
    <article className="surface surface-hover flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#0785D1]">
            {exam.course_category}
            <span aria-hidden="true" className="mx-1.5 text-slate-300">
              ·
            </span>
            <span className={statusInfo.colorClass}>{statusInfo.label}</span>
          </p>
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-[#122B5C]">
            {exam.title}
          </h3>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px] tabular-nums">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Class
          </dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--foreground))]">
            {exam.class_level}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Exam date
          </dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--foreground))]">
            {formatDate(exam.exam_date)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Start time
          </dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--foreground))]">
            {formatTime(exam.start_time)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Duration
          </dt>
          <dd className="mt-0.5 flex items-center gap-1 font-semibold text-[hsl(var(--foreground))]">
            <Clock className="h-3.5 w-3.5 text-[#0785D1]" />
            <span>{exam.duration_minutes} min</span>
          </dd>
        </div>
      </dl>

      {expanded && exam.instructions && (
        <div className="mt-4 rounded-lg bg-[#F4F7FC] p-3.5 text-[13px] leading-relaxed text-[hsl(var(--foreground))]">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#122B5C]">
            <FileText className="h-3.5 w-3.5" />
            <span>Instructions</span>
          </p>
          <p>{exam.instructions}</p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#122B5C]/20 bg-white px-3 py-2 text-xs font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
        >
          <span>{expanded ? 'Hide details' : 'View details'}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {exam.registration_url ? (
          <a
            href={exam.registration_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFBE1B] px-3.5 py-2 text-xs font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
          >
            <span>Open Exam Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Link
            to="/admission"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFBE1B] px-3.5 py-2 text-xs font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
          >
            Enquire to Register
          </Link>
        )}
      </div>
    </article>
  );
}
