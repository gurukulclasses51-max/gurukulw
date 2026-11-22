import { useMemo, useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { CLASS_LEVELS } from '../data/cmsDefaults';
import { ExamCard } from '../components/ExamCard';
import { PageHero } from '../components/PageHero';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'open', label: 'Registration open' },
  { value: 'closed', label: 'Registration closed' },
  { value: 'completed', label: 'Completed' },
];

const inputCls =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15';

export function ExamsPage() {
  const { cms } = useCms();
  const exams = useMemo(
    () => cms.exams.filter((e) => e.is_published !== false),
    [cms.exams]
  );

  const [query, setQuery] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const categories = useMemo(
    () => [...new Set(exams.map((e) => e.course_category).filter(Boolean))],
    [exams]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams.filter((e) => {
      const matchQuery =
        !q ||
        [e.title, e.instructions, e.course_category]
          .join(' ')
          .toLowerCase()
          .includes(q);
      const matchClass = !classLevel || e.class_level === classLevel;
      const matchCat = !category || e.course_category === category;
      const matchStatus = !status || e.status === status;
      return matchQuery && matchClass && matchCat && matchStatus;
    });
  }, [exams, query, classLevel, category, status]);

  return (
    <div>
      <PageHero
        eyebrow="Assessments"
        title="Examination announcements"
        description="Test and examination schedules published by the institute. Instructions and registration details are shared with each announcement."
      />

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="search"
              className={`${inputCls} pl-9`}
              placeholder="Search exams"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search exams"
            />
          </div>

          <select
            className={inputCls}
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            aria-label="Filter by class"
          >
            <option value="">All classes</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by exam category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="surface flex flex-col items-center justify-center px-6 py-14 text-center">
              <Calendar className="h-7 w-7 text-[#122B5C]" />
              <h3 className="mt-4 text-base font-bold text-[#122B5C]">
                No exam matches these filters
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Try resetting your search or class filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setClassLevel('');
                  setCategory('');
                  setStatus('');
                }}
                className="mt-4 rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-semibold text-white"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
