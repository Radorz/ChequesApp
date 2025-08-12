// Convierte 1234.56 -> "MIL DOSCIENTOS TREINTA Y CUATRO PESOS CON 56/100"
export function numeroALetras(monto: number, moneda = 'PESOS DOMINICANOS') {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
  const decenasTxt = ['', 'DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const centenasTxt = ['', 'CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];

  function centena(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    const c = Math.floor(n / 100);
    const d = n % 100;
    return `${centenasTxt[c]} ${decena(d)}`.trim();
  }

  function decena(n: number): string {
    if (n === 0) return '';
    if (n < 10) return unidades[n];
    if (n >= 10 && n < 20) return especiales[n - 10];
    if (n >= 20 && n < 30) {
      const u = n % 10;
      return u === 0 ? 'VEINTE' : `VEINTI${(u === 2 ? 'DÓS' : u === 3 ? 'TRÉS' : unidades[u].toLowerCase()).toUpperCase()}`;
    }
    const d = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? decenasTxt[d] : `${decenasTxt[d]} Y ${unidades[u]}`;
  }

  function grupo(n: number): string {
    const c = Math.floor(n / 100);
    const r = n % 100;
    return [centena(c * 100), decena(r)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  }

  function miles(n: number): string {
    if (n < 1000) return grupo(n);
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    const pref = m === 1 ? 'MIL' : `${grupo(m)} MIL`;
    const suf = r ? ` ${grupo(r)}` : '';
    return (pref + suf).trim();
  }

  function millones(n: number): string {
    if (n < 1_000_000) return miles(n);
    const mm = Math.floor(n / 1_000_000);
    const r = n % 1_000_000;
    const pref = mm === 1 ? 'UN MILLÓN' : `${miles(mm)} MILLONES`;
    const suf = r ? ` ${miles(r)}` : '';
    return (pref + suf).trim();
  }

  const entero = Math.floor(monto);
  const enteroTxt = entero === 0 ? 'CERO' : millones(entero);
  return `${enteroTxt} ${moneda}`;
}
