# Spec: Phân công Ê-kíp, Lịch làm việc & Cảnh báo Trùng lịch

> Domain: `crew-schedule`
> Backend: `ConflictDetectionService`, `StaffController`, `BookingController@assignCrew`, `BookingController@checkConflicts`, `User`, `BookingAssignment`
> Frontend: `StaffPage.tsx`, `BookingsPage.tsx`
> Cập nhật: 2026-10-26

## 1. Mô tả

Quản lý danh sách nhân sự chính thức và cộng tác viên (Freelancer) theo từng vai trò (`Photographer`, `Makeup`, `Sale`, `Retoucher`), phân công nhân sự vào từng buổi chụp, tự động phát hiện trùng khung giờ chụp trong ngày (`Bận lịch khác`), gợi ý khung giờ trống kế tiếp (`Thử dời sang HH:mm`) và đồng bộ lịch cá nhân qua Google Lịch.

## 2. Scope / Out-of-scope

### Scope
- Quản lý hồ sơ nhân sự & freelancer (`users`), cấu hình mức khoán mặc định/ca (`default_task_rate`), lương cứng (`base_salary`) và `% hoa hồng` (`commission_rate`).
- Phân công nhân sự vào buổi chụp (`booking_assignments`) với mức tiền khoán riêng cho từng ca.
- Kiểm tra xung đột lịch chụp theo thời gian thực (`ConflictDetectionService::checkCrewAvailability`).
- Dời nhanh khung giờ buổi chụp sang khung giờ trống gợi ý và tự động đánh dấu đồng bộ lịch cá nhân của seluruh ê-kíp.

### Out-of-scope
- Chấm công vân tay/GPS phần cứng tại địa điểm chụp.

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| `owner` / `manager` | Thêm/sửa/xóa nhân sự, cài đặt mức khoán/lương cứng, phân công & đổi giờ ca chụp | Toàn quyền điều phối |
| `photographer` / `makeup` / `retoucher` | Xem lịch chụp cá nhân và tiền khoán từng ca chụp | Kết nối tài khoản Google Lịch cá nhân |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. Khi mở một buổi chụp có ngày `shoot_date` và khung giờ `[start_time, end_time]`, Frontend gọi `POST /api/bookings/check-conflicts`.
2. `ConflictDetectionService` quét toàn bộ các `booking_assignments` trong ngày `shoot_date` (trừ buổi chụp hiện tại) và kiểm tra điều kiện giao nhau: `startMin < sEnd && endMin > sStart`.
3. Nếu nhân sự bị trùng ca (VD: `Tâm Photographer` bận lịch `Pre-wedding Lan & Khánh` từ `06:30 – 09:00`), API trả về `has_conflict = true`, thông tin ca trùng và `suggested_slot` (`start_time: "09:00"`).
4. Người điều phối có thể bấm **"Thử dời sang 09:00"** (`PUT /api/bookings/{id}/sessions/{sessionId}`) hoặc chọn nhân sự đang trống lịch để bấm **"Phân công"** (`POST /api/bookings/{id}/sessions/{sessionId}/assignments`).

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| `has_conflict = false` | Nhân sự trống lịch trong khung giờ đang xét | Có thể phân công ngay |
| `has_conflict = true` | Nhân sự đang bận một buổi chụp khác trùng giờ | Cảnh báo đỏ `Bận lịch khác` + gợi ý dời giờ |
| `calendar_synced = true` | Đã đồng bộ giờ chụp mới sang lịch cá nhân của nhân sự | Cập nhật tự động khi đổi giờ buổi chụp |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| `POST` | `/api/bookings/check-conflicts` | Kiểm tra trùng lịch toàn bộ ê-kíp theo ngày & khung giờ | `{ shoot_date, start_time, end_time, exclude_session_id }` | `{ availability: [{ user_id, name, role, has_conflict, conflicts, suggested_slot }] }` |
| `POST` | `/api/bookings/{id}/sessions/{sessionId}/assignments` | Phân công nhân sự vào buổi chụp kèm tiền khoán | `{ user_id, role, task_fee, note }` | `{ booking }` |
| `DELETE` | `/api/bookings/{id}/sessions/{sessionId}/assignments/{assignmentId}` | Gỡ nhân sự khỏi buổi chụp | `id`, `sessionId`, `assignmentId` | `{ booking }` |
| `PUT` | `/api/bookings/{id}/sessions/{sessionId}` | Đổi giờ / ngày / địa điểm buổi chụp & cập nhật lịch ê-kíp | `{ start_time, end_time, shoot_date, location }` | `{ booking }` |
| `GET` | `/api/staff` | Danh sách nhân sự & freelancer | `branch_id`, `role` | `{ staff }` |
| `POST` | `/api/staff` | Thêm nhân sự / freelancer mới | `{ name, email, role, is_freelancer, default_task_rate, base_salary, commission_rate }` | `{ user }` |
| `GET` | `/api/staff/{id}/schedule` | Xem lịch làm việc cá nhân của 1 nhân sự | `id` | `{ user, assignments }` |

## 6. Input / Output / State

### Input chính
- `shoot_date` (`YYYY-MM-DD`), `start_time` (`HH:mm`), `end_time` (`HH:mm`), `user_id`, `task_fee`.

### Output chính
- Danh sách `availability` từng nhân sự kèm mảng `conflicts` và `suggested_slot`.

### Fallback / default
- Khi chọn nhân sự trong dropdown phân công, `task_fee` tự động điền theo `default_task_rate` của nhân sự đó.

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `backend/routes/api.php` | `/api/bookings/check-conflicts`, `/api/staff/*` |
| Controller | `backend/app/Http/Controllers/Api/StaffController.php`, `BookingController.php` | Quản lý nhân sự, lịch cá nhân & gán ca |
| Request/Validation | Inline `$request->validate(...)` | Kiểm tra `exists:users,id`, định dạng ngày/giờ |
| Service | `backend/app/Services/ConflictDetectionService.php` | Thuật toán kiểm tra giao nhau `[startMin, endMin]` & gợi ý giờ trống |
| Repository/Query | Eloquent `BookingAssignment::with(['session.booking'])` | Truy vấn theo `shoot_date` |
| Model | `backend/app/Models/User.php`, `BookingAssignment.php`, `BookingSession.php`, `Branch.php` | Quan hệ `assignments`, `branch` |
| Job/Queue/Event | N/A | N/A |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `frontend/src/App.tsx` (`/staff`, `/bookings`) | Màn hình Ê-kíp & Phân công |
| Page/Feature | `frontend/src/pages/StaffPage.tsx`, `frontend/src/pages/BookingsPage.tsx` | Danh sách nhân sự, lịch cá nhân, thẻ cảnh báo trùng lịch |
| Component | Badge `Bận lịch khác`, nút `Thử dời sang HH:mm`, Modal thêm nhân sự | Tích hợp trong `BookingsPage` và `StaffPage` |
| API client | `frontend/src/api/client.ts` (`ROLE_LABELS`) | Map nhãn vai trò nhân sự |
| Query/Slice/Hook | `checkSessionConflicts` trong `BookingsPage.tsx` | Tự động chạy khi chọn Booking hoặc đổi giờ chụp |
| Style | Tailwind CSS v4 | Highlight đỏ (`bg-rose-50 border-rose-200`) cho nhân sự trùng ca |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| `users` | `id`, `branch_id`, `name`, `role`, `is_freelancer`, `default_task_rate`, `base_salary`, `commission_rate`, `google_calendar_email` | Bảng nhân sự & freelancer |
| `booking_assignments` | `id`, `booking_session_id`, `user_id`, `role`, `task_fee`, `calendar_synced` | Bảng phân công ca chụp |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| `frontend/src/api/client.ts` | `ROLE_LABELS` | `vi` | `Photographer`, `Makeup`, `Sale`, `Retoucher`, `Chủ Studio`, `Quản lý CN` | Hiển thị đồng nhất toàn hệ thống |

## 11. Edge cases

- Phân công lại một nhân sự đã có trong cùng buổi chụp: Sử dụng `BookingAssignment::updateOrCreate(['booking_session_id', 'user_id'])` để cập nhật `role` và `task_fee` thay vì tạo bản ghi trùng lặp.
- Buổi chụp kéo dài đến tối: Khung giờ gợi ý `suggested_slot` được giới hạn trần tại `23:30`.

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Không | N/A |
| DB migration | Có | Bảng `users`, `branches`, `booking_assignments` |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | N/A |
| Keycloak/permission config | Không | N/A |
| Dependency | Không | N/A |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| 2026-10-26 | `001-tenshigaze-studio` | Khởi tạo spec Phân công Ê-kíp & Cảnh báo trùng lịch | `backend/app/Services/ConflictDetectionService.php`, `frontend/src/pages/StaffPage.tsx` |
