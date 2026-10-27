# Tài liệu Hệ thống Tenshigaze Studio

Hệ thống quản lý vận hành nội bộ **Tenshigaze Studio** được thiết kế cho hoạt động của studio ảnh, bao phủ trọn vẹn quy trình từ khi khách đặt lịch chụp đến khi bàn giao album và chốt tiền công ê-kíp.

## 1. Cấu trúc Thư mục `docs/` (Chuẩn Spec-Driven Rule 00–05)

```text
docs/
├── README.md                                  # Tổng quan tài liệu & điều hướng
├── ARCHITECTURE.md                            # Kiến trúc hệ thống (Laravel 13.38 + PHP 8.4 + React 19/Vite 8 + MySQL)
├── DESIGN.md                                  # Hệ thống thiết kế UI/UX (StudioLayout & Public Dark Gallery)
├── COMMANDS.md                                # Sổ tay lệnh chạy, migrate, lint, build & test
├── AGENTS-TEMPLATE.md                         # Quy ước phối hợp Agent & Spec-Driven workflow
├── database/
│   └── SCHEMA.md                              # Đặc tả 15 bảng cơ sở dữ liệu MySQL (tenshigaze_studio)
├── rules/                                     # Bộ quy tắc vận hành Spec-Driven (Rule 00 -> Rule 06)
├── specs/                                     # Đặc tả nghiệp vụ từng Domain (13 mục chuẩn _template.md)
│   ├── _template.md                           # Mẫu chuẩn Spec Domain
│   ├── booking.md                             # Domain 1: Booking, Lịch chụp 8 bước & Tiền cọc
│   ├── crew-schedule.md                       # Domain 2: Phân công Ê-kíp, Lịch cá nhân & Cảnh báo trùng giờ
│   ├── album-selection.md                     # Domain 3: Album Google Drive, Khách chọn ảnh (/p/:slug) & Copy mã DSC_
│   ├── payroll.md                             # Domain 4: Lương khoán, Lương cứng, Hoa hồng & Chi trả
│   ├── finance-report.md                      # Domain 5: Sổ Tài chính Thu/Chi & Xuất 7 Báo cáo CSV/Sheets
│   └── studio-config.md                       # Domain 6: Cấu hình Studio, Chi nhánh & Google Drive API Key
└── features/
    └── 001-tenshigaze-studio/
        ├── expect.md                          # Yêu cầu nghiệp vụ & Acceptance Criteria
        ├── plan.md                            # Thiết kế kỹ thuật chi tiết
        ├── tasks.md                           # Checklist triển khai & trạng thái hoàn thành
        └── testcase.md                        # Kịch bản kiểm thử API & E2E
```

## 2. Danh mục 9 Subagents chuyên trách (`.claude/agents/`)

| Subagent | Phạm vi phụ trách |
|---|---|
| `backend-dev` | Phát triển API Laravel 13.38 / PHP 8.4 (`backend/`), kiểm tra `php -l` bắt buộc |
| `frontend-dev` | Phát triển giao diện React 19 + TypeScript + Vite 8 + Tailwind v4 (`frontend/`), kiểm tra `npm run build` |
| `db-migrator` | Quản lý Migration & Seeder MySQL `tenshigaze_studio` |
| `drive-sync-dev` | Tích hợp Google Drive API v3, đồng bộ mã ảnh `DSC_...` & cổng khách chọn ảnh `/p/:slug` |
| `architect` | Thiết kế kiến trúc `plan.md` & phân rã `tasks.md` |
| `spec-writer` | Phân tích nghiệp vụ studio & biên soạn `expect.md`, `specs/*.md` |
| `unit-tester` | Viết `testcase.md`, chạy PHPUnit 12 & kiểm thử trình duyệt |
| `code-reviewer` | Rà soát độc lập DB Transaction, xung đột lịch chụp, bảo mật & chuẩn code |
| `devops` | Cấu hình môi trường WAMP, cổng chạy dịch vụ & quy trình phát hành |
