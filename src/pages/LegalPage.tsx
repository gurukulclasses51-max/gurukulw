import { useCms } from '../context/CmsContext';

export function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const { cms } = useCms();
  const s = cms.siteSettings;
  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
  const rawContent = type === 'privacy' ? s.privacy_content : s.terms_content;
  const paragraphs = Array.isArray(rawContent)
    ? rawContent
    : String(rawContent || '')
        .split(/\n{2,}|\n/)
        .map((p) => p.trim())
        .filter(Boolean);

  return (
    <div className="shell max-w-3xl py-14 sm:py-20">
      <p className="eyebrow uppercase">Legal</p>
      <h1 className="display-face mt-3 text-[2rem] leading-tight text-[#122B5C] sm:text-[2.6rem]">
        {title}
      </h1>
      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
        Effective for current academic session
      </p>

      <div className="prose-site mt-8">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[hsl(var(--border))] bg-[#F4F7FC] p-5 text-sm">
        <p className="font-bold text-[#122B5C]">{s.institute_name}</p>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">{s.address}</p>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          {s.phone} · {s.email}
        </p>
      </div>
    </div>
  );
}
