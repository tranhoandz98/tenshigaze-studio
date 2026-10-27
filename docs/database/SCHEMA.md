# Đặc tả Cơ sở Dữ liệu (`tenshigaze_studio`)

Database MySQL: `tenshigaze_studio` (`utf8mb4_unicode_ci`, Engine `InnoDB`).

## Danh sách các Bảng chính

### 1. `branches` (Chi nhánh Studio)
- `id`, `name` (VD: `CN Chính - Tenshigaze Studio`), `code` (`CN-CHINH`), `address`, `phone`, `is_active`.

### 2. `users` (Nhân sự & Freelancer)
- `id`, `branch_id`, `name`, `email`, `phone`, `role` (`owner`, `manager`, `photographer`, `makeup`, `sale`, `retoucher`), `is_freelancer`, `avatar_color`, `base_salary`, `commission_rate`, `default_task_rate`, `google_calendar_email`, `google_calendar_connected`, `api_token`, `is_active`.

### 3. `customers` (Khách hàng)
- `id`, `branch_id`, `name` (VD: `An & Minh`), `phone`, `email`, `zalo`, `address`, `notes`.

### 4. `service_catalogs` (Danh mục Gói chụp & Phụ phí)
- `id`, `name` (`Phóng sự cưới`, `Di chuyển`...), `type` (`package` | `surcharge`), `default_price`, `default_duration_minutes`, `default_photo_rate`, `default_makeup_rate`, `description`, `is_active`.

### 5. `bookings` (Hợp đồng / Lịch hẹn chụp)
- `id`, `code` (`BK-202611-001`), `branch_id`, `customer_id`, `sale_user_id`, `title` (`Cưới An & Minh`),
- `status` (8 bước):
  1. `pending_confirmation` (Chờ xác nhận)
  2. `confirmed` (Đã xác nhận)
  3. `shooting` (Đang chụp)
  4. `selecting_photos` (Đang chọn ảnh)
  5. `photos_selected` (Chọn ảnh xong)
  6. `retouching` (Đang retouch)
  7. `retouched` (Đã retouch)
  8. `completed` (Hoàn thành)
- `total_amount`, `deposit_amount`, `paid_amount`, `remaining_amount`, `google_calendar_synced`, `notes`.

### 6. `booking_sessions` (Các buổi chụp trong lịch hẹn)
- `id`, `booking_id`, `title` (`Nhà gái`, `Ngoại cảnh sáng`...), `shoot_date`, `start_time` (`05:00`), `end_time` (`10:30`), `location` (`14 Gò Cà, Càng Long`), `google_event_id`, `notes`.

### 7. `booking_items` (Chi tiết Gói chụp & Phụ phí của Booking)
- `id`, `booking_id`, `service_catalog_id`, `name`, `item_type` (`package` | `surcharge`), `quantity`, `unit_price`, `total_price`.

### 8. `booking_assignments` (Phân công Ê-kíp theo buổi chụp)
- `id`, `booking_session_id`, `user_id`, `role`, `task_fee` (tiền khoán ca chụp), `calendar_synced`, `note`.

### 9. `booking_payments` (Lịch sử Đặt cọc & Thanh toán)
- `id`, `booking_id`, `payment_type` (`deposit`, `installment`, `settlement`), `method` (`bank_transfer`, `cash`), `amount`, `paid_at`, `receipt_url`, `recorded_by`, `note`.

### 10. `albums` & `album_photos` (Album Google Drive)
- `albums`: `id`, `booking_id`, `branch_id`, `title`, `slug` (`cuoi-an-minh`), `drive_folder_id`, `drive_folder_url`, `allow_download`, `watermark_enabled`, `watermark_text`, `cover_photo_url`, `photo_count`, `status`, `last_synced_at`.
- `album_photos`: `id`, `album_id`, `drive_file_id`, `filename` (`DSC_7178856.ARW`), `photo_code` (`DSC_7178856`), `thumbnail_url`, `preview_url`, `download_url`, `width`, `height`, `mime_type`, `size_bytes`.

### 11. `album_selection_lists` & `album_selection_items` (Danh sách khách chọn ảnh)
- `album_selection_lists`: `id`, `album_id`, `name` (`Nhà trai`, `Nhà gái`, `Dâu & rể`), `quota_limit`, `selected_count`, `status` (`selecting` | `submitted`), `submitted_at`, `client_note`.
- `album_selection_items`: `id`, `selection_list_id`, `album_photo_id`, `comment`.

### 12. `payroll_periods`, `payroll_items` & `financial_transactions` (Lương khoán & Tài chính)
- `payroll_periods`: `id`, `branch_id`, `month`, `year`, `status`, `total_amount`, `paid_amount`.
- `payroll_items`: `id`, `payroll_period_id`, `user_id`, `base_salary`, `task_wage_total`, `commission_total`, `bonus_adjustment`, `adjustment_note`, `net_total`, `task_breakdown` (JSON), `status` (`pending`, `approved`, `paid`), `paid_at`, `payment_method`.
- `financial_transactions`: `id`, `branch_id`, `type` (`income` | `expense`), `category` (`customer_payment`, `staff_payroll`, `operating_expense`), `amount`, `payment_method`, `transaction_date`, `reference_type`, `reference_id`, `title`, `description`, `created_by`.
