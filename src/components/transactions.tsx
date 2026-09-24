"use client";

import { type FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useDataSource } from "@/components/data-source-provider";
import { wealthHubApi, type TransactionResponse, type TransactionType } from "@/lib/api";
import {
  assetsQueryOptions,
  portfolioKeys,
  portfoliosQueryOptions,
  transactionKeys,
  transactionsQueryOptions,
} from "@/lib/queries";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function ErrorState({ title, message, retry }: { title: string; message: string; retry: () => void }) {
  return (
    <div className="state-message" role="alert">
      <h3>{title}</h3>
      <p>{message}</p>
      <button className="secondary-button" type="button" onClick={retry}>Try again</button>
    </div>
  );
}

function TransactionHistory({ portfolioId, portfolioName }: { portfolioId: number; portfolioName: string }) {
  const { mode, source } = useDataSource();
  const transactionsQuery = useQuery(transactionsQueryOptions(source, mode, portfolioId));

  return (
    <section className="content-card transaction-history">
      <div className="section-heading">
        <div><p className="eyebrow">{portfolioName}</p><h2>Transaction history</h2></div>
        {transactionsQuery.data && <span className="quiet-label">{transactionsQuery.data.length} {transactionsQuery.data.length === 1 ? "transaction" : "transactions"}</span>}
      </div>
      {transactionsQuery.isPending && <div className="state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading transactions</h3><p>Fetching your latest portfolio activity…</p></div>}
      {transactionsQuery.isError && <ErrorState title="We couldn’t load transactions" message={transactionsQuery.error.message} retry={() => void transactionsQuery.refetch()} />}
      {transactionsQuery.data?.length === 0 && <div className="empty-state"><div className="transaction-mark" aria-hidden="true">↕</div><h3>No transactions yet</h3><p>Record a buy or sell to begin building this portfolio&rsquo;s activity history.</p></div>}
      {transactionsQuery.data && transactionsQuery.data.length > 0 && <TransactionTable transactions={transactionsQuery.data} />}
    </section>
  );
}

function TransactionTable({ transactions }: { transactions: TransactionResponse[] }) {
  return (
    <div className="table-scroll">
      <table className="holdings-table transactions-table">
        <thead><tr><th>Date</th><th>Asset</th><th>Type</th><th>Quantity</th><th>Price</th><th>Realized P&amp;L</th></tr></thead>
        <tbody>{transactions.map((transaction) => {
          const createdAt = new Date(transaction.createdAt);
          const validDate = !Number.isNaN(createdAt.getTime());
          return <tr key={transaction.id}>
            <td><time dateTime={transaction.createdAt}>{validDate ? dateFormatter.format(createdAt) : transaction.createdAt}</time></td>
            <td><strong>{transaction.assetSymbol}</strong></td>
            <td><span className={`transaction-type ${transaction.type.toLowerCase()}`}>{transaction.type === "BUY" ? "Buy" : "Sell"}</span></td>
            <td>{numberFormatter.format(transaction.quantity)}</td>
            <td>{numberFormatter.format(transaction.price)}</td>
            <td className={transaction.realizedPnL === null ? "" : transaction.realizedPnL >= 0 ? "positive" : "negative"}>{transaction.realizedPnL === null ? "—" : numberFormatter.format(transaction.realizedPnL)}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
}

function TransactionForm({ portfolioId, portfolioName, close, saved }: { portfolioId: number; portfolioName: string; close: () => void; saved: () => void }) {
  const queryClient = useQueryClient();
  const { mode, source } = useDataSource();
  const assetsQuery = useQuery(assetsQueryOptions(source, mode));
  const [assetId, setAssetId] = useState<number | null>(null);
  const [type, setType] = useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const activeAssets = assetsQuery.data?.filter((asset) => asset.isActive) ?? [];
  const selectedAssetId = activeAssets.some((asset) => asset.id === assetId) ? assetId : activeAssets[0]?.id ?? null;

  const createMutation = useMutation({
    mutationFn: wealthHubApi.createTransaction,
    onSuccess: async (_, request) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.byPortfolio(mode, request.portfolioId) }),
        queryClient.invalidateQueries({ queryKey: portfolioKeys.summary(mode, request.portfolioId) }),
        queryClient.invalidateQueries({ queryKey: portfolioKeys.holdings(mode, request.portfolioId) }),
      ]);
      saved();
      close();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(price);
    if (selectedAssetId === null) {
      setValidationError("Choose an active asset before submitting.");
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setValidationError("Quantity must be greater than zero.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setValidationError("Price must be greater than zero.");
      return;
    }
    createMutation.mutate({ portfolioId, assetId: selectedAssetId, type, quantity: parsedQuantity, price: parsedPrice });
  }

  return (
    <section className="content-card transaction-composer" aria-labelledby="new-transaction-title">
      <div className="section-heading"><div><p className="eyebrow">New activity</p><h2 id="new-transaction-title">New transaction</h2></div><button className="close-button" type="button" aria-label="Close new transaction" onClick={close}>×</button></div>
      <form className="transaction-form" onSubmit={submit} noValidate>
        <label className="form-field"><span>Portfolio</span><input value={portfolioName} readOnly /></label>
        <label className="form-field"><span>Asset</span><select value={selectedAssetId ?? ""} onChange={(event) => setAssetId(Number(event.target.value))} disabled={assetsQuery.isPending || activeAssets.length === 0} required><option value="" disabled>{assetsQuery.isPending ? "Loading assets…" : "Select an asset"}</option>{activeAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.symbol} — {asset.name}</option>)}</select></label>
        <fieldset className="type-field"><legend>Type</legend><div className="type-options"><label className={type === "BUY" ? "selected" : ""}><input type="radio" name="transaction-type" value="BUY" checked={type === "BUY"} onChange={() => setType("BUY")} /><strong>Buy</strong><span>Add to holdings</span></label><label className={type === "SELL" ? "selected" : ""}><input type="radio" name="transaction-type" value="SELL" checked={type === "SELL"} onChange={() => setType("SELL")} /><strong>Sell</strong><span>Reduce holdings</span></label></div></fieldset>
        <label className="form-field"><span>Quantity</span><input type="number" inputMode="decimal" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="0" required /></label>
        <label className="form-field"><span>Price</span><input type="number" inputMode="decimal" min="0" step="any" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" required /></label>
        {assetsQuery.isError && <div className="form-error" role="alert"><span>Assets could not be loaded. {assetsQuery.error.message}</span><button type="button" onClick={() => void assetsQuery.refetch()}>Try again</button></div>}
        {assetsQuery.data && activeAssets.length === 0 && <p className="form-error" role="status">There are no active assets available for a transaction.</p>}
        {validationError && <p className="form-error" role="alert">{validationError}</p>}
        {createMutation.isError && <p className="form-error" role="alert">Transaction could not be saved. {createMutation.error.message}</p>}
        <div className="form-actions"><button className="secondary-button" type="button" onClick={close} disabled={createMutation.isPending}>Cancel</button><button className="primary-button" type="submit" disabled={createMutation.isPending || assetsQuery.isPending || activeAssets.length === 0}>{createMutation.isPending ? "Saving transaction…" : "Save transaction"}</button></div>
      </form>
    </section>
  );
}

export function Transactions() {
  const { mode, source } = useDataSource();
  const portfoliosQuery = useQuery(portfoliosQueryOptions(source, mode));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const activePortfolioId = portfoliosQuery.data?.some(({ id }) => id === selectedId) ? selectedId : portfoliosQuery.data?.[0]?.id ?? null;
  const selectedPortfolio = portfoliosQuery.data?.find(({ id }) => id === activePortfolioId);

  function selectPortfolio(portfolioId: number) {
    setSelectedId(portfolioId);
    setShowSuccess(false);
    setShowComposer(false);
  }

  return <AppShell>
    <header className="page-header transactions-header"><div><p className="eyebrow">Activity</p><h1>Transactions</h1><p className="subtitle">Record and review the trades that shape your portfolio.</p></div>{portfoliosQuery.data && portfoliosQuery.data.length > 0 && <div className="header-actions"><label className="portfolio-picker"><span>Portfolio</span><select value={activePortfolioId ?? ""} onChange={(event) => selectPortfolio(Number(event.target.value))}>{portfoliosQuery.data.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>)}</select></label>{mode === "api" ? <button className="primary-button" type="button" aria-expanded={showComposer} onClick={() => { setShowComposer((open) => !open); setShowSuccess(false); }}><span aria-hidden="true">+</span> New transaction</button> : <span className="demo-readonly">Sample activity is read-only</span>}</div>}</header>
    {portfoliosQuery.isPending && <section className="content-card state-message" aria-live="polite"><div className="loading-mark" /><h3>Loading your portfolios</h3><p>Preparing your transaction workspace…</p></section>}
    {portfoliosQuery.isError && <section className="content-card"><ErrorState title="We couldn’t load your portfolios" message={portfoliosQuery.error.message} retry={() => void portfoliosQuery.refetch()} /></section>}
    {portfoliosQuery.data?.length === 0 && <section className="content-card"><div className="section-heading"><div><p className="eyebrow">Get started</p><h2>Transaction activity</h2></div><span className="quiet-label">No portfolios</span></div><div className="empty-state"><div className="transaction-mark" aria-hidden="true">↗</div><h3>No portfolios yet</h3><p>Add a portfolio before recording its first transaction.</p></div></section>}
    {selectedPortfolio && <div className="transactions-layout">{showSuccess && mode === "api" && <div className="success-message" role="status">Transaction saved. Portfolio values and holdings are being refreshed.</div>}{showComposer && mode === "api" && <TransactionForm portfolioId={selectedPortfolio.id} portfolioName={selectedPortfolio.name} close={() => setShowComposer(false)} saved={() => setShowSuccess(true)} />}<TransactionHistory portfolioId={selectedPortfolio.id} portfolioName={selectedPortfolio.name} /></div>}
  </AppShell>;
}
