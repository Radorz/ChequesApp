using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Data;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;


namespace ChequeApp.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConceptosPagoController : ControllerBase
    {
        private readonly ChequeAppContext _context;
        public ConceptosPagoController(ChequeAppContext context)
            => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _context.ConceptosPago.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _context.ConceptosPago.FindAsync(id);
            if (c == null) return NotFound();
            return Ok(c);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ConceptoPago c)
        {
            _context.ConceptosPago.Add(c);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = c.Identificador }, c);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ConceptoPago c)
        {
            if (id != c.Identificador) return BadRequest();
            _context.Entry(c).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _context.ConceptosPago.FindAsync(id);
            if (c == null) return NotFound();

            _context.ConceptosPago.Remove(c);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}