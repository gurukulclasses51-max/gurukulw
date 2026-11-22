import { useMemo, useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';

export function ResultsPage() {
  const { cms } = useCms();
  const [year, setYear] = useState('');

  const results = useMemo(
    () => cms.results.filter((r) => r.is_published !== false),
    [cms.results]
  );

  const years = useMemo(
    () => [...new Set(results.map((r) => r.academic_year).filter(Boolean))],
    [results]
  );

  const filtered = year ? results.filter((r) => r.academic_year === year) : results;

  return (
    <div>
      <PageHero
        eyebrow="Achievements"
        title="Results and academic achievements"
        description="Verified student results, ranks and academic achievements published by Giri Sir's Gurukul Classes after verification and family consent."
      />

      <section className="shell py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cms.siteSettings.about_highlights.map((item) => (
            <div
              key={item.label}
              className="surface border-t-2 border-t-[#FFBE1B] p-5 text-center"
            >
              <p className="display-face text-3xl text-[#122B5C] tabular-nums">
                {item.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Academic year
          </span>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-[#F4F7FC] p-1">
            <button
              type="button"
              onClick={() => setYear('')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                year === ''
                  ? 'bg-[#122B5C] text-white'
                  : 'text-[hsl(var(--foreground))] hover:bg-white'
              }`}
            >
              All
            </button>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums transition ${
                  year === y
                    ? 'bg-[#122B5C] text-white'
                    : 'text-[hsl(var(--foreground))] hover:bg-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((res) => (
            <article
              key={res.id}
              className={`surface surface-hover overflow-hidden ${
                res.is_featured ? 'ring-1 ring-[#FFBE1B]' : ''
              }`}
            >
              {res.photo_url && (
                <div className="h-48 w-full overflow-hidden bg-[#0B1D40]">
                  <InstituteImage
                    src={res.photo_url}
                    alt={res.student_name}
                    className="h-full w-full"
                  />
                </div>
              )}
              <div className="flex items-start gap-4 p-5">
                {res.photo_url ? (
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#122B5C]">
                    <InstituteImage
                      src={res.photo_url}
                      alt={res.student_name}
                      className="h-14 w-14"
                    />
                  </span>
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#122B5C] text-lg font-bold text-[#FFBE1B]">
                    {res.student_name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0785D1]">
                    {res.achievement_title}
                    {res.is_featured ? ' · Featured' : ''}
                  </p>
                  <h2 className="mt-1 truncate text-base font-bold text-[#122B5C]">
                    {res.student_name}
                  </h2>
                  {res.document_url && (
                    <a
                      href={res.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0785D1] hover:underline"
                    >
                      <span>View scorecard</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-2 border-t border-[hsl(var(--border))] px-5 py-3 text-center tabular-nums">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Score / Rank
                  </dt>
                  <dd className="mt-0.5 flex items-center justify-center gap-1 text-sm font-bold text-[#122B5C]">
                    <Award className="h-3.5 w-3.5 text-[#FFBE1B]" />
                    <span>{res.score}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Class
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">{res.class_level}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Year
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">{res.academic_year}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
