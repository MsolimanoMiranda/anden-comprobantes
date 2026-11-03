import { DatabaseSync } from "node:sqlite";
import type { Comprobante, Item, NotaCredito } from "../domain/comprobante.js";
import type { ComprobanteRepositorio } from "../ports.js";

export class SqliteComprobanteRepositorio implements ComprobanteRepositorio {
  constructor(private readonly db: DatabaseSync) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS comprobante (
        id TEXT PRIMARY KEY,
        serie TEXT NOT NULL,
        numero INTEGER NOT NULL,
        tipo_documento TEXT NOT NULL,
        numero_documento TEXT NOT NULL,
        receptor TEXT NOT NULL,
        items TEXT NOT NULL,
        base INTEGER NOT NULL,
        igv INTEGER NOT NULL,
        total INTEGER NOT NULL,
        notas INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS nota (
        id TEXT PRIMARY KEY,
        comprobante_id TEXT NOT NULL,
        motivo TEXT NOT NULL,
        centavos INTEGER NOT NULL
      );
    `);
  }

  guardar(comprobante: Comprobante): void {
    this.db
      .prepare(
        `INSERT INTO comprobante (
          id, serie, numero, tipo_documento, numero_documento, receptor, items, base, igv, total, notas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET notas = excluded.notas`,
      )
      .run(
        comprobante.id,
        comprobante.serie,
        comprobante.numero,
        comprobante.tipoDocumento,
        comprobante.numeroDocumento,
        comprobante.receptor,
        JSON.stringify(comprobante.items),
        comprobante.totales.baseCentavos,
        comprobante.totales.igvCentavos,
        comprobante.totales.totalCentavos,
        comprobante.notasCentavos,
      );
  }

  obtener(id: string): Comprobante | undefined {
    const fila = this.db.prepare("SELECT * FROM comprobante WHERE id = ?").get(id) as
      | Record<string, string | number>
      | undefined;
    if (!fila) return undefined;
    return {
      id: String(fila.id),
      serie: String(fila.serie),
      numero: Number(fila.numero),
      tipoDocumento: fila.tipo_documento as "RUC" | "DNI",
      numeroDocumento: String(fila.numero_documento),
      receptor: String(fila.receptor),
      items: JSON.parse(String(fila.items)) as Item[],
      totales: {
        baseCentavos: Number(fila.base),
        igvCentavos: Number(fila.igv),
        totalCentavos: Number(fila.total),
      },
      notasCentavos: Number(fila.notas),
    };
  }

  siguienteNumero(serie: string): number {
    const fila = this.db.prepare("SELECT COALESCE(MAX(numero), 0) AS n FROM comprobante WHERE serie = ?").get(serie) as {
      n: number;
    };
    return Number(fila.n) + 1;
  }

  guardarNota(nota: NotaCredito): void {
    this.db
      .prepare("INSERT INTO nota (id, comprobante_id, motivo, centavos) VALUES (?, ?, ?, ?)")
      .run(nota.id, nota.comprobanteId, nota.motivo, nota.centavos);
  }

  notasDe(comprobanteId: string): NotaCredito[] {
    const filas = this.db.prepare("SELECT * FROM nota WHERE comprobante_id = ?").all(comprobanteId) as Array<
      Record<string, string | number>
    >;
    return filas.map((fila) => ({
      id: String(fila.id),
      comprobanteId: String(fila.comprobante_id),
      motivo: String(fila.motivo),
      centavos: Number(fila.centavos),
    }));
  }
}
