"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { wealthHubApi, type HoldingValuation } from "@/lib/api";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function amount(value: number) {
  return numberFormatter.format(value);
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true"><span className="bar bar-one" /><span className="bar bar-two" /><span className="bar bar-three" /></div>
      <h3>No portfolios yet</h3>
      <p>Once a portfolio has been added, its current value and holdings will appear here.</p>
    </div>
  );
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="state-message" role="alert"><h3>We couldn&rsquo;t load this view</h3><p>{message}</p><button className="secondary-button" type="button" onClick={retry}>Try again</button></div>;
}

function HoldingsTable({ holdings }: { holdings: HoldingValuation[] }) {
  if (holdings.length === 0) {
    return <div className="state-message"><h3>No holdings</h3><p>This portfolio does not contain any holdings yet.</p></div>;
  }

  return (
    <div className="table-scroll">
      <table className="holdings-table">
        <thead><tr><th>Asset</th><th>Quantity</th><th>Average cost</th><th>Latest price</th><th>Market value</th><th>Gain / loss</th></tr></thead>
        <tbody>{holdings.map((holding) => {
          const missingPrice = holding.latestPrice === null;
          return <tr key={holding.assetId}>
            <td><strong>{holding.symbol}</strong><span>{holding.name}</span></td>
            <td>{amount(holding.quantity)}</td>
            <td>{amount(holding.averageCost)}</td>
            <td>{missingPrice ? <span className="missing-price">Price unavailable</span> : amount(holding.latestPrice)}</td>
            <td>{holding.marketValue === null ? "—" : amount(holding.marketValue)}</td>
            <td className={holding.unrealizedGainLoss === null ? "" : holding.unrealizedGainLoss >= 0 ? "positive" : "negative"}>{holding.unrealizedGainLoss === null ? "—" : amount(holding.unrealizedGainLoss)}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
}

export function Dashboard() {
  const portfoliosQuery = useQuery({ queryKey: ["portfolios"], queryFn: wealthHubApi.getPortfolios });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const activePortfolioId = portfoliosQuery.data?.some(({ id }) => id === selectedId)
    ? selectedId
    : portfoliosQuery.data?.[0]?.id ?? null;

  const valuationQuery = useQuery({
    queryKey: ["portfolio-valuation", activePortfolioId],
    queryFn: () => wealthHubApi.getPortfolioValuation(activePortfolioId!),
    enabled: activePortfolioId !== null,
  });

  const selectedPortfolio = portfoliosQuery.data?.find(({ id }) => id === activePortfolioId);
  const isInitialLoading = portfoliosQuery.isPending;

  return <AppShell>
    <header className="page-header">
      <div><p className="eyebrow">Overview</p><h1>Your wealth, clearly.</h1><p className="subtitle">Current portfolio value and holdings from WealthHub.</p></div>
      {portfoliosQuery.data && portfoliosQuery.data.length > 0 && <label className="portfolio-picker"><span>Portfolio</span><select value={activePortfolioId ?? ""} onChange={(event) => setSelectedId(Number(event.target.value))}>{portfoliosQuery.data.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>)}</select></label>}
    </header>

    {isInitialLoading && <section className="content-card state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading your portfolios</h3><p>Connecting to WealthHub…</p></section>}
    {portfoliosQuery.isError && <section className="content-card"><ErrorState message={portfoliosQuery.error.message} retry={() => void portfoliosQuery.refetch()} /></section>}
    {portfoliosQuery.data?.length === 0 && <section className="content-card"><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Portfolio overview</h2></div><span className="quiet-label">No portfolios</span></div><EmptyState /></section>}

    {selectedPortfolio && <>
      <section className="summary-grid" aria-label={`${selectedPortfolio.name} valuation`}>
        <article className="summary-card featured"><p>Market value</p><div className="empty-value">{valuationQuery.data ? amount(valuationQuery.data.totalMarketValue) : "—"}</div><span>{valuationQuery.isPending ? "Loading current valuation…" : selectedPortfolio.name}</span></article>
        <article className="summary-card"><p>Total cost</p><div className="empty-value">{valuationQuery.data ? amount(valuationQuery.data.totalCost) : "—"}</div><span>Across current holdings</span></article>
        <article className="summary-card"><p>Unrealized gain / loss</p><div className={`empty-value ${valuationQuery.data && valuationQuery.data.totalUnrealizedGainLoss < 0 ? "negative" : ""}`}>{valuationQuery.data ? amount(valuationQuery.data.totalUnrealizedGainLoss) : "—"}</div><span>Based on available latest prices</span></article>
      </section>
      <section className="content-card">
        <div className="section-heading"><div><p className="eyebrow">Current positions</p><h2>Holdings</h2></div>{valuationQuery.data && <span className="quiet-label">{valuationQuery.data.holdings.length} {valuationQuery.data.holdings.length === 1 ? "holding" : "holdings"}</span>}</div>
        {valuationQuery.isPending && <div className="state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading valuation</h3><p>Fetching the latest available holding values…</p></div>}
        {valuationQuery.isError && <ErrorState message={valuationQuery.error.message} retry={() => void valuationQuery.refetch()} />}
        {valuationQuery.data && <HoldingsTable holdings={valuationQuery.data.holdings} />}
      </section>
    </>}
  </AppShell>;
}
