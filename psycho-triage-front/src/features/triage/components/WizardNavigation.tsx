import Button from "../../../shared/ui/Button";

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
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="actions-row">
      <div className="actions-hint">
        {isLastStep
          ? "Todo listo para enviar la evaluación."
          : "Puedes avanzar o volver entre pasos sin perder datos."}
      </div>

      <div className="actions-group">
        <Button variant="secondary" onClick={onReset}>
          Reiniciar
        </Button>

        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>

        {!isLastStep ? (
          <Button onClick={onNext}>Siguiente</Button>
        ) : (
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Evaluando..." : "Evaluar triage"}
          </Button>
        )}
      </div>
    </div>
  );
}