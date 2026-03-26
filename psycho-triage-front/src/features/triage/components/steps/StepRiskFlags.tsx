import type { TriageRequest } from "../../types";

type RiskKey =
  | "suicidalIdeation"
  | "selfHarmHistory"
  | "functionalImpairment"
  | "substanceUse";

type Props = {
  form: TriageRequest;
  onToggle: (key: RiskKey, value: boolean) => void;
};

const riskItems: Array<{ label: string; key: RiskKey; hint: string }> = [
  {
    label: "Ideación suicida",
    key: "suicidalIdeation",
    hint: "Marca esto si hay pensamientos actuales de muerte o autolesión.",
  },
  {
    label: "Antecedente de autolesión",
    key: "selfHarmHistory",
    hint: "Registra antecedentes relevantes en la historia.",
  },
  {
    label: "Deterioro funcional",
    key: "functionalImpairment",
    hint: "Dificultad para estudiar, trabajar o mantener rutinas.",
  },
  {
    label: "Consumo de sustancias",
    key: "substanceUse",
    hint: "Incluye alcohol u otras sustancias si son clínicamente relevantes.",
  },
];

export default function StepRiskFlags({ form, onToggle }: Props) {
  return (
    <div className="step-stack">
      <h3 className="section-title">Banderas clínicas y funcionamiento</h3>

      <div className="checkbox-grid">
        {riskItems.map((item) => (
          <label key={item.key} className="section-card checkbox-card">
            <input
              type="checkbox"
              checked={form[item.key]}
              onChange={(e) => onToggle(item.key, e.target.checked)}
            />

            <div>
              <div className="checkbox-title">{item.label}</div>
              <div className="checkbox-hint">{item.hint}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}