# Spec: Quản lý Booking, Lịch chụp 8 bước & Tiền cọc

> Domain: `booking`
> Backend: `BookingController`, `CustomerController`, `ServiceCatalogController`, `Booking`, `BookingSession`, `BookingItem`, `BookingPayment`
> Frontend: `DashboardPage.tsx`, `BookingsPage.tsx`
> Cập nhật: 2026-10-26

## 1. Mô tả

Quản lý toàn bộ vòng đời lịch hẹn chụp ảnh của studio từ lúc khách đặt lịch, chọn gói dịch vụ & phụ phí, theo dõi tiền cọc / lịch sử thanh toán đến khi hoàn thành qua thanh tiến độ 8 bước của studio.

## 2. Scope / Out-of-scope

### Scope
- Tạo mới, cập nhật, xóa lịch hẹn (`bookings`) và tự động sinh mã `BK-YYYYMM-NNN`.
- Chuyển đổi trạng thái 8 bước một chạm (`pending_confirmation` → `completed`).
- Quản lý các buổi chụp con (`booking_sessions`: Nhà gái, Nhà trai, Ngoại cảnh, Tiệc tối) kèm thời lượng và địa điểm.
- Quản lý gói chụp (`package`) và phụ phí (`surcharge`) trong lịch hẹn (`booking_items`).
- Ghi nhận tiền cọc (`deposit`), thanh toán đợt (`installment`), tất toán (`settlement`) và tự động tính lại `total_amount`, `paid_amount`, `remaining_amount` + đồng bộ sang sổ quỹ `financial_transactions`.

### Out-of-scope
- Cổng thanh toán tự động qua cổng ngân hàng / QR webhook (nhân viên/chủ studio chủ động ghi nhận khoản đã thu bằng tiền mặt hoặc chuyển khoản theo quy trình của studio).

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| `owner` / `manager` | Toàn quyền CRUD Booking, Dịch vụ, Ghi nhận/Xóa thanh toán, Chuyển 8 bước trạng thái | Quản lý tất cả chi nhánh hoặc theo chi nhánh |
| `sale` | Tạo Booking, quản lý Khách hàng, thêm Dịch vụ/Phụ phí, ghi nhận Tiền cọc | Hưởng % hoa hồng doanh số trên Booking |
| `photographer` / `makeup` / `retoucher` | Xem lịch chụp, cập nhật bước tiến độ liên quan (Đang chụp / Đang retouch / Đã retouch) | Không xóa lịch hẹn hoặc sửa số tiền |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. Sale hoặc Chủ Studio tạo lịch hẹn mới (`POST /api/bookings`) với thông tin khách hàng, buổi chụp đầu tiên, gói dịch vụ và tiền cọc ban đầu.
2. Hệ thống tạo `Customer` (nếu mới), tạo `Booking`, `BookingItem`, `BookingSession`, `BookingPayment` và ghi nhận giao dịch `income` vào `financial_transactions` trong cùng 1 DB transaction.
3. Khi tiến độ buổi chụp thay đổi, nhân sự bấm vào thanh 8 bước (`PATCH /api/bookings/{id}/status`) để chuyển bước.
4. Khi khách thanh toán thêm hoặc phát sinh phụ phí (VD: `Di chuyển 500.000 ₫`), hệ thống gọi `Booking::recalculateFinancials()` để cập nhật tức thì phần trăm thu tiền và số tiền `Còn phải thu`.

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| `pending_confirmation` | Bước 1: Chờ xác nhận | `confirmed`, `cancelled` |
| `confirmed` | Bước 2: Đã xác nhận (đã nhận cọc giữ lịch) | `shooting`, `cancelled` |
| `shooting` | Bước 3: Đang chụp | `selecting_photos` |
| `selecting_photos` | Bước 4: Đang chọn ảnh (đã gửi link album cho khách) | `photos_selected` (tự động khi khách gửi đủ danh sách hoặc bấm tay) |
| `photos_selected` | Bước 5: Chọn ảnh xong | `retouching` |
| `retouching` | Bước 6: Đang retouch | `retouched` |
| `retouched` | Bước 7: Đã retouch | `completed` |
| `completed` | Bước 8: Hoàn thành & bàn giao | Trạng thái kết thúc |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| `GET` | `/api/dashboard` | Lấy KPI tổng quan, thống kê 8 bước & lịch hẹn tiêu điểm | `branch_id` (optional) | `{ kpis, status_counts, featured_booking, upcoming_sessions, active_albums }` |
| `GET` | `/api/bookings` | Danh sách lịch hẹn kèm bộ lọc | `status`, `search`, `branch_id` | `{ bookings, status_steps }` |
| `POST` | `/api/bookings` | Tạo lịch hẹn mới kèm dịch vụ, buổi chụp & tiền cọc | `{ title, customer_name, customer_phone, session, items, deposit_amount }` | `{ booking }` |
| `GET` | `/api/bookings/{id}` | Chi tiết lịch hẹn | `id` | `{ booking }` |
| `PATCH` | `/api/bookings/{id}/status` | Cập nhật nhanh trạng thái 8 bước | `{ status }` | `{ booking }` |
| `POST` | `/api/bookings/{id}/items` | Thêm gói dịch vụ hoặc phụ phí vào lịch hẹn | `{ name, item_type, unit_price, quantity }` | `{ booking }` |
| `DELETE` | `/api/bookings/{id}/items/{itemId}` | Xóa dịch vụ/phụ phí khỏi lịch hẹn | `id`, `itemId` | `{ booking }` |
| `POST` | `/api/bookings/{id}/payments` | Ghi nhận tiền cọc / thanh toán đợt / tất toán | `{ payment_type, method, amount, paid_at, note }` | `{ booking }` |
| `DELETE` | `/api/bookings/{id}/payments/{paymentId}` | Xóa khoản thanh toán & hoàn tác sổ quỹ | `id`, `paymentId` | `{ booking }` |
| `GET/POST` | `/api/customers`, `/api/services` | Quản lý danh bạ khách hàng & danh mục gói dịch vụ | Thông tin khách / dịch vụ | `{ customers }` / `{ services }` |

## 6. Input / Output / State

### Input chính
- `title` (string, bắt buộc), `status` (1 trong 8 bước), `items[]` (`package` | `surcharge`), `payments[]` (`deposit` | `installment` | `settlement`).

### Output chính
- Đối tượng `booking` đầy đủ quan hệ `customer`, `sessions.assignments.user`, `items`, `payments`, `album.selectionLists` và các trường tài chính đã tính toán (`total_amount`, `deposit_amount`, `paid_amount`, `remaining_amount`).

### Fallback / default
- Nếu tạo Booking không truyền `status`, mặc định là `confirmed`.
- `remaining_amount` luôn được bảo vệ bởi `max(0, total_amount - paid_amount)`.

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `backend/routes/api.php` | Nhóm `/api/dashboard`, `/api/bookings/*`, `/api/customers`, `/api/services` |
| Controller | `backend/app/Http/Controllers/Api/BookingController.php`, `DashboardController.php`, `CustomerController.php`, `ServiceCatalogController.php` | Xử lý CRUD, status stepper, items, payments |
| Request/Validation | Inline `$request->validate(...)` trong `BookingController` | Validate chặt `item_type`, `payment_type`, `method`, `amount` |
| Service | `Booking::recalculateFinancials()` | Đồng bộ tổng tiền dịch vụ, đã thu và còn phải thu |
| Repository/Query | Eloquent ORM | Eager loading `sessions.assignments.user`, `items`, `payments` |
| Model | `backend/app/Models/Booking.php`, `BookingSession.php`, `BookingItem.php`, `BookingPayment.php`, `Customer.php`, `ServiceCatalog.php` | Khai báo `Booking::STATUS_STEPS` |
| Job/Queue/Event | N/A | Đồng bộ trực tiếp trong DB transaction |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `frontend/src/App.tsx` (`/` và `/bookings`) | Khai báo trong `StudioLayout` |
| Page/Feature | `frontend/src/pages/DashboardPage.tsx`, `frontend/src/pages/BookingsPage.tsx` | Giao diện 8 bước, thẻ Cưới An & Minh, danh sách & chi tiết Booking |
| Component | Stepper 8 bước, Progress Bar tiến độ thu tiền, Modal tạo lịch hẹn | Tích hợp trong `DashboardPage` và `BookingsPage` |
| API client | `frontend/src/api/client.ts` (`api`, `BOOKING_STEPS`, `formatVND`, `formatDuration`) | Axios instance kết nối `/api` |
| Query/Slice/Hook | React `useState` + `useEffect` | Tự động reload chi tiết Booking sau mỗi thao tác |
| Style | `frontend/src/index.css` (Tailwind CSS v4) | Responsive Mobile & Desktop |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| `bookings` | `id`, `code` (unique), `branch_id`, `customer_id`, `sale_user_id`, `status` (index), `total_amount`, `deposit_amount`, `paid_amount`, `remaining_amount` | Bảng master lịch hẹn |
| `booking_sessions` | `id`, `booking_id`, `title`, `shoot_date` (index), `start_time`, `end_time`, `location`, `google_event_id` | Các ca chụp thuộc lịch hẹn |
| `booking_items` | `id`, `booking_id`, `service_catalog_id`, `name`, `item_type`, `quantity`, `unit_price`, `total_price` | Gói chụp & phụ phí |
| `booking_payments` | `id`, `booking_id`, `payment_type`, `method`, `amount`, `paid_at`, `recorded_by`, `note` | Lịch sử đặt cọc & thanh toán |
| `customers`, `service_catalogs` | Danh bạ khách hàng & danh mục gói dịch vụ mẫu | Phục vụ tạo nhanh Booking |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| `frontend/src/api/client.ts` | `BOOKING_STEPS` | `vi` | 8 nhãn trạng thái tiếng Việt của studio | Dùng thống nhất giữa Dashboard & Bookings |

## 11. Edge cases

- Khách thanh toán nhiều đợt hoặc vượt tổng tiền: `remaining_amount` tự động chặn dưới tại `0 ₫`.
- Xóa một khoản thanh toán bị nhập nhầm (`DELETE /api/bookings/{id}/payments/{paymentId}`): Hệ thống tự động xóa bản ghi `financial_transactions` tương ứng (`reference_type = booking_payment`) và tính lại công nợ trong cùng 1 transaction.

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Có | `DB_DATABASE=tenshigaze_studio`, `APP_TIMEZONE=Asia/Ho_Chi_Minh` |
| DB migration | Có | `0001_01_02_000000_create_studio_tables.php` |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | N/A |
| Keycloak/permission config | Không | Dùng token nội bộ Sanctum/API token |
| Dependency | Có | Laravel 13.38.0 (`php: ^8.4`) |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| 2026-10-26 | `001-tenshigaze-studio` | Khởi tạo spec domain Booking, Lịch chụp 8 bước & Tiền cọc | `backend/app/Http/Controllers/Api/BookingController.php`, `frontend/src/pages/BookingsPage.tsx` |
