import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { EnquiryForm } from '../components/EnquiryForm';
import { PageHero } from '../components/PageHero';

export function ContactPage() {
  const { cms } = useCms();
  const s = cms.siteSettings;
  const whatsappDigits = (s.whatsapp || s.phone).replace(/[^\d]/g, '');

  const cards = [
    {
      icon: Phone,
      label: 'Phone',
      value: s.phone,
      href: `tel:${s.phone}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: s.email,
      href: `mailto:${s.email}`,
    },
    {
      icon: MapPin,
      label: 'Address',
      value: s.address,
    },
    {
      icon: Clock,
      label: 'Office hours',
      value: s.office_hours,
    },
  ];

  const socialLinks = [
    { label: 'Facebook', url: s.facebook_url },
    { label: 'Instagram', url: s.instagram_url },
    { label: 'YouTube', url: s.youtube_url },
    { label: 'X / Twitter', url: s.twitter_url },
  ].filter((item) => item.url && item.url.trim());

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Talk to the institute"
        description="Call us during office hours, send an email, or submit an enquiry and our team will get back to you."
      />

      <section className="shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="surface p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  <Icon className="h-3.5 w-3.5 text-[#0785D1]" />
                  <span>{label}</span>
                </p>
                <p className="mt-1.5 break-words text-sm font-semibold text-[#122B5C]">
                  {href ? (
                    <a href={href} className="hover:underline">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                  `Hello ${s.institute_name}, I have a question about admissions.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            )}
            {s.map_link && (
              <a
                href={s.map_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#122B5C]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#122B5C] hover:bg-[#F4F7FC] sm:w-auto"
              >
                <MapPin className="h-4 w-4 text-[#0785D1]" />
                <span>Get directions</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map((soc) => (
                <a
                  key={soc.label}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
                >
                  <span>{soc.label}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              ))}
            </div>
          )}

          {s.map_embed_url ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[#F4F7FC]">
              <iframe
                src={s.map_embed_url}
                title="Institute campus map"
                className="h-[280px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="mt-6 flex h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[#F4F7FC] p-8 text-center">
              <MapPin className="h-7 w-7 text-[#122B5C]/60" />
              <p className="text-sm font-bold text-[#122B5C]">{s.address}</p>
              <p className="max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
                Visit our campus during office hours ({s.office_hours}) to meet our
                subject teachers and inspect the study facilities.
              </p>
            </div>
          )}
        </div>

        <div className="surface p-5 sm:p-7">
          <h2 className="text-lg font-bold text-[#122B5C]">Send an enquiry</h2>
          <p className="mb-5 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Our admissions team usually responds within one working day.
          </p>
          <EnquiryForm source="contact-page" submitLabel="Send enquiry" />
        </div>
      </section>
    </div>
  );
}
