import { useMemo, useState } from 'react';
import { BookOpen, BrainCircuit, CheckCircle2, Search, Target } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import type { CourseItem } from '../types/cms';
import { CampusSection } from '../components/CampusSection';
import { CourseCard } from '../components/CourseCard';
import { PageHero } from '../components/PageHero';

const CATEGORY_ORDER = [
  'IIT-JEE & NEET Two-Year Integrated Programme',
  'IIT-JEE & NEET Foundation Programme',
];

const CATEGORY_BLURBS: Record<string, string> = {
  'IIT-JEE & NEET Two-Year Integrated Programme':
    'Two-year integrated regular course for Class XI and XII. IIT-JEE preparation for JEE Main, JEE Advanced and MHT-CET. NEET preparation for NEET-UG and MHT-CET.',
  'IIT-JEE & NEET Foundation Programme':
    'Integrated IIT-JEE and NEET foundation programme for Classes VIII, IX and X. Early preparation for competitive examinations through strong conceptual learning and school-level academic excellence.',
};

const STEP_ICONS = [BookOpen, BrainCircuit, CheckCircle2, Target];

export function CoursesPage() {
  const { cms } = useCms();
  const settings = cms.siteSettings;
  const publishedCourses = useMemo(
    () => cms.courses.filter((c) => c.is_published !== false),
    [cms.courses]
  );

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const categories = useMemo(
    () => [...new Set(publishedCourses.map((c) => c.category).filter(Boolean))],
    [publishedCourses]
  );
  const classLevels = useMemo(
    () => [...new Set(publishedCourses.map((c) => c.class_level).filter(Boolean))],
    [publishedCourses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publishedCourses.filter((c) => {
      const matchesQuery =
        !q ||
        [c.name, c.description, c.subjects, c.category, c.target_exams]
          .join(' ')
          .toLowerCase()
          .includes(q);
      const matchesCat = !category || c.category === category;
      const matchesClass = !classFilter || c.class_level === classFilter;
      return matchesQuery && matchesCat && matchesClass;
    });
  }, [publishedCourses, query, category, classFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, CourseItem[]>();
    filtered.forEach((c) => {
      const key = c.category || 'Academic Programmes';
      const arr = map.get(key) || [];
      arr.push(c);
      map.set(key, arr);
    });
    return [...map.entries()]
      .sort(([a], [b]) => {
        const ia = CATEGORY_ORDER.indexOf(a);
        const ib = CATEGORY_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map(([title, courses]) => ({
        title,
        courses,
        blurb: CATEGORY_BLURBS[title] || '',
      }));
  }, [filtered]);

  return (
    <div>
      <PageHero
        eyebrow={settings.courses_eyebrow}
        title={settings.courses_title}
        description={settings.courses_description}
      >
        <p className="text-sm font-semibold text-[#FFBE1B]">{settings.courses_badge}</p>
      </PageHero>

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by programme"
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15"
          >
            <option value="">All programmes</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            aria-label="Filter by class"
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15"
          >
            <option value="">All classes</option>
            {classLevels.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10">
          {grouped.length === 0 ? (
            <div className="surface px-6 py-14 text-center">
              <p className="text-base font-bold text-[#122B5C]">
                No course matches these filters
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Try clearing the search term or choosing a different class.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('');
                  setClassFilter('');
                }}
                className="mt-4 rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-semibold text-white"
              >
                Reset filters
              </button>
            </div>
          ) : (
            grouped.map((group, idx) => (
              <section key={group.title} className="mt-14 first:mt-0">
                <header className="rounded-2xl border border-[#122B5C]/15 bg-white p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#122B5C] text-base font-bold text-[#FFBE1B] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="eyebrow uppercase">Programme category</p>
                      <h2 className="display-face mt-1.5 text-2xl leading-tight text-[#122B5C] sm:text-[2rem]">
                        {group.title}
                      </h2>
                      {group.blurb && (
                        <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                          {group.blurb}
                        </p>
                      )}
                    </div>
                  </div>
                </header>

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </section>

      <CampusSection />

      <section className="shell py-12 sm:py-16">
        <div className="overflow-hidden rounded-2xl bg-[#0B1D40] p-6 text-white sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
              {settings.courses_approach_eyebrow}
            </p>
            <h2 className="display-face mt-2 text-2xl sm:text-[2.1rem]">
              {settings.courses_approach_title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {settings.courses_approach_description}
            </p>
          </div>

          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {settings.courses_approach_steps.map((step, idx) => {
              const Icon = STEP_ICONS[idx % STEP_ICONS.length];
              return (
                <li
                  key={`${step.title}-${idx}`}
                  className="rounded-xl border border-white/15 bg-white/5 p-5 transition hover:border-[#FFBE1B]/60 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFBE1B] text-[#122B5C]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.16em] text-white/45 tabular-nums">
                      0{idx + 1}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/75">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
