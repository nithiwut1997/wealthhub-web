"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useDataSource } from "@/components/data-source-provider";
import { assetsQueryOptions } from "@/lib/queries";

function assetType(type: "STOCK" | "MUTUAL_FUND") {
  return type === "MUTUAL_FUND" ? "Mutual fund" : "Stock";
}

export function Assets() {
  const { mode, source } = useDataSource();
  const assetsQuery = useQuery(assetsQueryOptions(source, mode));

  return (
    <AppShell>
      <header className="page-header">
        <div><p className="eyebrow">Investment catalog</p><h1>Assets</h1><p className="subtitle">Browse the instruments available in WealthHub.</p></div>
      </header>

      {assetsQuery.isPending && <section className="content-card state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading assets</h3><p>Fetching the latest asset catalog…</p></section>}
      {assetsQuery.isError && <section className="content-card"><div className="state-message" role="alert"><h3>We couldn&rsquo;t load assets</h3><p>{assetsQuery.error.message}</p><button className="secondary-button" type="button" onClick={() => void assetsQuery.refetch()}>Try again</button></div></section>}
      {assetsQuery.data?.length === 0 && <section className="content-card"><div className="section-heading"><div><p className="eyebrow">Investment catalog</p><h2>All assets</h2></div><span className="quiet-label">No assets</span></div><div className="empty-state"><div className="asset-mark" aria-hidden="true">◇</div><h3>No assets available</h3><p>Assets will appear here when they are available from your data source.</p></div></section>}

      {assetsQuery.data && assetsQuery.data.length > 0 && <section className="content-card assets-card">
        <div className="section-heading"><div><p className="eyebrow">Investment catalog</p><h2>All assets</h2></div><span className="quiet-label">{assetsQuery.data.length} {assetsQuery.data.length === 1 ? "asset" : "assets"}</span></div>
        <div className="table-scroll"><table className="holdings-table assets-table"><thead><tr><th>Asset</th><th>Type</th><th>Market</th><th>Currency</th><th>Status</th></tr></thead><tbody>{assetsQuery.data.map((asset) => <tr key={asset.id}>
          <td><strong>{asset.symbol}</strong><span>{asset.name}</span></td>
          <td><span className="asset-type">{assetType(asset.type)}</span></td>
          <td>{asset.market}</td>
          <td>{asset.currency}</td>
          <td><span className={`asset-status ${asset.isActive ? "active" : "inactive"}`}><span aria-hidden="true" />{asset.isActive ? "Active" : "Inactive"}</span></td>
        </tr>)}</tbody></table></div>
      </section>}
    </AppShell>
  );
}
