# Rule 05 — Quản lý thay đổi Database (DB Migration)

## Khi nào chạy

- Trước khi code nếu `plan.md` xác định có thay đổi DB schema/config data.
- Sau khi merge nếu có migration mới hoặc DB docs lỗi thời.
- Khi feature cần `deploy.md` do có migration/config/seed data.

## Đầu vào

| Nguồn | Mô tả |
|---|---|
| `plan.md` / `tasks.md` | Task có tag `[db]` hoặc mô tả thay đổi schema/config data |
| Laravel migration / SQL | File migration trong service hoặc SQL đề xuất |
| `docs/database/` | Source of truth cấu trúc DB hiện tại |
| Code model/query | Eloquent model/relationship/cast/query liên quan |
| DB dev/staging | Chỉ dùng để verify nếu DEV cung cấp quyền |

## Đầu ra

| File | Mô tả |
|---|---|
| File SQL | Thay đổi schema/data viết dưới dạng file SQL vào thư mục `docs/database/` |
| `features/<JIRA>/deploy.md` | Bước deploy DB/config/rollback cụ thể của feature |
| `docs/database/structure.sql` | Schema snapshot hiện tại sau khi feature DB change được áp dụng |
| `docs/database/YYYY-MM-DD_mo-ta.sql` | SQL/deploy note dùng chung hoặc source-of-truth DB, không lặp nếu đã đủ trong `deploy.md` |
| `docs/database/*` | Cập nhật cấu trúc DB source of truth |

> [!IMPORTANT]
> File này là rule/checklist dùng chung. `features/<JIRA>/deploy.md` là output cụ thể từng feature. Có `deploy.md` vẫn cần rule này để biết phải kiểm tra gì trước khi viết migration/deploy note.

## Cách thực hiện

### Bước 1: Xác định loại thay đổi

| Loại thay đổi | Output |
|---|---|
| Thêm bảng | File SQL + cập nhật DB docs |
| Thêm/sửa cột | File SQL + cập nhật DB docs |
| Thêm index/constraint | File SQL + cập nhật DB docs |
| Seed/config data | Seeder/SQL/notes + `deploy.md` |
| Deprecate bảng/cột | Gắn `DEPRECATED`, ghi thay thế, không xóa vội |
| Xóa bảng/cột | Chỉ làm khi plan có cleanup + rollback + xác nhận không còn dependency |

### Bước 2: Đối chiếu hiện trạng

1. Đọc `docs/database/` để biết bảng/cột/index hiện tại.
2. Đọc migration cũ và Eloquent model/query liên quan.
3. Nếu DB docs lệch code/migration thật: ghi blocker hoặc cập nhật docs theo Rule 04 trước khi đề xuất migration lớn.
4. Nếu `features/<JIRA>/deploy.md` đã ghi đủ SQL/deploy/rollback cho feature, không tạo thêm file SQL trong `docs/database/` trừ khi cần source-of-truth dùng chung.
5. Kiểm tra nullable/default/backfill để tránh lỗi dữ liệu cũ.
6. Kiểm tra tên cột/index không trùng và không phá query hiện tại.

### Bước 3: Viết migration/SQL

Quy tắc cho eCon:

- DB chính: MySQL/MariaDB.
- **LUÔN LUÔN dùng file SQL thuần trong `docs/database/`**, tuyệt đối KHÔNG tạo Laravel migration (`php artisan make:migration`) cho backend `econApi` nữa (theo yêu cầu của DEV).
- SQL trong `docs/database/` dùng để quản lý schema change, DBA hoặc DEV sẽ tự chạy production.
- Mỗi file = 1 thay đổi logic.
- Luôn có rollback/downgrade note cho DDL/DML quan trọng.
- Nếu rollback không thể khôi phục dữ liệu, ghi rõ `irreversible` và yêu cầu backup/confirm.
- Breaking DB change ưu tiên expand/contract: thêm cột mới → backfill → code đọc/ghi mới → deprecate cột cũ → cleanup sau.
- DDL lớn phải đánh giá lock/time/backfill/batch và kế hoạch backup trước deploy.
- Không thêm DB constraint phá dữ liệu cũ nếu chưa có plan cleanup/backfill.
- Nếu thêm/sửa cột: kiểm tra `$fillable`, `$casts`, relationship, resource/transformer, validation.

Tên file gợi ý:

```text
# SQL file
docs/database/YYYY-MM-DD_mo-ta-ngan-gon.sql
```

Ví dụ:

```text
docs/database/2026-07-08_add-signed-at-business-contracts.sql
```

Template SQL docs:

```sql
-- Migration: <mô tả>
-- Feature: <JIRA/HOTFIX>
-- Date: YYYY-MM-DD
-- DB: MySQL/MariaDB

-- MIGRATION
-- ALTER TABLE ...

-- VERIFY
-- SELECT ...

-- ROLLBACK
-- ALTER TABLE ...
```

### Bước 4: Cập nhật deploy.md

Tạo/cập nhật `features/<JIRA>/deploy.md` nếu có:

- Lệnh migration: `php artisan migrate` hoặc SQL thủ công cần DBA chạy.
- Thứ tự deploy backend/frontend/job nếu có phụ thuộc schema.
- Config/env cần thêm.
- Verify query sau deploy.
- Rollback note cho migration/config/dependency.
- Backup/confirm nếu migration `irreversible` hoặc có nguy cơ mất dữ liệu.
- Batch/backfill plan nếu thay đổi ảnh hưởng dữ liệu lớn.

### Bước 5: Cập nhật DB docs

- Cập nhật `docs/database/structure.sql` thành schema snapshot mới sau khi feature DB change được áp dụng.
- `structure.sql` phản ánh cấu trúc hiện tại (`CREATE TABLE`/index/constraint), không ghi lịch sử deploy dạng chuỗi `ALTER TABLE`.
- Cập nhật `docs/database/` cùng feature nếu schema thay đổi.
- Ghi rõ bảng/cột/index/default/nullable mới.
- Nếu deprecate: ghi `DEPRECATED`, lý do, thay thế, ngày dự kiến xóa nếu có.
- Không xóa docs bảng/cột cũ nếu chưa chắc production không còn dùng.

### Bước 6: Verify

- Đối chiếu migration với model/query hiện tại.
- Kiểm tra `$fillable`, `$casts`, relationship, resource/transformer, validation nếu thêm/sửa cột.
- Kiểm tra nullable/default để tránh lỗi dữ liệu cũ.
- Với index/query lớn: ghi query cần tối ưu và cách verify bằng `EXPLAIN` trên dev/staging nếu có quyền.
- Đánh giá lock/time/backfill/batch cho DDL lớn.
- Chạy `php -l` cho migration PHP nếu có.
- Chỉ chạy migration trên local/dev khi DEV cho phép và có backup/rollback rõ.
- Không tự chạy migration production.

## Nguyên tắc

- Không tự ý chạy migration trên môi trường thật.
- Không thêm DB constraint phá dữ liệu cũ nếu chưa có plan cleanup.
- Không xóa bảng/cột vội; deprecate trước.
- Breaking change dùng expand/contract nếu có thể.
- DDL lớn phải có backup, đánh giá lock/time và batch/backfill plan.
- Rollback mất dữ liệu phải ghi `irreversible`.
- `docs/database/structure.sql` phải phản ánh schema mới sau khi feature DB change hoàn tất.
- DB docs phải cập nhật cùng feature có thay đổi schema.
- Mỗi DDL/DML quan trọng phải có verify và rollback note.
