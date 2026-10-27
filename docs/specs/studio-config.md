# Spec: Cấu hình Studio, Chi nhánh & Tích hợp Google Drive / Calendar

> Domain: `studio-config`
> Backend: `StudioSettingController`, `StaffController@branches`, `StudioSetting`, `Branch`, `AuthController`
> Frontend: `SettingsPage.tsx`, `StudioLayout.tsx`
> Cập nhật: 2026-10-26

## 1. Mô tả

Quản lý thông tin thương hiệu **Tenshigaze Studio**, danh sách chi nhánh hoạt động, chữ ký watermark mặc định trên trang khách chọn ảnh và thông tin kết nối Google Drive API v3 / Google Calendar.

## 2. Scope / Out-of-scope

### Scope
- Lưu và đọc cấu hình key-value của studio (`studio_settings`: `studio_name`, `studio_phone`, `watermark_default_text`, `google_drive_api_key`, `google_drive_root_folder`, `google_calendar_auto_sync`).
- Quản lý danh sách chi nhánh (`branches`: `CN Chính - Tenshigaze Studio`, `CN Phú Nhuận`...).
- Đăng nhập và xác thực thông tin người dùng hiện tại (`/api/auth/login`, `/api/auth/me`).

### Out-of-scope
- Quản lý gói cước thuê bao SaaS đa tổ chức (hệ thống phục vụ độc quyền nội bộ cho Tenshigaze Studio).

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| `owner` | Toàn quyền thay đổi cấu hình Studio, Google Drive API Key và thêm chi nhánh mới | Quản trị tại `/settings` |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. Chủ Studio mở trang **Cấu hình & Drive** (`/settings`).
2. Hệ thống tải danh sách cấu hình hiện tại qua `GET /api/settings`.
3. Chủ Studio cập nhật tên thương hiệu, hotline, nội dung watermark hoặc `google_drive_api_key` rồi bấm **"Lưu cài đặt"** (`PUT /api/settings`).
4. Khi đồng bộ album mới, `GoogleDriveService` tự động đọc `google_drive_api_key` từ `studio_settings` để gọi Google Drive API v3.

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| `is_active = true` | Chi nhánh đang hoạt động | `is_active = false` |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| `GET` | `/api/settings` | Lấy toàn bộ cấu hình key-value của Studio | N/A | `{ settings }` |
| `PUT` | `/api/settings` | Lưu/cập nhật cấu hình Studio & Google Drive API Key | `{ settings: { studio_name, google_drive_api_key, ... } }` | `{ settings }` |
| `GET` | `/api/branches` | Danh sách chi nhánh kèm số nhân sự & số booking | N/A | `{ branches }` |
| `POST` | `/api/branches` | Tạo chi nhánh mới | `{ name, code, address, phone }` | `{ branch }` |
| `POST` | `/api/auth/login` | Đăng nhập lấy API token | `{ email, password }` | `{ token, user }` |
| `GET` | `/api/auth/me` | Lấy thông tin người dùng đang đăng nhập | Bearer token | `{ user }` |

## 6. Input / Output / State

### Input chính
- Key-value object `settings` (`studio_name`, `studio_phone`, `watermark_default_text`, `google_drive_api_key`, `google_drive_root_folder`).

### Output chính
- Map `settings` đã lưu trong bảng `studio_settings`.

### Fallback / default
- `DatabaseSeeder` khởi tạo sẵn bộ cấu hình mặc định cho `Tenshigaze Studio`.

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `backend/routes/api.php` | `/api/settings`, `/api/branches`, `/api/auth/*` |
| Controller | `backend/app/Http/Controllers/Api/StudioSettingController.php`, `AuthController.php`, `StaffController.php` | Quản lý cấu hình, chi nhánh & đăng nhập |
| Request/Validation | Inline `$request->validate(...)` | Validate thông tin đăng nhập & chi nhánh |
| Service | `GoogleDriveService` đọc `StudioSetting` | Kết nối với module Album |
| Repository/Query | `StudioSetting::pluck('value', 'key')` | Truy vấn nhanh key-value |
| Model | `backend/app/Models/StudioSetting.php`, `Branch.php`, `User.php` | Model cấu hình & chi nhánh |
| Job/Queue/Event | N/A | N/A |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `frontend/src/App.tsx` (`/settings`) | Trang Cấu hình & Drive |
| Page/Feature | `frontend/src/pages/SettingsPage.tsx` | Form cập nhật thương hiệu, watermark & Google Drive API Key |
| Component | `StudioLayout.tsx` | Hiển thị tên Studio & trạng thái Google Sync trên Sidebar |
| API client | `frontend/src/api/client.ts` | Gọi `/api/settings` |
| Query/Slice/Hook | `handleSave()` | Hiển thị badge `Đã lưu cấu hình` |
| Style | Tailwind CSS v4 | N/A |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| `studio_settings` | `id`, `key` (unique), `value` | Lưu cấu hình hệ thống |
| `branches` | `id`, `name`, `code` (unique), `address`, `phone`, `is_active` | Lưu danh sách chi nhánh |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| N/A | N/A | `vi` | Giao diện tiếng Việt | N/A |

## 11. Edge cases

- Giá trị cấu hình là object/array: `StudioSettingController@update` tự động `json_encode` nếu giá trị không phải `scalar`.

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Tùy chọn | Có thể cấu hình `GOOGLE_DRIVE_API_KEY` qua UI `/settings` hoặc `.env` |
| DB migration | Có | Bảng `studio_settings`, `branches` |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | N/A |
| Keycloak/permission config | Không | N/A |
| Dependency | Không | N/A |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| 2026-10-26 | `001-tenshigaze-studio` | Khởi tạo spec Cấu hình Studio & Tích hợp Google Drive | `backend/app/Http/Controllers/Api/StudioSettingController.php`, `frontend/src/pages/SettingsPage.tsx` |
