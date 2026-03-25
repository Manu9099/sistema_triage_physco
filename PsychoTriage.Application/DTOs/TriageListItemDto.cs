namespace PsychoTriage.Application.DTOs;

public class TriageListItemDto
{
    public int Id { get; set; }
    public int Age { get; set; }
    public int Phq9Score { get; set; }
    public int Gad7Score { get; set; }
    public string UrgencyLevel { get; set; } = string.Empty;
    public string ClinicalProfile { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}