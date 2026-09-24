import { wealthHubApi, type AssetResponse, type CreateAssetRequest, type CreatePortfolioRequest, type DashboardResponse, type HoldingResponse, type PortfolioResponse, type PortfolioSummaryResponse, type TransactionResponse } from "@/lib/api";
import { demoDataSource } from "@/lib/demo-data";

export type DataMode = "demo" | "api";

export type WealthHubDataSource = {
  getDashboard: () => Promise<DashboardResponse>;
  getPortfolios: () => Promise<PortfolioResponse[]>;
  getPortfolioSummary: (portfolioId: number) => Promise<PortfolioSummaryResponse>;
  getHoldings: (portfolioId: number) => Promise<HoldingResponse[]>;
  getAssets: () => Promise<AssetResponse[]>;
  getTransactions: (portfolioId: number) => Promise<TransactionResponse[]>;
  createPortfolio?: (request: CreatePortfolioRequest) => Promise<PortfolioResponse>;
  createAsset?: (request: CreateAssetRequest) => Promise<AssetResponse>;
};

export const dataSources: Record<DataMode, WealthHubDataSource> = {
  demo: demoDataSource,
  api: wealthHubApi,
};
