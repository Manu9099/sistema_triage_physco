using FluentValidation;
using PsychoTriage.Application.DTOs;

namespace PsychoTriage.Application.Validators;

public class TriageQueryParametersValidator : AbstractValidator<TriageQueryParametersDto>
{
    private static readonly string[] AllowedSortBy =
    [
        "createdAt",
        "age",
        "phq9Score",
        "gad7Score",
        "urgencyLevel",
        "clinicalProfile"
    ];

    private static readonly string[] AllowedSortDirection =
    [
        "asc",
        "desc"
    ];

    public TriageQueryParametersValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x)
            .Must(x => !x.DateFrom.HasValue || !x.DateTo.HasValue || x.DateFrom <= x.DateTo)
            .WithMessage("DateFrom no puede ser mayor que DateTo.");

        RuleFor(x => x.SortBy)
            .NotEmpty()
            .Must(x => AllowedSortBy.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("SortBy no es válido.");

        RuleFor(x => x.SortDirection)
            .NotEmpty()
            .Must(x => AllowedSortDirection.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("SortDirection debe ser 'asc' o 'desc'.");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.SearchTerm));
    }
}