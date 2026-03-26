import { profileOptions, urgencyOptions } from "../constants";
import Field from "../../../shared/ui/Field";
import Button from "../../../shared/ui/Button";
import type { HistoryFilters } from "../types";

type Props = {
  filters: HistoryFilters;
  onChange: (patch: Partial<HistoryFilters>) => void;
  onSearch: () => void;
};

export default function HistoryFilters({
  filters,
  onChange,
  onSearch,
}: Props) {
  return (
    <div className="filter-grid">
      <Field label="Urgencia">
        <select
          className="select"
          value={filters.urgencyLevel}
          onChange={(e) => onChange({ urgencyLevel: e.target.value, page: 1 })}
        >
          {urgencyOptions.map((option) => (
            <option key={option} value={option}>
              {option || "Todas"}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Perfil">
        <select
          className="select"
          value={filters.clinicalProfile}
          onChange={(e) => onChange({ clinicalProfile: e.target.value, page: 1 })}
        >
          {profileOptions.map((option) => (
            <option key={option} value={option}>
              {option || "Todos"}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Fecha desde">
        <input
          className="input"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value, page: 1 })}
        />
      </Field>

      <Field label="Fecha hasta">
        <input
          className="input"
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value, page: 1 })}
        />
      </Field>

      <div className="field filter-search-span">
        <label className="label">Búsqueda</label>
        <div className="search-row">
          <input
            className="input"
            placeholder="Buscar en resumen o recomendación"
            value={filters.searchTerm}
            onChange={(e) => onChange({ searchTerm: e.target.value })}
          />
          <Button onClick={onSearch}>Buscar</Button>
        </div>
      </div>

      <Field label="Ordenar por">
        <select
          className="select"
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value, page: 1 })}
        >
          <option value="createdAt">Fecha</option>
          <option value="age">Edad</option>
          <option value="phq9Score">PHQ-9</option>
          <option value="gad7Score">GAD-7</option>
          <option value="urgencyLevel">Urgencia</option>
          <option value="clinicalProfile">Perfil</option>
        </select>
      </Field>

      <Field label="Dirección">
        <select
          className="select"
          value={filters.sortDirection}
          onChange={(e) => onChange({ sortDirection: e.target.value, page: 1 })}
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </Field>
    </div>
  );
}