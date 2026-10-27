# Spec: Quản lý Lương khoán, Hoa hồng & Chốt kỳ lương

> Domain: `payroll`
> Backend: `PayrollController`, `PayrollPeriod`, `PayrollItem`, `FinancialTransaction`
> Frontend: `PayrollPage.tsx`
> Cập nhật: 2026-10-26

## 1. Mô tả

Tổng hợp tiền công cuối kỳ theo tháng cho toàn bộ nhân sự và freelancer dựa trên các buổi chụp đã phân công (lương khoán), lương cứng cố định và phần trăm hoa hồng doanh số (cho Sale). Cho phép thêm khoản thưởng hoặc điều chỉnh phạt trước khi chốt và bấm **Chi trả** để ghi nhận trực tiếp vào mục Tài chính.

## 2. Scope / Out-of-scope

### Scope
- Tự động tổng hợp bảng lương theo tháng/năm (`payroll_periods`, `payroll_items`).
- Tính `task_wage_total` (tổng tiền khoán từ các ca chụp trong tháng kèm JSON `task_breakdown`), `base_salary` (lương cứng) và `commission_total` (% doanh số hợp đồng cho Sale).
- Cập nhật khoản `bonus_adjustment` (Thưởng `+` / Phạt `-`) kèm lý do (`adjustment_note`).
- Ghi nhận **Chi trả** (`POST /api/payroll/items/{itemId}/pay`) và tự động tạo phiếu chi `expense` (`category = staff_payroll`) bên trang Tài chính.

### Out-of-scope
- Chuyển khoản ngân hàng tự động qua API ngân hàng (Chủ studio chuyển khoản/trả tiền mặt rồi bấm **Chi trả** để ghi nhận theo quy trình của studio).

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| `owner` / `manager` | Tổng hợp kỳ lương, sửa thưởng/điều chỉnh, duyệt lương và bấm **Chi trả** | Toàn quyền quản lý bảng lương |
| `photographer` / `makeup` / `sale` / `retoucher` | Xem chi tiết các ca chụp cấu thành lương khoán của mình | Không tự bấm chi trả |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. Chủ Studio mở trang **Lương khoán** (`/payroll`) và chọn kỳ lương (VD: `Tháng 11/2026`).
2. Khi bấm **"Tổng hợp lại kỳ lương"** (`POST /api/payroll/generate`), hệ thống quét các `booking_assignments` trong tháng để cộng `task_wage_total` cho từng Photographer/Makeup/Retoucher và quét `bookings` để tính `% commission_total` cho Sale.
3. Chủ Studio kiểm tra từng người, có thể bấm **Sửa Thưởng/ĐC** (`PATCH /api/payroll/items/{itemId}`) để cộng thưởng (VD: `+200.000 ₫` đi tỉnh sớm).
4. Sau khi chuyển tiền lương thực tế cho nhân viên, Chủ Studio bấm nút **"Chi trả"** (`POST /api/payroll/items/{itemId}/pay`).
5. Hệ thống đổi trạng thái dòng lương sang `paid` (`Đã chi trả`), cập nhật `paid_amount` của kỳ lương và tự động ghi một bản ghi `expense` vào bảng `financial_transactions`.

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| `pending` / `approved` | Đã duyệt mức lương kỳ, đang chờ chi trả | `paid` |
| `paid` | Đã chi trả lương và đã ghi nhận vào sổ Tài chính | Trạng thái kết thúc (khóa không tính đè khi tổng hợp lại kỳ) |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| `GET` | `/api/payroll` | Lấy bảng lương theo tháng/năm/chi nhánh | `month`, `year`, `branch_id` | `{ period }` |
| `POST` | `/api/payroll/generate` | Tổng hợp / tính lại lương khoán & hoa hồng trong kỳ | `{ month, year, branch_id }` | `{ period }` |
| `PATCH` | `/api/payroll/items/{itemId}` | Cập nhật khoản thưởng / điều chỉnh (+/-) | `{ bonus_adjustment, adjustment_note }` | `{ period }` |
| `POST` | `/api/payroll/items/{itemId}/pay` | Bấm Chi trả lương cho nhân sự & ghi sổ Tài chính | `{ payment_method }` | `{ period }` |

## 6. Input / Output / State

### Input chính
- `month` (1..12), `year` (2020..2035), `bonus_adjustment` (số thực âm hoặc dương), `payment_method` (`bank_transfer` | `cash`).

### Output chính
- Đối tượng `period` chứa `total_amount`, `paid_amount` và mảng `items[]` (mỗi phần tử kèm thông tin `user`, `base_salary`, `task_wage_total`, `commission_total`, `bonus_adjustment`, `net_total`, `task_breakdown`, `status`).

### Fallback / default
- Các dòng lương đã ở trạng thái `paid` được giữ nguyên bất biến khi chạy lại `generate`.

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `backend/routes/api.php` | `/api/payroll/*` |
| Controller | `backend/app/Http/Controllers/Api/PayrollController.php` | `index`, `generate`, `updateItem`, `payItem` |
| Request/Validation | Inline `$request->validate(...)` | Validate `month`, `year`, `bonus_adjustment` |
| Service | `PayrollController::buildOrRefreshPeriod()` | Logic gom ca chụp & hoa hồng Sale |
| Repository/Query | Eloquent ORM | Truy vấn `BookingAssignment` theo tháng/năm |
| Model | `backend/app/Models/PayrollPeriod.php`, `PayrollItem.php` | `PayrollPeriod::recalculateTotals()` |
| Job/Queue/Event | N/A | Ghi nhận `FinancialTransaction` trong `DB::transaction()` |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `frontend/src/App.tsx` (`/payroll`) | Trang Lương khoán |
| Page/Feature | `frontend/src/pages/PayrollPage.tsx` | Bảng lương tháng, bộ chuyển tháng, form sửa thưởng & nút Chi trả |
| Component | Thẻ lương từng nhân sự (Huy, Linh, Vy) kèm pill Khoán / Lương cứng / Hoa hồng / Thưởng | Tích hợp trong `PayrollPage.tsx` |
| API client | `frontend/src/api/client.ts` | Gọi `/api/payroll/*` |
| Query/Slice/Hook | `loadPayroll()`, `handlePayItem()`, `handleSaveBonus()` | Cập nhật tức thì sau khi bấm Chi trả |
| Style | Tailwind CSS v4 | Nút `Chi trả` màu Indigo nổi bật, badge `Đã chi trả` màu Emerald |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| `payroll_periods` | `id`, `branch_id`, `month`, `year`, `status`, `total_amount`, `paid_amount`, unique(`branch_id`, `month`, `year`) | Kỳ lương tháng |
| `payroll_items` | `id`, `payroll_period_id`, `user_id`, `base_salary`, `task_wage_total`, `commission_total`, `bonus_adjustment`, `net_total`, `task_breakdown`, `status`, `paid_at` | Chi tiết lương từng người |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| N/A | N/A | `vi` | Hiển thị tiền tệ VNĐ (`formatVND`) | N/A |

## 11. Edge cases

- Bấm nút `Chi trả` nhiều lần liên tiếp: Backend kiểm tra `if ($item->status !== 'paid')` bên trong `PayrollController@payItem` để chống tạo trùng phiếu chi trong `financial_transactions`.

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Không | N/A |
| DB migration | Có | Bảng `payroll_periods`, `payroll_items` |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | N/A |
| Keycloak/permission config | Không | N/A |
| Dependency | Không | N/A |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| 2026-10-26 | `001-tenshigaze-studio` | Khởi tạo spec Lương khoán & Chốt kỳ lương | `backend/app/Http/Controllers/Api/PayrollController.php`, `frontend/src/pages/PayrollPage.tsx` |
