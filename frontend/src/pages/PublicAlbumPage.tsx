import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Camera,
  Heart,
  CheckCircle2,
  Send,
  Download,
  Maximize2,
  X,
  Filter,
} from 'lucide-react';
import { api } from '../api/client';

export const PublicAlbumPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadPublicAlbum = async () => {
    if (!slug) return;
    const res = await api.get(`/public/albums/${slug}`);
    const alb = res.data.album;
    setAlbum(alb);
    if (!activeListId && alb?.selection_lists?.length > 0) {
      setActiveListId(alb.selection_lists[0].id);
    }
  };

  useEffect(() => {
    loadPublicAlbum();
  }, [slug]);

  const activeList = (album?.selection_lists || []).find((l: any) => l.id === activeListId);
  const selectedPhotoIds = new Set<number>(
    (activeList?.items || []).map((it: any) => Number(it.album_photo_id))
  );

  const handleTogglePhoto = async (photoId: number) => {
    if (!slug || !activeListId) return;
    const res = await api.post(`/public/albums/${slug}/lists/${activeListId}/toggle-photo`, {
      photo_id: photoId,
    });
    setAlbum(res.data.album);
  };

  const handleSubmitSelection = async () => {
    if (!slug || !activeListId) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/public/albums/${slug}/lists/${activeListId}/submit`, {
        client_note: `Khách hoàn tất chọn ${selectedPhotoIds.size} ảnh`,
      });
      setAlbum(res.data.album);
      setToastMsg(`Đã gửi danh sách chọn "${activeList?.name}" thành công về Tenshigaze Studio!`);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-sm">
        Đang mở Album từ Google Drive...
      </div>
    );
  }

  const photos = (album.photos || []).filter((p: any) =>
    showOnlySelected ? selectedPhotoIds.has(p.id) : true
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Studio Branded Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-indigo-400 font-semibold">
                {album.watermark_text || 'TENSHIGAZE STUDIO'}
              </div>
              <h1 className="text-lg font-bold text-white">{album.title}</h1>
              <p className="text-xs text-slate-400">
                {album.photo_count} ảnh · {(album.selection_lists || []).length} danh sách chọn riêng
              </p>
            </div>
          </div>

          {/* Submit Current Selection List */}
          {activeList && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-white">
                  {activeList.name}: đã chọn {activeList.selected_count}/{activeList.quota_limit} ảnh
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeList.status === 'submitted' ? 'Đã gửi danh sách cho Studio' : 'Chạm vào ảnh để chọn'}
                </div>
              </div>

              <button
                onClick={handleSubmitSelection}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{activeList.status === 'submitted' ? 'Cập nhật danh sách' : 'Gửi danh sách đã chọn'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-List Switcher Bar ("Nhà trai 3", "Nhà gái 4", "Dâu & rể 5") */}
        <div className="max-w-7xl mx-auto pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Chọn ảnh cho danh sách:</span>
            {(album.selection_lists || []).map((lst: any) => {
              const isActive = lst.id === activeListId;
              return (
                <button
                  key={lst.id}
                  onClick={() => setActiveListId(lst.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{lst.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {lst.selected_count}/{lst.quota_limit}
                  </span>
                  {lst.status === 'submitted' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowOnlySelected(!showOnlySelected)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
              showOnlySelected
                ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showOnlySelected ? 'Đang lọc: Ảnh đã chọn' : 'Xem tất cả ảnh'}</span>
          </button>
        </div>
      </header>

      {toastMsg && (
        <div className="max-w-xl mx-auto mt-4 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold text-center">
          {toastMsg}
        </div>
      )}

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo: any) => {
            const isSelected = selectedPhotoIds.has(photo.id);
            return (
              <div
                key={photo.id}
                className={`group rounded-2xl overflow-hidden border transition ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="aspect-4/3 relative overflow-hidden bg-slate-900">
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.photo_code}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />

                  {/* Optional Studio Watermark */}
                  {album.watermark_enabled && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <span className="text-white/25 font-bold tracking-widest text-xs uppercase rotate-[-18deg] border border-white/15 px-2 py-0.5 rounded">
                        {album.watermark_text || 'TENSHIGAZE STUDIO'}
                      </span>
                    </div>
                  )}

                  {/* Top Right Zoom & Download */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => setLightboxPhoto(photo)}
                      className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs cursor-pointer"
                      title="Xem ảnh lớn"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    {album.allow_download && (
                      <a
                        href={photo.download_url || photo.preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs"
                        title="Tải ảnh"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Action Row ("Chọn DSC_7178856 cho Nhà trai") */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-200">{photo.photo_code}</span>
                  <button
                    onClick={() => handleTogglePhoto(photo.id)}
                    aria-label={`Chọn ${photo.photo_code} cho ${activeList?.name}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSelected ? 'fill-white text-white' : ''}`} />
                    <span>{isSelected ? 'Đã chọn' : `Chọn cho ${activeList?.name}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl flex items-center justify-between text-white mb-3">
            <div className="font-mono text-sm font-bold">{lightboxPhoto.photo_code}</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTogglePhoto(lightboxPhoto.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  selectedPhotoIds.has(lightboxPhoto.id)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {selectedPhotoIds.has(lightboxPhoto.id)
                  ? `Đã chọn trong ${activeList?.name}`
                  : `Chọn ${lightboxPhoto.photo_code} cho ${activeList?.name}`}
              </button>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-2 rounded-full bg-slate-800 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <img
            src={lightboxPhoto.preview_url}
            alt={lightboxPhoto.photo_code}
            className="max-h-[82vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
};
