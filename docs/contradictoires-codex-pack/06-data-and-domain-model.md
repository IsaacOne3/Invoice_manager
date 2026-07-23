# 06 — Data and Domain Model

This is a conceptual model. Codex must adapt naming and persistence details to repository truth.

## 1. CompanyProfile

- id
- legalName
- tradingName
- activityLabel
- logoAssetId
- address
- city
- phone
- email
- taxIdentifiers
- registrationIdentifiers
- bankDetails
- defaultTemplateId
- defaultVatProfileId
- isActive
- createdAt
- updatedAt

## 2. ClientProfile

- id
- name
- address
- identificationNumber
- phone
- email
- isActive
- createdAt
- updatedAt

## 3. DocumentTypeDefinition

- id
- name
- printedTitle
- code
- numberingPrefix
- numberingMode
- allowManualNumber
- showVat
- showAmountInWords
- defaultNote
- compatibleTemplateIds
- requiredClientFields
- requiredFinalFields
- isActive
- createdAt
- updatedAt

## 4. TemplateDefinition

- id
- name
- version
- rendererKey
- compatibleDocumentTypeIds
- isActive
- createdAt
- updatedAt

## 5. UnitDefinition

- id
- label
- abbreviation
- isActive
- sortOrder

## 6. PricingProfile

- id
- name
- method
- adjustmentValue
- roundingMode
- roundingIncrement
- isActive

## 7. CommercialDocument

- id
- internalDraftReference
- status
- documentTypeSnapshot
- companySnapshot
- clientSnapshot
- officialNumber
- issueDate
- place
- reference
- note
- vatRate
- sourceAssetId
- currencyCode
- items
- totals
- createdAt
- updatedAt
- finalizedAt

Status should not imply legal finality without explicit rules. A minimal status set may be Draft and ReadyForExport, with export history stored separately.

## 8. CommercialDocumentItem

- id
- documentId
- sortOrder
- description
- quantity
- unitSnapshot
- unitPriceHt
- lineTotalHt
- createdAt
- updatedAt

Use decimal types for quantity and money.

## 9. ContradictorySet

- id
- mainDocumentId
- workingTitle
- status
- contradictoryDocuments
- createdAt
- updatedAt

## 10. ContradictoryDocument

- id
- contradictorySetId
- sortOrder
- label
- companySnapshot
- templateSnapshot
- pricingConfiguration
- itemPrices
- documentOverrides
- totals
- createdAt
- updatedAt

## 11. ContradictoryItemPrice

- id
- contradictoryDocumentId
- sourceItemId
- unitPriceHt
- isManualOverride
- lineTotalHt

The source item description, quantity, and unit remain owned by the main document.

## 12. DocumentOverrides

- officialNumber
- issueDateMode
- customIssueDate
- placeMode
- customPlace
- referenceMode
- customReference
- noteMode
- customNote

Modes may represent inherit/default/custom/unset behavior.

## 13. ExportRecord

- id
- sourceType
- sourceId
- generatedAt
- selectedFormats
- selectedDocumentIds
- generatorVersion
- outputMetadata
- success/failure status
- error summary when failed

## 14. Asset

- id
- originalFilename
- mimeType
- size
- storageLocation
- createdAt

Source PDF/image and company logos use assets.

## 15. Snapshot rule

Profiles are reusable configuration. Documents contain snapshots.

A snapshot should include only information needed to reproduce the document, not every profile field blindly.

## 16. Derived data

Persisting totals may be useful for fast display and audit, but calculations must be reproducible from source values.

Codex must define one consistent strategy:

- recompute on write and persist;
- or compute on read with versioned calculation logic.

Do not mix strategies unpredictably.
