import React, { useEffect, useMemo, useState } from "react";

type TriageRequest = {
  age: number;
  phq9Answers: number[];
  gad7Answers: number[];
  suicidalIdeation: boolean;
  selfHarmHistory: boolean;
  functionalImpairment: boolean;
  substanceUse: boolean;
  socialSupportLevel: number;
};

type TriageResult = {
  phq9Score: number;
  gad7Score: number;
  urgencyLevel: string;
  clinicalProfile: string;
  summary: string;
  recommendation: string;
};

type TriageListItem = {
  id: number;
  age: number;
  phq9Score: number;
  gad7Score: number;
  urgencyLevel: string;
  clinicalProfile: string;
  createdAt: string;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const phq9Questions = [
  "Poco interés o placer en hacer cosas",
  "Sentirse decaído/a, deprimido/a o sin esperanza",
  "Problemas para dormir o dormir demasiado",
  "Sentirse cansado/a o con poca energía",
  "Poco apetito o comer en exceso",
  "Sentirse mal consigo mismo/a o sentir que ha fallado",
  "Dificultad para concentrarse",
  "Moverse o hablar muy lento / muy inquieto/a",
  "Pensamientos de que estaría mejor muerto/a o de hacerse daño",
];

const gad7Questions = [
  "Sentirse nervioso/a, ansioso/a o al límite",
  "No poder parar o controlar la preocupación",
  "Preocuparse demasiado por diferentes cosas",
  "Dificultad para relajarse",
  "Estar tan inquieto/a que cuesta quedarse quieto/a",
  "Irritarse o enfadarse con facilidad",
  "Sentir miedo como si algo terrible fuera a pasar",
];

const answerLabels = [
  "Nunca",
  "Varios días",
  "Más de la mitad de los días",
  "Casi todos los días",
];

const urgencyOptions = ["", "Routine", "Priority", "Urgent", "Critical"];
const profileOptions = [
  "",
  "None",
  "Anxiety",
  "Depression",
  "MixedAnxiousDepressive",
  "SubstanceRelated",
  "HighRisk",
];

const steps = [
  { key: "general", title: "Datos generales", description: "Edad y soporte social" },
  { key: "phq9", title: "PHQ-9", description: "Síntomas depresivos" },
  { key: "gad7", title: "GAD-7", description: "Síntomas de ansiedad" },
  { key: "risk", title: "Riesgo", description: "Banderas clínicas" },
  { key: "review", title: "Resumen", description: "Revisar y enviar" },
] as const;

const defaultRequest: TriageRequest = {
  age: 22,
  phq9Answers: Array(9).fill(0),
  gad7Answers: Array(7).fill(0),
  suicidalIdeation: false,
  selfHarmHistory: false,
  functionalImpairment: false,
  substanceUse: false,
  socialSupportLevel: 5,
};

function StepBadge({ index, active, done }: { index: number; active: boolean; done: boolean }) {
  return (
    <div
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
        active ? "border-slate-900 bg-slate-900 text-white" : done ? "border-slate-900 bg-slate-100 text-slate-900" : "border-slate-300 bg-white text-slate-500",
      ].join(" ")}
    >
      {done ? "✓" : index + 1}
    </div>
  );
}

function QuestionCard({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-slate-800">
        {index + 1}. {question}
      </p>
      <div className="grid gap-2 md:grid-cols-4">
        {answerLabels.map((label, optionValue) => (
          <label
            key={label}
            className={[
              "cursor-pointer rounded-2xl border px-3 py-2 text-sm transition",
              value === optionValue ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            <input
              type="radio"
              className="hidden"
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function PsychoTriageFrontendMvp() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:5228");
  const [form, setForm] = useState<TriageRequest>(defaultRequest);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [clinicalProfile, setClinicalProfile] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [history, setHistory] = useState<PagedResult<TriageListItem> | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const phqScore = useMemo(() => form.phq9Answers.reduce((a, b) => a + b, 0), [form.phq9Answers]);
  const gadScore = useMemo(() => form.gad7Answers.reduce((a, b) => a + b, 0), [form.gad7Answers]);

  const completion = useMemo(() => {
    const generalDone = form.age >= 5 && form.socialSupportLevel >= 0;
    const phqDone = form.phq9Answers.length === 9;
    const gadDone = form.gad7Answers.length === 7;
    const riskDone = true;
    const reviewDone = false;
    return [generalDone, phqDone, gadDone, riskDone, reviewDone];
  }, [form.age, form.socialSupportLevel, form.phq9Answers.length, form.gad7Answers.length]);

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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/Triage/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || data?.title || "No se pudo evaluar el triage.");
      }

      const data: TriageResult = await response.json();
      setResult(data);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadHistory() {
    setLoadingHistory(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDirection,
      });

      if (urgencyLevel) params.set("urgencyLevel", urgencyLevel);
      if (clinicalProfile) params.set("clinicalProfile", clinicalProfile);
      if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`${apiBaseUrl}/api/Triage?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || data?.title || "No se pudo cargar el historial.");
      }

      const data: PagedResult<TriageListItem> = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error cargando historial.");
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, urgencyLevel, clinicalProfile, sortBy, sortDirection, dateFrom, dateTo]);

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

  function renderStepContent() {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Edad</label>
              <input
                type="number"
                min={5}
                max={100}
                className="w-full rounded-2xl border border-slate-300 px-3 py-3 outline-none focus:border-slate-500"
                value={form.age}
                onChange={(e) => setForm((prev) => ({ ...prev, age: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Soporte social (0-10)</label>
              <input
                type="range"
                min={0}
                max={10}
                value={form.socialSupportLevel}
                onChange={(e) => setForm((prev) => ({ ...prev, socialSupportLevel: Number(e.target.value) }))}
                className="mt-3 w-full"
              />
              <div className="text-sm text-slate-600">Nivel actual: {form.socialSupportLevel}</div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">Paso actual</div>
              <div className="mt-1 font-semibold text-slate-900">Datos básicos</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">PHQ-9 preliminar</div>
              <div className="mt-1 font-semibold text-slate-900">{phqScore}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">GAD-7 preliminar</div>
              <div className="mt-1 font-semibold text-slate-900">{gadScore}</div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">PHQ-9</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Puntaje: {phqScore}</span>
          </div>
          {phq9Questions.map((question, index) => (
            <QuestionCard
              key={question}
              index={index}
              question={question}
              value={form.phq9Answers[index]}
              onChange={(value) => updatePhq(index, value)}
            />
          ))}
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">GAD-7</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Puntaje: {gadScore}</span>
          </div>
          {gad7Questions.map((question, index) => (
            <QuestionCard
              key={question}
              index={index}
              question={question}
              value={form.gad7Answers[index]}
              onChange={(value) => updateGad(index, value)}
            />
          ))}
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">Banderas clínicas y funcionamiento</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Ideación suicida", "suicidalIdeation", "Marca esto si hay pensamientos actuales de muerte o autolesión."],
              ["Antecedente de autolesión", "selfHarmHistory", "Registra antecedentes relevantes en la historia."],
              ["Deterioro funcional", "functionalImpairment", "Dificultad para estudiar, trabajar o mantener rutinas."],
              ["Consumo de sustancias", "substanceUse", "Incluye alcohol u otras sustancias si son clínicamente relevantes."],
            ].map(([label, key, hint]) => (
              <label key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(form[key as keyof TriageRequest])}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  <div>
                    <div className="font-medium text-slate-900">{label}</div>
                    <div className="mt-1 text-sm text-slate-600">{hint}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Resumen antes de enviar</h3>
          <p className="mt-1 text-sm text-slate-600">Revisa los datos clave del triage antes de solicitar la clasificación.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Edad</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{form.age}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Soporte social</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{form.socialSupportLevel}/10</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">PHQ-9</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{phqScore}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">GAD-7</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{gadScore}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Ideación suicida", form.suicidalIdeation],
            ["Antecedente de autolesión", form.selfHarmHistory],
            ["Deterioro funcional", form.functionalImpairment],
            ["Consumo de sustancias", form.substanceUse],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm text-slate-600">{label}</div>
              <div className="mt-1 font-semibold text-slate-900">{value ? "Sí" : "No"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Psycho Triage Wizard</h1>
              <p className="mt-1 text-sm text-slate-600">Flujo guiado por pasos para completar el triage psicológico y revisar historial.</p>
            </div>
            <div className="w-full max-w-sm">
              <label className="mb-1 block text-sm font-medium text-slate-700">API base URL</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://localhost:5228"
              />
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 text-sm font-semibold text-slate-900">Progreso del flujo</div>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const active = index === currentStep;
                  const done = index < currentStep;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={[
                        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                        active ? "border-slate-900 bg-white shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-white",
                      ].join(" ")}
                    >
                      <StepBadge index={index} active={active} done={done} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                        <div className="text-xs text-slate-500">{step.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs uppercase text-slate-500">Estado actual</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">Paso {currentStep + 1} de {steps.length}</div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
            </aside>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">{steps[currentStep].title}</div>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">{steps[currentStep].description}</h2>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  PHQ-9: {phqScore} · GAD-7: {gadScore}
                </div>
              </div>

              {renderStepContent()}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                <div className="text-sm text-slate-500">
                  {currentStep < steps.length - 1 ? "Puedes avanzar o volver entre pasos sin perder datos." : "Todo listo para enviar la evaluación."}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      disabled={submitting}
                      className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Evaluando..." : "Evaluar triage"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Resultado</h2>
            {!result ? (
              <p className="mt-3 text-sm text-slate-600">Todavía no hay un resultado. Completa el wizard y envía el triage.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Urgencia</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{result.urgencyLevel}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Perfil clínico</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{result.clinicalProfile}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">PHQ-9</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{result.phq9Score}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">GAD-7</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{result.gad7Score}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-900">Resumen</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-900">Recomendación</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{result.recommendation}</p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Historial</h2>
              <button
                type="button"
                onClick={loadHistory}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Recargar
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Urgencia</label>
                <select className="w-full rounded-2xl border border-slate-300 px-3 py-2" value={urgencyLevel} onChange={(e) => { setPage(1); setUrgencyLevel(e.target.value); }}>
                  {urgencyOptions.map((option) => (
                    <option key={option} value={option}>{option || "Todas"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Perfil</label>
                <select className="w-full rounded-2xl border border-slate-300 px-3 py-2" value={clinicalProfile} onChange={(e) => { setPage(1); setClinicalProfile(e.target.value); }}>
                  {profileOptions.map((option) => (
                    <option key={option} value={option}>{option || "Todos"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Fecha desde</label>
                <input type="date" className="w-full rounded-2xl border border-slate-300 px-3 py-2" value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value); }} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Fecha hasta</label>
                <input type="date" className="w-full rounded-2xl border border-slate-300 px-3 py-2" value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value); }} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Búsqueda</label>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2"
                    placeholder="Buscar en resumen o recomendación"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button" onClick={() => { setPage(1); loadHistory(); }} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                    Buscar
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ordenar por</label>
                <select className="w-full rounded-2xl border border-slate-300 px-3 py-2" value={sortBy} onChange={(e) => { setPage(1); setSortBy(e.target.value); }}>
                  <option value="createdAt">Fecha</option>
                  <option value="age">Edad</option>
                  <option value="phq9Score">PHQ-9</option>
                  <option value="gad7Score">GAD-7</option>
                  <option value="urgencyLevel">Urgencia</option>
                  <option value="clinicalProfile">Perfil</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                <select className="w-full rounded-2xl border border-slate-300 px-3 py-2" value={sortDirection} onChange={(e) => { setPage(1); setSortDirection(e.target.value); }}>
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loadingHistory ? (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">Cargando historial...</div>
              ) : history?.items.length ? (
                history.items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Evaluación #{item.id}</h3>
                        <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {item.urgencyLevel}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Edad: <span className="font-semibold">{item.age}</span></div>
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Perfil: <span className="font-semibold">{item.clinicalProfile}</span></div>
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">PHQ-9: <span className="font-semibold">{item.phq9Score}</span></div>
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">GAD-7: <span className="font-semibold">{item.gad7Score}</span></div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  No hay evaluaciones para los filtros seleccionados.
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Página {history?.page ?? page} de {history?.totalPages ?? 1} · Total: {history?.totalCount ?? 0}
              </div>
              <div className="flex items-center gap-2">
                <select className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}>
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>{size} por página</option>
                  ))}
                </select>
                <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={!history?.hasPreviousPage} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  Anterior
                </button>
                <button type="button" onClick={() => setPage((prev) => prev + 1)} disabled={!history?.hasNextPage} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
