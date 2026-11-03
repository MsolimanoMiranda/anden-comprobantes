import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aplicarNota, armarComprobante, ReglaDeNegocio } from "../src/domain/comprobante.js";
import { rucValido } from "../src/domain/ruc.js";

describe("RUC", () => {
  it("acepta un RUC con dígito verificador de SUNAT", () => {
    assert.equal(rucValido("20100070970"), true);
    assert.equal(rucValido("10000000006"), true);
    assert.equal(rucValido("20100070971"), false);
  });
});

describe("comprobante", () => {
  it("calcula IGV de 18% y bloquea una nota que se pasa", () => {
    const comprobante = armarComprobante({
      id: "1",
      serie: "F001",
      numero: 1,
      tipoDocumento: "RUC",
      numeroDocumento: "20100070970",
      receptor: "Bodega Central",
      items: [{ descripcion: "Aceite", cantidad: 2, precioCentavos: 1000 }],
    });
    assert.deepEqual(comprobante.totales, { baseCentavos: 2000, igvCentavos: 360, totalCentavos: 2360 });
    const conNota = aplicarNota(comprobante, 1000, "devolución parcial");
    assert.equal(conNota.comprobante.notasCentavos, 1000);
    assert.throws(() => aplicarNota(conNota.comprobante, 2000, "de más"), ReglaDeNegocio);
  });

  it("rechaza un DNI corto", () => {
    assert.throws(
      () =>
        armarComprobante({
          id: "1",
          serie: "B001",
          numero: 1,
          tipoDocumento: "DNI",
          numeroDocumento: "123",
          receptor: "Ana",
          items: [{ descripcion: "Pan", cantidad: 1, precioCentavos: 50 }],
        }),
      ReglaDeNegocio,
    );
  });
});
