import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Images,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Plus,
  FolderGit2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../api/client';

export const AlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [activeListId, setActiveListId] = useState<number | 'all'>('all');
  const [copiedText, setCopiedText] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListQuota, setNewListQuota] = useState('6');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    drive_folder_url: 'https://drive.google.com/drive/folders/1TenshigazeDriveFolder_New',
    lists_raw: 'Nhà trai, Nhà gái, Dâu & rể',
  });

  const loadAlbums = async (keepId?: number) => {
    const res = await api.get('/albums');
    const list = res.data.albums || [];
    setAlbums(list);
    const targetId = keepId || selectedAlbum?.id || list[0]?.id;
    if (targetId) {
      const detail = await api.get(`/albums/${targetId}`);
      setSelectedAlbum(detail.data.album);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const handleSelectAlbum = async (id: number) => {
    const res = await api.get(`/albums/${id}`);
    setSelectedAlbum(res.data.album);
    setActiveListId('all');
  };

  const handleSyncDrive = async () => {
    if (!selectedAlbum) return;
    setSyncing(true);
    try {
      const res = await api.post(`/albums/${selectedAlbum.id}/sync-drive`, {
        drive_folder_url: selectedAlbum.drive_folder_url,
      });
      setSelectedAlbum(res.data.album);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !newListName) return;
    const res = await api.post(`/albums/${selectedAlbum.id}/lists`, {
      name: newListName,
      quota_limit: Number(newListQuota || 6),
    });
    setSelectedAlbum(res.data.album);
    setNewListName('');
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = createForm.lists_raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await api.post('/albums', {
      title: createForm.title,
      drive_folder_url: createForm.drive_folder_url,
      selection_lists: names.map((n) => ({ name: n, quota_limit: 6 })),
    });
    setShowCreateModal(false);
    setSelectedAlbum(res.data.album);
    loadAlbums(res.data.album.id);
  };

  // Compute selected photo codes for Lightroom / Capture One filter
  const getSelectedCodes = (listId: number | 'all'): string[] => {
    if (!selectedAlbum) return [];
    const codeSet = new Set<string>();
    (selectedAlbum.selection_lists || []).forEach((lst: any) => {
      if (listId === 'all' || lst.id === listId) {
        (lst.items || []).forEach((item: any) => {
          if (item.photo?.photo_code) {
            codeSet.add(item.photo.photo_code);
          }
        });
      }
    });
    return Array.from(codeSet);
  };

  const selectedCodes = getSelectedCodes(activeListId);
  const filterStringSpace = selectedCodes.join(' ');

  const copyCodes = (format: 'space' | 'comma') => {
    const str = format === 'space' ? selectedCodes.join(' ') : selectedCodes.join(', ');
    navigator.clipboard.writeText(str);
    setCopiedText(str);
    setTimeout(() => setCopiedText(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Gửi album Google Drive · Nhận danh sách mã ảnh khách chọn
          </h2>
          <p className="text-xs text-slate-500">
            Nhà trai, nhà gái, cô dâu & chú rể cùng xem một album, mỗi bên gửi danh sách riêng để sao chép mã ảnh hậu kỳ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Album từ Google Drive</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Album Selector */}
        <div className="lg:col-span-4 space-y-3">
          {albums.map((alb) => (
            <div
              key={alb.id}
              onClick={() => handleSelectAlbum(alb.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                selectedAlbum?.id === alb.id
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/15'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{alb.title}</h3>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {alb.photo_count} ảnh
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 truncate">
                Drive: {alb.drive_folder_id}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {(alb.selection_lists || []).map((lst: any) => (
                  <div key={lst.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{lst.name}</div>
                    <div className="text-[10px] font-semibold text-indigo-600">
                      {lst.selected_count}/{lst.quota_limit} ảnh
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Album Detail & Lightroom Copy Box */}
        <div className="lg:col-span-8">
          {selectedAlbum ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              {/* Top Info & Public Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedAlbum.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Google Drive Folder: {selectedAlbum.drive_folder_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncDrive}
                    disabled={syncing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Đồng bộ lại Google Drive</span>
                  </button>

                  <Link
                    to={`/p/${selectedAlbum.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span>Mở trang Khách chọn ảnh (/p/{selectedAlbum.slug})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Multi-List Tabs (Nhà trai / Nhà gái / Dâu & rể / Gộp tất cả) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveListId('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        activeListId === 'all'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Gộp tất cả danh sách ({getSelectedCodes('all').length} mã ảnh)
                    </button>

                    {(selectedAlbum.selection_lists || []).map((lst: any) => (
                      <button
                        key={lst.id}
                        onClick={() => setActiveListId(lst.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 cursor-pointer ${
                          activeListId === lst.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span>{lst.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/10 text-[10px]">
                          {lst.selected_count}/{lst.quota_limit} ảnh
                        </span>
                        {lst.status === 'submitted' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Quick Add Selection List */}
                  <form onSubmit={handleAddList} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="+ Tên danh sách mới..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs w-36"
                    />
                    <input
                      type="number"
                      value={newListQuota}
                      onChange={(e) => setNewListQuota(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs w-14"
                      title="Số ảnh tối đa"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Thêm
                    </button>
                  </form>
                </div>

                {/* Lightroom / Capture One Photo Code Copy Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-300">
                      Danh sách mã ảnh đã chọn ({selectedCodes.length} ảnh) — Dùng lọc file RAW trong Lightroom / Capture One
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCodes('space')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold cursor-pointer"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? 'Đã sao chép mã ảnh!' : 'Sao chép mã ảnh (Cách khoảng)'}</span>
                      </button>
                      <button
                        onClick={() => copyCodes('comma')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép dạng dấu phẩy</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all">
                    {filterStringSpace || 'Chưa có ảnh nào được chọn trong danh sách này'}
                  </div>
                </div>
              </div>

              {/* Photo Grid with Selection Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(selectedAlbum.photos || []).map((photo: any) => {
                  const chosenByLists = (selectedAlbum.selection_lists || []).filter((lst: any) =>
                    (lst.items || []).some((it: any) => it.album_photo_id === photo.id)
                  );
                  const isHighlighted = selectedCodes.includes(photo.photo_code);

                  return (
                    <div
                      key={photo.id}
                      className={`group rounded-xl overflow-hidden border transition ${
                        isHighlighted
                          ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20'
                          : 'border-slate-200 bg-white opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-4/3 bg-slate-100 relative overflow-hidden">
                        <img
                          src={photo.thumbnail_url}
                          alt={photo.photo_code}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {chosenByLists.length > 0 && (
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {chosenByLists.map((lst: any) => (
                              <span
                                key={lst.id}
                                className="px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold shadow-xs"
                              >
                                {lst.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-800">{photo.photo_code}</span>
                        <span className="text-[10px] text-slate-400">{photo.filename}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Tạo Album từ Thư mục Google Drive</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Tên Album *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Album Pre-wedding Lan & Khánh"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Link Thư mục Google Drive *</label>
                <input
                  type="text"
                  required
                  value={createForm.drive_folder_url}
                  onChange={(e) => setCreateForm({ ...createForm, drive_folder_url: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Các danh sách chọn riêng (phân cách dấu phẩy)</label>
                <input
                  type="text"
                  value={createForm.lists_raw}
                  onChange={(e) => setCreateForm({ ...createForm, lists_raw: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer"
                >
                  Đồng bộ Drive & Tạo Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
