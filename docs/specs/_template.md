# Spec: <Tên domain>

> Domain: `<domain>`
> Backend: `<service/controller/model chính>`
> Frontend: `<feature/page/component chính>`
> Cập nhật: YYYY-MM-DD

## 1. Mô tả

Mô tả ngắn phạm vi nghiệp vụ domain.

## 2. Scope / Out-of-scope

### Scope
- ...

### Out-of-scope
- ...

## 3. Actor / Quyền

| Actor | Quyền/permission | Ghi chú |
|---|---|---|
| ... | ... | ... |

## 4. Luồng nghiệp vụ

### 4.1 Luồng chính

1. ...
2. ...
3. ...

### 4.2 State / trạng thái

| State | Ý nghĩa | Chuyển tiếp hợp lệ |
|---|---|---|
| ... | ... | ... |

## 5. API endpoints

| Method | Path | Mục đích | Input chính | Output chính |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 6. Input / Output / State

### Input chính
- ...

### Output chính
- ...

### Fallback / default
- ...

## 7. Backend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `...` | ... |
| Controller | `...` | ... |
| Request/Validation | `...` / N/A | ... |
| Service | `...` | ... |
| Repository/Query | `...` / N/A | ... |
| Model | `...` | ... |
| Job/Queue/Event | `...` / N/A | ... |

## 8. Frontend mapping

| Layer | File/Symbol | Ghi chú |
|---|---|---|
| Route | `...` / N/A | ... |
| Page/Feature | `...` | ... |
| Component | `...` / N/A | ... |
| API client | `...` / N/A | ... |
| Query/Slice/Hook | `...` / N/A | ... |
| Style | `...` / N/A | ... |

## 9. DB / Schema

| Table | Cột/index liên quan | Ghi chú |
|---|---|---|
| N/A | N/A | Không đổi DB |

## 10. i18n

| Namespace/file locale | Key | Ngôn ngữ | Text/fallback | Ghi chú |
|---|---|---|---|---|
| N/A | N/A | N/A | N/A | Không có text/message mới |

Quy tắc:
- Không hardcode UI text/API message/email/notification/export.
- Nếu thêm key mới, ghi file locale và fallback mặc định.
- Nếu đổi validation/error message, ghi rõ ảnh hưởng.

## 11. Edge cases

- ...

## 12. Deploy / Config impact

| Loại | Có thay đổi | Ghi chú |
|---|---|---|
| Env/config | Không | N/A |
| DB migration | Không | N/A |
| Queue/cron/job | Không | N/A |
| Storage/bucket | Không | N/A |
| Keycloak/permission config | Không | N/A |
| Dependency | Không | N/A |

## 13. Change log

| Ngày | Feature/Jira | Thay đổi | Bằng chứng code/docs |
|---|---|---|---|
| YYYY-MM-DD | FEAT-xxxx | Khởi tạo/cập nhật spec | `path/to/file` |
