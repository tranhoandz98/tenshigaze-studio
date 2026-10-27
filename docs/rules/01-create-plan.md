# Rule 01 — Create Plan

> **Audience:** AI agent. Follow the steps in order. Do not skip a step and do not invent a step.
> **Goal:** turn `expect.md` (written by BA) plus the project's own documentation into a `plan.md` and `tasks.md` that another developer could implement without asking further questions.
> **Scope:** project-agnostic. Everything project-specific is read from the project's own documents — never written into this rule.
> **Gate:** Gate 1 — Plan Approval. This rule prepares and submits it; Rule 02 verifies it before writing any code.

---

## 1. Where project-specific facts come from

This rule holds **no project facts**. If the project names a document differently, resolve the real name through the **source-of-truth map in `AGENTS.md`**.

| Document | What this rule takes from it | If missing |
|---|---|---|
| `<project-root>/AGENTS.md` | Service registry (service-key → repo path), tech stack, per-service read order and verification commands, code conventions, i18n requirement, branch rules, do-not-touch list, source-of-truth map | **STOP** — no service names, no commands |
| `docs/README.md` | Workflow, roles, gates, feature folder model | Fall back to this rule's defaults |
| `docs/ARCHITECTURE.md` | Services, integration surfaces (REST/RPC/messaging/auth/storage), environments, known blast radii | **STOP** — impact analysis impossible |
| `docs/specs/<domain>.md` | Business logic of record: entities, endpoints, contracts, states, permissions | **STOP** for the domains touched |
| `docs/DESIGN.md` | UI system, layout contract, component library, styling rules | Required for UI features |
| `docs/database/` | Current schema state of truth + migration file convention | Required for data features |
| `docs/conventions/<service>.md` | Per-service conventions beyond `AGENTS.md` | Optional |
| `docs/rules/*.md` | Companion rules: testcase, DB migration, impact, docs update, impact tool | Per trigger |

**Reading rules:** never assume a fact these documents do not state — ask, and record the answer as an open question. Never copy a project fact into this rule; porting to a new project means writing that project's documents.

---

## 2. When to run · stop conditions

Run when BA has finished `docs/features/<TICKET-ID>/expect.md` and a developer asks for a plan.

STOP and ask the user if any of these is true:

1. `expect.md` does not exist, or fails the Definition of Ready check (Step 2).
2. `docs/` is not beside the service repos, or a required document from §1 is missing.
3. The feature already has a `plan.md` with `status: approved` or later and the user did not explicitly ask to redo it. **Never overwrite an approved plan.**
4. The docs repo or a service repo is behind its remote (Step 1) — report it; **do not pull.**
5. The base docs contradict the real source code and there is no basis to decide which is right.
6. The target service cannot be resolved unambiguously from the `AGENTS.md` registry (Step 3).

---

## 3. Inputs and outputs

**Inputs:** `expect.md` (source of truth for requirements) · `extract/` if present · the documents in §1 · the source code of the affected services, read only enough to establish scope, files and risk.

**Outputs**, all inside `docs/features/<TICKET-ID>/`:

| Output | Description |
|---|---|
| `plan.md` | Implementation design + baseline + documentation impact + deployment consequences (Step 5) |
| `tasks.md` | Tasks by service, with execution mode, `(*)` markers and documentation tasks (Step 6) |
| `impact.md` | First draft of the impact assessment, if the project uses it — finalized by Rule 02 |
| Feature status | `plan-review`, with the affected services recorded |

> Scratch plans the tooling generates elsewhere are drafts only. If write permission for `docs/features/<TICKET-ID>/` is missing, **ask for it** — do not silently write somewhere else.

---

## 4. Definitions used throughout this rule

These are defined **once here** and referenced by the steps below.

### 4.1 Deployment consequence

A change has a deployment consequence if it involves any of:

database schema or data migration · configuration or environment variable · **config map, secret or deployment manifest** · new or upgraded dependency · new or changed scheduled job, cron or queue worker · message topic or contract change · RPC/proto contract change · auth realm, client, role or permission change · storage bucket, path or policy change · infrastructure, container or orchestration change · feature flag or staged rollout.

Every task carrying one is marked **`(*)`** in `tasks.md`, is described in `plan.md` §8–§10 including **who applies it in which environment**, and is covered by the `deploy.md` task.

### 4.2 Documentation impact

Walk the `AGENTS.md` source-of-truth map in reverse: for each change the feature makes, name the document that stops being true.

| Change | Document |
|---|---|
| Business logic, input/output, state, permissions | `docs/specs/<domain>.md` |
| New or changed endpoint / contract | `docs/specs/<domain>.md` (+ `ARCHITECTURE.md` for a new surface) |
| Architecture, integration, queue, storage, auth | `docs/ARCHITECTURE.md` |
| UI pattern, layout, component, theme | `docs/DESIGN.md` |
| Schema, entity, data | `docs/database/` |
| Service-specific coding convention | `docs/conventions/<service>.md` |
| Environment deployment steps | Service-local deployment doc named in `AGENTS.md` |
| A new error and its resolution | Service-local troubleshooting doc named in `AGENTS.md` |
| Project rule or workflow | `AGENTS.md` / `docs/rules/` |

Each document identified becomes a **row in `plan.md` §17 and a task in `tasks.md`**. A documentation update that exists only as a sentence in the plan does not get done.

### 4.3 Task sizing and execution

- Size: `XS` ≈ 1 file · `S` ≈ 1–2 · `M` ≈ 3–5 · `L` ≈ 6–8. A task should fit one working day.
- **Split** any task touching more than 8 files, spanning independent subsystems, with vague acceptance criteria, or joining unrelated work with "and" in its title. Avoid `L`.
- `Depends on:` states correctness ordering. `execution.parallel_groups` states what *may* run concurrently. A task may run in parallel only if it appears in a parallel group **and** all its dependencies are done.
- Tasks that only an operator may execute (applying a migration to a shared environment, deploying, changing a config map) are marked **`[operator]`** — the agent writes them but never executes them.

---

## 5. Procedure

### Step 1 — Capture the baseline, then read

**Do not run `git pull`, `checkout`, `merge` or any command that mutates a working tree.** Planning is read-only. Use read-only commands to capture the baseline the plan is built on:

```bash
git -C <project-root>/docs rev-parse --short HEAD
git -C <project-root>/docs status --short --branch
git -C <project-root>/<service> rev-parse --short HEAD
```

Record for `plan.md`: the docs commit, each affected service's commit and branch, and the capture timestamp. If a repo is behind its remote or has uncommitted changes, **report it and ask** — a stale or dirty baseline invalidates the plan, and pulling is the developer's decision, not the agent's.

Then read, extracting what §1 says each document provides:

1. `expect.md` in full — what to build, what is explicitly **out of scope**, the acceptance criteria.
2. Anything in `extract/`.
3. `AGENTS.md` — noting concretely: the registry row of each candidate service, its read order, its verification command, its constraints, the branch rule, the do-not-touch list, whether the project is multi-language.
4. `docs/README.md` — the gates and feature folder model in force.
5. `ARCHITECTURE.md` — integration surfaces, environments, blast radii.
6. `specs/<domain>.md` for every domain touched.
7. `docs/database/` if data is involved · `DESIGN.md` if UI is involved · `conventions/<service>.md` if present.
8. The companion rules in `docs/rules/` whose trigger applies.
9. The real source files — **only enough** to determine scope, files and risk. Do not browse the repository at large.

Note which documents were read and which were deliberately skipped; this becomes `plan.md` §2.

### Step 2 — Definition of Ready check

Check `expect.md`:

- [ ] Acceptance criteria are measurable and unambiguous.
- [ ] Out-of-scope is stated explicitly.
- [ ] Actors, roles and permissions are clear.
- [ ] Main inputs, outputs and state transitions are clear.
- [ ] Edge cases, error states and legacy data are addressed where relevant.
- [ ] The BA's open questions are answered, or carried into blocking questions.

**Any ambiguity about business rules, architecture, data or permissions → STOP**, list the questions, ask. Write only a blocking draft: `status: draft`, §1 filled in, and a note that planning cannot proceed. No detailed design, no implementation tasks.

Unavoidable small assumptions go into §15, one line each, for the reviewer to confirm individually.

### Step 3 — Resolve the target service

1. The target service comes from: the user's explicit statement → `plan.md` front matter (when revising) → the `Service` column in `tasks.md`.
2. Map it to a repo path through the **service registry in `AGENTS.md`**, using the canonical `service-key` — never the git repo name, never a folder name guessed by similarity.
3. **Never discover the target service by grep, glob or name similarity.**
4. Undeclared service, key not in the registry, or one task spanning repos without saying so → **STOP and ask.**

### Step 4 — Impact analysis, per acceptance criterion

For each AC:

1. Identify the affected services from the `AGENTS.md` registry.
2. Trace the file chain in each service following its read order in `AGENTS.md` (and `conventions/<service>.md`). Name concrete files, classes and methods — not layers in the abstract.
3. **Data:** compare against the current state in `docs/database/` **before** proposing any change. Never propose a migration that contradicts the documented state. A disagreement between the document and the real schema goes to §16.
4. **UI:** page/component, API module, state/query layer, routing, styles, per `DESIGN.md`.
5. **Contracts:** for every integration surface in `ARCHITECTURE.md` the feature touches, state whether the change is backward compatible and name the clients at risk if not.
6. **Cross-service:** anything sharing a schema, domain or contract with another service is listed and split into per-service tasks.
7. Apply the blast-radius severities recorded in `ARCHITECTURE.md`.
8. If the project has a code-index/impact tool covering an affected service, run it **before proposing any change to a symbol**. It assists; reading the real code is still mandatory.
9. Classify each change against §4.1 (deployment consequence) and §4.2 (documentation impact). These classifications drive §8–§10, §17 and the task list — decided **now**, not during implementation.

### Step 5 — Write `plan.md`

````markdown
---
feature: <TICKET-ID>
title: <feature name>
status: draft            # draft → plan-review → approved
service: <canonical service-key from the AGENTS.md registry>
service-repo: <repo path matching the registry>
services-affected: [<key>, <key>]
owner: <DEV name / AI>
created_at: <YYYY-MM-DD>
updated_at: <YYYY-MM-DD>
baseline:                # the snapshot this plan was written against
  captured_at: <YYYY-MM-DDTHH:MM:SS+TZ>
  docs_commit: <short SHA>
  services:
    - key: <service-key>
      repo: <repo path>
      branch: <branch name>
      commit: <short SHA>
---

# Plan — <TICKET-ID>: <feature name>

## 1. Blocking questions
<Must be resolved before approval. "None" if there are none.>

## 2. Documents read
| Document | Read | Taken from it / why skipped |
|---|---|---|
| `AGENTS.md` | ✅ | registry, read order, verify command, branch rule |
| `docs/ARCHITECTURE.md` | ✅ | integration surfaces, blast radius |
| `docs/specs/<domain>.md` | ✅ | current behavior of the domain |
| `docs/DESIGN.md` | ✅ / N/A | <reason if N/A> |
| `docs/database/` | ✅ / N/A | <reason if N/A> |
| `docs/conventions/<service>.md` | ✅ / N/A | <reason if N/A> |
| `docs/rules/<companion rule>` | ✅ / N/A | <reason if N/A> |

## 3. Approach summary
<3–5 lines: how this satisfies expect.md, and which services it touches.>

## 4. Requirement trace
| AC in `expect.md` | Covered by |
|---|---|
| AC-1 | §6.1 |
<Every AC appears. Any AC not covered is explained here.>

## 5. Affected services
| Service | Severity | Main change |
|---|---|---|

## 6. Detailed design, per acceptance criterion
### 6.1 AC-1 — <name>
- **Approach:** <logic, algorithm, state transitions>
- **API:** <method + path + request + response + error cases>, or "None"
- **Backend:** <files / classes / methods, following the service read order>
- **Frontend:** <page / component / API module / state / route / style>, or "None"
- **Data:** <tables, columns, queries>, or "None"
- **i18n:** <keys, locale namespace/file, fallback>, or "N/A" — required when the project is multi-language
- **Docs to update:** <the §17 rows this AC affects>

### 6.2 AC-2 — <name>
...

## 7. Implementation order
<Dependencies between parts: what goes first and why. Name what may run in parallel — it becomes `execution.parallel_groups` in tasks.md.>

## 8. Database changes
<"None", or: table/column, type, nullable, default, index, migration file name per the convention in docs/database/, effect on existing data, rollback, and WHO applies it in WHICH environment.>

## 9. Configuration and infrastructure changes
<"None", or: env vars, config keys, config maps, secrets, deployment manifests, resource limits — and WHO applies each in WHICH environment.>

## 10. Integrations, jobs and dependencies
<"None", or: message topics, RPC contracts, auth config, storage, third-party APIs, new/changed cron or queue workers, new libraries.>

## 11. Backward compatibility
<Which existing clients could break, and the mitigation: versioning, dual-write, feature flag, staged rollout. "None" if not applicable.>

## 12. Verification plan
<Per affected service: the exact verification command from AGENTS.md and what result proves the AC. "Run tests" is not acceptable. Include the regression flows to re-run, and how anything untestable locally will be verified instead.>

## 13. Risks and rollback
| Risk | Severity | Mitigation / rollback |
|---|---|---|

## 14. Alternatives considered
<Significant options and why they were rejected. "None" if there was no real choice.>

## 15. Assumptions
<One line per assumption the reviewer must confirm.>

## 16. Open questions
- [ ] <question> → Answer:

## 17. Documentation impact (Gate 2)
| Document | What changes | Task |
|---|---|---|
| `docs/specs/<domain>.md` | <what> | T-6 |
<Per §4.2. "Docs impact: none" plus a verifiable reason is allowed; the section is never deleted.>

## 18. Deviations found during implementation
<Leave empty. Filled in by Rule 02.>
````

Sections evaluating to "None" keep the word `None` — never deleted, so the reviewer sees they were considered. §6 must be detailed enough for a different developer to implement without asking; "adjust service X accordingly" is rejected.

### Step 6 — Write `tasks.md`

Use the layout `AGENTS.md` declares; the default is below. Apply §4.1 for `(*)`, §4.2 for the documentation group, §4.3 for sizing and execution.

````markdown
---
feature: <TICKET-ID>
status: plan-review
owner: <AI / DEV>
updated_at: <YYYY-MM-DD>
execution:
  default_mode: sequential
  parallel_groups:
    - [T-1, T-2]        # may run concurrently once their dependencies are done
---

# Tasks — <TICKET-ID>

## <service-tag-1>
- [ ] T-1 [<service-key>] <specific task> (M) — DoD: <objectively checkable result> — Verify: `<command from AGENTS.md>` — Depends on: —
- [ ] T-2 [<service-key>] <specific task> (S) — DoD: ... — Verify: ... — Depends on: —

## database / configuration            <!-- only if plan §8–§10 is not "None" -->
- [ ] T-3 (*) [<service-key>] Write migration <name> (S) — DoD: migration written per the convention in `docs/database/`, verified on a local database, `docs/database/` updated — Verify: `<command>` — Depends on: —
- [ ] T-4 (*) [operator] Apply migration to <shared env> — DoD: applied by <who> per `deploy.md` §3 — Depends on: T-3

## i18n                                 <!-- when the project is multi-language -->
- [ ] T-5 [<service-key>] Translation keys for <UI / messages / email / exports> (S) — DoD: no hardcoded strings; all locales present

## documentation                        <!-- one task per row of plan §17; never omit -->
- [ ] T-6 [docs] Update `docs/specs/<domain>.md` — DoD: <the sections that must reflect the new behavior> — Depends on: T-1
- [ ] T-7 [docs] Update `docs/database/` current-state document — DoD: <what> — Depends on: T-3

## Feature close-out                    <!-- always present -->
- [ ] T-8 Run the verification command of every affected service; write `report.md` from the **real** output
- [ ] T-9 Write `deploy.md` covering every `(*)` task — DoD: steps, execution order, who runs each, post-deploy check, rollback   <!-- only if any (*) task exists -->
- [ ] T-10 Finalize `impact.md` for QA — DoD: changed areas, retest scope, regression list
- [ ] T-11 Submit the documentation diff for Gate 2 approval
````

**Task rules:** every task has an ID, a service tag from the registry (or `[docs]` / `[operator]`), a size, a DoD, dependencies, and — for code tasks — a concrete verification command. Status markers `[ ]` · `[/]` · `[x]` (with date) · `[blocked]` (with reason), unless `AGENTS.md` declares another vocabulary. Every task traces back to an AC in `expect.md`, to §17, or to §8–§10; a task tracing to nothing is out of scope and goes to §16 instead.

### Step 7 — Gate 1: Plan Approval

Self-review before submitting — each line is a checkpoint, the rules behind them are in §4 and Step 5:

- [ ] Baseline captured in the front matter; no repo was mutated while planning.
- [ ] §2 lists every document read and justifies every one skipped.
- [ ] `service:` + `service-repo:` match the registry; `tasks.md` uses the same keys.
- [ ] Every blocking question answered, or the plan is explicitly a blocking draft.
- [ ] Every AC appears in §4; the design contradicts none of `specs/`, `ARCHITECTURE.md`, `DESIGN.md`, `docs/database/`.
- [ ] Backward compatibility assessed for every integration surface touched.
- [ ] §12 gives a real command per service.
- [ ] §17 filled in, every row matched by a documentation task.
- [ ] Every deployment consequence (§4.1) marked `(*)`, with §8–§10 naming who applies it where, and a `deploy.md` task exists.
- [ ] Every task has ID, tag, size, DoD, dependencies, verification; execution modes declared; no oversized task.
- [ ] Files written inside `docs/features/<TICKET-ID>/`. **No code written.**

Then: write `plan.md` and `tasks.md`, draft `impact.md`, set the feature to `plan-review`, and summarize for the user — main design decisions, assumptions awaiting confirmation, open questions, the documents that will need updating, and whether a `deploy.md` will be required.

> **Gate 1 is hard.** `plan.md` must be reviewed by DEV and approved by the TechLead (`status: approved`) before Rule 02 may run. Not approved → revise from Step 4.

> **Baseline validity.** If the code moves past the recorded baseline before implementation starts, Rule 02 must re-validate the plan sections whose files changed, and the plan is updated before coding.

---

## 6. Principles

1. **Ask when context is missing.** Never invent business rules, logic, data shapes or permissions.
2. **`expect.md` is the source of truth for requirements;** the project's documents are the source of truth for the system.
3. **Planning is read-only.** No pull, no checkout, no branch creation, no code.
4. **Plan the documentation and the deployment, not just the code.**
5. **Respect out-of-scope.** Good ideas outside `expect.md` go to §16 for the BA.
6. **Never overwrite an approved plan.**
7. **Name things concretely** — real files, endpoints, columns, commands.
8. **This rule stays generic;** project facts live in the project's documents.

---

## 7. Rejected outputs

| Anti-pattern | Why it fails |
|---|---|
| "Modify service X accordingly" | Not implementable without asking |
| "Run tests" as the verification plan | No command, no expected result |
| A task with no DoD | Cannot be objectively closed |
| No baseline, or a baseline captured after mutating a repo | Nobody can tell what snapshot the plan describes |
| A migration written without reading the documented schema | Risks conflicting with the real database |
| A target service inferred from a folder name | The registry exists to prevent this |
| Sections deleted instead of marked "None" | The reviewer cannot tell whether it was considered |
| §17 empty, or rows without matching tasks | The docs rot and every later plan inherits the error |
| A deployment consequence with no `(*)` task and no `deploy.md` task | The change reaches production unannounced |
| §8–§10 that do not say who applies the change where | Implementation improvises it |
| Features in the plan that are absent from `expect.md` | Scope creep past the BA's decision |
| A plan written while blocking questions are open | Guesswork dressed as design |

---

## 8. Related rules and gates

The workflow has **two gates**, both approved by the TechLead:

| Gate | Approves | Submitted by | Verified by |
|---|---|---|---|
| **Gate 1 — Plan Approval** | `plan.md` + `tasks.md`: the design, the baseline, the documentation impact, the deployment consequences | Rule 01 Step 7 | Rule 02 Step 1, before any code |
| **Gate 2 — Documentation Approval** | The docs diff proposed against `specs/`, `ARCHITECTURE.md`, `DESIGN.md`, `docs/database/` | Rule 02 Step 7 | TechLead, before merge |

Gate 1 is a single checkpoint with two sides: this rule submits it, Rule 02 re-verifies it (approval record, baseline drift, authorized scope) before touching code. There is no separate implementation gate.

| Rule | Relationship |
|---|---|
| `docs/rules/02-implement-task.md` | Consumes this plan after Gate 1 |
| The project's testcase rule | Generates `testcase.md` from `expect.md` — after the plan, before code |
| The project's DB migration rule | Governs how §8 changes are written and applied |
| The project's impact rule | Governs `impact.md`, drafted here, finalized by Rule 02 |
| The project's docs-update rule | Governs how the §17 diff is proposed and approved at Gate 2 |
