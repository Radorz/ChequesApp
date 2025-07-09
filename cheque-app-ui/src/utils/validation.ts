/**
 * Valida una cédula/RNC dominicana de 11 dígitos según el algoritmo oficial.
 * @param cedula - La cédula/RNC como string de 11 dígitos.
 * @returns true si es válida, false en caso contrario.
 */
export function validateCedula(cedula: string): boolean {
  // Debe ser exactamente 11 dígitos numéricos
  if (!/^\d{11}$/.test(cedula)) {
    return false;
  }

  // Coeficientes alternos 1,2 para los primeros 10 dígitos
  const coeficientes = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitos = cedula
    .substr(0, 10)
    .split('')
    .map(d => parseInt(d, 10));
  const digitoVerificador = parseInt(cedula[10], 10);

  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    let producto = digitos[i] * coeficientes[i];
    // Si el producto es >= 10, sumar sus dígitos (p.ej. 12 → 1 + 2 = 3)
    if (producto >= 10) {
      producto = Math.floor(producto / 10) + (producto % 10);
    }
    suma += producto;
  }

  const resto = suma % 10;
  const digitoCalculado = resto === 0 ? 0 : 10 - resto;

  return digitoCalculado === digitoVerificador;
}
