import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crearApp } from "../src/adapters/http.js";
import { armarContenedor } from "../src/composition.js";

describe("HTTP", () => {
  it("emite y consulta a través del contenedor de Awilix", async () => {
    const app = crearApp(armarContenedor(":memory:"));
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("sin puerto");
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const creado = await fetch(`${base}/comprobantes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serie: "F001",
          tipoDocumento: "DNI",
          numeroDocumento: "12345678",
          receptor: "Cliente de paso",
          items: [{ descripcion: "Menú", cantidad: 1, precioCentavos: 2500 }],
        }),
      });
      assert.equal(creado.status, 201);
      const comprobante = (await creado.json()) as { id: string; totales: { totalCentavos: number } };
      assert.equal(comprobante.totales.totalCentavos, 2950);
      const nota = await fetch(`${base}/comprobantes/${comprobante.id}/notas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ centavos: 2951, motivo: "anulación" }),
      });
      assert.equal(nota.status, 422);
    } finally {
      server.close();
    }
  });
});
