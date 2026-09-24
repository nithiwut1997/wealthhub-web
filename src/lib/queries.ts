import { queryOptions } from "@tanstack/react-query";
import { wealthHubApi } from "@/lib/api";

export const portfolioKeys = {
  all: ["portfolios"] as const,
  summary: (portfolioId: number | null) => ["portfolio-summary", portfolioId] as const,
  holdings: (portfolioId: number | null) => ["portfolio-holdings", portfolioId] as const,
};

export const assetKeys = {
  all: ["assets"] as const,
};

export const transactionKeys = {
  byPortfolio: (portfolioId: number | null) => ["transactions", portfolioId] as const,
};

export const portfoliosQueryOptions = () =>
  queryOptions({
    queryKey: portfolioKeys.all,
    queryFn: wealthHubApi.getPortfolios,
  });

export const portfolioSummaryQueryOptions = (portfolioId: number | null) =>
  queryOptions({
    queryKey: portfolioKeys.summary(portfolioId),
    queryFn: () => wealthHubApi.getPortfolioSummary(portfolioId!),
    enabled: portfolioId !== null,
  });

export const portfolioHoldingsQueryOptions = (portfolioId: number | null) =>
  queryOptions({
    queryKey: portfolioKeys.holdings(portfolioId),
    queryFn: () => wealthHubApi.getHoldings(portfolioId!),
    enabled: portfolioId !== null,
  });

export const assetsQueryOptions = () =>
  queryOptions({
    queryKey: assetKeys.all,
    queryFn: wealthHubApi.getAssets,
  });

export const transactionsQueryOptions = (portfolioId: number | null) =>
  queryOptions({
    queryKey: transactionKeys.byPortfolio(portfolioId),
    queryFn: () => wealthHubApi.getTransactions(portfolioId!),
    enabled: portfolioId !== null,
  });
