import type { TriageRequest } from "../../types";

type Props = {
  form: TriageRequest;
  phqScore: number;
  gadScore: number;
};

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="section-card">
      <div className="review-label">{label}</div>
      <div className="review-value">{value}</div>
    </div>
  );
}

export default function StepReview({ form, phqScore, gadScore }: Props) {
  return (
    <div className="step-stack">
      <div>
        <h3 className="section-title">Resumen antes de enviar</h3>
        <p className="muted-text">
          Revisa los datos clave del triage antes de solicitar la clasificación.
        </p>
      </div>

      <div className="summary-grid">
        <ReviewCard label="Edad" value={String(form.age)} />
        <ReviewCard label="Soporte social" value={`${form.socialSupportLevel}/10`} />
        <ReviewCard label="PHQ-9" value={String(phqScore)} />
        <ReviewCard label="GAD-7" value={String(gadScore)} />
      </div>

      <div className="summary-grid">
        <ReviewCard label="Ideación suicida" value={form.suicidalIdeation ? "Sí" : "No"} />
        <ReviewCard
          label="Antecedente de autolesión"
          value={form.selfHarmHistory ? "Sí" : "No"}
        />
        <ReviewCard
          label="Deterioro funcional"
          value={form.functionalImpairment ? "Sí" : "No"}
        />
        <ReviewCard
          label="Consumo de sustancias"
          value={form.substanceUse ? "Sí" : "No"}
        />
      </div>
    </div>
  );
}