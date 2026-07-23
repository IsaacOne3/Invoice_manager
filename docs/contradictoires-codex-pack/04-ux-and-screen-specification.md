# 04 — UX and Screen Specification

## 1. General UX direction

The interface is desktop-first and optimized for accountants who value clarity over novelty.

Use:

- large readable typography;
- strong contrast;
- clear primary buttons;
- generous hit areas;
- restrained color usage;
- short labels;
- familiar tables and forms;
- visible autosave state;
- one dominant task per screen.

Avoid:

- explanatory paragraphs for obvious screens;
- dense dashboards;
- permanent sidebars unless later proven necessary;
- small icon-only actions for important operations;
- long steppers;
- modal chains;
- hidden destructive actions;
- decorative complexity.

## 2. Home

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Commercial Documents                         FR ▾       Settings ⚙  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  What do you want to do?                                                     │
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐                      │
│  │ New document           │  │ Create contradictoires │                      │
│  │ Create one invoice,    │  │ Generate alternatives │                      │
│  │ proforma, or quotation │  │ from a main document  │                      │
│  └────────────────────────┘  └────────────────────────┘                      │
│                                                                              │
│  ┌────────────────────────┐                                                  │
│  │ Open existing document │                                                  │
│  │ Continue saved work    │                                                  │
│  └────────────────────────┘                                                  │
│                                                                              │
│  Recent documents                                                           │
│  ...                                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

Settings may appear in the top bar or as a smaller fourth card. It must not visually compete with the two creation jobs.

## 3. Normal document setup

Use a short four-part setup:

```text
Type  →  Company  →  Start  →  Client
```

No document-details step appears here.

### Type

Selectable cards for active configured document types. Continue is disabled until selection.

### Company

Selectable company cards with concise identity only. Do not show all legal and bank data.

### Start

Two cards:

- Create from scratch
- Use an existing document as reference

When reference mode is chosen, show the file control directly below.

### Client

Segmented switcher:

```text
[ Choose saved client ] [ Enter new client ]
```

Only the chosen panel is visible.

The final button says `Create document`, not `Continue`.

## 4. Document workspace

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Commercial Documents                  Home  Documents  Settings       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Proforma — Draft                                                             │
│ Company · Client                                      Saved a few seconds ago│
│                                                                              │
│ [Overview]  [Items]  [Review & export]                                      │
│              ─────                                                           │
│                                                                              │
│ 42 items                                         [Show source document]      │
│                                                                              │
│ ┌────┬──────────────────────────┬──────────┬──────┬──────────┬─────────────┐ │
│ │ N° │ Description              │ Quantity │ Unit │ PU HT    │ Total HT    │ │
│ ├────┼──────────────────────────┼──────────┼──────┼──────────┼─────────────┤ │
│ │ 1  │ ...                                                                  │
│ └────┴──────────────────────────┴──────────┴──────┴──────────┴─────────────┘ │
│                                                                              │
│ [+ Add item]                                                                 │
│                                                                              │
│                                        Total HT                              │
│                                        VAT                                   │
│                                        Total TTC                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Save and close]                            [Review & export →]               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Items table

- full-width working surface;
- sticky header;
- description column expands most;
- totals visible without requiring the user to reach the final row where practical;
- row action appears on hover/focus but remains discoverable;
- keyboard focus styling is strong;
- invalid row fields are highlighted locally;
- add row remains easy after 40+ rows.

### Source preview

When present, use a resizable or hideable split view. Do not permanently compress the table.

### Overview

Use a compact form. Number and date controls follow this pattern:

```text
Document number
[ PF-2026-0008 ]
☐ Assign later
```

```text
Issue date
[ 23 / 07 / 2026 ]
☐ Set later
```

When checked, disable the input and show a clear placeholder.

### Review & export

Show:

- document preview;
- concise missing-information list;
- PDF checkbox/action;
- Excel checkbox/action;
- Generate files.

## 5. Main-document selection for contradictoires

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Create contradictoires                                                       │
│                                                                              │
│ [ Choose an existing document ]  [ Create a new document ]                  │
│                                                                              │
│ Search by client, number, or date                                            │
│ [                                                                    ]       │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Proforma · Client name                                                │  │
│ │ 42 items · Total · Date or Draft                              ○        │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ [Cancel]                                                [Continue →]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

Creating a new main document enters the exact short normal-document setup, then its Document workspace. The user can start contradictoires from that workspace.

## 6. Contradictoires workspace

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Commercial Documents                  Home  Documents  Settings       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Contradictoires — Client name                                                │
│ Based on: Proforma · 42 items                          Saved just now         │
│                                                                              │
│ [Documents]  [Shared items]  [Review & export]                              │
│  ─────────                                                                   │
│                                                                              │
│ Required files: [ 3 ▾ ]                            [+ Add document]          │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Document 1                                                            │  │
│ │ Company       [ Company A                                      ▾ ]     │  │
│ │ Template      [ Modern                                         ▾ ]     │  │
│ │ Price method  [ Main prices + 8%                               ▾ ]     │  │
│ │ Total         5 200 000 DZD                                            │  │
│ │                                                                        │  │
│ │ [Edit prices] [More options]                    [Preview document]     │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Document 2 ...                                                        │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Save and close]                            [Review all files →]              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Card behavior

The card contains the three common decisions directly:

- Company
- Template
- Price method

Do not force separate pages for them.

`More options` expands inline. It does not open another stepper.

### Price editor

Use a full-page workspace, drawer, or large modal only after visual testing. It must provide enough width for 40+ rows.

Required columns:

- item number;
- description;
- main price;
- new price;
- line total.

Top controls:

- price method;
- percentage or fixed amount input when relevant;
- rounding;
- Apply to all items.

### Shared items

Use the same long-table quality as the main Document workspace, but only description, quantity, and unit are editable.

### Review & export

Show one document summary per file. A user must be able to understand which file has a problem without opening all of them.

## 7. Empty, loading, and error states

Every screen must have intentional states for:

- no saved documents;
- no clients;
- no configured companies;
- no active document types;
- no items yet;
- source loading;
- save in progress;
- save failed;
- export in progress;
- export failed;
- missing required configuration.

The empty state should provide the next real action, not decorative text.

## 8. Language and formatting

English may be used during development, but all visible strings should be centralized for later French support.

Use locale-aware formatting for:

- dates;
- decimal quantities;
- currency;
- thousands separators.

Do not bake formatted strings into persisted numeric values.
