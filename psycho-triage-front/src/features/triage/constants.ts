import type { HistoryFilters, StepItem, TriageRequest } from "./types";

export const steps: StepItem[] = [
  { key: "general", title: "Datos generales", description: "Edad y soporte social" },
  { key: "phq9", title: "PHQ-9", description: "Síntomas depresivos" },
  { key: "gad7", title: "GAD-7", description: "Síntomas de ansiedad" },
  { key: "risk", title: "Riesgo", description: "Banderas clínicas" },
  { key: "review", title: "Resumen", description: "Revisar y enviar" },
];

export const phq9Questions = [
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

export const gad7Questions = [
  "Sentirse nervioso/a, ansioso/a o al límite",
  "No poder parar o controlar la preocupación",
  "Preocuparse demasiado por diferentes cosas",
  "Dificultad para relajarse",
  "Estar tan inquieto/a que cuesta quedarse quieto/a",
  "Irritarse o enfadarse con facilidad",
  "Sentir miedo como si algo terrible fuera a pasar",
];

export const answerLabels = [
  "Nunca",
  "Varios días",
  "Más de la mitad de los días",
  "Casi todos los días",
];

export const urgencyOptions = ["", "Routine", "Priority", "Urgent", "Critical"];

export const profileOptions = [
  "",
  "None",
  "Anxiety",
  "Depression",
  "MixedAnxiousDepressive",
  "SubstanceRelated",
  "HighRisk",
];

export const defaultRequest: TriageRequest = {
  age: 22,
  phq9Answers: Array(9).fill(0),
  gad7Answers: Array(7).fill(0),
  suicidalIdeation: false,
  selfHarmHistory: false,
  functionalImpairment: false,
  substanceUse: false,
  socialSupportLevel: 5,
};

export const defaultHistoryFilters: HistoryFilters = {
  urgencyLevel: "",
  clinicalProfile: "",
  searchTerm: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 5,
};

export const designMeta = {
  pattern: "Guided Clinical Wizard + Review + Data Table",
  style: "Calm Clinical Soft UI",
  antiPatterns: [
    "No emojis como iconos",
    "No gradientes neon",
    "No CTA ambiguos",
    "No estados sin foco visible",
  ],
  checklist: [
    "Contraste AA",
    "Focus visible",
    "Hover suave",
    "Responsive real",
    "Copy clínico claro",
  ],
};