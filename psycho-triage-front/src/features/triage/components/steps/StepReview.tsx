import type { TriageRequest } from "../../types";

type Props = {
  form: TriageRequest;
  phqScore: number;
  gadScore: number;
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="section-card">
      <div style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function StepReview({ form, phqScore, gadScore }: Props) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Resumen antes de enviar</h3>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Revisa los datos clave del triage antes de solicitar la clasificación.
        </p>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Edad" value={String(form.age)} />
        <SummaryCard label="Soporte social" value={`${form.socialSupportLevel}/10`} />
        <SummaryCard label="PHQ-9" value={String(phqScore)} />
        <SummaryCard label="GAD-7" value={String(gadScore)} />
      </div>

      <div className="summary-grid">
        <SummaryCard label="Ideación suicida" value={form.suicidalIdeation ? "Sí" : "No"} />
        <SummaryCard
          label="Antecedente de autolesión"
          value={form.selfHarmHistory ? "Sí" : "No"}
        />
        <SummaryCard
          label="Deterioro funcional"
          value={form.functionalImpairment ? "Sí" : "No"}
        />
        <SummaryCard label="Consumo de sustancias" value={form.substanceUse ? "Sí" : "No"} />
      </div>
    </div>
  );
}