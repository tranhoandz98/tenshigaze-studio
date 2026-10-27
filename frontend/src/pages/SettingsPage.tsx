import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, FolderGit2 } from 'lucide-react';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data.settings || {}));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.put('/settings', { settings });
    setSettings(res.data.settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cấu hình Tenshigaze Studio & Kết nối Google Drive</h2>
            <p className="text-xs text-slate-500">
              Thiết lập thương hiệu, watermark trang chọn ảnh và Google Drive API Key để đồng bộ album trực tiếp
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu cấu hình
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Tên Studio</label>
              <input
                type="text"
                value={settings.studio_name || ''}
                onChange={(e) => setSettings({ ...settings, studio_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Hotline Studio</label>
              <input
                type="text"
                value={settings.studio_phone || ''}
                onChange={(e) => setSettings({ ...settings, studio_phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Chữ ký Watermark mặc định trên trang Khách chọn ảnh</label>
            <input
              type="text"
              value={settings.watermark_default_text || ''}
              onChange={(e) => setSettings({ ...settings, watermark_default_text: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span>Kết nối Google Drive API v3 (Đồng bộ Album ảnh gốc)</span>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Google Cloud Drive API Key (Tùy chọn)</label>
              <input
                type="text"
                placeholder="AIzaSy... (Để trống để dùng chế độ đồng bộ thông minh mặc định)"
                value={settings.google_drive_api_key || ''}
                onChange={(e) => setSettings({ ...settings, google_drive_api_key: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Thư mục Google Drive gốc của Studio</label>
              <input
                type="text"
                value={settings.google_drive_root_folder || ''}
                onChange={(e) => setSettings({ ...settings, google_drive_root_folder: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu cài đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
