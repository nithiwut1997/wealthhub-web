import type {
  AssetResponse,
  HoldingResponse,
  PortfolioResponse,
  PortfolioSummaryResponse,
  TransactionResponse,
} from "@/lib/api";

const portfolio: PortfolioResponse = {
  id: 1001,
  name: "Thai Fund Sample Portfolio",
  baseCurrency: "THB",
};

const assets: AssetResponse[] = [
  { id: 2001, symbol: "KFSMART-A", name: "Krungsri Smart Fixed Income Fund", market: "TH", type: "MUTUAL_FUND", currency: "THB", externalId: null, isActive: true },
  { id: 2002, symbol: "K-GINCOME-A(A)", name: "K Global Income Fund", market: "TH", type: "MUTUAL_FUND", currency: "THB", externalId: null, isActive: true },
  { id: 2003, symbol: "SCBSET-A", name: "SCB SET Index Fund", market: "TH", type: "MUTUAL_FUND", currency: "THB", externalId: null, isActive: true },
];

const holdings: HoldingResponse[] = [
  { id: 3001, assetId: 2001, symbol: "KFSMART-A", name: "Krungsri Smart Fixed Income Fund", quantity: 12000, averageCost: 10.13333333, latestPrice: 10.65, costBasis: 121600, marketValue: 127800, unrealizedPnL: 6200 },
  { id: 3002, assetId: 2002, symbol: "K-GINCOME-A(A)", name: "K Global Income Fund", quantity: 8000, averageCost: 12.5, latestPrice: 11.9, costBasis: 100000, marketValue: 95200, unrealizedPnL: -4800 },
  { id: 3003, assetId: 2003, symbol: "SCBSET-A", name: "SCB SET Index Fund", quantity: 4000, averageCost: 15, latestPrice: null, costBasis: 60000, marketValue: null, unrealizedPnL: null },
];

const transactions: TransactionResponse[] = [
  { id: 4005, portfolioId: 1001, assetId: 2001, assetSymbol: "KFSMART-A", type: "SELL", quantity: 3000, price: 10.8, realizedPnL: 2000, createdAt: "2026-08-18T09:15:00Z" },
  { id: 4004, portfolioId: 1001, assetId: 2003, assetSymbol: "SCBSET-A", type: "BUY", quantity: 4000, price: 15, realizedPnL: null, createdAt: "2026-07-22T08:30:00Z" },
  { id: 4003, portfolioId: 1001, assetId: 2002, assetSymbol: "K-GINCOME-A(A)", type: "BUY", quantity: 8000, price: 12.5, realizedPnL: null, createdAt: "2026-06-10T10:00:00Z" },
  { id: 4002, portfolioId: 1001, assetId: 2001, assetSymbol: "KFSMART-A", type: "BUY", quantity: 5000, price: 10.4, realizedPnL: null, createdAt: "2026-04-15T09:45:00Z" },
  { id: 4001, portfolioId: 1001, assetId: 2001, assetSymbol: "KFSMART-A", type: "BUY", quantity: 10000, price: 10, realizedPnL: null, createdAt: "2026-02-03T08:00:00Z" },
];

const summary: PortfolioSummaryResponse = {
  portfolioId: portfolio.id,
  portfolioName: portfolio.name,
  baseCurrency: portfolio.baseCurrency,
  holdingCount: holdings.length,
  totalCost: 281600,
  totalMarketValue: 223000,
  unrealizedGainLoss: 1400,
  unrealizedGainLossPercent: 0.63,
  updatedAt: "2026-09-23T10:00:00Z",
};

function requirePortfolio(portfolioId: number) {
  if (portfolioId !== portfolio.id) throw new Error("Demo portfolio not found.");
}

export const demoDataSource = {
  getPortfolios: async () => [portfolio],
  getPortfolioSummary: async (portfolioId: number) => { requirePortfolio(portfolioId); return summary; },
  getHoldings: async (portfolioId: number) => { requirePortfolio(portfolioId); return holdings; },
  getAssets: async () => assets,
  getTransactions: async (portfolioId: number) => { requirePortfolio(portfolioId); return transactions; },
};
