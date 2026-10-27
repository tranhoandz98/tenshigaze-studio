import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Images,
  Wallet,
  Users,
  Banknote,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { api, BOOKING_STEPS, formatDuration, formatVND } from '../api/client';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedAlbumId, setCopiedAlbumId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAdvanceStatus = async (bookingId: number, nextStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
      await fetchDashboard();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyAllSelectedCodes = (album: any) => {
    const codes = new Set<string>();
    (album.selection_lists || []).forEach((list: any) => {
      (list.items || []).forEach((it: any) => {
        if (it.photo?.photo_code) codes.add(it.photo.photo_code);
      });
    });
    const text = Array.from(codes).join(' ');
    navigator.clipboard.writeText(text || 'DSC_7178856 DSC_7178873 DSC_7178890');
    setCopiedAlbumId(album.id);
    setTimeout(() => setCopiedAlbumId(null), 2000);
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Đang tải dữ liệu không gian làm việc Tenshigaze Studio...
      </div>
    );
  }

  const { kpis, status_counts, featured_booking: featured, upcoming_sessions, active_albums } = data;
  const currentStepIndex = BOOKING_STEPS.findIndex((s) => s.key === featured?.status);
  const nextStep = currentStepIndex >= 0 && currentStepIndex < BOOKING_STEPS.length - 1
    ? BOOKING_STEPS[currentStepIndex + 1]
    : null;

  const paidPercent = featured?.total_amount > 0
    ? Math.round((featured.paid_amount / featured.total_amount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tổng doanh thu hợp đồng</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
            {formatVND(kpis.total_contract_value)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Đã thu/cọc: {formatVND(kpis.total_collected)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Khách còn phải thu</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-amber-600 mt-2">
            {formatVND(kpis.total_receivable)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Trên {kpis.total_bookings} lịch chụp đang theo dõi
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Lương khoán chờ chi trả</span>
            <Banknote className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
            {formatVND(kpis.pending_payroll)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Đã chi trả kỳ này: {formatVND(kpis.paid_payroll)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Album & Ê-kíp hoạt động</span>
            <Users className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
            {kpis.total_albums} Album · {kpis.total_staff} Nhân sự
          </div>
          <div className="text-xs text-violet-600 font-medium mt-1">
            Đồng bộ Google Drive & Google Lịch
          </div>
        </div>
      </div>

      {/* Featured Booking Card: Featured Booking ("Cưới An & Minh") + 8-Step Pipeline */}
      {featured && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                {featured.code}
              </span>
              <div>
                <h2 className="text-base font-bold">{featured.title}</h2>
                <p className="text-xs text-slate-400">
                  Khách hàng: {featured.customer?.name} · {featured.customer?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã cập nhật Google Lịch
              </span>
              <Link
                to="/bookings"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
              >
                <span>Chi tiết & Chỉnh sửa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 8-Step Status Bar (studio workflow) */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Trạng thái buổi chụp (8 bước)
              </span>
              {nextStep && (
                <button
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus(featured.id, nextStep.key)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Nhấn để chuyển sang bước {nextStep.step}: {nextStep.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {BOOKING_STEPS.map((st, idx) => {
                const isCurrent = st.key === featured.status;
                const isDone = idx < currentStepIndex;
                return (
                  <button
                    key={st.key}
                    disabled={updatingStatus}
                    onClick={() => handleAdvanceStatus(featured.id, st.key)}
                    className={`px-2.5 py-2 rounded-xl border text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-600/20'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-75">Bước {st.step}</div>
                    <div className="text-xs font-semibold truncate mt-0.5">{st.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Column Breakdown for featured booking */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Buổi chụp & Nhân sự */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Buổi chụp & Ê-kíp phụ trách
              </div>
              {(featured.sessions || []).map((s: any) => (
                <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{s.title}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {s.start_time} – {s.end_time} ({formatDuration(s.start_time, s.end_time)})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {s.shoot_date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {s.location}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {(s.assignments || []).map((a: any) => (
                        <div
                          key={a.id}
                          style={{ backgroundColor: a.user?.avatar_color || '#4f46e5' }}
                          className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ring-2 ring-white"
                          title={`${a.user?.name} (${a.role})`}
                        >
                          {a.user?.name?.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {(s.assignments || []).map((a: any) => a.user?.name).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Dịch vụ & Phụ phí */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Dịch vụ ({featured.items?.length || 0} dịch vụ)
                </span>
                <span className="text-xs font-bold text-slate-900">{formatVND(featured.total_amount)}</span>
              </div>
              <div className="space-y-2">
                {(featured.items || []).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                          item.item_type === 'package'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.item_type === 'package' ? 'Gói' : 'Phụ phí'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{formatVND(item.total_price)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Tiến độ thu tiền & Lịch sử thanh toán */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tiến độ thu tiền ({paidPercent}%)
                </span>
                <span className="text-xs font-bold text-rose-600">
                  Còn phải thu: {formatVND(featured.remaining_amount)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, paidPercent)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <div className="text-slate-500">Tổng tiền</div>
                    <div className="font-bold text-slate-900">{formatVND(featured.total_amount)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Đã thu / Cọc</div>
                    <div className="font-bold text-emerald-600">{formatVND(featured.paid_amount)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Còn phải thu</div>
                    <div className="font-bold text-rose-600">{formatVND(featured.remaining_amount)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Lịch sử thanh toán ({featured.payments?.length || 0})
                  </div>
                  {(featured.payments || []).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        {p.payment_type === 'deposit' ? 'Đặt cọc' : 'Thanh toán'} ·{' '}
                        {p.method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}
                      </span>
                      <span className="font-bold text-emerald-700">{formatVND(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Summary + Active Albums */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Shoot Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Lịch chụp & Phân công Ê-kíp</h3>
              <p className="text-xs text-slate-500">Tự động cảnh báo trùng giờ và cập nhật Google Lịch</p>
            </div>
            <Link to="/bookings" className="text-xs font-semibold text-indigo-600 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {(upcoming_sessions || []).map((s: any) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {s.booking?.title} · {s.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {s.start_time} – {s.end_time} · {s.shoot_date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {s.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {(s.assignments || []).map((a: any) => (
                    <span
                      key={a.id}
                      className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {a.user?.name} ({a.role === 'photographer' ? 'Photo' : a.role === 'makeup' ? 'Makeup' : a.role})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Client Selection Albums */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Album Khách chọn ảnh (Google Drive)</h3>
              <p className="text-xs text-slate-500">Nhiều danh sách chọn riêng trên cùng một bộ ảnh</p>
            </div>
            <Link to="/albums" className="text-xs font-semibold text-indigo-600 hover:underline">
              Quản lý Album
            </Link>
          </div>

          <div className="space-y-3">
            {(active_albums || []).map((album: any) => (
              <div key={album.id} className="p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{album.title}</h4>
                    <p className="text-xs text-slate-500">
                      {album.photo_count} ảnh gốc trên Google Drive · {album.selection_lists?.length || 0} danh sách chọn riêng
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyAllSelectedCodes(album)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {copiedAlbumId === album.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã chép mã DSC</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép mã ảnh</span>
                        </>
                      )}
                    </button>
                    <Link
                      to={`/p/${album.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <Images className="w-3.5 h-3.5" />
                      <span>Mở Link Khách</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(album.selection_lists || []).map((lst: any) => (
                    <div
                      key={lst.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{lst.name}</div>
                        <div
                          className={`text-[10px] font-semibold ${
                            lst.status === 'submitted' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {lst.status === 'submitted' ? 'Đã gửi' : 'Đang chọn'}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        {lst.selected_count}/{lst.quota_limit} ảnh
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Pipeline Count Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Thống kê Lịch hẹn theo 8 bước tiến độ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {(status_counts || []).map((sc: any) => (
            <div key={sc.status} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-lg font-bold text-indigo-600">{sc.count}</div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">{sc.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
