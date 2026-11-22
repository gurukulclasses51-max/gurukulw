import type {
  AdminAccount,
  BannerItem,
  BlogArticle,
  CmsBundle,
  CourseItem,
  ExamItem,
  FacultyItem,
  GalleryAlbum,
  GalleryPhoto,
  HomepageSection,
  LectureItem,
  NavigationItem,
  PageSeoItem,
  PopupSetting,
  SiteSettings,
  StudentResultItem,
  TestimonialItem,
} from '../types/cms.ts';

export const ORIGINAL_IMAGES = {
  logo: '/src/assets/images/original/logo.png',
  favicon: '/src/assets/images/original/favicon.png',
  hero: '/src/assets/images/original/hero_default.png',
  mentoring: '/src/assets/images/original/intro_study_group.png',
  residential: '/src/assets/images/original/campus_residential.png',
  dayboarding: '/src/assets/images/original/campus_daycare.png',
  jee: '/src/assets/images/original/course_iit_jee.png',
  neet: '/src/assets/images/original/course_neet.png',
  fiveYear: '/src/assets/images/original/course_five_year.png',
  fourYear: '/src/assets/images/original/course_four_year.png',
  threeYear: '/src/assets/images/original/course_three_year.png',
  resultAtharv: '/src/assets/images/original/result_atharv.png',
  galleryClassroom: '/src/assets/images/original/gallery_classroom.png',
  galleryMentoring: '/src/assets/images/original/gallery_mentoring.png',
  galleryDesk: '/src/assets/images/original/gallery_desk.png',
  galleryExam: '/src/assets/images/original/gallery_exam.png',
};

export const CLASS_LEVELS = [
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Dropper / Repeater',
];

export const BATCH_PREFERENCES = [
  'Morning batch',
  'Afternoon batch',
  'Residential batch',
  'Day scholar batch',
  'Any available batch',
];

export const HOMEPAGE_SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  announcement: 'Important Admission Announcement',
  intro: 'About the Institute Intro',
  courses: 'Courses Offered',
  campus: 'Campus & Student Facilities',
  features: 'Why Families Choose Our Institute',
  achievements: 'Results & Academic Achievements',
  faculty: 'Faculty & Mentors',
  exams: 'Upcoming Examinations',
  lectures: 'Featured Video Lectures',
  testimonials: 'Student Testimonials',
  news: 'Latest News & Articles',
  gallery: 'Inside the Institute Gallery',
  faq: 'Frequently Asked Questions',
  enquiry: 'Admission Enquiry Form',
  contact: 'Visit the Institute',
  custom: 'Custom Content Section',
};

export const PAGE_SEO_KEYS = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'courses', label: 'Courses' },
  { key: 'exams', label: 'Exams' },
  { key: 'lectures', label: 'Lectures' },
  { key: 'results', label: 'Results' },
  { key: 'faculty', label: 'Faculty' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'blogs', label: 'Blogs' },
  { key: 'contact', label: 'Contact' },
  { key: 'admission', label: 'Admission' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms & Conditions' },
];

export const DEFAULT_ADMIN_ACCOUNT: AdminAccount = {
  full_name: 'Pradip Giri (Administrator)',
  email: 'gurukulclasses57@gmail.com',
  role: 'admin',
  passcode: 'gurukul2009',
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  key: 'main',
  institute_name: "Giri Sir's Gurukul Classes",
  tagline:
    'Disciplined teaching, personal attention and steady daily practice — for school, board and competitive examinations.',
  logo_url: ORIGINAL_IMAGES.logo,
  logo_width: '90',
  logo_height: '55',
  favicon_url: ORIGINAL_IMAGES.favicon,
  announcement_enabled: true,
  announcement_text: 'Admissions open for the new academic batch — limited seats per batch.',
  announcement_bg_color: '#FFBE1B',
  announcement_text_color: '#122B5C',
  header_bg_color: '#122B5C',
  header_text_color: '#FFFFFF',
  about_heading: 'Excellence in Education. Excellence in Results. Excellence in Life.',
  about_intro:
    "Giri Sir's Gurukul Classes, Chhatrapati Sambhajinagar, has been a trusted name in IIT-JEE and NEET preparation since 2009, consistently delivering outstanding results in India's most challenging competitive examinations.",
  about_mission: "We don't just prepare students for examinations; we prepare them for life.",
  about_story: [
    'Founded under the academic leadership of IITian Professor Pradip Giri, Gurukul Classes is built on a simple yet powerful philosophy: "Study with Enjoyment."',
    'Since 2009, we have been committed to nurturing academic excellence and helping students achieve their dreams through quality education, innovative teaching methodologies and personalized guidance.',
    'Our achievements reflect our dedication and academic excellence. Our students have secured prestigious JEE Advanced All India Ranks, including AIR 8 in the General Category and AIR 3 and AIR 4 in other categories, along with numerous two-digit and three-digit ranks. In NEET, our students have achieved outstanding scores of 677 and 675, with several others scoring above 600 marks. Our students have successfully earned admissions to IITs, NITs, IIITs, AIIMS and other leading engineering and medical institutions across India.',
    'What makes Gurukul different is our approach to learning. We believe education should inspire curiosity, build confidence and make learning enjoyable rather than stressful. Our unique teaching methodology focuses on conceptual clarity, innovative teaching techniques, systematic revision, daily practice, interactive learning, question-framing activities, regular assessments and individual mentoring.',
    'We provide a comprehensive academic environment dedicated to JEE, NEET and other competitive entrance examinations. Our structured academic programs, experienced faculty, personalized attention and continuous performance monitoring ensure that every student receives the guidance and support needed to achieve their goals.',
    'With dedicated residential campus facilities, separate accommodation for boys and girls, day-care and day-boarding facilities, and continuous academic supervision, we create a supportive and disciplined environment that encourages students to focus on their ambitions and reach their full potential.',
    'Since 2009, one commitment has remained unchanged: Every student deserves the opportunity to achieve excellence.',
  ].join('\n\n'),
  about_highlights: [
    { value: '2009', label: 'Established' },
    { value: 'AIR 8', label: 'JEE Advanced (General)' },
    { value: '677+', label: 'NEET score' },
    { value: 'IIT · NIT · AIIMS', label: "Our students' destinations" },
  ],
  courses_eyebrow: 'Courses offered',
  courses_title: 'IIT-JEE & NEET programmes at Gurukul',
  courses_description:
    'Two-year integrated courses for Class XI and XII, plus foundation programmes starting from Class VIII. Every programme combines school academics with disciplined competitive examination preparation.',
  courses_badge: 'Learn · Understand · Practise · Excel',
  courses_approach_eyebrow: 'Our approach',
  courses_approach_title: 'Learn · Understand · Practise · Excel',
  courses_approach_description:
    'An integrated learning system designed to prepare students for academic excellence and success in national-level competitive examinations.',
  courses_approach_steps: [
    {
      title: 'Learn',
      description: 'Understand fundamental concepts through structured classroom teaching.',
    },
    {
      title: 'Understand',
      description: 'Develop conceptual clarity with doubt-solving and application-based learning.',
    },
    {
      title: 'Practise',
      description: 'Improve through regular problem-solving, assignments and tests.',
    },
    {
      title: 'Excel',
      description:
        'Achieve academic and competitive examination goals with mock tests and revision.',
    },
  ],
  footer_about:
    'A neighbourhood gurukul for serious students — small batches, daily practice, weekly tests and honest feedback to parents.',
  footer_copyright: "© Giri Sir's Gurukul Classes. All rights reserved.",
  phone: '+91 9860968994',
  email: 'gurukulclassestech@gmail.com',
  whatsapp: '+91 8459847998',
  office_hours: 'Monday to Sunday, 8:00 AM – 8:00 PM',
  address: "Giri Sir's Gurukul Classes, Chhatrapati Sambhajinagar, Maharashtra, India",
  map_embed_url: '',
  map_link: '',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  twitter_url: '',
  payments_enabled: false,
  payment_fee_label: 'Admission registration fee ₹2,000',
  upi_id: '',
  payment_qr_url: '',
  bank_details: '',
  payment_instructions:
    'Complete the UPI or bank transfer and submit your transaction reference / UTR along with payment proof for verification by our office.',
  seo_title: "Giri Sir's Gurukul Classes | Coaching in Chhatrapati Sambhajinagar",
  seo_description:
    "Structured coaching for school, board and competitive examinations at Giri Sir's Gurukul Classes, Chhatrapati Sambhajinagar, Maharashtra.",
  seo_keywords: 'coaching classes, Chhatrapati Sambhajinagar, SSC, HSC, IIT-JEE, NEET, science coaching',
  og_image_url: ORIGINAL_IMAGES.hero,
  privacy_content: [
    'We collect only the information you submit through our enquiry and admission forms — name, contact details, class and course interest — so that our team can respond to you.',
    'Enquiry records are visible only to authorised institute staff. We do not sell or share your details with third parties.',
    'Photographs of students are published only with written permission. You may ask us to correct or remove your information at any time by contacting the institute.',
  ].join('\n\n'),
  terms_content: [
    'Course fees, batch timings and examination schedules are published by the institute and may change between academic terms.',
    'Admission is confirmed only after the institute verifies the application and records the applicable fee. Students are expected to attend regularly and follow institute discipline.',
    "Result and achievement information is published only after verification and consent. This website is a communication channel; it does not replace the institute's official notices.",
  ].join('\n\n'),
};

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'nav-h-0', label: 'Home', path: '/', location: 'header', display_order: 0, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-1', label: 'About', path: '/about', location: 'header', display_order: 1, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-2', label: 'Courses', path: '/courses', location: 'header', display_order: 2, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-3', label: 'Exams', path: '/exams', location: 'header', display_order: 3, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-4', label: 'Lectures', path: '/lectures', location: 'header', display_order: 4, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-5', label: 'Results', path: '/results', location: 'header', display_order: 5, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-6', label: 'Faculty', path: '/faculty', location: 'header', display_order: 6, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-7', label: 'Testimonials', path: '/testimonials', location: 'header', display_order: 7, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-8', label: 'Gallery', path: '/gallery', location: 'header', display_order: 8, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-9', label: 'Blogs', path: '/blogs', location: 'header', display_order: 9, is_visible: true, open_in_new_tab: false },
  { id: 'nav-h-10', label: 'Contact', path: '/contact', location: 'header', display_order: 10, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-0', label: 'Courses', path: '/courses', location: 'footer', display_order: 0, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-1', label: 'Exams', path: '/exams', location: 'footer', display_order: 1, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-2', label: 'Lectures', path: '/lectures', location: 'footer', display_order: 2, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-3', label: 'Results', path: '/results', location: 'footer', display_order: 3, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-4', label: 'Faculty', path: '/faculty', location: 'footer', display_order: 4, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-5', label: 'Gallery', path: '/gallery', location: 'footer', display_order: 5, is_visible: true, open_in_new_tab: false },
  { id: 'nav-f-6', label: 'Contact', path: '/contact', location: 'footer', display_order: 6, is_visible: true, open_in_new_tab: false },
];

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'banner-1',
    title: 'Where serious preparation meets personal attention',
    description:
      'Small batches, subject-specialist teachers and a disciplined daily rhythm — that is how we prepare students for school, board and competitive examinations.',
    image_url: ORIGINAL_IMAGES.hero,
    mobile_image_url: ORIGINAL_IMAGES.hero,
    deadline: '',
    primary_label: 'Apply for admission',
    primary_url: '/admission',
    secondary_label: 'Talk to us',
    secondary_url: '/contact',
    is_active: true,
    display_order: 0,
  },
];

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    key: 'hero',
    eyebrow: 'Admissions open',
    title: 'Where serious preparation meets personal attention',
    subtitle: 'Small batches, subject-specialist teachers and a disciplined daily rhythm',
    body: '',
    image_url: ORIGINAL_IMAGES.hero,
    button_label: 'Apply for admission',
    button_link: '/admission',
    display_order: 0,
    is_visible: true,
    items: [
      { title: 'Small batches', description: 'Limited seats so every student is tracked.' },
      { title: 'Daily practice', description: 'Guided problem solving every working day.' },
      { title: 'Parent updates', description: 'Regular, honest progress feedback.' },
    ],
  },
  {
    id: 'sec-announcement',
    key: 'announcement',
    eyebrow: '',
    title: 'Important admission announcement',
    subtitle: '',
    body: 'Admissions are open for the new academic batch. Batch strength is limited and seats are confirmed on a first-come basis. Visit the institute or submit an enquiry to receive the current course structure, batch timings and fee details from our admissions team.',
    image_url: '',
    button_label: 'Apply now',
    button_link: '/admission',
    display_order: 1,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-intro',
    key: 'intro',
    eyebrow: 'About the institute',
    title: 'A gurukul approach to modern academics',
    subtitle: 'Built on three things: teaching quality, practice and honest feedback.',
    body: "Giri Sir's Gurukul Classes is a neighbourhood coaching institute in Chhatrapati Sambhajinagar. We teach in small groups, track every student's daily work, and keep parents informed about real progress rather than vague assurances.\n\nOur classrooms mix direct teaching with guided practice. Students attempt problems in class, get their doubts cleared immediately, and carry a clear revision plan home. Weekly tests show exactly what needs work — before the IIT-JEE & NEET Examination.",
    image_url: ORIGINAL_IMAGES.mentoring,
    button_label: 'About the institute',
    button_link: '/about',
    display_order: 2,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-courses',
    key: 'courses',
    eyebrow: 'Programmes',
    title: 'Courses offered',
    subtitle: 'Coaching with subject-specific practice, tests and revision.',
    body: '',
    image_url: '',
    button_label: 'All courses',
    button_link: '/courses',
    display_order: 3,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-campus',
    key: 'campus',
    eyebrow: 'Campus & student facilities',
    title: 'More than coaching: an integrated residential and academic ecosystem',
    subtitle:
      "A comprehensive learning environment with facilities designed to support students' academic growth, discipline and overall development.",
    body: 'We aim to provide more than coaching: a complete academic ecosystem where students receive quality education, personal mentoring, disciplined study habits and the right guidance to achieve their career goals.',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 4,
    is_visible: true,
    items: [
      {
        icon: 'bed',
        title: 'Residential Campus',
        image_url: ORIGINAL_IMAGES.residential,
        description:
          'A safe, disciplined and fully supervised residential ecosystem for outstation students.',
        points: [
          'Separate residential facilities for boys and girls',
          'Safe, disciplined and student-friendly environment',
          'Supervised study hours and academic monitoring',
          'Regular mentoring and personal guidance',
        ],
      },
      {
        icon: 'sun',
        title: 'Day-Care / Day-Boarding Facility',
        image_url: ORIGINAL_IMAGES.dayboarding,
        description:
          'An extended campus day for day scholars, built around study, support and care.',
        points: [
          'Extended campus stay for day scholars',
          'Supervised study sessions and doubt-clearing support',
          'Meals and refreshments',
          'Academic monitoring and individual attention',
        ],
      },
    ],
  },
  {
    id: 'sec-features',
    key: 'features',
    eyebrow: 'Why us',
    title: 'Why families choose our institute',
    subtitle: "The routine behind every student's progress.",
    body: '',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 5,
    is_visible: true,
    items: [
      {
        title: 'Small batch strength',
        description: 'Enough seats to teach properly, few enough that no student is invisible.',
      },
      {
        title: 'Subject specialists',
        description: 'Each subject taught by a teacher who works on it daily.',
      },
      {
        title: 'Weekly assessment',
        description: 'Tests every week, corrections discussed the next class.',
      },
      {
        title: 'Doubt clearing hours',
        description: 'Dedicated time after class for individual doubts.',
      },
      {
        title: 'Parent communication',
        description: 'Regular updates on attendance, tests and behaviour.',
      },
      {
        title: 'Exam readiness',
        description: 'Paper pattern drills, time management and revision plans.',
      },
      {
        title: 'DPP – Daily Practice Test',
        description: 'A short daily practice paper in every subject, checked and discussed in class.',
      },
      {
        title: 'Teacher-supervised six-hour study',
        description: 'Six hours of daily study completed under the presence and observation of teachers.',
      },
    ],
  },
  {
    id: 'sec-achievements',
    key: 'achievements',
    eyebrow: 'Achievements',
    title: 'Results and academic achievements',
    subtitle: 'Verified student ranks and scores in IIT-JEE Advanced and NEET-UG.',
    body: '',
    image_url: '',
    button_label: 'View all results',
    button_link: '/results',
    display_order: 6,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-faculty',
    key: 'faculty',
    eyebrow: 'Our teachers',
    title: 'Faculty and mentors',
    subtitle: 'Teachers who stay with a student through the whole academic year.',
    body: '',
    image_url: '',
    button_label: 'Meet the faculty',
    button_link: '/faculty',
    display_order: 7,
    is_visible: false,
    items: [],
  },
  {
    id: 'sec-exams',
    key: 'exams',
    eyebrow: 'Assessments',
    title: 'Upcoming examinations',
    subtitle: 'Test and examination announcements with dates, timing and instructions.',
    body: '',
    image_url: '',
    button_label: 'All exam announcements',
    button_link: '/exams',
    display_order: 8,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-lectures',
    key: 'lectures',
    eyebrow: 'Revision',
    title: 'Featured video lectures',
    subtitle: 'Recorded explanations for revision at home.',
    body: '',
    image_url: '',
    button_label: 'Browse lectures',
    button_link: '/lectures',
    display_order: 9,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-testimonials',
    key: 'testimonials',
    eyebrow: 'Student voices',
    title: 'What students say',
    subtitle: "Feedback published with the student's permission.",
    body: '',
    image_url: '',
    button_label: 'Read more',
    button_link: '/testimonials',
    display_order: 10,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-news',
    key: 'news',
    eyebrow: 'Newsroom',
    title: 'Latest news and announcements',
    subtitle: 'Notices, schedules and study guidance from the institute.',
    body: '',
    image_url: '',
    button_label: 'All articles',
    button_link: '/blogs',
    display_order: 11,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-gallery',
    key: 'gallery',
    eyebrow: 'Gallery',
    title: 'Inside the institute',
    subtitle: 'Classrooms, study spaces and institute events.',
    body: '',
    image_url: '',
    button_label: 'Open gallery',
    button_link: '/gallery',
    display_order: 12,
    is_visible: false,
    items: [],
  },
  {
    id: 'sec-faq',
    key: 'faq',
    eyebrow: 'Help',
    title: 'Frequently asked questions',
    subtitle: 'Answers to what parents ask us most often before admission.',
    body: '',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 13,
    is_visible: true,
    items: [
      {
        title: 'How do I take admission?',
        description:
          'Submit the enquiry form on this website or visit the institute. Our team will explain the course structure, batch timings and fee before you confirm admission.',
      },
      {
        title: 'What is the batch strength?',
        description:
          "Batches are intentionally small so that each student's daily work can be checked. Exact strength is confirmed by the admissions team for the current term.",
      },
      {
        title: 'Are demo or trial classes available?',
        description:
          'Prospective students can request an interaction with the subject teacher before confirming admission. Ask the admissions team when you enquire.',
      },
      {
        title: 'How are parents updated?',
        description:
          'Parents receive regular updates on attendance, weekly test performance and areas that need attention.',
      },
      {
        title: 'Is study material provided?',
        description:
          'Printed practice sets and revision sheets are provided as part of the course. Details are shared at the time of admission.',
      },
    ],
  },
  {
    id: 'sec-enquiry',
    key: 'enquiry',
    eyebrow: 'Admissions',
    title: 'Admission enquiry',
    subtitle: 'Send us your details and the admissions team will call you back.',
    body: 'No online payment is collected on this website. Fees and seat confirmation are handled directly by the institute.',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 14,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-contact',
    key: 'contact',
    eyebrow: 'Campus visit',
    title: 'Visit the institute',
    subtitle: 'Talk to the admissions team in person or over the phone.',
    body: '',
    image_url: '',
    button_label: 'Contact details',
    button_link: '/contact',
    display_order: 15,
    is_visible: true,
    items: [],
  },
];

export const DEFAULT_POPUP_SETTING: PopupSetting = {
  key: 'main',
  is_enabled: false,
  delay_seconds: 12,
  title: 'Admission enquiry',
  description:
    'Share a few details and our admissions team will call you with the current batch timings and fee structure.',
  image_url: '',
  frequency: 'session',
  submit_label: 'Request a callback',
  show_parent_name: true,
  show_email: true,
  show_class: true,
  show_course: true,
  show_batch: true,
  show_message: false,
};

export const DEFAULT_PAGE_SEO: PageSeoItem[] = PAGE_SEO_KEYS.map((p) => ({
  id: `seo-${p.key}`,
  page_key: p.key,
  page_label: p.label,
  title: '',
  description: '',
}));

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'course-1',
    name: 'Two-Year IIT-JEE Integrated Regular Course',
    slug: 'two-year-iit-jee-integrated-course',
    category: 'IIT-JEE & NEET Two-Year Integrated Programme',
    class_level: 'Class XI & XII',
    subjects: 'Physics, Chemistry, Mathematics',
    target_exams: 'JEE Main, JEE Advanced, MHT-CET',
    duration: '2 Years',
    batch_info: 'Morning & Day-Boarding Integrated Batches',
    fee: 'Confirmed by admissions desk',
    description:
      'Integrated two-year classroom programme for IIT-JEE aspirants preparing for JEE Main, JEE Advanced and MHT-CET. Focus on conceptual learning, problem-solving and regular practice.',
    highlights: [
      'Integrated classroom learning',
      'Conceptual understanding',
      'Regular practice sessions',
      'Competitive examination preparation',
      'Academic progress tracking',
    ],
    eligibility: [
      'Students entering Class XI or Class XII',
      'Preparing for JEE Main, JEE Advanced and MHT-CET',
    ],
    methodology: [
      'Concept-first classroom teaching followed by guided problem solving',
      'Weekly tests with detailed discussion of solutions',
      'Periodic progress reports shared with parents',
    ],
    exam_preparation: [
      'JEE Main, JEE Advanced and MHT-CET pattern practice',
      'Previous-year papers and full-length mock tests',
      'Rank analysis and performance review after every test',
    ],
    admission_status: 'open',
    image_url: ORIGINAL_IMAGES.jee,
    is_featured: true,
    is_published: true,
    display_order: 1,
    is_demo: false,
  },
  {
    id: 'course-2',
    name: 'Two-Year NEET Integrated Regular Course',
    slug: 'two-year-neet-integrated-course',
    category: 'IIT-JEE & NEET Two-Year Integrated Programme',
    class_level: 'Class XI & XII',
    subjects: 'Physics, Chemistry, Biology',
    target_exams: 'NEET-UG, MHT-CET',
    duration: '2 Years',
    batch_info: 'Morning & Day-Boarding Integrated Batches',
    fee: 'Confirmed by admissions desk',
    description:
      'Integrated two-year classroom programme for NEET aspirants preparing for NEET-UG and MHT-CET. Focus on conceptual clarity, regular practice and examination preparation.',
    highlights: [
      'Integrated classroom learning',
      'NCERT-aligned conceptual teaching',
      'Regular practice sessions',
      'Competitive examination preparation',
      'Academic progress tracking',
    ],
    eligibility: [
      'Students entering Class XI or Class XII',
      'Preparing for NEET-UG and MHT-CET',
    ],
    methodology: [
      'Concept-first classroom teaching with diagram-based Biology learning',
      'Weekly tests with detailed discussion of solutions',
      'Periodic progress reports shared with parents',
    ],
    exam_preparation: [
      'NEET-UG and MHT-CET pattern practice',
      'NCERT-focused revision and previous-year papers',
      'Full-length mock tests with performance analysis',
    ],
    admission_status: 'open',
    image_url: ORIGINAL_IMAGES.neet,
    is_featured: true,
    is_published: true,
    display_order: 2,
    is_demo: false,
  },
  {
    id: 'course-3',
    name: 'Five-Year Foundation Programme',
    slug: 'five-year-foundation-programme',
    category: 'IIT-JEE & NEET Foundation Programme',
    class_level: 'Starts from Class VIII',
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    target_exams: 'IIT-JEE & NEET (early preparation)',
    duration: '5 Years',
    batch_info: 'School-aligned Morning / Evening Batches',
    fee: 'Confirmed by admissions desk',
    description:
      'Five-year integrated foundation programme starting from Class VIII. Develop strong conceptual foundations in Physics, Chemistry, Mathematics and Biology, alongside school academics and early competitive examination preparation.',
    highlights: [
      'Strong conceptual foundation',
      'School academic support',
      'Logical and analytical thinking',
      'Early competitive examination preparation',
      'Preparation for future IIT-JEE and NEET examinations',
    ],
    eligibility: [
      'Students entering Class VIII',
      'Five-year integrated programme with school academic support',
    ],
    methodology: [
      'Concept building with school syllabus support',
      'Regular assessments and doubt-solving sessions',
      'Analytical and reasoning practice to build exam temperament',
    ],
    exam_preparation: [
      'Early exposure to IIT-JEE and NEET level problem solving',
      'Foundation-level tests and Olympiad-style practice',
      'Structured revision of the school syllabus',
    ],
    admission_status: 'open',
    image_url: ORIGINAL_IMAGES.fiveYear,
    is_featured: false,
    is_published: true,
    display_order: 3,
    is_demo: false,
  },
  {
    id: 'course-4',
    name: 'Four-Year Foundation Programme',
    slug: 'four-year-foundation-programme',
    category: 'IIT-JEE & NEET Foundation Programme',
    class_level: 'Starts from Class IX',
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    target_exams: 'IIT-JEE & NEET (early preparation)',
    duration: '4 Years',
    batch_info: 'School-aligned Morning / Evening Batches',
    fee: 'Confirmed by admissions desk',
    description:
      'Four-year integrated foundation programme starting from Class IX. Develop strong conceptual foundations in Physics, Chemistry, Mathematics and Biology, alongside school academics and early competitive examination preparation.',
    highlights: [
      'Strong conceptual foundation',
      'School academic support',
      'Logical and analytical thinking',
      'Early competitive examination preparation',
      'Preparation for future IIT-JEE and NEET examinations',
    ],
    eligibility: [
      'Students entering Class IX',
      'Four-year integrated programme with school academic support',
    ],
    methodology: [
      'Concept building with school syllabus support',
      'Regular assessments and doubt-solving sessions',
      'Analytical and reasoning practice to build exam temperament',
    ],
    exam_preparation: [
      'Early exposure to IIT-JEE and NEET level problem solving',
      'Foundation-level tests and Olympiad-style practice',
      'Structured revision of the school syllabus',
    ],
    admission_status: 'open',
    image_url: ORIGINAL_IMAGES.fourYear,
    is_featured: false,
    is_published: true,
    display_order: 4,
    is_demo: false,
  },
  {
    id: 'course-5',
    name: 'Three-Year Foundation Programme',
    slug: 'three-year-foundation-programme',
    category: 'IIT-JEE & NEET Foundation Programme',
    class_level: 'Starts from Class X',
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    target_exams: 'IIT-JEE & NEET (early preparation)',
    duration: '3 Years',
    batch_info: 'School-aligned Morning / Evening Batches',
    fee: 'Confirmed by admissions desk',
    description:
      'Three-year integrated foundation programme starting from Class X. Completes the school syllabus with strong concepts in Physics, Chemistry, Mathematics and Biology while beginning structured competitive examination preparation.',
    highlights: [
      'Strong conceptual foundation',
      'School academic support',
      'Logical and analytical thinking',
      'Early competitive examination preparation',
      'Preparation for future IIT-JEE and NEET examinations',
    ],
    eligibility: [
      'Students entering Class X',
      'Three-year integrated programme with school academic support',
    ],
    methodology: [
      'Concept building with school syllabus support',
      'Regular assessments and doubt-solving sessions',
      'Analytical and reasoning practice to build exam temperament',
    ],
    exam_preparation: [
      'Early exposure to IIT-JEE and NEET level problem solving',
      'Foundation-level tests and Olympiad-style practice',
      'Structured revision of the school syllabus',
    ],
    admission_status: 'open',
    image_url: ORIGINAL_IMAGES.threeYear,
    is_featured: false,
    is_published: true,
    display_order: 5,
    is_demo: false,
  },
];

export const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    title: 'GPAT Exam 8th 2025-2026',
    class_level: 'Class 8',
    course_category: 'GPAT',
    exam_date: '2026-11-21',
    start_time: '21:25',
    duration_minutes: 60,
    instructions:
      'Complete all objective sections within 60 minutes. Log in 10 minutes before the scheduled start time.',
    status: 'open',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6b01bdf9eba0e1c2e3793adf&defaultLanguage=en',
    is_published: true,
    display_order: 1,
  },
  {
    id: 'exam-2',
    title: 'GPAT Exam 7th 2025-2026',
    class_level: 'Class 7',
    course_category: 'G-PAT',
    exam_date: '2026-11-21',
    start_time: '21:28',
    duration_minutes: 60,
    instructions:
      'Covers school Science and Mathematics fundamentals along with logical reasoning questions.',
    status: 'open',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6b01bf4a50ddfbf5dc182be6&defaultLanguage=en',
    is_published: true,
    display_order: 2,
  },
  {
    id: 'exam-3',
    title: 'GPAT Exam 9th 2025-2026',
    class_level: 'Class 9',
    course_category: 'G-PAT',
    exam_date: '2026-11-21',
    start_time: '21:29',
    duration_minutes: 60,
    instructions:
      'Assessment for students entering Class IX Foundation batches. Use a stable connection and keep rough paper ready.',
    status: 'open',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6afc35fd61b7e6204fe16677&defaultLanguage=en',
    is_published: true,
    display_order: 3,
  },
  {
    id: 'exam-4',
    title: 'GPAT Exam 10th 2025-2026',
    class_level: 'Class 10',
    course_category: 'G-PAT',
    exam_date: '2026-11-21',
    start_time: '21:30',
    duration_minutes: 60,
    instructions:
      'Scholarship and admission screening test for Class X students targeting the Three-Year Foundation Programme.',
    status: 'open',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6b01bf60f9a7e673f6c405fc&defaultLanguage=en',
    is_published: true,
    display_order: 4,
  },
];

export const DEFAULT_LECTURES: LectureItem[] = [
  {
    id: 'lec-1',
    title: 'Newton’s Laws & Free Body Diagrams — Core Approach',
    subject: 'Physics',
    class_level: 'Class 11',
    description:
      'Step-by-step framework for resolving forces, constraint relations, and avoiding common JEE & NEET mechanics traps.',
    duration_label: '42 min',
    video_url: '',
    thumbnail_url: ORIGINAL_IMAGES.hero,
    is_published: true,
    display_order: 1,
    is_demo: true,
  },
  {
    id: 'lec-2',
    title: 'Reaction Mechanisms & Stability of Intermediates',
    subject: 'Chemistry',
    class_level: 'Class 12',
    description:
      'Visualising inductive, resonance, and hyperconjugation effects to predict organic reaction pathways accurately.',
    duration_label: '38 min',
    video_url: '',
    thumbnail_url: ORIGINAL_IMAGES.jee,
    is_published: true,
    display_order: 2,
    is_demo: true,
  },
  {
    id: 'lec-3',
    title: 'NCERT Line-by-Line Revision: Human Physiology',
    subject: 'Biology',
    class_level: 'Class 11',
    description:
      'Diagram-driven conceptual walk-through aligned with high-weightage NEET-UG questions and assertion-reasoning drills.',
    duration_label: '45 min',
    video_url: '',
    thumbnail_url: ORIGINAL_IMAGES.neet,
    is_published: true,
    display_order: 3,
    is_demo: true,
  },
];

export const DEFAULT_RESULTS: StudentResultItem[] = [
  {
    id: 'res-1',
    student_name: 'Atharv Nandapurkar',
    achievement_title: 'IIT-JEE',
    class_level: 'Class 12',
    score: 'AIR 3',
    academic_year: '2025–26',
    photo_url: ORIGINAL_IMAGES.resultAtharv,
    document_url: '',
    is_featured: true,
    is_published: true,
    display_order: 1,
    is_demo: false,
  },
  {
    id: 'res-2',
    student_name: 'Gurukul Rankers Cohort',
    achievement_title: 'JEE Advanced General Rank',
    class_level: 'Class 12',
    score: 'AIR 8',
    academic_year: '2024–25',
    photo_url: '',
    document_url: '',
    is_featured: true,
    is_published: true,
    display_order: 2,
    is_demo: false,
  },
  {
    id: 'res-3',
    student_name: 'NEET Medical Topper',
    achievement_title: 'NEET-UG Top Score',
    class_level: 'Class 12',
    score: '677 / 720',
    academic_year: '2024–25',
    photo_url: '',
    document_url: '',
    is_featured: true,
    is_published: true,
    display_order: 3,
    is_demo: false,
  },
  {
    id: 'res-4',
    student_name: 'NEET Honours Cohort',
    achievement_title: 'NEET-UG Merit Score',
    class_level: 'Class 12',
    score: '675 / 720',
    academic_year: '2024–25',
    photo_url: '',
    document_url: '',
    is_featured: false,
    is_published: true,
    display_order: 4,
    is_demo: false,
  },
];

export const DEFAULT_FACULTY: FacultyItem[] = [
  {
    id: 'fac-1',
    name: 'Prof. Pradip Giri',
    role: 'Founder & Lead Academic Mentor',
    subjects: 'Physics · IIT-JEE & NEET',
    qualification: 'IITian · Academic Leadership since 2009',
    experience: '17+ years mentoring JEE & NEET toppers',
    description:
      'Leads Gurukul Classes with the core philosophy of "Study with Enjoyment", focusing on conceptual depth, daily supervised practice, and individual mentorship.',
    photo_url: '',
    is_published: true,
    display_order: 1,
    is_demo: false,
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    display_name: 'Advait Padhye',
    program: 'Class XI & XII Integrated Batch',
    quote:
      'I completed my 11th and 12th at Gurukul Classes. Earlier I struggled with concentration in my studies, and after meeting Giri Sir, my focus improved steadily with the right study direction and guidance.',
    rating: 5,
    photo_url: '',
    is_featured: true,
    is_published: true,
    display_order: 1,
    is_demo: false,
  },
];

export const DEFAULT_GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    id: 'campus',
    title: 'CAMPUS',
    description: 'Classrooms, residential facilities and supervised study spaces.',
    cover_image_url: ORIGINAL_IMAGES.residential,
    display_order: 1,
    is_published: true,
  },
];

export const DEFAULT_GALLERY_MEDIA: GalleryPhoto[] = [
  {
    id: 'gal-1',
    album_id: 'campus',
    title: 'CAMPUS',
    caption: 'Giri Sir’s Gurukul Classes residential & academic campus.',
    file_url: ORIGINAL_IMAGES.residential,
    display_order: 1,
    is_published: true,
  },
  {
    id: 'gal-2',
    album_id: 'campus',
    title: 'Classroom session',
    caption: 'Representative image of the teaching space.',
    file_url: ORIGINAL_IMAGES.galleryClassroom,
    display_order: 2,
    is_published: true,
  },
  {
    id: 'gal-3',
    album_id: 'campus',
    title: 'Mentoring',
    caption: 'One-to-one doubt clearing.',
    file_url: ORIGINAL_IMAGES.galleryMentoring,
    display_order: 3,
    is_published: true,
  },
  {
    id: 'gal-4',
    album_id: 'campus',
    title: 'Study practice',
    caption: 'Daily practice and revision.',
    file_url: ORIGINAL_IMAGES.galleryDesk,
    display_order: 4,
    is_published: true,
  },
];

export const DEFAULT_BLOGS: BlogArticle[] = [
  {
    id: 'blog-1',
    title: 'How to build a revision routine that actually sticks',
    slug: 'how-to-build-a-revision-routine',
    category: 'Study guidance',
    excerpt:
      'Revision works when it is scheduled, not when it is left to the last week. Here is the weekly routine we recommend to our students.',
    content: `Most students do not fail because they did not study. They struggle because the revision never happens in a planned way.

## Revise in short, fixed blocks

Pick two subjects for a 45-minute block each evening. Write down what you covered. A written log makes progress visible and stops you from re-reading the same chapter.

## Test yourself instead of only reading

Close the book and write what you remember. Then check. That single change is more useful than an extra hour of highlighting.

## Keep one full-length paper a week

Attempt a paper in one sitting, with a clock. Correct it the next day and list the three mistakes you will avoid next time.

## Ask before the doubt becomes a gap

Bring doubts to class the same week. A doubt that sits for a fortnight turns into a lost chapter.`,
    featured_image_url: ORIGINAL_IMAGES.galleryExam,
    author: 'Institute desk',
    published_date: '2026-10-20',
    seo_title: '',
    seo_description: '',
    is_published: true,
  },
  {
    id: 'blog-2',
    title: 'What parents should ask before choosing a coaching class',
    slug: 'what-parents-should-ask-before-choosing-coaching',
    category: 'Admissions',
    excerpt:
      'Batch size, teacher continuity and how progress is reported matter more than the size of the advertisement.',
    content: `Before you pay a fee, ask these questions at the institute.

## Who teaches the subject?

Ask to meet the actual subject teacher, not only the counsellor. Continuity through the year matters.

## How large is the batch?

A batch that is too large cannot be tracked. Ask the exact strength for your child's class.

## How will I know about progress?

Ask how often tests happen and how the results reach you. A written weekly or monthly update is more useful than a phone call only when marks fall.

## What happens if my child falls behind?

There should be a clear answer: doubt hours, extra practice sets, or a conversation with the parent — not just a warning.`,
    featured_image_url: ORIGINAL_IMAGES.galleryExam,
    author: 'Institute desk',
    published_date: '2026-10-05',
    seo_title: '',
    seo_description: '',
    is_published: true,
  },
];

export function createDefaultCms(): CmsBundle {
  return {
    siteSettings: { ...DEFAULT_SITE_SETTINGS, about_highlights: [...DEFAULT_SITE_SETTINGS.about_highlights], courses_approach_steps: [...DEFAULT_SITE_SETTINGS.courses_approach_steps] },
    navigationItems: DEFAULT_NAVIGATION_ITEMS.map((item) => ({ ...item })),
    homepageSections: DEFAULT_HOMEPAGE_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.map((it) => ({ ...it, points: it.points ? [...it.points] : undefined })),
    })),
    banners: DEFAULT_BANNERS.map((b) => ({ ...b })),
    popupSetting: { ...DEFAULT_POPUP_SETTING },
    pageSeo: DEFAULT_PAGE_SEO.map((p) => ({ ...p })),
    courses: DEFAULT_COURSES.map((c) => ({ ...c })),
    exams: DEFAULT_EXAMS.map((e) => ({ ...e })),
    lectures: DEFAULT_LECTURES.map((l) => ({ ...l })),
    results: DEFAULT_RESULTS.map((r) => ({ ...r })),
    faculty: DEFAULT_FACULTY.map((f) => ({ ...f })),
    testimonials: DEFAULT_TESTIMONIALS.map((t) => ({ ...t })),
    galleryAlbums: DEFAULT_GALLERY_ALBUMS.map((a) => ({ ...a })),
    galleryMedia: DEFAULT_GALLERY_MEDIA.map((m) => ({ ...m })),
    blogs: DEFAULT_BLOGS.map((b) => ({ ...b })),
  };
}

export function slugifyText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitParagraphs(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '')
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
