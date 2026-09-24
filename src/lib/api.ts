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

export type DashboardPortfolioResponse = {
  portfolioId: number;
  portfolioName: string;
  totalCost: number;
  totalMarketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  holdingCount: number;
  pricedHoldingCount: number;
  missingPriceCount: number;
};

export type DashboardResponse = {
  baseCurrency: string;
  portfolioCount: number;
  holdingCount: number;
  assetCount: number;
  totalCost: number;
  totalMarketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  pricedHoldingCount: number;
  missingPriceCount: number;
  portfolios: DashboardPortfolioResponse[];
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

export type AssetResponse = {
  id: number;
  symbol: string;
  name: string;
  market: string;
  type: "STOCK" | "MUTUAL_FUND";
  currency: string;
  externalId: string | null;
  isActive: boolean;
};

export type CreatePortfolioRequest = {
  name: string;
};

export type CreateAssetRequest = {
  symbol: string;
  name: string;
  market: string;
  type: AssetResponse["type"];
  currency: string;
  externalId: string | null;
};

export type TransactionType = "BUY" | "SELL";

export type TransactionResponse = {
  id: number;
  portfolioId: number;
  assetId: number;
  assetSymbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  realizedPnL: number | null;
  createdAt: string;
};

export type CreateTransactionRequest = {
  portfolioId: number;
  assetId: number;
  type: TransactionType;
  quantity: number;
  price: number;
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

async function post<TResponse, TRequest>(path: string, request: TRequest): Promise<TResponse> {
  if (!apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.", 0);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(body?.message ?? `The WealthHub API returned ${response.status}.`, response.status);
  }

  return response.json() as Promise<TResponse>;
}

export const wealthHubApi = {
  getDashboard: () => get<DashboardResponse>("/api/v1/dashboard"),
  getPortfolios: () => get<PortfolioResponse[]>("/api/v1/portfolios"),
  createPortfolio: (request: CreatePortfolioRequest) =>
    post<PortfolioResponse, CreatePortfolioRequest>("/api/v1/portfolios", request),
  getPortfolioSummary: (portfolioId: number) =>
    get<PortfolioSummaryResponse>(`/api/v1/portfolios/${portfolioId}/summary`),
  getHoldings: (portfolioId: number) =>
    get<HoldingResponse[]>(`/api/v1/holdings?portfolioId=${encodeURIComponent(portfolioId)}`),
  getAssets: () => get<AssetResponse[]>("/api/v1/assets"),
  createAsset: (request: CreateAssetRequest) =>
    post<AssetResponse, CreateAssetRequest>("/api/v1/assets", request),
  getTransactions: (portfolioId: number) =>
    get<TransactionResponse[]>(`/api/v1/transactions?portfolioId=${encodeURIComponent(portfolioId)}`),
  createTransaction: (request: CreateTransactionRequest) =>
    post<TransactionResponse, CreateTransactionRequest>("/api/v1/transactions", request),
};
