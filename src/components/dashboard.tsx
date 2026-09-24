"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useDataSource } from "@/components/data-source-provider";
import { type DashboardPortfolioResponse, type DashboardResponse } from "@/lib/api";
import { dashboardQueryOptions } from "@/lib/queries";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function amount(value: number, currency: string) {
  return `${numberFormatter.format(value)} ${currency}`;
}

function percentage(value: number) {
  return `${value > 0 ? "+" : ""}${numberFormatter.format(value)}%`;
}

function gainClass(value: number) {
  return value > 0 ? "positive" : value < 0 ? "negative" : "";
}

function valuationCoverage(priced: number, total: number) {
  if (total === 0) return "No holdings to value yet.";
  if (priced === 0) return `Market valuation is unavailable for all ${total} holdings.`;
  return `Market value is based on ${priced} of ${total} priced holdings.`;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="state-message" role="alert"><h3>We couldn&rsquo;t load this view</h3><p>{message}</p><button className="secondary-button" type="button" onClick={retry}>Try again</button></div>;
}

function EmptyState() {
  return <section className="content-card"><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Portfolio overview</h2></div><span className="quiet-label">No portfolios</span></div><div className="empty-state"><div className="empty-illustration" aria-hidden="true"><span className="bar bar-one" /><span className="bar bar-two" /><span className="bar bar-three" /></div><h3>No portfolios yet</h3><p>Add a portfolio to see its holdings and a consolidated valuation here.</p></div></section>;
}

function MarketValue({ data, portfolio }: { data: DashboardResponse; portfolio?: DashboardPortfolioResponse }) {
  const item = portfolio ?? data;
  return item.holdingCount > 0 && item.pricedHoldingCount === 0 ? <>Unavailable</> : <>{amount(item.totalMarketValue, data.baseCurrency)}</>;
}

function PortfolioBreakdown({ data }: { data: DashboardResponse }) {
  return <section className="content-card dashboard-breakdown">
    <div className="section-heading"><div><p className="eyebrow">Portfolio breakdown</p><h2>One view, every portfolio</h2></div><span className="quiet-label">{data.portfolioCount} {data.portfolioCount === 1 ? "portfolio" : "portfolios"}</span></div>
    <div className="table-scroll"><table className="holdings-table dashboard-table">
      <thead><tr><th>Portfolio</th><th>Total cost</th><th>Market value</th><th>Unrealized P&amp;L</th><th>P&amp;L %</th><th>Holdings</th></tr></thead>
      <tbody>{data.portfolios.map((portfolio) => {
        const noValuation = portfolio.holdingCount > 0 && portfolio.pricedHoldingCount === 0;
        return <tr key={portfolio.portfolioId}>
          <td><strong>{portfolio.portfolioName}</strong>{portfolio.missingPriceCount > 0 && <span className="coverage-note">{valuationCoverage(portfolio.pricedHoldingCount, portfolio.holdingCount)}</span>}</td>
          <td>{amount(portfolio.totalCost, data.baseCurrency)}</td>
          <td><MarketValue data={data} portfolio={portfolio} /></td>
          <td className={noValuation ? "" : gainClass(portfolio.unrealizedGainLoss)}>{noValuation ? "—" : amount(portfolio.unrealizedGainLoss, data.baseCurrency)}</td>
          <td className={noValuation ? "" : gainClass(portfolio.unrealizedGainLossPercent)}>{noValuation ? "—" : percentage(portfolio.unrealizedGainLossPercent)}</td>
          <td>{portfolio.holdingCount}</td>
        </tr>;
      })}</tbody>
    </table></div>
  </section>;
}

export function Dashboard() {
  const { mode, source } = useDataSource();
  const dashboardQuery = useQuery(dashboardQueryOptions(source, mode));
  const data = dashboardQuery.data;
  const noValuation = Boolean(data && data.holdingCount > 0 && data.pricedHoldingCount === 0);

  return <AppShell>
    <header className="page-header"><div><p className="eyebrow">Consolidated overview</p><h1>Your wealth, clearly.</h1><p className="subtitle">All portfolios combined, with valuation coverage kept visible.</p></div></header>

    {dashboardQuery.isPending && <section className="content-card state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading your dashboard</h3><p>Connecting to WealthHub…</p></section>}
    {dashboardQuery.isError && <section className="content-card"><ErrorState message={dashboardQuery.error.message} retry={() => void dashboardQuery.refetch()} /></section>}
    {data?.portfolioCount === 0 && <EmptyState />}

    {data && data.portfolioCount > 0 && <>
      <section className="summary-grid dashboard-summary" aria-label="Consolidated portfolio valuation">
        <article className="summary-card"><p>Total cost</p><div className="empty-value">{amount(data.totalCost, data.baseCurrency)}</div><span>Across all holdings</span></article>
        <article className="summary-card featured"><p>Market value</p><div className="empty-value"><MarketValue data={data} /></div><span>{data.missingPriceCount > 0 ? valuationCoverage(data.pricedHoldingCount, data.holdingCount) : "All holdings with available prices"}</span></article>
        <article className="summary-card"><p>Unrealized P&amp;L</p><div className={`empty-value ${noValuation ? "" : gainClass(data.unrealizedGainLoss)}`}>{noValuation ? "—" : amount(data.unrealizedGainLoss, data.baseCurrency)}</div><span>{noValuation ? "Unavailable without latest prices" : `${percentage(data.unrealizedGainLossPercent)} on priced holdings`}</span></article>
      </section>
      <div className="dashboard-meta" aria-label="Dashboard totals"><span><strong>{data.portfolioCount}</strong> portfolios</span><span><strong>{data.holdingCount}</strong> holdings</span><span><strong>{data.assetCount}</strong> assets</span>{data.missingPriceCount > 0 && <span className="coverage-pill">{data.missingPriceCount} missing {data.missingPriceCount === 1 ? "price" : "prices"}</span>}</div>
      <PortfolioBreakdown data={data} />
    </>}
  </AppShell>;
}
