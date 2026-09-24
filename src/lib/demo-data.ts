import type {
  AssetResponse,
  DashboardPortfolioResponse,
  DashboardResponse,
  HoldingResponse,
  PortfolioResponse,
  PortfolioSummaryResponse,
  TransactionResponse,
} from "@/lib/api";

const portfolios: PortfolioResponse[] = [
  { id: 1001, name: "Thai Stocks", baseCurrency: "THB" },
  { id: 1002, name: "Mutual Funds", baseCurrency: "THB" },
];

const assets: AssetResponse[] = [
  { id: 2001, symbol: "ADVANC", name: "Advanced Info Service", market: "SET", type: "STOCK", currency: "THB", externalId: null, isActive: true },
  { id: 2002, symbol: "CPALL", name: "CP All", market: "SET", type: "STOCK", currency: "THB", externalId: null, isActive: true },
  { id: 2003, symbol: "AOT", name: "Airports of Thailand", market: "SET", type: "STOCK", currency: "THB", externalId: null, isActive: true },
  { id: 2004, symbol: "KFSMART-A", name: "Krungsri Smart Fixed Income Fund", market: "TH", type: "MUTUAL_FUND", currency: "THB", externalId: null, isActive: true },
  { id: 2005, symbol: "K-GINCOME-A(A)", name: "K Global Income Fund", market: "TH", type: "MUTUAL_FUND", currency: "THB", externalId: null, isActive: true },
  { id: 2006, symbol: "SCBSET-A", name: "SCB SET Index Fund", market: "TH", type: "MUTUAL_FUND", currency: "THB", externalId: null, isActive: true },
];

const holdingsByPortfolio: Record<number, HoldingResponse[]> = {
  1001: [
    { id: 3001, assetId: 2001, symbol: "ADVANC", name: "Advanced Info Service", quantity: 600, averageCost: 205, latestPrice: 229, costBasis: 123000, marketValue: 137400, unrealizedPnL: 14400 },
    { id: 3002, assetId: 2002, symbol: "CPALL", name: "CP All", quantity: 1200, averageCost: 62.5, latestPrice: 66, costBasis: 75000, marketValue: 79200, unrealizedPnL: 4200 },
    { id: 3003, assetId: 2003, symbol: "AOT", name: "Airports of Thailand", quantity: 1000, averageCost: 64, latestPrice: 61.25, costBasis: 64000, marketValue: 61250, unrealizedPnL: -2750 },
  ],
  1002: [
    { id: 3004, assetId: 2004, symbol: "KFSMART-A", name: "Krungsri Smart Fixed Income Fund", quantity: 12000, averageCost: 10.13333333, latestPrice: 10.65, costBasis: 121600, marketValue: 127800, unrealizedPnL: 6200 },
    { id: 3005, assetId: 2005, symbol: "K-GINCOME-A(A)", name: "K Global Income Fund", quantity: 8000, averageCost: 12.5, latestPrice: 11.9, costBasis: 100000, marketValue: 95200, unrealizedPnL: -4800 },
    { id: 3006, assetId: 2006, symbol: "SCBSET-A", name: "SCB SET Index Fund", quantity: 4000, averageCost: 15, latestPrice: null, costBasis: 60000, marketValue: null, unrealizedPnL: null },
  ],
};

const transactions: TransactionResponse[] = [
  { id: 4005, portfolioId: 1002, assetId: 2004, assetSymbol: "KFSMART-A", type: "SELL", quantity: 3000, price: 10.8, realizedPnL: 2000, createdAt: "2026-08-18T09:15:00Z" },
  { id: 4004, portfolioId: 1002, assetId: 2006, assetSymbol: "SCBSET-A", type: "BUY", quantity: 4000, price: 15, realizedPnL: null, createdAt: "2026-07-22T08:30:00Z" },
  { id: 4003, portfolioId: 1001, assetId: 2002, assetSymbol: "CPALL", type: "BUY", quantity: 1200, price: 62.5, realizedPnL: null, createdAt: "2026-06-10T10:00:00Z" },
  { id: 4002, portfolioId: 1002, assetId: 2004, assetSymbol: "KFSMART-A", type: "BUY", quantity: 15000, price: 10.13333333, realizedPnL: null, createdAt: "2026-04-15T09:45:00Z" },
  { id: 4001, portfolioId: 1001, assetId: 2001, assetSymbol: "ADVANC", type: "BUY", quantity: 600, price: 205, realizedPnL: null, createdAt: "2026-02-03T08:00:00Z" },
];

function requirePortfolio(portfolioId: number) {
  const portfolio = portfolios.find(({ id }) => id === portfolioId);
  if (!portfolio) throw new Error("Demo portfolio not found.");
  return portfolio;
}

function deriveValuation(portfolio: PortfolioResponse): DashboardPortfolioResponse {
  const holdings = holdingsByPortfolio[portfolio.id] ?? [];
  const priced = holdings.filter((holding) => holding.latestPrice !== null && holding.marketValue !== null);
  const totalCost = holdings.reduce((total, holding) => total + holding.costBasis, 0);
  const totalMarketValue = priced.reduce((total, holding) => total + holding.marketValue!, 0);
  const pricedCost = priced.reduce((total, holding) => total + holding.costBasis, 0);
  const unrealizedGainLoss = totalMarketValue - pricedCost;

  return {
    portfolioId: portfolio.id,
    portfolioName: portfolio.name,
    totalCost,
    totalMarketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent: pricedCost === 0 ? 0 : (unrealizedGainLoss / pricedCost) * 100,
    holdingCount: holdings.length,
    pricedHoldingCount: priced.length,
    missingPriceCount: holdings.length - priced.length,
  };
}

function deriveDashboard(): DashboardResponse {
  const breakdown = portfolios.map(deriveValuation);
  const allHoldings = Object.values(holdingsByPortfolio).flat();
  const totalMarketValue = breakdown.reduce((total, item) => total + item.totalMarketValue, 0);
  const unrealizedGainLoss = breakdown.reduce((total, item) => total + item.unrealizedGainLoss, 0);
  const pricedCost = totalMarketValue - unrealizedGainLoss;

  return {
    baseCurrency: "THB",
    portfolioCount: portfolios.length,
    holdingCount: allHoldings.length,
    assetCount: new Set(allHoldings.map(({ assetId }) => assetId)).size,
    totalCost: breakdown.reduce((total, item) => total + item.totalCost, 0),
    totalMarketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent: pricedCost === 0 ? 0 : (unrealizedGainLoss / pricedCost) * 100,
    pricedHoldingCount: breakdown.reduce((total, item) => total + item.pricedHoldingCount, 0),
    missingPriceCount: breakdown.reduce((total, item) => total + item.missingPriceCount, 0),
    portfolios: breakdown,
  };
}

function deriveSummary(portfolioId: number): PortfolioSummaryResponse {
  const portfolio = requirePortfolio(portfolioId);
  const valuation = deriveValuation(portfolio);
  return { ...valuation, baseCurrency: portfolio.baseCurrency, updatedAt: "2026-09-23T10:00:00Z" };
}

export const demoDataSource = {
  getDashboard: async () => deriveDashboard(),
  getPortfolios: async () => portfolios,
  getPortfolioSummary: async (portfolioId: number) => deriveSummary(portfolioId),
  getHoldings: async (portfolioId: number) => holdingsByPortfolio[requirePortfolio(portfolioId).id] ?? [],
  getAssets: async () => assets,
  getTransactions: async (portfolioId: number) => {
    requirePortfolio(portfolioId);
    return transactions.filter((transaction) => transaction.portfolioId === portfolioId);
  },
};
