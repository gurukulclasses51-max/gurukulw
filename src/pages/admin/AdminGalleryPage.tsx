import { useMemo, useState, type FormEvent } from 'react';
import { FolderPlus, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import type { GalleryAlbum, GalleryPhoto } from '../../types/cms';
import { InstituteImage } from '../../components/BrandMark';
import { AdminField, AdminModal, ConfirmDeleteModal } from './AdminField';
import { useAdminToast } from './AdminLayout';

export function AdminGalleryPage() {
  const { cms, reloadCms } = useCms();
  const { notify } = useAdminToast();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [busy, setBusy] = useState(false);

  // Album Modal
  const [albumModal, setAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [deleteAlbum, setDeleteAlbum] = useState<GalleryAlbum | null>(null);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    display_order: 0,
    is_published: true,
  });

  // Photo Modal
  const [photoModal, setPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [deletePhoto, setDeletePhoto] = useState<GalleryPhoto | null>(null);
  const [photoForm, setPhotoForm] = useState({
    album_id: '',
    title: '',
    caption: '',
    file_url: '',
    display_order: 0,
    is_published: true,
  });

  const filteredPhotos = useMemo(() => {
    if (!selectedAlbumId) return cms.galleryMedia;
    return cms.galleryMedia.filter((p) => p.album_id === selectedAlbumId);
  }, [cms.galleryMedia, selectedAlbumId]);

  function openNewAlbum() {
    setEditingAlbum(null);
    setAlbumForm({
      title: '',
      description: '',
      cover_image_url: '',
      display_order: cms.galleryAlbums.length,
      is_published: true,
    });
    setAlbumModal(true);
  }

  function openEditAlbum(album: GalleryAlbum) {
    setEditingAlbum(album);
    setAlbumForm({
      title: album.title,
      description: album.description || '',
      cover_image_url: album.cover_image_url || '',
      display_order: album.display_order ?? 0,
      is_published: album.is_published !== false,
    });
    setAlbumModal(true);
  }

  async function saveAlbum(e: FormEvent) {
    e.preventDefault();
    if (!albumForm.title.trim()) {
      notify('Album title is required.', 'error');
      return;
    }
    setBusy(true);
    await fetch(
      editingAlbum
        ? `/api/cms/entities/galleryAlbums/${editingAlbum.id}`
        : '/api/cms/entities/galleryAlbums',
      {
        method: editingAlbum ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumForm),
      }
    );
    await reloadCms();
    setBusy(false);
    setAlbumModal(false);
    notify(editingAlbum ? 'Album updated.' : 'Album created.');
  }

  async function confirmDeleteAlbum() {
    if (!deleteAlbum) return;
    setBusy(true);
    await fetch(`/api/cms/entities/galleryAlbums/${deleteAlbum.id}`, { method: 'DELETE' });
    await reloadCms();
    if (selectedAlbumId === deleteAlbum.id) setSelectedAlbumId('');
    setBusy(false);
    setDeleteAlbum(null);
    notify('Album deleted.');
  }

  function openNewPhoto() {
    setEditingPhoto(null);
    setPhotoForm({
      album_id: selectedAlbumId || cms.galleryAlbums[0]?.id || '',
      title: '',
      caption: '',
      file_url: '',
      display_order: cms.galleryMedia.length,
      is_published: true,
    });
    setPhotoModal(true);
  }

  function openEditPhoto(photo: GalleryPhoto) {
    setEditingPhoto(photo);
    setPhotoForm({
      album_id: photo.album_id || '',
      title: photo.title || '',
      caption: photo.caption || '',
      file_url: photo.file_url || '',
      display_order: photo.display_order ?? 0,
      is_published: photo.is_published !== false,
    });
    setPhotoModal(true);
  }

  async function savePhoto(e: FormEvent) {
    e.preventDefault();
    if (!photoForm.file_url.trim()) {
      notify('Photo image URL or upload is required.', 'error');
      return;
    }
    setBusy(true);
    await fetch(
      editingPhoto
        ? `/api/cms/entities/galleryMedia/${editingPhoto.id}`
        : '/api/cms/entities/galleryMedia',
      {
        method: editingPhoto ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoForm),
      }
    );
    await reloadCms();
    setBusy(false);
    setPhotoModal(false);
    notify(editingPhoto ? 'Photo updated.' : 'Photo added to gallery.');
  }

  async function togglePhotoPublish(photo: GalleryPhoto) {
    await fetch(`/api/cms/entities/galleryMedia/${photo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: photo.is_published === false }),
    });
    await reloadCms();
  }

  async function confirmDeletePhoto() {
    if (!deletePhoto) return;
    setBusy(true);
    await fetch(`/api/cms/entities/galleryMedia/${deletePhoto.id}`, { method: 'DELETE' });
    await reloadCms();
    setBusy(false);
    setDeletePhoto(null);
    notify('Photo deleted.');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[290px_1fr] lg:items-start">
      {/* Left Pane: Albums */}
      <div className="surface p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
          <h2 className="text-sm font-bold text-[#122B5C]">Albums</h2>
          <button
            type="button"
            onClick={openNewAlbum}
            className="inline-flex items-center gap-1 rounded-lg bg-[#122B5C] px-2.5 py-1.5 text-xs font-bold text-white"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSelectedAlbumId('')}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold ${
            selectedAlbumId === ''
              ? 'bg-[#122B5C] text-white'
              : 'text-[#122B5C] hover:bg-[#F4F7FC]'
          }`}
        >
          <span>All Photos</span>
          <span className="tabular-nums opacity-75">{cms.galleryMedia.length}</span>
        </button>

        <div className="space-y-1.5">
          {cms.galleryAlbums.map((album) => {
            const count = cms.galleryMedia.filter((p) => p.album_id === album.id).length;
            const active = selectedAlbumId === album.id;
            return (
              <div
                key={album.id}
                className={`rounded-xl border p-2.5 transition ${
                  active
                    ? 'border-[#122B5C] bg-[#F4F7FC]'
                    : 'border-[hsl(var(--border))] bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-xs font-bold text-[#122B5C]">{album.title}</p>
                    <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                      {count} photos · {album.is_published !== false ? 'Published' : 'Hidden'}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditAlbum(album)}
                      aria-label="Edit album"
                      className="rounded-md p-1 text-[#122B5C] hover:bg-white"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteAlbum(album)}
                      aria-label="Delete album"
                      className="rounded-md p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Photos */}
      <div className="surface p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#122B5C]">
              {selectedAlbumId
                ? cms.galleryAlbums.find((a) => a.id === selectedAlbumId)?.title || 'Album Photos'
                : 'All Gallery Photos'}
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
              Showing {filteredPhotos.length} photo(s)
            </p>
          </div>
          <button
            type="button"
            onClick={openNewPhoto}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#122B5C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0B1D40]"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            <span>Add photo</span>
          </button>
        </div>

        {filteredPhotos.length === 0 ? (
          <p className="py-12 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No photos in this album yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotos.map((photo) => {
              const published = photo.is_published !== false;
              return (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white"
                >
                  <InstituteImage
                    src={photo.file_url}
                    alt={photo.title || 'Gallery'}
                    className="h-40 w-full"
                  />
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="truncate text-xs font-bold text-[#122B5C]">
                        {photo.title || 'Untitled photo'}
                      </p>
                      {photo.caption && (
                        <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => togglePhotoPublish(photo)}
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          published
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                        }`}
                      >
                        {published ? 'Published' : 'Hidden'}
                      </button>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEditPhoto(photo)}
                          className="rounded-md border border-[hsl(var(--border))] p-1 text-[#122B5C] hover:bg-[#F4F7FC]"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletePhoto(photo)}
                          className="rounded-md border border-red-200 p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Album Modal */}
      <AdminModal
        open={albumModal}
        title={editingAlbum ? 'Edit Album' : 'New Album'}
        onClose={() => setAlbumModal(false)}
        maxWidth="max-w-lg"
      >
        <form onSubmit={saveAlbum} className="space-y-4">
          <AdminField
            label="Album title"
            required
            value={albumForm.title}
            onChange={(v) => setAlbumForm((p) => ({ ...p, title: String(v) }))}
          />
          <AdminField
            label="Description"
            type="textarea"
            rows={2}
            value={albumForm.description}
            onChange={(v) => setAlbumForm((p) => ({ ...p, description: String(v) }))}
          />
          <AdminField
            label="Cover image"
            type="image"
            value={albumForm.cover_image_url}
            onChange={(v) => setAlbumForm((p) => ({ ...p, cover_image_url: String(v) }))}
          />
          <AdminField
            label="Display order"
            type="number"
            value={albumForm.display_order}
            onChange={(v) => setAlbumForm((p) => ({ ...p, display_order: Number(v) }))}
          />
          <AdminField
            label="Published on website"
            type="switch"
            value={albumForm.is_published}
            onChange={(v) => setAlbumForm((p) => ({ ...p, is_published: Boolean(v) }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAlbumModal(false)}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold text-[#122B5C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white"
            >
              {busy ? 'Saving...' : 'Save album'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Photo Modal */}
      <AdminModal
        open={photoModal}
        title={editingPhoto ? 'Edit Photo' : 'Add Gallery Photo'}
        onClose={() => setPhotoModal(false)}
        maxWidth="max-w-lg"
      >
        <form onSubmit={savePhoto} className="space-y-4">
          <AdminField
            label="Album"
            type="select"
            value={photoForm.album_id}
            options={cms.galleryAlbums.map((a) => ({ label: a.title, value: a.id }))}
            onChange={(v) => setPhotoForm((p) => ({ ...p, album_id: String(v) }))}
          />
          <AdminField
            label="Photo"
            required
            type="image"
            value={photoForm.file_url}
            onChange={(v) => setPhotoForm((p) => ({ ...p, file_url: String(v) }))}
          />
          <AdminField
            label="Title"
            value={photoForm.title}
            onChange={(v) => setPhotoForm((p) => ({ ...p, title: String(v) }))}
          />
          <AdminField
            label="Caption"
            type="textarea"
            rows={2}
            value={photoForm.caption}
            onChange={(v) => setPhotoForm((p) => ({ ...p, caption: String(v) }))}
          />
          <AdminField
            label="Display order"
            type="number"
            value={photoForm.display_order}
            onChange={(v) => setPhotoForm((p) => ({ ...p, display_order: Number(v) }))}
          />
          <AdminField
            label="Published on website"
            type="switch"
            value={photoForm.is_published}
            onChange={(v) => setPhotoForm((p) => ({ ...p, is_published: Boolean(v) }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPhotoModal(false)}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold text-[#122B5C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#122B5C] px-4 py-2 text-xs font-bold text-white"
            >
              {busy ? 'Saving...' : 'Save photo'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={Boolean(deleteAlbum)}
        title="Delete album"
        description={`Delete album "${deleteAlbum?.title}"?`}
        busy={busy}
        onCancel={() => setDeleteAlbum(null)}
        onConfirm={confirmDeleteAlbum}
      />

      <ConfirmDeleteModal
        open={Boolean(deletePhoto)}
        title="Delete photo"
        description={`Remove "${deletePhoto?.title || 'this photo'}" from gallery?`}
        busy={busy}
        onCancel={() => setDeletePhoto(null)}
        onConfirm={confirmDeletePhoto}
      />
    </div>
  );
}
