type Props = {
  currentStep: number;
  totalSteps: number;
  submitting: boolean;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function WizardNavigation({
  currentStep,
  totalSteps,
  submitting,
  onReset,
  onPrevious,
  onNext,
  onSubmit,
}: Props) {
  const lastStep = currentStep === totalSteps - 1;

  return (
    <div className="actions-row">
      <div style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
        {lastStep
          ? "Todo listo para enviar la evaluación."
          : "Puedes avanzar o volver entre pasos sin perder datos."}
      </div>

      <div className="actions-group">
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          Reiniciar
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={currentStep === 0}
        >
          Anterior
        </button>

        {!lastStep ? (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Evaluando..." : "Evaluar triage"}
          </button>
        )}
      </div>
    </div>
  );
}