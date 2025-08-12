namespace Api.Dtos
{
    public record ChequeSearchQuery(
        int? ProveedorId,
        DateTime? Desde,
        DateTime? Hasta,
        string? NumeroCheque,
        int? NumeroSolicitud
    );

    public record ChequeResultDto(
        int NumeroSolicitud,
        string NumeroCheque,
        int ProveedorId,
        string ProveedorNombre,
        decimal Monto,
        DateTime FechaRegistro
    );

    public record ChequeDetailDto(
        int NumeroSolicitud,
        string NumeroCheque,
        int ProveedorId,
        string ProveedorNombre,
        string ProveedorRnc,
        string CuentaContableProveedor,
        string CuentaContableBanco,
        decimal Monto,
        DateTime FechaRegistro
    );

    public record AsientoResumenDto(
    int Anio, int Mes, int? DebId, int? CreId,
    decimal MontoTotal, int CantidadCheques,
    int ProveedoresUnicos
);

    public record AsientoDetalleChequeDto(
        int NumeroSolicitud, string NumeroCheque,
        int ProveedorId, string ProveedorNombre, string ProveedorRnc,
        decimal Monto, DateTime FechaRegistro,
        string CuentaContableProveedor, string CuentaContableBanco
    );

    public record AsientoDetalleDto(
        int Anio, int Mes, int DebId, int CreId,
        decimal MontoTotal, int CantidadCheques, int ProveedoresUnicos,
        IEnumerable<AsientoDetalleChequeDto> Cheques
    );
}
