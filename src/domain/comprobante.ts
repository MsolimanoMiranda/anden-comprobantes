import { documentoValido } from "./ruc.js";

export class ReglaDeNegocio extends Error {}

export type Item = {
  descripcion: string;
  cantidad: number;
  precioCentavos: number;
};

export type Totales = {
  baseCentavos: number;
  igvCentavos: number;
  totalCentavos: number;
};

const IGV = 0.18;

export function calcularTotales(items: Item[]): Totales {
  if (items.length === 0) {
    throw new ReglaDeNegocio("El comprobante necesita al menos un ítem");
  }
  let base = 0;
  for (const item of items) {
    if (!item.descripcion.trim()) {
      throw new ReglaDeNegocio("El ítem necesita descripción");
    }
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      throw new ReglaDeNegocio("La cantidad debe ser un entero mayor a cero");
    }
    if (!Number.isInteger(item.precioCentavos) || item.precioCentavos < 0) {
      throw new ReglaDeNegocio("El precio no puede ser negativo");
    }
    base += item.cantidad * item.precioCentavos;
  }
  const igv = Math.round(base * IGV);
  return { baseCentavos: base, igvCentavos: igv, totalCentavos: base + igv };
}

export type Comprobante = {
  id: string;
  serie: string;
  numero: number;
  tipoDocumento: "RUC" | "DNI";
  numeroDocumento: string;
  receptor: string;
  items: Item[];
  totales: Totales;
  notasCentavos: number;
};

export type NotaCredito = {
  id: string;
  comprobanteId: string;
  motivo: string;
  centavos: number;
};

export function armarComprobante(input: {
  id: string;
  serie: string;
  numero: number;
  tipoDocumento: "RUC" | "DNI";
  numeroDocumento: string;
  receptor: string;
  items: Item[];
}): Comprobante {
  if (!input.receptor.trim()) throw new ReglaDeNegocio("Falta el receptor");
  if (!documentoValido(input.tipoDocumento, input.numeroDocumento)) {
    throw new ReglaDeNegocio("Documento del receptor inválido");
  }
  return {
    ...input,
    receptor: input.receptor.trim(),
    totales: calcularTotales(input.items),
    notasCentavos: 0,
  };
}

export function aplicarNota(comprobante: Comprobante, centavos: number, motivo: string): NotaCredito & { comprobante: Comprobante } {
  if (!motivo.trim()) throw new ReglaDeNegocio("La nota necesita un motivo");
  if (!Number.isInteger(centavos) || centavos < 1) {
    throw new ReglaDeNegocio("El monto de la nota debe ser mayor a cero");
  }
  if (comprobante.notasCentavos + centavos > comprobante.totales.totalCentavos) {
    throw new ReglaDeNegocio("La nota supera el saldo del comprobante");
  }
  return {
    id: "",
    comprobanteId: comprobante.id,
    motivo: motivo.trim(),
    centavos,
    comprobante: { ...comprobante, notasCentavos: comprobante.notasCentavos + centavos },
  };
}
