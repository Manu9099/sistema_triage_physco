import Field from "../../../../shared/ui/Field";

type Props = {
  age: number;
  socialSupportLevel: number;
  phqScore: number;
  gadScore: number;
  onAgeChange: (value: number) => void;
  onSupportChange: (value: number) => void;
};

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="muted-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export default function StepGeneralInfo({
  age,
  socialSupportLevel,
  phqScore,
  gadScore,
  onAgeChange,
  onSupportChange,
}: Props) {
  return (
    <div className="step-stack">
      <div className="summary-grid">
        <Field label="Edad">
          <input
            type="number"
            min={5}
            max={100}
            className="input"
            value={age}
            onChange={(e) => onAgeChange(Number(e.target.value))}
          />
        </Field>

        <Field label="Soporte social (0-10)">
          <input
            type="range"
            min={0}
            max={10}
            className="range"
            value={socialSupportLevel}
            onChange={(e) => onSupportChange(Number(e.target.value))}
          />
          <div className="helper-text">Nivel actual: {socialSupportLevel}</div>
        </Field>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Paso actual" value="Datos básicos" />
        <MetricCard label="PHQ-9 preliminar" value={String(phqScore)} />
        <MetricCard label="GAD-7 preliminar" value={String(gadScore)} />
      </div>
    </div>
  );
}