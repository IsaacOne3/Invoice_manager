"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";

type Company = {
  id: string;
  legal_name: string;
  trading_name: string | null;
  activity_label: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
};

type DocumentType = {
  id: string;
  name: string;
  printed_title: string;
  is_active: boolean;
};

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export default function NewDocumentPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        invoke<Company[]>("list_companies", { activeOnly: true }),
        invoke<DocumentType[]>("list_document_types", { activeOnly: true }),
      ])
        .then(([loadedCompanies, loadedTypes]) => {
          setCompanies(loadedCompanies);
          setDocumentTypes(loadedTypes);
        })
        .catch((loadError) => setError(message(loadError)))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function chooseDocumentType(documentType: DocumentType) {
    if (!selectedCompany) return;
    setCreating(true);
    setError("");
    try {
      const draft = await invoke<{ id: string }>("create_draft", {
        companySnapshot: selectedCompany,
        documentTypeSnapshot: documentType,
      });
      router.push(`/documents/${draft.id}`);
    } catch (creationError) {
      setError(message(creationError));
      setCreating(false);
    }
  }

  const browserMode = !loading && (error.length > 0 || companies.length === 0 && documentTypes.length === 0);

  return (
    <div className="selection-shell">
      <header className="selection-header">
        <Link className="back-link" href="/">← Home</Link>
        <div>
          <p className="section-kicker">New document</p>
          <h1>Choose the starting point</h1>
          <p className="settings-intro">Select the issuing company, then the document type. Your draft opens immediately after that.</p>
        </div>
      </header>

      {error && <div className="settings-error" role="alert">{browserMode ? "Open this page in the Windows app to use local SQLite." : error}</div>}

      <main className="selection-main">
        <section className="selection-step" aria-labelledby="company-selection-title">
          <div className="selection-step-heading">
            <span className="step-number">1</span>
            <div>
              <p className="section-kicker">Issuing identity</p>
              <h2 id="company-selection-title">Select a company</h2>
            </div>
          </div>
          {loading ? <p className="settings-empty">Loading saved companies…</p> : companies.length === 0 ? (
            <div className="settings-empty">
              <strong>No active companies yet.</strong>
              <span>Create one in <Link href="/settings">Settings</Link>, then return here.</span>
            </div>
          ) : (
            <div className="selection-cards">
              {companies.map((company) => (
                <button className={`selection-card ${selectedCompany?.id === company.id ? "selection-card-selected" : ""}`} key={company.id} onClick={() => setSelectedCompany(company)} type="button">
                  <span className="selection-card-check" aria-hidden="true">{selectedCompany?.id === company.id ? "✓" : ""}</span>
                  <strong>{company.trading_name || company.legal_name}</strong>
                  {company.activity_label && <span>{company.activity_label}</span>}
                  {(company.city || company.address) && <small>{company.city || company.address}</small>}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className={`selection-step ${selectedCompany ? "" : "selection-step-muted"}`} aria-labelledby="type-selection-title">
          <div className="selection-step-heading">
            <span className="step-number">2</span>
            <div>
              <p className="section-kicker">Document format</p>
              <h2 id="type-selection-title">Select a document type</h2>
            </div>
          </div>
          {!selectedCompany ? <p className="settings-empty">Select a company first.</p> : loading ? <p className="settings-empty">Loading saved document types…</p> : documentTypes.length === 0 ? (
            <div className="settings-empty">
              <strong>No active document types yet.</strong>
              <span>Create one in <Link href="/settings">Settings</Link>, then return here.</span>
            </div>
          ) : (
            <div className="selection-cards">
              {documentTypes.map((documentType) => (
                <button className="selection-card selection-card-type" disabled={creating} key={documentType.id} onClick={() => void chooseDocumentType(documentType)} type="button">
                  <strong>{documentType.name}</strong>
                  <span>{documentType.printed_title || "Commercial document"}</span>
                  <small>{creating ? "Opening draft…" : "Start with an empty draft →"}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
