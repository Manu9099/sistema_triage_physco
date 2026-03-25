namespace PsychoTriage.Application.DTOs;

public class TriageRequestDto
{
    public int Age { get; set; }

    public List<int> Phq9Answers { get; set; } = new();
    public List<int> Gad7Answers { get; set; } = new();

    public bool SuicidalIdeation { get; set; }
    public bool SelfHarmHistory { get; set; }
    public bool FunctionalImpairment { get; set; }
    public bool SubstanceUse { get; set; }
    public int SocialSupportLevel { get; set; }
}