import React, { useEffect, useState } from 'react';
import { Banknote, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { api, formatVND, ROLE_LABELS } from '../api/client';

export const PayrollPage: React.FC = () => {
  const [month, setMonth] = useState(11);
  const [year] = useState(2026);
  const [period, setPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingBonusId, setEditingBonusId] = useState<number | null>(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusNote, setBonusNote] = useState('');

  const loadPayroll = async (m = month) => {
    setLoading(true);
    try {
      const res = await api.get('/payroll', { params: { month: m, year } });
      setPeriod(res.data.period);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll(month);
  }, [month]);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payroll/generate', { month, year });
      setPeriod(res.data.period);
    } finally {
      setLoading(false);
    }
  };

  const handlePayItem = async (itemId: number) => {
    const res = await api.post(`/payroll/items/${itemId}/pay`, {
      payment_method: 'bank_transfer',
    });
    setPeriod(res.data.period);
  };

  const handleSaveBonus = async (itemId: number) => {
    const res = await api.patch(`/payroll/items/${itemId}`, {
      bonus_adjustment: Number(bonusAmount || 0),
      adjustment_note: bonusNote,
    });
    setPeriod(res.data.period);
    setEditingBonusId(null);
  };

  const items = period?.items || [];

  return (
    <div className="space-y-6">
      {/* Payroll header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Cuối kỳ, biết cần trả bao nhiêu cho từng người
          </h2>
          <p className="text-xs text-slate-500">
            Tổng hợp lương khoán từ các buổi chụp, lương cố định và % doanh thu/doanh số. Bấm Chi trả để ghi nhận vào mục Tài chính.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => (m > 1 ? m - 1 : 12))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Tháng trước
          </button>
          <span className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Tháng {month}/{year}
          </span>
          <button
            onClick={() => setMonth((m) => (m < 12 ? m + 1 : 1))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
          >
            Tháng sau <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Tổng hợp lại kỳ lương</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      {period && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Tổng kỳ Tháng {period.month}/{period.year} · {items.length} người
              </div>
              <div className="text-2xl font-bold">{formatVND(period.total_amount)}</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <div className="text-slate-400">Đã chi trả</div>
              <div className="text-base font-bold text-emerald-400">{formatVND(period.paid_amount)}</div>
            </div>
            <div>
              <div className="text-slate-400">Cần trả kỳ này</div>
              <div className="text-base font-bold text-amber-400">
                {formatVND(Math.max(0, period.total_amount - period.paid_amount))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Items List (Huy, Linh, Vy...) */}
      <div className="space-y-4">
        {items.map((item: any) => {
          const isPaid = item.status === 'paid';
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    style={{ backgroundColor: item.user?.avatar_color || '#2563eb' }}
                    className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  >
                    {item.user?.name?.charAt(0)}
                  </div>
                  <span className="font-bold text-base text-slate-900">{item.user?.name}</span>
                  <span className="text-xs font-medium text-slate-500">
                    {ROLE_LABELS[item.user?.role] || item.user?.role}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                    Đã duyệt
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                    {item.user?.branch?.name || 'CN chính'}
                  </span>
                </div>

                {/* Wage Breakdown Pills */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  {item.task_wage_total > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Khoán: </span>
                      <strong className="text-slate-900">{formatVND(item.task_wage_total)}</strong>
                    </div>
                  )}
                  {item.base_salary > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Lương cứng: </span>
                      <strong className="text-slate-900">{formatVND(item.base_salary)}</strong>
                    </div>
                  )}
                  {item.commission_total > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">% Doanh thu/Doanh số: </span>
                      <strong className="text-slate-900">{formatVND(item.commission_total)}</strong>
                    </div>
                  )}
                  <div className="px-3 py-1.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2">
                    <span className="text-slate-600">Thưởng/ĐC: </span>
                    <strong className="text-indigo-700">
                      {item.bonus_adjustment >= 0 ? '+' : ''}
                      {formatVND(item.bonus_adjustment)}
                    </strong>
                    {!isPaid && (
                      <button
                        onClick={() => {
                          setEditingBonusId(item.id);
                          setBonusAmount(String(item.bonus_adjustment || 0));
                          setBonusNote(item.adjustment_note || '');
                        }}
                        className="text-indigo-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Sửa
                      </button>
                    )}
                  </div>
                </div>

                {editingBonusId === item.id && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="Thưởng (+) hoặc Phạt (-)"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-40"
                    />
                    <input
                      type="text"
                      value={bonusNote}
                      onChange={(e) => setBonusNote(e.target.value)}
                      placeholder="Lý do thưởng / điều chỉnh"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-56"
                    />
                    <button
                      onClick={() => handleSaveBonus(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>

              {/* Net Total & Pay Button */}
              <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Tổng thực nhận</div>
                  <div className="text-lg font-bold text-slate-900">{formatVND(item.net_total)}</div>
                </div>

                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã chi trả</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handlePayItem(item.id)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Chi trả
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
