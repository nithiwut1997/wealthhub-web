"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/components/nav-items";
import { Icon } from "@/components/icons";

export function Navigation({ className }: { className: string }) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label={className === "mobile-nav" ? "Mobile navigation" : "Primary navigation"}>
      {navigation.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return <Link key={item.label} href={item.href} className={`${className === "primary-nav" ? "nav-link " : ""}${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>;
      })}
    </nav>
  );
}
