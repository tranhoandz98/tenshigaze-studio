import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  Plus,
  Download,
} from 'lucide-react';
import { api, formatVND } from '../api/client';

export const FinancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [txForm, setTxForm] = useState({
    type: 'expense',
    category: 'operating_expense',
    payment_method: 'bank_transfer',
    amount: '',
    title: '',
    description: '',
  });

  const loadFinance = async () => {
    const res = await api.get('/finance');
    setData(res.data);
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.title) return;
    await api.post('/finance/transactions', {
      ...txForm,
      amount: Number(txForm.amount),
    });
    setTxForm({
      type: 'expense',
      category: 'operating_expense',
      payment_method: 'bank_transfer',
      amount: '',
      title: '',
      description: '',
    });
    loadFinance();
  };

  if (!data) {
    return <div className="p-8 text-center text-xs text-slate-500">Đang tải dữ liệu Tài chính...</div>;
  }

  const { summary, customer_receivables, transactions, report_types } = data;

  return (
    <div className="space-y-6">
      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Tổng thu đã ghi nhận</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1.5">{formatVND(summary.total_income)}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Tổng chi (Lương & Vận hành)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1.5">{formatVND(summary.total_expense)}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Lợi nhuận dòng tiền</div>
          <div className="text-xl font-bold text-slate-900 mt-1.5">{formatVND(summary.net_profit)}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Khách còn phải thu</div>
          <div className="text-xl font-bold text-amber-600 mt-1.5">{formatVND(summary.total_receivable)}</div>
        </div>
      </div>

      {/* 7 Google Sheets / Excel Report Exports */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Xuất 7 loại báo cáo ra Google Sheets / Excel (CSV UTF-8)</span>
            </h3>
            <p className="text-xs text-slate-500">
              7 báo cáo của studio: Dashboard, Lịch hẹn, Tài chính, Khách hàng, Nhân viên, Lịch làm việc và Chi trả lương
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(report_types || []).map((rpt: any) => (
            <a
              key={rpt.key}
              href={`/api/reports/export/${rpt.key}`}
              download
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition flex flex-col justify-between gap-2"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">{rpt.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{rpt.description}</div>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 pt-1">
                <Download className="w-3.5 h-3.5" />
                <span>Tải bảng tính (.CSV)</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Receivables & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Thu từ khách & Ghi nhận thu chi thủ công */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Thu từ khách (Theo lịch hẹn)</h3>
            <div className="space-y-2.5">
              {(customer_receivables || []).map((b: any) => (
                <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{b.title}</span>
                    <span>{formatVND(b.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Đã cọc/thu: {formatVND(b.paid_amount)}</span>
                    <span className="font-semibold text-rose-600">Còn phải thu: {formatVND(b.remaining_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddTransaction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Tự ghi nhận khoản Thu / Chi phát sinh</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={txForm.type}
                onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="expense">Khoản Chi (-)</option>
                <option value="income">Khoản Thu (+)</option>
              </select>
              <select
                value={txForm.payment_method}
                onChange={(e) => setTxForm({ ...txForm, payment_method: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
              </select>
            </div>
            <input
              type="text"
              required
              placeholder="Nội dung (VD: Thuê đèn studio / Mua phông nền)"
              value={txForm.title}
              onChange={(e) => setTxForm({ ...txForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                placeholder="Số tiền (₫)"
                value={txForm.amount}
                onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold cursor-pointer"
              >
                Lưu sổ quỹ
              </button>
            </div>
          </form>
        </div>

        {/* Right: Sổ thu chi chi tiết */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Lịch sử Thu / Chi đã ghi nhận</h3>
          <div className="space-y-2.5">
            {(transactions || []).map((tx: any) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{tx.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {tx.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'} ·{' '}
                    {tx.description || tx.category}
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatVND(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
