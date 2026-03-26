import { Link } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Panel from "../../../shared/ui/Panel";
import StatusMessage from "../../../shared/ui/StatusMessage";
import type { HistoryFilters, PagedResult, TriageListItem } from "../types";
import HistoryFilters1 from "./HistoryFilters";

type Props = {
  filters: HistoryFilters;
  history: PagedResult<TriageListItem> | null;
  loadingHistory: boolean;
  historyError: string | null;
  onFiltersChange: (patch: Partial<HistoryFilters>) => void;
  onSearch: () => void;
  onReload: () => void;
};

export default function HistoryList({
  filters,
  history,
  loadingHistory,
  historyError,
  onFiltersChange,
  onSearch,
  onReload,
}: Props) {
  return (
    <Panel>
      <div className="history-header">
        <h2 className="section-title">Historial</h2>
        <Button variant="secondary" onClick={onReload}>
          Recargar
        </Button>
      </div>

      <div className="history-filters-wrap">
        <HistoryFilters1
          filters={filters}
          onChange={onFiltersChange}
          onSearch={onSearch}
        />
      </div>

      {historyError && <StatusMessage kind="error" message={historyError} />}

      <div className="history-list">
        {loadingHistory ? (
          <div className="section-card muted-text">Cargando historial...</div>
        ) : history?.items.length ? (
          history.items.map((item) => (
            <article key={item.id} className="section-card">
              <div className="history-card-head">
                <div>
                  <div className="history-card-title">Evaluación #{item.id}</div>
                  <div className="history-card-subtitle">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                <span className="tag">{item.urgencyLevel}</span>
              </div>

              <div className="history-card-grid">
                <div className="muted-card">
                  Edad: <strong>{item.age}</strong>
                </div>
                <div className="muted-card">
                  Perfil: <strong>{item.clinicalProfile}</strong>
                </div>
                <div className="muted-card">
                  PHQ-9: <strong>{item.phq9Score}</strong>
                </div>
                <div className="muted-card">
                  GAD-7: <strong>{item.gad7Score}</strong>
                </div>
              </div>

              <div className="history-card-actions">
                <Link to={`/history/${item.id}`} className="btn btn-secondary">
                  Ver detalle
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="section-card muted-text">
            No hay evaluaciones para los filtros seleccionados.
          </div>
        )}
      </div>

      <div className="pagination-row">
        <div className="pagination-text">
          Página {history?.page ?? filters.page} de {history?.totalPages ?? 1} ·
          Total: {history?.totalCount ?? 0}
        </div>

        <div className="actions-group">
          <select
            className="select page-size-select"
            value={filters.pageSize}
            onChange={(e) =>
              onFiltersChange({ pageSize: Number(e.target.value), page: 1 })
            }
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            disabled={!history?.hasPreviousPage}
            onClick={() => onFiltersChange({ page: Math.max(1, filters.page - 1) })}
          >
            Anterior
          </Button>

          <Button
            variant="secondary"
            disabled={!history?.hasNextPage}
            onClick={() => onFiltersChange({ page: filters.page + 1 })}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Panel>
  );
}