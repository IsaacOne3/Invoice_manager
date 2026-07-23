# 07 — Incremental Execution Plan

## 1. Delivery rule

Stop at the first boundary that creates either:

- a genuine Founder UI/UX decision; or
- a runnable slice with meaningful Founder use.

Non-visual technical groundwork may be grouped and completed without routine Founder interruption, provided it is reversible, tested, and does not decide unapproved product behavior.

Every UI-affecting checkpoint ends with:

1. runnable application;
2. exact Founder inspection steps;
3. screenshots when useful;
4. automated checks;
5. explicit list of what changed and what remains untouched;
6. pause for Founder acceptance or correction.

## 2. Checkpoint plan

### Checkpoint 0 — Repository and platform decision

**UI impact:** None expected. Codex may proceed autonomously.

Tasks:

- inspect repository or initialize project if empty;
- identify target runtime: local web app, desktop wrapper, or approved alternative;
- choose persistence approach appropriate for one private installation;
- record architecture decision;
- establish lint, test, build, formatting, and migration commands;
- establish baseline commit;
- create safe development data strategy;
- confirm PDF and Excel generation libraries through a small technical spike;
- do not build final UI.

Evidence:

- architecture note;
- successful build/test baseline;
- proof that one sample PDF and one sample Excel file can be generated without committing product UI.

### Checkpoint 1 — Domain and persistence foundation

**UI impact:** None or developer-only diagnostics. Codex may proceed autonomously.

Tasks:

- implement core entities and migrations/schema;
- decimal money and quantity handling;
- snapshot structures;
- autosave repository/service contracts;
- configuration seed data for sample companies, clients, document types, templates, units, and pricing profiles;
- unit tests for calculations and snapshots;
- export-record model.

Do not claim product usability yet.

### Checkpoint 2 — Application shell and Home

**UI impact:** Yes. Stop for Founder review.

Build only:

- application shell;
- Home screen;
- three dominant actions;
- Settings entry;
- empty Recent documents state;
- basic responsive desktop behavior.

Founder verifies:

- visual tone;
- readability;
- action hierarchy;
- absence of unnecessary sidebar/clutter;
- wording.

Do not build the whole creation flow in this checkpoint.

### Checkpoint 3 — Normal document setup: Type and Company

**UI impact:** Yes. Stop for Founder review.

Build:

- Type selection screen;
- Company selection screen;
- selected states;
- back navigation preserving choices;
- disabled/enabled Continue behavior;
- configuration-backed data.

Founder verifies both screens before Start and Client are added.

### Checkpoint 4 — Normal document setup: Start and Client

**UI impact:** Yes. Stop for Founder review.

Build:

- starting-method screen;
- source PDF/image upload validation;
- client segmented switcher;
- saved-client search and selection;
- new-client form;
- Create document action;
- draft creation and redirection contract.

Founder verifies the complete four-part setup flow.

### Checkpoint 5 — Document workspace shell and autosave

**UI impact:** Yes. Stop for Founder review.

Build:

- Document workspace header;
- Overview, Items, Review & export navigation;
- saved/saving/save-failed indicator;
- Save and close;
- reopen from Recent documents;
- no full item table yet beyond a minimal empty-state skeleton.

Founder verifies workspace structure and resume behavior.

### Checkpoint 6 — Items workspace: first usable slice

**UI impact:** Yes. Stop for Founder review.

Build:

- editable rows;
- add/remove row;
- description, quantity, unit, PU HT, line total;
- totals;
- validation;
- keyboard behavior for a small list;
- autosave.

Founder enters a realistic 5–10 item document and judges speed and clarity.

### Checkpoint 7 — Items workspace: long-document hardening

**UI impact:** Yes. Stop for Founder review.

Build:

- 40–100 row performance;
- sticky headers;
- stable totals visibility;
- efficient keyboard navigation;
- source preview split/hide behavior;
- long descriptions;
- decimal quantities;
- reopen and continue after partial work.

Founder performs a realistic long-document test.

### Checkpoint 8 — Overview

**UI impact:** Yes. Stop for Founder review.

Build:

- type/company/client summary and edit behavior;
- number with Assign later;
- date with Set later;
- place;
- reference;
- note;
- source-file management;
- required-change confirmations.

Founder verifies that the form remains compact and does not over-explain itself.

### Checkpoint 9 — Normal document review and first template

**UI impact:** Yes. Stop for Founder review.

Build:

- validation summary;
- direct links to problems;
- first professional template preview;
- Draft preview behavior;
- one-page and multi-page rendering.

Founder reviews the actual document design before final export wiring is considered accepted.

### Checkpoint 10 — Normal PDF and Excel export

**UI impact:** Some. Stop for Founder workflow review.

Build:

- PDF generation;
- editable Excel generation;
- output choices;
- safe filenames;
- export records;
- success and failure states.

Founder creates, closes, reopens, validates, previews, and exports one real document.

### Checkpoint 11 — Existing document search, open, and duplicate

**UI impact:** Yes. Stop for Founder review.

Build:

- search/list;
- filters kept minimal;
- open document;
- duplicate document;
- start contradictoires action from a document.

### Checkpoint 12 — Contradictoires entry and validation

**UI impact:** Yes. Stop for Founder review.

Build:

- Create contradictoires action from Home;
- existing/new main-document switcher;
- saved document selection;
- required shared-data validation;
- return-to-main-document correction flow;
- contradictory-set creation.

Do not build full configuration cards yet.

### Checkpoint 13 — Contradictoires workspace shell

**UI impact:** Yes. Stop for Founder review.

Build:

- workspace header;
- Documents, Shared items, Review & export sections;
- empty/default document cards;
- add/remove document controls;
- save/reopen behavior.

Founder approves the workspace structure before detailed card controls.

### Checkpoint 14 — Contradictory document cards

**UI impact:** Yes. Stop for Founder review.

Build:

- company selector;
- template selector;
- pricing-method selector;
- totals summary;
- More options expansion;
- preview placeholder/action state.

Founder verifies card density and whether common decisions are clear.

### Checkpoint 15 — Price editor

**UI impact:** Yes. Stop for Founder review.

Build:

- main/new price comparison;
- percentage adjustment;
- fixed adjustment;
- copy main;
- copy another document;
- manual prices;
- rounding;
- overwrite warning;
- manual override markers;
- long-row performance.

Founder tests real price editing across 40+ items.

### Checkpoint 16 — Shared items propagation

**UI impact:** Yes. Stop for Founder workflow review.

Build:

- shared description/quantity/unit editor;
- update main document;
- propagate into all contradictory documents;
- preserve prices;
- recalculate totals;
- conflict/error handling.

### Checkpoint 17 — Additional professional templates

**UI impact:** Yes. One template at a time, Founder review after each meaningful visual direction.

Build and accept:

- Template 2;
- Template 3;
- compatibility rules;
- multi-page behavior.

Do not build all templates in one invisible batch.

### Checkpoint 18 — Contradictoires review and export

**UI impact:** Yes. Stop for Founder acceptance.

Build:

- per-document validation summaries;
- previews;
- output selection;
- package generation;
- PDF and Excel for every selected document;
- safe folder/archive structure;
- export history.

Founder completes the full real workflow.

### Checkpoint 19 — Settings: minimum required management

**UI impact:** Yes. Split if screens become large.

Recommended review slices:

1. Companies
2. Clients
3. Document types and units
4. Pricing profiles
5. VAT, numbering, export, language, backup

Templates may remain code-defined in the first version.

### Checkpoint 20 — Product hardening and release candidate

**UI impact:** Corrections only; stop for final Founder acceptance.

Tasks:

- recovery from interrupted save;
- backup/restore where approved;
- accessibility pass;
- French string readiness;
- performance pass;
- validation consistency;
- export regression suite;
- packaging/installation;
- clean sample data;
- final handover.

## 3. Checkpoint adjustment rule

Codex may propose splitting or merging checkpoints when repository truth justifies it, but:

- it must preserve every Founder visual gate;
- it must not group several major screens into one review merely to move faster;
- it must explain the proposed change before implementation;
- the Founder decides material UX boundary changes.
