"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useParams, useRouter } from "next/navigation";
import { generateInvoicePdf, InvoicePdfData } from "../../lib/invoice-pdf";

type Unit = { id: string; label: string; abbreviation: string; is_active: boolean; sort_order: number };
type Client = { id: string; name: string; address: string | null; phone: string | null; email: string | null; is_active: boolean };
type ItemRow = { id: string | null; sort_order: number; description: string; quantity: string; unitId: string; unit_snapshot: Record<string, unknown> | null; unit_price_ht: string };
type Draft = {
  id: string;
  internal_draft_reference: string;
  status: string;
  company_snapshot: { legal_name?: string; trading_name?: string; activity_label?: string; city?: string };
  document_type_snapshot: { name?: string; printed_title?: string };
  client_snapshot: unknown;
  official_number: string | null;
  issue_date: string | null;
  place: string | null;
  reference: string | null;
  note: string | null;
  vat_rate: string;
  currency_code: string;
  total_ht: string;
  vat_amount: string;
  total_ttc: string;
  items: Array<{ id: string; sort_order: number; description: string; quantity: string; unit_snapshot: Record<string, unknown> | null; unit_price_ht: string | null; line_total_ht: string | null }>;
};

const blankRow = (): ItemRow => ({ id: null, sort_order: 0, description: "", quantity: "1", unitId: "", unit_snapshot: null, unit_price_ht: "" });

function decimalParts(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return [BigInt(`${whole}${fraction}`), fraction.length] as const;
}

function lineTotal(quantity: string, price: string) {
  const quantityParts = decimalParts(quantity);
  const priceParts = decimalParts(price);
  if (!quantityParts || !priceParts) return "—";
  const [product, scale] = [quantityParts[0] * priceParts[0], quantityParts[1] + priceParts[1]];
  const divisor = 10n ** BigInt(scale);
  const cents = scale > 2 ? (product * 100n + divisor / 2n) / divisor : product * 10n ** BigInt(2 - scale);
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}

function formatNumber(value: bigint) {
  return `${value / 100n}.${(value % 100n).toString().padStart(2, "0")}`;
}

function totals(rows: ItemRow[]) {
  let cents = 0n;
  rows.forEach((row) => {
    const value = lineTotal(row.quantity, row.unit_price_ht);
    if (value !== "—") {
      const [whole, fraction] = value.split(".");
      cents += BigInt(whole) * 100n + BigInt(fraction);
    }
  });
  return formatNumber(cents);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function pdfBlob(bytes: Uint8Array) {
  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: "application/pdf" });
}

export default function DocumentWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rows, setRows] = useState<ItemRow[]>([blankRow()]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"items" | "review">("items");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [pdfState, setPdfState] = useState("");
  const [pdfPath, setPdfPath] = useState("");
  const [saveState, setSaveState] = useState("Loading draft…");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        invoke<Draft | null>("get_document", { id: params.id }),
        invoke<Unit[]>("list_units", { activeOnly: true }),
        invoke<Client[]>("list_clients", { activeOnly: true }),
      ])
        .then(([loadedDraft, loadedUnits, loadedClients]) => {
          if (!loadedDraft) throw new Error("Draft could not be found.");
          setDraft(loadedDraft);
          setUnits(loadedUnits);
          setClients(loadedClients);
          setRows(loadedDraft.items.length === 0 ? [blankRow()] : loadedDraft.items.map((item) => ({
            id: item.id,
            sort_order: item.sort_order,
            description: item.description,
            quantity: item.quantity,
            unitId: typeof item.unit_snapshot?.id === "string" ? item.unit_snapshot.id : "",
            unit_snapshot: item.unit_snapshot,
            unit_price_ht: item.unit_price_ht ?? "",
          })));
          setSaveState("Saved locally");
        })
        .catch((loadError) => {
          setError(errorMessage(loadError));
          setSaveState("Could not load");
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  const totalHt = useMemo(() => totals(rows.filter((row) => row.description.trim())), [rows]);
  const currentVat = useMemo(() => {
    const total = decimalParts(totalHt);
    const rate = decimalParts(draft?.vat_rate ?? "0");
    if (!total || !rate) return "0.00";
    const cents = total[0] * rate[0] * 100n;
    const divisor = 10n ** BigInt(total[1] + rate[1]);
    return formatNumber((cents + divisor / 2n) / divisor);
  }, [draft?.vat_rate, totalHt]);
  const currentTtc = useMemo(() => {
    const ht = decimalParts(totalHt);
    const vat = decimalParts(currentVat);
    if (!ht || !vat) return "0.00";
    return formatNumber(ht[0] * 10n ** BigInt(2 - ht[1]) + vat[0] * 10n ** BigInt(2 - vat[1]));
  }, [currentVat, totalHt]);

  function updateRow(index: number, changes: Partial<ItemRow>) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...changes } : row));
    setSaveState("Unsaved changes");
  }

  function addRow(afterIndex?: number) {
    setRows((current) => {
      const index = afterIndex === undefined ? current.length : afterIndex + 1;
      const next = [...current];
      next.splice(index, 0, { ...blankRow(), sort_order: index });
      return next.map((row, rowIndex) => ({ ...row, sort_order: rowIndex }));
    });
    setSaveState("Unsaved changes");
  }

  function removeRow(index: number) {
    setRows((current) => {
      const remaining = current.filter((_, rowIndex) => rowIndex !== index);
      return (remaining.length ? remaining : [blankRow()]).map((row, rowIndex) => ({ ...row, sort_order: rowIndex }));
    });
    setSaveState("Unsaved changes");
  }

  async function saveDraft(closeAfter = false) {
    if (!draft) return null;
    setSaveState("Saving…");
    setError("");
    try {
      const saved = await invoke<Draft>("save_draft", {
        input: {
          id: draft.id,
          internal_draft_reference: draft.internal_draft_reference,
          document_type_snapshot: draft.document_type_snapshot,
          company_snapshot: draft.company_snapshot,
          client_snapshot: draft.client_snapshot,
          official_number: draft.official_number,
          issue_date: draft.issue_date,
          place: draft.place,
          reference: draft.reference,
          note: draft.note,
          vat_rate: draft.vat_rate,
          source_asset_id: null,
          currency_code: draft.currency_code,
          items: rows.filter((row) => row.description.trim()).map((row, index) => ({
            id: row.id,
            sort_order: index,
            description: row.description,
            quantity: row.quantity,
            unit_snapshot: row.unit_snapshot,
            unit_price_ht: row.unit_price_ht.trim() ? row.unit_price_ht : null,
          })),
        },
      });
      setDraft(saved);
      setSaveState("Saved locally");
      if (closeAfter) router.push("/");
      return saved;
    } catch (saveError) {
      setError(errorMessage(saveError));
      setSaveState("Save failed");
      return null;
    }
  }

  async function createClient() {
    if (!newClientName.trim()) return;
    setError("");
    try {
      const client = await invoke<Client>("create_client", {
        client: {
          id: "",
          name: newClientName.trim(),
          address: null,
          identification_number: null,
          phone: null,
          email: newClientEmail.trim() || null,
          is_active: true,
          created_at: "",
          updated_at: "",
        },
      });
      setClients((current) => [...current, client].sort((left, right) => left.name.localeCompare(right.name)));
      setDraft((current) => current ? { ...current, client_snapshot: client } : current);
      setNewClientName("");
      setNewClientEmail("");
      setSaveState("Unsaved changes");
    } catch (clientError) {
      setError(errorMessage(clientError));
    }
  }

  function toPdfData(source: Draft): InvoicePdfData {
    return {
      companyName: source.company_snapshot.trading_name || source.company_snapshot.legal_name || "Company",
      companyActivity: source.company_snapshot.activity_label,
      companyAddress: source.company_snapshot.city,
      documentType: source.document_type_snapshot.printed_title || source.document_type_snapshot.name || "Invoice",
      internalReference: source.internal_draft_reference,
      clientName: typeof source.client_snapshot === "object" && source.client_snapshot && "name" in source.client_snapshot ? String(source.client_snapshot.name || "") : "",
      officialNumber: source.official_number,
      issueDate: source.issue_date,
      place: source.place,
      reference: source.reference,
      note: source.note,
      currency: source.currency_code,
      totalHt,
      vatAmount: currentVat,
      totalTtc: currentTtc,
      items: rows.filter((row) => row.description.trim()).map((row) => ({
        description: row.description,
        quantity: row.quantity,
        unit: typeof row.unit_snapshot?.abbreviation === "string" ? row.unit_snapshot.abbreviation : "-",
        unitPrice: row.unit_price_ht,
        lineTotal: lineTotal(row.quantity, row.unit_price_ht),
      })),
    };
  }

  async function previewPdf() {
    const saved = await saveDraft();
    if (!saved) return;
    setPdfState("Preparing preview…");
    try {
      const bytes = await generateInvoicePdf(toPdfData(saved));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(pdfBlob(bytes)));
      setPdfState("Preview ready");
    } catch (pdfError) {
      setError(errorMessage(pdfError));
      setPdfState("Preview failed");
    }
  }

  async function generatePdf() {
    const saved = await saveDraft();
    if (!saved) return;
    setPdfState("Generating PDF…");
    try {
      const bytes = await generateInvoicePdf(toPdfData(saved));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(pdfBlob(bytes)));
      const filename = (saved.document_type_snapshot.name || "document") + "-" + saved.internal_draft_reference + ".pdf";
      try {
        const path = await invoke<string>("save_pdf", { filename, bytes: Array.from(bytes) });
        setPdfPath(path);
      } catch {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(pdfBlob(bytes));
        link.download = filename;
        link.click();
        setPdfPath("Downloaded by the browser");
      }
      setPdfState("PDF generated");
    } catch (pdfError) {
      setError(errorMessage(pdfError));
      setPdfState("PDF failed");
    }
  }

  if (!draft) {
    return <div className="workspace-shell"><p className="settings-error">{error || "Loading draft…"}</p></div>;
  }

  const selectedClientId = typeof draft.client_snapshot === "object" && draft.client_snapshot && "id" in draft.client_snapshot ? String(draft.client_snapshot.id || "") : "";
  const selectedClientName = typeof draft.client_snapshot === "object" && draft.client_snapshot && "name" in draft.client_snapshot ? String(draft.client_snapshot.name || "") : "";

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div>
          <Link className="back-link" href="/">← Home</Link>
          <p className="section-kicker">{draft.status} · {draft.internal_draft_reference}</p>
          <h1>{draft.document_type_snapshot.name ?? "Document"}</h1>
          <p className="workspace-company">{draft.company_snapshot.trading_name || draft.company_snapshot.legal_name}</p>
        </div>
        <div className="workspace-actions">
          <span className={`save-state ${saveState === "Saved locally" ? "save-state-saved" : ""}`}>{saveState}</span>
          <button className="secondary-button" onClick={() => void saveDraft()} type="button">Save</button>
          <button className="primary-button" onClick={() => void saveDraft(true)} type="button">Save and close</button>
        </div>
      </header>

      {error && <div className="settings-error" role="alert">{error}</div>}

      <main className="workspace-main">
        <div className="workspace-toolbar">
          <div>
            <p className="section-kicker">{activeView === "items" ? "Items" : "Review"}</p>
            <h2>{activeView === "items" ? "Build the document" : "Check and preview"}</h2>
          </div>
          <div className="workspace-tabs">
            <button className={activeView === "items" ? "tab-button tab-button-active" : "tab-button"} onClick={() => setActiveView("items")} type="button">Items</button>
            <button className={activeView === "review" ? "tab-button tab-button-active" : "tab-button"} onClick={() => setActiveView("review")} type="button">Review</button>
            <button className="secondary-button" onClick={() => setDetailsOpen((open) => !open)} type="button">{detailsOpen ? "Hide details" : "Document details"}</button>
          </div>
        </div>

        {detailsOpen && (
          <section className="details-panel" aria-label="Document details">
            <p>These details are optional. A number and date are only needed to remove the DRAFT marking.</p>
            <div className="details-grid">
              <label>Client<select value={selectedClientId} onChange={(event) => { const client = clients.find((candidate) => candidate.id === event.target.value); setDraft({ ...draft, client_snapshot: client ?? null }); setSaveState("Unsaved changes"); }}><option value="">No client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
              <label>Document number<input value={draft.official_number ?? ""} onChange={(event) => { setDraft({ ...draft, official_number: event.target.value || null }); setSaveState("Unsaved changes"); }} placeholder="Assign later" /></label>
              <label>Issue date<input type="date" value={draft.issue_date ?? ""} onChange={(event) => { setDraft({ ...draft, issue_date: event.target.value || null }); setSaveState("Unsaved changes"); }} /></label>
              <label>Place<input value={draft.place ?? ""} onChange={(event) => { setDraft({ ...draft, place: event.target.value || null }); setSaveState("Unsaved changes"); }} /></label>
              <label>Reference<input value={draft.reference ?? ""} onChange={(event) => { setDraft({ ...draft, reference: event.target.value || null }); setSaveState("Unsaved changes"); }} /></label>
              <label>Notes<input value={draft.note ?? ""} onChange={(event) => { setDraft({ ...draft, note: event.target.value || null }); setSaveState("Unsaved changes"); }} /></label>
            </div>
            <div className="client-create-row">
              <span>{selectedClientName ? "Selected: " + selectedClientName : "No client selected"}</span>
              <input value={newClientName} onChange={(event) => setNewClientName(event.target.value)} placeholder="New client name" />
              <input value={newClientEmail} onChange={(event) => setNewClientEmail(event.target.value)} placeholder="Email (optional)" type="email" />
              <button className="secondary-button" onClick={() => void createClient()} type="button">Create and select</button>
            </div>
          </section>
        )}

        {activeView === "items" && units.length === 0 && <div className="settings-notice">Add at least one active unit in <Link href="/settings">Settings</Link> before choosing a unit for an item.</div>}

        {activeView === "items" && <>
        <div className="item-table-wrap">
          <table className="item-table">
            <thead><tr><th>#</th><th className="description-column">Description</th><th>Quantity</th><th>Unit</th><th>Unit price HT</th><th>Line total</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? `new-${index}`}>
                  <td className="row-number">{index + 1}</td>
                  <td><input aria-label={`Description row ${index + 1}`} autoFocus={index === 0 && !row.description} value={row.description} onChange={(event) => updateRow(index, { description: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter" && index === rows.length - 1) addRow(index); }} placeholder="Describe the item" /></td>
                  <td><input aria-label={`Quantity row ${index + 1}`} inputMode="decimal" value={row.quantity} onChange={(event) => updateRow(index, { quantity: event.target.value })} /></td>
                  <td><select aria-label={`Unit row ${index + 1}`} value={row.unitId} onChange={(event) => { const unit = units.find((candidate) => candidate.id === event.target.value); updateRow(index, { unitId: event.target.value, unit_snapshot: unit ?? null }); }}><option value="">Choose</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.abbreviation}</option>)}</select></td>
                  <td><input aria-label={`Unit price row ${index + 1}`} inputMode="decimal" value={row.unit_price_ht} onChange={(event) => updateRow(index, { unit_price_ht: event.target.value })} placeholder="0.00" /></td>
                  <td className="line-total">{lineTotal(row.quantity, row.unit_price_ht)}</td>
                  <td><button className="row-remove" onClick={() => removeRow(index)} type="button" aria-label={`Remove row ${index + 1}`}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="add-row-button" onClick={() => addRow()} type="button">＋ Add row</button>
        </>}

        {activeView === "review" && (
          <section className="review-panel">
            <div className="review-summary">
              <div><span>Client</span><strong>{selectedClientName || "Not assigned"}</strong></div>
              <div><span>Items</span><strong>{rows.filter((row) => row.description.trim()).length}</strong></div>
              <div><span>Document state</span><strong>{draft.official_number && draft.issue_date ? "Ready for final PDF" : "DRAFT marking required"}</strong></div>
            </div>
            <p className="review-note">{draft.official_number && draft.issue_date ? "Number and date are complete. The PDF will use the normal invoice heading." : "Number or date is missing. The PDF remains clearly marked DRAFT and does not block preview or generation."}</p>
            <div className="review-actions">
              <button className="secondary-button" onClick={() => void previewPdf()} type="button">Preview PDF</button>
              <button className="primary-button" onClick={() => void generatePdf()} type="button">Generate PDF</button>
              {pdfState && <span className="save-state">{pdfState}</span>}
              {pdfPath && <span className="pdf-path">{pdfPath}</span>}
            </div>
            {previewUrl && <iframe className="pdf-preview" src={previewUrl} title="Invoice PDF preview" />}
          </section>
        )}

        <section className="totals-panel" aria-label="Totals">
          <div><span>Total HT</span><strong>{totalHt} {draft.currency_code}</strong></div>
          <div><span>VAT</span><strong>{currentVat} {draft.currency_code}</strong></div>
          <div className="total-strong"><span>Total TTC</span><strong>{currentTtc} {draft.currency_code}</strong></div>
        </section>
      </main>
    </div>
  );
}
