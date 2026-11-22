import { BedDouble, CheckCircle2, Sun } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import type { HomepageSection } from '../types/cms';
import { InstituteImage } from './BrandMark';
import { SectionHeading } from './PageHero';

export function CampusSection({ section }: { section?: HomepageSection }) {
  const { cms } = useCms();
  const data =
    section || cms.homepageSections.find((s) => s.key === 'campus');
  if (!data) return null;

  const cards = data.items || [];

  return (
    <section className="border-y border-[hsl(var(--border))] bg-white py-14 sm:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow={data.eyebrow || 'Campus & student facilities'}
          title={data.title}
          subtitle={data.subtitle}
        />

        {cards.length > 0 && (
          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {cards.map((item, idx) => {
              const Icon = item.icon === 'bed' || idx === 0 ? BedDouble : Sun;
              const points = item.points || [];
              return (
                <article
                  key={`${item.title}-${idx}`}
                  className="surface surface-hover overflow-hidden"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0B1D40]">
                    <InstituteImage
                      src={item.image_url}
                      alt={item.title || 'Campus facility'}
                      className="h-full w-full"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#0B1D40]/80 via-[#0B1D40]/20 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute bottom-4 left-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FFBE1B]">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-bold text-[#122B5C]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {item.description}
                    </p>
                    {points.length > 0 && (
                      <ul className="mt-4 space-y-2.5">
                        {points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground))]"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0785D1]" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {data.body && (
          <div className="mt-10 overflow-hidden rounded-2xl bg-[#0B1D40] p-6 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFBE1B]">
              Our commitment
            </p>
            <h3 className="display-face mt-2 text-2xl sm:text-[2rem]">
              Study with Enjoyment · Learn with Purpose · Achieve with Excellence
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
              {data.body}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
