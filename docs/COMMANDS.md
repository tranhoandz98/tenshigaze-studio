# Sổ tay Lệnh Phát triển & Vận hành (`COMMANDS.md`)

## 1. Môi trường PHP 8.4 & Laravel 13 (`backend/`)

Luôn sử dụng binary PHP 8.4 tại `D:\wamp64\bin\php\php8.4.0\php.exe`:

```bash
# Kiểm tra phiên bản Laravel 13.38 & PHP 8.4
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan --version

# Chạy lại toàn bộ Migration & Seeder dữ liệu mẫu của studio
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan migrate:fresh --seed

# Liệt kê toàn bộ 57 REST API routes
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan route:list --path=api

# Kiểm tra cú pháp PHP bắt buộc sau khi sửa file
/d/wamp64/bin/php/php8.4.0/php.exe -l backend/app/Http/Controllers/Api/BookingController.php

# Chạy PHPUnit 12 test suite
/d/wamp64/bin/php/php8.4.0/php.exe backend/vendor/phpunit/phpunit/phpunit -c backend/phpunit.xml backend/tests/Feature/StudioWorkflowTest.php

# Khởi chạy Backend API Server tại cổng 8000
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan serve --host=127.0.0.1 --port=8000
```

## 2. Môi trường Frontend React 19 + Vite 8 (`frontend/`)

```bash
# Cài đặt dependencies
npm --prefix frontend install

# Khởi chạy Vite Dev Server tại cổng 5173 (tự động proxy /api sang 127.0.0.1:8000)
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173

# Kiểm tra TypeScript (tsc -b) & Build Production
npm --prefix frontend run build

# Chạy linter (oxlint)
npm --prefix frontend run lint
```
