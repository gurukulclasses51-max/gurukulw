import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Target } from 'lucide-react';
import type { CourseItem } from '../types/cms';
import { InstituteImage } from './BrandMark';
import { CourseEnquiryModal } from './EnquiryForm';

const STATUS_LABELS: Record<CourseItem['admission_status'], string> = {
  open: 'Admissions open',
  closing_soon: 'Closing soon',
  closed: 'Admissions closed',
};

export function CourseCard({ course }: { course: CourseItem }) {
  const [modalOpen, setModalOpen] = useState(false);
  const href = `/courses/${course.slug}`;

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#122B5C]/25">
        <Link to={href} className="relative block h-48 overflow-hidden bg-[#0B1D40]">
          <InstituteImage
            src={course.image_url}
            alt={course.name}
            className="h-48 w-full transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0B1D40]/90 via-[#0B1D40]/45 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-5 bottom-4">
            <p className="text-xs font-semibold text-[#FFBE1B]">
              {STATUS_LABELS[course.admission_status]}
              <span aria-hidden="true"> · </span>
              {course.duration}
            </p>
            <h3 className="mt-1 text-[1.06rem] font-bold leading-snug text-white">
              {course.name}
            </h3>
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#122B5C]">
            <span>{course.class_level}</span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span className="text-[#0785D1]">{course.category}</span>
          </div>

          <div className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            <p className="flex items-start gap-2">
              <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0785D1]" />
              <span>
                <span className="font-semibold text-[#122B5C]">Target: </span>
                {course.target_exams}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0785D1]" />
              <span>{course.subjects}</span>
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {course.description}
          </p>

          <div className="mt-auto grid gap-2.5 pt-5 sm:grid-cols-2">
            <Link
              to={href}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#122B5C] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0B1D40]"
            >
              <span>Explore Course</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-[#FFBE1B] px-4 py-2.5 text-[13px] font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
            >
              Enquire Now
            </button>
          </div>
        </div>
      </article>

      <CourseEnquiryModal
        courseName={course.name}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
