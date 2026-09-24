"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { portfoliosQueryOptions } from "@/lib/queries";

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="state-message" role="alert">
      <h3>We couldn&rsquo;t load your portfolios</h3>
      <p>{message}</p>
      <button className="secondary-button" type="button" onClick={retry}>Try again</button>
    </div>
  );
}

export function Transactions() {
  const portfoliosQuery = useQuery(portfoliosQueryOptions());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const activePortfolioId = portfoliosQuery.data?.some(({ id }) => id === selectedId)
    ? selectedId
    : portfoliosQuery.data?.[0]?.id ?? null;
  const selectedPortfolio = portfoliosQuery.data?.find(({ id }) => id === activePortfolioId);

  return (
    <AppShell>
      <header className="page-header transactions-header">
        <div>
          <p className="eyebrow">Activity</p>
          <h1>Transactions</h1>
          <p className="subtitle">Record and review the trades that shape your portfolio.</p>
        </div>
        {portfoliosQuery.data && portfoliosQuery.data.length > 0 && (
          <div className="header-actions">
            <label className="portfolio-picker">
              <span>Portfolio</span>
              <select value={activePortfolioId ?? ""} onChange={(event) => setSelectedId(Number(event.target.value))}>
                {portfoliosQuery.data.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>)}
              </select>
            </label>
            <button className="primary-button" type="button" aria-expanded={showComposer} onClick={() => setShowComposer((open) => !open)}>
              <span aria-hidden="true">+</span> New transaction
            </button>
          </div>
        )}
      </header>

      {portfoliosQuery.isPending && (
        <section className="content-card state-message" aria-live="polite">
          <div className="loading-mark" />
          <h3>Loading your portfolios</h3>
          <p>Preparing your transaction workspace…</p>
        </section>
      )}
      {portfoliosQuery.isError && (
        <section className="content-card"><ErrorState message={portfoliosQuery.error.message} retry={() => void portfoliosQuery.refetch()} /></section>
      )}
      {portfoliosQuery.data?.length === 0 && (
        <section className="content-card">
          <div className="section-heading"><div><p className="eyebrow">Get started</p><h2>Transaction activity</h2></div><span className="quiet-label">No portfolios</span></div>
          <div className="empty-state"><div className="transaction-mark" aria-hidden="true">↗</div><h3>No portfolios yet</h3><p>Add a portfolio before recording its first transaction.</p></div>
        </section>
      )}

      {selectedPortfolio && (
        <div className="transactions-layout">
          {showComposer && (
            <section className="content-card transaction-composer" aria-labelledby="new-transaction-title">
              <div className="section-heading">
                <div><p className="eyebrow">New activity</p><h2 id="new-transaction-title">New transaction</h2></div>
                <button className="close-button" type="button" aria-label="Close new transaction" onClick={() => setShowComposer(false)}>×</button>
              </div>
              <div className="dependency-message">
                <span className="dependency-icon" aria-hidden="true">i</span>
                <div><h3>Asset selection is not available yet</h3><p>We need the asset-list API contract before this form can safely create a transaction. Your selected portfolio is <strong>{selectedPortfolio.name}</strong>.</p></div>
              </div>
            </section>
          )}

          <section className="content-card">
            <div className="section-heading">
              <div><p className="eyebrow">{selectedPortfolio.name}</p><h2>Transaction history</h2></div>
              <span className="quiet-label">Activity</span>
            </div>
            <div className="empty-state transaction-pending">
              <div className="transaction-mark" aria-hidden="true">↕</div>
              <h3>History is coming next</h3>
              <p>The transaction history contract is needed before activity can be loaded here. No placeholder or mock transactions are shown.</p>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
