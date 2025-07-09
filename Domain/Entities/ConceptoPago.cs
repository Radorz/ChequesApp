using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ConceptoPago
    {
        public int Identificador { get; set; }
        public string Descripcion { get; set; } = null!;
        public bool Estado { get; set; }
    }
}
