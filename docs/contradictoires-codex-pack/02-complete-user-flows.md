# 02 — Complete User Flows

This document is deliberately explicit. Codex must not replace expanded branches with shorthand such as “follow the normal flow”.

# A. Application entry

Open app
↓
Load local application data and configuration
↓
Was the previous session interrupted while editing a document?
├─ Yes
│  → Preserve the saved draft
│  → Show it in Recent documents
│  → Do not force an automatic redirect
│
└─ No
   → Continue normally
↓
Show Home
→ New document
→ Create contradictoires
→ Open existing document
→ Settings
→ Recent documents when available

# B. Create one normal commercial document

From Home
↓
Press New document
↓
Show active configured document types
→ Name
→ Short description when useful
→ Example number when numbering is configured
↓
Select one document type
↓
Continue
↓
Show active configured issuing companies
→ Logo
→ Company name
→ Activity or subtitle
→ City/address summary
→ Short registration summary
→ Default template name
↓
Select one issuing company
↓
Continue
↓
Choose starting method
├─ Create from scratch
│  → Continue without a source file
│
└─ Use an existing document as reference
   → Choose PDF or image
   → Validate supported file type and size
   → Show selected filename
   → Allow Replace or Remove
   → Continue with the source attached to the draft
↓
Choose client method
├─ Choose saved client
│  → Search by name or identifying information
│  → Show saved client results
│  → Select one client
│
└─ Enter new client
   → Enter client name
   → Optionally enter address
   → Optionally enter identification number
   → Optionally enter phone
   → Optionally enter email
   → Choose whether to save the client for future use
↓
Press Create document
↓
Create a persistent draft
→ Save selected document type snapshot
→ Save selected company snapshot
→ Save selected client snapshot
→ Save source-file reference when supplied
→ Generate internal draft identifier
→ Do not require official document number
→ Do not require issue date
↓
Open Document workspace on Items
↓
Enter items
→ Add description
→ Add quantity
→ Optionally choose unit
→ Add main unit price excluding tax
→ Calculate line total automatically
→ Recalculate totals after every valid change
→ Autosave changes
↓
Does the user need to stop?
├─ Yes
│  → Press Save and close, or close after autosave confirmation
│  → Return Home
│  → Show draft in Recent documents
│  → Later open the same saved draft
│
└─ No
   → Continue editing
↓
Open Overview when needed
→ View or change document type subject to compatibility rules
→ View or change issuing company with confirmation
→ View or change client
→ Enter document number now or leave it unassigned
→ Enter issue date now or leave it unset
→ Enter place
→ Enter reference or subject
→ Enter note
→ View, replace, or remove source file
↓
Open Review & export
↓
Validate document
→ At least one valid item exists
→ Every item has a description
→ Every item has a valid positive quantity
→ Every item has a valid unit price when required
→ Required client information exists
→ Required official fields for final export exist
→ Totals calculate successfully
↓
Are final-export requirements missing?
├─ Yes
│  → Show one concise list of missing information
│  → Provide direct action to the relevant field or item
│  → Allow returning to editing
│  → Allow draft preview only when clearly marked Draft
│  → Do not generate an apparently final official file
│
└─ No
   → Continue
↓
Preview generated document
↓
Choose output
→ PDF
→ Editable Excel
→ Both
↓
Generate selected files
↓
Save export record with timestamp and output metadata
↓
Allow Download/Open folder according to platform capability

# C. Open an existing normal document

From Home
↓
Press Open existing document
↓
Show saved documents
→ Search by client
→ Search by number
→ Search by internal draft reference
→ Filter by document type
→ Filter by draft/final status
→ Sort by most recently modified by default
↓
Select document
↓
Open Document workspace
↓
Allow user to:
→ Continue editing
→ Assign missing official details
→ Preview
→ Export again
→ Duplicate as a new document
→ Start contradictoires from this document

# D. Duplicate a normal document

From an existing Document workspace
↓
Press Duplicate
↓
Create a new draft copy
→ Copy document type
→ Copy company as a new snapshot
→ Copy client as a new snapshot
→ Copy items, quantities, units, and prices
→ Do not copy final export identity as authoritative
→ Clear or regenerate official number according to type rules
→ Allow issue date to be cleared or defaulted according to approved behavior
↓
Open the new draft

# E. Create contradictoires from Home

From Home
↓
Press Create contradictoires
↓
Show main-document selection
→ Choose existing document
→ Create new document
↓
Which path did the user choose?
├─ Choose existing document
│  → Search saved documents by client, number, internal draft reference, type, status, or date
│  → Select one document
│  → Load selected document
│
└─ Create new document
   → Show active configured document types
   → Select one document type
   → Show active configured issuing companies
   → Select one issuing company
   → Choose starting method
   ├─ Create from scratch
   │  → Continue without a source file
   │
   └─ Use an existing document as reference
      → Choose PDF or image
      → Validate file
      → Attach source reference
   → Choose client method
   ├─ Choose saved client
   │  → Search saved clients
   │  → Select one client
   │
   └─ Enter new client
      → Enter client name
      → Optionally enter address, identification number, phone, and email
      → Choose whether to save client
   → Create persistent main-document draft
   → Open Document workspace on Items
   → Add descriptions
   → Add quantities
   → Add optional units
   → Add main prices
   → Autosave
   → Press Create contradictoires from this document
↓
Validate selected main document for contradictory creation
→ Client exists
→ At least one item exists
→ Every shared item has description
→ Every shared item has valid quantity
→ Units may be absent unless configuration requires them
→ Main price exists for every item when pricing rules depend on it
↓
Is required shared information missing?
├─ Client missing
│  → Show Client missing state
│  → Choose saved client or enter new client
│  → Save client into the main document
│  → Revalidate
│
├─ Items missing
│  → Open main document Items workspace
│  → Add items
│  → Save automatically
│  → Return to contradictory creation
│  → Revalidate
│
├─ Description or quantity missing
│  → Open affected rows in main document Items workspace
│  → Complete missing values
│  → Save automatically
│  → Return and revalidate
│
├─ Main prices missing but required
│  → Open affected rows in main document Items workspace
│  → Complete main prices
│  → Save automatically
│  → Return and revalidate
│
└─ Shared information complete
   → Continue
↓
Create saved contradictory-set workspace linked to the main document
↓
Open Contradictoires workspace on Documents

# F. Configure a contradictory set

Open Contradictoires workspace
↓
Show persistent workspace header
→ Set name or generated working title
→ Main document reference
→ Client
→ Item count
→ Saved state
↓
Show workspace sections
→ Documents
→ Shared items
→ Review & export
↓
Open Documents section
↓
Choose required number of contradictory documents
→ Default may come from settings
→ User can add another document
→ User can remove a document with confirmation
↓
For each contradictory document card
→ Choose issuing company/header
→ Choose template/layout
→ Choose price method
→ Show Preview document
→ Show Edit prices
→ Show More options
↓
Configure issuing company
→ Select from active configured companies
→ Store a snapshot for this contradictory document
→ Do not alter the source main document company
↓
Configure template
→ Select from templates compatible with the chosen document type
→ Immediately update preview data
↓
Configure price method
├─ Copy main prices
│  → Copy each main unit price
│
├─ Percentage adjustment
│  → Enter positive or negative percentage if permitted
│  → Choose rounding rule
│  → Calculate proposed prices
│
├─ Fixed adjustment per item
│  → Enter fixed amount
│  → Choose rounding rule
│  → Calculate proposed prices
│
├─ Copy another contradictory document
│  → Select another document in this set
│  → Copy its current prices
│
└─ Manual prices
   → Keep or open editable price table
↓
Applying a derived rule would overwrite manually changed prices. Are manual changes present?
├─ Yes
│  → Warn clearly
│  → Choose Cancel or Apply and overwrite
│
└─ No
   → Apply directly
↓
Open Edit prices
→ Show description
→ Show quantity
→ Show main price
→ Show editable contradictory unit price
→ Show calculated line total
→ Allow manual editing after automatic calculation
→ Mark manually overridden rows subtly
→ Autosave
↓
Open More options only when needed
→ Document number: assign now or later
→ Issue date: use main date, set a different date, or leave unset
→ Place: company default, main document value, or custom
→ Reference: inherit or custom
→ Note: inherit, default, or custom
↓
Repeat for every required contradictory document

# G. Edit shared items from a contradictory set

From Contradictoires workspace
↓
Open Shared items
↓
Show inherited shared rows
→ Description
→ Quantity
→ Unit
↓
Explain through placement and labels, not a long paragraph, that edits affect the main document and all linked contradictory documents
↓
Edit shared information
↓
Save changes into the main document
↓
Propagate changed description, quantity, or unit into every contradictory document
↓
Recalculate every affected line total
↓
Preserve each contradictory document’s unit prices unless the user applies a new pricing rule

# H. Review and export a contradictory set

From Contradictoires workspace
↓
Open Review & export
↓
Show one summary card per output document
→ Main document when included in the export package
→ Contradictory document 1
→ Contradictory document 2
→ Additional contradictory documents
↓
For each document show
→ Company
→ Template
→ Item count
→ HT total
→ VAT
→ TTC total
→ Missing-information status
→ Preview action
↓
Validate shared information
→ Client exists
→ Items are complete
→ Quantities are valid
↓
Validate each contradictory document
→ Company selected
→ Template selected
→ Every required price exists
→ Number and date exist when required for final output
→ Company legal fields required by the selected template exist
→ Totals calculate successfully
↓
Are any documents invalid?
├─ Yes
│  → Show issues grouped by document
│  → Each issue links directly to the relevant card, field, or price row
│  → Allow draft preview with a visible Draft mark where appropriate
│  → Block final generation only for affected outputs or for the package according to approved export policy
│
└─ No
   → Continue
↓
Preview any document individually
↓
Choose export contents
→ Main document optional according to user selection
→ All contradictory documents selected by default
↓
Choose formats
→ PDF
→ Editable Excel
→ Both
↓
Generate files
↓
When several files are generated
→ Place them in one clearly named export folder or archive according to platform capability
→ Use safe, readable filenames
→ Avoid filename collisions
↓
Save export record
↓
Keep contradictory set editable for later regeneration

# I. Reopen a contradictory set

From Home or Open existing
↓
Choose Contradictory sets
↓
Search by client, main document, date, or status
↓
Select set
↓
Open Contradictoires workspace
↓
Continue configuration, review, or export

# J. Settings

From Home
↓
Press Settings
↓
Show settings hub
→ Companies
→ Clients
→ Document types
→ Templates
→ Pricing profiles
→ VAT, numbering, units, export, language, and backup
↓
Open one settings area at a time
↓
Changes to reusable profiles must not silently rewrite historical snapshots in existing documents
