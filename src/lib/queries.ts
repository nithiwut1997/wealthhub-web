import { queryOptions } from "@tanstack/react-query";
import type { DataMode, WealthHubDataSource } from "@/lib/data-source";

export const portfolioKeys = {
  all: (mode: DataMode) => ["portfolios", mode] as const,
  summary: (mode: DataMode, portfolioId: number | null) => ["portfolio-summary", mode, portfolioId] as const,
  holdings: (mode: DataMode, portfolioId: number | null) => ["portfolio-holdings", mode, portfolioId] as const,
};

export const assetKeys = {
  all: (mode: DataMode) => ["assets", mode] as const,
};

export const transactionKeys = {
  byPortfolio: (mode: DataMode, portfolioId: number | null) => ["transactions", mode, portfolioId] as const,
};

export const portfoliosQueryOptions = (source: WealthHubDataSource, mode: DataMode) =>
  queryOptions({
    queryKey: portfolioKeys.all(mode),
    queryFn: source.getPortfolios,
  });

export const portfolioSummaryQueryOptions = (source: WealthHubDataSource, mode: DataMode, portfolioId: number | null) =>
  queryOptions({
    queryKey: portfolioKeys.summary(mode, portfolioId),
    queryFn: () => source.getPortfolioSummary(portfolioId!),
    enabled: portfolioId !== null,
  });

export const portfolioHoldingsQueryOptions = (source: WealthHubDataSource, mode: DataMode, portfolioId: number | null) =>
  queryOptions({
    queryKey: portfolioKeys.holdings(mode, portfolioId),
    queryFn: () => source.getHoldings(portfolioId!),
    enabled: portfolioId !== null,
  });

export const assetsQueryOptions = (source: WealthHubDataSource, mode: DataMode) =>
  queryOptions({
    queryKey: assetKeys.all(mode),
    queryFn: source.getAssets,
  });

export const transactionsQueryOptions = (source: WealthHubDataSource, mode: DataMode, portfolioId: number | null) =>
  queryOptions({
    queryKey: transactionKeys.byPortfolio(mode, portfolioId),
    queryFn: () => source.getTransactions(portfolioId!),
    enabled: portfolioId !== null,
  });
