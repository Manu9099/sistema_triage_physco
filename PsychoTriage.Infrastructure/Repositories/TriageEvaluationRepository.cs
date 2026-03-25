using Microsoft.EntityFrameworkCore;
using PsychoTriage.Application.DTOs;
using PsychoTriage.Application.Interfaces;
using PsychoTriage.Domain.Entities;
using PsychoTriage.Infrastructure.Persistence;

namespace PsychoTriage.Infrastructure.Repositories;

public class TriageEvaluationRepository : ITriageEvaluationRepository
{
    private readonly AppDbContext _context;

    public TriageEvaluationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(TriageEvaluation evaluation, CancellationToken cancellationToken = default)
    {
        _context.TriageEvaluations.Add(evaluation);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TriageEvaluation>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.TriageEvaluations
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<TriageEvaluation?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.TriageEvaluations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<TriageEvaluation> Items, int TotalCount)> GetPagedAsync(
        TriageQueryParametersDto query,
        CancellationToken cancellationToken = default)
    {
        var evaluationsQuery = _context.TriageEvaluations
            .AsNoTracking()
            .AsQueryable();

        if (query.UrgencyLevel.HasValue)
        {
            evaluationsQuery = evaluationsQuery.Where(x => x.UrgencyLevel == query.UrgencyLevel.Value);
        }

        if (query.ClinicalProfile.HasValue)
        {
            evaluationsQuery = evaluationsQuery.Where(x => x.ClinicalProfile == query.ClinicalProfile.Value);
        }

        if (query.DateFrom.HasValue)
        {
            var from = query.DateFrom.Value.Date;
            evaluationsQuery = evaluationsQuery.Where(x => x.CreatedAt >= from);
        }

        if (query.DateTo.HasValue)
        {
            var toExclusive = query.DateTo.Value.Date.AddDays(1);
            evaluationsQuery = evaluationsQuery.Where(x => x.CreatedAt < toExclusive);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();

            evaluationsQuery = evaluationsQuery.Where(x =>
                x.Summary.ToLower().Contains(term) ||
                x.Recommendation.ToLower().Contains(term));
        }

        evaluationsQuery = ApplySorting(evaluationsQuery, query.SortBy, query.SortDirection);

        var totalCount = await evaluationsQuery.CountAsync(cancellationToken);

        var items = await evaluationsQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private static IQueryable<TriageEvaluation> ApplySorting(
        IQueryable<TriageEvaluation> query,
        string sortBy,
        string sortDirection)
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLower() switch
        {
            "age" => descending
                ? query.OrderByDescending(x => x.Age).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Age).ThenBy(x => x.Id),

            "phq9score" => descending
                ? query.OrderByDescending(x => x.Phq9Score).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Phq9Score).ThenBy(x => x.Id),

            "gad7score" => descending
                ? query.OrderByDescending(x => x.Gad7Score).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Gad7Score).ThenBy(x => x.Id),

            "urgencylevel" => descending
                ? query.OrderByDescending(x => x.UrgencyLevel).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.UrgencyLevel).ThenBy(x => x.Id),

            "clinicalprofile" => descending
                ? query.OrderByDescending(x => x.ClinicalProfile).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.ClinicalProfile).ThenBy(x => x.Id),

            _ => descending
                ? query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
        };
    }
}