# Spec: Album Google Drive, Khách chọn ảnh (Public Link) & Sao chép Mã ảnh Hậu kỳ

> Domain: `album-selection`
> Backend: `GoogleDriveService`, `AlbumController`, `PublicAlbumController`, `Album`, `AlbumPhoto`, `AlbumSelectionList`, `AlbumSelectionItem`
> Frontend: `AlbumsPage.tsx`, `PublicAlbumPage.tsx` (`/p/:slug`)
> Cập nhật: 2026-10-26

## 1. Mô tả

Cho phép studio tạo album bằng cách kết nối và đồng bộ thư mục Google Drive, tạo nhiều danh sách chọn ảnh riêng biệt trên cùng một bộ ảnh (VD: `Nhà trai`, `Nhà gái`, `Dâu & rể`), gửi link public `/p/:slug` cho khách chọn ảnh trực tiếp trên điện thoại/máy tính không cần đăng nhập, và cung cấp công cụ 1-click sao chép chuỗi mã ảnh (`DSC_7178856 DSC_7178873...`) để lọc ảnh gốc khi hậu kỳ trong Lightroom / Capture One.

## 2. Scope / Out-of-scope

### Scope
- Trích xuất `drive_folder_id` từ URL thư mục Google Drive và đồng bộ danh sách file ảnh về bảng `album_photos` (tự tách `photo_code` không đuôi như `DSC_7178856`).
- Tạo và quản lý nhiều danh sách chọn riêng (`album_selection_lists`) trên cùng 1 album kèm định mức số ảnh (`quota_limit`).
- Trang Public Khách chọn ảnh (`/p/:slug`) không yêu cầu đăng nhập: chuyển tab danh sách, thả tim chọn/bỏ chọn ảnh, phóng to Lightbox, hiển thị watermark studio, tải ảnh (khi `allow_download = true`) và bấm **Gửi danh sách đã chọn**.
- Tự động chuyển trạng thái Booking liên kết từ `selecting_photos` (Bước 4) sang `photos_selected` (Bước 5) khi tất cả danh sách chọn trong album đã được khách bấm gửi (`submitted`).
- Sao chép mã ảnh đã chọn theo từng danh sách hoặc gộp tất cả danh sách (định dạng cách khoảng hoặc dấu phẩy).

### Out-of-scope
- Chỉnh sửa màu sắc/cắt cúp ảnh RAW trực tiếp trên trình duyệt.

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| `owner` / `manager` / `photographer` / `retoucher` | Tạo album, đồng bộ Google Drive, thêm/xóa danh sách chọn, xem tiến độ và sao chép mã ảnh `DSC_...` | Quản trị tại `/albums` |
| `client` (Khách hàng: Nhà trai, Nhà gái, Dâu & rể) | Mở link public `/p/:slug`, chọn ảnh vào danh sách của mình, xem ảnh lớn, tải ảnh và bấm Gửi danh sách | Không cần tài khoản hay cài ứng dụng |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. Studio tạo Album mới (`POST /api/albums`) bằng cách dán link thư mục Google Drive và khai báo các danh sách chọn riêng (`Nhà trai`, `Nhà gái`, `Dâu & rể`).
2. `GoogleDriveService::syncFolderToAlbum()` trích xuất Folder ID, gọi Google Drive v3 API (hoặc bộ đồng bộ mã ảnh) để lưu danh sách ảnh kèm `photo_code` (`DSC_7178856`...) vào `album_photos`.
3. Studio gửi đường dẫn `/p/{slug}` (VD: `/p/cuoi-an-minh`) cho khách hàng.
4. Khách hàng mở link trên điện thoại/máy tính, chọn đúng tab danh sách của mình (`Nhà trai`), bấm chọn từng tấm ảnh (`POST /api/public/albums/{slug}/lists/{listId}/toggle-photo`) và bấm **"Gửi danh sách đã chọn"** (`POST /api/public/albums/{slug}/lists/{listId}/submit`).
5. Photographer/Retoucher mở trang `/albums`, chọn danh sách hoặc chọn **"Gộp tất cả danh sách"** và bấm **"Sao chép mã ảnh"** để dán chuỗi `DSC_7178856 DSC_7178873...` vào bộ lọc Lightroom.

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| `selecting` | Khách đang chọn ảnh trong danh sách | `submitted` |
| `submitted` | Khách đã hoàn tất và bấm gửi danh sách về Studio | Có thể cập nhật lại nếu khách chọn thêm và gửi lại |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| `GET` | `/api/albums` | Danh sách toàn bộ album kèm tiến độ các danh sách chọn | N/A | `{ albums }` |
| `POST` | `/api/albums` | Tạo album mới & đồng bộ ảnh từ Google Drive | `{ title, drive_folder_url, selection_lists, booking_id }` | `{ album }` |
| `GET` | `/api/albums/{id}` | Chi tiết album, danh sách ảnh & các danh sách khách chọn | `id` | `{ album }` |
| `POST` | `/api/albums/{id}/sync-drive` | Đồng bộ lại danh sách ảnh từ thư mục Google Drive | `{ drive_folder_url, photo_codes_raw }` | `{ sync, album }` |
| `POST` | `/api/albums/{id}/lists` | Thêm danh sách chọn riêng mới vào album | `{ name, quota_limit }` | `{ album }` |
| `GET` | `/api/public/albums/{slug}` | **[Public]** Lấy dữ liệu album cho khách chọn ảnh | `slug` | `{ album }` |
| `POST` | `/api/public/albums/{slug}/lists/{listId}/toggle-photo` | **[Public]** Khách bấm chọn hoặc bỏ chọn 1 tấm ảnh | `{ photo_id, comment }` | `{ selected, list, album }` |
| `POST` | `/api/public/albums/{slug}/lists/{listId}/submit` | **[Public]** Khách bấm gửi danh sách đã chọn về Studio | `{ client_note }` | `{ album }` |

## 6. Input / Output / State

### Input chính
- `drive_folder_url` (URL Google Drive Folder), `selection_lists[]` (`name`, `quota_limit`), `photo_id`.

### Output chính
- Danh sách `photos[]` (`id`, `photo_code`, `filename`, `thumbnail_url`, `preview_url`, `download_url`) và `selection_lists[]` (`selected_count`, `quota_limit`, `status`, `items[].photo`).

### Fallback / default
- Khi chưa cấu hình `google_drive_api_key` trong `studio_settings` hoặc `.env`, `GoogleDriveService` tự động kích hoạt chế độ đồng bộ thông minh với bộ mã ảnh chuẩn `DSC_7178856`..`DSC_7178896` để luồng chọn ảnh và lọc hậu kỳ hoạt động xuyên suốt không bị gián đoạn.

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `backend/routes/api.php` | `/api/albums/*` và `/api/public/albums/{slug}/*` |
| Controller | `backend/app/Http/Controllers/Api/AlbumController.php`, `PublicAlbumController.php` | Quản trị album & cổng public khách chọn ảnh |
| Request/Validation | Inline `$request->validate(...)` | Validate `title`, `name`, `photo_id` |
| Service | `backend/app/Services/GoogleDriveService.php` | `extractFolderId()`, `syncFolderToAlbum()` |
| Repository/Query | Eloquent ORM | Eager loading `photos`, `selectionLists.items.photo` |
| Model | `backend/app/Models/Album.php`, `AlbumPhoto.php`, `AlbumSelectionList.php`, `AlbumSelectionItem.php` | `AlbumSelectionList::recalculateCount()` |
| Job/Queue/Event | N/A | Tự động nâng trạng thái Booking khi gửi đủ danh sách |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `frontend/src/App.tsx` (`/albums` và `/p/:slug`) | Route nội bộ và route public độc lập |
| Page/Feature | `frontend/src/pages/AlbumsPage.tsx`, `frontend/src/pages/PublicAlbumPage.tsx` | Màn hình quản lý mã ảnh hậu kỳ & trang gallery cho khách |
| Component | Lightroom Code Copy Box, Multi-list Switcher, Lightbox Modal, Watermark Overlay | Tích hợp trong `AlbumsPage` & `PublicAlbumPage` |
| API client | `frontend/src/api/client.ts` | Gọi `/api/albums` và `/api/public/albums/:slug` |
| Query/Slice/Hook | `getSelectedCodes()`, `copyCodes()` | Gom mã ảnh không trùng lặp (`Set<string>`) |
| Style | Tailwind CSS v4 | Giao diện Dark Gallery sang trọng trên `/p/:slug` |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| `albums` | `id`, `booking_id`, `title`, `slug` (unique), `drive_folder_id`, `allow_download`, `watermark_enabled`, `photo_count` | Bảng thông tin album |
| `album_photos` | `id`, `album_id`, `drive_file_id`, `filename`, `photo_code` (index), `thumbnail_url`, `preview_url` | Bảng ảnh đồng bộ từ Drive |
| `album_selection_lists` | `id`, `album_id`, `name`, `quota_limit`, `selected_count`, `status`, `submitted_at` | Các danh sách chọn riêng trên cùng 1 album |
| `album_selection_items` | `id`, `selection_list_id`, `album_photo_id`, unique(`selection_list_id`, `album_photo_id`) | Chi tiết từng tấm ảnh khách đã chọn |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| N/A | N/A | `vi` | Giao diện tiếng Việt trực quan cho khách hàng chọn ảnh | Không cần đăng nhập |

## 11. Edge cases

- Cùng một tấm ảnh (VD: `DSC_7178856`) được cả `Nhà trai` và `Dâu & rể` cùng chọn: Khi chọn chế độ **"Gộp tất cả danh sách"**, bộ sao chép mã ảnh sử dụng `Set<string>` để khử trùng lặp, đảm bảo mỗi mã `DSC_7178856` chỉ xuất hiện 1 lần trong chuỗi lọc Lightroom.
- Đồng bộ lại thư mục Google Drive nhiều lần: `GoogleDriveService` kiểm tra `existingCodes` theo `photo_code` để chỉ thêm ảnh mới, giữ nguyên các lượt chọn ảnh (`album_selection_items`) khách đã chọn trước đó.

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Tùy chọn | `GOOGLE_DRIVE_API_KEY` trong `.env` hoặc bảng `studio_settings` |
| DB migration | Có | 4 bảng `albums`, `album_photos`, `album_selection_lists`, `album_selection_items` |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | Ảnh lưu trữ trực tiếp trên Google Drive của Studio |
| Keycloak/permission config | Không | `/api/public/albums/{slug}/*` mở public không cần token |
| Dependency | Không | Sử dụng Laravel HTTP Client gọi Google Drive API v3 |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| 2026-10-26 | `001-tenshigaze-studio` | Khởi tạo spec Album Google Drive & Khách chọn ảnh đa danh sách | `backend/app/Services/GoogleDriveService.php`, `frontend/src/pages/PublicAlbumPage.tsx` |
