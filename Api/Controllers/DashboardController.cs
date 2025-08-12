using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Dtos;
using Domain.Data;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ChequeAppContext _ctx;
    public DashboardController(ChequeAppContext ctx) => _ctx = ctx;

    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverviewDto>> Overview()
    {
        var now = DateTime.UtcNow;
        var first = new DateTime(now.Year, now.Month, 1);
        var next = first.AddMonths(1);

        var provAct = await _ctx.Proveedores.CountAsync(p => p.Estado);
        var provInac = await _ctx.Proveedores.CountAsync(p => !p.Estado);
        var balTotal = await _ctx.Proveedores.SumAsync(p => (decimal?)p.Balance) ?? 0m;

        var pendCount = await _ctx.Solicitudes.CountAsync(s => s.Estado == "Pendiente");
        var pendMonto = await _ctx.Solicitudes
            .Where(s => s.Estado == "Pendiente")
            .SumAsync(s => (decimal?)s.Monto) ?? 0m;

        var genMesCount = await _ctx.Solicitudes
            .Where(s => s.Estado == "Generado" && s.FechaRegistro >= first && s.FechaRegistro < next)
            .CountAsync();
        var genMesMonto = await _ctx.Solicitudes
            .Where(s => s.Estado == "Generado" && s.FechaRegistro >= first && s.FechaRegistro < next)
            .SumAsync(s => (decimal?)s.Monto) ?? 0m;

        var conceptos = await _ctx.ConceptosPago.CountAsync();

        return new DashboardOverviewDto(
            provAct, provInac, balTotal,
            pendCount, pendMonto,
            genMesCount, genMesMonto,
            conceptos
        );
    }

    // Serie de los últimos N meses (monto y cantidad de cheques generados)
    [HttpGet("cheques-trend")]
    public async Task<ActionResult<IEnumerable<ChequesTrendPoint>>> ChequesTrend([FromQuery] int months = 6)
    {
        months = Math.Clamp(months, 1, 24);
        var now = DateTime.UtcNow;
        var start = new DateTime(now.Year, now.Month, 1).AddMonths(1 - months);

        var data = _ctx.Solicitudes.ToList()
            .Where(s => s.Estado == "Generado" && s.FechaRegistro >= start)
            .Select(s => new { s.FechaRegistro.Year, s.FechaRegistro.Month, s.Monto })
            .GroupBy(x => new { x.Year, x.Month })
            .Select(g => new ChequesTrendPoint(
                g.Key.Year, g.Key.Month,
                g.Sum(e => e.Monto),
                g.Count()
            ))
            .OrderBy(e => e.Anio).ThenBy(e => e.Mes);

        return Ok(data);
    }

    // Top proveedores por monto (últimos N meses)
    [HttpGet("top-proveedores")]
    public async Task<ActionResult<IEnumerable<TopProveedorDto>>> TopProveedores([FromQuery] int months = 6, [FromQuery] int take = 5)
    {
        months = Math.Clamp(months, 1, 24);
        take = Math.Clamp(take, 1, 20);
        var now = DateTime.UtcNow;
        var start = new DateTime(now.Year, now.Month, 1).AddMonths(1 - months);

        var data = _ctx.Solicitudes
            .Include(s => s.Proveedor).ToList()
            .Where(s => s.Estado == "Generado" && s.FechaRegistro >= start)
            .GroupBy(s => new { s.ProveedorId, s.Proveedor.Nombre })
            .Select(g => new TopProveedorDto(
                g.Key.ProveedorId, g.Key.Nombre,
                g.Sum(x => x.Monto), g.Count()
            ))
            .OrderByDescending(x => x.MontoTotal)
            .Take(take);

        return Ok(data);
    }
}
