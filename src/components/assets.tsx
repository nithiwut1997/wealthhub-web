"use client";

import { type FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useDataSource } from "@/components/data-source-provider";
import { type AssetResponse } from "@/lib/api";
import { assetKeys, assetsQueryOptions } from "@/lib/queries";

function assetType(type: "STOCK" | "MUTUAL_FUND") {
  return type === "MUTUAL_FUND" ? "Mutual fund" : "Stock";
}

function AssetForm({ close, saved }: { close: () => void; saved: () => void }) {
  const { mode, source } = useDataSource();
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetResponse["type"]>("STOCK");
  const [market, setMarket] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [externalId, setExternalId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: source.createAsset ?? (() => Promise.reject(new Error("Asset creation is unavailable for this data source."))),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assetKeys.all(mode) });
      saved();
      close();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    const values = { symbol: symbol.trim(), name: name.trim(), market: market.trim(), currency: currency.trim().toUpperCase(), externalId: externalId.trim() };
    if (!values.symbol || !values.name || !values.market || !values.currency) return setValidationError("Complete all required fields.");
    if (values.symbol.length > 30) return setValidationError("Symbol must be 30 characters or fewer.");
    if (values.name.length > 255) return setValidationError("Name must be 255 characters or fewer.");
    if (values.market.length > 20) return setValidationError("Market must be 20 characters or fewer.");
    if (values.currency.length !== 3) return setValidationError("Currency must be exactly 3 characters.");
    if (values.externalId.length > 100) return setValidationError("External ID must be 100 characters or fewer.");
    createMutation.mutate({ ...values, type, externalId: values.externalId || null });
  }

  return <section className="content-card create-panel" aria-labelledby="new-asset-title">
    <div className="section-heading"><div><p className="eyebrow">Create asset</p><h2 id="new-asset-title">Add an investment</h2></div><button className="close-button" type="button" aria-label="Close new asset form" onClick={close}>×</button></div>
    <form className="create-form" onSubmit={submit} noValidate>
      <label className="form-field"><span>Symbol</span><input autoFocus maxLength={30} value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="KFSMART-A" required /></label>
      <label className="form-field"><span>Name</span><input maxLength={255} value={name} onChange={(event) => setName(event.target.value)} placeholder="Krungsri Smart Fixed Income Fund" required /></label>
      <label className="form-field"><span>Type</span><select value={type} onChange={(event) => setType(event.target.value as AssetResponse["type"])}><option value="STOCK">Stock</option><option value="MUTUAL_FUND">Mutual fund</option></select></label>
      <label className="form-field"><span>Market</span><input maxLength={20} value={market} onChange={(event) => setMarket(event.target.value)} placeholder="TH" required /></label>
      <label className="form-field"><span>Currency</span><input minLength={3} maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="THB" required /></label>
      <label className="form-field"><span>External ID <em>Optional</em></span><input maxLength={100} value={externalId} onChange={(event) => setExternalId(event.target.value)} placeholder={type === "MUTUAL_FUND" ? "Verified SEC project ID" : "External identifier"} />{type === "MUTUAL_FUND" && <small>Use the SEC project ID when verified. Leave this blank if you do not know it.</small>}</label>
      {validationError && <p className="form-error" role="alert">{validationError}</p>}
      {createMutation.isError && <p className="form-error" role="alert">Asset could not be created. {createMutation.error.message}</p>}
      <div className="form-actions"><button className="secondary-button" type="button" onClick={close} disabled={createMutation.isPending}>Cancel</button><button className="primary-button" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Creating asset…" : "Create asset"}</button></div>
    </form>
  </section>;
}

export function Assets() {
  const { mode, source } = useDataSource();
  const assetsQuery = useQuery(assetsQueryOptions(source, mode));
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <AppShell>
      <header className="page-header">
        <div><p className="eyebrow">Investment catalog</p><h1>Assets</h1><p className="subtitle">Browse the instruments available in WealthHub.</p></div>
        {mode === "api" ? <button className="primary-button" type="button" aria-expanded={showForm} onClick={() => { setShowForm((open) => !open); setShowSuccess(false); }}><span aria-hidden="true">+</span> New asset</button> : <span className="demo-readonly">Sample assets are read-only</span>}
      </header>

      <div className="create-layout">{showSuccess && mode === "api" && <div className="success-message" role="status">Asset created successfully.</div>}{showForm && mode === "api" && <AssetForm close={() => setShowForm(false)} saved={() => setShowSuccess(true)} />}</div>

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
