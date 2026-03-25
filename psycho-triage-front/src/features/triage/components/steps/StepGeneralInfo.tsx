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
    <div style={{ display: "grid", gap: 24 }}>
      <div className="summary-grid">
        <div className="field">
          <label className="label">Edad</label>
          <input
            type="number"
            min={5}
            max={100}
            className="input"
            value={age}
            onChange={(e) => onAgeChange(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label className="label">Soporte social (0-10)</label>
          <input
            type="range"
            min={0}
            max={10}
            className="range"
            value={socialSupportLevel}
            onChange={(e) => onSupportChange(Number(e.target.value))}
          />
          <div style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Nivel actual: {socialSupportLevel}
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Paso actual" value="Datos básicos" />
        <MetricCard label="PHQ-9 preliminar" value={String(phqScore)} />
        <MetricCard label="GAD-7 preliminar" value={String(gadScore)} />
      </div>
    </div>
  );
}