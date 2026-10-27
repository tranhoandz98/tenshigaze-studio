# AGENTS.md — eCon Project

> Root project agent guide. Source of truth for workspace, architecture, and operating rules.
> Keep one root `AGENTS.md`; no per-service agent guides. Synchronize `docs/reference/root-agent-example.md` in the same change.

---

## 0. File metadata [REQUIRED]

```yaml
project: eCon
doc_version: 1.0.0
updated_at: 2026-08-28
owner: TBD — owner: TechLead
docs_repo: http://10.30.1.17/econtract/docs.git
ticket_prefix: FCAC   # e.g. FEAT, PROJ, CBCLOUDV2
language_for_ai_replies: Vietnamese
```

---

## 1. Project overview [REQUIRED]

**eCon** is an enterprise platform for contract, document, and digital-signing workflow management.

**Business goal:** digitize the complete economic and labor contract lifecycle for internal enterprises: authoring, submission, approval, remote signing, storage, and reporting.

**Main capabilities:**
- Economic and labor contract management
- Document submission and approval workflows
- Remote signing, document management, delegation, organization, employee management, and cloud-storage integration

**Customer / stakeholders:** internal enterprises; development team, BA, and TechLead.

**Out of scope for this workspace:** legacy systems and imported material, including `docs/docs-master/`.


---

## 2. Session start protocol [REQUIRED]

Read in this exact order **before** planning, coding, testing, or reviewing:

1. Run `git pull` inside `docs/`.
2. This file (`AGENTS.md`).
3. `docs/README.md` — the spec-driven workflow.
4. `docs/ARCHITECTURE.md` — services, ports, deployment, inter-service communication.
5. `docs/specs/<domain>.md` — the business domain(s) touched by the task.
6. `docs/rules/<rule>.md` — the rule matching the type of work.
7. `docs/DESIGN.md` — **only if** the task changes UI.
8. `docs/features/<TICKET-ID>/` — if the task belongs to a ticket.
9. Run GitNexus impact analysis when available; see §12.

**Do not start writing code before steps 1–6 are done.**

---

## 3. Workspace layout [REQUIRED]

Each row is an independently cloned git repository sitting beside `docs/`. The parent folder is **not** a git repo.

```text
econProject/                      ← parent folder, NOT a git repo
├── AGENTS.md                     ← this file
├── docs/                         ← docs repo; source of truth
│   ├── README.md                 ← spec-driven workflow
│   ├── ARCHITECTURE.md           ← overall architecture
│   ├── DESIGN.md                 ← UI/UX design system
│   ├── commands.md               ← command catalog
│   ├── specs/                    ← business specifications
│   ├── rules/                    ← AI operating rules
│   ├── features/                 ← one folder per ticket
│   ├── database/                 ← schema and migrations
│   └── reference/                ← not read by default
├── econApi/                      ← Laravel 7 backend API
├── econCloudDev/                 ← React 17 Cloud frontend
├── econAdminDev/                 ← React 17 Admin frontend
├── pdfserviceforcybersign/       ← Java 8/Spring Boot PDF service (:8211)
├── nodeserver/                   ← Node.js realtime/chat socket service
├── ocr-service/                  ← Python OCR service (:8061)
└── fca_convert_service/          ← FCA conversion; role/port TBD
```

**Naming rule [REQUIRED]:** the **local folder name is the canonical name** used everywhere in docs, plans, tasks and reports. Never refer to a service by its git repository name or by its README title. When the repo name / README disagrees with the actual source code, **the source code wins** — and the discrepancy must be recorded in `docs/ARCHITECTURE.md`.

---

## 4. Service registry [REQUIRED]

> This table is the **only** source for mapping a service to a path. The AI must never guess a service from folder names, grep, or similarity of names.

| service-key (canonical) | Repo path | Git repository | Role | Runtime / port | Datastore |
|---|---|---|---|---|---|
| `econApi` | `./econApi` | `econtract/api.git` | Laravel backend API | PHP 7.2.5+/8.0, :8000 | MySQL/MariaDB, Redis |
| `econCloudDev` | `./econCloudDev` | `econtract/cloud.git` | Cloud frontend | React 17 + Vite 4, :3000 | — calls econApi |
| `econAdminDev` | `./econAdminDev` | `econtract/admin.git` | Admin frontend | React 17 + Vite 4, :4000 | — calls econApi |
| `pdfserviceforcybersign` | `./pdfserviceforcybersign` | `cyberhsm2/pdfserviceforcybersign.git` | PDF processing and signing | Java 8 + Spring Boot 2.4, :8211 | — internal |
| `nodeserver` | `./nodeserver` | `cybernodejs/nodeserver.git` | Realtime/chat socket service | Node.js + Express + Socket.IO, port TBD | MySQL session |
| `ocr-service` | `./ocr-service` | `econtract/ocr-service.git` | Vietnamese OCR | Python Flask + PaddleOCR, :8061 | — stateless |
| `fca_convert_service` | `./fca_convert_service` | `econtract/fca_convert_service.git` | FCA conversion | TBD — owner: TechLead | TBD — owner: TechLead |
| `docs` | `./docs` | `econtract/docs.git` | Documentation source of truth | — | — |

**Shared infrastructure:** MySQL/MariaDB, Redis, Kafka, MinIO, Google Drive, Dropbox, OneDrive, Elasticsearch.

### Service resolution rules [REQUIRED]

1. The target service is always **explicitly declared**, in this priority order:
   `plan.md` front-matter `service:` → the `Service` column of the row in `tasks.md` → the user stating it in the session.
2. **Never** discover or guess the target service by grep / glob / folder-name similarity.
3. Only touch files inside the `Repo path` mapped from the `service-key` in the table above.
4. If the service is undeclared, the `service-key` does not match the registry, or one task spans more than one repo without saying so → **STOP and ASK**. Do not choose on your own.
5. When a task legitimately spans several services, handle each repo separately using its own path.

---

## 5. Tech stack [REQUIRED]

| Service | Framework / version | Language / version | Auth | Build & run |
|---|---|---|---|---|
| `econApi` | Laravel 7.x | PHP 7.2.5+/8.0 | Keycloak + Google OAuth | `composer install` / `php artisan serve` |
| `econCloudDev` | React 17 + Vite 4 | JSX/TSX | Keycloak + Google OAuth | `yarn install` / `yarn dev` |
| `econAdminDev` | React 17 + Vite 4 | JSX/TSX | Keycloak | `yarn install` / `yarn dev` |
| `pdfserviceforcybersign` | Spring Boot 2.4 | Java 8 | Internal | `./mvnw -q compile` |
| `nodeserver` | Express + Socket.IO | JavaScript | Shared app/session token | `npm install` / node |
| `ocr-service` | Flask | Python | Internal | Docker Compose |
| `fca_convert_service` | TBD — owner: TechLead | TBD — owner: TechLead | TBD — owner: TechLead | Docker |

### Cross-cutting technology
- **Database:** MySQL/MariaDB — ORM Eloquent
- **Cache:** Redis
- **Queue / messaging:** Kafka — topics/queues listed in `docs/ARCHITECTURE.md`
- **Object storage:** MinIO, Google Drive, Dropbox, OneDrive
- **Search:** Elasticsearch
- **Observability:** Prometheus, OpenTelemetry
- **CI/CD:** GitLab CI

---

## 6. Source-of-truth map [REQUIRED]

| Question to answer / thing to change | Read this first |
|---|---|
| Architecture, services, external integrations | `docs/ARCHITECTURE.md` |
| Detailed contracts: entities, endpoints, events, topics | `docs/specs/SPECS.md` or `docs/specs/<domain>.md` |
| UI/UX, layout, component, theme | `docs/DESIGN.md` |
| Business logic, input/output, state machine | `docs/specs/<domain>.md` |
| DB schema / migration | `docs/database/` + `docs/rules/05-db-migration.md` |
| A specific ticket | `docs/features/<TICKET-ID>/` |
| How the AI must operate | `docs/rules/*.md` |
| Reference / legacy material | `docs/reference/` — **not read by default** |

**Reading budget rules:**
- Do **not** read the full `docs/database/structure.sql` by default; grep only the tables relevant to the task.
- Do **not** read `docs/reference/` by default.
- Do **not** read generated/build output.

---

## 7. Business domain map [OPTIONAL but recommended]

| # | Domain | Backend module / service | Frontend feature | Spec file |
|---|---|---|---|---|
| 1 | TBD — owner: TechLead | TBD — owner: TechLead | TBD — owner: TechLead | `docs/specs/TBD — owner: TechLead.md` |
| 2 | TBD — owner: TechLead | TBD — owner: TechLead | TBD — owner: TechLead | `docs/specs/TBD — owner: TechLead.md` |


---

## 8. Feature workflow [REQUIRED]

### 8.1 Feature folder model

Every unit of work lives under `docs/features/<TICKET-ID>/` using lowercase file names. `<TICKET-ID>` is the **issue-tracker ID** (FCAC-1234) — never an ad-hoc number.

| File | Owner | Content |
|---|---|---|
| `expect.md` | BA | Expected behavior, actors, acceptance criteria (measurable), out-of-scope, open questions |
| `plan.md` | DEV + AI | Implementation design; requires Gate 1 approval before any code |
| `tasks.md` | DEV + AI | Task checklist split by service, each row with a `Service` column and status |
| `testcase.md` | AI | Test scenarios generated **from `expect.md`**, not from `plan.md` |
| `impact.md` | AI + DEV | Affected components, confirmed-unaffected areas, risks, unverified items |
| `report.md` | AI | Real changed files, real verification output, follow-ups — never a narrated guess |
| `deploy.md` | DEV | Created **only** when DB / config / environment / deployment changes exist |
| `extract/` | any | Supporting documents attached to the ticket |

### 8.2 Lifecycle and gates

```text
draft ──► plan-review ──► approved ──► in-progress ──► testing ──► done
                                              │
                                              └──► blocked / cancelled
```

- **Gate 1 — Plan review:** `plan.md` must be self-reviewed by DEV and approved by TechLead before implementation starts. Only then may status become `approved`.
- **Gate 2 — Docs update review:** the AI may only **propose** changes to `docs/specs/` and `docs/ARCHITECTURE.md` as a diff/PR on the docs repo. TechLead approves before merge. Reason: wrong docs poison every later plan.

### 8.3 Status values [REQUIRED]

`draft` · `plan-review` · `approved` / `ready` · `in_progress` · `blocked` · `testing` · `done` · `cancelled`

Standardize the top of `tasks.md` with YAML front matter:

```md
---
feature: FCAC-0000
service: econApi
status: in_progress
owner: AI/DEV
updated_at: 2026-08-28
---
```

### 8.4 Definition of Done [REQUIRED]

A feature must **not** be marked `done` while any of these is true:
- `tasks.md` still has `[ ]` or `[/]` items.
- `report.md` has no real verification output.
- There is a DB / deploy / config change but no `deploy.md`.
- The changed code was not linted / tested with the service's verification command (§10).
- Business logic changed but `docs/specs/` was not updated (or the diff is not pending review).
- DB schema / migration / schema-dependent queries changed but `docs/database/` was not updated — or DEV was not asked whether to wait for the DBA to run the migration first.

When the feature is `done`, update in the same pass: `tasks.md` (all `[x]`), `report.md`, `plan.md` (completed or remaining scope), `deploy.md` if applicable, and the database docs.

### 8.5 Definition of Ready — before writing a plan [REQUIRED]

Before creating `plan.md`, verify `expect.md` has: measurable acceptance criteria, out-of-scope list, actors, inputs, outputs, and state transitions. If anything is missing, or a blocking question exists about business rules / architecture / data / permissions:

**STOP. Ask DEV/BA.** Only write a blocking draft containing `status: draft`, a `Blocking questions` section, and a note that planning cannot proceed. Do not write detailed design or implementation tasks until the questions are answered.

### 8.6 If work is left unfinished

The AI must report: current status, remaining tasks, blockers, and any repo/branch/file with an unclean working tree.

---

## 9. Rule index [REQUIRED]

| Rule file | When to run | Input | Output |
|---|---|---|---|
| `docs/rules/00-init-docs.md` | Bootstrap or rebuild docs | Source code of all services | `ARCHITECTURE.md`, `DESIGN.md`, `specs/*.md` |
| `docs/rules/01-create-plan.md` | `expect.md` exists | `expect.md` + base docs | `plan.md`, `tasks.md` |
| `docs/rules/02-implement-task.md` | Plan approved (Gate 1) | `tasks.md` | Code + `report.md` + `deploy.md` + docs diff |
| `docs/rules/03-create-testcase.md` | After plan, before code | `expect.md` | `testcase.md` |
| `docs/rules/04-update-docs.md` | After code changed behavior/spec | Git diff + real code | Proposed docs diff |
| `docs/rules/05-db-migration.md` | Any DB/schema/data change | Plan/tasks/schema | Migration script + deploy note |
| `docs/rules/06-gitnexus-setup.md` | TBD — owner: TechLead | gitnexus | TBD — owner: TechLead |
| `docs/rules/Quy-dinh-unit-test.md` | Viết unit test & lập báo cáo | Code mới/sửa + spec AC#/R#/E## | Code test + `unit-test-report.md` |
| `docs/rules/TBD — owner: TechLead.md` | TBD — owner: TechLead | TBD — owner: TechLead | TBD — owner: TechLead |

How to invoke: open the AI session at the **parent folder**, then ask e.g.
*"Read `AGENTS.md` and `docs/rules/01-create-plan.md`, execute for `docs/features/FCAC-0090`."*

---

## 10. Service quick rules [REQUIRED]

| Service | Read the source in this order | Verification command | Constraints |
|---|---|---|---|
| `econApi` | routes -> Controller -> Service -> Model | `php -l <changed_file>` | PHP 7.2.5+/8.0 |
| `econCloudDev` | routes -> features -> pages -> components | `npx eslint <changed_files>` hoặc `yarn lint` | React 17 + Vite 4 |
| `econAdminDev` | routes -> pages -> components -> api | `npx eslint <changed_files>` hoặc `yarn lint` | React 17 + Vite 4 |
| `pdfserviceforcybersign` | TBD — owner: TechLead | `./mvnw -q compile` | Java 8 + Spring Boot 2.4 |


---

## 11. Agent working rules [REQUIRED]

### Scope and safety
- Never implement anything outside the approved `expect.md` / `plan.md` / `tasks.md` scope.
- Keep `plan.md` and `tasks.md` current while work progresses.
- Draft `impact.md` during planning; finalize it after implementation so it reflects the real blast radius.
- `report.md` must contain **real** changed files and **real** verification output — never a narrated guess.
- Never copy secrets, keys, tokens, or connection strings from config files into documentation.
- Never edit generated / build output unless explicitly requested.
- When the AI lacks write permission for a required path (`plan.md`, `tasks.md`, docs...), **ask for write access to that exact path**. Do not silently substitute a different output location.

### Clarification & Inquiry Protocol [REQUIRED]
- **Làm rõ điểm nghẽn nghiệp vụ:** Trước khi lập plan hoặc viết code, chủ động rà soát và xác nhận với người dùng các chi tiết nghiệp vụ còn thiếu hoặc gây mâu thuẫn (phân quyền, luồng dữ liệu liên service, ràng buộc hệ thống).
- **Tránh suy đoán sai lệch:** Đối với các điểm mập mờ cốt lõi, xác nhận với người dùng trước khi triển khai; với các quyết định kỹ thuật tiêu chuẩn, ghi nhận rõ giả định an toàn đã áp dụng.

### Self-Audit & Optimization Loop (Tự rà soát logic & đề xuất tối ưu) [REQUIRED]
- **Tự rà soát lỗ hổng logic:** Trước khi đề xuất phương án hoặc code, AI phải tự động rà soát đa chiều các lỗ hổng logic tiềm ẩn (race conditions, thiếu database transaction, bypass quyền hạn, dữ liệu trùng lặp, memory leak, unhandled exceptions...).
- **Tự sửa lỗi & tối ưu:** Tự phát hiện và sửa chữa các sai sót trong suy luận ban đầu. Luôn đưa ra bản đề xuất giải pháp tối ưu hơn (về hiệu năng, độ tinh gọn, khả năng mở rộng) kèm phân tích ưu/nhược điểm rõ ràng để người dùng phê duyệt trước khi thi hành.

### Execution Speed & Focus Protocol (Tối ưu tốc độ phản hồi & Đúng trọng tâm) [REQUIRED]
- **Phân tách Hỏi nguyên nhân vs. Thực thi sửa lỗi (Ask vs. Act):**
  - Khi người dùng hỏi *"Tại sao..."*, *"Kiểm tra vì sao..."*: Chỉ đọc code, tìm đúng dòng gây lỗi, giải thích ngắn gọn nguyên nhân và nêu hướng xử lý trong 1–2 phút. **Tuyệt đối không tự ý sửa code, tạo test, commit hay deploy** trong lượt này.
  - Chỉ thực hiện sửa code, chạy test và commit khi người dùng ra lệnh rõ ràng (*"Sửa đi"*, *"Fix lỗi này"*, *"Tiến hành đi"*).
- **Ưu tiên đọc Code trước khi truy vấn DB (Code-first):**
  - Luôn lần theo luồng logic qua file mã nguồn (`Grep`/`Read`) trước.
  - Tuyệt đối không chạy hàng loạt câu query quét bảng database lớn gây nghẽn lượt xử lý và quá tải dữ liệu.
- **Quy trình 3 bước tách biệt (Không gộp nhiều việc vào 1 lượt):**
  - Bước 1: Báo nguyên nhân & phương án (phản hồi nhanh, ngắn gọn).
  - Bước 2: Người dùng duyệt -> Mới sửa code & chạy test cục bộ.
  - Bước 3: Người dùng yêu cầu -> Mới commit/push hoặc deploy.
- **Giới hạn công cụ khi giải thích (Tool Budget):** Khống chế tối đa 3–5 tool calls cho câu hỏi tra cứu/giải thích để đưa ra kết luận nhanh nhất, không đào sâu lan man sang các file gián tiếp.
- **Xử lý câu hỏi chen ngang (Mid-turn):** Trả lời trực tiếp câu hỏi chen ngang của người dùng, không tự động ôm đồm giải quyết cả 2 bài toán lớn trong cùng một lượt.

### Code conventions
- Respect existing layering: TBD — owner: TechLead on the backend, TBD — owner: TechLead on the frontend.
- Never put business logic in controllers or UI components.
- Preserve the existing conventions of each framework in use (TBD — owner: TechLead).
- Write files as **UTF-8 without BOM**.
- Answers and code comments in **Vietnamese**.
- **Never write non-ASCII text through shell here-strings/redirection** (`@'...'@`, `Set-Content`, `echo >`). Shell code pages corrupt Vietnamese. Use the file edit/create tools instead.
- **After writing any file containing non-ASCII text, verify the result**: re-read the file and confirm the language is intact. Reject the write if it contains mojibake markers (`Ã`, `â€`, `Â`, `\uFFFD`) or if diacritics are lost.
- If a file is found corrupted, restore it from git (`git checkout -- <path>`) and re-apply the change with the edit tool. Do not attempt encoding round-trip repairs on committed content.
- After editing code, run the service's verification command from §10:
  - Frontend (`econCloudDev`, `econAdminDev`): bắt buộc chạy `npx eslint <changed_files>` trước khi hoàn tất hoặc build để loại bỏ triệt để lỗi syntax, biến chưa khai báo (`no-undef`), khai báo trùng (`no-redeclare`).
  - Backend (`econApi`): bắt buộc chạy `php -l <changed_files>` để xác nhận cú pháp PHP hợp lệ.

### TBD — owner: TechLead
The product must support multiple languages. When planning or changing any UI text, API message, email, notification, or export, the plan must state: translation keys to add/change, the locale namespace/file, that no text is hardcoded, the fallback/default language, and the impact on validation and error messages.

### TBD — owner: TechLead
All outbound calls from `econApi` must go through `TBD — owner: TechLead`. Do not use a raw HTTP client. Enable request/response logging via `TBD — owner: TechLead`; never log secrets, tokens, or personal data.

### TBD — owner: TechLead
Every new UI page wraps its main content in `TBD — owner: TechLead`. Deviate only when `docs/DESIGN.md` or the existing component of that flow requires a special layout. Prefer existing TBD — owner: TechLead and existing custom classes over writing new styles.

### Self-sync rule
Whenever this root `AGENTS.md` is updated, update `docs/reference/root-agent-example.md` in the **same change**. After `git pull`, if `docs/reference/root-agent-example.md` changed upstream, compare it with this file and propose merging the relevant rules; ask the user before writing when there is a conflict or a workflow-affecting change.

---

## 12. Code-impact tooling [OPTIONAL]


- If the index is missing, run `docs/rules/06-gitnexus-setup.md` first.
- Standard commands live in `docs/gitnexus.md`: `TBD — owner: TechLead`, `TBD — owner: TechLead`.
- Run `gitnexus_impact()` before proposing changes to any important symbol; run `gitnexus_detect_changes()` before finishing a task.
- The tool assists impact analysis — reading the real code and `git diff` is still mandatory.

---

## 13. Project skills [OPTIONAL]


The project has TBD — owner: TechLead domain skills in `TBD — owner: TechLead`. The agent must **actively invoke the matching skill** instead of improvising.

| Situation | Skill |
|---|---|
| TBD — owner: TechLead | `TBD — owner: TechLead` |
| TBD — owner: TechLead | `TBD — owner: TechLead` |

Mandatory chains:
- TBD — owner: TechLead
- TBD — owner: TechLead

---

## 14. Command shorthand [OPTIONAL]

When the user types `cmd <name> [args]`, read `docs/commands.md` and execute the mapped command.

| Shorthand | Command in `docs/commands.md` |
|---|---|
| `cmd init` | `/init-session` |
| `cmd plan <FEATURE>` | `/create-plan <FEATURE>` |
| `cmd testcase <FEATURE>` | `/create-testcase <FEATURE>` |
| `cmd task <FEATURE>` | `/implement-task <FEATURE>` |
| `cmd docs` | `/update-docs` |
| `cmd unittest <TARGET>` | `/unit-test <TARGET>` |

`<FEATURE>` defaults to `docs/features/<FEATURE>/`. If the shorthand is ambiguous, ask before running.

---

## 15. Git rules [REQUIRED]

### Branch convention
- Branch name: `{{feature/<TICKET-ID>}}` — **the same name in every repo** involved (services + docs). Do not append per-service suffixes.
- Check the current branch before starting a ticket. If it is wrong, **ask before creating or switching**.
- Never create/switch branches while there are uncommitted or unstashed changes.
- Only create branches in repos actually in scope of the approved plan. If another repo turns out to be needed later, check its state and ask first.
- Before creating a plan, moving to implementation, or starting to code: if any related repo has uncommitted / unpushed work, or sits on a different feature branch → **STOP and ask**. Report repo, current branch, changed files, and commit/push state.

### Push
1. `git status` in the affected repo.
2. Review `git diff` and `git diff --staged`.
3. Commit message format: `{{<TICKET-ID>: short description}}`.
4. Commit on the current branch; never switch branches during a push.
5. `git push`, or `git push -u origin <current-branch>` if no upstream exists.

### Merge
1. `git status`; stop and ask if the working tree is dirty.
2. `git fetch origin`.
3. Switch to `fastca-dev` and `git pull --ff-only origin fastca-dev`.
4. Merge the feature branch into `fastca-dev`.
5. On conflict or non-fast-forward against repo policy → stop and ask.
6. Push `fastca-dev`.
7. Do not delete the feature branch unless asked.

### Deploy to UAT
1. `git status`; stop and ask if dirty.
2. `git fetch origin`.
3. Update `fastca-dev` with `--ff-only`.
4. Update `fastca-dev-deploy` with `--ff-only`.
5. Merge `fastca-dev` into `fastca-dev-deploy`.
6. On conflict → stop and ask.
7. Push `fastca-dev-deploy`; CI/CD handles the rest. Do not deploy manually unless explicitly asked.

**Hard stop:** if the diff contains files outside the task scope, or anything that looks like a secret or runtime config, stop and ask before committing, pushing, merging, or deploying.

---

## 16. Do not modify unless explicitly requested [REQUIRED]

- `node_modules/`, `vendor/`, `build/`, `dist/`, `target/`, `.scannerwork/`
- `.env*`, secrets, keys, tokens, certificates, runtime config
- `storage/`, logs, caches
- Generated clients, generated migrations, lock files (unless the task is a dependency change)
- TBD — owner: TechLead
- TBD — owner: TechLead

---

## 17. Quick links [REQUIRED]

- [docs/README.md](docs/README.md) — spec-driven workflow
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture
- [docs/DESIGN.md](docs/DESIGN.md) — UI/UX design system
- [docs/specs/](docs/specs/) — domain specs
- [docs/rules/](docs/rules/) — AI operating rules
- [docs/features/](docs/features/) — ticket folders
- [docs/database/](docs/database/) — schema and migrations
- [docs/commands.md](docs/commands.md) — command catalog
- [docs/reference/root-agent-example.md](docs/reference/root-agent-example.md) — reference copy of this file
- TBD — owner: TechLead

---

## Appendix A — Questions to answer when instantiating this template

Answer these with the team before filling the placeholders:

1. Project name, one-sentence purpose, main capabilities, customer.
2. Full service list: canonical folder name, repo path, git URL, role, runtime, port, datastore.
3. Shared infrastructure: DB host(s), broker, cache, object storage, search.
4. Tech stack and version per service, plus the auth mechanism.
5. Verification command per service (lint / compile / test).
6. Business domains and which service/spec owns each.
7. Ticket prefix and issue tracker.
8. Branch model: feature branch pattern, integration branch, deploy branch, environments.
9. Environments and which integrations cannot be tested locally.
10. Language for AI replies and code comments; i18n requirement yes/no.
11. Paths that must never be touched.
12. Optional tooling: code index/impact tool, project skills, slash commands.

## Appendix B — Instantiation checklist

- [ ] Parent folder created; all service repos cloned side by side.
- [ ] Docs repo cloned as `docs/`.
- [ ] This template copied to `econProject/AGENTS.md`; all `TBD — owner: TechLead` values replaced.
- [ ] All `<!-- HOWTO -->` comments and non-applicable sections removed.
- [ ] Service registry (§4) verified against the actual disk layout — folder names, not repo names.
- [ ] Verification command in §10 actually run once per service and confirmed to work.
- [ ] `docs/rules/00-init-docs.md` executed to generate `ARCHITECTURE.md`, `DESIGN.md`, `specs/` — **output reviewed by TechLead**.
- [ ] `docs/reference/root-agent-example.md` created as a copy of the finished `AGENTS.md`.
- [ ] One pilot ticket run end-to-end through the full lifecycle before rolling out to the team.
- [ ] Docs repo committed and pushed.


## Output style
The reader has ADHD. Shape every response so it can be acted on:
1. Lead with the answer or next action: command, path, or snippet first.
2. Number multi-step work; one bounded action per step.
3. End with one next action doable in under two minutes.
4. Finish the current issue before raising a new one.
5. Restate progress each turn ("step 3 of 5 done").
6. Give time estimates in concrete units, never "a bit".
7. After a change, show what now works.
8. Errors: state location, cause, and fix. No drama.
9. Group long lists logically, ranking highest-priority items first.
10. Keep answers direct and focused without conversational filler.