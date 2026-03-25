using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using PsychoTriage.Application.DTOs;
using PsychoTriage.Application.Services;

namespace PsychoTriage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TriageController : ControllerBase
{
    private readonly ITriageService _triageService;

    public TriageController(ITriageService triageService)
    {
        _triageService = triageService;
    }

    [HttpPost("evaluate")]
    public async Task<ActionResult<TriageResultDto>> Evaluate([FromBody] TriageRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _triageService.EvaluateAsync(request, cancellationToken);
        return Ok(result);
    }
  
        [HttpGet]
        public async Task<ActionResult<PagedResultDto<TriageListItemDto>>> GetAll(
            [FromQuery] TriageQueryParametersDto query,
            CancellationToken cancellationToken)
        {
            var result = await _triageService.GetPagedAsync(query, cancellationToken);
            return Ok(result);
        }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TriageDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _triageService.GetByIdAsync(id, cancellationToken);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

}