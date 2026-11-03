import { mkdirSync } from "node:fs";
import { crearApp } from "./adapters/http.js";
import { armarContenedor } from "./composition.js";

const ruta = process.env.COMPROBANTES_DB ?? "data/comprobantes.db";
if (ruta !== ":memory:") mkdirSync("data", { recursive: true });

const port = Number(process.env.PORT ?? 3044);
crearApp(armarContenedor(ruta)).listen(port, () => {
  console.log(`comprobantes escuchando en :${port}`);
});
