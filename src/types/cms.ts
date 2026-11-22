export type AdmissionStatus = 'open' | 'closing_soon' | 'closed';
export type ExamStatus = 'upcoming' | 'open' | 'closed' | 'completed';
export type EnquiryStatus = 'new' | 'contacted' | 'follow_up' | 'interested' | 'admitted' | 'closed';
export type AdmissionAppStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface AboutHighlight {
  value: string;
  label: string;
}

export interface ApproachStep {
  title: string;
  description: string;
}

export interface SiteSettings {
  key: string;
  institute_name: string;
  tagline: string;
  logo_url: string;
  logo_width: string;
  logo_height: string;
  favicon_url: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_bg_color: string;
  announcement_text_color: string;
  header_bg_color: string;
  header_text_color: string;
  about_heading: string;
  about_intro: string;
  about_mission: string;
  about_story: string;
  about_highlights: AboutHighlight[];
  courses_eyebrow: string;
  courses_title: string;
  courses_description: string;
  courses_badge: string;
  courses_approach_eyebrow: string;
  courses_approach_title: string;
  courses_approach_description: string;
  courses_approach_steps: ApproachStep[];
  footer_about: string;
  footer_copyright: string;
  phone: string;
  email: string;
  whatsapp: string;
  office_hours: string;
  address: string;
  map_embed_url: string;
  map_link: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  payments_enabled: boolean;
  payment_fee_label: string;
  upi_id: string;
  payment_qr_url: string;
  bank_details: string;
  payment_instructions: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image_url: string;
  privacy_content: string;
  terms_content: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  location: 'header' | 'footer';
  display_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
}

export interface HomepageSectionItem {
  title?: string;
  description?: string;
  value?: string;
  label?: string;
  icon?: string;
  image_url?: string;
  points?: string[];
}

export interface HomepageSection {
  id: string;
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  button_label: string;
  button_link: string;
  display_order: number;
  is_visible: boolean;
  items: HomepageSectionItem[];
}

export interface BannerItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  mobile_image_url: string;
  deadline: string;
  primary_label: string;
  primary_url: string;
  secondary_label: string;
  secondary_url: string;
  is_active: boolean;
  display_order: number;
}

export interface PopupSetting {
  key: string;
  is_enabled: boolean;
  delay_seconds: number;
  title: string;
  description: string;
  image_url: string;
  frequency: 'session' | 'once' | 'always';
  submit_label: string;
  show_parent_name: boolean;
  show_email: boolean;
  show_class: boolean;
  show_course: boolean;
  show_batch: boolean;
  show_message: boolean;
}

export interface PageSeoItem {
  id: string;
  page_key: string;
  page_label: string;
  title: string;
  description: string;
}

export interface CourseItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  class_level: string;
  subjects: string;
  target_exams: string;
  duration: string;
  batch_info: string;
  fee: string;
  description: string;
  highlights: string[];
  eligibility: string[];
  methodology: string[];
  exam_preparation: string[];
  admission_status: AdmissionStatus;
  image_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  is_demo?: boolean;
}

export interface ExamItem {
  id: string;
  title: string;
  class_level: string;
  course_category: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  instructions: string;
  status: ExamStatus;
  registration_url: string;
  is_published: boolean;
  display_order: number;
  is_demo?: boolean;
}

export interface LectureItem {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  description: string;
  duration_label: string;
  video_url: string;
  thumbnail_url: string;
  is_published: boolean;
  display_order: number;
  is_demo?: boolean;
}

export interface StudentResultItem {
  id: string;
  student_name: string;
  achievement_title: string;
  class_level: string;
  score: string;
  academic_year: string;
  photo_url: string;
  document_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  is_demo?: boolean;
}

export interface FacultyItem {
  id: string;
  name: string;
  role: string;
  subjects: string;
  qualification: string;
  experience: string;
  description: string;
  photo_url: string;
  is_published: boolean;
  display_order: number;
  is_demo?: boolean;
}

export interface TestimonialItem {
  id: string;
  display_name: string;
  program: string;
  quote: string;
  rating: number;
  photo_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  is_demo?: boolean;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  display_order: number;
  is_published: boolean;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  title: string;
  caption: string;
  file_url: string;
  display_order: number;
  is_published: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  published_date: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
}

export interface FollowUpNote {
  text: string;
  author: string;
  created_at: string;
}

export interface EnquiryRecord {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string;
  class_level: string;
  course_name: string;
  preferred_batch: string;
  message: string;
  source: string;
  status: EnquiryStatus;
  notes?: FollowUpNote[];
  created_at: string;
}

export interface AdmissionRecord {
  id: string;
  reference: string;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string;
  class_level: string;
  course_name: string;
  preferred_batch: string;
  school: string;
  address: string;
  message: string;
  status: AdmissionAppStatus;
  notes?: FollowUpNote[];
  created_at: string;
}

export interface PaymentSubmission {
  id: string;
  student_name: string;
  phone: string;
  application_reference: string;
  amount: string;
  method: string;
  reference_note: string;
  proof_url: string;
  status: PaymentStatus;
  notes?: FollowUpNote[];
  created_at: string;
}

export interface AdminActivityItem {
  id: string;
  action: string;
  entity_name: string;
  record_label: string;
  actor_email: string;
  created_at: string;
}

export interface AdminAccount {
  full_name: string;
  email: string;
  role: string;
  passcode: string;
}

export interface CmsBundle {
  siteSettings: SiteSettings;
  navigationItems: NavigationItem[];
  homepageSections: HomepageSection[];
  banners: BannerItem[];
  popupSetting: PopupSetting;
  pageSeo: PageSeoItem[];
  courses: CourseItem[];
  exams: ExamItem[];
  lectures: LectureItem[];
  results: StudentResultItem[];
  faculty: FacultyItem[];
  testimonials: TestimonialItem[];
  galleryAlbums: GalleryAlbum[];
  galleryMedia: GalleryPhoto[];
  blogs: BlogArticle[];
}
