import { AppShell } from "@/components/app-shell";

export default function Dashboard() {
  return (
    <AppShell>
      <header className="page-header">
        <div><p className="eyebrow">Overview</p><h1>Good morning.</h1><p className="subtitle">Here&rsquo;s a clear view of your wealth.</p></div>
        <button className="primary-button" type="button"><span aria-hidden="true">＋</span> Add portfolio</button>
      </header>

      <section className="summary-grid" aria-label="Portfolio summary">
        <article className="summary-card featured"><p>Total net worth</p><div className="empty-value">—</div><span>Add a portfolio to see your balance</span></article>
        <article className="summary-card"><p>Invested assets</p><div className="empty-value">—</div><span>No assets connected yet</span></article>
        <article className="summary-card"><p>Today&rsquo;s change</p><div className="empty-value">—</div><span>Updates will appear here</span></article>
      </section>

      <section className="content-card">
        <div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Portfolio overview</h2></div><span className="quiet-label">No portfolios</span></div>
        <div className="empty-state"><div className="empty-illustration" aria-hidden="true"><span className="bar bar-one"/><span className="bar bar-two"/><span className="bar bar-three"/></div><h3>Start building your financial picture</h3><p>Create your first portfolio to bring your investments together in one calm, organized place.</p><button className="secondary-button" type="button">Create a portfolio</button></div>
      </section>
    </AppShell>
  );
}
