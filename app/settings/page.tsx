"use client";

import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Company = {
  id: string;
  legal_name: string;
  trading_name: string | null;
  activity_label: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  tax_identifiers: string | null;
  registration_identifiers: string | null;
  bank_details: string | null;
  default_template_id: string | null;
  default_vat_profile_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type DocumentType = {
  id: string;
  name: string;
  printed_title: string;
  code: string;
  numbering_prefix: string | null;
  numbering_mode: string;
  allow_manual_number: boolean;
  show_vat: boolean;
  show_amount_in_words: boolean;
  default_note: string | null;
  required_client_fields: string[];
  required_final_fields: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Unit = {
  id: string;
  label: string;
  abbreviation: string;
  is_active: boolean;
  sort_order: number;
};

const emptyCompany: Company = {
  id: "",
  legal_name: "",
  trading_name: null,
  activity_label: null,
  address: null,
  city: null,
  phone: null,
  email: null,
  tax_identifiers: null,
  registration_identifiers: null,
  bank_details: null,
  default_template_id: null,
  default_vat_profile_id: null,
  is_active: true,
  created_at: "",
  updated_at: "",
};

const emptyDocumentType: DocumentType = {
  id: "",
  name: "",
  printed_title: "",
  code: "",
  numbering_prefix: null,
  numbering_mode: "manual",
  allow_manual_number: true,
  show_vat: true,
  show_amount_in_words: false,
  default_note: null,
  required_client_fields: ["name"],
  required_final_fields: ["officialNumber", "issueDate"],
  is_active: true,
  created_at: "",
  updated_at: "",
};

const emptyUnit: Unit = { id: "", label: "", abbreviation: "", is_active: true, sort_order: 0 };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export default function SettingsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [companyForm, setCompanyForm] = useState<Company>(emptyCompany);
  const [documentTypeForm, setDocumentTypeForm] = useState<DocumentType>(emptyDocumentType);
  const [unitForm, setUnitForm] = useState<Unit>(emptyUnit);
  const [loading, setLoading] = useState(true);
  const [desktopAvailable, setDesktopAvailable] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [loadedCompanies, loadedTypes, loadedUnits] = await Promise.all([
        invoke<Company[]>("list_companies", { activeOnly: false }),
        invoke<DocumentType[]>("list_document_types", { activeOnly: false }),
        invoke<Unit[]>("list_units", { activeOnly: false }),
      ]);
      setCompanies(loadedCompanies);
      setDocumentTypes(loadedTypes);
      setUnits(loadedUnits);
      setDesktopAvailable(true);
    } catch (loadError) {
      setDesktopAvailable(false);
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSettings(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  async function handleCompanySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("company");
    setError("");
    try {
      if (companyForm.id) {
        await invoke("update_company", { company: companyForm });
      } else {
        await invoke("create_company", { company: companyForm });
      }
      setCompanyForm(emptyCompany);
      await loadSettings();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving("");
    }
  }

  async function handleDocumentTypeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("document-type");
    setError("");
    try {
      if (documentTypeForm.id) {
        await invoke("update_document_type", { definition: documentTypeForm });
      } else {
        await invoke("create_document_type", { definition: documentTypeForm });
      }
      setDocumentTypeForm(emptyDocumentType);
      await loadSettings();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving("");
    }
  }

  async function handleUnitSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("unit");
    setError("");
    try {
      if (unitForm.id) await invoke("update_unit", { unit: unitForm });
      else await invoke("create_unit", { unit: unitForm });
      setUnitForm(emptyUnit);
      await loadSettings();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving("");
    }
  }

  async function archiveCompany(company: Company) {
    setSaving(company.id);
    setError("");
    try {
      await invoke("update_company", { company: { ...company, is_active: false } });
      await loadSettings();
    } catch (archiveError) {
      setError(errorMessage(archiveError));
    } finally {
      setSaving("");
    }
  }

  async function archiveDocumentType(definition: DocumentType) {
    setSaving(definition.id);
    setError("");
    try {
      await invoke("update_document_type", { definition: { ...definition, is_active: false } });
      await loadSettings();
    } catch (archiveError) {
      setError(errorMessage(archiveError));
    } finally {
      setSaving("");
    }
  }

  async function archiveUnit(unit: Unit) {
    setSaving(unit.id);
    setError("");
    try {
      await invoke("update_unit", { unit: { ...unit, is_active: false } });
      await loadSettings();
    } catch (archiveError) {
      setError(errorMessage(archiveError));
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="settings-shell">
      <header className="settings-header">
        <Link className="back-link" href="/">← Home</Link>
        <div>
          <p className="section-kicker">Configuration</p>
          <h1>Settings</h1>
          <p className="settings-intro">Keep the choices used to create your documents current.</p>
        </div>
        <span className={`storage-status ${desktopAvailable ? "storage-status-ready" : ""}`}>
          <span aria-hidden="true">●</span> {desktopAvailable ? "Local storage connected" : "Windows app required"}
        </span>
      </header>

      {!desktopAvailable && !loading && (
        <div className="settings-notice" role="status">
          <strong>Open this page in the Windows app.</strong>
          <span>Companies and document types are stored in local SQLite and are not available from the browser yet.</span>
        </div>
      )}

      {error && desktopAvailable && <div className="settings-error" role="alert">{error}</div>}

      <main className={`settings-grid ${!desktopAvailable ? "settings-grid-disabled" : ""}`}>
        <section className="settings-card" aria-labelledby="companies-title">
          <div className="settings-card-heading">
            <div>
              <p className="section-kicker">Issuing identity</p>
              <h2 id="companies-title">Companies</h2>
            </div>
            <span className="record-count">{companies.length} records</span>
          </div>

          <div className="record-list">
            {!loading && companies.length === 0 && <p className="settings-empty">No companies configured yet.</p>}
            {companies.map((company) => (
              <div className={`record-row ${!company.is_active ? "record-row-inactive" : ""}`} key={company.id}>
                <div>
                  <strong>{company.legal_name}</strong>
                  <span>{company.trading_name || company.activity_label || company.city || "No additional details"}</span>
                  {!company.is_active && <em>Archived</em>}
                </div>
                <div className="record-actions">
                  <button type="button" onClick={() => setCompanyForm(company)} disabled={!desktopAvailable}>Edit</button>
                  {company.is_active && <button type="button" onClick={() => void archiveCompany(company)} disabled={!desktopAvailable || saving === company.id}>Archive</button>}
                </div>
              </div>
            ))}
          </div>

          <form className="settings-form" onSubmit={handleCompanySubmit}>
            <div className="form-heading">
              <h3>{companyForm.id ? "Edit company" : "Add company"}</h3>
              {companyForm.id && <button type="button" onClick={() => setCompanyForm(emptyCompany)}>Cancel</button>}
            </div>
            <label>Legal name<input required value={companyForm.legal_name} onChange={(event) => setCompanyForm({ ...companyForm, legal_name: event.target.value })} disabled={!desktopAvailable} /></label>
            <div className="form-two-col">
              <label>Trading name<input value={companyForm.trading_name || ""} onChange={(event) => setCompanyForm({ ...companyForm, trading_name: event.target.value || null })} disabled={!desktopAvailable} /></label>
              <label>Activity<input value={companyForm.activity_label || ""} onChange={(event) => setCompanyForm({ ...companyForm, activity_label: event.target.value || null })} disabled={!desktopAvailable} /></label>
            </div>
            <div className="form-two-col">
              <label>City<input value={companyForm.city || ""} onChange={(event) => setCompanyForm({ ...companyForm, city: event.target.value || null })} disabled={!desktopAvailable} /></label>
              <label>Email<input type="email" value={companyForm.email || ""} onChange={(event) => setCompanyForm({ ...companyForm, email: event.target.value || null })} disabled={!desktopAvailable} /></label>
            </div>
            <button className="form-submit" type="submit" disabled={!desktopAvailable || saving === "company"}>{saving === "company" ? "Saving…" : companyForm.id ? "Save changes" : "Add company"}</button>
          </form>
        </section>

        <section className="settings-card" aria-labelledby="document-types-title">
          <div className="settings-card-heading">
            <div>
              <p className="section-kicker">Document identity</p>
              <h2 id="document-types-title">Document types</h2>
            </div>
            <span className="record-count">{documentTypes.length} records</span>
          </div>

          <div className="record-list">
            {!loading && documentTypes.length === 0 && <p className="settings-empty">No document types configured yet.</p>}
            {documentTypes.map((definition) => (
              <div className={`record-row ${!definition.is_active ? "record-row-inactive" : ""}`} key={definition.id}>
                <div>
                  <strong>{definition.name}</strong>
                  <span>{definition.code} · {definition.printed_title}</span>
                  {!definition.is_active && <em>Archived</em>}
                </div>
                <div className="record-actions">
                  <button type="button" onClick={() => setDocumentTypeForm(definition)} disabled={!desktopAvailable}>Edit</button>
                  {definition.is_active && <button type="button" onClick={() => void archiveDocumentType(definition)} disabled={!desktopAvailable || saving === definition.id}>Archive</button>}
                </div>
              </div>
            ))}
          </div>

          <form className="settings-form" onSubmit={handleDocumentTypeSubmit}>
            <div className="form-heading">
              <h3>{documentTypeForm.id ? "Edit document type" : "Add document type"}</h3>
              {documentTypeForm.id && <button type="button" onClick={() => setDocumentTypeForm(emptyDocumentType)}>Cancel</button>}
            </div>
            <div className="form-two-col">
              <label>Name<input required value={documentTypeForm.name} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, name: event.target.value })} disabled={!desktopAvailable} /></label>
              <label>Internal code<input required value={documentTypeForm.code} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, code: event.target.value.toUpperCase() })} disabled={!desktopAvailable} /></label>
            </div>
            <label>Printed title<input required value={documentTypeForm.printed_title} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, printed_title: event.target.value })} disabled={!desktopAvailable} /></label>
            <div className="form-two-col">
              <label>Number prefix<input value={documentTypeForm.numbering_prefix || ""} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, numbering_prefix: event.target.value || null })} disabled={!desktopAvailable} /></label>
              <label>Numbering mode<select value={documentTypeForm.numbering_mode} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, numbering_mode: event.target.value })} disabled={!desktopAvailable}><option value="manual">Manual</option><option value="automatic">Automatic</option></select></label>
            </div>
            <div className="check-row">
              <label><input type="checkbox" checked={documentTypeForm.show_vat} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, show_vat: event.target.checked })} disabled={!desktopAvailable} /> Show VAT</label>
              <label><input type="checkbox" checked={documentTypeForm.show_amount_in_words} onChange={(event) => setDocumentTypeForm({ ...documentTypeForm, show_amount_in_words: event.target.checked })} disabled={!desktopAvailable} /> Amount in words</label>
            </div>
            <button className="form-submit" type="submit" disabled={!desktopAvailable || saving === "document-type"}>{saving === "document-type" ? "Saving…" : documentTypeForm.id ? "Save changes" : "Add document type"}</button>
          </form>
        </section>

        <section className="settings-card" aria-labelledby="units-title">
          <div className="settings-card-heading">
            <div><p className="section-kicker">Item entry</p><h2 id="units-title">Units</h2></div>
            <span className="record-count">{units.length} records</span>
          </div>
          <div className="record-list">
            {!loading && units.length === 0 && <p className="settings-empty">No units configured yet.</p>}
            {units.map((unit) => (
              <div className={`record-row ${!unit.is_active ? "record-row-inactive" : ""}`} key={unit.id}>
                <div><strong>{unit.label}</strong><span>{unit.abbreviation}</span>{!unit.is_active && <em>Archived</em>}</div>
                <div className="record-actions"><button type="button" onClick={() => setUnitForm(unit)} disabled={!desktopAvailable}>Edit</button>{unit.is_active && <button type="button" onClick={() => void archiveUnit(unit)} disabled={!desktopAvailable || saving === unit.id}>Archive</button>}</div>
              </div>
            ))}
          </div>
          <form className="settings-form" onSubmit={handleUnitSubmit}>
            <div className="form-heading"><h3>{unitForm.id ? "Edit unit" : "Add unit"}</h3>{unitForm.id && <button type="button" onClick={() => setUnitForm(emptyUnit)}>Cancel</button>}</div>
            <div className="form-two-col">
              <label>Label<input required value={unitForm.label} onChange={(event) => setUnitForm({ ...unitForm, label: event.target.value })} disabled={!desktopAvailable} /></label>
              <label>Abbreviation<input required value={unitForm.abbreviation} onChange={(event) => setUnitForm({ ...unitForm, abbreviation: event.target.value })} disabled={!desktopAvailable} /></label>
            </div>
            <button className="form-submit" type="submit" disabled={!desktopAvailable || saving === "unit"}>{saving === "unit" ? "Saving…" : unitForm.id ? "Save changes" : "Add unit"}</button>
          </form>
        </section>
      </main>
    </div>
  );
}
