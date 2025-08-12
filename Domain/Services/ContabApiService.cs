using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;

public class ContabApiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _cfg;

    public ContabApiService(IHttpClientFactory f, IConfiguration cfg)
    {
        _http = f.CreateClient("contab");
        _cfg = cfg;
    }

    public async Task<int> CrearEntradaAsync(
        string descripcion,
        int cuentaId,
        int auxiliarId,
        string tipoMovimiento, // "DB" | "CR"
        DateTime fecha,
        decimal monto)
    {
        var payload = new
        {
            descripcion,
            cuenta_Id = cuentaId,
            auxiliar_Id = auxiliarId,
            tipoMovimiento,                       // "DB" o "CR"
            fechaAsiento = fecha.ToString("yyyy-MM-dd"),
            montoAsiento = Math.Round(monto, 2)
        };
        var req = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var resp = await _http.PostAsync("/api/public/entradas-contables", req);
        var body = await resp.Content.ReadAsStringAsync();
        resp.EnsureSuccessStatusCode();

        // La respuesta devuelve un objeto con "data": { "id": N }
        using var doc = JsonDocument.Parse(body);
        var id = doc.RootElement.GetProperty("data").GetProperty("id").GetInt32();
        return id;
    }
}
