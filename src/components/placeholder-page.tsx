import { AppShell } from "@/components/app-shell";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return <AppShell><header className="page-header"><div><p className="eyebrow">WealthHub</p><h1>{title}</h1><p className="subtitle">{description}</p></div></header><section className="content-card simple-placeholder"><p>This workspace is ready for a future WealthHub release.</p></section></AppShell>;
}
