import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import type { GalleryPhoto } from '../types/cms';
import { InstituteImage } from '../components/BrandMark';
import { PageHero } from '../components/PageHero';

export function GalleryPage() {
  const { cms } = useCms();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [active, setActive] = useState<GalleryPhoto | null>(null);

  const albums = useMemo(
    () => cms.galleryAlbums.filter((a) => a.is_published !== false),
    [cms.galleryAlbums]
  );

  const publishedAlbumIds = useMemo(
    () => new Set(albums.map((a) => a.id)),
    [albums]
  );

  const photos = useMemo(() => {
    return cms.galleryMedia.filter((item) => {
      if (item.is_published === false) return false;
      if (item.album_id && albums.length > 0 && !publishedAlbumIds.has(item.album_id)) {
        return false;
      }
      if (selectedAlbumId && item.album_id !== selectedAlbumId) return false;
      return true;
    });
  }, [cms.galleryMedia, albums.length, publishedAlbumIds, selectedAlbumId]);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="Inside the institute"
        description="Classrooms, study spaces and moments from the academic year. Photographs of students are published only with permission."
      />

      <section className="shell py-12 sm:py-16">
        {albums.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedAlbumId('')}
              className={`whitespace-nowrap shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                selectedAlbumId === ''
                  ? 'border-[#122B5C] bg-[#122B5C] text-white'
                  : 'border-[hsl(var(--border))] bg-white text-[#122B5C] hover:bg-[#F4F7FC]'
              }`}
            >
              All photos
            </button>
            {albums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbumId(album.id)}
                className={`whitespace-nowrap shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                  selectedAlbumId === album.id
                    ? 'border-[#122B5C] bg-[#122B5C] text-white'
                    : 'border-[hsl(var(--border))] bg-white text-[#122B5C] hover:bg-[#F4F7FC]'
                }`}
              >
                {album.title}
              </button>
            ))}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="surface p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No published photographs available in this album yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className="group relative block w-full overflow-hidden rounded-xl bg-[#0B1D40] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122B5C]"
              >
                <InstituteImage
                  src={item.file_url}
                  alt={item.title || 'Gallery photo'}
                  className="h-56 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1D40]/90 via-[#0B1D40]/40 to-transparent p-4">
                  <span className="block text-sm font-bold text-white">{item.title}</span>
                  {item.caption && (
                    <span className="mt-0.5 block text-xs text-white/75">{item.caption}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/85 p-3 backdrop-blur-xs sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.title || 'Gallery preview'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActive(null);
          }}
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-2.5 shadow-2xl sm:p-3">
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close image preview"
              className="absolute right-4 top-4 z-10 rounded-full bg-[#0B1D40]/80 p-2 text-white hover:bg-[#0B1D40] sm:right-5 sm:top-5"
            >
              <X className="h-4 w-4" />
            </button>
            <InstituteImage
              src={active.file_url}
              alt={active.title || 'Gallery photo'}
              fit="contain"
              className="max-h-[74vh] w-full rounded-xl bg-[#0B1D40]"
            />
            <p className="mt-2.5 px-2 pb-1 text-sm text-[hsl(var(--muted-foreground))]">
              <span className="font-bold text-[#122B5C]">{active.title}</span>
              {active.caption ? ` — ${active.caption}` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
