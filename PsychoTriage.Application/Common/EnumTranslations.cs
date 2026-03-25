using PsychoTriage.Domain.Enums;

namespace PsychoTriage.Application.Common;

public static class EnumTranslations
{
    public static string ToSpanish(this UrgencyLevel value)
    {
        return value switch
        {
            UrgencyLevel.Routine => "Rutinario",
            UrgencyLevel.Priority => "Prioridad",
            UrgencyLevel.Urgent => "Urgente",
            UrgencyLevel.Critical => "Crítico",
            _ => "Desconocido"
        };
    }

    public static string ToSpanish(this ClinicalProfile value)
    {
        return value switch
        {
            ClinicalProfile.None => "Sin perfil definido",
            ClinicalProfile.Anxiety => "Ansiedad",
            ClinicalProfile.Depression => "Depresión",
            ClinicalProfile.MixedAnxiousDepressive => "Ansioso-depresivo mixto",
            ClinicalProfile.SubstanceRelated => "Relacionado con sustancias",
            ClinicalProfile.HighRisk => "Alto riesgo",
            _ => "Desconocido"
        };
    }
}