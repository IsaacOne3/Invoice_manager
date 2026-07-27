# Execution Roadmap

Delivery-first roadmap for the internal commercial-document application. This revision was made after rereading this file and every Markdown document in `docs/contradictoires-codex-pack`. It changes only this roadmap. It does not modify application code, install packages, or modify the planning pack.

## 1. Audit result

### Repository truth

The project is initialized. The repository contains a Next.js application, TypeScript configuration, package files, `src-tauri`, Tauri configuration, Rust sources, and the planning documents. The Founder reports that `npm run build` and `npm run tauri dev` pass. The roadmap must therefore no longer plan repository initialization or an empty-shell proof.

The project still has no approved production domain schema, local SQLite persistence, Supabase persistence, synchronization, document workflow, configuration CRUD, or usable product surface. Those are implementation work, not proof-only work.

The repository also contains `AGENTS.md`. Any future Next.js code change must read the relevant current guide under `node_modules/next/dist/docs/` before editing code, as that repository instruction requires.

### What remains correct

- Normal document creation and contradictory-set creation remain distinct jobs.
- The main document owns shared client and item content for a contradictory set.
- Companies, clients, document types, units, templates, and pricing rules are configuration, not hardcoded product logic.
- Documents preserve relevant snapshots, support autosave/resume, and use contextual validation.
- Long item lists, decimal-safe money, PDF output, editable Excel, multiple layouts, and frequent Founder visual review remain required.
- OCR, AI extraction, emailing, advanced collaboration, payment collection, accounting integration, and public customer access remain deferred.

### Corrections to the previous roadmap

- Remove Checkpoints 0A–0F as mandatory isolated demonstrations. Environment verification and existing build success are already sufficient for the current repository stage.
- Do not create disposable demos for SQLite, calculations, PDF, or Excel unless the real slice exposes a concrete technical risk that cannot reasonably be tested through product behavior.
- Do not defer the usable normal-document workflow behind a large architecture-proof program.
- Do not use mock or hardcoded companies, clients, document types, pricing profiles, or documents in Founder-facing workflows. Test fixtures may remain inside automated tests only.
- Keep Supabase/PostgreSQL and synchronization later. The first usable product slice is local Windows SQLite-backed work.

### Decisions still required before the affected work

- Online account/tenancy and minimum authentication boundary.
- Cloud/local authority and conflict behavior when synchronization is introduced.
- Currency, VAT, rounding, numbering, language, timezone, and default contradictory count.
- Phone behavior for editing 40–100 items.
- Source-file and logo storage limits, backup/restore, export-package contents, and cloud asset retention.

These decisions must not block reversible local normal-document work unless they directly affect its data contract.

## 2. Approved product summary

The product is a private internal application usable online from a phone or browser and fully offline on Windows. It uses one shared TypeScript/React codebase, Next.js for the online application, Tauri for Windows packaging, local SQLite for offline Windows work, Supabase-hosted PostgreSQL for the later online data layer, and later synchronization between local SQLite and cloud PostgreSQL. IndexedDB and Dexie are rejected.

The first delivery target is a real normal-document workflow: create or select persisted configuration, create a draft, enter items, save locally, close, reopen, review, preview, and export. The contradictory workflow follows after the normal workflow is trustworthy. Source PDF/image files are references only; OCR is deferred.

## 3. Technical architecture recommendation

Use the already initialized Next.js/Tauri direction. Share TypeScript domain types, validation, money calculations, document input contracts, and reusable React components where practical. Keep browser, Tauri, SQLite, PostgreSQL, file-system, and later synchronization concerns behind explicit adapters.

The first local vertical slice should use real SQLite repositories and migrations. It should not introduce browser persistence as a substitute. The online PostgreSQL adapter can be added after the local normal workflow is usable. Synchronization remains a later checkpoint and must not be simulated by copying data in memory.

Use the smallest library set already present or justified by the real slice. Next.js/Tauri are established directions. Add validation, decimal arithmetic, PDF, Excel, UI, or storage libraries only when the slice needs them and their behavior is covered by the slice’s automated tests. Do not reopen broad framework comparisons.

Key risks remain: local/cloud authority, stable IDs versus official numbers, snapshots, migrations, asset storage, browser/Tauri renderer parity, Excel editability, backups, and authentication boundaries. Address each at the checkpoint where the real behavior makes it relevant.

## 4. Responsibility split

- **FOUNDER:** Provide unresolved business decisions and representative samples when needed; inspect each meaningful UI or generated-document surface; accept or correct the real workflow before the next UI surface.
- **CODEX:** Implement the real persistence, domain, UI, rendering, tests, migrations, and later synchronization work. Codex owns complex, architectural, repetitive, and validation-heavy work.
- **FOUNDER + CODEX:** Founder decides product behavior and visually accepts it; Codex implements and verifies it. Both approve material data-safety and synchronization decisions.

## 5. Incremental execution plan

The boundaries below are delivery-first. Non-UI work is grouped only when it directly enables the next usable slice. Every checkpoint stops explicitly; no checkpoint silently continues into the next one.

### Checkpoint 1 — Local normal-document foundation

- **Objective:** Establish real local persistence and domain behavior needed by the first normal-document slice.
- **Included scope:** Read the existing app and `AGENTS.md`; add versioned SQLite migrations; repositories for companies, clients, document types, units, documents, and items; stable internal IDs; document/item validation; decimal-safe calculation functions; real draft save/load contracts; development reset/backup boundary; automated integration fixtures only.
- **Excluded scope:** Founder-facing configuration UI; product UI changes; Supabase schema; synchronization; contradictory sets; PDF/Excel generation; mock data exposed in the application.
- **Why this checkpoint boundary is useful:** It gives the first UI surfaces a real persistence contract without spending time on disposable demos. The same repositories will be exercised immediately by settings and normal-document creation.
- **Automated verification:** Migration creation/reopen; SQLite transaction commit/rollback; CRUD for each required configuration and document record; draft reopen; decimal quantities; line and total calculations; no IndexedDB/Dexie dependency; lint, typecheck, tests, and build.
- **Founder manual verification:** None beyond reviewing the concise implementation report; no visual gate.
- **Visual approval required:** No.
- **Explicit stop:** Stop after the local repositories, migrations, tests, and build pass. Report what changed and wait before changing visible UI.

### Checkpoint 2 — Home surface

- **Objective:** Give the Founder a clear entry point into the real product.
- **Included scope:** Responsive application shell; Home; New document; Create contradictoires; Open existing document; Settings entry; empty Recent documents state; real route wiring.
- **Excluded scope:** Setup forms; fake recent documents; configuration screens; document editor; contradictory workspace.
- **Why this checkpoint boundary is useful:** Home establishes hierarchy and vocabulary without combining it with a complex workflow. It creates the first meaningful visual decision.
- **Automated verification:** Route tests, accessible controls, empty-state tests, responsive smoke checks, lint, typecheck, and build.
- **Founder manual verification:** Open the web application and Tauri application; inspect phone/browser width and Windows layout; check readability, action hierarchy, wording, and clutter.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after Founder inspection and acceptance or correction. Do not add setup screens yet.

### Checkpoint 3 — Real configuration: companies and document types

- **Objective:** Make the first selections in normal-document setup come from real persisted configuration.
- **Included scope:** Settings entry; company list/create/edit/archive backed by SQLite; document-type list/create/edit/archive backed by SQLite; only fields required by normal creation; empty/loading/error states; real selection contracts.
- **Excluded scope:** Hardcoded companies or document types; client management; pricing profiles; template editor; cloud persistence; full settings administration.
- **Why this checkpoint boundary is useful:** A selection UI is not useful if its records are fake. This checkpoint turns the two highest-level normal-document choices into real persisted data before they appear in the creation flow.
- **Automated verification:** SQLite CRUD and migration tests through the same repository used by the UI; archive/reference rules; validation; reload persistence; no hardcoded Founder-specific records; lint, typecheck, tests, and build.
- **Founder manual verification:** Create a company and document type, close/reopen the app, edit/archive them, and confirm the persisted list and empty states.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after the Founder accepts the settings surface and confirms persistence. Do not add client or setup screens.

### Checkpoint 4 — Direct normal-document entry and first draft

- **Objective:** Let the Founder move directly from Home through persisted company and document-type selection into a real local draft.
- **Included scope:** New document route; active company cards; active document-type cards; direct Settings empty states; immediate draft creation with stable ID, company snapshot, document-type snapshot, Draft status, and timestamps; reopenable empty draft; minimal persisted Units needed by the item workspace.
- **Excluded scope:** Client selection or creation; setup wizard; official number/date/place/reference/note requirements; PDF/Excel; contradictory workflow; cloud persistence; mock or hardcoded selection data.
- **Why this checkpoint boundary is useful:** It removes the older multi-step setup sequence and gets the first real invoice into an editable workspace without sacrificing durable identity or snapshots.
- **Automated verification:** Active-only selection; empty-state routing; draft creation with no client or items; snapshot persistence; stable-ID reopen; unit repository integration; lint, typecheck, tests, and build.
- **Founder manual verification:** From Home select a real company and document type, confirm the draft opens immediately, close and reopen it, and verify the same snapshots and draft state remain available.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after the Founder accepts the direct selection and draft-entry transition. Do not add client or metadata setup before the item workspace is usable.

### Checkpoint 5 — First usable item-entry workspace

- **Objective:** Let the Founder enter several real items, calculate totals, save, close, and reopen the draft.
- **Included scope:** Spreadsheet-style workspace; company/type/status header; visible save state; one empty row; description; decimal quantity; persisted unit selection; unit price excluding tax; calculated line total; add/remove rows; immediate decimal-safe totals; Save and close; minimal secondary details access without blocking items; real SQLite save/load.
- **Excluded scope:** Client workflow; official number/date/place/reference/note completion; autocomplete; 40–100-row hardening; final polish; PDF/Excel; contradictory workflow; cloud sync.
- **Why this checkpoint boundary is useful:** It delivers the first genuinely usable invoice flow by testing persistence, calculations, and interaction together rather than through isolated proofs.
- **Automated verification:** End-to-end draft/item save and reopen; row CRUD; empty-row handling; decimal calculations; unit snapshots; save-state transitions; 5–10 item fixture; focused UI/integration tests; lint, typecheck, tests, and build.
- **Founder manual verification:** Create a real draft from Home, enter 5–10 items with decimal quantities, save and close, reopen it, and judge the table width, readability, speed, totals, and keyboard behavior.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop at the Founder review gate after the first working invoice flow. Do not add long-document hardening or secondary metadata until this slice is accepted.

### Checkpoint 6 — First usable normal-document workspace

- **Objective:** Let the Founder enter and save a real normal document with a practical first item list.
- **Included scope:** Workspace header; Overview/Items/Review navigation; real SQLite autosave; visible save state; add/remove rows; description; decimal quantity; persisted unit; unit price excluding tax; calculated line total; HT/VAT/TTC totals using approved temporary rules; basic contextual validation; Save and close; reopen.
- **Excluded scope:** 40–100-row performance hardening; final official export policy; professional template family; contradictory workflow; cloud sync.
- **Why this checkpoint boundary is useful:** It delivers the first genuinely useful commercial-document slice and tests persistence, money calculations, and user interaction together instead of through isolated proofs.
- **Automated verification:** End-to-end create/edit/save/reopen; autosave failure state; row CRUD; decimal calculations; persisted totals strategy; validation focus links; 5–10 item fixture; lint, typecheck, tests, and build.
- **Founder manual verification:** Create a realistic 5–10 item document, edit values, close/reopen it, verify totals and save status, and judge speed, clarity, and keyboard behavior.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after Founder acceptance or a concrete correction request. Do not harden for long documents until this slice is trusted.

### Checkpoint 7 — Client, details, review, and first PDF

- **Objective:** Complete a useful normal draft from the existing workspace through client/details review and one professional PDF layout.
- **Included scope:** Real persisted client selection; new-client creation; optional client/details; number/date assign-later behavior; review surface; draft marking when number/date is missing; one professional invoice layout; preview; PDF generation; multi-page output with repeated headers; persistence after close/reopen.
- **Excluded scope:** Excel; multiple templates; contradictoires; cloud persistence; synchronization; OCR; authentication; final visual polish.
- **Why this checkpoint boundary is useful:** It is the next complete Founder-visible path after item entry and proves that persisted draft truth can become a usable, clearly marked document without adding a setup wizard.
- **Automated verification:** Client CRUD and snapshot persistence; optional details persistence; draft/final marking rules; one- and multi-page PDF generation; repeated headers; deterministic totals; Tauri save path; lint, typecheck, tests, and build.
- **Founder manual verification:** Open a persisted draft, choose or create a client, add optional details, preview a draft PDF, generate it, complete number/date, generate a non-draft PDF, close/reopen, and confirm all information remains.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after Founder inspection of the review, preview, and generated PDF. Do not add Excel or long-document hardening until this slice is accepted.

### Checkpoint 8 — Long-document normal flow

- **Objective:** Make the normal workspace practical for 40–100+ items.
- **Included scope:** Long-list rendering and interaction; sticky headers; stable totals visibility; keyboard navigation; long descriptions; decimal quantities; row focus/validation; responsive phone strategy; reopen after partial work.
- **Excluded scope:** Excel export; contradictory documents; additional templates; cloud persistence; synchronization.
- **Why this checkpoint boundary is useful:** Long documents deserve a focused usability gate after the first end-to-end review and PDF path is trusted.
- **Automated verification:** 40- and 100-row interaction/performance tests; save/reopen with long descriptions; calculation regression; responsive smoke tests; no clipped or inaccessible controls; lint, typecheck, tests, and build.
- **Founder manual verification:** Enter or edit at least 40 items, use keyboard navigation, inspect long descriptions, close/reopen, and test the phone/browser layout.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after the realistic long-document test. Do not add Excel until the Founder accepts the editing experience.

### Checkpoint 9 — Editable Excel export

- **Objective:** Add editable Excel output after the normal PDF path is trusted.
- **Included scope:** Editable Excel workbook with numeric cells; safe filenames; output success/failure states; export record; browser/Tauri compatibility.
- **Excluded scope:** New PDF layouts; contradictory package export; cloud export storage; email delivery.
- **Why this checkpoint boundary is useful:** Excel editability is a separate output risk and should not delay the first usable invoice PDF.
- **Automated verification:** 1-, 40-, and 100-item workbooks; decimal quantities; numeric-cell/editability inspection; deterministic totals; safe filenames; lint, typecheck, tests, and build.
- **Founder manual verification:** Generate Excel from a real document, inspect the workbook, edit numeric values, and verify output messaging.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after Excel inspection and acceptance. Do not begin contradictory work or additional templates before the normal export path is trusted.

### Checkpoint 10 — Existing documents, duplicate, and normal-flow recovery

- **Objective:** Make saved normal documents searchable and reusable.
- **Included scope:** Search/list; recent documents; filters kept minimal; open; continue editing; duplicate with cleared/regenerated official identity; export history; start contradictoires action from an existing document.
- **Excluded scope:** Contradictory configuration cards; cloud synchronization; broad settings administration.
- **Why this checkpoint boundary is useful:** It turns the first slice into a repeatable daily workflow and verifies that persisted documents remain useful beyond one session.
- **Automated verification:** Search/filter correctness; duplicate snapshot rules; official-number clearing; reopen/regenerate; export-history records; lint, typecheck, tests, and build.
- **Founder manual verification:** Find a saved document, reopen it, duplicate it, export it again, and start the contradictory path without losing the original.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after acceptance. Do not build contradictory details until normal history and duplication are trusted.

### Checkpoint 11 — Online PostgreSQL normal-document slice

- **Objective:** Move the already usable normal-document workflow to the online browser data path.
- **Included scope:** Approved minimum online account boundary; Supabase/PostgreSQL migrations for the normal-document domain; cloud repositories; browser create/edit/save/reopen; secure ownership rules; migration and error handling.
- **Excluded scope:** Synchronization; offline conflict handling; contradictory workflow; advanced collaboration; broad permissions.
- **Why this checkpoint boundary is useful:** Cloud work is introduced after local product behavior and schema needs are known, reducing speculative schema and authentication work.
- **Automated verification:** Cloud migration tests; CRUD and ownership tests; browser end-to-end normal flow; authorization tests; retry/error handling; output regression; lint, typecheck, tests, and build.
- **Founder manual verification:** Use the online browser flow to create, close, reopen, and export a normal document from persisted cloud data.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after online normal-document acceptance. Do not implement synchronization until the cloud slice is trusted and authority decisions are explicit.

### Checkpoint 12 — Synchronization between local SQLite and cloud PostgreSQL

- **Objective:** Add safe synchronization after both local and online normal flows work independently.
- **Included scope:** Stable IDs; local outbox/inbox; idempotent push/pull; versions; reconnect; explicit conflict records; asset synchronization policy; recovery; user-visible sync status only where needed.
- **Excluded scope:** Silent merges; broad collaboration; contradictory synchronization unless the shared model requires it; unapproved authority rules.
- **Why this checkpoint boundary is useful:** Sync is the highest-risk architectural behavior and is now tested against real records and real workflows instead of disposable records.
- **Automated verification:** Offline edits, retries, duplicate/reordered delivery, interrupted writes, reconnect, two-device conflicts, asset recovery, no silent overwrite, and migration safety.
- **Founder manual verification:** Review conflict examples and perform an offline edit followed by reconnect; approve the user-visible result.
- **Visual approval required:** Yes if sync status or conflict UI changes; otherwise behavior approval is still required.
- **Explicit stop:** Stop if authority or conflict behavior is unclear. Do not continue into contradictory sync automatically.

### Checkpoint 13 — Contradictoires entry and workspace shell

- **Objective:** Create a persistent contradictory set from a trusted main document.
- **Included scope:** Home and existing-document entry; main-document selection; required shared-data validation; contradictory-set persistence; Documents/Shared items/Review sections; add/remove documents; save/reopen.
- **Excluded scope:** Detailed pricing; full shared propagation; package export.
- **Why this checkpoint boundary is useful:** It establishes the set structure and ownership before introducing dense per-document pricing controls.
- **Automated verification:** One-main-document invariant; validation links; persistence; add/remove; reopen; local/cloud repository behavior as applicable.
- **Founder manual verification:** Start from a saved normal document, create a set, close/reopen it, and inspect the workspace structure.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after the workspace shell is accepted. Do not add detailed cards.

### Checkpoint 14 — Contradictory configuration, shared items, and prices

- **Objective:** Configure real contradictory documents without losing main-document ownership.
- **Included scope:** Company/template/price-method selection from persisted configuration; More options; copy/percentage/fixed/manual pricing; rounding; overwrite warnings; long price editor; shared description/quantity/unit editing; propagation; recalculation.
- **Excluded scope:** Additional layout family; final package export; unapproved conflict merges.
- **Why this checkpoint boundary is useful:** It groups the tightly coupled decisions that define a contradictory document while preserving a separate visual gate for the dense workspace.
- **Automated verification:** Source-item identity; price preservation; manual override markers; overwrite warnings; shared propagation; totals/rounding; 40+ price rows; persistence and reopen.
- **Founder manual verification:** Create at least three contradictory documents, assign different persisted companies/templates, apply different pricing methods, override rows, and edit one shared quantity.
- **Visual approval required:** Yes.
- **Explicit stop:** Stop after the Founder accepts card density, price editing, and propagation. Do not export the package yet.

### Checkpoint 15 — Additional templates and contradictory export package

- **Objective:** Deliver approved layout diversity and export the complete contradictory workflow.
- **Included scope:** One additional template at a time; compatibility; per-document review; PDF/Excel selection; main-document inclusion policy; organized package/ZIP; export history; per-document failure reporting.
- **Excluded scope:** Template editor; OCR; emailing; collaboration.
- **Why this checkpoint boundary is useful:** Templates and package export create visible, high-judgment output changes, so each meaningful layout gets its own Founder inspection rather than being hidden in a batch.
- **Automated verification:** Deterministic multi-document output; 1/40/100-item pagination; safe names; editable Excel; package contents; failure isolation; browser/Tauri parity.
- **Founder manual verification:** Inspect each layout, edit exported workbooks, preview all files, and export/reopen/regenerate the complete set.
- **Visual approval required:** Yes after each meaningful layout and at package completion.
- **Explicit stop:** Stop after full contradictory acceptance. Do not add broad settings or release polish before the workflow is accepted.

### Checkpoint 16 — Minimum settings, backup, and release hardening

- **Objective:** Complete only the configuration and safety surfaces required for a release candidate.
- **Included scope:** Remaining approved settings; VAT/numbering defaults; backup/restore; migration recovery; accessibility; localization readiness; performance; packaging; clean-install and final regression.
- **Excluded scope:** Unapproved collaboration, OCR, accounting integration, public access, and extra permissions.
- **Why this checkpoint boundary is useful:** It postpones administrative breadth until the core workflows prove which settings and recovery behavior are actually needed.
- **Automated verification:** Full normal and contradictory acceptance scenarios; local/cloud migration recovery; backup/restore; accessibility; export regression; sync regression; web/Tauri builds.
- **Founder manual verification:** Perform the full online and offline workflow, including close/reopen, export, reconnect, backup/restore, and final Windows packaging check.
- **Visual approval required:** Yes; final acceptance.
- **Explicit stop:** Stop at release-candidate acceptance. Any remaining issue requires a targeted correction checkpoint, not silent continuation.

## 6. Founder setup and review rule

No additional setup is required for the current roadmap: Next.js and Tauri are already initialized and working, and the Founder has supplied successful build/dev results. Before any future checkpoint that requires a product decision, Codex must state the decision and consequence plainly. The Founder’s recurring action is to inspect the runnable surface named in the checkpoint and explicitly accept or correct it.

## 7. First Codex implementation prompt

Use this prompt for the first implementation checkpoint:

> Read `AGENTS.md`, `docs/execution-roadmap.md`, and every document in `docs/contradictoires-codex-pack` before changing code. The repository is already initialized: Next.js and Tauri are working, and `npm run build` and `npm run tauri dev` have passed. Implement Checkpoint 1 — Local normal-document foundation only. Add real versioned SQLite migrations and repositories for companies, clients, document types, units, normal documents, and items; stable internal IDs; validation; decimal-safe calculations; real draft save/load contracts; and automated integration tests. Keep test fixtures inside tests only. Do not build or modify Founder-facing UI in this checkpoint. Do not add Supabase schema, synchronization, contradictory sets, PDF/Excel generation, authentication, OCR, mock data, or hardcoded Founder-specific records. Read the relevant current Next.js guide under `node_modules/next/dist/docs/` before any Next.js code change, as required by `AGENTS.md`. Run the existing build plus focused lint, typecheck, migration, repository, and calculation tests. Stop and report the files changed, automated results, risks, and the exact boundary for Checkpoint 2. Do not continue into UI work automatically.
