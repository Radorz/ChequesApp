using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Domain.Data;
using Domain.Entities;

namespace ChequeApp.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolicitudesController : ControllerBase
    {
        private readonly ChequeAppContext _ctx;
        public SolicitudesController(ChequeAppContext ctx) => _ctx = ctx;

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
            _ctx.Solicitudes.Add(s);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = s.NumeroSolicitud }, s);
        }

        // PUT: api/solicitudes/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, SolicitudCheque s)
        {
            if (id != s.NumeroSolicitud) return BadRequest();
            _ctx.Entry(s).State = EntityState.Modified;
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
    }
}
