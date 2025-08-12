import type { Proveedor } from "./Proveedor";

export interface SolicitudCheque {
  numeroSolicitud?: number;
  proveedorId: number;
  conceptoPagoId: number;          // <-- NUEVO
  proveedor?: Proveedor;
  conceptoPago?: { id:number; descripcion:string; estado:boolean };
  monto: number;
  fechaRegistro: string;
  estado: 'Pendiente' | 'Anulada' | 'Generado';
  cuentaContableProveedor: string;
  cuentaContableBanco: string;
  numeroCheque?: string;
  entradaContableDebId?: number | null;
  entradaContableCreId?: number | null;
}
