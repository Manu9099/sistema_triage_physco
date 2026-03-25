import { steps } from "../constants";
import StepBadge from "./StepBadge";

type Props = {
  currentStep: number;
  onStepClick: (index: number) => void;
};

export default function WizardSidebar({ currentStep, onStepClick }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Progreso del flujo</div>

      <div className="sidebar-steps">
        {steps.map((step, index) => {
          const active = index === currentStep;
          const done = index < currentStep;

          return (
            <button
              key={step.key}
              type="button"
              className={["step-button", active ? "active" : ""].join(" ").trim()}
              onClick={() => onStepClick(index)}
            >
              <StepBadge index={index} active={active} done={done} />

              <div>
                <div style={{ fontWeight: 700 }}>{step.title}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {step.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="progress-card">
        <div className="top-meta-label">Estado actual</div>
        <div className="top-meta-value">
          Paso {currentStep + 1} de {steps.length}
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}