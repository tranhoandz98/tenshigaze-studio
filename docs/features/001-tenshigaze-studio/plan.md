# Kế hoạch Kỹ thuật (`plan.md`) — 001: Tenshigaze Studio

## 1. Kiến trúc Triển khai
- **Backend (`backend/`)**: Laravel 13.38.0 chạy trên PHP 8.4.0, kết nối MySQL `tenshigaze_studio`.
- **Frontend (`frontend/`)**: React 19.3 + TypeScript 6.0 + Vite 8.3 + Tailwind CSS v4.

## 2. Danh sách File Trọng tâm
- `backend/database/migrations/0001_01_01_000000_create_users_table.php`
- `backend/database/migrations/0001_01_02_000000_create_studio_tables.php`
- `backend/database/seeders/DatabaseSeeder.php`
- `backend/app/Services/ConflictDetectionService.php`
- `backend/app/Services/GoogleDriveService.php`
- `backend/app/Http/Controllers/Api/{Dashboard,Booking,Album,PublicAlbum,Staff,Payroll,Finance,StudioSetting}Controller.php`
- `frontend/src/layouts/StudioLayout.tsx`
- `frontend/src/pages/{Dashboard,Bookings,Albums,PublicAlbum,Staff,Payroll,Finance,Settings}Page.tsx`
