import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Play,
  Quote,
  Star,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ORIGINAL_IMAGES, splitParagraphs } from '../data/cmsDefaults';
import type { HomepageSection } from '../types/cms';
import { InstituteImage } from '../components/BrandMark';
import { CampusSection } from '../components/CampusSection';
import { CourseCard } from '../components/CourseCard';
import { EnquiryForm } from '../components/EnquiryForm';
import { ExamCard } from '../components/ExamCard';
import { SectionHeading } from '../components/PageHero';

export function HomePage() {
  const { cms } = useCms();
  const settings = cms.siteSettings;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [bannerIdx, setBannerIdx] = useState(0);

  const activeBanners = useMemo(
    () =>
      cms.banners
        .filter((b) => b.is_active !== false)
        .sort((a, b) => a.display_order - b.display_order),
    [cms.banners]
  );

  useEffect(() => {
    setBannerIdx(0);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = window.setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [activeBanners.length]);

  const orderedSections = useMemo(
    () =>
      cms.homepageSections
        .filter((s) => s.is_visible !== false)
        .sort((a, b) => a.display_order - b.display_order),
    [cms.homepageSections]
  );

  const featuredCourses = useMemo(
    () => cms.courses.filter((c) => c.is_published !== false).slice(0, 3),
    [cms.courses]
  );
  const featuredExams = useMemo(
    () => cms.exams.filter((e) => e.is_published !== false).slice(0, 3),
    [cms.exams]
  );
  const featuredLectures = useMemo(
    () => cms.lectures.filter((l) => l.is_published !== false).slice(0, 3),
    [cms.lectures]
  );
  const featuredResults = useMemo(
    () => cms.results.filter((r) => r.is_published !== false).slice(0, 4),
    [cms.results]
  );
  const featuredFaculty = useMemo(
    () => cms.faculty.filter((f) => f.is_published !== false).slice(0, 4),
    [cms.faculty]
  );
  const featuredTestimonials = useMemo(
    () => cms.testimonials.filter((t) => t.is_published !== false).slice(0, 2),
    [cms.testimonials]
  );
  const featuredBlogs = useMemo(
    () => cms.blogs.filter((b) => b.is_published !== false).slice(0, 3),
    [cms.blogs]
  );
  const featuredGallery = useMemo(
    () => cms.galleryMedia.filter((m) => m.is_published !== false).slice(0, 4),
    [cms.galleryMedia]
  );

  function renderHero(sec: HomepageSection) {
    const slide = activeBanners[bannerIdx] || null;
    const title = slide?.title || sec.title;
    const description =
      slide?.description ||
      sec.subtitle ||
      'Small batches, subject-specialist teachers and a disciplined daily rhythm — that is how we prepare students for school, board and competitive examinations.';
    const imageUrl = slide?.image_url || sec.image_url || ORIGINAL_IMAGES.hero;
    const primaryLabel = slide?.primary_label || sec.button_label || 'Apply for admission';
    const primaryUrl = slide?.primary_url || sec.button_link || '/admission';
    const secondaryLabel = slide?.secondary_label || 'Talk to us';
    const secondaryUrl = slide?.secondary_url || '/contact';
    const highlights = sec.items || [];

    return (
      <section key={sec.id} className="relative isolate w-full overflow-hidden bg-[#0B1D40]">
        <div className="relative flex min-h-[480px] flex-col justify-center sm:min-h-[580px] lg:min-h-[640px]">
          <InstituteImage
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[#07132A]/40 sm:bg-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(7,19,42,0.94) 0%, rgba(7,19,42,0.82) 48%, rgba(7,19,42,0.42) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="shell relative w-full py-10 sm:py-16 lg:py-20">
            <div className="max-w-2xl">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFBE1B] sm:text-xs sm:tracking-[0.18em]">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>{sec.eyebrow || 'Admissions open'}</span>
                <span aria-hidden="true" className="text-white/40">
                  ·
                </span>
                <span className="text-white/85">Chhatrapati Sambhajinagar</span>
                {slide?.deadline && (
                  <>
                    <span aria-hidden="true" className="text-white/40">
                      ·
                    </span>
                    <span className="text-[#FFBE1B] tabular-nums">
                      Apply by {slide.deadline}
                    </span>
                  </>
                )}
              </p>

              <h1 className="display-face mt-4 text-[1.95rem] leading-[1.1] text-white sm:text-[3.1rem] lg:text-[3.6rem]">
                {title}
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-[17px]">
                {description}
              </p>

              {sec.subtitle && slide?.description && sec.subtitle !== slide.description && (
                <p className="mt-2 max-w-xl text-xs font-medium text-white/70">{sec.subtitle}</p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {primaryLabel && (
                  <Link
                    to={primaryUrl}
                    className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#FFBE1B] px-6 py-3 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211] sm:w-auto"
                  >
                    <span>{primaryLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {secondaryLabel && (
                  <Link
                    to={secondaryUrl}
                    className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-lg border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 sm:w-auto"
                  >
                    {secondaryLabel}
                  </Link>
                )}
              </div>

              {highlights.length > 0 && (
                <ul className="mt-8 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
                  {highlights.map((item, idx) => (
                    <li
                      key={`${item.title}-${idx}`}
                      className="border-t-2 border-[#FFBE1B]/75 pt-2.5"
                    >
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {activeBanners.length > 1 && (
                <div className="mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBannerIdx(
                        (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                      )
                    }
                    aria-label="Previous banner"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {activeBanners.map((b, i) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBannerIdx(i)}
                        aria-label={`Show banner ${i + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          i === bannerIdx ? 'w-6 bg-[#FFBE1B]' : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerIdx((prev) => (prev + 1) % activeBanners.length)}
                    aria-label="Next banner"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSection(sec: HomepageSection) {
    switch (sec.key) {
      case 'hero':
        return renderHero(sec);

      case 'announcement':
        return (
          <section key={sec.id} className="shell pt-10">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#FFBE1B]/45 bg-[#FFBE1B]/10 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFBE1B] text-[#122B5C]">
                <Megaphone className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#122B5C]/75">
                  {sec.title}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[hsl(var(--foreground))]">
                  {sec.body}
                </p>
              </div>
              <Link
                to={sec.button_link || '/admission'}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#122B5C] hover:text-[#0785D1]"
              >
                <span>{sec.button_label || 'Apply now'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        );

      case 'intro': {
        const paragraphs = splitParagraphs(sec.body);
        return (
          <section key={sec.id} className="shell py-14 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="relative order-2 lg:order-1">
                <div className="h-[280px] overflow-hidden rounded-2xl sm:h-[400px]">
                  <InstituteImage
                    src={sec.image_url || ORIGINAL_IMAGES.mentoring}
                    alt={sec.title || `Mentoring at ${settings.institute_name}`}
                    className="h-full w-full"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {settings.about_highlights.map((stat) => (
                    <div
                      key={stat.label}
                      className="surface border-t-2 border-t-[#FFBE1B] p-3.5 text-center"
                    >
                      <p className="display-face text-lg font-bold text-[#122B5C] tabular-nums">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="eyebrow uppercase">{sec.eyebrow || 'About the institute'}</p>
                <h2 className="display-face mt-3 text-[1.85rem] leading-tight text-[#122B5C] sm:text-[2.4rem]">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p className="mt-3 text-[15px] font-semibold text-[#0785D1]">
                    {sec.subtitle}
                  </p>
                )}
                <div className="mt-4 space-y-3.5 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
                {sec.button_label && (
                  <Link
                    to={sec.button_link || '/about'}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#122B5C]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
                  >
                    <span>{sec.button_label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'courses':
        return (
          <section key={sec.id} className="bg-[#F4F7FC] py-14 sm:py-20">
            <div className="shell">
              <SectionHeading
                eyebrow={sec.eyebrow || 'Programmes'}
                title={sec.title}
                subtitle={sec.subtitle}
                action={
                  <Link
                    to={sec.button_link || '/courses'}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#122B5C] hover:text-white"
                  >
                    <span>{sec.button_label || 'All courses'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'campus':
        return <CampusSection key={sec.id} section={sec} />;

      case 'features':
        return (
          <section key={sec.id} className="shell py-14 sm:py-20">
            <SectionHeading
              align="center"
              eyebrow={sec.eyebrow || 'Why us'}
              title={sec.title}
              subtitle={sec.subtitle}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(sec.items || []).map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="surface surface-hover p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#122B5C] text-[#FFBE1B]">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold tracking-wider text-slate-400 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#122B5C]">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'achievements':
        return (
          <section
            key={sec.id}
            className="relative overflow-hidden bg-[#122B5C] py-14 text-white sm:py-20"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: 'radial-gradient(circle at 80% 10%, #FFBE1B 0, transparent 45%)',
              }}
              aria-hidden="true"
            />
            <div className="shell relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
                    {sec.eyebrow || 'Achievements'}
                  </p>
                  <h2 className="display-face mt-3 text-2xl leading-tight sm:text-4xl">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-2.5 text-[15px] text-white/75">{sec.subtitle}</p>
                  )}
                </div>
                <Link
                  to={sec.button_link || '/results'}
                  className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
                >
                  <span>{sec.button_label || 'View all results'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredResults.map((res) => (
                  <article
                    key={res.id}
                    className="overflow-hidden rounded-xl border border-white/15 bg-white/6"
                  >
                    {res.photo_url ? (
                      <div className="h-40 w-full overflow-hidden bg-[#0B1D40]">
                        <InstituteImage
                          src={res.photo_url}
                          alt={res.student_name}
                          className="h-full w-full"
                        />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-[#FFBE1B]">
                        <span className="font-semibold">{res.achievement_title}</span>
                        <Award className="h-4 w-4" />
                      </div>
                      <p className="display-face mt-3 text-3xl text-white tabular-nums">
                        {res.score}
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">{res.student_name}</p>
                      <p className="mt-0.5 text-xs text-white/65">
                        {res.class_level} · {res.academic_year}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );

      case 'faculty':
        return (
          <section key={sec.id} className="shell py-14 sm:py-20">
            <SectionHeading
              eyebrow={sec.eyebrow || 'Our teachers'}
              title={sec.title}
              subtitle={sec.subtitle}
              action={
                <Link
                  to={sec.button_link || '/faculty'}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
                >
                  <span>{sec.button_label || 'Meet the faculty'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredFaculty.map((member) => (
                <article key={member.id} className="surface surface-hover overflow-hidden">
                  <div className="h-48 w-full overflow-hidden bg-[#122B5C]">
                    {member.photo_url ? (
                      <InstituteImage
                        src={member.photo_url}
                        alt={member.name}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-2xl font-bold text-[#FFBE1B]">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#122B5C]">{member.name}</h3>
                    <p className="mt-0.5 text-xs font-semibold text-[#0785D1]">
                      {member.subjects}
                    </p>
                    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                      {member.qualification}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case 'exams':
        return (
          <section key={sec.id} className="shell py-14 sm:py-20">
            <SectionHeading
              eyebrow={sec.eyebrow || 'Assessments'}
              title={sec.title}
              subtitle={sec.subtitle}
              action={
                <Link
                  to={sec.button_link || '/exams'}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
                >
                  <span>{sec.button_label || 'All exam announcements'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </section>
        );

      case 'lectures':
        return (
          <section key={sec.id} className="bg-[#F4F7FC] py-14 sm:py-20">
            <div className="shell">
              <SectionHeading
                eyebrow={sec.eyebrow || 'Revision'}
                title={sec.title}
                subtitle={sec.subtitle}
                action={
                  <Link
                    to={sec.button_link || '/lectures'}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#122B5C] hover:text-white"
                  >
                    <span>{sec.button_label || 'Browse lectures'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredLectures.map((lec) => (
                  <article key={lec.id} className="surface surface-hover flex flex-col overflow-hidden">
                    <div className="relative h-44 overflow-hidden bg-[#0B1D40]">
                      <InstituteImage
                        src={lec.thumbnail_url}
                        alt={lec.title}
                        className="h-44 w-full"
                      />
                      <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-[#FFBE1B] text-[#122B5C]">
                        <Play className="h-4 w-4 fill-current" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-semibold text-[#0785D1]">
                        {lec.subject} · {lec.class_level}
                      </p>
                      <h3 className="mt-2 text-base font-bold text-[#122B5C]">{lec.title}</h3>
                      <p className="mt-1.5 flex-1 text-sm text-[hsl(var(--muted-foreground))]">
                        {lec.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <span className="tabular-nums">{lec.duration_label}</span>
                        <Link to="/lectures" className="font-semibold text-[#0785D1] hover:underline">
                          Open lecture
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section key={sec.id} className="bg-[#F4F7FC] py-14 sm:py-20">
            <div className="shell">
              <SectionHeading
                eyebrow={sec.eyebrow || 'Student voices'}
                title={sec.title}
                subtitle={sec.subtitle}
                action={
                  <Link
                    to={sec.button_link || '/testimonials'}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#122B5C] hover:text-white"
                  >
                    <span>{sec.button_label || 'Read more'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              <div className="mt-9 grid gap-5 lg:grid-cols-2">
                {featuredTestimonials.map((item) => (
                  <article
                    key={item.id}
                    className="surface flex flex-col justify-between p-6 sm:p-8"
                  >
                    <div>
                      <Quote className="h-7 w-7 text-[#FFBE1B]" />
                      <p className="mt-3 text-base leading-relaxed text-[hsl(var(--foreground))]">
                        “{item.quote}”
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
                      <div>
                        <p className="text-sm font-bold text-[#122B5C]">{item.display_name}</p>
                        {item.program && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {item.program}
                          </p>
                        )}
                      </div>
                      <div
                        className="flex items-center gap-1"
                        aria-label={`${item.rating} out of 5`}
                      >
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-[#FFBE1B] text-[#FFBE1B]"
                          />
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
                <div className="surface flex flex-col justify-between bg-[#122B5C] p-6 text-white sm:p-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
                      Academic Philosophy
                    </p>
                    <h3 className="display-face mt-3 text-2xl leading-snug text-white">
                      “{settings.about_mission}”
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">
                      Guided by Prof. Pradip Giri since 2009, our classrooms focus on curiosity,
                      daily discipline, and transparent communication with families.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#FFBE1B] hover:underline"
                    >
                      <span>Read our story</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'news':
        return (
          <section key={sec.id} className="shell py-14 sm:py-20">
            <SectionHeading
              eyebrow={sec.eyebrow || 'Newsroom'}
              title={sec.title}
              subtitle={sec.subtitle}
              action={
                <Link
                  to={sec.button_link || '/blogs'}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
                >
                  <span>{sec.button_label || 'All articles'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBlogs.map((post) => (
                <article
                  key={post.id}
                  className="surface surface-hover flex flex-col overflow-hidden"
                >
                  <Link
                    to={`/blogs/${post.slug}`}
                    className="block h-44 overflow-hidden bg-[#F4F7FC]"
                  >
                    <InstituteImage
                      src={post.featured_image_url}
                      alt={post.title}
                      className="h-44 w-full"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold text-[#0785D1]">
                      {post.category}
                      <span aria-hidden="true" className="mx-1.5 text-slate-300">
                        ·
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {post.published_date}
                      </span>
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-[#122B5C]">
                      <Link to={`/blogs/${post.slug}`} className="hover:text-[#0785D1]">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {post.excerpt}
                    </p>
                    <Link
                      to={`/blogs/${post.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#122B5C] hover:text-[#0785D1]"
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section key={sec.id} className="shell py-14 sm:py-20">
            <SectionHeading
              eyebrow={sec.eyebrow || 'Gallery'}
              title={sec.title}
              subtitle={sec.subtitle}
              action={
                <Link
                  to={sec.button_link || '/gallery'}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
                >
                  <span>{sec.button_label || 'Open gallery'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredGallery.map((item) => (
                <Link
                  key={item.id}
                  to="/gallery"
                  className="group relative block overflow-hidden rounded-xl bg-[#0B1D40]"
                >
                  <InstituteImage
                    src={item.file_url}
                    alt={item.title}
                    className="h-48 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1D40]/90 via-[#0B1D40]/30 to-transparent p-3">
                    <span className="block text-sm font-bold text-white">{item.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );

      case 'faq':
        return (
          <section
            key={sec.id}
            className="border-t border-[hsl(var(--border))] bg-white py-14 sm:py-20"
          >
            <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <div>
                <SectionHeading
                  eyebrow={sec.eyebrow || 'Help'}
                  title={sec.title}
                  subtitle={sec.subtitle}
                />
              </div>
              <div className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
                {(sec.items || []).map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={`${faq.title}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold text-[#122B5C]"
                      >
                        <span>{faq.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="pb-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                          {faq.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'enquiry':
        return (
          <section key={sec.id} className="bg-[#F4F7FC] py-14 sm:py-20">
            <div className="shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="eyebrow uppercase">{sec.eyebrow || 'Admissions'}</p>
                <h2 className="display-face mt-3 text-[1.85rem] leading-tight text-[#122B5C] sm:text-4xl">
                  {sec.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {sec.subtitle} {sec.body}
                </p>

                <div className="mt-7 space-y-3">
                  <a
                    href={`tel:${settings.phone}`}
                    className="surface surface-hover flex items-center gap-3.5 p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#122B5C] text-[#FFBE1B]">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                        Call the office
                      </p>
                      <p className="text-sm font-bold text-[#122B5C] tabular-nums">
                        {settings.phone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${settings.email}`}
                    className="surface surface-hover flex items-center gap-3.5 p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#122B5C] text-[#FFBE1B]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                        Email
                      </p>
                      <p className="truncate text-sm font-bold text-[#122B5C]">
                        {settings.email}
                      </p>
                    </div>
                  </a>

                  <div className="surface flex items-start gap-3.5 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#122B5C] text-[#FFBE1B]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                        Address &amp; hours
                      </p>
                      <p className="text-sm font-semibold text-[#122B5C]">
                        {settings.address}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                        <Clock className="h-3.5 w-3.5 text-[#0785D1]" />
                        <span>{settings.office_hours}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface p-5 sm:p-8">
                <h3 className="text-lg font-bold text-[#122B5C]">Request a callback</h3>
                <p className="mb-5 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Our admissions team responds within one working day.
                </p>
                <EnquiryForm source="home-enquiry" submitLabel="Submit enquiry" />
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section key={sec.id} className="shell py-10 sm:py-12">
            <div className="surface flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="min-w-0">
                <p className="eyebrow uppercase">{sec.eyebrow || 'Visit'}</p>
                <h2 className="display-face mt-1.5 text-2xl text-[#122B5C]">{sec.title}</h2>
                <p className="mt-1 break-words text-sm text-[hsl(var(--muted-foreground))]">
                  {sec.subtitle || settings.address}
                </p>
              </div>
              <Link
                to={sec.button_link || '/contact'}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#122B5C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1D40] sm:w-auto"
              >
                <span>{sec.button_label || 'Contact details'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        );

      default:
        return (
          <section key={sec.id} className="shell py-14 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                {sec.eyebrow && <p className="eyebrow uppercase">{sec.eyebrow}</p>}
                {sec.title && (
                  <h2 className="display-face mt-2 text-2xl text-[#122B5C] sm:text-3xl">
                    {sec.title}
                  </h2>
                )}
                {sec.subtitle && (
                  <p className="mt-2 text-sm font-semibold text-[#0785D1]">{sec.subtitle}</p>
                )}
                {sec.body && (
                  <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {splitParagraphs(sec.body).map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                )}
                {sec.button_label && (
                  <Link
                    to={sec.button_link || '/contact'}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C] hover:bg-[#f2b211]"
                  >
                    <span>{sec.button_label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
              {sec.image_url && (
                <div className="h-[260px] overflow-hidden rounded-2xl sm:h-[340px]">
                  <InstituteImage
                    src={sec.image_url}
                    alt={sec.title || 'Institute section'}
                    className="h-full w-full"
                  />
                </div>
              )}
            </div>
          </section>
        );
    }
  }

  return <div>{orderedSections.map((sec) => renderSection(sec))}</div>;
}
