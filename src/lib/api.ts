const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export type Portfolio = {
  id: number;
  name: string;
};

export type HoldingValuation = {
  assetId: number;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  latestPrice: number | null;
  marketValue: number | null;
  unrealizedGainLoss: number | null;
};

export type PortfolioValuation = {
  portfolioId: number;
  totalMarketValue: number;
  totalCost: number;
  totalUnrealizedGainLoss: number;
  holdings: HoldingValuation[];
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
  getPortfolios: () => get<Portfolio[]>("/api/portfolios"),
  getPortfolioValuation: (portfolioId: number) =>
    get<PortfolioValuation>(`/api/portfolios/${portfolioId}/valuation`),
};
