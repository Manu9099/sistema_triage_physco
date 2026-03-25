using PsychoTriage.Domain.Enums;

namespace PsychoTriage.Domain.Entities;

public class TriageEvaluation
{
    public int Id { get; set; }

    public int Age { get; set; }
    public int Phq9Score { get; set; }
    public int Gad7Score { get; set; }

    public bool SuicidalIdeation { get; set; }
    public bool SelfHarmHistory { get; set; }
    public bool FunctionalImpairment { get; set; }
    public bool SubstanceUse { get; set; }
    public int SocialSupportLevel { get; set; }

    public UrgencyLevel UrgencyLevel { get; set; }
    public ClinicalProfile ClinicalProfile { get; set; }

    public string Summary { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}