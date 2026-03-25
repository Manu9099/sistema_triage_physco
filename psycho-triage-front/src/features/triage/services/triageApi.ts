import type {
  HistoryFilters,
  PagedResult,
  TriageListItem,
  TriageRequest,
  TriageResult,
} from "../types";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.detail || data?.title || "Ocurrió un error inesperado.";
}

export async function evaluateTriage(
  apiBaseUrl: string,
  payload: TriageRequest
): Promise<TriageResult> {
  const response = await fetch(`${apiBaseUrl}/api/Triage/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export function buildHistoryUrl(apiBaseUrl: string, filters: HistoryFilters): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  });

  if (filters.urgencyLevel) params.set("urgencyLevel", filters.urgencyLevel);
  if (filters.clinicalProfile) params.set("clinicalProfile", filters.clinicalProfile);
  if (filters.searchTerm.trim()) params.set("searchTerm", filters.searchTerm.trim());
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  return `${apiBaseUrl}/api/Triage?${params.toString()}`;
}

export async function getTriageHistory(
  apiBaseUrl: string,
  filters: HistoryFilters
): Promise<PagedResult<TriageListItem>> {
  const response = await fetch(buildHistoryUrl(apiBaseUrl, filters));

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}