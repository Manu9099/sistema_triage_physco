import { env } from "../../../shared/config/env";
import type {
  HistoryFilters,
  PagedResult,
  TriageDetail,
  TriageListItem,
  TriageRequest,
  TriageResult,
} from "../types";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.detail || data?.title || "Ocurrió un error inesperado.";
}

export async function evaluateTriage(payload: TriageRequest): Promise<TriageResult> {
  const response = await fetch(`${env.apiBaseUrl}/api/Triage/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export function buildHistoryUrl(filters: HistoryFilters): string {
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

  return `${env.apiBaseUrl}/api/Triage?${params.toString()}`;
}

export async function getTriageHistory(
  filters: HistoryFilters
): Promise<PagedResult<TriageListItem>> {
  const response = await fetch(buildHistoryUrl(filters));

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function getTriageById(id: number): Promise<TriageDetail> {
  const response = await fetch(`${env.apiBaseUrl}/api/Triage/${id}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}