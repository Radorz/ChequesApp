using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class SolicitudCheque
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NumeroSolicitud { get; set; }         // PK

        [Required]
        public int ProveedorId { get; set; }
        public Proveedor? Proveedor { get; set; }

        [Required] public int ConceptoPagoId { get; set; }          // <-- NUEVO (requerido)
        public ConceptoPago? ConceptoPago { get; set; } = null!;

        [Required]
        public decimal Monto { get; set; }

        [Required]
        public DateTime FechaRegistro { get; set; }

        [Required]
        public string Estado { get; set; }               // "Pendiente", "Anulada", "Cheque Generado"

        [Required]
        public string CuentaContableProveedor { get; set; }

        [Required]
        public string CuentaContableBanco { get; set; }
        public string? NumeroCheque { get; set; }

        public int? EntradaContableDebId { get; set; } // DB a cuenta 82
        public int? EntradaContableCreId { get; set; } // CR a cuenta 83
    }
}
