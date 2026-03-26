using PsychoTriage.Application.DTOs;
using PsychoTriage.Application.Interfaces;
using PsychoTriage.Domain.Entities;

namespace PsychoTriage.Application.Tests.Support;

internal sealed class FakeTriageEvaluationRepository : ITriageEvaluationRepository
{
    private readonly List<TriageEvaluation> _items = new();

    public IReadOnlyList<TriageEvaluation> SavedItems => _items;

    public Task AddAsync(TriageEvaluation evaluation, CancellationToken cancellationToken = default)
    {
        evaluation.Id = _items.Count + 1;
        _items.Add(evaluation);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<TriageEvaluation>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult((IReadOnlyList<TriageEvaluation>)_items);
    }

    public Task<TriageEvaluation?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_items.FirstOrDefault(x => x.Id == id));
    }

    public Task<(IReadOnlyList<TriageEvaluation> Items, int TotalCount)> GetPagedAsync(
        TriageQueryParametersDto query,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<TriageEvaluation> items = _items;
        return Task.FromResult((items, items.Count));
    }
}