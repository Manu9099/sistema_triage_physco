using PsychoTriage.Application.DTOs;

namespace PsychoTriage.Application.Services;

public interface ITriageService
{
    Task<TriageResultDto> EvaluateAsync(TriageRequestDto request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TriageListItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TriageDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResultDto<TriageListItemDto>> GetPagedAsync(
        TriageQueryParametersDto query,
        CancellationToken cancellationToken = default);
}