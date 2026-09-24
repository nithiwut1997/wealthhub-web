"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { dataSources, type DataMode, type WealthHubDataSource } from "@/lib/data-source";

const STORAGE_KEY = "wealthhub-data-mode";
type DataSourceContextValue = { mode: DataMode; source: WealthHubDataSource; setMode: (mode: DataMode) => void };
const DataSourceContext = createContext<DataSourceContextValue | null>(null);

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DataMode>("demo");
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    if (savedMode === "demo" || savedMode === "api") setModeState(savedMode);
  }, []);

  const value = useMemo(() => ({
    mode,
    source: dataSources[mode],
    setMode(nextMode: DataMode) {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
      setModeState(nextMode);
      queryClient.cancelQueries();
    },
  }), [mode, queryClient]);

  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>;
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) throw new Error("useDataSource must be used within DataSourceProvider.");
  return context;
}
