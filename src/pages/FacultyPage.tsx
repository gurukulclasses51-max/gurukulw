import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ORIGINAL_IMAGES } from '../data/cmsDefaults';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';

export function FacultyPage() {
  const { cms } = useCms();
  const faculty = useMemo(
    () => cms.faculty.filter((f) => f.is_published !== false),
    [cms.faculty]
  );

  return (
    <div>
      <PageHero
        eyebrow="Our teachers"
        title="Faculty and mentors"
        description="Subject teachers who work with the same students through the year — tracking daily practice, tests and doubts."
      />

      <section className="shell py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5">
            {faculty.map((member) => (
              <article key={member.id} className="surface p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  {member.photo_url ? (
                    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#122B5C]">
                      <InstituteImage
                        src={member.photo_url}
                        alt={member.name}
                        className="h-16 w-16"
                      />
                    </span>
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#122B5C] text-[#FFBE1B]">
                      <GraduationCap className="h-6 w-6" />
                    </span>
                  )}
                  <div>
                    {member.role && (
                      <p className="text-xs font-semibold text-[#0785D1]">{member.role}</p>
                    )}
                    <h2 className="mt-1 text-xl font-bold text-[#122B5C]">{member.name}</h2>
                    <p className="mt-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {[member.subjects, member.qualification].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                {member.description && (
                  <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {member.description}
                  </p>
                )}
                {member.experience && (
                  <p className="mt-3 text-xs font-semibold text-[#122B5C]">
                    {member.experience}
                  </p>
                )}
              </article>
            ))}

            <div className="surface p-6">
              <h3 className="text-base font-bold text-[#122B5C]">
                Subject-specialist teaching team
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                Physics, Chemistry, Mathematics, and Biology classes are led by dedicated
                subject mentors who conduct daily lectures, review DPP sheets, and stay
                available during supervised study hours for one-to-one doubt clearing.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0785D1] hover:underline"
              >
                <span>Schedule an interaction with our faculty</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <InstituteImage
              src={
                cms.banners.find((b) => b.is_active !== false)?.image_url ||
                ORIGINAL_IMAGES.hero
              }
              alt="Classroom teaching at Giri Sir's Gurukul Classes"
              className="h-[320px] w-full sm:h-[420px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
