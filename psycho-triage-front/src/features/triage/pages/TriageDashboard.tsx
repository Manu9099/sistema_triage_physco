import { useMemo, useState } from "react";
import {
  defaultHistoryFilters,
  defaultRequest,
  designMeta,
  gad7Questions,
  phq9Questions,
  steps,
} from "../constants";
import { evaluateTriage } from "../services/triageApi";
import { useTriageHistory } from "../hooks/useTriageHistory";
import type { HistoryFilters, TriageRequest, TriageResult } from "../types";
import WizardSidebar from "../components/WizardSidebar";
import WizardNavigation from "../components/WizardNavigation";
import ResultPanel from "../components/ResultPanel";
import HistoryPanel from "../components/HistoryPanel";
import StepGeneralInfo from "../components/steps/StepGeneralInfo";
import StepQuestionnaire from "../components/steps/StepQuestionnaire";
import StepRiskFlags from "../components/steps/StepRiskFlags";
import StepReview from "../components/steps/StepReview";

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

export default function TriageDashboard() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:5228");
  const [form, setForm] = useState<TriageRequest>(defaultRequest);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [filters, setFilters] = useState<HistoryFilters>(defaultHistoryFilters);

  const phqScore = useMemo(
    () => form.phq9Answers.reduce((acc, value) => acc + value, 0),
    [form.phq9Answers]
  );

  const gadScore = useMemo(
    () => form.gad7Answers.reduce((acc, value) => acc + value, 0),
    [form.gad7Answers]
  );

  const { history, loadingHistory, historyError, reloadHistory } = useTriageHistory(
    apiBaseUrl,
    filters
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

  function patchFilters(patch: Partial<HistoryFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function resetForm() {
    setForm(defaultRequest);
    setResult(null);
    setError(null);
    setCurrentStep(0);
  }

  function nextStep() {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }

  function previousStep() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const data = await evaluateTriage(apiBaseUrl, form);
      setResult(data);
      await reloadHistory();
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

  return (
    <div className="page-shell">
      <div className="page-container">
        <section className="panel">
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "2rem" }}>Psycho Triage Wizard</h1>
              <p style={{ marginTop: 6, color: "var(--text-muted)" }}>
                Flujo guiado, resultado clínico y trazabilidad con historial.
              </p>
            </div>

            <div className="field" style={{ width: "100%", maxWidth: 360 }}>
              <label className="label">API base URL</label>
              <input
                className="input"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://localhost:5228"
              />
            </div>
          </div>

          <TopMetaBar />

          {error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}

          <div className="layout-main" style={{ marginTop: 20 }}>
            <WizardSidebar currentStep={currentStep} onStepClick={setCurrentStep} />

            <div className="panel">
              <div className="wizard-head">
                <div>
                  <div className="top-meta-label">{steps[currentStep].title}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
                    {steps[currentStep].description}
                  </div>
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
            </div>
          </div>
        </section>

        <div className="layout-bottom">
          <ResultPanel result={result} />

          <HistoryPanel
            filters={filters}
            history={history}
            loadingHistory={loadingHistory}
            historyError={historyError}
            onFiltersChange={patchFilters}
            onSearch={() => patchFilters({ page: 1 })}
            onReload={() => void reloadHistory()}
          />
        </div>
      </div>
    </div>
  );
}