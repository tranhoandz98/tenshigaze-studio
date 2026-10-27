import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  UserPlus,
  CreditCard,
  Package,
} from 'lucide-react';
import { api, BOOKING_STEPS, formatDuration, formatVND, ROLE_LABELS } from '../api/client';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Booking Form
  const [newBooking, setNewBooking] = useState({
    title: '',
    customer_name: '',
    customer_phone: '',
    shoot_date: '2026-11-15',
    start_time: '07:30',
    end_time: '11:30',
    session_title: 'Buổi chụp chính',
    location: '',
    service_id: '',
    deposit_amount: '1000000',
    deposit_method: 'bank_transfer',
  });

  // Add Payment Form
  const [paymentForm, setPaymentForm] = useState({
    payment_type: 'installment',
    method: 'bank_transfer',
    amount: '',
    note: '',
  });

  // Add Service Item Form
  const [itemForm, setItemForm] = useState({
    name: '',
    item_type: 'package',
    unit_price: '',
  });

  // Assign Crew Form
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    role: 'photographer',
    task_fee: '1200000',
  });

  const loadBookings = async (keepSelectedId?: number) => {
    const res = await api.get('/bookings', {
      params: { status: statusFilter || undefined, search: search || undefined },
    });
    const list = res.data.bookings || [];
    setBookings(list);
    if (keepSelectedId) {
      const found = list.find((b: any) => b.id === keepSelectedId);
      if (found) setSelectedBooking(found);
    } else if (!selectedBooking && list.length > 0) {
      setSelectedBooking(list[0]);
    }
  };

  const loadServices = async () => {
    const res = await api.get('/services');
    setServices(res.data.services || []);
  };

  const checkSessionConflicts = async (session: any) => {
    if (!session) return;
    const res = await api.post('/bookings/check-conflicts', {
      shoot_date: session.shoot_date,
      start_time: session.start_time,
      end_time: session.end_time,
      exclude_session_id: session.id,
    });
    setAvailability(res.data.availability || []);
  };

  useEffect(() => {
    loadBookings();
    loadServices();
  }, [statusFilter]);

  useEffect(() => {
    const firstSession = selectedBooking?.sessions?.[0];
    if (firstSession) {
      checkSessionConflicts(firstSession);
    }
  }, [selectedBooking]);

  const handleStatusChange = async (status: string) => {
    if (!selectedBooking) return;
    const res = await api.patch(`/bookings/${selectedBooking.id}/status`, { status });
    setSelectedBooking(res.data.booking);
    loadBookings(selectedBooking.id);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !paymentForm.amount) return;
    const res = await api.post(`/bookings/${selectedBooking.id}/payments`, {
      ...paymentForm,
      amount: Number(paymentForm.amount),
    });
    setSelectedBooking(res.data.booking);
    setPaymentForm({ payment_type: 'installment', method: 'bank_transfer', amount: '', note: '' });
    loadBookings(selectedBooking.id);
  };

  const handleAddServiceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !itemForm.name || !itemForm.unit_price) return;
    const res = await api.post(`/bookings/${selectedBooking.id}/items`, {
      name: itemForm.name,
      item_type: itemForm.item_type,
      unit_price: Number(itemForm.unit_price),
      quantity: 1,
    });
    setSelectedBooking(res.data.booking);
    setItemForm({ name: '', item_type: 'package', unit_price: '' });
    loadBookings(selectedBooking.id);
  };

  const handleAssignCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = selectedBooking?.sessions?.[0];
    if (!selectedBooking || !session || !assignForm.user_id) return;
    const res = await api.post(
      `/bookings/${selectedBooking.id}/sessions/${session.id}/assignments`,
      {
        user_id: Number(assignForm.user_id),
        role: assignForm.role,
        task_fee: Number(assignForm.task_fee || 0),
      }
    );
    setSelectedBooking(res.data.booking);
    loadBookings(selectedBooking.id);
  };

  const handleRemoveAssignment = async (sessionId: number, assignmentId: number) => {
    if (!selectedBooking) return;
    const res = await api.delete(
      `/bookings/${selectedBooking.id}/sessions/${sessionId}/assignments/${assignmentId}`
    );
    setSelectedBooking(res.data.booking);
    loadBookings(selectedBooking.id);
  };

  const handleRescheduleSession = async (session: any, newStart: string, newEnd: string) => {
    if (!selectedBooking) return;
    const res = await api.put(`/bookings/${selectedBooking.id}/sessions/${session.id}`, {
      start_time: newStart,
      end_time: newEnd,
    });
    setSelectedBooking(res.data.booking);
    loadBookings(selectedBooking.id);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenService = services.find((s) => String(s.id) === String(newBooking.service_id)) || services[0];
    const res = await api.post('/bookings', {
      title: newBooking.title,
      customer_name: newBooking.customer_name,
      customer_phone: newBooking.customer_phone,
      status: 'confirmed',
      deposit_amount: Number(newBooking.deposit_amount || 0),
      deposit_method: newBooking.deposit_method,
      items: chosenService
        ? [
            {
              service_catalog_id: chosenService.id,
              name: chosenService.name,
              item_type: chosenService.type,
              quantity: 1,
              unit_price: chosenService.default_price,
            },
          ]
        : [],
      session: {
        title: newBooking.session_title || 'Buổi chụp chính',
        shoot_date: newBooking.shoot_date,
        start_time: newBooking.start_time,
        end_time: newBooking.end_time,
        location: newBooking.location,
      },
    });
    setShowCreateModal(false);
    setSelectedBooking(res.data.booking);
    loadBookings(res.data.booking.id);
  };

  const activeSession = selectedBooking?.sessions?.[0];
  const paidPercent =
    selectedBooking?.total_amount > 0
      ? Math.round((selectedBooking.paid_amount / selectedBooking.total_amount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Filter & Create Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
            placeholder="Tìm tên lịch chụp, mã BK, SĐT khách..."
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs w-64 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="">Tất cả 8 bước trạng thái</option>
            {BOOKING_STEPS.map((st) => (
              <option key={st.key} value={st.key}>
                {st.step}. {st.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lịch hẹn mới</span>
        </button>
      </div>

      {/* Main Split View: Booking List (Left) + Selected Booking Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-3">
          {bookings.map((b) => {
            const stepMeta = BOOKING_STEPS.find((s) => s.key === b.status) || BOOKING_STEPS[0];
            const isSelected = selectedBooking?.id === b.id;
            const session = b.sessions?.[0];
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/15 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400">{b.code}</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${stepMeta.color}`}>
                    {stepMeta.label}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">{b.title}</h3>
                {session && (
                  <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-3">
                    <span>
                      {session.start_time} – {session.end_time} ({formatDuration(session.start_time, session.end_time)})
                    </span>
                    <span>· {session.shoot_date}</span>
                  </div>
                )}
                {session?.location && (
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.location}</span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Tổng: </span>
                    <span className="font-bold text-slate-900">{formatVND(b.total_amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Còn thu: </span>
                    <span className="font-bold text-rose-600">{formatVND(b.remaining_amount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8">
          {selectedBooking ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-6 p-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedBooking.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã cập nhật Google Lịch
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1.5">{selectedBooking.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khách hàng: <strong className="text-slate-800">{selectedBooking.customer?.name}</strong> · SĐT:{' '}
                    {selectedBooking.customer?.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* 8-Step Interactive Progress Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái buổi chụp (Nhấn bước bất kỳ để cập nhật tiến độ)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOOKING_STEPS.map((st) => {
                    const active = selectedBooking.status === st.key;
                    return (
                      <button
                        key={st.key}
                        onClick={() => handleStatusChange(st.key)}
                        className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span className="opacity-70 mr-1">{st.step}.</span>
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 1: Buổi chụp, Phân công Ê-kíp & Cảnh báo trùng lịch */}
              {activeSession && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Buổi chụp & Phân công Nhân sự
                      </div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {activeSession.title} · {activeSession.start_time} → {activeSession.end_time} (
                        {formatDuration(activeSession.start_time, activeSession.end_time)}) · Ngày{' '}
                        {activeSession.shoot_date}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeSession.location || 'Tại Studio'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Crew List */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700">
                      Nhân sự phụ trách ({activeSession.assignments?.length || 0} nhân sự)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(activeSession.assignments || []).map((asg: any) => (
                        <div
                          key={asg.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              style={{ backgroundColor: asg.user?.avatar_color || '#4f46e5' }}
                              className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                            >
                              {asg.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{asg.user?.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {ROLE_LABELS[asg.role] || asg.role} · Khoán: {formatVND(asg.task_fee)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(activeSession.id, asg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Gỡ phân công"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Conflict Checker ("Tâm Photographer - Bận lịch khác - Thử dời sang 09:00") */}
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Kiểm tra lịch trống & Cảnh báo trùng giờ ngày {activeSession.shoot_date}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availability.map((stf) => (
                        <div
                          key={stf.user_id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            stf.has_conflict
                              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{stf.name}</span>
                              <span className="text-[10px] font-normal text-slate-500">
                                ({ROLE_LABELS[stf.role] || stf.role})
                              </span>
                            </div>
                            {stf.has_conflict ? (
                              <div className="text-[11px] text-rose-600 font-medium mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>
                                  Bận lịch khác ({stf.conflicts[0]?.booking_title}{' '}
                                  {stf.conflicts[0]?.start_time}–{stf.conflicts[0]?.end_time})
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-emerald-600">Lịch trống khung giờ này</div>
                            )}
                          </div>

                          {stf.has_conflict && stf.suggested_slot && (
                            <button
                              onClick={() =>
                                handleRescheduleSession(
                                  activeSession,
                                  stf.suggested_slot.start_time,
                                  stf.suggested_slot.end_time
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-semibold hover:bg-rose-700 shrink-0 cursor-pointer"
                            >
                              Thử dời sang {stf.suggested_slot.start_time}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Assign Crew Form */}
                    <form onSubmit={handleAssignCrew} className="flex flex-wrap items-center gap-2 pt-2">
                      <select
                        value={assignForm.user_id}
                        onChange={(e) => {
                          const u = availability.find((x) => String(x.user_id) === e.target.value);
                          setAssignForm({
                            user_id: e.target.value,
                            role: u?.role || 'photographer',
                            task_fee: String(u?.default_task_rate || 1000000),
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      >
                        <option value="">+ Chọn nhân sự phân công...</option>
                        {availability.map((u) => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name} ({ROLE_LABELS[u.role] || u.role}) {u.has_conflict ? '⚠️ Bận lịch khác' : ''}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={assignForm.task_fee}
                        onChange={(e) => setAssignForm({ ...assignForm, task_fee: e.target.value })}
                        placeholder="Tiền khoán (₫)"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs w-36"
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Phân công</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Section 2: Dịch vụ & Thanh toán / Tiền cọc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Services & Surcharges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-600" />
                      Dịch vụ ({selectedBooking.items?.length || 0} dịch vụ)
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatVND(selectedBooking.total_amount)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(selectedBooking.items || []).map((it: any) => (
                      <div
                        key={it.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{it.name}</div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            {it.item_type === 'package' ? 'Gói' : 'Phụ phí'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{formatVND(it.total_price)}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddServiceItem} className="p-3 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <div className="text-xs font-semibold text-slate-700">+ Thêm gói chụp hoặc phụ phí</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Tên dịch vụ / phụ phí"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Số tiền (₫)"
                        value={itemForm.unit_price}
                        onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={itemForm.item_type}
                        onChange={(e) => setItemForm({ ...itemForm, item_type: e.target.value })}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="package">Gói dịch vụ</option>
                        <option value="surcharge">Phụ phí</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                      >
                        Thêm dịch vụ
                      </button>
                    </div>
                  </form>
                </div>

                {/* Payments & Deposits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      Tiến độ thu tiền ({paidPercent}%)
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      Còn phải thu: {formatVND(selectedBooking.remaining_amount)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(100, paidPercent)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-slate-500">Tổng tiền</div>
                        <div className="font-bold">{formatVND(selectedBooking.total_amount)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Đã thu / Cọc</div>
                        <div className="font-bold text-emerald-600">{formatVND(selectedBooking.paid_amount)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Còn phải thu</div>
                        <div className="font-bold text-rose-600">{formatVND(selectedBooking.remaining_amount)}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-500">Lịch sử thanh toán</div>
                      {(selectedBooking.payments || []).map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <span>
                            {p.payment_type === 'deposit' ? 'Đặt cọc' : 'Thanh toán'} ·{' '}
                            {p.method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}
                          </span>
                          <span className="font-bold text-emerald-700">{formatVND(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAddPayment} className="p-3 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <div className="text-xs font-semibold text-slate-700">+ Ghi nhận tiền cọc / thanh toán mới</div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={paymentForm.payment_type}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="deposit">Đặt cọc</option>
                        <option value="installment">Thanh toán thêm</option>
                        <option value="settlement">Tất toán</option>
                      </select>
                      <select
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="bank_transfer">Chuyển khoản</option>
                        <option value="cash">Tiền mặt</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        placeholder="Số tiền đã nhận (₫)"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Ghi nhận thu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
              Chọn một lịch hẹn bên trái để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Tạo Lịch Chụp Mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Tên lịch hẹn / Buổi chụp *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cưới Tuấn & Ngọc"
                  value={newBooking.title}
                  onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tuấn & Ngọc"
                    value={newBooking.customer_name}
                    onChange={(e) => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0909..."
                    value={newBooking.customer_phone}
                    onChange={(e) => setNewBooking({ ...newBooking, customer_phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Ngày chụp</label>
                  <input
                    type="date"
                    value={newBooking.shoot_date}
                    onChange={(e) => setNewBooking({ ...newBooking, shoot_date: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Bắt đầu</label>
                  <input
                    type="time"
                    value={newBooking.start_time}
                    onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Kết thúc</label>
                  <input
                    type="time"
                    value={newBooking.end_time}
                    onChange={(e) => setNewBooking({ ...newBooking, end_time: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Địa điểm chụp</label>
                <input
                  type="text"
                  placeholder="VD: Nhà gái Quận 7 / Phim trường..."
                  value={newBooking.location}
                  onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Gói dịch vụ chính</label>
                  <select
                    value={newBooking.service_id}
                    onChange={(e) => setNewBooking({ ...newBooking, service_id: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatVND(s.default_price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tiền cọc ban đầu (₫)</label>
                  <input
                    type="number"
                    value={newBooking.deposit_amount}
                    onChange={(e) => setNewBooking({ ...newBooking, deposit_amount: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  Lưu lịch hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
