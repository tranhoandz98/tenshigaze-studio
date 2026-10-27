import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Calendar,
  Camera,
  Users,
  Images,
  Wallet,
  Banknote,
  LayoutDashboard,
  Settings,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/bookings', label: 'Lịch chụp & Cọc', icon: Calendar },
  { to: '/albums', label: 'Album Chọn ảnh', icon: Images },
  { to: '/staff', label: 'Ê-kíp & Phân công', icon: Users },
  { to: '/payroll', label: 'Lương khoán', icon: Banknote },
  { to: '/finance', label: 'Tài chính & Báo cáo', icon: Wallet },
  { to: '/settings', label: 'Cấu hình & Drive', icon: Settings },
];

export const StudioLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-950 text-white border-r border-slate-800">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-base leading-none">Tenshigaze</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Studio OS · Tenshigaze
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-800/80">
          <div className="bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Chi nhánh hoạt động</div>
            <div className="text-xs font-semibold text-white mt-0.5 flex items-center justify-between">
              <span>CN Chính - Tenshigaze</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> Google Sync
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-2.5">
          <Link
            to="/p/cuoi-an-minh"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 text-xs font-medium text-indigo-200 hover:border-indigo-400 transition"
          >
            <span>Mở trang Khách chọn ảnh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
              TG
            </div>
            <div className="text-xs">
              <div className="font-semibold text-white">Admin Tenshigaze</div>
              <div className="text-slate-400">Chủ Studio · Full quyền</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm lg:text-base font-bold text-slate-900">
                Lịch chụp rõ ràng. Công việc dễ dàng theo dõi.
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Quản lý lịch chụp, phân công ê-kíp, theo dõi tiền cọc và mã ảnh khách chọn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/p/cuoi-an-minh"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition"
            >
              <Images className="w-3.5 h-3.5" />
              <span>Link Khách chọn ảnh mẫu</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Tạo lịch chụp</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex items-center justify-around py-1.5 px-1">
        {NAV_ITEMS.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
