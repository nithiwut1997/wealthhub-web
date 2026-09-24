"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { useDataSource } from "@/components/data-source-provider";

function Brand() {
  return <Link href="/" className="brand" aria-label="WealthHub home"><span className="brand-mark" aria-hidden="true"><span /></span><span>WealthHub</span></Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useDataSource();
  const dataControl = <label className="data-source-picker"><span className="sr-only">Data source</span><select aria-label="Data source" value={mode} onChange={(event) => setMode(event.target.value === "api" ? "api" : "demo")}><option value="demo">Demo data</option><option value="api">Live API</option></select></label>;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        {dataControl}
        <Navigation className="primary-nav" />
        <div className="sidebar-note"><span className="status-dot" />All your wealth,<br />one clear view.</div>
      </aside>
      <div className="mobile-header"><Brand />{dataControl}</div>
      <main className="main-content">{mode === "demo" && <div className="demo-notice" role="status"><strong>Sample portfolio</strong><span>Demo data for illustration only — not real investment data.</span></div>}{children}</main>
      <Navigation className="mobile-nav" />
    </div>
  );
}
