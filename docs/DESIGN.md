# UI/UX Design System — Tenshigaze Studio

> Cập nhật: 2026-10-26

## 1. Tổng quan Thiết kế

Tenshigaze Studio sử dụng **React 19 + Tailwind CSS v4** kết hợp bộ biểu tượng **Lucide Icons** (`lucide-react`). Giao diện được chia thành 2 trải nghiệm riêng biệt phục vụ vận hành studio:

1. **Internal Studio OS (`StudioLayout.tsx`)**:
   - **Desktop**: Sidebar cố định nền tối (`bg-slate-950 text-white`) bên trái + Topbar trắng mờ (`bg-white/90 backdrop-blur`) + Khu vực làm việc nền sáng (`bg-slate-50`) giúp giảm mỏi mắt khi điều phối lịch chụp và đối soát bảng lương.
   - **Mobile**: Tự động ẩn Sidebar và hiển thị thanh **Bottom Navigation Bar** cố định dưới đáy màn hình để Photographer/Makeup tra cứu lịch chụp ngay trên điện thoại.
2. **Public Client Photo Selection Portal (`PublicAlbumPage.tsx` tại `/p/:slug`)**:
   - Giao diện Dark Gallery cao cấp (`bg-slate-950 text-white`) làm nổi bật màu sắc ảnh cưới/chân dung, đi kèm lớp phủ Watermark tinh tế (`TENSHIGAZE STUDIO`) và chế độ phóng to Lightbox toàn màn hình.

## 2. Bảng màu & Token Trạng thái (Tailwind CSS v4)

| Thành phần | Class chuẩn | Ý nghĩa hiển thị |
|---|---|---|
| **Primary Brand** | `bg-indigo-600 text-white` | Nút hành động chính (Tạo lịch chụp, Chi trả lương, Bước tiến độ đang chọn) |
| **Income / Đã thu / Đã chi trả** | `text-emerald-600 bg-emerald-50 border-emerald-200` | Tiền cọc đã thu, trạng thái hoàn thành, đã kết nối Google Lịch |
| **Receivable / Cảnh báo trùng giờ** | `text-rose-600 bg-rose-50 border-rose-200` | Khoản khách còn phải thu, cảnh báo nhân sự `Bận lịch khác` |
| **Pending / Phụ phí** | `text-amber-700 bg-amber-100` | Trạng thái đang chọn ảnh, nhãn phụ phí |

## 3. Các Màn hình & Thành phần Trọng tâm

1. **Tổng quan (`/` — `DashboardPage.tsx`)**:
   - 4 thẻ KPI (Tổng doanh thu hợp đồng, Khách còn phải thu, Lương khoán chờ chi trả, Album & Ê-kíp).
   - Thẻ tiêu điểm `Cưới An & Minh` tích hợp thanh **Stepper 8 bước một chạm**, 3 cột thông tin (Buổi chụp & Ê-kíp, Dịch vụ & Phụ phí, Tiến độ thu tiền % & Lịch sử đặt cọc).
2. **Lịch chụp & Tiền cọc (`/bookings` — `BookingsPage.tsx`)**:
   - Bố cục Master-Detail (4 cột danh sách bên trái / 8 cột chi tiết bên phải).
   - Khối kiểm tra xung đột lịch chụp trực tiếp: hiển thị rõ nhân sự trống lịch hoặc `Bận lịch khác` kèm nút 1 chạm `Thử dời sang HH:mm`.
3. **Quản lý Album & Hậu kỳ (`/albums` — `AlbumsPage.tsx`)**:
   - Chuyển đổi giữa các danh sách chọn (`Nhà trai`, `Nhà gái`, `Dâu & rể`, hoặc `Gộp tất cả`).
   - Hộp đen **Lightroom / Capture One Filter Bar** hiển thị chuỗi mã ảnh (`DSC_7178856 DSC_7178873...`) kèm nút sao chép nhanh.
4. **Cổng Khách chọn ảnh (`/p/:slug` — `PublicAlbumPage.tsx`)**:
   - Thanh chuyển danh sách chọn riêng kèm bộ đếm định mức (`3/6 ảnh`), bộ lọc `Ảnh đã chọn`, nút thả tim từng tấm và nút `Gửi danh sách đã chọn`.
5. **Lương khoán (`/payroll` — `PayrollPage.tsx`) & Tài chính (`/finance` — `FinancePage.tsx`)**:
   - Bảng tổng hợp lương tháng (Khoán + Lương cứng + % Doanh số + Thưởng/ĐC) kèm nút **Chi trả**.
   - Trung tâm tải 7 loại báo cáo chuẩn CSV UTF-8 BOM.
