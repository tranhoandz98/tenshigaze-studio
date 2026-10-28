# Rule 00: Khởi tạo Docs (Init Documentation)

> **Khi nào chạy:** Khởi tạo dự án lần đầu, rebuild docs, hoặc audit lại toàn bộ docs.
> **Đầu vào:** Toàn bộ source code các service + config/docs hiện có.
> **Đầu ra:** `ARCHITECTURE.md`, `specs/*.md`, `DESIGN.md`, `database/` nếu cần.

## Quy trình

### Bước 1: Pull docs repo mới nhất

```bash
cd <project-root>/docs
git pull
```

### Bước 2: Đọc tổng quan project

1. Đọc `../CLAUDE.md` root project.
2. Đọc `README.md` docs nếu có.
3. Đọc service quick rules trong `../CLAUDE.md`.
4. Đọc package/config chính để xác nhận stack, không suy đoán.

### Bước 3: Khảo sát codebase

Đọc và phân tích:

1. **Backend routes** — `econApi/routes/*.php` để biết API endpoints.
2. **Controllers** — nhóm Admin/Client/Backend/Integration/IntegrationCloud.
3. **Services** — `econApi/app/Services/*` để hiểu business logic.
4. **Models** — `econApi/app/Models/*` để hiểu cấu trúc dữ liệu/relationship.
5. **Jobs/Queue/Kafka/Storage/Auth** — phần tích hợp ngoài nếu có trong code/config.
6. **Frontend Cloud** — `econCloudDev/src/features/`, `src/api/`, `src/routers/`.
7. **Frontend Admin** — `econAdminDev/src/pages/`, `src/api/`, `src/routers/`.
8. **Database** — migrations, SQL docs, schema docs trong `docs/database/`.

### Bước 4: Cập nhật `docs/ARCHITECTURE.md`

- Vẽ sơ đồ kiến trúc tổng thể bằng Mermaid nếu cần.
- Mô tả từng service, tech stack, port/dev entrypoint nếu xác minh được.
- Mô tả luồng xác thực, luồng dữ liệu, tích hợp ngoài.
- Mô tả queue/job/Kafka/storage/cache/search nếu có bằng chứng code/config.
- Gắn link file code/config tham chiếu cho claim quan trọng.

### Bước 5: Cập nhật `docs/specs/*.md`

Xác định domain từ codebase và AGENTS domain map. Với mỗi domain:

- Mô tả luồng nghiệp vụ end-to-end.
- Mô tả input/output/state/permission chính.
- Liệt kê API endpoints liên quan.
- Liệt kê model/bảng chính.
- Gắn link tới route/controller/service/model/component liên quan.

### Bước 6: Cập nhật `docs/DESIGN.md`

- Mô tả layout, navigation, page tree.
- Mô tả PrimeReact/PrimeFlex/component patterns hiện có.
- Mô tả design tokens/style conventions nếu có trong SCSS/theme.
- Gắn link tới component/style nguồn.

### Bước 7: Cập nhật `docs/database/` nếu cần

- Cập nhật schema/table docs nếu hiện trạng thiếu hoặc lỗi thời.
- Không tự chạy migration production.
- Nếu không đủ DB thật để verify, ghi rõ “cần verify DB”.

### Bước 8: Self-check

- [ ] Không bịa endpoint/field/model/config.
- [ ] Claim quan trọng có link code/config/docs gốc.
- [ ] Không copy-paste code dài vào docs; chỉ mô tả và dẫn nguồn.
- [ ] Tên file đúng casing: `ARCHITECTURE.md`, `DESIGN.md`.
- [ ] Docs mới không mâu thuẫn `CLAUDE.md`.

### Bước 9: Review

> [!IMPORTANT]
> Output của rule này là nền tảng cho mọi plan sau này. Bắt buộc TechLead review kỹ trước khi merge.

> [!WARNING]
> Không tự commit/push docs nếu chưa được yêu cầu. AI chỉ đề xuất diff/commit để DEV/TechLead review.
