using PsychoTriage.Application.DTOs;
using PsychoTriage.Domain.Enums;

namespace PsychoTriage.Application.Services;

public static class TriageClinicalRules
{
    public static UrgencyLevel CalculateUrgency(TriageRequestDto request, int phq9, int gad7)
    {
        if (request.SuicidalIdeation)
            return UrgencyLevel.Critical;

        if (request.SelfHarmHistory && request.FunctionalImpairment)
            return UrgencyLevel.Urgent;

        var hasModerateDepression = phq9 >= 10;
        var hasModeratelySevereDepression = phq9 >= 15;
        var hasSevereDepression = phq9 >= 20;

        var hasModerateAnxiety = gad7 >= 10;
        var hasSevereAnxiety = gad7 >= 15;

        var hasClinicallyRelevantSymptoms = hasModerateDepression || hasModerateAnxiety;
        var lowSocialSupport = request.SocialSupportLevel <= 3;

        if (hasSevereDepression)
            return UrgencyLevel.Urgent;

        if (hasModeratelySevereDepression && request.FunctionalImpairment)
            return UrgencyLevel.Urgent;

        if (hasSevereAnxiety && request.FunctionalImpairment)
            return UrgencyLevel.Urgent;

        if (request.SubstanceUse && request.FunctionalImpairment && hasClinicallyRelevantSymptoms)
            return UrgencyLevel.Urgent;

        if (hasModeratelySevereDepression)
            return UrgencyLevel.Priority;

        if (hasSevereAnxiety)
            return UrgencyLevel.Priority;

        if (request.FunctionalImpairment && hasClinicallyRelevantSymptoms)
            return UrgencyLevel.Priority;

        if (lowSocialSupport && hasClinicallyRelevantSymptoms)
            return UrgencyLevel.Priority;

        if (request.SubstanceUse && hasClinicallyRelevantSymptoms)
            return UrgencyLevel.Priority;

        return UrgencyLevel.Routine;
    }

    public static ClinicalProfile CalculateProfile(TriageRequestDto request, int phq9, int gad7)
    {
        if (request.SuicidalIdeation || request.SelfHarmHistory)
            return ClinicalProfile.HighRisk;

        if (phq9 >= 10 && gad7 >= 10)
            return ClinicalProfile.MixedAnxiousDepressive;

        if (phq9 >= 10)
            return ClinicalProfile.Depression;

        if (gad7 >= 10)
            return ClinicalProfile.Anxiety;

        if (request.SubstanceUse)
            return ClinicalProfile.SubstanceRelated;

        return ClinicalProfile.None;
    }

    public static string BuildSummary(TriageRequestDto request, int phq9, int gad7)
    {
        return
            $"PHQ-9={phq9} ({GetPhq9Severity(phq9)}), " +
            $"GAD-7={gad7} ({GetGad7Severity(gad7)}), " +
            $"deterioro funcional={(request.FunctionalImpairment ? "sí" : "no")}, " +
            $"ideación suicida={(request.SuicidalIdeation ? "sí" : "no")}, " +
            $"antecedente de autolesión={(request.SelfHarmHistory ? "sí" : "no")}, " +
            $"consumo de sustancias={(request.SubstanceUse ? "sí" : "no")}, " +
            $"soporte social={GetSocialSupportLabel(request.SocialSupportLevel)}.";
    }

    public static string GetRecommendation(UrgencyLevel urgency)
    {
        return urgency switch
        {
            UrgencyLevel.Critical =>
                "Evaluación inmediata presencial, valoración de seguridad y activación de protocolo de crisis.",

            UrgencyLevel.Urgent =>
                "Valoración clínica el mismo día o en menos de 24 horas; verificar red de apoyo y plan de seguridad.",

            UrgencyLevel.Priority =>
                "Programar evaluación en 48-72 horas, dar pautas de alarma y reevaluar si hay empeoramiento.",

            _ =>
                "Seguimiento programado, psicoeducación y reevaluación clínica según evolución."
        };
    }

    private static string GetPhq9Severity(int score)
    {
        return score switch
        {
            <= 4 => "mínimo",
            <= 9 => "leve",
            <= 14 => "moderado",
            <= 19 => "moderadamente grave",
            _ => "grave"
        };
    }

    private static string GetGad7Severity(int score)
    {
        return score switch
        {
            <= 4 => "mínimo",
            <= 9 => "leve",
            <= 14 => "moderado",
            _ => "grave"
        };
    }

    private static string GetSocialSupportLabel(int level)
    {
        return level switch
        {
            <= 3 => "bajo",
            <= 6 => "intermedio",
            _ => "alto"
        };
    }
}