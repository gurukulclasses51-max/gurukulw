import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileText,
  Inbox,
  LayoutGrid,
  Sparkles,
  Video,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import type { AdminActivityItem, AdmissionRecord, EnquiryRecord } from '../../types/cms';

export function AdminDashboard() {
  const { cms } = useCms();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/api/enquiries').then((r) => r.json()),
      fetch('/api/admissions').then((r) => r.json()),
      fetch('/api/cms/activity').then((r) => r.json()),
    ])
      .then(([eData, aData, actData]) => {
        if (!mounted) return;
        setEnquiries(Array.isArray(eData.items) ? eData.items : []);
        setAdmissions(Array.isArray(aData.items) ? aData.items : []);
        setActivity(Array.isArray(actData.items) ? actData.items : []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const publishedCourses = cms.courses.filter((c) => c.is_published !== false).length;
  const publishedLectures = cms.lectures.filter((l) => l.is_published !== false).length;
  const upcomingExams = cms.exams.filter(
    (ex) => ex.is_published !== false && (ex.status === 'upcoming' || ex.status === 'open')
  ).length;
  const publishedBlogs = cms.blogs.filter((b) => b.is_published !== false).length;

  const kpis = [
    {
      label: 'Total enquiries',
      value: enquiries.length,
      to: '/admin/enquiries',
      icon: Inbox,
    },
    {
      label: 'New enquiries',
      value: newEnquiries,
      to: '/admin/enquiries',
      icon: Inbox,
    },
    {
      label: 'Admission applications',
      value: admissions.length,
      to: '/admin/admissions',
      icon: ClipboardList,
    },
    {
      label: 'Published courses',
      value: publishedCourses,
      to: '/admin/courses',
      icon: BookOpen,
    },
    {
      label: 'Published lectures',
      value: publishedLectures,
      to: '/admin/lectures',
      icon: Video,
    },
    {
      label: 'Upcoming exams',
      value: upcomingExams,
      to: '/admin/exams',
      icon: CalendarClock,
    },
    {
      label: 'Published articles',
      value: publishedBlogs,
      to: '/admin/blogs',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="surface surface-hover flex items-center justify-between gap-3 p-4"
          >
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#122B5C] tabular-nums">
                {loading && label.includes('enquiries') ? '—' : value}
              </p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F4F7FC] text-[#122B5C]">
              <Icon className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Shortcuts */}
      <div className="surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#122B5C]">Quick shortcuts</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Jump directly to frequently edited website sections
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/homepage"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#0785D1]" />
              <span>Homepage sections</span>
            </Link>
            <Link
              to="/admin/hero"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0785D1]" />
              <span>Hero banners</span>
            </Link>
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#0785D1]" />
              <span>Courses</span>
            </Link>
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B1D40]"
            >
              <span>Website settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Enquiries & Recent Admin Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface p-5">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <h2 className="text-sm font-bold text-[#122B5C]">Recent enquiries</h2>
            <Link
              to="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0785D1] hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <p className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              No enquiries submitted yet. Enquiries from the website and admission popup appear here.
            </p>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {enquiries.slice(0, 6).map((enq) => (
                <li key={enq.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#122B5C]">
                      {enq.student_name}
                    </p>
                    <p className="truncate text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                      {enq.phone} · {enq.class_level || 'Class unspecified'}
                      {enq.course_name ? ` · ${enq.course_name}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold capitalize text-[#0785D1]">
                      {enq.status.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                      {new Date(enq.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface p-5">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#122B5C]">
              <Activity className="h-4 w-4 text-[#0785D1]" />
              <span>Recent admin activity</span>
            </h2>
            <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
              Last {Math.min(activity.length, 10)} actions
            </span>
          </div>

          {activity.length === 0 ? (
            <p className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Changes made to settings, sections, courses, and admissions will be logged here.
            </p>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {activity.slice(0, 10).map((act) => (
                <li key={act.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-[hsl(var(--foreground))]">
                      <span className="font-semibold capitalize text-[#122B5C]">
                        {act.action}
                      </span>{' '}
                      <span className="font-medium">{act.entity_name}</span>
                      {act.record_label ? ` — ${act.record_label}` : ''}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                      {act.actor_email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                    {new Date(act.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
