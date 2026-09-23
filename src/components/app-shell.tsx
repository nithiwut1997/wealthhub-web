import Link from "next/link";
import { Navigation } from "@/components/navigation";

function Brand() {
  return <Link href="/" className="brand" aria-label="WealthHub home"><span className="brand-mark" aria-hidden="true"><span /></span><span>WealthHub</span></Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <Navigation className="primary-nav" />
        <div className="sidebar-note"><span className="status-dot" />All your wealth,<br />one clear view.</div>
      </aside>
      <div className="mobile-header"><Brand /><div className="avatar">NW</div></div>
      <main className="main-content">{children}</main>
      <Navigation className="mobile-nav" />
    </div>
  );
}
