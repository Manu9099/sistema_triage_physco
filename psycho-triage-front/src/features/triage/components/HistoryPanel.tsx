import HistoryFiltersComponent from "./HistoryFilters";
import type { HistoryFilters, PagedResult, TriageListItem } from "../types";
import { Link } from "react-router";

type Props = {
  filters: HistoryFilters;
  history: PagedResult<TriageListItem> | null;
  loadingHistory: boolean;
  historyError: string | null;
  onFiltersChange: (patch: Partial<HistoryFilters>) => void;
  onSearch: () => void;
  onReload: () => void;
};

export default function HistoryPanel({
  filters,
  history,
  loadingHistory,
  historyError,
  onFiltersChange,
  onSearch,
  onReload,
}: Props) {
  return (
    <section className="panel">
      <div className="history-header">
        <h2 style={{ margin: 0 }}>Historial</h2>
        <button type="button" className="btn btn-secondary" onClick={onReload}>
          Recargar
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <HistoryFiltersComponent
          filters={filters}
          onChange={onFiltersChange}
          onSearch={onSearch}
        />
      </div>

      {historyError && <div className="error-box" style={{ marginTop: 16 }}>{historyError}</div>}

      <div className="history-list">
        {loadingHistory ? (
          <div className="section-card" style={{ color: "var(--text-muted)" }}>
            
            Cargando historial...
          </div>
        ) : history?.items.length ? (
          history.items.map((item) => (
            <article key={item.id} className="section-card">
              <div style={{ marginTop: 12 }}>
            <Link to={`/history/${item.id}`} className="btn btn-secondary">
              Ver detalle
            </Link>
          </div>
              <div className="history-card-head">
                <div>
                  <div style={{ fontWeight: 700 }}>Evaluación #{item.id}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                <span className="tag">{item.urgencyLevel}</span>
              </div>

              <div className="history-card-grid">
                <div className="muted-card">Edad: <strong>{item.age}</strong></div>
                <div className="muted-card">Perfil: <strong>{item.clinicalProfile}</strong></div>
                <div className="muted-card">PHQ-9: <strong>{item.phq9Score}</strong></div>
                <div className="muted-card">GAD-7: <strong>{item.gad7Score}</strong></div>
              </div>
            </article>
          ))
        ) : (
          <div className="section-card" style={{ color: "var(--text-muted)" }}>
            No hay evaluaciones para los filtros seleccionados.
          </div>
        )}
      </div>

      <div className="pagination-row" style={{ marginTop: 18 }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Página {history?.page ?? filters.page} de {history?.totalPages ?? 1} · Total:{" "}
          {history?.totalCount ?? 0}
        </div>

        <div className="actions-group">
          <select
            className="select"
            style={{ width: 140 }}
            value={filters.pageSize}
            onChange={(e) => onFiltersChange({ pageSize: Number(e.target.value), page: 1 })}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={!history?.hasPreviousPage}
            onClick={() => onFiltersChange({ page: Math.max(1, filters.page - 1) })}
          >
            Anterior
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={!history?.hasNextPage}
            onClick={() => onFiltersChange({ page: filters.page + 1 })}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}