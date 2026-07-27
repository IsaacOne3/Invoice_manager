"use client";

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

type RecentDocument = {
  id: string;
  internal_draft_reference: string;
  status: string;
  company_snapshot: { legal_name?: string };
  document_type_snapshot: { name?: string; printed_title?: string };
  updated_at: string;
};

const actions = [
  {
    eyebrow: "Start fresh",
    title: "New document",
    description: "Create one invoice, proforma, quotation, or configured document.",
    label: "Open setup",
    href: "/new-document",
    tone: "primary",
    icon: "＋",
  },
  {
    eyebrow: "Build a set",
    title: "Create contradictoires",
    description: "Generate alternative documents from one shared main document.",
    label: "Choose a main document",
    href: "#contradictoires",
    tone: "secondary",
    icon: "◈",
  },
  {
    eyebrow: "Continue work",
    title: "Open existing document",
    description: "Find a saved draft, continue editing, or export it again.",
    label: "Browse documents",
    href: "#documents",
    tone: "secondary",
    icon: "↗",
  },
] as const;

export default function Home() {
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const [desktopAvailable, setDesktopAvailable] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void invoke<RecentDocument[]>("list_documents")
        .then((loaded) => {
          setDocuments(loaded);
          setDesktopAvailable(true);
        })
        .catch(() => setDesktopAvailable(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="home-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Commercial Documents home">
          <span className="brand-mark" aria-hidden="true">CD</span>
          <span className="brand-copy">
            <span className="brand-name">Commercial Documents</span>
            <span className="brand-caption">Private workspace</span>
          </span>
        </a>

        <div className="header-tools">
          <span className="language-pill" aria-label="Current language: French">FR <span aria-hidden="true">⌄</span></span>
          <a className="settings-link" href="/settings">
            <span className="settings-icon" aria-hidden="true">⚙</span>
            <span>Settings</span>
          </a>
        </div>
      </header>

      <main id="top" className="home-content">
        <section className="welcome-block" aria-labelledby="welcome-title">
          <p className="section-kicker">Your workspace</p>
          <h1 id="welcome-title">What do you want to do?</h1>
          <p className="welcome-copy">
            Create clear commercial documents and keep your saved work close at hand.
          </p>
        </section>

        <section className="action-grid" aria-label="Main actions">
          {actions.map((action) => (
            <a
              className={`action-card action-card-${action.tone}`}
              href={action.href}
              key={action.title}
            >
              <span className="action-icon" aria-hidden="true">{action.icon}</span>
              <span className="action-content">
                <span className="action-eyebrow">{action.eyebrow}</span>
                <span className="action-title">{action.title}</span>
                <span className="action-description">{action.description}</span>
              </span>
              <span className="action-link">{action.label} <span aria-hidden="true">→</span></span>
            </a>
          ))}
        </section>

        <section className="recent-section" aria-labelledby="recent-title">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Saved work</p>
              <h2 id="recent-title">Recent documents</h2>
            </div>
            <span className="empty-count">{documents.length} saved</span>
          </div>

          {documents.length === 0 ? (
            <div className="empty-state" id="documents">
              <span className="empty-icon" aria-hidden="true">⌁</span>
              <div>
                <h3>{desktopAvailable ? "Your recent documents will appear here." : "Open the Windows app to see saved drafts."}</h3>
                <p>Create your first document to begin building a reliable saved workspace.</p>
              </div>
            </div>
          ) : (
            <div className="recent-list" id="documents">
              {documents.map((document) => (
                <a className="recent-document" href={`/documents/${document.id}`} key={document.id}>
                  <span>
                    <strong>{document.document_type_snapshot.name ?? "Document"}</strong>
                    <small>{document.company_snapshot.legal_name ?? "Company"} · {document.internal_draft_reference}</small>
                  </span>
                  <span className="recent-document-meta">{document.status} · {new Date(document.updated_at).toLocaleDateString()}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>Commercial Documents</span>
        <span>Local-first workspace · Drafts stay recoverable</span>
      </footer>
    </div>
  );
}
