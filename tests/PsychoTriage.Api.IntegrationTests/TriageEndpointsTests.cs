using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace PsychoTriage.Api.IntegrationTests;

public class TriageEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public TriageEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false
        });
    }

    [Fact]
    public async Task PostEvaluate_WithValidRequest_ShouldReturnOkAndResult()
    {
        await _factory.ResetDatabaseAsync();

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 0, 0 },         // 5
            socialSupportLevel: 3);                      // +3 => Prioridad

        var response = await _client.PostAsJsonAsync("/api/triage/evaluate", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;

        Assert.Equal(7, root.GetProperty("phq9Score").GetInt32());
        Assert.Equal(5, root.GetProperty("gad7Score").GetInt32());
        Assert.Equal("Prioridad", root.GetProperty("urgencyLevel").GetString());
        Assert.Equal("Depresión", root.GetProperty("clinicalProfile").GetString());
        Assert.Contains("PHQ-9=7", root.GetProperty("summary").GetString());
    }

    [Fact]
    public async Task PostEvaluate_WithInvalidRequest_ShouldReturnBadRequest()
    {
        await _factory.ResetDatabaseAsync();

        var invalidRequest = TestData.ValidRequest(age: 3);

        var response = await _client.PostAsJsonAsync("/api/triage/evaluate", invalidRequest);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;

        Assert.Equal(400, root.GetProperty("status").GetInt32());
        Assert.Equal("Validation failed", root.GetProperty("title").GetString());
        Assert.True(root.TryGetProperty("errors", out var errors));
        Assert.True(errors.TryGetProperty("Age", out _));
    }

    [Fact]
    public async Task GetById_WhenEntityExists_ShouldReturnDetail()
    {
        await _factory.ResetDatabaseAsync();

        var request = TestData.ValidRequest(
            age: 30,
            phq9: new[] { 2, 2, 2, 1, 1, 1, 1, 1, 1 },
            gad7: new[] { 1, 1, 1, 1, 1, 1, 1 });

        var postResponse = await _client.PostAsJsonAsync("/api/triage/evaluate", request);
        Assert.Equal(HttpStatusCode.OK, postResponse.StatusCode);

        var getResponse = await _client.GetAsync("/api/triage/1");

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        using var json = JsonDocument.Parse(await getResponse.Content.ReadAsStringAsync());
        var root = json.RootElement;

        Assert.Equal(1, root.GetProperty("id").GetInt32());
        Assert.Equal(30, root.GetProperty("age").GetInt32());
        Assert.True(root.TryGetProperty("summary", out _));
        Assert.True(root.TryGetProperty("recommendation", out _));
    }

    [Fact]
    public async Task GetById_WhenEntityDoesNotExist_ShouldReturnNotFound()
    {
        await _factory.ResetDatabaseAsync();

        var response = await _client.GetAsync("/api/triage/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetPaged_ShouldReturnItemsAndMetadata()
    {
        await _factory.ResetDatabaseAsync();

        await _client.PostAsJsonAsync("/api/triage/evaluate",
            TestData.ValidRequest(age: 20));

        await _client.PostAsJsonAsync("/api/triage/evaluate",
            TestData.ValidRequest(
                age: 25,
                suicidalIdeation: true));

        var response = await _client.GetAsync("/api/triage?page=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;

        Assert.Equal(1, root.GetProperty("page").GetInt32());
        Assert.Equal(10, root.GetProperty("pageSize").GetInt32());
        Assert.Equal(2, root.GetProperty("totalCount").GetInt32());
        Assert.Equal(1, root.GetProperty("totalPages").GetInt32());

        var items = root.GetProperty("items");
        Assert.Equal(2, items.GetArrayLength());
    }

    [Fact]
    public async Task GetPaged_WithUrgencyFilter_ShouldReturnOnlyMatchingItems()
    {
        await _factory.ResetDatabaseAsync();

        await _client.PostAsJsonAsync("/api/triage/evaluate",
            TestData.ValidRequest(age: 20));

        await _client.PostAsJsonAsync("/api/triage/evaluate",
            TestData.ValidRequest(
                age: 25,
                suicidalIdeation: true));

        // UrgencyLevel.Critical = 3
        var response = await _client.GetAsync("/api/triage?page=1&pageSize=10&urgencyLevel=3");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;
        var items = root.GetProperty("items");

        Assert.Equal(1, items.GetArrayLength());
        Assert.Equal("Crítico", items[0].GetProperty("urgencyLevel").GetString());
    }
}