import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ORIGINAL_IMAGES, splitParagraphs } from '../data/cmsDefaults';
import { InstituteImage } from '../components/BrandMark';
import { PageHero, SectionHeading } from '../components/PageHero';

export function AboutPage() {
  const { cms } = useCms();
  const settings = cms.siteSettings;
  const introSection = cms.homepageSections.find((s) => s.key === 'intro');
  const featuresSection = cms.homepageSections.find((s) => s.key === 'features');
  const storyParagraphs = splitParagraphs(settings.about_story);
  const featureItems = featuresSection?.items || [];

  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={settings.about_heading}
        description={settings.about_intro}
      />

      <section className="shell py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="eyebrow uppercase">Our story</p>
            <h2 className="display-face mt-3 text-[1.8rem] leading-tight text-[#122B5C] sm:text-4xl">
              Since 2009, one commitment
            </h2>
            <div className="mt-4 space-y-3.5 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
              {storyParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
              >
                <span>Apply for admission</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center rounded-lg border border-[#122B5C]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
              >
                View courses
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <InstituteImage
              src={introSection?.image_url || ORIGINAL_IMAGES.mentoring}
              alt={settings.institute_name}
              className="h-[300px] w-full sm:h-[420px]"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {settings.about_highlights.map((stat) => (
            <div
              key={stat.label}
              className="surface h-full border-t-2 border-t-[#FFBE1B] p-5 text-center"
            >
              <p className="display-face text-3xl leading-none text-[#122B5C] tabular-nums">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0B1D40] py-14 text-white sm:py-20">
        <div className="shell text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFBE1B]">
            Our mission
          </p>
          <p className="display-face mx-auto mt-4 max-w-3xl text-[1.75rem] leading-snug sm:text-[2.6rem]">
            {settings.about_mission}
          </p>
          <div className="gold-rule mx-auto mt-7 max-w-xs" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            Study with Enjoyment · Success with Excellence
          </p>
        </div>
      </section>

      {featureItems.length > 0 && (
        <section className="bg-[#F4F7FC] py-14 sm:py-20">
          <div className="shell">
            <SectionHeading
              align="center"
              eyebrow="How we teach"
              title={featuresSection?.title || 'Why families choose our institute'}
              subtitle={featuresSection?.subtitle}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureItems.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="surface h-full p-6">
                  <CheckCircle2 className="h-5 w-5 text-[#0785D1]" />
                  <h3 className="mt-3 text-base font-bold text-[#122B5C]">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="shell py-14 sm:py-20">
        <div className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#122B5C] text-[#FFBE1B]">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#122B5C]">Visit the institute</h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {settings.address}
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {settings.office_hours}
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#122B5C]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#F4F7FC]"
          >
            Contact details
          </Link>
        </div>
      </section>
    </div>
  );
}
