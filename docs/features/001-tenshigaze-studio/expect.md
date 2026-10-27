# Đặc tả Yêu cầu (`expect.md`) — 001: Tenshigaze Studio

## 1. Mục tiêu
Xây dựng hệ thống quản lý vận hành nội bộ cho **Tenshigaze Studio** bao gồm đầy đủ 4 trụ cột chức năng trên nền tảng **Laravel 13.38 (PHP 8.4) + React 19 (Vite 8) + MySQL**.

## 2. Actors
- **Chủ Studio / Quản lý Chi nhánh (`owner`, `manager`)**
- **Nhân sự Ê-kíp (`photographer`, `makeup`, `sale`, `retoucher`)**
- **Khách hàng chọn ảnh (`client` qua link public `/p/:slug`)**

## 3. Acceptance Criteria (AC)
- **AC-01 (Booking 8 bước & Tiền cọc):** Tạo và quản lý lịch chụp với 8 bước tiến độ (`Chờ xác nhận` → `Hoàn thành`), tự động tính tổng dịch vụ + phụ phí, phần trăm đã thu và số tiền còn phải thu sau mỗi lần khách cọc/thanh toán.
- **AC-02 (Phân công Ê-kíp & Cảnh báo trùng giờ):** Khi phân công Photographer/Makeup vào buổi chụp, hệ thống tự động phát hiện trùng khung giờ trong ngày, hiển thị cảnh báo `Bận lịch khác` và nút gợi ý giờ trống kế tiếp (`Thử dời sang HH:mm`).
- **AC-03 (Album Google Drive & Khách chọn ảnh đa danh sách):** Tạo album từ thư mục Google Drive, hỗ trợ nhiều danh sách chọn riêng (`Nhà trai`, `Nhà gái`, `Dâu & rể`) trên cùng 1 album, khách mở link `/p/:slug` chọn ảnh không cần đăng nhập, và thợ hậu kỳ sao chép được chuỗi mã ảnh (`DSC_...`) để lọc RAW.
- **AC-04 (Lương khoán & Tài chính 7 báo cáo):** Tổng hợp lương cuối kỳ (lương cứng + khoán theo ca + % hoa hồng + thưởng/phạt), bấm `Chi trả` tự động ghi nhận khoản chi sang trang Tài chính, và xuất được 7 loại báo cáo chuẩn CSV UTF-8 BOM.
