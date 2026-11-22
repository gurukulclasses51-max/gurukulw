import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  IndianRupee,
  Target,
  Users,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { InstituteImage } from '../components/BrandMark';
import { EnquiryForm } from '../components/EnquiryForm';
import { PageHero } from '../components/PageHero';

export function CourseDetailPage() {
  const { slug } = useParams();
  const { cms } = useCms();
  const course = cms.courses.find((c) => c.slug === slug || c.id === slug);

  if (!course) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="display-face text-3xl text-[#122B5C]">Course not found</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          This course may have been moved or is unavailable.
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all courses</span>
        </Link>
      </div>
    );
  }

  const specs = [
    { icon: GraduationCap, label: 'Starting class', value: course.class_level || '—' },
    { icon: Clock, label: 'Course duration', value: course.duration || '—' },
    { icon: Target, label: 'Target examinations', value: course.target_exams || '—' },
    { icon: BookOpen, label: 'Subjects covered', value: course.subjects || '—' },
    { icon: Calendar, label: 'Batches', value: course.batch_info || 'Contact office' },
    { icon: IndianRupee, label: 'Fee', value: course.fee || 'Shared by office' },
  ];

  return (
    <div>
      <PageHero
        eyebrow={course.category}
        title={course.name}
        description={course.description}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All courses</span>
          </Link>
          <span className="text-xs font-semibold text-[#FFBE1B]">
            Admissions {course.admission_status.replace('_', ' ')}
          </span>
        </div>
      </PageHero>

      <section className="shell grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <div className="h-[260px] overflow-hidden rounded-2xl bg-[#F4F7FC] sm:h-[380px]">
            <InstituteImage
              src={course.image_url}
              alt={course.name}
              className="h-full w-full"
            />
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="surface p-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  <Icon className="h-3.5 w-3.5 text-[#0785D1]" />
                  <span>{label}</span>
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#122B5C]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <h2 className="display-face text-2xl text-[#122B5C]">About this course</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
              {course.description}
            </p>
          </div>

          {course.highlights.length > 0 && (
            <div className="mt-9">
              <h2 className="display-face text-2xl text-[#122B5C]">Course highlights</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {course.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0785D1]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.eligibility.length > 0 && (
            <div className="mt-9">
              <h2 className="display-face text-2xl text-[#122B5C]">Eligibility</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-[hsl(var(--muted-foreground))]">
                {course.eligibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {course.exam_preparation.length > 0 && (
            <div className="mt-9">
              <h2 className="display-face text-2xl text-[#122B5C]">
                Examination preparation
              </h2>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                {course.exam_preparation.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <BookOpen className="mt-1 h-4 w-4 shrink-0 text-[#0785D1]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.methodology.length > 0 && (
            <div className="mt-9">
              <h2 className="display-face text-2xl text-[#122B5C]">
                Learning methodology
              </h2>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                {course.methodology.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Users className="mt-1 h-4 w-4 shrink-0 text-[#0785D1]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={`/admission?course=${encodeURIComponent(course.name)}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#122B5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B1D40]"
            >
              Apply for admission
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-[#122B5C]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
            >
              Talk to the office
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface p-5 sm:p-6">
            <h2 className="text-base font-bold text-[#122B5C]">
              Enquire about this course
            </h2>
            <p className="mb-4 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              We will call you with batch timings and the fee structure.
            </p>
            <EnquiryForm
              source={`course:${course.name}`}
              courseName={course.name}
              submitLabel="Send course enquiry"
              showCourse={false}
              dense
            />
          </div>
        </aside>
      </section>
    </div>
  );
}
