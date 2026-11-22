import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { createDefaultCms, DEFAULT_ADMIN_ACCOUNT } from '../data/cmsDefaults';
import type { AdminAccount, CmsBundle } from '../types/cms';

interface AdminUser {
  full_name: string;
  email: string;
  role: string;
}

interface CmsContextValue {
  cms: CmsBundle;
  loading: boolean;
  reloadCms: () => Promise<void>;
  adminUser: AdminUser | null;
  signInAdmin: (email: string, passcode: string) => Promise<{ ok: boolean; error?: string }>;
  signOutAdmin: () => void;
  updateAdminProfile: (patch: {
    full_name?: string;
    email?: string;
    passcode?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

const ADMIN_SIGNED_OUT_KEY = 'gsk_admin_signed_out';

const CmsContext = createContext<CmsContextValue | null>(null);

function resolvePageKey(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/exams')) return 'exams';
  if (pathname.startsWith('/lectures')) return 'lectures';
  if (pathname.startsWith('/results')) return 'results';
  if (pathname.startsWith('/faculty')) return 'faculty';
  if (pathname.startsWith('/testimonials')) return 'testimonials';
  if (pathname.startsWith('/gallery')) return 'gallery';
  if (pathname.startsWith('/blogs')) return 'blogs';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/admission')) return 'admission';
  if (pathname.startsWith('/privacy-policy')) return 'privacy';
  if (pathname.startsWith('/terms')) return 'terms';
  return 'home';
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [cms, setCms] = useState<CmsBundle>(() => createDefaultCms());
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      if (window.sessionStorage.getItem(ADMIN_SIGNED_OUT_KEY) === '1') {
        return null;
      }
    } catch {
      // ignore storage errors
    }
    return {
      full_name: DEFAULT_ADMIN_ACCOUNT.full_name,
      email: DEFAULT_ADMIN_ACCOUNT.email,
      role: DEFAULT_ADMIN_ACCOUNT.role,
    };
  });

  const { pathname } = useLocation();

  const reloadCms = useCallback(async () => {
    try {
      const [cmsRes, accRes] = await Promise.all([
        fetch('/api/cms'),
        fetch('/api/admin/account'),
      ]);
      if (cmsRes.ok) {
        const data = (await cmsRes.json()) as CmsBundle;
        setCms(data);
      }
      if (accRes.ok) {
        const accData = (await accRes.json()) as { account?: Omit<AdminAccount, 'passcode'> };
        if (accData.account) {
          setAdminUser((prev) => (prev ? { ...accData.account! } : prev));
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadCms();
  }, [reloadCms]);

  // Apply dynamic SEO title, meta description & favicon
  useEffect(() => {
    const pageKey = resolvePageKey(pathname);
    const pageMeta = cms.pageSeo.find((p) => p.page_key === pageKey);
    const title = pathname.startsWith('/admin')
      ? `Admin Console | ${cms.siteSettings.institute_name}`
      : pageMeta?.title?.trim() || cms.siteSettings.seo_title || cms.siteSettings.institute_name;

    const description =
      pageMeta?.description?.trim() ||
      cms.siteSettings.seo_description ||
      cms.siteSettings.tagline;

    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute('content', title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) {
      ogDesc.setAttribute('content', description);
    }

    if (cms.siteSettings.favicon_url) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = cms.siteSettings.favicon_url;
    }
  }, [pathname, cms.pageSeo, cms.siteSettings]);

  const signInAdmin = useCallback(async (email: string, passcode: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Sign-in failed.' };
      }
      try {
        window.sessionStorage.removeItem(ADMIN_SIGNED_OUT_KEY);
      } catch {
        // ignore
      }
      setAdminUser(data.account);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while signing in.' };
    }
  }, []);

  const signOutAdmin = useCallback(() => {
    try {
      window.sessionStorage.setItem(ADMIN_SIGNED_OUT_KEY, '1');
    } catch {
      // ignore
    }
    setAdminUser(null);
  }, []);

  const updateAdminProfile = useCallback(
    async (patch: { full_name?: string; email?: string; passcode?: string }) => {
      try {
        const res = await fetch('/api/admin/account', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || 'Could not update account.' };
        }
        setAdminUser(data.account);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not save account changes.' };
      }
    },
    []
  );

  const value = useMemo<CmsContextValue>(
    () => ({
      cms,
      loading,
      reloadCms,
      adminUser,
      signInAdmin,
      signOutAdmin,
      updateAdminProfile,
    }),
    [cms, loading, reloadCms, adminUser, signInAdmin, signOutAdmin, updateAdminProfile]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used inside CmsProvider');
  }
  return ctx;
}
