# Rule 06 — GitNexus Setup & Impact

## Khi nào chạy

- Trước khi lập plan/sửa code mà service chưa có GitNexus index.
- Khi cần phân tích impact symbol/controller/service/model.
- Khi rule 01/02 yêu cầu GitNexus nhưng tool/index chưa sẵn sàng.

## Mục tiêu

Cài/cấu hình/index GitNexus cho các service eCon để agent phân tích impact trước khi đề xuất hoặc sửa code.

## Đầu vào bắt buộc

| Nguồn | Ghi chú |
|---|---|
| Upstream README | `https://github.com/abhigyanpatwari/GitNexus` |
| CLI/MCP | `npx -y gitnexus@latest analyze`, `npx -y gitnexus@latest setup`, `npx -y gitnexus@latest mcp` |
| Danh sách service | `econApi`, `econCloudDev`, `econAdminDev`, `nodeserver` |

## Đầu ra

- GitNexus đã cài/cấu hình nếu command chạy thành công.
- Index cho service liên quan.
- `docs/gitnexus.md` cập nhật trạng thái, lệnh cài, lệnh index, cách chạy impact.

## Quy trình

### Bước 1: Kiểm tra trạng thái

1. Đọc `docs/gitnexus.md`.
2. Kiểm tra CLI: `gitnexus --version` hoặc `npx gitnexus --version`.
3. Kiểm tra MCP/tool function có sẵn không.
4. Ghi trạng thái vào `docs/gitnexus.md`.

### Bước 2: Cài/cấu hình nếu chưa có

```bash
npx -y gitnexus@latest analyze
npx -y gitnexus@latest setup
```

Nếu máy đã có global thì có thể dùng lệnh ngắn hơn, nhưng không bắt buộc:

```bash
gitnexus analyze
gitnexus setup
```

### Bước 3: Index service

Chạy từ root từng service/repo cần phân tích:

```text
# Chạy trong root từng service/repo cần phân tích
npx -y gitnexus@latest analyze
```

Cập nhật lệnh thật vào `docs/gitnexus.md`.

### Bước 4: Impact bắt buộc

Trước khi đề xuất/sửa symbol:

```text
gitnexus_impact({ target: "<symbol>", direction: "upstream" })
gitnexus_impact({ target: "<symbol>", direction: "downstream" })
```

Trước khi hoàn tất:

```text
gitnexus_detect_changes()
```

## Nguyên tắc

- GitNexus là gate impact, không thay thế đọc code thật.
- Nếu GitNexus blocked, ghi blocker vào `plan.md`/`report.md`.
- Fallback grep/git diff chỉ dùng khi GitNexus không thể cài và DEV chấp nhận.
