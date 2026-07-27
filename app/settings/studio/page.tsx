"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { generateInvoicePdf } from "../../lib/invoice-pdf";

type LayoutBlock = {
  id: string;
  block_type: string;
  region: string;
  sort_order: number;
  is_visible: boolean;
  label_text: string | null;
};
type Layout = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  version_id: string;
  version_number: number;
  blocks: LayoutBlock[];
  created_at: string;
  updated_at: string;
};
type Company = { id: string; legal_name: string; default_layout_id: string | null; custom_identifiers: Array<{ label: string; value: string; is_active: boolean }> };
type DocumentSummary = { id: string; internal_draft_reference: string; document_type_snapshot: { name?: string }; company_snapshot: { legal_name?: string } };
type Draft = {
  id: string;
  internal_draft_reference: string;
  document_type_snapshot: { name?: string; printed_title?: string };
  company_snapshot: { legal_name?: string; trading_name?: string; activity_label?: string; city?: string; custom_identifiers?: Array<{ label: string; value: string; is_active: boolean }> };
  client_snapshot: { name?: string } | null;
  official_number: string | null;
  issue_date: string | null;
  place: string | null;
  reference: string | null;
  note: string | null;
  currency_code: string;
  total_ht: string;
  vat_amount: string;
  total_ttc: string;
  items: Array<{ description: string; quantity: string; unit_snapshot: { abbreviation?: string } | null; unit_price_ht: string | null; line_total_ht: string | null }>;
};

const blockLabels: Record<string, string> = {
  company_header: "Company header",
  document_identity: "Document title and details",
  client: "Client",
  items_table: "Items table",
  totals: "Totals",
  notes: "Notes",
  footer: "Footer",
};

function starterBlocks(): LayoutBlock[] {
  return Object.keys(blockLabels).map((block_type, sort_order) => ({
    id: crypto.randomUUID(),
    block_type,
    region: block_type === "items_table" ? "body" : "header",
    sort_order,
    is_visible: true,
    label_text: null,
  }));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function pdfBlob(bytes: Uint8Array) {
  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: "application/pdf" });
}

export default function StudioPage() {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("Loading Studio…");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        invoke<Layout[]>("list_layouts"),
        invoke<Company[]>("list_companies", { activeOnly: true }),
        invoke<DocumentSummary[]>("list_documents"),
      ]).then(([loadedLayouts, loadedCompanies, loadedDocuments]) => {
        setLayouts(loadedLayouts);
        setCompanies(loadedCompanies);
        setDocuments(loadedDocuments);
        setLayout(loadedLayouts[0] || null);
        setCompanyId(loadedCompanies[0]?.id || "");
        setDocumentId(loadedDocuments[0]?.id || "");
        setStatus("Ready");
      }).catch((loadError) => {
        setError(errorMessage(loadError));
        setStatus("Open the Windows app to use the Studio");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!documentId) return;
    void invoke<Draft | null>("get_document", { id: documentId }).then((loaded) => setDraft(loaded)).catch((loadError) => setError(errorMessage(loadError)));
  }, [documentId]);

  const selectedBlock = layout?.blocks.find((block) => block.id === selectedBlockId) || layout?.blocks[0] || null;
  const sortedBlocks = useMemo(() => layout ? [...layout.blocks].sort((left, right) => left.sort_order - right.sort_order) : [], [layout]);

  async function createLayout() {
    const newLayout: Layout = { id: "", name: "New invoice layout", description: "Controlled commercial document layout", is_active: true, version_id: "", version_number: 0, blocks: starterBlocks(), created_at: "", updated_at: "" };
    try {
      const saved = await invoke<Layout>("save_layout", { layout: newLayout });
      setLayouts((current) => [...current, saved]);
      setLayout(saved);
      setSelectedBlockId(saved.blocks[0]?.id || "");
      setStatus("Layout created");
    } catch (saveError) {
      setError(errorMessage(saveError));
    }
  }

  async function saveLayout() {
    if (!layout) return;
    try {
      const saved = await invoke<Layout>("save_layout", { layout });
      setLayout(saved);
      setLayouts((current) => current.map((candidate) => candidate.id === saved.id ? saved : candidate));
      setStatus("Saved as version " + saved.version_number);
    } catch (saveError) {
      setError(errorMessage(saveError));
    }
  }

  async function assignLayout() {
    if (!layout || !companyId) return;
    try {
      await invoke("assign_company_layout", { companyId, layoutId: layout.id });
      setCompanies((current) => current.map((company) => company.id === companyId ? { ...company, default_layout_id: layout.id } : company));
      setStatus("Assigned to company");
    } catch (assignError) {
      setError(errorMessage(assignError));
    }
  }

  function updateBlock(blockId: string, changes: Partial<LayoutBlock>) {
    if (!layout) return;
    setLayout({ ...layout, blocks: layout.blocks.map((block) => block.id === blockId ? { ...block, ...changes } : block) });
    setStatus("Unsaved changes");
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    if (!layout) return;
    const blocks = [...layout.blocks].sort((left, right) => left.sort_order - right.sort_order);
    const index = blocks.findIndex((block) => block.id === blockId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    setLayout({ ...layout, blocks: blocks.map((block, sort_order) => ({ ...block, sort_order })) });
    setStatus("Unsaved changes");
  }

  async function preview() {
    if (!draft || !layout) return;
    try {
      const bytes = await generateInvoicePdf({
        companyName: draft.company_snapshot.trading_name || draft.company_snapshot.legal_name || "Company",
        companyActivity: draft.company_snapshot.activity_label,
        companyAddress: draft.company_snapshot.city,
        companyIdentifiers: (draft.company_snapshot.custom_identifiers || []).filter((identifier) => identifier.is_active),
        documentType: draft.document_type_snapshot.printed_title || draft.document_type_snapshot.name || "Invoice",
        internalReference: draft.internal_draft_reference,
        clientName: draft.client_snapshot?.name,
        officialNumber: draft.official_number,
        issueDate: draft.issue_date,
        place: draft.place,
        reference: draft.reference,
        note: draft.note,
        currency: draft.currency_code,
        totalHt: draft.total_ht,
        vatAmount: draft.vat_amount,
        totalTtc: draft.total_ttc,
        items: draft.items.map((item) => ({ description: item.description, quantity: item.quantity, unit: item.unit_snapshot?.abbreviation || "-", unitPrice: item.unit_price_ht || "", lineTotal: item.line_total_ht || "-" })),
        layout,
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(pdfBlob(bytes)));
      setStatus("Preview updated");
    } catch (previewError) {
      setError(errorMessage(previewError));
    }
  }

  return (
    <div className="studio-shell">
      <header className="studio-header">
        <Link className="back-link" href="/settings">← Settings</Link>
        <div><p className="section-kicker">Controlled document design</p><h1>Commercial Document Studio</h1><p className="settings-intro">Compose reliable invoice layouts from supported blocks and preview them with real saved data.</p></div>
        <span className="storage-status storage-status-ready">{status}</span>
      </header>
      {error && <div className="settings-error" role="alert">{error}</div>}
      <main className="studio-grid">
        <aside className="studio-panel">
          <div className="studio-panel-heading"><h2>Layouts</h2><button className="form-heading button" onClick={() => void createLayout()} type="button">New</button></div>
          {layouts.length === 0 ? <p className="settings-empty">No saved layouts yet. Create the first controlled layout.</p> : <div className="studio-layout-list">{layouts.map((candidate) => <button className={layout?.id === candidate.id ? "studio-layout-option studio-layout-option-active" : "studio-layout-option"} key={candidate.id} onClick={() => setLayout(candidate)} type="button"><strong>{candidate.name}</strong><span>Version {candidate.version_number}</span></button>)}</div>}
          {layout && <div className="studio-assignment"><label>Company default<select value={companyId} onChange={(event) => setCompanyId(event.target.value)}><option value="">Choose company</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.legal_name}</option>)}</select></label><button className="secondary-button" onClick={() => void assignLayout()} type="button">Assign layout</button></div>}
          {layout && <div className="studio-document-choice"><label>Preview saved invoice<select value={documentId} onChange={(event) => setDocumentId(event.target.value)}><option value="">Choose draft</option>{documents.map((document) => <option key={document.id} value={document.id}>{document.internal_draft_reference} · {document.document_type_snapshot.name || "Document"}</option>)}</select></label></div>}
        </aside>
        <section className="studio-panel studio-preview-panel">
          <div className="studio-panel-heading"><div><p className="section-kicker">Real-data preview</p><h2>{layout?.name || "Create a layout"}</h2></div>{layout && <button className="primary-button" onClick={() => void preview()} type="button">Refresh preview</button>}</div>
          {previewUrl ? <iframe className="studio-preview-frame" src={previewUrl} title="Studio invoice preview" /> : <div className="studio-empty-preview">Select a saved invoice and refresh the preview.</div>}
        </section>
        <aside className="studio-panel">
          <div className="studio-panel-heading"><h2>Blocks</h2>{layout && <button className="primary-button" onClick={() => void saveLayout()} type="button">Save version</button>}</div>
          {layout && <div className="studio-properties studio-layout-properties"><label>Layout name<input value={layout.name} onChange={(event) => { setLayout({ ...layout, name: event.target.value }); setStatus("Unsaved changes"); }} /></label><label>Description<input value={layout.description || ""} onChange={(event) => { setLayout({ ...layout, description: event.target.value || null }); setStatus("Unsaved changes"); }} /></label></div>}
          {layout && <div className="studio-block-list">{sortedBlocks.map((block) => <button className={selectedBlock?.id === block.id ? "studio-block-option studio-block-option-active" : "studio-block-option"} key={block.id} onClick={() => setSelectedBlockId(block.id)} type="button"><span>{blockLabels[block.block_type] || block.block_type}</span><small>{block.is_visible ? "Visible" : "Hidden"}</small></button>)}</div>}
          {selectedBlock && <div className="studio-properties"><h3>{blockLabels[selectedBlock.block_type]}</h3><label className="check-row"><input type="checkbox" checked={selectedBlock.is_visible} onChange={(event) => updateBlock(selectedBlock.id, { is_visible: event.target.checked })} /> Visible</label><label>Label override<input value={selectedBlock.label_text || ""} onChange={(event) => updateBlock(selectedBlock.id, { label_text: event.target.value || null })} placeholder="Uses document default" /></label><div className="studio-order-actions"><button className="secondary-button" onClick={() => moveBlock(selectedBlock.id, -1)} type="button">Move up</button><button className="secondary-button" onClick={() => moveBlock(selectedBlock.id, 1)} type="button">Move down</button></div></div>}
        </aside>
      </main>
    </div>
  );
}
