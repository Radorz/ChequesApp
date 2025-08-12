// Controllers/AsientosController.cs
using Api.Dtos;
using Domain.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class AsientosController : ControllerBase
{
    private readonly ChequeAppContext _ctx;
    public AsientosController(ChequeAppContext ctx) => _ctx = ctx;

    // GET: api/asientos/resumen?desde=2025-01-01&hasta=2025-12-31&debId=&creId=
    [HttpGet("resumen")]
    public async Task<ActionResult<IEnumerable<AsientoResumenDto>>> Resumen(
        [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] int? debId, [FromQuery] int? creId)
    {
        var q = _ctx.Solicitudes
            .Where(s => s.Estado == "Generado");

        // Rango de fechas: [desde, hasta] (inclusivo)
        if (desde.HasValue) q = q.Where(s => s.FechaRegistro >= desde.Value.Date);
        if (hasta.HasValue) q = q.Where(s => s.FechaRegistro < hasta.Value.Date.AddDays(1));

        if (debId.HasValue) q = q.Where(s => s.EntradaContableDebId == debId.Value);
        if (creId.HasValue) q = q.Where(s => s.EntradaContableCreId == creId.Value);

        var data = q.ToList().Where(p => p.EntradaContableDebId.HasValue && p.EntradaContableCreId.HasValue)
            // Proyectamos primero a tipos "simples" para que SQL pueda agrupar bien
            .Select(s => new
            {
                Year = s.FechaRegistro.Year,    // <-- se traduce a DATEPART(year,...)
                Month = s.FechaRegistro.Month,   // <-- se traduce a DATEPART(month,...)
                s.EntradaContableDebId,
                s.EntradaContableCreId,
                s.ProveedorId,
                s.Monto
            })
            .GroupBy(x => new { x.Year, x.Month, x.EntradaContableDebId, x.EntradaContableCreId })
            .Select(g => new AsientoResumenDto(
                g.Key.Year,
                g.Key.Month,
                g.Key.EntradaContableDebId,
                g.Key.EntradaContableCreId,
                g.Sum(e => e.Monto),
                g.Count(),
                g.GroupBy(e => e.ProveedorId).Count() // o .Select(e => e.ProveedorId).Distinct().Count()
            ))
            .OrderByDescending(e => e.Anio)
            .ThenByDescending(e => e.Mes);

        return Ok(data);
    }

    // GET: api/asientos/detalle?anio=2025&mes=1&debId=10&creId=201
    [HttpGet("detalle")]
    public async Task<ActionResult<AsientoDetalleDto>> Detalle([FromQuery] int anio, [FromQuery] int mes, [FromQuery] int debId, [FromQuery] int creId)
    {
        var cheques = await _ctx.Solicitudes
            .Include(s => s.Proveedor)
            .Where(s => s.Estado == "Generado"
                && s.FechaRegistro.Year == anio
                && s.FechaRegistro.Month == mes
                && s.EntradaContableDebId == debId
                && s.EntradaContableCreId == creId)
            .Select(s => new AsientoDetalleChequeDto(
                s.NumeroSolicitud, s.NumeroCheque!,
                s.ProveedorId, s.Proveedor.Nombre, s.Proveedor.CedulaRnc,
                s.Monto, s.FechaRegistro,
                s.CuentaContableProveedor, s.CuentaContableBanco
            ))
            .ToListAsync();

        if (cheques.Count == 0) return NotFound();

        var dto = new AsientoDetalleDto(
            anio, mes, debId, creId,
            cheques.Sum(c => c.Monto),
            cheques.Count,
            cheques.Select(c => c.ProveedorId).Distinct().Count(),
            cheques
        );
        return Ok(dto);
    }
}
