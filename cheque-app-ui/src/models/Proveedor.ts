
export interface Proveedor {
  identificador: number;
  nombre: string;
  tipoPersona: 'Física' | 'Jurídica';
  cedulaRnc: string;
  balance: number;
  cuentaContable: string;
  estado: boolean;
}