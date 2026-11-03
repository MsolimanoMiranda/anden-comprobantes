# Comprobantes

Facturas y notas de crédito con Express, inyección de dependencias (Awilix) y arquitectura hexagonal. El IGV es 18% y el RUC valida el dígito de SUNAT. Los montos están en céntimos.

## Capas

- `domain` — totales, documento del receptor, tope de la nota de crédito.
- `application` — emitir comprobante y emitir nota.
- `ports` — repositorio.
- `adapters` — SQLite de Node (`node:sqlite`) y Express.
- `composition.ts` — contenedor de Awilix, el único lugar que une las capas.

## Correr

```bash
cd projects/express-comprobantes
npm install
npm test
npm run dev
```

Escucha en el puerto `3044`.
