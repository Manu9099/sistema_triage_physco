using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using PsychoTriage.Api.Exceptions;
using PsychoTriage.Application.DTOs;
using PsychoTriage.Application.Interfaces;
using PsychoTriage.Application.Services;
using PsychoTriage.Application.Validators;
using PsychoTriage.Infrastructure.Persistence;
using PsychoTriage.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IValidator<TriageRequestDto>, TriageRequestValidator>();
builder.Services.AddScoped<IQuestionnaireScoringService, QuestionnaireScoringService>();
builder.Services.AddScoped<ITriageService, TriageService>();
builder.Services.AddScoped<ITriageEvaluationRepository, TriageEvaluationRepository>();
builder.Services.AddScoped<IValidator<TriageQueryParametersDto>, TriageQueryParametersValidator>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "PsychoTriage API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseExceptionHandler();

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.MapControllers();

app.Run();