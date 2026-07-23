# 01 — Product Definition

## 1. Product purpose

Build a private internal document-generation application for the Founder’s father and accountant.

The application must support two distinct jobs:

1. Create one normal commercial document.
2. Create a set of contradictory commercial documents from one already-created main document.

The product is not currently intended for public sale. It should still be built cleanly enough to remain maintainable and configurable.

## 2. Primary users

The primary users are accountants and business staff, commonly aged around 40–50 or older, who need:

- clear language;
- large readable controls;
- familiar document concepts;
- low screen clutter;
- strong save-and-resume behavior;
- predictable PDF and Excel output;
- minimal repeated data entry.

The interface must not assume advanced technical knowledge.

## 3. Core product concepts

### 3.1 Normal commercial document

A standalone document such as:

- Invoice;
- Proforma invoice;
- Quotation;
- or another configured document type.

The system must not hardcode only these types. They are starter defaults.

### 3.2 Main document

The normal commercial document used as the source of truth for a contradictory set.

It supplies shared information such as:

- client;
- item descriptions;
- quantities;
- units;
- main prices;
- document type;
- relevant reference information.

### 3.3 Contradictory set

A saved workspace linked to one main document. It contains one or more contradictory documents.

Each contradictory document inherits the shared commercial content but can define its own:

- issuing company/header;
- document template/layout;
- unit prices;
- pricing rule;
- numbering/date/place/reference/note when needed.

### 3.4 Configured company

A reusable issuing-company profile. The Founder currently expects at least two companies, but the application must not hardcode a fixed number.

A company profile may contain:

- legal name;
- trading name;
- logo;
- activity/subtitle;
- address;
- city/place;
- phone/email;
- tax and registration identifiers;
- bank details;
- default document template;
- default VAT behavior;
- active/inactive state.

### 3.5 Client

A reusable recipient profile. A client may be selected from saved clients or entered during document creation.

### 3.6 Document type

A configurable definition that may include:

- display name;
- printed title;
- internal code;
- numbering prefix and sequence behavior;
- whether VAT is shown;
- whether amount in words is shown;
- default notes;
- allowed templates;
- active/inactive state;
- whether manual numbering is allowed.

### 3.7 Template

A professional printed layout used to generate PDF and Excel output.

The uploaded historical invoice demonstrates data shape and operational reality, not the desired design quality. The new templates must be professionally redesigned.

## 4. Product principles

1. **Choose the job first.** Normal document creation and contradictory creation are separate paths.
2. **The main document is the shared truth.** Contradictory creation must not ask the user to re-enter the same client, descriptions, quantities, or units.
3. **Do not force unknown official information early.** Number and date may remain unset while work continues.
4. **Long item entry is a workspace, not a wizard step.** Forty or more rows must be comfortable and resumable.
5. **No long steppers.** Use a short setup flow, then persistent workspaces.
6. **Only show relevant controls.** Advanced or rarely changed details remain behind “More options”.
7. **Autosave is mandatory.** Users must be able to stop today and continue later.
8. **Final export is stricter than draft work.** Missing official information may block final output without blocking preparation.
9. **All generated documents remain editable.** PDF is final presentation; Excel is an editable operational output.
10. **Configuration replaces hardcoding.** Companies, types, templates, VAT, numbering, units, and pricing profiles are data.

## 5. First-version scope

### Included

- Home screen;
- normal document creation;
- saved document search/open/duplicate;
- saved clients;
- saved companies;
- configurable document types;
- item entry for long documents;
- autosave and resume;
- source PDF/image reference display;
- contradictory-set creation from a main document;
- configurable number of contradictory files;
- per-file company/header;
- per-file template;
- derived or manual prices;
- configurable rounding;
- review and validation;
- PDF generation;
- editable Excel generation;
- basic settings management;
- backup/export of application data if repository architecture makes this reasonable.

### Deferred

- OCR as a required dependency;
- AI extraction as a required dependency;
- automatic legal compliance claims;
- online multi-user collaboration;
- customer-facing access;
- payment collection;
- cloud synchronization unless separately approved;
- advanced accounting integration;
- public SaaS concerns;
- mobile-first interface.

## 6. Success criteria

The product succeeds when an accountant can:

1. Create a normal document with 40+ items without losing work.
2. Close and reopen it later.
3. Generate a contradictory set from that document without re-entering shared information.
4. Configure each contradictory file’s company, layout, and prices.
5. Preview every file.
6. Export all required PDFs and editable Excel files.
7. Understand what is missing before final export.
8. Complete the entire workflow without needing technical help.
