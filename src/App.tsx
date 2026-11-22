import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { CmsProvider } from './context/CmsContext';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { AdmissionPage } from './pages/AdmissionPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { BlogsPage } from './pages/BlogsPage';
import { ContactPage } from './pages/ContactPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { ExamsPage } from './pages/ExamsPage';
import { FacultyPage } from './pages/FacultyPage';
import { GalleryPage } from './pages/GalleryPage';
import { HomePage } from './pages/HomePage';
import { LecturesPage } from './pages/LecturesPage';
import { LegalPage } from './pages/LegalPage';
import { ResultsPage } from './pages/ResultsPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { AdminAccountPage } from './pages/admin/AdminAccountPage';
import { AdminCrudModule } from './pages/admin/AdminCrudModule';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminStoragePage } from './pages/admin/AdminStoragePage';
import {
  AdmissionsAdminPage,
  EnquiriesAdminPage,
  PaymentsAdminPage,
} from './pages/admin/AdminLeadsModule';
import {
  AboutPageEditor,
  CampusFacilitiesEditor,
  CoursesPageEditor,
  HeroBannersPage,
  HomepageSectionsPage,
} from './pages/admin/AdminPageBuilders';
import {
  ContactSettingsPage,
  FooterSettingsPage,
  NavigationSettingsPage,
  PaymentSettingsPage,
  PopupSettingsPage,
  SeoSettingsPage,
  WebsiteSettingsPage,
} from './pages/admin/AdminSettingsForms';

function NotFoundPage() {
  return (
    <div className="shell py-24 text-center">
      <p className="eyebrow uppercase">404</p>
      <h1 className="display-face mt-2 text-3xl text-[#122B5C]">Page not found</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C]"
      >
        Go to homepage
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CmsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/lectures" element={<LecturesPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admission" element={<AdmissionPage />} />
            <Route path="/privacy-policy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<WebsiteSettingsPage />} />
            <Route path="navigation" element={<NavigationSettingsPage />} />
            <Route path="homepage" element={<HomepageSectionsPage />} />
            <Route path="about" element={<AboutPageEditor />} />
            <Route path="courses-page" element={<CoursesPageEditor />} />
            <Route path="campus" element={<CampusFacilitiesEditor />} />
            <Route path="hero" element={<HeroBannersPage />} />
            <Route path="popup" element={<PopupSettingsPage />} />
            <Route path="seo" element={<SeoSettingsPage />} />
            <Route path="footer" element={<FooterSettingsPage />} />
            <Route path="contact" element={<ContactSettingsPage />} />
            <Route path="storage" element={<AdminStoragePage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="enquiries" element={<EnquiriesAdminPage />} />
            <Route path="admissions" element={<AdmissionsAdminPage />} />
            <Route path="payments" element={<PaymentsAdminPage />} />
            <Route path="payment-settings" element={<PaymentSettingsPage />} />
            <Route path="account" element={<AdminAccountPage />} />
            <Route path=":module" element={<AdminCrudModule />} />
          </Route>
        </Routes>
      </CmsProvider>
    </BrowserRouter>
  );
}
