import Panel from "../../../shared/ui/Panel";
import type { TriageResult } from "../types";

type Props = {
  result: TriageResult | null;
};

function ResultMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="muted-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export default function ResultSummary({ result }: Props) {
  return (
    <Panel>
      <h2 className="section-title">Resultado</h2>

      {!result ? (
        <p className="muted-text">
          Todavía no hay un resultado. Completa el wizard y envía el triage.
        </p>
      ) : (
        <div className="result-stack">
          <div className="result-grid">
            <ResultMetric label="Urgencia" value={result.urgencyLevel} />
            <ResultMetric label="Perfil clínico" value={result.clinicalProfile} />
            <ResultMetric label="PHQ-9" value={result.phq9Score} />
            <ResultMetric label="GAD-7" value={result.gad7Score} />
          </div>

          <div className="section-card">
            <div className="card-title">Resumen</div>
            <div className="card-body">{result.summary}</div>
          </div>

          <div className="section-card">
            <div className="card-title">Recomendación</div>
            <div className="card-body">{result.recommendation}</div>
          </div>
        </div>
      )}
    </Panel>
  );
}