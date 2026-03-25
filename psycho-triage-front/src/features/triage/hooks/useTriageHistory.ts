import { useCallback, useEffect, useState } from "react";
import { getTriageHistory } from "../services/triageApi";
import type { HistoryFilters, PagedResult, TriageListItem } from "../types";

export function useTriageHistory(apiBaseUrl: string, filters: HistoryFilters) {
  const [history, setHistory] = useState<PagedResult<TriageListItem> | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);

    try {
      const data = await getTriageHistory(apiBaseUrl, filters);
      setHistory(data);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "No se pudo cargar el historial.");
    } finally {
      setLoadingHistory(false);
    }
  }, [apiBaseUrl, filters]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return {
    history,
    loadingHistory,
    historyError,
    reloadHistory: loadHistory,
  };
}