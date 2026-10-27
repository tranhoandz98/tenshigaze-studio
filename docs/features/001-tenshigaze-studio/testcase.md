# Kịch bản Kiểm thử (`testcase.md`) — 001: Tenshigaze Studio

| Mã TC | Phân hệ | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| **TC-01** | Tổng quan & Booking 8 bước | Mở trang Tổng quan / Lịch chụp, xem lịch hẹn `Cưới An & Minh`, bấm chuyển bước tiến độ | Trạng thái cập nhật tức thì trên thanh 8 bước, hiển thị đúng Tổng `5.000.000 ₫`, Đã thu `1.000.000 ₫`, Còn phải thu `4.000.000 ₫` |
| **TC-02** | Cảnh báo trùng lịch Ê-kíp | Mở chi tiết lịch chụp ngày `15/11/2026`, kiểm tra danh sách nhân sự trống/bận | Nhân sự `Tâm (Photographer)` hiển thị cảnh báo đỏ `Bận lịch khác (Pre-wedding Lan & Khánh 06:30–09:00)` kèm nút `Thử dời sang 09:00` |
| **TC-03** | Public Khách chọn ảnh | Mở `/p/cuoi-an-minh`, chuyển giữa các tab `Nhà trai`, `Nhà gái`, `Dâu & rể`, bấm chọn/bỏ chọn ảnh và bấm `Gửi danh sách đã chọn` | Số lượng ảnh đã chọn (`X/6`) cập nhật theo thời gian thực cho từng danh sách mà không cần đăng nhập |
| **TC-04** | Sao chép mã ảnh Hậu kỳ | Trong trang Quản lý Album (`/albums`), chọn danh sách và bấm `Sao chép mã ảnh` | Chuỗi mã ảnh `DSC_7178856 DSC_7178873...` được sao chép vào clipboard để lọc file RAW trong Lightroom |
| **TC-05** | Lương khoán & Chi trả | Mở trang Lương khoán (`/payroll`) kỳ Tháng 11/2026, bấm nút `Chi trả` ở dòng nhân viên `Linh (Makeup - 600.000 ₫)` | Trạng thái chuyển thành `Đã chi trả`, cột `Đã chi trả` tăng thêm `600.000 ₫`, và trang `Tài chính` xuất hiện khoản Chi lương tương ứng |
| **TC-06** | Xuất 7 loại Báo cáo | Truy cập `/api/reports/export/bookings` hoặc bấm tải báo cáo trên trang Tài chính | Tải về file `.csv` chuẩn UTF-8 BOM chứa danh sách lịch hẹn đầy đủ tiếng Việt |
