import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export function BrandMark({ className = '' }: { className?: string }) {
  const { cms } = useCms();
  const logoUrl = cms.siteSettings.logo_url;
  const instituteName = cms.siteSettings.institute_name || "Giri Sir's Gurukul Classes";
  const parsedHeight = Number(cms.siteSettings.logo_height);
  const logoHeightPx =
    Number.isFinite(parsedHeight) && parsedHeight >= 24 && parsedHeight <= 80
      ? parsedHeight
      : 36;

  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  if (logoUrl && !logoFailed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/95 px-1.5 py-0.5 ${className}`}
      >
        <img
          src={logoUrl}
          alt={`${instituteName} logo`}
          referrerPolicy="no-referrer"
          onError={() => setLogoFailed(true)}
          style={{ height: `${Math.min(logoHeightPx, 44)}px`, width: 'auto' }}
          className="object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFBE1B] text-[#122B5C] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
        <path
          d="M16 4L4 10.5L16 17L28 10.5L16 4Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M8 13.5V22C8 24.2 11.6 26.5 16 26.5C20.4 26.5 24 24.2 24 22V13.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M26 11.5V20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

interface InstituteImageProps {
  src?: string;
  alt: string;
  className?: string;
  fit?: 'cover' | 'contain';
}

export function InstituteImage({
  src,
  alt,
  className = '',
  fit = 'cover',
}: InstituteImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#122B5C] to-[#0B1D40] p-4 text-center text-white/80 ${className}`}
        role="img"
        aria-label={alt}
      >
        <BookOpen className="h-7 w-7 text-[#FFBE1B]" />
        <span className="mt-2 max-w-[18ch] text-xs font-medium leading-snug text-white/75">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
      loading="lazy"
    />
  );
}
