import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';

const inputCls =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#122B5C] focus:ring-2 focus:ring-[#122B5C]/15';

export function BlogsPage() {
  const { cms } = useCms();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const publishedBlogs = useMemo(
    () => cms.blogs.filter((b) => b.is_published !== false),
    [cms.blogs]
  );

  const categories = useMemo(
    () => [...new Set(publishedBlogs.map((b) => b.category).filter(Boolean))],
    [publishedBlogs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publishedBlogs.filter((b) => {
      const matchQ =
        !q || [b.title, b.excerpt, b.content].join(' ').toLowerCase().includes(q);
      const matchCat = !category || b.category === category;
      return matchQ && matchCat;
    });
  }, [publishedBlogs, query, category]);

  return (
    <div>
      <PageHero
        eyebrow="Newsroom"
        title="News and articles"
        description="Institute notices, exam guidance and study advice for students and parents."
      />

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="search"
              className={`${inputCls} pl-9`}
              placeholder="Search articles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search articles"
            />
          </div>

          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <article key={post.id} className="surface surface-hover flex flex-col overflow-hidden">
              <Link
                to={`/blogs/${post.slug}`}
                className="block h-44 overflow-hidden bg-[#F4F7FC]"
              >
                <InstituteImage
                  src={post.featured_image_url}
                  alt={post.title}
                  className="h-44 w-full"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#0785D1]">
                  <span>{post.category}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums text-[hsl(var(--muted-foreground))]">
                    <Calendar className="h-3 w-3" />
                    <span>{post.published_date}</span>
                  </span>
                </p>
                <h2 className="mt-2 text-lg font-bold leading-snug text-[#122B5C]">
                  <Link to={`/blogs/${post.slug}`} className="hover:text-[#0785D1]">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blogs/${post.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#122B5C] hover:text-[#0785D1]"
                >
                  <span>Read article</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
