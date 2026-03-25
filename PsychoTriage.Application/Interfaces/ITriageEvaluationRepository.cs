using PsychoTriage.Application.DTOs;
using PsychoTriage.Domain.Entities;

namespace PsychoTriage.Application.Interfaces;

public interface ITriageEvaluationRepository
{
    Task AddAsync(TriageEvaluation evaluation, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TriageEvaluation>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TriageEvaluation?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TriageEvaluation> Items, int TotalCount)> GetPagedAsync(
        TriageQueryParametersDto query,
        CancellationToken cancellationToken = default);
}