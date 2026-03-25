using PsychoTriage.Domain.Enums;

namespace PsychoTriage.Application.DTOs;

public class TriageQueryParametersDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public UrgencyLevel? UrgencyLevel { get; set; }
    public ClinicalProfile? ClinicalProfile { get; set; }

    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }

    public string? SearchTerm { get; set; }

    // createdAt | age | phq9Score | gad7Score | urgencyLevel | clinicalProfile
    public string SortBy { get; set; } = "createdAt";

    // asc | desc
    public string SortDirection { get; set; } = "desc";
}