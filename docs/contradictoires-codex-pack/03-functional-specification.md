# 03 — Functional Specification

## 1. Home

The Home screen contains three dominant actions:

1. New document
2. Create contradictoires
3. Open existing document

Settings remains accessible without competing visually with the main actions. Recent documents may appear below.

## 2. Draft persistence

Every normal document and contradictory set must have:

- a stable internal identifier;
- created-at and updated-at timestamps;
- draft/final readiness state;
- continuous autosave or frequent debounced autosave;
- visible save state: Saving, Saved, Save failed;
- safe recovery after application restart.

Official document number and internal draft identifier are different concepts.

## 3. Snapshot behavior

When a reusable profile is selected, the document stores a snapshot of the relevant values.

Later edits to a company, client, document type, or template definition must not silently rewrite previously created documents.

The UI may allow an explicit “refresh from current profile” action later, but it is not required for the first version.

## 4. Normal document workspace

Sections:

- Overview
- Items
- Review & export

The initial landing section is Items because that is the main work area.

### Overview fields

- document type;
- issuing company;
- client;
- document number;
- issue date;
- place;
- reference/subject;
- note;
- source file.

Number and issue date may remain empty until final export.

### Items behavior

- support at least 100 rows without unusable slowdown;
- description is the widest editable field;
- quantity supports decimal values;
- unit is optional and configurable;
- unit price excluding tax is editable;
- line total is calculated and read-only;
- add row;
- remove row with undo or confirmation when populated;
- reorder rows if implemented without harming speed;
- keyboard-friendly navigation;
- Enter from the last row may create another row;
- sticky column headers for long lists;
- totals remain visible through a sticky or nearby summary;
- source preview can be shown or hidden;
- source preview supports PDF page navigation and image viewing.

## 5. Client behavior

Saved-client mode and new-client mode use a segmented switcher or tabs.

### Saved client

- search;
- select one result;
- clear selected state;
- continue only after selection.

### New client

- name required;
- other fields optional unless document type says otherwise;
- optional save-for-future control;
- switching modes preserves current in-progress data during that session.

## 6. Contradictory-set workspace

Sections:

- Documents
- Shared items
- Review & export

The set links to exactly one main document.

### Documents section

Each contradictory document is represented by a card with:

- display label, e.g. Document 1;
- selected company/header;
- selected template;
- selected pricing method;
- total summary;
- Edit prices;
- Preview;
- More options;
- remove action when allowed.

The user can add or remove contradictory documents. No fixed count is hardcoded.

### Shared items section

Shows description, quantity, and unit from the main document.

Changes update the main document and all linked contradictory outputs.

### Review & export section

Provides:

- per-document validation status;
- totals;
- preview;
- export selection;
- output format selection;
- generation progress;
- clear success/failure result.

## 7. Pricing

Supported methods:

- copy main prices;
- percentage adjustment;
- fixed amount adjustment;
- copy another contradictory document;
- manual prices.

### Rounding

Configuration may support:

- no rounding;
- nearest 1;
- nearest 5;
- nearest 10;
- round upward;
- round downward.

The exact set should be configuration-driven where practical.

### Manual overrides

After applying a pricing rule, every generated price remains editable.

If a later action will overwrite manual changes, confirmation is required.

## 8. Totals

At minimum:

- total excluding tax;
- VAT rate;
- VAT amount;
- total including tax.

Use decimal arithmetic suitable for money. Do not rely on binary floating-point for persisted financial values.

Rounding order must be defined and tested. The preferred first-version rule is:

1. Calculate each line from quantity × unit price.
2. Round each line according to money precision.
3. Sum rounded line totals.
4. Calculate VAT from total excluding tax.
5. Round VAT according to money precision.
6. Add HT and VAT for TTC.

If the existing business process requires a different rule, Codex must expose the difference before implementation.

## 9. Validation

Validation must be contextual and actionable.

Do not show one generic “invalid document” message.

Examples:

- “Client is missing” → opens Overview client control.
- “Item 12 has no quantity” → scrolls/focuses item 12.
- “Document 2 has no company” → opens Document 2 card.
- “Document 3 has two missing prices” → opens its price editor.

## 10. Export

### PDF

- professional paginated output;
- repeated table header on continuation pages;
- no clipped descriptions;
- stable totals block;
- clear company and client identity;
- optional amount in words according to type/template;
- Draft watermark or label when generating a non-final preview.

### Excel

- editable values, not an image embedded in a sheet;
- readable column widths;
- formulas where safe and useful;
- company/client/document information in cells;
- item table;
- totals;
- one workbook per document in the first version unless a reviewed design approves a combined workbook.

## 11. Search and history

Normal documents and contradictory sets must be searchable separately or through a combined view with type indicators.

Useful search fields:

- client name;
- official number;
- internal draft identifier;
- document type;
- issuing company;
- created/modified date;
- draft/final status.

## 12. Settings

### Companies

CRUD with active/inactive status. Prevent destructive deletion when referenced; prefer archive/inactive.

### Clients

CRUD with duplicate-awareness where reasonable.

### Document types

CRUD for names, titles, numbering, VAT behavior, notes, template compatibility, and active state.

### Templates

Manage active templates and compatibility. Template visual editing is not required unless separately approved.

### Pricing profiles

Reusable named rules such as “+8%, nearest 10”. Profiles may be selected and then overridden per document.

### Units

Configurable list such as Unit, Piece, Meter, Lot, Kg, etc.

### VAT and numbering

Defaults must be configurable, with document-level override only when permitted.

## 13. Error handling

- autosave failure must be visible;
- export failure must identify which output failed;
- unsupported source file must not create a broken draft silently;
- corrupted local data must fail safely and preserve recoverable backup where possible;
- no destructive reset without explicit confirmation.
