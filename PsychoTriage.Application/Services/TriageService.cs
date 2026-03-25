using FluentValidation;
using PsychoTriage.Application.DTOs;
using PsychoTriage.Application.Interfaces;
using PsychoTriage.Domain.Entities;
using PsychoTriage.Domain.Enums;
using PsychoTriage.Application.Common;

namespace PsychoTriage.Application.Services;

public class TriageService : ITriageService
{
    private readonly IValidator<TriageRequestDto> _validator;
    private readonly IQuestionnaireScoringService _scoringService;
    private readonly ITriageEvaluationRepository _repository;
    private readonly IValidator<TriageQueryParametersDto> _queryValidator;

    public TriageService(
        IValidator<TriageRequestDto> validator,
        IValidator<TriageQueryParametersDto> queryValidator,
        IQuestionnaireScoringService scoringService,
        ITriageEvaluationRepository repository)
    {
        _validator = validator;
        _queryValidator = queryValidator;
        _scoringService = scoringService;
        _repository = repository;
    }

    public async Task<TriageResultDto> EvaluateAsync(
        TriageRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.Errors);
        }

        int phq9 = _scoringService.CalculatePhq9(request.Phq9Answers);
        int gad7 = _scoringService.CalculateGad7(request.Gad7Answers);

        var urgency = CalculateUrgency(request, phq9, gad7);
        var profile = CalculateProfile(request, phq9, gad7);

        var summary = $"PHQ-9={phq9}, GAD-7={gad7}, " +
                      $"deterioro funcional={(request.FunctionalImpairment ? "sí" : "no")}, " +
                      $"ideación suicida={(request.SuicidalIdeation ? "sí" : "no")}.";

        var recommendation = urgency switch
        {
            UrgencyLevel.Critical => "Evaluación inmediata y activación de protocolo de seguridad.",
            UrgencyLevel.Urgent => "Atención prioritaria en menos de 24 horas.",
            UrgencyLevel.Priority => "Programar evaluación en 48-72 horas.",
            _ => "Seguimiento rutinario y reevaluación clínica."
        };

        var entity = new TriageEvaluation
        {
            Age = request.Age,
            Phq9Score = phq9,
            Gad7Score = gad7,
            SuicidalIdeation = request.SuicidalIdeation,
            SelfHarmHistory = request.SelfHarmHistory,
            FunctionalImpairment = request.FunctionalImpairment,
            SubstanceUse = request.SubstanceUse,
            SocialSupportLevel = request.SocialSupportLevel,
            UrgencyLevel = urgency,
            ClinicalProfile = profile,
            Summary = summary,
            Recommendation = recommendation
        };

        await _repository.AddAsync(entity, cancellationToken);

            return new TriageResultDto
            {
                Phq9Score = phq9,
                Gad7Score = gad7,
                UrgencyLevel = urgency.ToSpanish(),
                ClinicalProfile = profile.ToSpanish(),
                Summary = summary,
                Recommendation = recommendation
            };
    }

    private static UrgencyLevel CalculateUrgency(TriageRequestDto request, int phq9, int gad7)
    {
        if (request.SuicidalIdeation)
            return UrgencyLevel.Critical;

        if (request.SelfHarmHistory && request.FunctionalImpairment)
            return UrgencyLevel.Urgent;

        int score = phq9 + gad7;

        if (request.FunctionalImpairment) score += 4;
        if (request.SubstanceUse) score += 3;
        if (request.SocialSupportLevel <= 3) score += 3;

        if (score >= 25) return UrgencyLevel.Urgent;
        if (score >= 15) return UrgencyLevel.Priority;
        return UrgencyLevel.Routine;
    }

    private static ClinicalProfile CalculateProfile(TriageRequestDto request, int phq9, int gad7)
    {
        if (request.SuicidalIdeation || request.SelfHarmHistory)
            return ClinicalProfile.HighRisk;

        if (request.SubstanceUse && phq9 < 10 && gad7 < 10)
            return ClinicalProfile.SubstanceRelated;

        if (phq9 >= 10 && gad7 >= 10)
            return ClinicalProfile.MixedAnxiousDepressive;

        if (gad7 > phq9)
            return ClinicalProfile.Anxiety;

        if (phq9 > gad7)
            return ClinicalProfile.Depression;

        return ClinicalProfile.None;
    }
   public async Task<IReadOnlyList<TriageListItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
{
    var evaluations = await _repository.GetAllAsync(cancellationToken);

                    return evaluations.Select(x => new TriageListItemDto
                    {
                        Id = x.Id,
                        Age = x.Age,
                        Phq9Score = x.Phq9Score,
                        Gad7Score = x.Gad7Score,
                        UrgencyLevel = x.UrgencyLevel.ToSpanish(),
                        ClinicalProfile = x.ClinicalProfile.ToSpanish(),
                        CreatedAt = x.CreatedAt
                    }).ToList();
}

public async Task<TriageDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
{
    var evaluation = await _repository.GetByIdAsync(id, cancellationToken);

    if (evaluation is null)
        return null;

return new TriageDetailDto
{
    Id = evaluation.Id,
    Age = evaluation.Age,
    Phq9Score = evaluation.Phq9Score,
    Gad7Score = evaluation.Gad7Score,
    SuicidalIdeation = evaluation.SuicidalIdeation,
    SelfHarmHistory = evaluation.SelfHarmHistory,
    FunctionalImpairment = evaluation.FunctionalImpairment,
    SubstanceUse = evaluation.SubstanceUse,
    SocialSupportLevel = evaluation.SocialSupportLevel,
    UrgencyLevel = evaluation.UrgencyLevel.ToSpanish(),
    ClinicalProfile = evaluation.ClinicalProfile.ToSpanish(),
    Summary = evaluation.Summary,
    Recommendation = evaluation.Recommendation,
    CreatedAt = evaluation.CreatedAt
};
}

public async Task<PagedResultDto<TriageListItemDto>> GetPagedAsync(
    TriageQueryParametersDto query,
    CancellationToken cancellationToken = default)
{
    var validation = await _queryValidator.ValidateAsync(query, cancellationToken);
    if (!validation.IsValid)
    {
        throw new FluentValidation.ValidationException(validation.Errors);
    }

    var (items, totalCount) = await _repository.GetPagedAsync(query, cancellationToken);

                var mappedItems = items.Select(x => new TriageListItemDto
                {
                    Id = x.Id,
                    Age = x.Age,
                    Phq9Score = x.Phq9Score,
                    Gad7Score = x.Gad7Score,
                    UrgencyLevel = x.UrgencyLevel.ToSpanish(),
                    ClinicalProfile = x.ClinicalProfile.ToSpanish(),
                    CreatedAt = x.CreatedAt
                }).ToList();

    var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

    return new PagedResultDto<TriageListItemDto>
    {
        Items = mappedItems,
        Page = query.Page,
        PageSize = query.PageSize,
        TotalCount = totalCount,
        TotalPages = totalPages,
        HasPreviousPage = query.Page > 1,
        HasNextPage = query.Page < totalPages
    };
}

}