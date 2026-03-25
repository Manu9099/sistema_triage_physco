using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PsychoTriage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TriageEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Age = table.Column<int>(type: "integer", nullable: false),
                    Phq9Score = table.Column<int>(type: "integer", nullable: false),
                    Gad7Score = table.Column<int>(type: "integer", nullable: false),
                    SuicidalIdeation = table.Column<bool>(type: "boolean", nullable: false),
                    SelfHarmHistory = table.Column<bool>(type: "boolean", nullable: false),
                    FunctionalImpairment = table.Column<bool>(type: "boolean", nullable: false),
                    SubstanceUse = table.Column<bool>(type: "boolean", nullable: false),
                    SocialSupportLevel = table.Column<int>(type: "integer", nullable: false),
                    UrgencyLevel = table.Column<int>(type: "integer", nullable: false),
                    ClinicalProfile = table.Column<int>(type: "integer", nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    Recommendation = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriageEvaluations", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TriageEvaluations");
        }
    }
}
