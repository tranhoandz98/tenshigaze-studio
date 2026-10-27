import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function formatVND(amount: number | string | undefined | null): string {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' ₫';
}

export function formatDuration(start: string, end: string): string {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return '';
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${hours}h`;
}

export const BOOKING_STEPS = [
  { key: 'pending_confirmation', step: 1, label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { key: 'confirmed', step: 2, label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'shooting', step: 3, label: 'Đang chụp', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { key: 'selecting_photos', step: 4, label: 'Đang chọn ảnh', color: 'bg-violet-100 text-violet-800 border-violet-300' },
  { key: 'photos_selected', step: 5, label: 'Chọn ảnh xong', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { key: 'retouching', step: 6, label: 'Đang retouch', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300' },
  { key: 'retouched', step: 7, label: 'Đã retouch', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { key: 'completed', step: 8, label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Chủ Studio',
  manager: 'Quản lý CN',
  photographer: 'Photographer',
  makeup: 'Makeup',
  sale: 'Sale',
  retoucher: 'Retoucher',
};
