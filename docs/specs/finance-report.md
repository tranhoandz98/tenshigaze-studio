# Spec: Quản lý Tài chính Thu/Chi & Xuất 7 Báo cáo

> Domain: `finance-report`
> Backend: `FinanceController`, `FinancialTransaction`
> Frontend: `FinancePage.tsx`
> Cập nhật: 2026-10-26

## 1. Mô tả

Tổng hợp toàn bộ dòng tiền Thu (từ tiền cọc/thanh toán của khách hàng) và Chi (từ chi trả lương ê-kíp và chi phí vận hành studio), theo dõi công nợ khách còn phải thu, và cung cấp tính năng xuất 7 loại báo cáo của studio ra bảng tính CSV UTF-8 BOM (mở trực tiếp bằng Excel hoặc Google Sheets).

## 2. Scope / Out-of-scope

### Scope
- Thống kê KPI tài chính: Tổng thu (`total_income`), Tổng chi (`total_expense`), Lợi nhuận dòng tiền (`net_profit`), Công nợ khách còn phải thu (`total_receivable`), Lương ê-kíp chờ trả (`pending_crew_payroll`).
- Tự động nhận các bút toán Thu từ `BookingPayment` và bút toán Chi từ `PayrollItem`.
- Cho phép ghi nhận thủ công các khoản Thu/Chi vận hành phát sinh (`POST /api/finance/transactions`).
- Xuất 7 loại báo cáo của studio (`GET /api/reports/export/{type}`):
  1. `dashboard` (Tổng quan kinh doanh)
  2. `bookings` (Danh sách lịch hẹn & công nợ)
  3. `finance` (Sổ thu chi chi tiết)
  4. `customers` (Danh bạ khách hàng & chi tiêu)
  5. `staff` (Danh sách nhân sự & định mức)
  6. `schedule` (Chi tiết phân công lịch làm việc)
  7. `payroll` (Bảng chi trả lương kỳ)

### Out-of-scope
- Tự động đối soát sao kê ngân hàng hoặc đồng bộ hai chiều thời gian thực với Google Sheets sau khi xuất file.

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| `owner` | Xem toàn bộ sổ quỹ, thêm/xóa khoản thu chi, xuất 7 loại báo cáo | Quyền cao nhất |
| `manager` | Xem sổ quỹ chi nhánh và xuất báo cáo | Theo phạm vi chi nhánh |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. Mọi khoản khách đặt cọc/thanh toán tại Booking hoặc khoản chi lương tại Payroll đều tự động sinh bản ghi trong `financial_transactions`.
2. Chủ Studio mở trang **Tài chính & Báo cáo** (`/finance`) để đối soát danh sách **Thu từ khách**, **Lịch sử Thu/Chi** và ghi nhận thêm các chi phí vận hành (thuê đèn, mua phông nền...).
3. Khi cần xuất báo cáo lưu trữ hoặc đẩy lên Google Drive/Sheets, Chủ Studio bấm vào 1 trong 7 thẻ báo cáo (`/api/reports/export/{type}`) để tải file `.csv` kèm UTF-8 BOM.

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| `type = income` | Khoản thu vào quỹ studio | N/A |
| `type = expense` | Khoản chi ra từ quỹ studio | N/A |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| `GET` | `/api/finance` | Tổng hợp KPI tài chính, công nợ khách, sổ thu chi & danh mục 7 báo cáo | `type`, `category` | `{ summary, customer_receivables, crew_payables, transactions, report_types }` |
| `POST` | `/api/finance/transactions` | Ghi nhận khoản Thu / Chi phát sinh thủ công | `{ type, category, amount, payment_method, title, description }` | `{ transaction }` |
| `DELETE` | `/api/finance/transactions/{id}` | Xóa khoản Thu / Chi thủ công | `id` | `{ message }` |
| `GET` | `/api/reports/export/{type}` | Tải file báo cáo `.csv` (1 trong 7 loại) | `type` (`dashboard`, `bookings`, `finance`, `customers`, `staff`, `schedule`, `payroll`) | StreamedResponse (`text/csv; charset=UTF-8` có BOM) |

## 6. Input / Output / State

### Input chính
- `type` (`income` | `expense`), `category` (`customer_payment` | `staff_payroll` | `operating_expense`), `amount`, `payment_method` (`bank_transfer` | `cash`).

### Output chính
- Bảng tổng hợp tài chính và luồng tải file CSV chuẩn tiếng Việt.

### Fallback / default
- Nếu truyền `type` báo cáo không xác định vào `/api/reports/export/{type}`, hệ thống mặc định xuất báo cáo `dashboard`.

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `backend/routes/api.php` | `/api/finance/*`, `/api/reports/export/{type}` |
| Controller | `backend/app/Http/Controllers/Api/FinanceController.php` | `index`, `storeTransaction`, `destroyTransaction`, `exportReport` |
| Request/Validation | Inline `$request->validate(...)` | Validate `type`, `amount`, `payment_method`, `title` |
| Service | 7 hàm `write*Report()` trong `FinanceController` | Ghi stream CSV kèm UTF-8 BOM `\xEF\xBB\xBF` |
| Repository/Query | Eloquent ORM | Tổng hợp từ `FinancialTransaction`, `Booking`, `PayrollItem`, `Customer`, `User` |
| Model | `backend/app/Models/FinancialTransaction.php` | Bảng sổ quỹ tổng hợp |
| Job/Queue/Event | N/A | Stream trực tiếp qua `response()->streamDownload()` |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `frontend/src/App.tsx` (`/finance`) | Trang Tài chính & Báo cáo |
| Page/Feature | `frontend/src/pages/FinancePage.tsx` | Thẻ KPI thu/chi, 7 nút xuất báo cáo, công nợ khách & sổ quỹ |
| Component | 7 thẻ tải báo cáo Excel/Google Sheets, Form ghi nhận thu/chi | Tích hợp trong `FinancePage.tsx` |
| API client | `frontend/src/api/client.ts` | Gọi `/api/finance` |
| Query/Slice/Hook | `loadFinance()`, `handleAddTransaction()` | Reload sổ quỹ sau khi thêm giao dịch |
| Style | Tailwind CSS v4 | Phân biệt rõ màu xanh (`text-emerald-600`) cho Thu và đỏ (`text-rose-600`) cho Chi |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| `financial_transactions` | `id`, `branch_id`, `type` (index), `category`, `amount`, `payment_method`, `transaction_date` (index), `reference_type`, `reference_id`, `title` | Sổ thu chi tổng hợp |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| `FinanceController.php` | Header CSV 7 báo cáo | `vi` | Đầy đủ dấu tiếng Việt kèm BOM UTF-8 | Hiển thị đúng tiếng Việt trên Microsoft Excel & Google Sheets |

## 11. Edge cases

- Mở file CSV tiếng Việt trên Excel Windows bị lỗi font: Đã xử lý triệt để bằng cách ghi byte order mark `fwrite($handle, "\xEF\xBB\xBF")` ở đầu luồng stream trong `FinanceController::exportReport()`.

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Không | N/A |
| DB migration | Có | Bảng `financial_transactions` |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | Stream trực tiếp không lưu file rác trên ổ cứng |
| Keycloak/permission config | Không | N/A |
| Dependency | Không | N/A |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| 2026-10-26 | `001-tenshigaze-studio` | Khởi tạo spec Tài chính & Xuất 7 loại báo cáo | `backend/app/Http/Controllers/Api/FinanceController.php`, `frontend/src/pages/FinancePage.tsx` |
