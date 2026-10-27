import React, { useEffect, useState } from 'react';
import { Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { api, formatVND, ROLE_LABELS } from '../api/client';

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'photographer',
    is_freelancer: false,
    default_task_rate: '1200000',
    base_salary: '0',
    commission_rate: '0',
    google_calendar_email: '',
  });

  const loadStaff = async () => {
    const res = await api.get('/staff');
    const list = res.data.staff || [];
    setStaff(list);
    if (!selectedUser && list.length > 0) {
      handleSelectStaff(list[1] || list[0]);
    }
  };

  const handleSelectStaff = async (u: any) => {
    setSelectedUser(u);
    const res = await api.get(`/staff/${u.id}/schedule`);
    setSchedule(res.data.assignments || []);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/staff', {
      ...form,
      default_task_rate: Number(form.default_task_rate || 0),
      base_salary: Number(form.base_salary || 0),
      commission_rate: Number(form.commission_rate || 0),
    });
    setShowAddModal(false);
    loadStaff();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Biết ai phụ trách từng buổi chụp</h2>
          <p className="text-xs text-slate-500">
            Quản lý nhân viên chính thức & freelancer, định mức lương khoán và tự động đẩy lịch sang Google Lịch
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm nhân sự / Freelancer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-2.5">
          {staff.map((u) => (
            <div
              key={u.id}
              onClick={() => handleSelectStaff(u)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                selectedUser?.id === u.id
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/15'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: u.avatar_color || '#4f46e5' }}
                  className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center"
                >
                  {u.name?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{u.name}</span>
                    {u.is_freelancer && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                        Freelancer
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {ROLE_LABELS[u.role] || u.role} · {u.email}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                {u.default_task_rate > 0 && (
                  <div className="font-bold text-slate-900">Khoán: {formatVND(u.default_task_rate)}</div>
                )}
                {u.base_salary > 0 && (
                  <div className="font-bold text-indigo-600">Lương cứng: {formatVND(u.base_salary)}</div>
                )}
                {u.commission_rate > 0 && (
                  <div className="text-[11px] text-emerald-600">Hoa hồng: {u.commission_rate}%</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7">
          {selectedUser && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: selectedUser.avatar_color || '#4f46e5' }}
                    className="w-12 h-12 rounded-2xl text-white font-bold text-lg flex items-center justify-center"
                  >
                    {selectedUser.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Lịch của {selectedUser.name}</h3>
                    <p className="text-xs text-slate-500">
                      {ROLE_LABELS[selectedUser.role] || selectedUser.role} · Google Lịch:{' '}
                      {selectedUser.google_calendar_email || 'Chưa kết nối'}
                    </p>
                  </div>
                </div>

                {selectedUser.google_calendar_connected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối Google Lịch
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Các buổi chụp được phân công ({schedule.length} buổi)
                </div>

                {schedule.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                    Chưa có buổi chụp nào được phân công cho nhân sự này.
                  </div>
                ) : (
                  schedule.map((asg: any) => (
                    <div
                      key={asg.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {asg.session?.booking?.title} · {asg.session?.title}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {asg.session?.shoot_date} ({asg.session?.start_time} – {asg.session?.end_time})
                          </span>
                          <span>· {asg.session?.location}</span>
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-1">
                          Đã cập nhật giờ mới trên Google Lịch
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-500">Tiền khoán ca</div>
                        <div className="text-sm font-bold text-indigo-600">{formatVND(asg.task_fee)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Thêm Nhân sự / Freelancer</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Họ tên *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Vai trò *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="photographer">Photographer</option>
                    <option value="makeup">Makeup</option>
                    <option value="sale">Sale</option>
                    <option value="retoucher">Retoucher</option>
                    <option value="manager">Quản lý CN</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Mức khoán/ca (₫)</label>
                  <input
                    type="number"
                    value={form.default_task_rate}
                    onChange={(e) => setForm({ ...form, default_task_rate: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Lương cứng (₫)</label>
                  <input
                    type="number"
                    value={form.base_salary}
                    onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">% Hoa hồng</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.commission_rate}
                    onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_freelancer"
                  checked={form.is_freelancer}
                  onChange={(e) => setForm({ ...form, is_freelancer: e.target.checked })}
                />
                <label htmlFor="is_freelancer" className="text-slate-700 font-medium">
                  Cộng tác viên / Freelancer theo buổi chụp
                </label>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer"
                >
                  Lưu nhân sự
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
