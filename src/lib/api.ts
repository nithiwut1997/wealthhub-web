const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export type PortfolioResponse = {
  id: number;
  name: string;
  baseCurrency: string;
};

export type PortfolioSummaryResponse = {
  portfolioId: number;
  portfolioName: string;
  baseCurrency: string;
  holdingCount: number;
  totalCost: number;
  totalMarketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  updatedAt: string;
};

export type HoldingResponse = {
  id: number;
  assetId: number;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  latestPrice: number | null;
  costBasis: number;
  marketValue: number | null;
  unrealizedPnL: number | null;
};

type ApiErrorBody = {
  message?: string;
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function get<T>(path: string): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.", 0);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(body?.message ?? `The WealthHub API returned ${response.status}.`, response.status);
  }

  return response.json() as Promise<T>;
}

export const wealthHubApi = {
  getPortfolios: () => get<PortfolioResponse[]>("/api/v1/portfolios"),
  getPortfolioSummary: (portfolioId: number) =>
    get<PortfolioSummaryResponse>(`/api/v1/portfolios/${portfolioId}/summary`),
  getHoldings: (portfolioId: number) =>
    get<HoldingResponse[]>(`/api/v1/holdings?portfolioId=${encodeURIComponent(portfolioId)}`),
};
