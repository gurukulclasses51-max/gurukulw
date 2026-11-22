import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { InstituteImage } from '../components/BrandMark';

export function BlogDetailPage() {
  const { slug } = useParams();
  const { cms } = useCms();
  const post = cms.blogs.find((b) => (b.slug === slug || b.id === slug) && b.is_published !== false);

  useEffect(() => {
    if (!post) return;
    if (post.seo_title) document.title = post.seo_title;
    if (post.seo_description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', post.seo_description);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="display-face text-3xl text-[#122B5C]">Article not found</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          This article may have been moved or removed.
        </p>
        <Link
          to="/blogs"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all articles</span>
        </Link>
      </div>
    );
  }

  const blocks = post.content.split('\n\n').filter(Boolean);

  return (
    <article className="shell max-w-3xl py-12 sm:py-16">
      <Link
        to="/blogs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[#122B5C]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>All articles</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
        <span className="text-[#0785D1]">{post.category}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Calendar className="h-3.5 w-3.5" />
          <span>{post.published_date}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          <span>{post.author}</span>
        </span>
      </div>

      <h1 className="display-face mt-3 text-[2rem] leading-tight text-[#122B5C] sm:text-[2.6rem]">
        {post.title}
      </h1>

      <p className="mt-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
        {post.excerpt}
      </p>

      {post.featured_image_url && (
        <div className="mt-7 h-[240px] overflow-hidden rounded-2xl bg-[#F4F7FC] sm:h-[340px]">
          <InstituteImage
            src={post.featured_image_url}
            alt={post.title}
            className="h-full w-full"
          />
        </div>
      )}

      <div className="prose-site mt-8">
        {blocks.map((block, idx) =>
          block.startsWith('## ') ? (
            <h2 key={idx}>{block.replace(/^##\s+/, '')}</h2>
          ) : (
            <p key={idx}>{block}</p>
          )
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-[hsl(var(--border))] bg-[#F4F7FC] p-6">
        <h2 className="text-base font-bold text-[#122B5C]">Thinking about admission?</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Speak to the admissions team about batches, subjects and fees.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex items-center justify-center rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C] hover:bg-[#f2b211]"
          >
            Apply for admission
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-[#122B5C]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#122B5C] hover:bg-[#F4F7FC]"
          >
            Contact us
          </Link>
        </div>
      </div>
    </article>
  );
}
