using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Proveedor
    {
        public int Identificador { get; set; }
        public string Nombre { get; set; } = null!;
        public string TipoPersona { get; set; } = null!; // "Física" o "Jurídica"
        public string CedulaRnc { get; set; } = null!;
        public decimal Balance { get; set; }
        public string CuentaContable { get; set; } = null!;
        public bool Estado { get; set; }
    }
}
