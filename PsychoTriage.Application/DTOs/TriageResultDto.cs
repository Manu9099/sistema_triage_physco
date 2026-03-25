namespace PsychoTriage.Application.DTOs;

public class TriageResultDto
{
    public int Phq9Score { get; set; }
    public int Gad7Score { get; set; }

    public string UrgencyLevel { get; set; } = string.Empty;
    public string ClinicalProfile { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
}