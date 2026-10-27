# Hướng dẫn Triển khai & Rollback (`deploy.md`) — 001: Tenshigaze Studio

## 1. Yêu cầu Môi trường
- **PHP**: `8.4.0` (`D:\wamp64\bin\php\php8.4.0\php.exe`)
- **MySQL / MariaDB**: Database `tenshigaze_studio` (`127.0.0.1:3306`)
- **Node.js**: `v24.x` + `npm 11.x`

## 2. Các bước Triển khai (Deploy Steps)
```bash
# 1. Tạo database (nếu chưa có)
/d/wamp64/bin/mysql/mysql9.1.0/bin/mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS tenshigaze_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Chạy Migration & Seeder
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan migrate --seed

# 3. Build Frontend Production
npm --prefix frontend run build
```

## 3. Quy trình Rollback
```bash
/d/wamp64/bin/php/php8.4.0/php.exe backend/artisan migrate:rollback
```
