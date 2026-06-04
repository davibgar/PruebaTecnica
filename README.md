# NodoTech — Módulo Marketing · Análisis (Prueba Técnica)

Implementación del núcleo del **sub-módulo 07 (Análisis)** de NodoTech: cruce de datos
de Marketing (touchpoints) con POS (ventas reales), **atribución multi-touch conmutable**
(lineal / time-decay / position-based), dashboard con **ROAS real vs ROAS plataforma** y
**Action Center** accionable.

## Stack

- **Backend:** NestJS + PostgreSQL (TypeORM con migrations)
- **Frontend:** Next.js (App Router) + React + React Query
- **Infra:** Docker Compose (PostgreSQL)

## Estructura del repo

```
apps/
  api/    Backend NestJS
  web/    Frontend Next.js
```

## Arranque

> Instrucciones detalladas de migrations, seed y variables de entorno se
> documentan a medida que se construye cada parte.
