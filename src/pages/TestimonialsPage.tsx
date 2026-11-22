import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';

export function TestimonialsPage() {
  const { cms } = useCms();
  const testimonials = cms.testimonials.filter((t) => t.is_published !== false);

  return (
    <div>
      <PageHero
        eyebrow="Student voices"
        title="Testimonials"
        description="Feedback is published here only after a student or parent approves it. Nothing is written on their behalf."
      />

      <section className="shell py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <article key={t.id} className="surface flex flex-col p-6 sm:p-8">
              <Quote className="h-7 w-7 text-[#FFBE1B]" />
              <p className="mt-3 flex-1 text-base leading-relaxed text-[hsl(var(--foreground))]">
                “{t.quote}”
              </p>
              <div className="mt-5 flex items-center gap-1" aria-label={`${t.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating
                        ? 'fill-[#FFBE1B] text-[#FFBE1B]'
                        : 'text-[hsl(var(--border))]'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                {t.photo_url ? (
                  <InstituteImage
                    src={t.photo_url}
                    alt={t.display_name}
                    className="h-10 w-10 shrink-0 rounded-full"
                  />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#122B5C] text-sm font-bold text-[#FFBE1B]">
                    {t.display_name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-[#122B5C]">{t.display_name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.program}</p>
                </div>
              </div>
            </article>
          ))}

          <div className="surface flex flex-col justify-between bg-[#F4F7FC] p-6 sm:p-8">
            <div>
              <p className="eyebrow uppercase">Parent &amp; Student Feedback</p>
              <h2 className="display-face mt-2 text-2xl text-[#122B5C]">
                Speak directly with our admissions desk
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                Families considering admission are welcome to visit the campus, meet our
                teachers, and observe our supervised study environment before enrolling.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C] hover:bg-[#f2b211]"
              >
                <span>Apply for admission</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
