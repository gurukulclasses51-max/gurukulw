import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#122B5C] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, #FFBE1B 0, transparent 42%), radial-gradient(circle at 85% 80%, #0785D1 0, transparent 45%)',
        }}
        aria-hidden="true"
      />
      <div className="shell relative py-12 sm:py-16">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
              {eyebrow}
            </p>
          )}
          <h1 className="display-face mt-3 text-3xl leading-[1.12] sm:text-[2.75rem] lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-base">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
      <div className="gold-rule" />
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
}) {
  const alignCls =
    align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className={`flex max-w-2xl flex-col gap-2 ${alignCls}`}>
        {eyebrow && <p className="eyebrow uppercase">{eyebrow}</p>}
        <h2 className="display-face text-2xl leading-tight text-[#122B5C] sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
