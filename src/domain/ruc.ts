const FACTORES = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/** Dígito verificador de RUC usado por SUNAT. */
export function rucValido(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;
  let suma = 0;
  for (let i = 0; i < 10; i += 1) {
    suma += Number(ruc[i]) * FACTORES[i];
  }
  const resto = suma % 11;
  let digito = 11 - resto;
  if (digito === 10) digito = 0;
  if (digito === 11) digito = 1;
  return digito === Number(ruc[10]);
}

export function documentoValido(tipo: "RUC" | "DNI", numero: string): boolean {
  if (tipo === "DNI") return /^\d{8}$/.test(numero);
  return rucValido(numero);
}
