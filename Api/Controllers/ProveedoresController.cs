using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Data;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;

namespace ChequeApp.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
 
    public class ProveedoresController : ControllerBase
    {
        private readonly ChequeAppContext _context;
        public ProveedoresController(ChequeAppContext context)
            => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _context.Proveedores.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var prov = await _context.Proveedores.FindAsync(id);
            if (prov == null) return NotFound();
            return Ok(prov);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Proveedor prov)
        {
            _context.Proveedores.Add(prov);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = prov.Identificador }, prov);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Proveedor prov)
        {
            if (id != prov.Identificador) return BadRequest();
            _context.Entry(prov).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var prov = await _context.Proveedores.FindAsync(id);
            if (prov == null) return NotFound();

            _context.Proveedores.Remove(prov);
            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException)
            {
                return Conflict("No se puede eliminar el proveedor porque tiene movimientos/solicitudes relacionadas. Puedes inactivarlo en lugar de eliminarlo.");
            }
        }
    }
}