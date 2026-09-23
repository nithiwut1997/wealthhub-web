import type { IconName } from "@/components/icons";

export const navigation: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Portfolios", href: "/portfolios", icon: "portfolios" },
  { label: "Assets", href: "/assets", icon: "assets" },
  { label: "Transactions", href: "/transactions", icon: "transactions" },
];
