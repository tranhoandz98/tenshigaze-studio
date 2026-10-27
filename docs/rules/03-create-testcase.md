# Rule 03: Tạo Testcase (Create Testcase)

> **Khi nào chạy:** Sau khi có plan, trước khi implement; hoặc khi BA/QA cần testcase để verify.
> **Đầu vào:** `expect.md` là nguồn chính, `plan.md` chỉ tham chiếu scope kỹ thuật, `specs/*.md` liên quan.
> **Đầu ra:** `testcase.md`

## Quy trình

### Bước 1: Đọc đầu vào

1. Đọc `features/<JIRA>/expect.md` — source of truth về yêu cầu và Acceptance Criteria.
2. Đọc `features/<JIRA>/plan.md` — chỉ để biết service/file bị ảnh hưởng.
3. Đọc `docs/specs/<domain>.md` liên quan để hiểu flow/state hiện có.
4. Nếu có UI: đọc `docs/DESIGN.md` để hiểu flow màn hình.

### Bước 2: Phân tích Acceptance Criteria

Với từng AC, xác định:

- Actor: ai thao tác.
- Permission/role: quyền cần có.
- Precondition: trạng thái hệ thống/dữ liệu trước test.
- Action: hành động hoặc API/màn hình.
- Expected result: kết quả đo được.
- Data setup: dữ liệu mẫu cụ thể.

### Bước 3: Sinh testcase

Nguyên tắc:

- Sinh từ **expect.md**, không sinh từ plan.md.
- Test behavior/output, không test implementation detail nội bộ.
- Mỗi AC tối thiểu có happy path + edge case; có error case nếu AC có validation/quyền/state.
- Ưu tiên test các điểm rủi ro: phân quyền, state transition, dữ liệu cũ, concurrency, batch lớn, timeout, rollback.
- Dữ liệu test phải cụ thể, không ghi “user bất kỳ”.

### Bước 4: Tạo `testcase.md`

```markdown
# Testcase: <JIRA> — [Tên feature]

## 1. Tổng quan
- Feature: <JIRA>
- Source: `expect.md`
- Scope: [backend/frontend/db/integration]

## 2. Test cases

### TC-001: [Tên testcase]
- **Loại**: Happy path / Edge case / Error case / Regression / Security
- **Mức độ**: Unit / Integration / E2E / Manual
- **Priority**: P0 / P1 / P2 / P3
- **Service**: econApi / econCloudDev / econAdminDev / DB / Integration
- **AC map**: AC-01
- **Actor**: [user/role cụ thể]
- **Precondition**:
  - [Trạng thái DB/quyền/config/dữ liệu]
- **Input/Test data**:
  ```json
  {}
  ```
- **Steps**:
  1. [Hành động 1]
  2. [Hành động 2]
- **Expected**:
  - [Kết quả đo được: HTTP status, response shape, DB state, UI text/state]
- **Notes**: [nếu có]

### TC-002: ...

## 3. Cover matrix

| AC | Happy path | Edge case | Error/Security | Regression | Status |
|---|---|---|---|---|---|
| AC-01 | TC-001 | TC-002 | TC-003 | TC-004 | ✅ |
| AC-02 | TC-005 | — | TC-006 | — | ⚠️ thiếu edge case |

## 4. Dữ liệu test cần chuẩn bị
| Data | Mục đích | Cách tạo |
|---|---|---|

## 5. Regression cần chạy lại
- [ ] [Luồng/domain liên quan]
```

### Bước 5: Self-check

- [ ] Mọi AC đều xuất hiện trong cover matrix.
- [ ] Mỗi AC có ít nhất 1 happy path.
- [ ] Validation/quyền/state đều có negative/error case.
- [ ] Precondition và data cụ thể, QA có thể chạy được.
- [ ] Không test implementation detail.

> [!IMPORTANT]
> Sau implement, `report.md` phải ghi rõ kết quả test dựa trên `testcase.md` và output thật, không tự tường thuật.
