// src/models/Asientos.ts
export type AsientoResumen = {
  anio: number; mes: number;
  debId: number; creId: number;
  montoTotal: number; cantidadCheques: number; proveedoresUnicos: number;
};

export type AsientoDetalleCheque = {
  numeroSolicitud: number; numeroCheque: string;
  proveedorId: number; proveedorNombre: string; proveedorRnc: string;
  monto: number; fechaRegistro: string;
  cuentaContableProveedor: string; cuentaContableBanco: string; conceptoPago: string;
};

export type AsientoDetalle = {
  anio: number; mes: number; debId: number; creId: number;
  montoTotal: number; cantidadCheques: number; proveedoresUnicos: number;
  cheques: AsientoDetalleCheque[];
};
