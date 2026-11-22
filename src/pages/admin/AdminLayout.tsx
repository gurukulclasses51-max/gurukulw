import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  HardDrive,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  PanelBottom,
  PanelTop,
  Receipt,
  Search,
  Sparkles,
  UserCheck,
  UserCog,
  Video,
  X,
  AlertCircle,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { BrandMark } from '../../components/BrandMark';

interface NavEntry {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

interface NavGroup {
  heading: string;
  items: NavEntry[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'Website content',
    items: [
      { to: '/admin/settings', label: 'Website Settings', icon: Globe },
      { to: '/admin/navigation', label: 'Header & Navigation', icon: PanelTop },
      { to: '/admin/homepage', label: 'Homepage Sections', icon: LayoutGrid },
      { to: '/admin/about', label: 'About Page', icon: GraduationCap },
      { to: '/admin/courses-page', label: 'Courses Page', icon: BookOpen },
      { to: '/admin/campus', label: 'Campus Facilities', icon: Building2 },
      { to: '/admin/hero', label: 'Homepage Banners', icon: Sparkles },
      { to: '/admin/popup', label: 'Admission Popup', icon: Mail },
      { to: '/admin/seo', label: 'SEO Settings', icon: Search },
      { to: '/admin/footer', label: 'Footer Settings', icon: PanelBottom },
      { to: '/admin/contact', label: 'Contact Settings', icon: Receipt },
      { to: '/admin/storage', label: 'Media & Storage', icon: HardDrive },
    ],
  },
  {
    heading: 'Academics',
    items: [
      { to: '/admin/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/exams', label: 'Exams', icon: CalendarClock },
      { to: '/admin/lectures', label: 'Lectures', icon: Video },
      { to: '/admin/results', label: 'Results', icon: Award },
      { to: '/admin/faculty', label: 'Faculty', icon: UserCheck },
      { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
      { to: '/admin/blogs', label: 'Blogs', icon: FileText },
    ],
  },
  {
    heading: 'Admissions',
    items: [
      { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/admin/admissions', label: 'Admissions', icon: ClipboardList },
      { to: '/admin/payments', label: 'Payments', icon: Receipt },
      { to: '/admin/payment-settings', label: 'Payment Settings', icon: CreditCard },
    ],
  },
  {
    heading: 'Account',
    items: [{ to: '/admin/account', label: 'Admin Account', icon: UserCog }],
  },
];

interface ToastItem {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

interface AdminToastCtx {
  notify: (message: string, kind?: 'success' | 'error') => void;
}

const ToastContext = createContext<AdminToastCtx>({ notify: () => {} });

export function useAdminToast() {
  return useContext(ToastContext);
}

function AdminLoginView() {
  const { cms, signInAdmin } = useCms();
  const [email, setEmail] = useState('gurukulclasses57@gmail.com');
  const [passcode, setPasscode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await signInAdmin(email, passcode);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'Could not sign in.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0785D1]">
              Admin Console
            </p>
            <h1 className="text-lg font-bold text-[#122B5C]">
              {cms.siteSettings.institute_name}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin_email" className="mb-1 block text-xs font-semibold text-[#122B5C]">
              Admin Email
            </label>
            <input
              id="admin_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15"
              required
            />
          </div>

          <div>
            <label htmlFor="admin_pass" className="mb-1 block text-xs font-semibold text-[#122B5C]">
              Passcode
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                id="admin_pass"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full rounded-lg border border-[hsl(var(--input))] bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15"
                required
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
              Default passcode: <span className="font-mono font-semibold">gurukul2009</span>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#122B5C] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0B1D40] disabled:opacity-60"
          >
            {busy ? 'Signing in...' : 'Sign in to Admin Console'}
          </button>
        </form>

        <div className="mt-5 border-t border-[hsl(var(--border))] pt-4 text-center">
          <Link to="/" className="text-xs font-semibold text-[#0785D1] hover:underline">
            Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { cms, adminUser, signOutAdmin } = useCms();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const toastCtx = useMemo(() => ({ notify }), [notify]);

  const currentPageLabel = useMemo(() => {
    for (const group of ADMIN_NAV_GROUPS) {
      for (const item of group.items) {
        if (item.end ? pathname === item.to : pathname.startsWith(item.to)) {
          return { group: group.heading, label: item.label };
        }
      }
    }
    return { group: 'Admin', label: 'Console' };
  }, [pathname]);

  if (!adminUser) {
    return <AdminLoginView />;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-4 py-4">
        <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
          <BrandMark />
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-[#122B5C]">
              {cms.siteSettings.institute_name}
            </p>
            <p className="text-[11px] font-semibold text-[#0785D1]">Admin Console</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[#F4F7FC] lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin sidebar">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition ${
                        isActive
                          ? 'bg-[#122B5C] font-semibold text-white'
                          : 'text-[hsl(var(--foreground))] hover:bg-[#F4F7FC] hover:text-[#122B5C]'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[hsl(var(--border))] p-3">
        <div className="rounded-xl bg-[#F4F7FC] px-3 py-2.5">
          <p className="truncate text-xs font-bold text-[#122B5C]">{adminUser.full_name}</p>
          <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
            {adminUser.email}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ToastContext.Provider value={toastCtx}>
      <div className="flex min-h-screen bg-[#F4F7FC]">
        {/* Desktop fixed sidebar */}
        <aside className="hidden w-[260px] shrink-0 border-r border-[hsl(var(--border))] bg-white lg:sticky lg:top-0 lg:block lg:h-screen">
          {sidebarContent}
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-[#0B1D40]/50"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside className="relative z-10 w-[260px] max-w-[82vw] border-r border-[hsl(var(--border))] bg-white shadow-xl">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] bg-white/95 px-3 py-3 backdrop-blur-sm sm:gap-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="shrink-0 rounded-lg border border-[hsl(var(--border))] p-2 text-[#122B5C] hover:bg-[#F4F7FC] lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {currentPageLabel.group}
                </p>
                <h1 className="truncate text-sm font-bold text-[#122B5C] sm:text-lg">
                  {currentPageLabel.label}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[hsl(var(--border))] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC] sm:px-3"
              >
                <span className="hidden sm:inline">View website</span>
                <span className="sm:hidden">Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={signOutAdmin}
                aria-label="Sign out"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[hsl(var(--border))] bg-white px-2.5 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:bg-red-50 hover:text-red-700 sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-6 sm:py-8">
            {children || <Outlet />}
          </main>
        </div>

        {/* Toast Stack */}
        {toasts.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg ${
                  t.kind === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-emerald-200 bg-white text-[#122B5C]'
                }`}
              >
                {t.kind === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
                <span className="min-w-0 break-words">{t.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
