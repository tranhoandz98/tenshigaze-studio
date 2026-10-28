# Rule 04 — Cập nhật tài liệu sau khi code thay đổi (Update Docs)

## Khi nào chạy

- Ngay sau khi code đã merge vào `develop` hoặc nhánh tích hợp.
- Khi phát hiện `ARCHITECTURE.md`, `DESIGN.md`, `specs/*.md`, `database/` lỗi thời so với code.
- Khi feature/report có thay đổi API, logic, UI, DB, queue/job, storage, tích hợp ngoài.

## Mục tiêu

Docs repo (`docs/`) là source of truth. Code thay đổi mà docs không cập nhật thì mọi plan sau sai theo.

## Đầu vào

| Nguồn | Mô tả |
|---|---|
| Git diff | `git diff develop...feature-branch` hoặc diff commit đã merge |
| Code hiện tại | Route, Controller, Service, Model, migration, component, API module |
| Feature docs | `features/<JIRA>/plan.md`, `tasks.md`, `report.md`, `deploy.md` nếu có |
| Docs hiện tại | `ARCHITECTURE.md`, `DESIGN.md`, `specs/*.md`, `database/` |
| GitNexus (nếu có) | `gitnexus_detect_changes()` để hỗ trợ phát hiện symbol/API/model đổi |

## Đầu ra

- Diff/commit docs đề xuất cập nhật.
- Link commit/code làm bằng chứng cho claim quan trọng.
- Ghi rõ điểm chưa verify nếu không thể đối chiếu code.

## Cách thực hiện

### Bước 1: Phát hiện thay đổi ảnh hưởng docs

| Loại thay đổi | Docs cần cập nhật |
|---|---|
| Thêm/sửa route/controller/service/model | `specs/<domain>.md` |
| Thay đổi input/output API | `specs/<domain>.md` |
| Thay đổi business flow/state/permission | `specs/<domain>.md` |
| Thay đổi i18n key/UI text/API message/email/notification/export | `specs/<domain>.md` + locale liên quan |
| Thêm/sửa bảng/cột/index/seed data | `database/` + `specs/<domain>.md` nếu ảnh hưởng nghiệp vụ |
| Thay đổi queue/job/Kafka/storage/HSM/CyberSign/email/search | `ARCHITECTURE.md` + spec domain |
| Thay đổi UI/page/component/theme/layout | `DESIGN.md` + spec domain nếu đổi flow |
| Thêm service/module lớn | `ARCHITECTURE.md`, `README.md`, spec domain |
| Thay đổi workflow AI/rule | `rules/` + `README.md` |

### Bước 2: GitNexus gate

1. Nếu GitNexus đã cài/index: chạy `gitnexus_detect_changes()`.
2. Nếu chưa cài/index: ghi rõ “GitNexus chưa sẵn sàng”, không claim đã dùng impact.
3. GitNexus chỉ hỗ trợ impact; vẫn phải đọc `git diff` và code thật.

### Bước 3: Viết diff docs

- Giữ format hiện tại.
- Không bịa endpoint/field/model nếu chưa verify.
- Mỗi thay đổi docs nên có link tới file code hoặc commit liên quan.
- Nếu thay đổi thuộc feature, cập nhật `features/<JIRA>/plan.md` hoặc `report.md` tương ứng.
- Một thay đổi logic → một diff docs rõ scope; không gom nhiều domain không liên quan.
- Không xóa thông tin cũ nếu chưa chắc không còn dùng; ưu tiên đánh dấu deprecated kèm lý do.

### Bước 3.1: Checklist chuẩn cho `specs/<domain>.md`

Khi tạo mới hoặc cập nhật spec domain, ưu tiên đủ các mục sau. Nếu mục không áp dụng, ghi `N/A` ngắn gọn thay vì bỏ trống:

1. **Metadata domain:** Domain, backend service/model, frontend feature/page.
2. **Scope nghiệp vụ:** phạm vi xử lý và out-of-scope chính.
3. **Actor/quyền:** actor, permission/role, ràng buộc truy cập.
4. **Flow chính:** luồng nghiệp vụ, state transition nếu có.
5. **API endpoints:** method, path, input chính, output chính.
6. **Input/output/state:** field quan trọng, trạng thái, fallback.
7. **Backend mapping:** route/controller/request/service/repository/model/job.
8. **Frontend mapping:** route/page/component/api hook/query/slice.
9. **DB/schema:** bảng/cột/index/migration liên quan, hoặc `N/A`.
10. **i18n:** namespace/file locale, key cần thêm/sửa, fallback ngôn ngữ mặc định, không hardcode text.
11. **Edge cases:** dữ liệu thiếu, quyền thiếu, lỗi tích hợp, retry nếu có.
12. **Deploy/config impact:** env/config/queue/cron/storage/Keycloak/dependency, hoặc `N/A`.
13. **Change log:** Jira/feature, ngày, tóm tắt thay đổi docs.

Spec mới nên dùng template `docs/specs/_template.md`.

### Bước 4: Self-check

1. Đọc lại file docs đã sửa.
2. Đối chiếu claim chính với code/diff/commit.
3. Kiểm tra link file/section còn đúng.
4. Kiểm tra tên file đúng casing: `ARCHITECTURE.md`, `DESIGN.md`.
5. Chạy grep/check markdown cơ bản nếu có thể.
6. Ghi rõ “cần verify” cho phần chưa có bằng chứng chắc chắn.

## Nguyên tắc

- Code merged → docs updated.
- Docs change phải có chứng cứ từ code/diff/commit hoặc ghi rõ cần verify.
- AI chỉ đề xuất; TechLead review/merge.
- Không thay docs bằng suy đoán.
- Không để docs mâu thuẫn `CLAUDE.md` và feature plan/report.
