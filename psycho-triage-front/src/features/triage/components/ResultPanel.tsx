import type { TriageResult } from "../types";

type Props = {
  result: TriageResult | null;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="muted-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export default function ResultPanel({ result }: Props) {
  return (
    <section className="panel">
      <h2 style={{ marginTop: 0 }}>Resultado</h2>

      {!result ? (
        <p style={{ color: "var(--text-muted)" }}>
          Todavía no hay un resultado. Completa el wizard y envía el triage.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="result-grid">
            <Metric label="Urgencia" value={result.urgencyLevel} />
            <Metric label="Perfil clínico" value={result.clinicalProfile} />
            <Metric label="PHQ-9" value={result.phq9Score} />
            <Metric label="GAD-7" value={result.gad7Score} />
          </div>

          <div className="section-card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Resumen</div>
            <div style={{ color: "var(--text-soft)" }}>{result.summary}</div>
          </div>

          <div className="section-card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Recomendación</div>
            <div style={{ color: "var(--text-soft)" }}>{result.recommendation}</div>
          </div>
        </div>
      )}
    </section>
  );
}