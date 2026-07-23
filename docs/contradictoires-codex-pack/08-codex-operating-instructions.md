# 08 — Codex Operating Instructions

## 1. First response required from Codex

Before implementing product code, Codex must:

1. Inspect repository truth.
2. Read every document in this pack.
3. Identify whether the repository is empty, partial, or already structured.
4. Produce a concise gap analysis.
5. Propose the exact technical approach for Checkpoints 0 and 1.
6. Identify any genuine product contradiction or missing irreversible decision.
7. Avoid asking the Founder to decide routine engineering details.

Codex must not start by implementing the entire application.

## 2. Source-of-truth order

1. Repository truth
2. Explicit Founder decisions
3. This product pack
4. Approved checkpoint plans
5. Historical notes

When repository truth conflicts with this pack, Codex must report the conflict. It must not silently reinterpret the product.

## 3. Incremental execution behavior

For each checkpoint:

1. Restate the checkpoint boundary.
2. Inspect affected code.
3. Write a focused implementation plan.
4. Implement only the approved slice.
5. Add/update automated tests.
6. Run lint, typecheck, tests, and build as relevant.
7. Perform internal visual/runtime inspection.
8. Provide exact Founder inspection steps.
9. Stop when the checkpoint changes UI or workflow.
10. Continue automatically only for accepted non-visual foundations.

## 4. Founder visual gates

A Founder visual gate is mandatory when a checkpoint changes:

- layout;
- navigation;
- labels;
- form structure;
- table behavior;
- empty/loading/error states;
- preview;
- generated document appearance;
- visible export flow;
- user-facing validation;
- interaction density.

Codex must not say “UI complete” based only on screenshots or tests. The Founder must use the runnable screen.

## 5. No fake completeness

Do not:

- use placeholder data while claiming configuration works;
- hardcode the Founder’s two companies as product logic;
- simulate autosave without persistence;
- display calculated totals that are not based on persisted item truth;
- claim Excel is editable if it is only a rendered image;
- claim PDF pagination works without long-document evidence;
- claim contradictoires work if shared items are copied once and then drift independently;
- hide missing requirements behind generic validation messages.

## 6. Architecture expectations

Prefer the simplest architecture that safely supports:

- private local operation;
- durable drafts;
- many item rows;
- deterministic document generation;
- snapshots;
- future OCR integration;
- maintainable templates;
- backups.

Do not introduce cloud infrastructure, microservices, queues, or distributed systems without a real need.

## 7. Data safety

- Create a baseline commit before migrations or major work.
- Use migrations or versioned schema changes.
- Never delete user data during ordinary development.
- Use isolated development data.
- Add backup/export before any risky schema transition after real data exists.
- Make destructive actions explicit and reversible where possible.

## 8. Technical spikes

A technical spike is allowed before final architecture when needed for:

- PDF generation quality;
- Excel editability;
- local persistence;
- desktop file access;
- source PDF preview.

Spike code must not silently become production architecture without review.

## 9. Assumptions ledger

Maintain a short document listing assumptions such as:

- target operating system;
- single-user versus multi-user behavior;
- local-only versus cloud;
- output language;
- currency;
- default VAT;
- default number of contradictory files;
- whether the main document is included in the final package by default.

Mark each as:

- Confirmed
- Temporary reversible default
- Requires Founder decision before a named checkpoint

Do not interrupt early work for reversible defaults.

## 10. Completion evidence

A checkpoint report must include:

- files/features changed;
- migrations applied;
- automated tests run and results;
- build result;
- manual internal checks;
- exact Founder test path;
- known limitations;
- deferred work;
- whether a commit was created;
- whether the checkpoint is waiting for Founder acceptance.

## 11. Final acceptance scenario

The release candidate is not accepted until the Founder can perform this sequence:

Open app
↓
Create a normal document
↓
Select type, company, starting method, and client
↓
Enter at least 40 items
↓
Save and close
↓
Reopen and continue
↓
Complete official information
↓
Preview and export PDF and editable Excel
↓
Create contradictoires from the saved main document
↓
Create at least three contradictory documents
↓
Assign different companies and templates
↓
Apply different pricing methods
↓
Manually override selected prices
↓
Edit one shared quantity and verify propagation
↓
Preview all outputs
↓
Export the complete PDF and Excel package
↓
Reopen the set and regenerate it successfully

## 12. Initial prompt to use with Codex

Use this after placing the pack in the repository:

> Read every document in the attached Codex pack before changing code. Inspect the repository and determine the real starting point. Do not implement the entire product. Begin with Checkpoint 0 from `07-incremental-execution-plan.md`, then Checkpoint 1 only if Checkpoint 0 reveals no genuine product contradiction. You may complete those non-visual foundations autonomously with tests and evidence. Stop before the first user-facing UI checkpoint and return a repository-grounded plan for Checkpoint 2. Preserve the product flows exactly unless repository truth reveals a conflict, in which case explain it rather than silently changing the behavior.
