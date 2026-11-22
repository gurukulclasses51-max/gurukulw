import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { BrandMark, InstituteImage } from './BrandMark';
import { EnquiryForm } from './EnquiryForm';

function cleanDigits(phone: string) {
  return String(phone || '').replace(/[^\d]/g, '');
}

const PRIMARY_NAV_PATHS = new Set(['/', '/about', '/courses', '/results', '/contact']);

export function Layout() {
  const { cms } = useCms();
  const settings = cms.siteSettings;
  const popup = cms.popupSetting;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const { pathname } = useLocation();
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setMobileOpen(false);
        setPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Controlled Admission Popup (respecting >=10s dwell and admin frequency settings)
  useEffect(() => {
    if (!popup.is_enabled || pathname.startsWith('/admin')) {
      setPopupOpen(false);
      return;
    }
    const storageKey = 'gsk_admission_popup_dismissed';
    try {
      if (popup.frequency === 'session' && window.sessionStorage.getItem(storageKey) === '1') {
        return;
      }
      if (popup.frequency === 'once' && window.localStorage.getItem(storageKey) === '1') {
        return;
      }
    } catch {
      // ignore storage errors
    }

    const delayMs = Math.max(10, Number(popup.delay_seconds) || 10) * 1000;
    const timer = window.setTimeout(() => {
      setPopupOpen(true);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [popup.is_enabled, popup.delay_seconds, popup.frequency, pathname]);

  function dismissPopup() {
    setPopupOpen(false);
    const storageKey = 'gsk_admission_popup_dismissed';
    try {
      if (popup.frequency === 'once') {
        window.localStorage.setItem(storageKey, '1');
      } else if (popup.frequency !== 'always') {
        window.sessionStorage.setItem(storageKey, '1');
      }
    } catch {
      // ignore
    }
  }

  const headerItems = useMemo(
    () =>
      cms.navigationItems
        .filter((n) => n.location === 'header' && n.is_visible !== false)
        .sort((a, b) => a.display_order - b.display_order),
    [cms.navigationItems]
  );

  const primaryHeaderItems = useMemo(() => {
    const matched = headerItems.filter((n) => PRIMARY_NAV_PATHS.has(n.path));
    return matched.length > 0 ? matched.slice(0, 5) : headerItems.slice(0, 5);
  }, [headerItems]);

  const overflowHeaderItems = useMemo(() => {
    const primaryIds = new Set(primaryHeaderItems.map((i) => i.id));
    return headerItems.filter((n) => !primaryIds.has(n.id));
  }, [headerItems, primaryHeaderItems]);

  const footerItems = useMemo(
    () =>
      cms.navigationItems
        .filter((n) => n.location === 'footer' && n.is_visible !== false)
        .sort((a, b) => a.display_order - b.display_order),
    [cms.navigationItems]
  );

  const publishedCourses = useMemo(
    () => cms.courses.filter((c) => c.is_published !== false),
    [cms.courses]
  );

  const whatsappDigits = cleanDigits(settings.whatsapp || settings.phone);

  const renderNavLink = (
    item: (typeof headerItems)[number],
    className: string | ((args: { isActive: boolean }) => string)
  ) => {
    const isExternal = /^https?:\/\//.test(item.path) || item.open_in_new_tab;
    if (isExternal) {
      return (
        <a
          key={item.id}
          href={item.path}
          target={item.open_in_new_tab ? '_blank' : undefined}
          rel={item.open_in_new_tab ? 'noreferrer' : undefined}
          className={typeof className === 'function' ? className({ isActive: false }) : className}
        >
          {item.label}
        </a>
      );
    }
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end={item.path === '/'}
        className={className}
      >
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[hsl(var(--foreground))]">
      <header className="sticky top-0 z-40">
        {settings.announcement_enabled && (
          <div
            style={{
              backgroundColor: settings.announcement_bg_color || '#FFBE1B',
              color: settings.announcement_text_color || '#122B5C',
            }}
            className={`transition-all duration-200 ${scrolled ? 'hidden md:block' : 'block'}`}
          >
            <div className="shell flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-[11px] font-medium sm:text-xs">
              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap hover:opacity-80"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{settings.phone}</span>
                  </a>
                )}
                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap hover:opacity-80 sm:inline-flex"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{settings.email}</span>
                  </a>
                )}
              </div>
              {settings.announcement_text && (
                <p className="min-w-0 flex-1 truncate text-right font-semibold sm:flex-initial">
                  {settings.announcement_text}
                </p>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            backgroundColor: settings.header_bg_color || '#122B5C',
            color: settings.header_text_color || '#FFFFFF',
          }}
          className={`transition-shadow duration-200 ${
            scrolled ? 'shadow-[0_10px_28px_-14px_rgba(11,29,64,0.85)]' : ''
          }`}
        >
          <div className="shell flex h-16 items-center justify-between gap-3 sm:gap-6 lg:h-[70px] lg:gap-8">
            {/* Zone 1: Single-line Brand Wordmark */}
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2 text-[15px] font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBE1B] sm:gap-2.5 sm:text-lg"
            >
              <span className="shrink-0">
                <BrandMark />
              </span>
              <span className="truncate">{settings.institute_name}</span>
            </Link>

            {/* Zone 2: Single-line navigation links */}
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
              {primaryHeaderItems.map((item) =>
                renderNavLink(item, ({ isActive }) =>
                  `shrink-0 whitespace-nowrap text-sm font-medium transition-colors hover:text-[#FFBE1B] ${
                    isActive ? 'text-[#FFBE1B]' : 'opacity-90'
                  }`
                )
              )}

              {overflowHeaderItems.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen((v) => !v)}
                    aria-expanded={moreOpen}
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium opacity-90 transition-colors hover:text-[#FFBE1B]"
                  >
                    <span>Academics</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-150 ${
                        moreOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-56 rounded-xl border border-[#122B5C]/15 bg-white p-1.5 text-[hsl(var(--foreground))] shadow-xl">
                      {overflowHeaderItems.map((sub) =>
                        renderNavLink(sub, ({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#F4F7FC] text-[#122B5C] font-semibold'
                              : 'text-slate-700 hover:bg-[#F4F7FC] hover:text-[#122B5C]'
                          }`
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Zone 3: Single Primary Action + Mobile Drawer Trigger */}
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/admission"
                className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#FFBE1B] px-4 py-2 text-sm font-bold text-[#122B5C] transition-colors hover:bg-[#f2b211] sm:inline-flex"
              >
                <span>Apply Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#0B1D40]/60 backdrop-blur-xs lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div className="flex h-full w-[86vw] max-w-sm flex-col bg-[#0B1D40] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav
              className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
              aria-label="Mobile navigation"
            >
              {headerItems.map((item) =>
                renderNavLink(item, ({ isActive }) =>
                  `block rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-[#FFBE1B]'
                      : 'text-white/85 hover:bg-white/5 hover:text-white'
                  }`
                )
              )}
            </nav>

            <div className="space-y-2.5 border-t border-white/10 p-4">
              <Link
                to="/admission"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFBE1B] px-4 py-3 text-sm font-bold text-[#122B5C]"
              >
                <span>Apply Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center justify-center gap-2 py-2 text-sm text-white/80"
                >
                  <Phone className="h-4 w-4" />
                  <span className="tabular-nums">{settings.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-14 bg-[#0B1D40] text-white/75 sm:mt-20">
        <div className="shell grid gap-8 py-10 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="text-[15px] font-bold text-white">
                {settings.institute_name}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {settings.footer_about}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
              Quick links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerItems.map((item) => (
                <li key={item.id}>
                  {renderNavLink(item, 'transition-colors hover:text-white')}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
              Courses
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {publishedCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {settings.address && (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" />
                  <span className="break-words">{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="tabular-nums transition-colors hover:text-white"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="break-all transition-colors hover:text-white"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-white/65 sm:flex-row sm:text-left">
            <p>{settings.footer_copyright}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link to="/privacy-policy" className="transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-white">
                Terms &amp; Conditions
              </Link>
              <Link to="/admin" className="transition-colors hover:text-white">
                Admin Console
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Compact WhatsApp quick-chat button across all devices */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2.5 sm:bottom-5 sm:right-5">
        {whatsappDigits && (
          <a
            href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
              `Hello ${settings.institute_name}, I would like to know about admissions.`
            )}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        )}
      </div>

      {/* Admin-configured Admission Enquiry Popup */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/70 p-3 backdrop-blur-xs sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admission-popup-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) dismissPopup();
          }}
        >
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 bg-[#122B5C] px-4 py-4 text-white sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FFBE1B]">
                  {settings.institute_name}
                </p>
                <h2 id="admission-popup-title" className="mt-1 text-lg font-bold">
                  {popup.title || 'Admission enquiry'}
                </h2>
                {popup.description && (
                  <p className="mt-1 text-xs text-white/80">{popup.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={dismissPopup}
                aria-label="Close popup"
                className="rounded-lg p-1.5 text-white/75 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {popup.image_url && (
              <div className="h-36 w-full overflow-hidden bg-[#F4F7FC]">
                <InstituteImage
                  src={popup.image_url}
                  alt={popup.title}
                  className="h-full w-full"
                />
              </div>
            )}

            <div className="p-4 sm:p-6">
              <EnquiryForm
                source="admission-popup"
                submitLabel={popup.submit_label || 'Request a callback'}
                dense
                showParentName={popup.show_parent_name}
                showEmail={popup.show_email}
                showClass={popup.show_class}
                showCourse={popup.show_course}
                showBatch={popup.show_batch}
                showMessage={popup.show_message}
                onSuccess={() => {
                  window.setTimeout(dismissPopup, 1400);
                }}
              />
              <button
                type="button"
                onClick={dismissPopup}
                className="mt-3 w-full py-1.5 text-center text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[#122B5C]"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
