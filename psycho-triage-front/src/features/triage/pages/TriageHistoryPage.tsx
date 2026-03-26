import { useState } from "react";
import { defaultHistoryFilters } from "../constants";
import { useTriageHistory } from "../hooks/useTriageHistory";
import type { HistoryFilters } from "../types";
import HistoryList from "../components/HistoryList";

export default function TriageHistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>(defaultHistoryFilters);

  const { history, loadingHistory, historyError, reloadHistory } =
    useTriageHistory(filters);

  function patchFilters(patch: Partial<HistoryFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  return (
    <HistoryList
      filters={filters}
      history={history}
      loadingHistory={loadingHistory}
      historyError={historyError}
      onFiltersChange={patchFilters}
      onSearch={() => patchFilters({ page: 1 })}
      onReload={() => void reloadHistory()}
    />
  );
}