# AGENTS-TEMPLATE — Quy chuẩn Làm việc cho dự án Tenshigaze Studio

Tài liệu này quy định cách các AI Agents và Subagents phối hợp trong dự án **Tenshigaze Studio** (`D:\wamp64\www\tenshigaze-studio`).

## 1. Định vị các Thành phần trong Workspace

| Thư mục | Công nghệ | Vai trò | Subagent phụ trách |
|---|---|---|---|
| `backend/` | Laravel 13.38.0 + PHP 8.4.0 | RESTful API, tính toán công nợ, kiểm tra trùng lịch, đồng bộ Google Drive, tính lương & xuất báo cáo | `backend-dev`, `db-migrator`, `drive-sync-dev` |
| `frontend/` | React 19.3 + TypeScript 6.0 + Vite 8.3 + Tailwind v4 | Giao diện quản trị Studio OS & Cổng khách chọn ảnh `/p/:slug` | `frontend-dev`, `drive-sync-dev` |
| `docs/` | Markdown (Spec-Driven) | Tài liệu kiến trúc (`ARCHITECTURE.md`, `DESIGN.md`, `COMMANDS.md`), đặc tả domain (`specs/*.md`) & ticket (`features/*`) | `spec-writer`, `architect`, `unit-tester` |

## 2. Quy trình Spec-Driven 4 Bước

1. **Đặc tả (`expect.md` & `specs/<domain>.md`)**: Mọi tính năng mới hoặc thay đổi nghiệp vụ phải được mô tả rõ Actor, Input/Output và Acceptance Criteria.
2. **Thiết kế (`plan.md` & `tasks.md`)**: Xác định danh sách file Backend/Frontend/DB bị ảnh hưởng trước khi viết code.
3. **Thực thi & Kiểm tra cú pháp bắt buộc**:
   - Với file PHP (`backend/`): Bắt buộc chạy `/d/wamp64/bin/php/php8.4.0/php.exe -l <file>`.
   - Với file TS/TSX (`frontend/`): Bắt buộc chạy `npm --prefix frontend run build`.
4. **Đồng bộ Tài liệu (`Rule 04 — Update Docs`)**: Cập nhật `docs/specs/<domain>.md` và `docs/database/SCHEMA.md` ngay khi API hoặc bảng dữ liệu thay đổi.
