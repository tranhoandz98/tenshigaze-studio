# GitNexus — eCon

> Trạng thái hiện tại: **BLOCKED trên máy dev hiện tại** — Node runtime quá cũ.
> Nguồn: `https://github.com/abhigyanpatwari/GitNexus` / npm package `gitnexus`.

> [!WARNING]
> `npx gitnexus --version` lỗi: `SyntaxError: The requested module 'node:util' does not provide an export named 'stripVTControlCharacters'`.
> Nguyên nhân: máy dev đang chạy **Node v14.18.0**, gitnexus yêu cầu Node ~18.19+/20.12+/22+ (dùng API `node:util` mới).
> Blocker: thiếu quyền/điều kiện nâng cấp Node trên máy này → chưa cài/index được GitNexus.
> Fallback áp dụng theo mục "Fallback khi GitNexus blocked" dưới đây: `git diff`, grep route/controller/service/model/component, đọc code thật trước khi ghi docs/plan.

## Mục tiêu

GitNexus dùng để phân tích impact symbol/code trước khi lập plan hoặc sửa code trong eCon.

## Service cần index

| Service | Trạng thái | Ghi chú |
|---|---|---|
| `econApi` | Chưa xác minh | Laravel backend |
| `econCloudDev` | Chưa xác minh | React Cloud frontend |
| `econAdminDev` | Chưa xác minh | React Admin frontend |
| `nodeserver` | Chưa xác minh | Node.js realtime/chat socket service |

## Cài đặt

Quick Start theo upstream README, không cần cài global:

```bash
# 1. Index repo, chạy từ repo root
npx -y gitnexus@latest analyze

# 2. Cấu hình editor/MCP một lần
npx -y gitnexus@latest setup
```

Nếu máy đã có global thì có thể dùng lệnh ngắn hơn, nhưng không bắt buộc:

```bash
gitnexus analyze
gitnexus setup
```

Fallback nếu npm 11 crash:

```bash
pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter dlx gitnexus@latest analyze
```

Nếu máy không có C++ toolchain, set biến môi trường rồi chạy bằng `npx`:

```bash
$env:GITNEXUS_SKIP_OPTIONAL_GRAMMARS = "1"
npx -y gitnexus@latest analyze
```

Antigravity MCP config (`~/.gemini/antigravity/mcp_config.json`):

```json
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
```

> Nên chạy `gitnexus setup` thay vì chỉ sửa tay MCP config, vì setup còn thêm hook/skills và giữ hook cũ.

## Prompt chuẩn

```text
Đọc `docs/rules/06-gitnexus-setup.md`.
Kiểm tra GitNexus đã cài chưa: `gitnexus --version` hoặc `npx -y gitnexus@latest --version`.
Nếu chưa có index, chạy `npx -y gitnexus@latest analyze` từ root từng service/repo cần phân tích.
Nếu cần MCP/Antigravity, chạy `npx -y gitnexus@latest setup` một lần.
Index các service: `econApi`, `econCloudDev`, `econAdminDev`, `nodeserver`.
Sau đó chạy impact cho symbol: `<symbol>` và ghi kết quả vào plan/report.
```

## Impact chuẩn

```text
gitnexus_impact({ target: "<Controller|Service|Model|function>", direction: "upstream" })
gitnexus_impact({ target: "<Controller|Service|Model|function>", direction: "downstream" })
```

## Detect changes

```text
gitnexus_detect_changes()
```

## Fallback khi GitNexus blocked

Chỉ fallback khi đã ghi blocker:
- Thiếu package/repo.
- Thiếu quyền cài.
- Thiếu network/internal registry.
- Tool function chưa bật.

Fallback tối thiểu:
- `git diff`.
- Grep route/controller/service/model/component.
- Đọc code thật trước khi ghi docs/plan.
