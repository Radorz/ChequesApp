import type { Proveedor } from "./Proveedor";

export interface SolicitudCheque {
  numeroSolicitud?: number;
  proveedorId: number;
  proveedor?: Proveedor;
  monto: number;
  fechaRegistro: string;
  estado: 'Pendiente' | 'Anulada' | 'Generado';
  cuentaContableProveedor: string;
  cuentaContableBanco: string;
  numeroCheque?: string;
  entradaContableDebId?: number | null;
  entradaContableCreId?: number | null;
}
