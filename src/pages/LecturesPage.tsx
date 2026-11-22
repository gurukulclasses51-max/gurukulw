import { useMemo, useState } from 'react';
import { Clock, ExternalLink, Play, Search, Video, X } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { CLASS_LEVELS } from '../data/cmsDefaults';
import type { LectureItem } from '../types/cms';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';

const inputCls =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15';

function toEmbedUrl(raw: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function LecturesPage() {
  const { cms } = useCms();
  const lectures = useMemo(
    () => cms.lectures.filter((l) => l.is_published !== false),
    [cms.lectures]
  );

  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<LectureItem | null>(null);

  const subjects = useMemo(
    () => [...new Set(lectures.map((l) => l.subject).filter(Boolean))],
    [lectures]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lectures.filter((l) => {
      const matchQ =
        !q || [l.title, l.description, l.subject].join(' ').toLowerCase().includes(q);
      const matchSub = !subject || l.subject === subject;
      const matchCls = !classLevel || l.class_level === classLevel;
      return matchQ && matchSub && matchCls;
    });
  }, [lectures, query, subject, classLevel]);

  return (
    <div>
      <PageHero
        eyebrow="Revision"
        title="Video lectures"
        description="Recorded classroom explanations and concept sessions for revision at home."
      />

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="search"
              className={`${inputCls} pl-9`}
              placeholder="Search title or topic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search lectures"
            />
          </div>

          <select
            className={inputCls}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

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
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="surface flex flex-col items-center justify-center px-6 py-14 text-center">
              <Video className="h-7 w-7 text-[#122B5C]" />
              <h3 className="mt-4 text-base font-bold text-[#122B5C]">
                No lecture matches these filters
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Try a different subject, class or search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((lec) => (
                <article
                  key={lec.id}
                  className="surface surface-hover flex flex-col overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (lec.video_url) {
                        setActiveVideo(lec);
                      } else {
                        setSelectedTitle(selectedTitle === lec.title ? null : lec.title);
                      }
                    }}
                    className="relative h-44 w-full overflow-hidden bg-[#0B1D40] text-left"
                    aria-label={`Open ${lec.title}`}
                  >
                    <InstituteImage
                      src={lec.thumbnail_url}
                      alt={lec.title}
                      className="h-44 w-full"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#0B1D40]/80 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                    <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-[#FFBE1B] text-[#122B5C]">
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold text-[#0785D1]">
                      {lec.subject}
                      <span aria-hidden="true" className="mx-1.5 text-slate-300">
                        ·
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {lec.class_level}
                      </span>
                    </p>
                    <h3 className="mt-2 text-base font-bold leading-snug text-[#122B5C]">
                      {lec.title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {lec.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{lec.duration_label || 'Recorded session'}</span>
                      </span>
                      {lec.video_url ? (
                        <button
                          type="button"
                          onClick={() => setActiveVideo(lec)}
                          className="text-xs font-semibold text-[#0785D1] hover:underline"
                        >
                          Watch lecture
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTitle(
                              selectedTitle === lec.title ? null : lec.title
                            )
                          }
                          className="text-xs font-semibold text-[#0785D1] hover:underline"
                        >
                          {selectedTitle === lec.title ? 'Hide note' : 'Batch access info'}
                        </button>
                      )}
                    </div>
                    {selectedTitle === lec.title && !lec.video_url && (
                      <p className="mt-3 rounded-lg bg-[#F4F7FC] p-3 text-xs leading-relaxed text-[#122B5C]">
                        Full recorded lecture playlists are shared with enrolled batch students
                        through the institute revision portal.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/85 p-3 backdrop-blur-xs sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideo(null);
          }}
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-3.5 shadow-2xl sm:p-4">
            <div className="mb-3 flex items-start justify-between gap-3 sm:items-center sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0785D1]">
                  {activeVideo.subject} · {activeVideo.class_level}
                </p>
                <h2 className="text-base font-bold text-[#122B5C]">{activeVideo.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="Close lecture player"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {toEmbedUrl(activeVideo.video_url) ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={toEmbedUrl(activeVideo.video_url)!}
                  title={activeVideo.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="rounded-xl bg-[#F4F7FC] p-8 text-center">
                <p className="text-sm text-[#122B5C]">
                  Open the recorded lecture directly in a new tab:
                </p>
                <a
                  href={activeVideo.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-semibold text-white"
                >
                  <span>Open lecture link</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
