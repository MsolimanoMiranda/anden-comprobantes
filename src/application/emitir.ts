import { randomUUID } from "node:crypto";
import { aplicarNota, armarComprobante, type Item } from "../domain/comprobante.js";
import type { ComprobanteRepositorio } from "../ports.js";

export class EmitirComprobante {
  constructor(private readonly repo: ComprobanteRepositorio) {}

  ejecutar(input: {
    serie: string;
    tipoDocumento: "RUC" | "DNI";
    numeroDocumento: string;
    receptor: string;
    items: Item[];
  }) {
    const comprobante = armarComprobante({
      id: randomUUID(),
      serie: input.serie || "F001",
      numero: this.repo.siguienteNumero(input.serie || "F001"),
      tipoDocumento: input.tipoDocumento,
      numeroDocumento: input.numeroDocumento,
      receptor: input.receptor,
      items: input.items,
    });
    this.repo.guardar(comprobante);
    return comprobante;
  }
}

export class EmitirNotaCredito {
  constructor(private readonly repo: ComprobanteRepositorio) {}

  ejecutar(comprobanteId: string, centavos: number, motivo: string) {
    const comprobante = this.repo.obtener(comprobanteId);
    if (!comprobante) {
      throw new Error("NO_ENCONTRADO");
    }
    const resultado = aplicarNota(comprobante, centavos, motivo);
    const nota = {
      id: randomUUID(),
      comprobanteId,
      motivo: resultado.motivo,
      centavos: resultado.centavos,
    };
    this.repo.guardar(resultado.comprobante);
    this.repo.guardarNota(nota);
    return { nota, comprobante: resultado.comprobante };
  }
}
