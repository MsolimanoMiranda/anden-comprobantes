import type { Comprobante, NotaCredito } from "./domain/comprobante.js";

export interface ComprobanteRepositorio {
  guardar(comprobante: Comprobante): void;
  obtener(id: string): Comprobante | undefined;
  siguienteNumero(serie: string): number;
  guardarNota(nota: NotaCredito): void;
  notasDe(comprobanteId: string): NotaCredito[];
}
