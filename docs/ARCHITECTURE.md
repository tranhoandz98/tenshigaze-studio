# Kiến trúc Hệ thống — Tenshigaze Studio

## 1. Tổng quan Công nghệ (Tech Stack)

| Tầng | Công nghệ | Phiên bản / Cấu hình |
|---|---|---|
| **Backend API** | Laravel Framework | **v13.38.0** chạy trên **PHP 8.4.0** (`D:\wamp64\bin\php\php8.4.0\php.exe`) |
| **Frontend SPA** | React + TypeScript + Vite | **React 19.3 + TypeScript 6.0 + Vite 8.3 + Tailwind CSS v4** |
| **Database** | MySQL / MariaDB (WAMP) | Database `tenshigaze_studio` (`InnoDB`, `utf8mb4_unicode_ci`) |
| **Tích hợp ngoài** | Google Drive API v3 & Google Calendar | Đồng bộ ảnh gốc/thumbnail theo Folder ID & đẩy lịch chụp ê-kíp |

## 2. Sơ đồ Luồng Nghiệp vụ Chính

```text
[Khách đặt lịch]
       │
       ▼
[1. Booking & Tiền cọc] ──(Ghi nhận cọc/thanh toán)──► [4. Sổ Tài chính (Income)]
       │
       ├──(Phân công ca chụp + Kiểm tra trùng giờ)──► [2. Ê-kíp & Lịch cá nhân]
       │                                                      │
       │                                          (Cuối kỳ tổng hợp khoán/hoa hồng)
       │                                                      ▼
       │                                              [Bảng lương Tháng] ──(Bấm Chi trả)──► [4. Sổ Tài chính (Expense)]
       ▼
[3. Album Google Drive (/p/:slug)]
       ├── Khách chọn ảnh trên nhiều danh sách riêng (Nhà trai / Nhà gái / Dâu & rể)
       ├── Khi gửi đủ danh sách: Booking tự chuyển từ Bước 4 (Đang chọn ảnh) ──► Bước 5 (Chọn ảnh xong)
       └── Photographer 1-click "Sao chép mã ảnh" (DSC_7178856 DSC_7178873...) để lọc RAW trong Lightroom
```

## 3. Cấu trúc Mã nguồn

### 3.1. Backend (`backend/`)
- `app/Models/`: 17 Models (`Branch`, `User`, `Customer`, `ServiceCatalog`, `Booking`, `BookingSession`, `BookingItem`, `BookingAssignment`, `BookingPayment`, `Album`, `AlbumPhoto`, `AlbumSelectionList`, `AlbumSelectionItem`, `PayrollPeriod`, `PayrollItem`, `FinancialTransaction`, `StudioSetting`).
- `app/Services/ConflictDetectionService.php`: Phát hiện trùng khung giờ `[start_time, end_time]` trong cùng ngày `shoot_date` và tính toán khung giờ trống gợi ý kế tiếp (`suggested_slot`).
- `app/Services/GoogleDriveService.php`: Trích xuất `folder_id` từ link Google Drive và đồng bộ danh sách file ảnh về bảng `album_photos`.
- `app/Http/Controllers/Api/`:
  - `DashboardController`: Tổng hợp KPI, thống kê 8 bước tiến độ, lịch chụp sắp tới và album đang hoạt động.
  - `BookingController`: Quản lý Booking, 8 bước trạng thái, dịch vụ/phụ phí, thanh toán tiền cọc, buổi chụp và phân công nhân sự.
  - `AlbumController` & `PublicAlbumController`: Quản lý album nội bộ và cổng public `/p/:slug` cho khách chọn ảnh không cần đăng nhập.
  - `PayrollController`: Tổng hợp lương khoán theo buổi chụp, lương cứng, hoa hồng % doanh số, thưởng/phạt và chi trả lương.
  - `FinanceController`: Sổ thu chi tổng hợp và xuất 7 loại báo cáo chuẩn CSV UTF-8 BOM (mở trực tiếp trên Excel / Google Sheets).

### 3.2. Frontend (`frontend/`)
- `src/layouts/StudioLayout.tsx`: Khung quản trị Studio (Desktop Sidebar + Mobile Bottom Navigation).
- `src/pages/DashboardPage.tsx`: Màn hình tổng quan kèm thẻ lịch hẹn tiêu điểm (`Cưới An & Minh`).
- `src/pages/BookingsPage.tsx`: Quản lý lịch chụp, thanh 8 bước tiến độ, thu tiền cọc và kiểm tra trùng lịch ê-kíp trực tiếp.
- `src/pages/AlbumsPage.tsx`: Quản lý album Google Drive và công cụ sao chép mã ảnh `DSC_...` cho hậu kỳ.
- `src/pages/PublicAlbumPage.tsx`: Giao diện khách hàng chọn ảnh tại `/p/:slug` theo từng danh sách riêng (`Nhà trai`, `Nhà gái`, `Dâu & rể`).
- `src/pages/StaffPage.tsx`: Quản lý nhân sự, freelancer, mức khoán và lịch làm việc cá nhân.
- `src/pages/PayrollPage.tsx`: Bảng lương kỳ tháng, điều chỉnh thưởng/phạt và nút **Chi trả**.
- `src/pages/FinancePage.tsx`: Theo dõi thu từ khách, chi trả ê-kíp và tải 7 loại báo cáo.
- `src/pages/SettingsPage.tsx`: Cấu hình thương hiệu, watermark và Google Drive API Key.
