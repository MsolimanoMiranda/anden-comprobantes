import express, { type Express } from "express";
import type { AwilixContainer } from "awilix";
import { ReglaDeNegocio } from "../domain/comprobante.js";
import type { Cuna } from "../composition.js";

export function crearApp(contenedor: AwilixContainer<Cuna>): Express {
  const app = express();
  app.use(express.json());

  app.get("/salud", (_req, res) => {
    res.json({ servicio: "comprobantes" });
  });

  app.post("/comprobantes", (req, res) => {
    try {
      const comprobante = contenedor.cradle.emitir.ejecutar(req.body);
      res.status(201).json(comprobante);
    } catch (error) {
      responder(res, error);
    }
  });

  app.post("/comprobantes/:id/notas", (req, res) => {
    try {
      const resultado = contenedor.cradle.nota.ejecutar(req.params.id, req.body.centavos, req.body.motivo);
      res.status(201).json(resultado);
    } catch (error) {
      responder(res, error);
    }
  });

  app.get("/comprobantes/:id", (req, res) => {
    const comprobante = contenedor.cradle.repositorio.obtener(req.params.id);
    if (!comprobante) {
      res.status(404).json({ error: "Comprobante no encontrado" });
      return;
    }
    res.json({
      comprobante,
      notas: contenedor.cradle.repositorio.notasDe(comprobante.id),
    });
  });

  return app;
}

function responder(res: express.Response, error: unknown) {
  if (error instanceof ReglaDeNegocio) {
    res.status(422).json({ error: error.message });
    return;
  }
  if (error instanceof Error && error.message === "NO_ENCONTRADO") {
    res.status(404).json({ error: "Comprobante no encontrado" });
    return;
  }
  res.status(500).json({ error: "error interno" });
}
