using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Domain.Data;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Api.Dtos;

namespace ChequeApp.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolicitudesController : ControllerBase
    {
        private readonly ChequeAppContext _ctx;
        // Paso 1: Agregar un campo privado para IConfiguration
        private readonly IConfiguration _configuration;

        // Paso 2: Modificar el constructor para inyectar IConfiguration
        public SolicitudesController(ChequeAppContext ctx, IConfiguration configuration)
        {
            _ctx = ctx;
            _configuration = configuration;
        }

        public record GenerarChequeDto(string NumeroCheque);
        public record BulkGenerarChequeItem(int Id, string NumeroCheque);
        public record BulkGenerarChequesDto(List<BulkGenerarChequeItem> Items);
        public record IdsDto(List<int> Ids);

        // GET: api/solicitudes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SolicitudCheque>>> GetAll()
            => await _ctx.Solicitudes
                         .Include(s => s.Proveedor)
                         .ToListAsync();

        // GET: api/solicitudes/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SolicitudCheque>> GetById(int id)
        {
            var s = await _ctx.Solicitudes
                              .Include(x => x.Proveedor)
                              .FirstOrDefaultAsync(x => x.NumeroSolicitud == id);
            if (s == null) return NotFound();
            return s;
        }

        // POST: api/solicitudes
        [HttpPost]
        public async Task<ActionResult<SolicitudCheque>> Create(SolicitudCheque s)
        {
            if (s.Monto <= 0) return BadRequest("El monto debe ser mayor que 0.");

            var prov = await _ctx.Proveedores
                .AsTracking()
                .FirstOrDefaultAsync(p => p.Identificador == s.ProveedorId);

            if (prov is null) return BadRequest("Proveedor no existe.");
            if (!prov.Estado) return BadRequest("Proveedor inactivo.");

            if (s.Monto > prov.Balance)
                return BadRequest($"Monto ({s.Monto}) excede el balance del proveedor ({prov.Balance}).");

            if (string.IsNullOrWhiteSpace(s.Estado)) s.Estado = "Pendiente";

            _ctx.Solicitudes.Add(s);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = s.NumeroSolicitud }, s);
        }

        // PUT: api/solicitudes/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, SolicitudCheque s)
        {
            if (id != s.NumeroSolicitud) return BadRequest();

            var original = await _ctx.Solicitudes.AsTracking()
                .FirstOrDefaultAsync(x => x.NumeroSolicitud == id);
            if (original is null) return NotFound();

            // si ya está generado, no permitir cambios de monto/estado (opcional)
            if (original.Estado == "Generado")
                return BadRequest("No se puede modificar una solicitud con cheque generado.");

            // Validar contra balance si se cambia el monto
            if (s.Monto != original.Monto)
            {
                var prov = await _ctx.Proveedores.AsTracking()
                    .FirstOrDefaultAsync(p => p.Identificador == original.ProveedorId);
                if (prov is null) return BadRequest("Proveedor no existe.");

                if (s.Monto <= 0) return BadRequest("El monto debe ser mayor que 0.");
                if (s.Monto > prov.Balance)
                    return BadRequest($"Monto ({s.Monto}) excede el balance del proveedor ({prov.Balance}).");
            }

            // Actualiza campos permitidos
            original.Monto = s.Monto;
            original.FechaRegistro = s.FechaRegistro;
            original.Estado = s.Estado; // si permites
            original.CuentaContableBanco = s.CuentaContableBanco;
            // (no tocar NumeroCheque aquí)

            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/solicitudes/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var s = await _ctx.Solicitudes.FindAsync(id);
            if (s == null) return NotFound();
            _ctx.Solicitudes.Remove(s);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // Sólo pendientes
        [HttpGet("pendientes")]
        public async Task<ActionResult<IEnumerable<SolicitudCheque>>> GetPendientes()
        {
            var data = await _ctx.Solicitudes
                .Include(s => s.Proveedor)
                .Where(s => s.Estado == "Pendiente")
                .ToListAsync();
            return Ok(data);
        }

        // Generar cheque (una solicitud)
        [HttpPost("{id:int}/generar-cheque")]
        public async Task<IActionResult> GenerarCheque(int id, GenerarChequeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NumeroCheque))
                return BadRequest("Número de cheque requerido.");

            await using var tx = await _ctx.Database.BeginTransactionAsync();

            var s = await _ctx.Solicitudes.AsTracking()
                .FirstOrDefaultAsync(x => x.NumeroSolicitud == id);
            if (s is null) return NotFound();
            if (s.Estado != "Pendiente")
                return BadRequest("La solicitud no está pendiente.");

            var prov = await _ctx.Proveedores.AsTracking()
                .FirstOrDefaultAsync(p => p.Identificador == s.ProveedorId);
            if (prov is null) return BadRequest("Proveedor no existe.");
            if (!prov.Estado) return BadRequest("Proveedor inactivo.");

            if (s.Monto > prov.Balance)
                return BadRequest($"Balance insuficiente. Balance: {prov.Balance}, Monto: {s.Monto}");

            // Descuento + cambio de estado
            prov.Balance -= s.Monto;
            s.NumeroCheque = dto.NumeroCheque.Trim();
            s.Estado = "Generado";

            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        // Generar cheques (masivo)
        [HttpPost("generar-cheques")]
        public async Task<IActionResult> GenerarCheques(BulkGenerarChequesDto dto)
        {
            if (dto.Items is null || dto.Items.Count == 0)
                return BadRequest("Lista vacía.");

            await using var tx = await _ctx.Database.BeginTransactionAsync();

            var ids = dto.Items.Select(i => i.Id).ToList();
            var solicitudes = await _ctx.Solicitudes.AsTracking()
                .Where(s => ids.Contains(s.NumeroSolicitud))
                .ToListAsync();

            if (solicitudes.Any(s => s.Estado != "Pendiente"))
                return BadRequest("Todas las solicitudes deben estar en estado Pendiente.");

            // Validar que todos tengan número de cheque
            var map = dto.Items.ToDictionary(i => i.Id, i => (i.NumeroCheque ?? "").Trim());
            if (map.Any(kv => string.IsNullOrWhiteSpace(kv.Value)))
                return BadRequest("Faltan números de cheque.");

            // Agrupar por proveedor y validar balance
            var totalPorProveedor = solicitudes
                .GroupBy(s => s.ProveedorId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Monto));

            var proveedores = await _ctx.Proveedores.AsTracking()
                .Where(p => totalPorProveedor.Keys.Contains(p.Identificador))
                .ToListAsync();

            var errores = new List<string>();
            foreach (var p in proveedores)
            {
                var total = totalPorProveedor[p.Identificador];
                if (!p.Estado) errores.Add($"Proveedor {p.Identificador} inactivo.");
                else if (p.Balance < total)
                    errores.Add($"Proveedor {p.Identificador} sin balance suficiente. Req: {total}, Bal: {p.Balance}");
            }
            if (errores.Count > 0)
                return BadRequest(new { message = "Validación de balance falló", errores });

            // Descontar balances y marcar solicitudes
            foreach (var p in proveedores)
                p.Balance -= totalPorProveedor[p.Identificador];

            foreach (var s in solicitudes)
            {
                s.NumeroCheque = map[s.NumeroSolicitud];
                s.Estado = "Generado";
            }

            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }


        // Anular solicitudes (masivo)  
        [HttpPost("anular")]
        public async Task<IActionResult> Anular(IdsDto dto)
        {
            var solicitudes = await _ctx.Solicitudes
                .Where(s => dto.Ids.Contains(s.NumeroSolicitud))
                .ToListAsync();

            foreach (var s in solicitudes)
            {
                if (s.Estado == "Generado") continue; // opcional: no permitir
                s.Estado = "Anulada";
                s.NumeroCheque = null;
            }
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("generadas-no-contabilizadas")]
        public async Task<ActionResult<IEnumerable<SolicitudCheque>>> GetNoContabilizadas([FromQuery] int year, [FromQuery] int month)
        {
            var list = await _ctx.Solicitudes
                .Include(s => s.Proveedor)
                .Where(s =>
                    s.Estado == "Generado" &&
                    s.EntradaContableDebId == null &&
                    s.EntradaContableCreId == null &&
                    s.FechaRegistro.Year == year &&
                    s.FechaRegistro.Month == month)
                .ToListAsync();

            return Ok(list);
        }

        public record ContabilizarDto(List<int> Ids, string? Descripcion, DateTime? FechaAsiento);

        // POST: api/solicitudes/contabilizar-lote
        [HttpPost("contabilizar-lote")]
        public async Task<IActionResult> ContabilizarLote([FromServices] ContabApiService contab, [FromBody] ContabilizarDto dto)
        {
            if (dto.Ids == null || dto.Ids.Count == 0) return BadRequest("Sin ids");
            var fechaAsiento = dto.FechaAsiento ?? DateTime.UtcNow.Date;

            // Traemos las solicitudes válidas
            var solicitudes = await _ctx.Solicitudes
                .Where(s => dto.Ids.Contains(s.NumeroSolicitud) &&
                            s.Estado == "Generado" &&
                            s.EntradaContableDebId == null &&
                            s.EntradaContableCreId == null)
                .ToListAsync();

            if (solicitudes.Count == 0) return BadRequest("No hay solicitudes elegibles.");

            var total = solicitudes.Sum(s => s.Monto);
            var cfg = _configuration.GetSection("ContabApi"); // inyecta IConfiguration o usa _ctx.Services
            int cuentaDb = int.Parse(cfg["CuentaDebito"]!);   // 82
            int cuentaCr = int.Parse(cfg["CuentaCredito"]!);  // 83
            int aux = int.Parse(cfg["AuxiliarId"]!);     // 9

            var descripcion = dto.Descripcion ?? $"Asiento de Cheques {fechaAsiento:yyyy-MM}";

            // 1) Nota de débito a 82 por la sumatoria
            var idDeb = await contab.CrearEntradaAsync(descripcion, cuentaDb, aux, "DB", fechaAsiento, total);

            // 2) Nota de crédito a 83 por la sumatoria
            var idCre = await contab.CrearEntradaAsync(descripcion, cuentaCr, aux, "CR", fechaAsiento, total);

            // Marcamos las solicitudes como contabilizadas guardando ambos IDs
            foreach (var s in solicitudes)
            {
                s.EntradaContableDebId = idDeb;
                s.EntradaContableCreId = idCre;
            }
            await _ctx.SaveChangesAsync();

            return Ok(new { total, count = solicitudes.Count, idDeb, idCre });
        }

        [HttpGet("generados/buscar")]
        public async Task<ActionResult<IEnumerable<ChequeResultDto>>> BuscarGenerados([FromQuery] ChequeSearchQuery q)
        {
            var query = _ctx.Solicitudes
                .Include(s => s.Proveedor)
                .Where(s => s.Estado == "Generado")
                .AsQueryable();

            if (q.ProveedorId.HasValue)
                query = query.Where(s => s.ProveedorId == q.ProveedorId.Value);

            if (q.Desde.HasValue)
                query = query.Where(s => s.FechaRegistro.Date >= q.Desde.Value.Date);

            if (q.Hasta.HasValue)
                query = query.Where(s => s.FechaRegistro.Date <= q.Hasta.Value.Date);

            if (!string.IsNullOrWhiteSpace(q.NumeroCheque))
                query = query.Where(s => s.NumeroCheque!.Contains(q.NumeroCheque));

            if (q.NumeroSolicitud.HasValue)
                query = query.Where(s => s.NumeroSolicitud == q.NumeroSolicitud.Value);

            var result = await query
                .OrderByDescending(s => s.FechaRegistro)
                .Select(s => new ChequeResultDto(
                    s.NumeroSolicitud,
                    s.NumeroCheque!,
                    s.ProveedorId,
                    s.Proveedor.Nombre,
                    s.Monto,
                    s.FechaRegistro
                ))
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/solicitudes/{id}/detalle-cheque
        [HttpGet("{id:int}/detalle-cheque")]
        public async Task<ActionResult<ChequeDetailDto>> DetalleCheque(int id)
        {
            var s = await _ctx.Solicitudes
                .Include(x => x.Proveedor)
                .FirstOrDefaultAsync(x => x.NumeroSolicitud == id && x.Estado == "Generado");

            if (s is null) return NotFound();

            return new ChequeDetailDto(
                s.NumeroSolicitud,
                s.NumeroCheque!,
                s.ProveedorId,
                s.Proveedor.Nombre,
                s.Proveedor.CedulaRnc, // ajusta al nombre real de la columna
                s.CuentaContableProveedor,
                s.CuentaContableBanco,
                s.Monto,
                s.FechaRegistro
            );
        }

    }
}
