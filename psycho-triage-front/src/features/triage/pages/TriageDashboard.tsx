import { useMemo, useState } from "react";
import Panel from "../../../shared/ui/Panel";
import StatusMessage from "../../../shared/ui/StatusMessage";
import { defaultRequest, designMeta, gad7Questions, phq9Questions, steps } from "../constants";
import { validateAll, validateStep } from "../lib/validation";
import { evaluateTriage } from "../services/triageApi";
import type { StepKey, TriageRequest, TriageResult, WizardErrors } from "../types";
import ResultSummary from "../components/ResultSummary";
import WizardNavigation from "../components/WizardNavigation";
import WizardSidebar from "../components/WizardSidebar";
import StepGeneralInfo from "../components/steps/StepGeneralInfo";
import StepQuestionnaire from "../components/steps/StepQuestionnaire";
import StepReview from "../components/steps/StepReview";
import StepRiskFlags from "../components/steps/StepRiskFlags";

type RiskKey =
  | "suicidalIdeation"
  | "selfHarmHistory"
  | "functionalImpairment"
  | "substanceUse";

function TopMetaBar() {
  return (
    <div className="muted-card">
      <div className="top-grid">
        <div>
          <div className="top-meta-label">Pattern</div>
          <div className="top-meta-value">{designMeta.pattern}</div>
        </div>
        <div>
          <div className="top-meta-label">Style</div>
          <div className="top-meta-value">{designMeta.style}</div>
        </div>
        <div>
          <div className="top-meta-label">Anti-patterns</div>
          <div className="top-meta-value">{designMeta.antiPatterns.slice(0, 2).join(" · ")}</div>
        </div>
        <div>
          <div className="top-meta-label">Checklist</div>
          <div className="top-meta-value">{designMeta.checklist.slice(0, 3).join(" · ")}</div>
        </div>
      </div>
    </div>
  );
}

export default function TriageDashboardPage() {
  const [form, setForm] = useState<TriageRequest>(defaultRequest);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardErrors, setWizardErrors] = useState<WizardErrors>({});

  const phqScore = useMemo(
    () => form.phq9Answers.reduce((acc, value) => acc + value, 0),
    [form.phq9Answers]
  );

  const gadScore = useMemo(
    () => form.gad7Answers.reduce((acc, value) => acc + value, 0),
    [form.gad7Answers]
  );

  function updatePhq(index: number, value: number) {
    setForm((prev) => {
      const next = [...prev.phq9Answers];
      next[index] = value;
      return { ...prev, phq9Answers: next };
    });
  }

  function updateGad(index: number, value: number) {
    setForm((prev) => {
      const next = [...prev.gad7Answers];
      next[index] = value;
      return { ...prev, gad7Answers: next };
    });
  }

  function updateRisk(key: RiskKey, value: boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(defaultRequest);
    setResult(null);
    setError(null);
    setCurrentStep(0);
    setWizardErrors({});
  }

  function stepKeyFromIndex(index: number): StepKey {
    return steps[index].key;
  }

  function nextStep() {
    const key = stepKeyFromIndex(currentStep);
    const message = validateStep(key, form);

    if (message) {
      setWizardErrors((prev) => ({ ...prev, [key]: message }));
      return;
    }

    setWizardErrors((prev) => ({ ...prev, [key]: undefined }));
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }

  function previousStep() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  async function handleSubmit() {
    const allErrors = validateAll(form);
    setWizardErrors(allErrors);

    const firstError = Object.values(allErrors).find(Boolean);
    if (firstError) {
      setError(firstError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await evaluateTriage(form);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo evaluar el triage.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <StepGeneralInfo
            age={form.age}
            socialSupportLevel={form.socialSupportLevel}
            phqScore={phqScore}
            gadScore={gadScore}
            onAgeChange={(value) => setForm((prev) => ({ ...prev, age: value }))}
            onSupportChange={(value) =>
              setForm((prev) => ({ ...prev, socialSupportLevel: value }))
            }
          />
        );

      case 1:
        return (
          <StepQuestionnaire
            title="PHQ-9"
            score={phqScore}
            questions={phq9Questions}
            values={form.phq9Answers}
            prefix="phq9"
            onChange={updatePhq}
          />
        );

      case 2:
        return (
          <StepQuestionnaire
            title="GAD-7"
            score={gadScore}
            questions={gad7Questions}
            values={form.gad7Answers}
            prefix="gad7"
            onChange={updateGad}
          />
        );

      case 3:
        return <StepRiskFlags form={form} onToggle={updateRisk} />;

      default:
        return <StepReview form={form} phqScore={phqScore} gadScore={gadScore} />;
    }
  }

  const currentStepError = wizardErrors[stepKeyFromIndex(currentStep)];

  return (
    <div className="page-grid-two">
      <Panel className="page-full-span">
        <TopMetaBar />

        {(error || currentStepError) && (
          <div className="dashboard-alert-wrap">
            <StatusMessage kind="error" message={currentStepError ?? error!} />
          </div>
        )}

        <div className="layout-main dashboard-main-wrap">
          <WizardSidebar
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            errors={wizardErrors}
          />

          <Panel>
            <div className="wizard-head">
              <div>
                <div className="top-meta-label">{steps[currentStep].title}</div>
                <div className="wizard-title">{steps[currentStep].description}</div>
              </div>

              <span className="tag">
                PHQ-9: {phqScore} · GAD-7: {gadScore}
              </span>
            </div>

            {renderStep()}

            <WizardNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              submitting={submitting}
              onReset={resetForm}
              onPrevious={previousStep}
              onNext={nextStep}
              onSubmit={() => void handleSubmit()}
            />
          </Panel>
        </div>
      </Panel>

      <ResultSummary result={result} />
    </div>
  );
}