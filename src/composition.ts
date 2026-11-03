import { DatabaseSync } from "node:sqlite";
import { asFunction, asValue, createContainer, type AwilixContainer } from "awilix";
import { EmitirComprobante, EmitirNotaCredito } from "./application/emitir.js";
import { SqliteComprobanteRepositorio } from "./adapters/sqlite.js";

export type Cuna = {
  db: DatabaseSync;
  repositorio: SqliteComprobanteRepositorio;
  emitir: EmitirComprobante;
  nota: EmitirNotaCredito;
};

export function armarContenedor(ruta = ":memory:"): AwilixContainer<Cuna> {
  const contenedor = createContainer<Cuna>();
  contenedor.register({
    db: asValue(new DatabaseSync(ruta)),
    repositorio: asFunction(({ db }) => new SqliteComprobanteRepositorio(db)).singleton(),
    emitir: asFunction(({ repositorio }) => new EmitirComprobante(repositorio)).singleton(),
    nota: asFunction(({ repositorio }) => new EmitirNotaCredito(repositorio)).singleton(),
  });
  return contenedor;
}
