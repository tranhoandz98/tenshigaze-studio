# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Tổng quan Dự án

**Tenshigaze Studio** là hệ thống quản lý vận hành studio ảnh, bao gồm 4 phân hệ cốt lõi:
1. **Booking, Lịch chụp 8 bước & Tiền cọc**: Quản lý lịch hẹn (`Chờ xác nhận` → `Hoàn thành`), gói dịch vụ & phụ phí, tự động tính phần trăm thu tiền và công nợ còn phải thu.
2. **Phân công Ê-kíp & Cảnh báo trùng giờ**: Quản lý nhân sự/freelancer (`Photographer`, `Makeup`, `Sale`, `Retoucher`), phát hiện trùng ca chụp trong ngày (`Bận lịch khác` + gợi ý giờ trống kế tiếp) và đồng bộ Google Calendar.
3. **Album Google Drive & Khách chọn ảnh (`/p/:slug`)**: Đồng bộ ảnh từ Google Drive Folder, hỗ trợ nhiều danh sách chọn riêng (`Nhà trai`, `Nhà gái`, `Dâu & rể`) trên cùng 1 album, khách chọn ảnh không cần đăng nhập, thợ hậu kỳ 1-click sao chép chuỗi mã ảnh (`DSC_7178856...`) để lọc RAW trong Lightroom / Capture One.
4. **Lương khoán & Tài chính 7 Báo cáo**: Tự động tổng hợp lương khoán theo buổi chụp, lương cứng, hoa hồng % doanh số, thưởng/phạt; bấm **Chi trả** đẩy thẳng sang sổ Tài chính; xuất 7 loại báo cáo chuẩn CSV UTF-8 / Google Sheets.

---

## 2. Kiến trúc & Cấu trúc Thư mục

```text
D:\wamp64\www\tenshigaze-studio\
├── backend/                  # Laravel 13.38.0 REST API (chạy trên PHP 8.4.0)
│   ├── app/
│   │   ├── Http/Controllers/Api/   # 9 API Controllers (57 routes)
│   │   ├── Models/                 # 17 Eloquent Models
│   │   └── Services/               # ConflictDetectionService, GoogleDriveService
│   ├── database/
│   │   ├── migrations/             # 15 bảng MySQL (tenshigaze_studio)
│   │   └── seeders/DatabaseSeeder.php
│   └── routes/api.php
├── frontend/                 # React 19.3 + TypeScript 6.0 + Vite 8.3 + Tailwind CSS v4
│   ├── src/
│   │   ├── api/client.ts           # Axios client, formatVND, BOOKING_STEPS
│   │   ├── layouts/StudioLayout.tsx
│   │   └── pages/                  # Dashboard, Bookings, Albums, PublicAlbum (/p/:slug), Staff, Payroll, Finance, Settings
├── docs/                     # Tài liệu Spec-Driven (ARCHITECTURE.md, database/SCHEMA.md, specs/MODULES.md, features/*)
└── .claude/agents/           # 9 Subagents chuyên trách cho từng tầng của dự án
```

---

## 3. Lệnh Thường dùng (Build, Lint, Migrate, Run & Test)

### Backend (`backend/` — Bắt buộc dùng PHP 8.4 tại `D:\wamp64\bin\php\php8.4.0\php.exe`)
```bash
# Kiểm tra phiên bản Laravel 13.38 & PHP 8.4
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan --version

# Chạy lại Migration & Seeder dữ liệu mẫu của studio
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan migrate:fresh --seed

# Kiểm tra cú pháp file PHP sau khi sửa (BẮT BUỘC)
/d/wamp64/bin/php/php8.4.0/php.exe -l backend/app/Http/Controllers/Api/BookingController.php

# Liệt kê danh sách API routes
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan route:list --path=api

# Chạy toàn bộ test hoặc 1 test cụ thể (PHPUnit 12)
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan test
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan test --filter=ExampleTest

# Khởi chạy Backend API Server (:8000)
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan serve --host=127.0.0.1 --port=8000
```

### Frontend (`frontend/` — React 19 + TypeScript + Vite 8)
```bash
# Khởi chạy Frontend Dev Server (:5173, tự động proxy /api -> 127.0.0.1:8000)
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173

# Kiểm tra TypeScript & Build Production (BẮT BUỘC sau khi sửa UI)
npm --prefix frontend run build

# Chạy linter (oxlint)
npm --prefix frontend run lint
```

---

## 4. Hệ thống Subagents (`.claude/agents/`)

Khi cần phân tách công việc độc lập hoặc rà soát chuyên sâu, sử dụng các subagents đã được cấu hình sẵn trong `.claude/agents/`:
- `backend-dev`: Phát triển API Laravel 13 / PHP 8.4 (`backend/`), tối ưu `DB::transaction()` và kiểm tra `php -l`.
- `frontend-dev`: Phát triển giao diện React 19 + Vite 8 + Tailwind v4 (`frontend/`), kiểm tra `npm --prefix frontend run build`.
- `db-migrator`: Quản lý Migration & Seeder MySQL `tenshigaze_studio` (`InnoDB`, `defaultStringLength(191)`).
- `drive-sync-dev`: Chuyên trách đồng bộ Google Drive API v3, tách mã ảnh `DSC_...` và cổng khách chọn ảnh `/p/:slug`.
- `architect`: Thiết kế `plan.md` & `tasks.md` trong `docs/features/<ticket>/`.
- `spec-writer`: Biên soạn đặc tả nghiệp vụ `expect.md`.
- `unit-tester`: Xây dựng `testcase.md`, viết PHPUnit 12 test và kiểm thử trình duyệt.
- `code-reviewer`: Rà soát độc lập lỗi logic tài chính, trùng lịch chụp và bảo mật API.
- `devops`: Quản lý cấu hình môi trường WAMP, Google API credentials và phát hành.
