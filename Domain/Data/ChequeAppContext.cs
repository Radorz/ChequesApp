using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Data
{
    public class ChequeAppContext : DbContext
    {
        public ChequeAppContext(DbContextOptions<ChequeAppContext> options)
            : base(options) { }

        public DbSet<Proveedor> Proveedores { get; set; } = null!;
        public DbSet<ConceptoPago> ConceptosPago { get; set; } = null!;
        public DbSet<SolicitudCheque> Solicitudes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Proveedor>(entity =>
            {
                entity.ToTable("Proveedores", t =>
            t.HasTrigger("TRG_Audit_Proveedores"));
                entity.HasKey(p => p.Identificador);
            });

            modelBuilder.Entity<ConceptoPago>(entity =>
            {
                entity.ToTable("ConceptosPago", t =>
            t.HasTrigger("TRG_Audit_ConceptosPago"));
                entity.HasKey(c => c.Identificador);
            });

            modelBuilder.Entity<SolicitudCheque>(entity =>
            {
                entity.ToTable("SolicitudCheque",t =>
            t.HasTrigger("TRG_Audit_SolicitudesCheque"));
                entity.HasKey(e => e.NumeroSolicitud);
                entity.Property(e => e.NumeroSolicitud)
          .ValueGeneratedOnAdd();
                entity.HasOne(e => e.Proveedor)
                      .WithMany()
                      .HasForeignKey(e => e.ProveedorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SolicitudCheque>(e =>
            {
                e.ToTable("SolicitudCheque", t => t.HasTrigger("TRG_Audit_SolicitudCheque"));
                e.HasKey(x => x.NumeroSolicitud);
                e.Property(x => x.NumeroSolicitud).ValueGeneratedOnAdd();
            });
        }
    }
}
