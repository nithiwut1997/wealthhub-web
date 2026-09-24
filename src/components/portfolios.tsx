"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useDataSource } from "@/components/data-source-provider";
import { portfoliosQueryOptions, portfolioSummaryQueryOptions } from "@/lib/queries";

const amountFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function amount(value: number, currency: string) {
  return `${amountFormatter.format(value)} ${currency}`;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="state-message" role="alert">
      <h3>We couldn&rsquo;t load your portfolios</h3>
      <p>{message}</p>
      <button className="secondary-button" type="button" onClick={retry}>Try again</button>
    </div>
  );
}

export function Portfolios() {
  const { mode, source } = useDataSource();
  const portfoliosQuery = useQuery(portfoliosQueryOptions(source, mode));
  const portfolios = portfoliosQuery.data ?? [];
  const summaryQueries = useQueries({
    queries: portfolios.map((portfolio) => portfolioSummaryQueryOptions(source, mode, portfolio.id)),
  });

  return (
    <AppShell>
      <header className="page-header">
        <div><p className="eyebrow">Your accounts</p><h1>Portfolios</h1><p className="subtitle">A clear view of the portfolios you track in WealthHub.</p></div>
      </header>

      {portfoliosQuery.isPending && <section className="content-card state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading your portfolios</h3><p>Connecting to WealthHub…</p></section>}
      {portfoliosQuery.isError && <section className="content-card"><ErrorState message={portfoliosQuery.error.message} retry={() => void portfoliosQuery.refetch()} /></section>}
      {portfoliosQuery.data?.length === 0 && <section className="content-card"><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Portfolio list</h2></div><span className="quiet-label">No portfolios</span></div><div className="empty-state"><div className="empty-illustration" aria-hidden="true"><span className="bar bar-one" /><span className="bar bar-two" /><span className="bar bar-three" /></div><h3>No portfolios yet</h3><p>Once a portfolio has been added, its details will appear here.</p></div></section>}

      {portfolios.length > 0 && <section className="content-card portfolios-card">
        <div className="section-heading"><div><p className="eyebrow">Portfolio list</p><h2>All portfolios</h2></div><span className="quiet-label">{portfolios.length} {portfolios.length === 1 ? "portfolio" : "portfolios"}</span></div>
        <div className="portfolio-list">{portfolios.map((portfolio, index) => {
          const summaryQuery = summaryQueries[index];
          const summary = summaryQuery.data;
          return <article className="portfolio-row" key={portfolio.id}>
            <div className="portfolio-identity"><span className="portfolio-monogram" aria-hidden="true">{portfolio.name.trim().charAt(0).toUpperCase() || "P"}</span><div><h3>{portfolio.name}</h3><p>Base currency <strong>{portfolio.baseCurrency}</strong></p></div></div>
            {summaryQuery.isPending && <div className="portfolio-summary-loading" aria-live="polite"><span className="loading-mark" />Loading summary…</div>}
            {summaryQuery.isError && <div className="portfolio-summary-error" role="alert"><span>Summary unavailable</span><button type="button" onClick={() => void summaryQuery.refetch()}>Try again</button></div>}
            {summary && <dl className="portfolio-metrics">
              <div><dt>Market value</dt><dd>{amount(summary.totalMarketValue, portfolio.baseCurrency)}</dd></div>
              <div><dt>Total cost</dt><dd>{amount(summary.totalCost, portfolio.baseCurrency)}</dd></div>
              <div><dt>Unrealized gain / loss</dt><dd className={summary.unrealizedGainLoss >= 0 ? "positive" : "negative"}>{amount(summary.unrealizedGainLoss, portfolio.baseCurrency)}</dd></div>
              <div><dt>Holdings</dt><dd>{summary.holdingCount}</dd></div>
            </dl>}
          </article>;
        })}</div>
      </section>}
    </AppShell>
  );
}
