# Execution Roadmap

Repository-grounded audit and execution plan for the internal commercial-document application. Every Markdown file in `docs/contradictoires-codex-pack` was read. This revision changes only this roadmap; it does not initialize the repository, install packages, modify the planning pack, or implement application code.

## 1. Audit result

### Repository truth

- The repository contains only the nine Markdown files in `docs/contradictoires-codex-pack`.
- No source code, package manifest, lockfile, tests, database schema, migrations, build configuration, or initialized web/desktop project exists.
- No project tooling versions can be verified from the repository.

### What is correct

- The two jobs are distinct: create a normal commercial document, or create a contradictory set from one main document.
- The main document owns shared client and item content; contradictory documents vary company snapshot, layout, prices, and approved overrides.
- Configurable profiles, snapshots, autosave, resume, contextual validation, long item lists, decimal-safe money, repeated PDF headers, editable Excel, and multiple professional layouts are appropriate.
- The manual workflow is the right first scope. OCR, AI extraction, emailing, collaboration, payment collection, accounting integration, and public SaaS behavior are not required unless separately approved.
- The planning pack generally expands flows instead of using “follow the normal flow”, and its visual gates are appropriately frequent once UI starts.

### What is incomplete

- No synchronization model, conflict policy, local/cloud authority rule, stable-ID policy, asset-sync policy, or sync migration strategy exists.
- Online tenancy/authentication boundaries, supported browsers/phones, Windows version, currency, VAT, numbering, language, timezone, and default contradictory count are unresolved.
- Asset storage, backup/restore, export destinations, offline export behavior, and retention are unspecified.
- Draft/ReadyForExport/final/official-number semantics are not one explicit state machine.
- The conceptual domain model lacks ownership, versions, tombstones, sync metadata, immutable export inputs, and precise snapshot rules.
- Proposed libraries and browser/Tauri document-generation compatibility remain unproven.

### What is contradictory

1. The pack defers cloud synchronization and describes a desktop-first/local direction. Founder decisions now require online phone/browser use, cloud PostgreSQL, offline Windows SQLite, and synchronization. The Founder direction supersedes those statements.
2. “Mobile-first interface” is listed as deferred, but phone/browser use is now required. It must be rewritten as responsive phone/browser access in scope.
3. The UX document says “desktop-first”. This may describe priority for the long-table editing experience, but cannot exclude phone/browser access.
4. Some flows use “Continue” while the normal setup ends with “Create document”; labels and transitions need one consistent contract.
5. The pack does not consistently define whether the main document is included in a contradictory export package.

### What should be removed or rewritten

- Remove cloud synchronization from deferred scope; make it a later, separately verified implementation checkpoint.
- Remove mobile-first from deferred scope and require responsive phone/browser behavior.
- Rewrite desktop-first to mean long-document usability is a priority, not that phone/browser access is excluded.
- Replace unqualified defaults and “according to approved export policy” with named temporary defaults or Founder decisions.
- Do not treat code-defined templates, persisted totals, sync authority, or authentication as approved implementation choices until their proofs and decisions exist.

### What must be clarified with the Founder

- Online account/tenancy model and the minimum authentication boundary.
- Whether Windows is a full local replica or a selected workspace, and how multiple devices are linked.
- Conflict behavior for simultaneous edits and the authority of local/cloud records, numbering, profiles, and finalized exports.
- Phone editing expectations for 40–100 items.
- Required Windows/browser support, currency, VAT, rounding, numbering, language, timezone, default contradictory count, and export-package contents.
- Asset size/retention, backup/restore, and whether cloud storage is mandatory for source files and logos.

### Technical claims requiring proof

- Shared TypeScript/React code running as online browser application and Tauri Windows application.
- SQLite migrations, transactions, crash-safe writes, backup boundaries, and Tauri file access.
- Supabase/PostgreSQL disposable connectivity and later production security boundaries.
- Synchronization retries, idempotency, versions, conflicts, stable IDs, assets, and recovery.
- Decimal arithmetic, rounding order, VAT, PDF pagination, long descriptions, repeated headers, Excel numeric cells, and browser/Tauri output parity.
- Compatibility and value of Next.js, shadcn/ui, Tailwind, Zod, and chosen PDF/Excel tools. These are proposed choices, not reasons to reopen broad framework comparisons.

## 2. Approved product summary

This is a private internal application for accountants and business staff. It must work online from a phone or browser and fully offline on Windows. The technical direction is one shared TypeScript/React codebase, Supabase-hosted PostgreSQL for cloud data, a Tauri-packaged Windows application, local SQLite for offline operation, and synchronization between SQLite and PostgreSQL. IndexedDB and Dexie are rejected.

The product creates configurable normal commercial documents and contradictory sets linked to one main document. It includes reusable companies, clients, document types, units, templates, pricing rules, draft autosave/resume, long item entry, contextual validation, PDF, editable Excel, previews, and export history. Source PDF/image files are references only. OCR, AI extraction, emailing, advanced collaboration, accounting integration, payment collection, and public customer access remain out of scope unless separately approved.

## 3. Technical architecture recommendation

### Approved direction

Proceed with the Founder-approved direction above. Use shared domain contracts, validation, money calculations, export input contracts, and reusable React components where practical. Isolate browser/server/Tauri APIs, persistence adapters, file access, sessions, downloads/open-folder behavior, and synchronization behind explicit boundaries.

Initial checkpoints prove the chosen direction in small slices. They must not reopen Next.js versus every React framework, Tauri versus separate desktop applications, or SQLite versus browser storage. Codex may recommend a correction only when evidence shows a concrete incompatibility, data-safety risk, or failure to meet a stated requirement.

Synchronization is deliberately later. Its target is a stable-ID, local outbox/inbox, idempotent and version-aware design with explicit conflict records and asset handling. Local/cloud authority must be approved before production sync. Finalized exports should record immutable inputs and generator/template versions.

### Key risks and controls

- Shared code: isolate platform APIs and test both targets early.
- Authority and conflicts: never silently overwrite; define policy per record class.
- IDs and numbering: keep stable internal IDs independent of official numbers; define offline collision behavior.
- Assets: separate metadata from bytes; define local paths, cloud objects, limits, retention, and backup.
- PDF/Excel: share normalized input contracts and test browser/Tauri parity; Excel must contain editable numeric cells.
- Migrations: version SQLite and PostgreSQL separately; test interrupted upgrade and backup/restore.
- Authentication: implement only the minimum approved online account/tenant boundary.

### Libraries

Next.js, shadcn/ui, Tailwind CSS, Zod, a decimal-safe money library, and PDF/Excel generators are proposed. Retain or correct each only from the relevant proof of compatibility, accessibility, output determinism, build impact, and maintainability. Do not add libraries because they are popular.

## 4. Responsibility split

- **FOUNDER:** Run deterministic environment checks; provide safe representative samples and business decisions; inspect every UI and generated-document direction; approve architecture proof outcomes, conflict policy, output policy, and final workflow.
- **CODEX:** Inspect, implement, test, and document the repository foundation, proofs, domain, persistence, sync, rendering, and UI. Codex owns complex, risky, repetitive, architectural, and validation-heavy work.
- **FOUNDER + CODEX:** Founder decides product behavior and visually accepts it; Codex implements and verifies it. Both approve material architecture and synchronization decisions.

## 5. Incremental execution plan

Every checkpoint ends with the required closeout fields: files changed, commands run, results, failures or risks, Founder actions, exact next prompt, and explicit stop. No checkpoint may continue automatically into the next one.

### Checkpoint 0A — Founder environment verification

- **Objective:** Collect versions before Codex gives setup commands.
- **Scope:** Founder runs `node --version`, `npm --version`, `rustc --version`, `cargo --version`, and `git --version` if required.
- **Excluded:** Scaffolding, installation, coding, and project initialization.
- **Responsible:** FOUNDER runs commands; CODEX reviews compatibility.
- **Files:** None.
- **Commands:** Exactly the version checks above from the project directory.
- **Verification:** Codex checks versions against the approved toolchain.
- **Manual check:** Founder confirms the intended PowerShell environment.
- **Founder visual approval:** No.
- **Stop condition:** Stop after Codex reports compatibility or a concrete blocker.
- **Rollback boundary:** None.
- **Closeout:** Files changed: none. Commands run: version checks. Results: compatibility report. Failures/risks: missing or incompatible versions. Founder actions: send outputs and resolve only requested prerequisites. Exact next prompt: approved 0B prompt. Explicit stop: no scaffolding or installation.

### Checkpoint 0B — Minimal repository foundation

- **Objective:** Establish the minimum shared project and prove an empty web app and empty Tauri shell can run.
- **Scope:** TypeScript/React structure; formatting, linting, testing, and build commands; empty online web target; empty Windows Tauri target.
- **Excluded:** Product UI, Supabase schema, SQLite domain schema, synchronization, PDF, Excel, authentication, and product models.
- **Responsible:** CODEX.
- **Files:** Minimum project/configuration files only; exact paths must be reported.
- **Commands:** Approved format/check, lint, test, build, web run, and Tauri run/check commands.
- **Verification:** Shared quality checks and successful empty web/Tauri launch.
- **Manual check:** Founder may confirm both empty targets launch.
- **Founder visual approval:** No.
- **Stop condition:** Stop and report exact repository structure and commands.
- **Rollback boundary:** Revert foundation files if both targets cannot run.
- **Closeout:** Files changed: exact foundation paths. Commands run: exact setup/check commands. Results: web/Tauri launch and quality results. Failures/risks: tooling or compatibility issues. Founder actions: inspect structure and approve continuation. Exact next prompt: 0C SQLite proof prompt. Explicit stop: no databases, sync, PDF, Excel, or product UI.

### Checkpoint 0C — Local SQLite technical proof

- **Objective:** Prove isolated SQLite behavior inside Tauri.
- **Scope:** Create, write, read, update, close, reopen one small test record; prove migration behavior and transaction safety.
- **Excluded:** Production document schema, domain entities, autosave product behavior, synchronization, and UI.
- **Responsible:** CODEX.
- **Files:** Isolated Tauri SQLite proof and tests only.
- **Commands:** Tauri proof run/check and SQLite proof tests.
- **Verification:** Lifecycle, migration/reopen, commit, rollback, interrupted transaction, and no IndexedDB/Dexie.
- **Manual check:** Founder reviews evidence.
- **Founder visual approval:** No.
- **Stop condition:** Stop after reporting evidence.
- **Rollback boundary:** Remove or isolate proof code.
- **Closeout:** Files changed: SQLite proof paths. Commands run: exact proof commands. Results: lifecycle/migration/transaction evidence. Failures/risks: driver or Tauri limitations. Founder actions: review and approve/reject persistence approach. Exact next prompt: 0D cloud proof prompt. Explicit stop: no production schema.

### Checkpoint 0D — Cloud PostgreSQL technical proof

- **Objective:** Prove isolated Supabase/PostgreSQL connectivity.
- **Scope:** Disposable proof table or Founder-approved temporary schema; write, read, update, delete.
- **Excluded:** Production authentication, production domain tables, production migrations, sync, and user data.
- **Responsible:** CODEX; FOUNDER supplies safe disposable access/target.
- **Files:** Isolated cloud proof/configuration/tests; no committed secrets.
- **Commands:** Approved environment-variable setup and cloud proof tests, with secrets omitted from reports.
- **Verification:** Connection, CRUD, cleanup, error handling, and target isolation.
- **Manual check:** Founder confirms the target is disposable.
- **Founder visual approval:** No.
- **Stop condition:** Stop after evidence; do not create production tables/auth.
- **Rollback boundary:** Remove only the disposable proof table/schema with approval.
- **Closeout:** Files changed: cloud proof paths. Commands run: exact safe commands. Results: CRUD/cleanup evidence. Failures/risks: credentials, network, RLS, or region limits. Founder actions: approve access and review evidence. Exact next prompt: 0E calculation proof prompt. Explicit stop: no production cloud schema/auth.

### Checkpoint 0E — Shared calculation proof

- **Objective:** Prove decimal-safe quantity, price, VAT, rounding, and totals.
- **Scope:** Shared TypeScript fixtures for 1, 40, and 100 items, decimal quantities, line rounding, VAT, HT/TTC totals, and configured rounding modes.
- **Excluded:** UI, persistence, PDF, Excel, and production schema.
- **Responsible:** CODEX; FOUNDER confirms business examples and unresolved rounding policy.
- **Files:** Isolated calculation proof, fixtures, and tests.
- **Commands:** Calculation proof test, format, lint, and typecheck.
- **Verification:** Exact expected totals, precision, deterministic results, and item-count coverage.
- **Manual check:** Founder compares selected outputs with known business calculations.
- **Founder visual approval:** No.
- **Stop condition:** Stop if VAT, currency, rounding, or quantity rules are ambiguous.
- **Rollback boundary:** Replace isolated proof logic only.
- **Closeout:** Files changed: calculation proof paths. Commands run: exact checks. Results: fixture/parity results. Failures/risks: arithmetic or business-rule gaps. Founder actions: confirm/correct examples. Exact next prompt: 0F output proof prompt. Explicit stop: no UI or production financial code.

### Checkpoint 0F — Output-generation proof

- **Objective:** Prove one long PDF and one editable Excel workbook in browser and Tauri-compatible paths.
- **Scope:** 1, 40, and 100 items; long descriptions; one proof layout; PDF pagination/repeated headers; editable Excel numeric cells and basic print settings.
- **Excluded:** Professional final templates, preview/export UI, package UX, and contradictory output.
- **Responsible:** CODEX; FOUNDER + CODEX inspect generated files.
- **Files:** Isolated PDF/Excel proof generators, fixtures, and tests.
- **Commands:** Browser/Tauri proof tests, PDF render/text inspection, and Excel workbook inspection.
- **Verification:** No clipping/overlap, repeated headers, deterministic totals, editable numeric cells, and all fixture sizes.
- **Manual check:** Founder opens PDF and Excel, checks long pages, and edits numeric cells.
- **Founder visual approval:** Yes; stop for inspection.
- **Stop condition:** Stop after Founder inspection.
- **Rollback boundary:** Replace or reject proof libraries before production output work.
- **Closeout:** Files changed: output-proof paths. Commands run: exact proof/render/inspection commands. Results: output evidence and Founder inspection. Failures/risks: compatibility, pagination, editability, or bundle size. Founder actions: inspect and accept/correct. Exact next prompt: Checkpoint 1 domain foundation prompt. Explicit stop: no final templates or export UI.

### Checkpoint 1 — Approved domain and persistence foundation

- **Objective:** Implement production domain contracts after 0A–0F pass.
- **Scope:** Normal documents, contradictory sets, snapshots, money rules, local SQLite schema, cloud PostgreSQL schema, repository contracts, assets, export records, and migrations.
- **Excluded:** Production synchronization, polished UI, OCR, collaboration, and unapproved authentication.
- **Responsible:** CODEX; FOUNDER + CODEX for remaining business rules.
- **Files:** Shared domain, migrations, repositories, validation, fixtures, and tests.
- **Commands:** Format, lint, typecheck, tests, local migration/recovery, cloud migration verification, and both builds.
- **Verification:** Snapshot stability, 1/40/100 calculations, migration safety, ownership, and source-item propagation contracts.
- **Manual check:** Founder validates representative totals/snapshots.
- **Founder visual approval:** No.
- **Stop condition:** Stop on data-loss or unresolved status/numbering/VAT/ownership decisions.
- **Rollback boundary:** Versioned schema correction before real data.
- **Closeout:** Files changed: exact domain/migration paths. Commands run: exact quality/migration commands. Results: test/migration evidence. Failures/risks: schema or business-rule gaps. Founder actions: approve domain semantics. Exact next prompt: Checkpoint 2 sync prompt. Explicit stop: no UI before acceptance.

### Checkpoint 2 — Synchronization proof and contract

- **Objective:** Prove synchronization between local SQLite and cloud PostgreSQL before production sync implementation.
- **Scope:** Outbox/inbox, retries, idempotency, versions, reconnect, conflicts, stable IDs, numbering, assets, and recovery.
- **Excluded:** Broad collaboration, polished conflict UI, and silent automatic merges.
- **Responsible:** CODEX; FOUNDER + CODEX for authority/conflict decisions.
- **Files:** Sync proof/core, adapters, fixtures, decision record, and approved migration revisions.
- **Commands:** Offline/online integration, crash/retry, duplicate/reordered delivery, and both-build checks.
- **Verification:** No silent overwrite, deterministic retries, conflict detection, asset recovery, and two-device scenarios.
- **Manual check:** Founder reviews conflict examples and approves policy.
- **Founder visual approval:** No polished UI; behavior approval required.
- **Stop condition:** Stop if authority/conflict behavior is not explicit and testable.
- **Rollback boundary:** Keep sync behind adapters; remove prototype paths without changing domain contracts.
- **Closeout:** Files changed: sync paths and decision record. Commands run: exact integration commands. Results: scenario evidence. Failures/risks: conflicts, IDs, assets, or security. Founder actions: approve sync policy. Exact next prompt: Checkpoint 3 Home prompt. Explicit stop: no sync UX or automatic continuation.

### Checkpoint 3 — Application shell and Home

- **Objective:** Build the first visible surface.
- **Scope:** Responsive shell, Home, three dominant actions, Settings entry, empty Recent documents.
- **Excluded:** Setup forms and workspaces.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Shell/routes, strings, styles, tests.
- **Commands:** Web run, Tauri run, lint, typecheck, tests, builds.
- **Verification:** Route, accessibility, and responsive smoke tests.
- **Manual check:** Founder checks phone/browser and Windows hierarchy/readability.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop after explicit acceptance.
- **Rollback boundary:** Revert Home/shell only.
- **Closeout:** Files changed: exact UI paths. Commands run: exact checks. Results: runnable surface/test results. Failures/risks: responsive/accessibility issues. Founder actions: inspect and accept/correct. Exact next prompt: Checkpoint 4 setup prompt. Explicit stop: no setup before acceptance.

### Checkpoint 4 — Normal setup

- **Objective:** Make type, company, start, and client setup runnable.
- **Scope:** Four-part setup, source validation, saved/new client modes, back navigation, draft creation.
- **Excluded:** Full item editor, settings CRUD, contradictory cards.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Setup routes/components, validation, draft service, tests, strings.
- **Commands:** UI tests, lint, typecheck, builds, Tauri check.
- **Verification:** Selection gates, state preservation, invalid-file rejection, draft persistence.
- **Manual check:** Founder completes setup on phone/browser and Windows.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop after complete setup acceptance.
- **Rollback boundary:** Revert setup UI while preserving domain contracts.
- **Closeout:** Files changed: exact setup paths. Commands run: exact checks. Results: setup evidence. Failures/risks: mobile density or state issues. Founder actions: accept/correct. Exact next prompt: Checkpoint 5 workspace prompt. Explicit stop: no workspace expansion before acceptance.

### Checkpoint 5 — Normal workspace and autosave

- **Objective:** Provide a resumable workspace and first usable item slice.
- **Scope:** Overview/Items/Review, save state, save-and-close, reopen, editable rows, totals, validation, keyboard behavior, source preview.
- **Excluded:** 40–100-row hardening, final package, contradictory workflow.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Workspace UI, item editor, autosave, source viewer, tests.
- **Commands:** UI/integration tests, lint, typecheck, builds, Tauri run/check.
- **Verification:** Restart recovery, autosave failure, decimal calculations, contextual links.
- **Manual check:** Founder creates 5–10 items and resumes a draft.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop until editing speed and save trust are accepted.
- **Rollback boundary:** Revert workspace surface; keep persistence.
- **Closeout:** Files changed: exact workspace paths. Commands run: exact checks. Results: resume/autosave evidence. Failures/risks: performance or recovery issues. Founder actions: use and accept/correct. Exact next prompt: Checkpoint 6 long-document/export prompt. Explicit stop: no long-list work before acceptance.

### Checkpoint 6 — Long documents and normal review/export

- **Objective:** Complete one normal document with 40–100+ items.
- **Scope:** Long-table performance, responsive phone strategy, overview, validation, first approved template, PDF/Excel export records.
- **Excluded:** Additional templates and contradictory workflow.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Item editor, responsive layout, review/export UI, first template, adapters/tests.
- **Commands:** 100-row performance, end-to-end, renderer, lint/typecheck/build, Tauri packaging/check.
- **Verification:** Interaction budget, resume, export validity, field links, browser/Tauri parity.
- **Manual check:** Founder performs 40+ item scenario and edits Excel.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop after workflow/template acceptance.
- **Rollback boundary:** Replace table/layout/template independently.
- **Closeout:** Files changed: exact long-document/export paths. Commands run: exact checks. Results: workflow/output evidence. Failures/risks: performance, pagination, editability. Founder actions: inspect files/workflow. Exact next prompt: Checkpoint 7 history prompt. Explicit stop: no contradictory UX.

### Checkpoint 7 — Existing documents, duplicate, and history

- **Objective:** Search, open, duplicate, and resume normal documents.
- **Scope:** Minimal search/list, filters, statuses, duplicate rules, export history, source references.
- **Excluded:** Contradictory configuration.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** History/search UI, queries, duplicate service, tests.
- **Commands:** Integration tests, lint, typecheck, builds.
- **Verification:** Snapshot copy, official-number clearing, search/filter correctness.
- **Manual check:** Founder finds and duplicates a saved document.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop before contradictory entry.
- **Rollback boundary:** Revert history/query changes.
- **Closeout:** Files changed: exact history paths. Commands run: exact checks. Results: search/duplicate evidence. Failures/risks: identity/history ambiguity. Founder actions: test and accept/correct. Exact next prompt: Checkpoint 8 contradictory-entry prompt. Explicit stop: no contradictory configuration.

### Checkpoint 8 — Contradictoires entry and workspace shell

- **Objective:** Select/create a main document and create a persistent contradictory workspace.
- **Scope:** Home entry, existing/new main paths, validation/correction, Documents/Shared items/Review, add/remove, save/reopen.
- **Excluded:** Detailed pricing, propagation, export package.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Contradictory routes/components/services/tests.
- **Commands:** End-to-end tests, lint, typecheck, builds, Tauri check.
- **Verification:** One-main invariant, validation links, persistence, add/remove.
- **Manual check:** Founder enters from Home and existing document.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop before dense cards.
- **Rollback boundary:** Revert contradictory shell only.
- **Closeout:** Files changed: exact shell paths. Commands run: exact checks. Results: entry/workspace evidence. Failures/risks: navigation/density. Founder actions: inspect and accept/correct. Exact next prompt: Checkpoint 9 card/price prompt. Explicit stop: no detailed cards before acceptance.

### Checkpoint 9 — Contradictory cards, prices, and propagation

- **Objective:** Configure contradictory documents while preserving main-document ownership.
- **Scope:** Company/template/price cards, More options, pricing methods, rounding, overwrite warning, manual overrides, 40+ price rows, shared edits, propagation, recalculation.
- **Excluded:** Additional template family and final package export.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Card UI, price editor, propagation service, validation, tests.
- **Commands:** Long-row, propagation, conflict, lint, typecheck, build, Tauri checks.
- **Verification:** Source-item links, price preservation, overwrite warnings, totals parity.
- **Manual check:** Founder creates three files, applies pricing, overrides rows, edits shared quantity.
- **Founder visual approval:** Yes.
- **Stop condition:** Stop before package review/export.
- **Rollback boundary:** Revert card/editor UX without losing domain proofs.
- **Closeout:** Files changed: exact card/price paths. Commands run: exact checks. Results: multi-document evidence. Failures/risks: density, propagation, conflicts. Founder actions: exercise and accept/correct. Exact next prompt: Checkpoint 10 template/export prompt. Explicit stop: no package export.

### Checkpoint 10 — Additional templates and contradictory review/export

- **Objective:** Deliver layout diversity and complete contradictory export.
- **Scope:** Templates one at a time, compatibility, per-document review, approved export policy, PDF/Excel selection, organized package/ZIP, history.
- **Excluded:** Template editor, OCR, collaboration, email.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Template/renderers, review/export UI, package adapters, tests.
- **Commands:** Renderer regression, package end-to-end, lint/typecheck/build, Tauri packaging/check.
- **Verification:** Determinism, safe names, package contents, per-document failures, no invalid final files.
- **Manual check:** Founder reviews every layout and exports the full scenario.
- **Founder visual approval:** Yes after each meaningful layout and package completion.
- **Stop condition:** Stop before settings/release hardening.
- **Rollback boundary:** Roll back one template/export surface without changing snapshots.
- **Closeout:** Files changed: exact template/export paths. Commands run: exact checks. Results: package/layout evidence. Failures/risks: visual, packaging, platform differences. Founder actions: inspect each layout/package. Exact next prompt: Checkpoint 11 release prompt. Explicit stop: no hardening before acceptance.

### Checkpoint 11 — Minimum settings and release hardening

- **Objective:** Make approved configuration manageable and prepare a release candidate.
- **Scope:** Companies, clients, document types, units, pricing profiles, approved VAT/numbering defaults, backups, recovery, accessibility, localization readiness, performance, packaging, final regression.
- **Excluded:** Unapproved collaboration, OCR, accounting integration, and extra permissions.
- **Responsible:** CODEX; FOUNDER + CODEX.
- **Files:** Settings UI, backup/migration tooling, accessibility/localization, installer, regression fixtures.
- **Commands:** Full test/lint/typecheck/build, migrations, backup/restore, Windows packaging, clean install, offline/online sync regression.
- **Verification:** Final acceptance scenario, accessibility, migration recovery, export regression, sync regression.
- **Manual check:** Founder performs the complete online and offline workflow, including reconnect/recovery.
- **Founder visual approval:** Yes; final acceptance.
- **Stop condition:** Release only after decisions, evidence, and acceptance are recorded.
- **Rollback boundary:** Versioned release candidate and recoverable backup.
- **Closeout:** Files changed: exact release paths. Commands run: full verification commands. Results: release evidence. Failures/risks: remaining defects or unsupported environments. Founder actions: perform final acceptance. Exact next prompt: only a targeted correction prompt for an accepted failure. Explicit stop: no continuation after release acceptance.

## 6. Founder-only setup guide

The Founder must run only the following cheap deterministic checks before Codex reviews versions. Codex must not ask for scaffolding or installation until 0A confirms compatibility.

### Version checks

- **Working directory:** `C:\Users\PC\Documents\MyWork\AUN - Tech\Projects\Side Projects\Invoice_manager`
- **Commands:** `node --version`; `npm --version`; `rustc --version`; `cargo --version`; `git --version` if Codex confirms Git is required.
- **Expected result:** Version strings are printed.
- **Verify success:** Send the complete output to Codex.
- **Do not change:** Do not run `npm init`, install packages, scaffold Tauri, edit files, or choose architecture.

### Representative fixtures (optional, after Codex requests them)

- **Command:** No CLI command. Place Founder-approved, sanitized sample PDFs/images in a temporary folder outside the project.
- **Expected result:** One short and one long representative document are available.
- **Verify success:** Send Codex the exact path and permission to use them as fixtures.
- **Do not change:** Do not alter planning documents or invent legal/business rules from samples.

## 7. First Codex implementation prompt

Use only after the Founder approves this revised roadmap and provides 0A version output:

> Read `docs/execution-roadmap.md` and every document in `docs/contradictoires-codex-pack` before changing anything. Do not implement product features yet. First perform Checkpoint 0A review only: inspect the Founder-provided Node, npm, Rust, Cargo, and Git version outputs; compare them with the approved shared TypeScript/React, online browser, Tauri Windows, Supabase PostgreSQL, and SQLite direction; and report compatibility, missing prerequisites, and concrete blockers. Do not initialize the repository, install packages, scaffold anything, edit the planning pack, or modify application code. If and only if the environment is compatible, present the exact next prompt for Checkpoint 0B. Report the files changed (none), commands reviewed, results, failures or risks, Founder actions, exact next prompt, and explicit stop.
