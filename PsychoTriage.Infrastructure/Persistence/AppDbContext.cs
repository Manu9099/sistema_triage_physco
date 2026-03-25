using Microsoft.EntityFrameworkCore;
using PsychoTriage.Domain.Entities;

namespace PsychoTriage.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TriageEvaluation> TriageEvaluations => Set<TriageEvaluation>();
}