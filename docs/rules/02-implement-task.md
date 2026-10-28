# Rule 02 — Implement Task

> **Audience:** AI agent. Follow the steps in order. Do not skip a step and do not invent a step.
> **Goal:** implement the tasks the user explicitly authorized, keep the project documentation true, record every change made to an environment, and produce `report.md`, `deploy.md` and `impact.md` as evidence.
> **Scope:** project-agnostic. Everything project-specific is read from the project's own documents — never written into this rule.
> **Gate:** Gate 1 — Plan Approval, submitted by `docs/rules/01-create-plan.md` and **verified here in §5 Step 1** before any code is written. There is no separate implementation gate.

---

## 1. Where project-specific facts come from

This rule holds **no project facts**. If the project names a document differently, resolve the real name through the **source-of-truth map in `CLAUDE.md`**.

| Document | What this rule takes from it | If missing |
|---|---|---|
| `<project-root>/CLAUDE.md` | Service registry (service-key → repo path), per-service read order, **verification commands**, code conventions, i18n requirement, branch/commit/push rules, do-not-touch list, source-of-truth map | **STOP** |
| `docs/features/<TICKET-ID>/plan.md` | Approved design, **baseline SHAs**, documentation impact (§17), deployment consequences (§8–§10), who applies each change | **STOP** |
| `docs/features/<TICKET-ID>/tasks.md` | Authorized scope, DoDs, `(*)` and `[operator]` markers, execution modes, documentation tasks | **STOP** |
| `docs/features/<TICKET-ID>/expect.md` | The requirement of record | **STOP** |
| `docs/features/<TICKET-ID>/testcase.md` | Test scenarios — the reference for `impact.md` retest scope | Optional |
| `docs/ARCHITECTURE.md` | Integration surfaces, environments, blast radii | **STOP** for cross-service work |
| `docs/specs/<domain>.md` | Behavior of record — read before changing it, update after | **STOP** for the domains touched |
| `docs/DESIGN.md` | UI system, layout contract, styling rules | Required for UI tasks |
| `docs/database/` | Current schema state + migration convention | Required for data tasks |
| `docs/conventions/<service>.md` | Per-service conventions | Optional |
| `docs/rules/*.md` | Companion rules: DB migration, impact, docs update, testcase, impact tool | Per trigger |

**Reading rules:** never assume a fact these documents do not state — ask. Never copy a project fact into this rule.

---

## 2. Execution authorization — what "implement" permits

The agent implements **only what the user explicitly authorized in this session**:

1. **one explicitly requested task**, or
2. **a contiguous set of tasks explicitly requested by the user** (for example "T-1 through T-3").

There is no default to "everything". `tasks.md` is a scope declaration, not a standing execution order.

> **"Implement the whole ticket" does NOT imply permission to change shared environments, deploy, commit, push, merge, or execute operator-only tasks.**
> It authorizes the code tasks in the list. Every task marked `[operator]` — applying a migration to a shared environment, changing a config map or secret, deploying, restarting a service — remains with the person named in `plan.md` §8–§10. The agent writes those steps into `deploy.md` and stops there.

When a broad request is received, the agent restates the exact task IDs it will execute and the ones it will not, and proceeds only on the code tasks. Ambiguity about which tasks are authorized → **ask**.

Tasks in the same `execution.parallel_groups` entry may be worked concurrently once their dependencies are done; everything else is sequential in `tasks.md` order.

---

## 3. Stop conditions — before touching any code

STOP and ask if any of these is true:

1. `plan.md` is not approved by the mechanism the project declares. **The agent never sets `approved` itself.**
2. `tasks.md` is missing, or a requested task is not in it, or the authorization in §2 is unclear.
3. The target service cannot be resolved from the plan front matter through the `CLAUDE.md` registry.
4. A repo's working tree is dirty, or sits on a branch other than the one the `CLAUDE.md` branch rule requires.
5. **The repo has moved past the `plan.md` baseline** in files the plan depends on (Step 2).
6. The task requires a contract, schema, permission or dependency change the approved plan does not cover.
7. Impact analysis returns HIGH/CRITICAL risk the plan did not anticipate.
8. Implementation would have to deviate from the approved plan (Step 6).
9. The task is `blocked`, or its dependencies are not done.
10. The work would require changing a **shared** environment, or is marked `[operator]` (Step 5).

---

## 4. Outputs

| Output | Description |
|---|---|
| Code changes | Only inside the locked repo(s), only within authorized scope |
| `tasks.md` | Kept current **task by task**, with dates |
| `report.md` | Execution snapshot, real changed files, real verification output, **every environment change performed**, documentation status, deployment coverage |
| `deploy.md` | **Mandatory whenever any `(*)` task exists** — the operator-executable note |
| `impact.md` | **Mandatory — the QA-facing blast radius**: what changed, what must be retested, what was confirmed unaffected |
| Updated project documents | The `plan.md` §17 documents, updated as their tasks close |
| Docs diff for Gate 2 | Proposed, not merged |

All feature documents live in `docs/features/<TICKET-ID>/`. If write permission is missing there, **ask for it**.

---

## 5. Procedure

### Step 1 — Verify Gate 1 before any code

Gate 1 is approved in Rule 01; this step is its verification side. Before anything else, verify and record:

1. **Approval.** `plan.md` carries `status: approved` plus whatever approval record the project defines (approval block, approver name and date, ticket state). Missing → **STOP**; do not code "while waiting".
2. **Scope.** `tasks.md` matches the plan, and the tasks authorized in this session (§2) are named explicitly.
3. **Obligations.** Read `plan.md` §17 (documentation impact) and §8–§10 (deployment consequences) **now** — they are obligations of this run, not extras.
4. **Snapshot.** Capture the execution snapshot below.

### Step 2 — Pre-implementation snapshot

Use read-only commands. **Do not run `git pull`, `merge` or `checkout` on your own initiative** — they mutate the working tree and the context the plan was validated against. `git fetch` is allowed only to detect staleness; acting on it is the developer's decision.

```bash
git -C <project-root>/docs rev-parse --short HEAD
git -C <project-root>/<service> rev-parse --abbrev-ref HEAD
git -C <project-root>/<service> rev-parse --short HEAD
git -C <project-root>/<service> status --short
```

Record, and write into `report.md` front matter:

```yaml
execution:
  started_at: 2026-08-28T14:30:00+07:00
  branch: feature/ABC-123
  docs_commit: a812fd2
  service_commit: 7bc921a
  plan_status: approved
  plan_updated_at: 2026-08-27
  tasks_updated_at: 2026-08-27
  authorized_tasks: [T-1, T-2]
```

**Baseline comparison.** Compare against `plan.md.baseline`. If the docs or a service repo has moved past it:

- List the changed files and check whether any is named in the plan.
- **No plan file affected** → note the drift in `report.md` and continue.
- **A plan file affected** → **STOP**. The plan was designed against a different snapshot; report the drift and ask whether to re-validate the affected plan sections before coding.

Dirty tree, or a branch other than the one the `CLAUDE.md` branch rule requires → **stop and ask**. Never create, switch, merge or push a branch unless explicitly asked.

### Step 3 — Lock the target service

1. Read `service:` and `service-repo:` from `plan.md`, plus the `Service` column of the task.
2. Map the canonical `service-key` to its repo path through the **registry in `CLAUDE.md`**.
3. **Never** locate the service by grep, glob or folder-name similarity — service and folder names collide across repos and a search will match the wrong one.
4. Edit files **only** inside the locked repo path. A multi-service task is executed **one repo at a time**.
5. Missing `service:`, key not in the registry, or a task spanning repos without saying so → **STOP and ask.**

### Step 4 — Read context, then analyse impact

1. `expect.md`, `plan.md`, the authorized task rows in `tasks.md`, `testcase.md` if present.
2. `CLAUDE.md`: the locked service's read order, verification command and constraints; code conventions; do-not-touch list.
3. `ARCHITECTURE.md`, and the `specs/<domain>.md` named by the plan — **read the spec before changing the behavior it describes**, so Step 7 is a diff and not a rewrite.
4. `DESIGN.md` for UI tasks · `docs/database/` plus the DB migration rule for data tasks · the plan's i18n notes and existing locale files when the project is multi-language · `conventions/<service>.md` if present.
5. The real source files named in the plan, following the service read order.

If the project has a code-index/impact tool covering the locked service: run its impact command **before changing any symbol used outside its own file**; record the affected modules, APIs, models and components — this feeds `impact.md`. **HIGH/CRITICAL risk → stop, report, wait for confirmation.** Regardless of tooling: read the real code, check `git diff`, and apply the blast-radius severities in `ARCHITECTURE.md`.

### Step 5 — Implement, one task at a time

For each authorized task:

1. Set it to in-progress in `tasks.md` **before** editing code.
2. Change files in the order the plan and the service read order prescribe.
3. Follow the code conventions in `CLAUDE.md` / `conventions/<service>.md` — match the surrounding code, do not introduce a new pattern.
4. Keep to the scope discipline in §6. Anything the approved plan does not cover — a contract change, schema change, permission change, new dependency — is a **stop**, not a judgement call (Step 6).
5. Run the task's verification command from `CLAUDE.md` (Step 8).
6. Close the task only through Step 10.

Special handling:

- **Data changes:** follow the project's DB migration rule. Write a migration; never change a schema by hand where the project requires one. Update `docs/database/` as part of the same task.
- **User-visible text:** when the project is multi-language, add the translation keys per the plan. Never hardcode UI text, validation and error messages, empty states, buttons, tooltips, emails, notifications or exported documents. Unclear namespace or key → ask.
- **Integrations that cannot run locally** (per `ARCHITECTURE.md`): mock or skip, record it in `report.md`, and never point a development environment at a production integration.
- **New dependencies:** only if the approved plan lists them.

#### Environment changes — what the agent may and may not do

Writing code is not the same as changing a running system. This governs every command that mutates state outside the repository: migrations, seeders, config files, config maps, secrets, environment variables, queues, caches, storage, container manifests.

| Environment (resolve real names from `ARCHITECTURE.md`) | May the agent change it? |
|---|---|
| The agent's own local workspace (local DB, local `.env`, local container) | **Yes** — every change must be recorded |
| Shared development / integration environment | **Only when the user explicitly asks in this session**, naming the exact command and its effect |
| Staging / UAT / production | **Never** — applied by whoever `plan.md` §8–§10 names, through the deployment pipeline |

**Recording rule — mandatory.** Every command that changed state outside the repository is captured verbatim: the exact command, the environment, the timestamp, whether it succeeded, its effect, and how to undo it. It goes into **`report.md` §5** and, when the change must also happen elsewhere, into **`deploy.md` §2** as a step for the operator.

**Hard rules:** a local migration run **does not replace `deploy.md`** — it is evidence the migration works, the deploy note carries it to every other environment · never run a destructive command (drop, truncate, unfiltered delete, force reset) on any environment, local included, without explicit approval in this session · never edit a shared config map, secret store or deployment manifest directly · never copy real credentials, tokens or connection strings into any document, migration or commit · an unforeseen environment change is a deviation (Step 6), and `plan.md` §8–§10 must be updated so the deploy note stays complete.

### Step 6 — Deviation protocol

If reality does not match the approved plan — a missing file, a different contract, a hidden dependency, an unworkable approach, an unforeseen environment change:

1. **Stop implementing that task.**
2. Record it in `plan.md` §18 "Deviations found during implementation".
3. If it changes design, scope, a contract, the schema, permissions, dependencies or the deployment steps → **re-approval is required before coding continues.** Update §8–§10 and §17 so the deployment and documentation obligations stay accurate.
4. If it is a minor, scope-preserving detail, record it in `plan.md` and `report.md`, then continue.
5. Update `impact.md` whenever a newly affected file or service is discovered.

Never silently "fix" the plan by writing different code from what was approved.

### Step 7 — Documentation updates, per task

`plan.md` §17 lists the documents that stop being true when this feature ships; `tasks.md` carries one task per document. Those tasks are part of the work.

**Gate:** a code task **cannot be closed** until the documents it invalidates are updated, or their update task is explicitly open with a stated dependency on it. A feature cannot be closed with any documentation task open.

The change → document mapping is defined in Rule 01 §4.2; resolve real filenames through the `CLAUDE.md` source-of-truth map.

Rules: update by **diff, not rewrite** — change the sections the feature invalidated and leave the rest alone · the agent **proposes**, the TechLead approves at **Gate 2 — Documentation Approval** · a §17 document that turns out not to need changing is recorded `N/A` **with a verifiable reason** in `report.md` §7, never deleted · a document needing change that §17 did not list is added to §17 with a task.

### Step 8 — Verify with real output

1. Run the exact verification commands from `CLAUDE.md` for every service touched.
2. Run the wider checks `plan.md` §12 requires (build, test suite, lint, regression flows).
3. If the project's impact tool supports change detection, run it to confirm nothing outside scope moved.
4. Review `git diff` file by file. Anything outside the authorized scope is reverted or explained.

> **Everything pasted into `report.md` must be the real output of a command that actually ran.** Narrating "tests pass" is a rejected output. A check that could not be run is `N/A` with a verifiable reason.

### Step 9 — Write the evidence documents

#### 9.1 `report.md`

````markdown
---
feature: <TICKET-ID>
status: <in_progress | testing | done>
services: [<service-key>, ...]
updated_at: <YYYY-MM-DD>
execution:
  started_at: <YYYY-MM-DDTHH:MM:SS+TZ>
  branch: <branch name>
  docs_commit: <short SHA>
  service_commit: <short SHA>
  plan_status: approved
  plan_updated_at: <YYYY-MM-DD>
  tasks_updated_at: <YYYY-MM-DD>
  authorized_tasks: [T-1, T-2]
  baseline_drift: none | <what moved since plan.md.baseline and whether a plan file was affected>
---

# Report — <TICKET-ID>: <feature name>

## 1. Tasks completed
- [x] T-1 — <what was actually done>
- [ ] T-3 — <not executed: not authorized / blocked / operator-only>

## 2. Files changed
| Service | File | Change |
|---|---|---|

## 3. Verification results
<!-- Paste the REAL output of each command. No narration. -->
```
$ <verification command from CLAUDE.md>
<real output>
```
| Check | Result | Note |
|---|---|---|
| `<lint command>` | ✅ / ❌ / N/A | |
| `<test command>` | ✅ / ❌ / N/A | <real summary line> |
| `<build command>` | ✅ / ❌ / N/A | |
| i18n — no hardcoded text, locales complete | ✅ / ❌ / N/A | |
| Impact / change detection | ✅ / ❌ / N/A | |
| Regression flows re-run | ✅ / ❌ / N/A | |

## 4. Deviations from the plan
<What differed and how it was resolved. "None" if none.>

## 5. Environment changes performed
| Change | Environment | Command run | Timestamp | Result | Undo | In `deploy.md` |
|---|---|---|---|---|---|---|
<"None — no environment state was changed" is a valid entry and must be stated explicitly.>

## 6. Deployment artifacts
| `(*)` task | Deployment consequence | Covered in `deploy.md` |
|---|---|---|
<"No (*) tasks — deploy.md not required" is a valid entry and must be stated explicitly.>

## 7. Documentation updated
| Document | Status | What changed / why N/A |
|---|---|---|
<Every row of plan.md §17 appears. Missing rows block `done`.>

## 8. Problems and limitations
<Errors hit, workarounds, anything mocked or skipped, known limitations. "None" if none.>

## 9. Found outside scope — not fixed
<Problems noticed but deliberately not touched, with enough detail to file a ticket. "None" if none.>

## 10. Commits / PRs
| Service | Branch | Commit / PR | Note |
|---|---|---|---|
````

#### 9.2 `impact.md` — the QA-facing blast radius

`impact.md` is drafted by Rule 01 and **finalized here**. Its audience is the tester: it must be readable without opening the code, and it must answer *what do I retest?*

````markdown
---
feature: <TICKET-ID>
status: final
updated_at: <YYYY-MM-DD>
service_commit: <short SHA>
---

# Impact — <TICKET-ID>: <feature name>

## 1. What changed, in business terms
<2–5 lines a tester can act on, without reading code.>

## 2. Directly changed areas — must be retested
| Area / screen / endpoint | Service | What changed | Test reference |
|---|---|---|---|
| <area> | <service-key> | <behavior change> | `testcase.md` TC-x |

## 3. Indirectly affected — regression scope
| Area | Why it is affected | Severity | Test reference |
|---|---|---|---|
| <shared component / consumer of the changed contract> | <shared code, schema, topic, permission> | 🔴 / 🟡 / 🟢 | |

## 4. Confirmed unaffected
| Area | Why it is safe |
|---|---|
<Areas a reader might reasonably suspect, with the reason they were ruled out. This is what keeps the regression scope finite.>

## 5. Data and environment effects
<Schema/data changes visible to testing, config or feature flags that alter behavior, and which environment already has them applied.>

## 6. Preconditions for testing
<Accounts, roles, permissions, seed data, feature flag states, external systems that must be reachable — and anything that cannot be tested in the test environment, with the reason.>

## 7. Known limitations and unverified items
<What was not verified and why: mocked integrations, cases needing production-like data, deferred scenarios.>
````

#### 9.3 `deploy.md` — mandatory whenever a `(*)` task exists

**Gate:** a `(*)` task **cannot be closed** until `deploy.md` contains its steps. A deployment consequence found without a `(*)` marker gets the marker, a plan update, and a deploy step — it is never treated as if it did not exist. The trigger list is defined in Rule 01 §4.1.

````markdown
# Deploy — <TICKET-ID>

## 1. Summary
<What operations must do, and in which environments.>

## 2. Already applied by the implementer
| Change | Environment | Command run | Result | Reversible by |
|---|---|---|---|---|
<From report.md §5 — what other environments still need. "None" if nothing was applied.>

## 3. Database
- Migration file: `<name per the convention in docs/database/>`
- Command: `<exact command>`
- Manual SQL (if any):
```sql
-- what it changes and why
```
- Effect on existing data:
- Who runs it, per environment: <dev / uat / prod → DBA / DEV / CI>

## 4. Configuration
| Key | Old | New | Service | Environment | Applied by |
|---|---|---|---|---|---|
<Config maps, secrets and manifests listed by name and key. Never paste secret values.>

## 5. Dependencies
- `<install command>` — <why it is needed>

## 6. Jobs, queues and scheduled work
<New or changed workers, what must be restarted, in what order.>

## 7. Integrations
<Message topics, RPC contracts, auth config, storage — per ARCHITECTURE.md.>

## 8. Deployment order
1. <step> — <who>

## 9. Verification after deploy
- <check> → <expected result>

## 10. Rollback
- <exact steps to undo, per change, in reverse order>
````

> `deploy.md` describes **this feature's** rollout. Environment-level operating detail belongs in the service-local deployment document named in `CLAUDE.md`.

### Step 10 — Close out

**Per-task close-out** — every box true before the task is marked done:

- [ ] The task was authorized in this session (§2).
- [ ] Its DoD in `tasks.md` is objectively met.
- [ ] Its verification command ran; the real output is in `report.md` §3.
- [ ] If `(*)`: its steps are in `deploy.md`, and `report.md` §6 records the coverage.
- [ ] If it changed anything outside the repository: `report.md` §5 records command, environment, result and undo.
- [ ] The documents it invalidated are updated, or their documentation task is open with a dependency on it.
- [ ] `impact.md` extended with the areas this task affects and what must be retested.
- [ ] `tasks.md` status updated with the date; commit/PR reference recorded if the git rules require it.

**Feature close-out (Definition of Done):**

- [ ] Every task in `tasks.md` is done, or explicitly listed as `[operator]` / not authorized in `report.md` §1.
- [ ] `report.md` carries the execution snapshot and real verification output for every affected service.
- [ ] `report.md` §5 accounts for every environment change, or states there were none.
- [ ] `deploy.md` exists and covers every `(*)` task — or `report.md` §6 states there are none.
- [ ] **`impact.md` is finalized: changed areas, regression scope, confirmed-unaffected list, test preconditions.**
- [ ] Every row of `plan.md` §17 has a status in `report.md` §7.
- [ ] `docs/database/` updated, or the reason for waiting on the DBA recorded.
- [ ] i18n complete with no hardcoded text, if the project is multi-language.
- [ ] `plan.md` marked complete, or the remaining scope stated explicitly.
- [ ] `git diff` contains nothing outside the authorized scope.

Commit, push, merge and deploy follow the git rules in `CLAUDE.md`. **The agent never commits, pushes, merges or deploys unless explicitly asked**, and stops to ask if the diff contains files outside scope or anything resembling a secret or runtime config.

If work stops unfinished, the agent reports: current status, remaining tasks, blockers, every repo/branch/file left dirty, **and every environment change already applied**, so nothing is left in an unknown state.

---

## 6. Scope discipline

1. **Implement only what the user authorized** (§2) — never the whole list by default.
2. **Never execute an `[operator]` task**, and never mutate a shared environment on your own initiative.
3. **No opportunistic refactoring.** Improvements outside the task go to `report.md` §9.
4. **No unapproved contract changes** — API shape, message payload, RPC contract, schema, permissions, config.
5. **No new dependencies** the approved plan does not list.
6. **No repo mutation on your own initiative** — no pull, checkout, branch, merge, push.
7. **Match the existing code style** per `CLAUDE.md` / `conventions/<service>.md`.
8. **Never touch** the do-not-touch paths in `CLAUDE.md`.
9. **Problems found outside the task are reported, not fixed.**
10. **Ask when blocked.** Never guess business rules, data shapes or permissions mid-implementation.

---

## 7. Rejected outputs

| Anti-pattern | Why it fails |
|---|---|
| The whole task list executed from a broad request | Authorization was never given per task |
| An `[operator]` task executed by the agent | Removes the human decision point on a running system |
| A shared environment changed without being asked | Breaks other people's work |
| No execution snapshot in `report.md` | Nobody can tell which code state was implemented against |
| Coding on top of baseline drift that touched a plan file | The approved design describes a different snapshot |
| `git pull` / `checkout` / `merge` run on the agent's own initiative | Mutates the context the plan was validated against |
| `report.md` claims "tests pass" with no pasted output | Unverifiable; the report is the evidence |
| A migration or config change run locally but absent from `report.md` §5 | Nobody knows the environment state |
| A `(*)` task closed with no matching steps in `deploy.md` | The change reaches production unannounced |
| A task closed while the document it invalidated stays stale | The docs rot and every later plan inherits the error |
| `impact.md` missing, or listing changes without a retest scope | QA cannot size the regression |
| Code written before Gate 1 was verified | The gate exists to prevent exactly this |
| The service found by grep instead of the registry | Wrong repo edited |
| Plan deviated from without updating `plan.md` | The approved design and the code no longer match |
| A secret or credential written into a document, migration or commit | Security incident |

---

## 8. Related rules and gates

The workflow has **two gates**, both approved by the TechLead:

| Gate | Approves | Submitted by | Verified by |
|---|---|---|---|
| **Gate 1 — Plan Approval** | `plan.md` + `tasks.md`: the design, the baseline, the documentation impact, the deployment consequences | Rule 01 Step 7 | **§5 Step 1 of this rule**, before any code |
| **Gate 2 — Documentation Approval** | The docs diff proposed against `specs/`, `ARCHITECTURE.md`, `DESIGN.md`, `docs/database/` | §5 Step 7 of this rule | TechLead, before merge |

Gate 1 is a single checkpoint with two sides: Rule 01 submits it, this rule re-verifies it (approval record, baseline drift, authorized scope). There is no separate implementation gate.

| Rule | Relationship |
|---|---|
| `docs/rules/01-create-plan.md` | Produces the plan, the baseline, §17 documentation impact, and the `(*)` / `[operator]` markers |
| The project's DB migration rule | Governs how migrations are written, applied and recorded |
| The project's docs-update rule | Governs how the Gate 2 diff is proposed and approved |
| The project's impact rule | Governs `impact.md`, finalized here |
| The project's testcase rule | Provides `testcase.md`, referenced by `impact.md` retest scope |
