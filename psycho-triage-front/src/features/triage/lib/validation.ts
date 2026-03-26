import type { StepKey, TriageRequest, WizardErrors } from "../types";

export function validateStep(step: StepKey, form: TriageRequest): string | null {
  switch (step) {
    case "general":
      if (!Number.isFinite(form.age) || form.age < 5 || form.age > 100) {
        return "La edad debe estar entre 5 y 100 años.";
      }
      if (form.socialSupportLevel < 0 || form.socialSupportLevel > 10) {
        return "El soporte social debe estar entre 0 y 10.";
      }
      return null;

    case "phq9":
      if (form.phq9Answers.length !== 9) {
        return "PHQ-9 debe tener 9 respuestas.";
      }
      if (form.phq9Answers.some((x) => x < 0 || x > 3)) {
        return "Todas las respuestas de PHQ-9 deben estar entre 0 y 3.";
      }
      return null;

    case "gad7":
      if (form.gad7Answers.length !== 7) {
        return "GAD-7 debe tener 7 respuestas.";
      }
      if (form.gad7Answers.some((x) => x < 0 || x > 3)) {
        return "Todas las respuestas de GAD-7 deben estar entre 0 y 3.";
      }
      return null;

    case "risk":
      return null;

    case "review":
      return null;

    default:
      return null;
  }
}

export function validateAll(form: TriageRequest): WizardErrors {
  const stepKeys: StepKey[] = ["general", "phq9", "gad7", "risk", "review"];
  const errors: WizardErrors = {};

  for (const key of stepKeys) {
    const message = validateStep(key, form);
    if (message) errors[key] = message;
  }

  return errors;
}