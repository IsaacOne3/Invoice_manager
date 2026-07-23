# 05 — Document Generation Specification

## 1. Output goals

Generated files must look professional, remain readable across multiple pages, and preserve editable data in Excel.

The historical source invoice is evidence that real documents may contain:

- 29 or more rows;
- decimal quantities;
- long descriptions;
- HT, VAT, and TTC totals;
- amount in words;
- continuation onto multiple pages.

The application must comfortably support 40+ items.

## 2. Template system

A template definition must support:

- template identifier;
- display name;
- active state;
- supported document types;
- logo placement;
- company-header arrangement;
- client block arrangement;
- document metadata block;
- table columns;
- typography rules;
- footer content;
- totals arrangement;
- amount-in-words placement;
- page number behavior;
- repeated table headers;
- optional accent styling.

The first implementation may use code-defined templates stored behind a template registry. A full visual template editor is not required.

## 3. Required template diversity

Contradictory documents must be able to use meaningfully different professional templates. They must not look like the same document with only a logo replaced.

At least three approved layouts should eventually exist, for example:

- Modern structured;
- Classic administrative;
- Compact commercial.

The exact visual designs require Founder review before implementation acceptance.

## 4. Pagination

- Table header repeats on every continuation page.
- A row should not be split in a way that makes the description unreadable unless technically unavoidable.
- Totals stay together when possible.
- Footer and page number do not overlap item content.
- Long company or client information wraps safely.
- Empty whitespace is preferable to clipped content.

## 5. PDF data

A generated PDF may include:

- document title;
- official number or Draft marker;
- issue date;
- place;
- company logo and legal identity;
- client identity;
- reference/subject;
- item number;
- description;
- quantity;
- unit;
- unit price HT;
- line total HT;
- total HT;
- VAT rate and amount;
- total TTC;
- amount in words when enabled;
- notes;
- footer legal/bank details;
- page number.

## 6. Draft preview

When official fields are missing, preview may still be available if it is visibly marked as Draft.

A Draft preview must not be visually confusable with a final official document.

## 7. Excel output

Each exported workbook should contain:

- a clearly formatted document sheet;
- editable text and numeric cells;
- item rows as actual cells;
- formulas or computed values for line totals and totals where appropriate;
- numeric values stored as numbers;
- locale-aware display formatting;
- frozen table header if useful;
- sensible print area and page setup;
- no dependency on macros.

Optional later enhancement:

- a separate metadata sheet;
- a combined package workbook.

## 8. Filenames

Use safe filenames derived from:

- document type;
- client;
- official number or internal draft reference;
- company when needed;
- contradictory document index.

Sanitize characters not supported by the operating system.

Example pattern:

`Proforma_Wilaya-Alger_PF-2026-0008_Company-A.pdf`

## 9. Export package

When exporting several contradictory documents, produce one organized package:

```text
Contradictoires_Client_2026-07-23/
├─ Main/
│  ├─ Main-document.pdf
│  └─ Main-document.xlsx
├─ Document-1/
│  ├─ Company-A.pdf
│  └─ Company-A.xlsx
├─ Document-2/
│  ├─ Company-B.pdf
│  └─ Company-B.xlsx
└─ Document-3/
   ├─ Company-C.pdf
   └─ Company-C.xlsx
```

A ZIP archive may be used when appropriate to the platform.

## 10. Determinism and testing

Given the same saved snapshots, items, prices, template version, and generation version, output calculations must be deterministic.

Automated tests must cover:

- decimal quantities;
- long descriptions;
- 1, 40, and 100 rows;
- page continuation;
- VAT totals;
- rounding methods;
- missing optional fields;
- Draft marker;
- safe filenames;
- Excel numeric cell types;
- export of multiple contradictory documents.
