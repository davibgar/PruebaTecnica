# Backend — NodoTech Marketing (Análisis)

API en **NestJS + PostgreSQL (TypeORM)** que resuelve el cruce Marketing↔POS, la
atribución multi-touch conmutable y los reportes con reconciliación ROAS.

---

## 1. Arranque

Requisitos: **Docker** (recomendado) o Node 20+ con un PostgreSQL local.

### Opción A — Todo en Docker, con hot-reload (recomendado)

Levanta PostgreSQL + API con un solo comando, desde la raíz del repo:

```bash
docker compose up -d --build
# Si ya tienes un Postgres ocupando el 5432:
#   POSTGRES_HOST_PORT=5433 docker compose up -d --build
```

- **API:** http://localhost:3001/api

Carga los datos de demostración (seed):

```bash
docker compose exec api npm run seed
```

La API arranca aplicando las migraciones (no usa `synchronize`) y queda en modo
**watch**: el código de `apps/api/src` se monta en el contenedor, así que editar
en tu host recompila dentro del contenedor automáticamente. Dentro de la red de
Docker la API llega a Postgres por el nombre del servicio (`postgres:5432`), no
por localhost.

Para una **imagen de producción** (compilada, sin dev-deps):

```bash
docker build --target runner -t nodotech-api ./apps/api
```

### Opción B — API en el host (sin Docker para la app)

Solo PostgreSQL en Docker; la API corre en tu máquina:

```bash
cp .env.example .env          # ajusta DB_PORT si cambiaste POSTGRES_HOST_PORT
docker compose up -d postgres
npm install
npm run migration:run         # aplica migraciones (NO se usa synchronize)
npm run seed                  # carga datos de demostración
npm run start:dev             # http://localhost:3001/api
```

> Todo endpoint exige el header **`x-business-id`** (aislamiento multi-tenant).
> El negocio demo del seed es `11111111-1111-1111-1111-111111111111`.

### Scripts útiles
| Script | Qué hace |
|---|---|
| `npm run start:dev` | API en modo watch |
| `npm run build` | Compila a `dist/` |
| `npm run migration:generate -- src/database/migrations/<Nombre>` | Genera migración desde las entidades |
| `npm run migration:run` | Aplica migraciones pendientes |
| `npm run migration:revert` | Revierte la última |
| `npm run seed` | Carga datos de demostración y recalcula la atribución |
| `npm test` | Tests unitarios |

---

## 2. Arquitectura

### 2.1 Visión general

Monolito modular de NestJS organizado **por dominio**. El flujo de una petición:

```
HTTP  →  Guard (multi-tenant)  →  Controller  →  Service  →  Repository (TypeORM)  →  PostgreSQL
            x-business-id          (rutas+DTO)    (lógica)     (SQL / QueryBuilder)
```

Principios que la guían: **SOLID**, **una sola fuente de la verdad**, servicios
pequeños de responsabilidad única, sin código duplicado ni muerto, y solo se
abstrae donde hay polimorfismo real (las estrategias de atribución).

### 2.2 Estructura de carpetas

```
src/
├─ main.ts                      Bootstrap: ValidationPipe global, prefijo /api, CORS
├─ app.module.ts               Raíz: ConfigModule, TypeORM, guard global, módulos
│
├─ config/
│  ├─ app.config.ts             Config de app tipada (puerto, CORS, atribución)
│  ├─ database.config.ts        Opciones de BD — FUENTE ÚNICA (app + CLI migrations)
│  └─ data-source.ts            DataSource para el CLI de TypeORM
│
├─ common/                      Transversal, sin lógica de negocio
│  ├─ enums/                    Channel, AudienceOrigin, AttributionModel (fuente única)
│  ├─ entities/tenant.entity.ts Base abstracta: id + businessId + createdAt
│  ├─ database/numeric.transformer.ts   numeric(PG) → number
│  ├─ guards/business.guard.ts  Multi-tenant: exige x-business-id
│  ├─ decorators/business-id.decorator.ts   @BusinessId()
│  └─ dto/report-filter.dto.ts  Filtros compartidos del dashboard (fuente única)
│
├─ database/migrations/         Migraciones de TypeORM (esquema versionado)
│
└─ modules/
   ├─ marketing/                Entidades núcleo (sin controller: se cargan por seed)
   │  └─ entities/  contact · campaign · touchpoint · sale
   └─ attribution/              Atribución multi-touch (núcleo técnico)
      ├─ strategies/            Patrón Strategy + Template Method
      ├─ attribution-strategy.factory.ts
      ├─ entities/attribution-credit.entity.ts
      ├─ attribution.service.ts
      └─ attribution.controller.ts
```

> Los módulos `dashboard` y `action-center` se añaden en sus fases siguientes; la
> base ya deja el terreno preparado (entidades, créditos precalculados, filtros).

### 2.3 Multi-tenant (aislamiento por `business_id`)

- **Decisión:** el tenant viaja por el header **`x-business-id`** (no por usuario
  autenticado), para enfocar la prueba en el dominio sin una capa de auth real.
- `BusinessGuard` (global, vía `APP_GUARD`) exige el header y lo coloca en
  `request.businessId`. El decorador `@BusinessId()` lo inyecta en los controllers.
- Cada servicio filtra **siempre** por `businessId` → ningún endpoint devuelve
  datos de otro negocio.

### 2.4 Modelo de datos

| Entidad | Rol |
|---|---|
| `Contact` | Identidad única del contacto dentro del negocio (`businessId + externalId`). |
| `Campaign` | Inversión (`adSpend`) e ingreso reportado por la plataforma (píxel). |
| `Touchpoint` | Punto de contacto: canal, origen de audiencia, campaña y fecha. |
| `Sale` | Conversión real del POS: contacto, monto, fecha. |
| `AttributionCredit` | Crédito **precalculado** por (venta × touchpoint × modelo). |

Todas heredan de `TenantEntity` (id uuid + `businessId` + `createdAt`), evitando
repetir esos campos (DRY). Cada entidad declara los índices que sus accesos
necesitan —normalmente uno compuesto que lidera con `businessId`— en lugar de
indexar `businessId` en la base, para no crear índices redundantes. Los montos
usan `numeric(14,2)` con un transformer central que los entrega como `number`.

### 2.5 Atribución multi-touch — patrones de diseño

Es el corazón del backend y el lugar donde los patrones se justifican.

**Strategy** — cada modelo es una estrategia intercambiable con el mismo contrato
(`AttributionStrategy.assign(path, sale)`). Conmutar el modelo desde la UI = usar
otra estrategia, sin `if/else` regados por el código.

**Template Method** — `BaseWeightedStrategy` escribe **una sola vez** la parte
común: convertir un vector de pesos en crédito (`crédito_i = monto · wᵢ/Σw`) y
garantizar que **la suma de créditos == monto de la venta** (cuadre exacto en
centavos: el último touchpoint recibe el remanente). Cada modelo concreto solo
aporta su `computeWeights`:

| Modelo | Peso de cada touchpoint |
|---|---|
| **Lineal** | Todos iguales (`1`) → monto/N. |
| **Time-decay** | `2^(-Δdías / halfLife)`. Half-life configurable (default **7 días**). |
| **Position-based (U)** | 40% primero, 40% último, 20% entre intermedios. Bordes: N=1→100%, N=2→50/50. |

**Factory** — `AttributionStrategyFactory` resuelve la estrategia por el enum
`AttributionModel`. Añadir un 4º modelo = una clase nueva registrada aquí, sin
tocar lo existente (**OCP**).

**Cómo se calcula (`AttributionService.recompute`)**
1. Carga touchpoints y ventas del negocio en **2 consultas** (sin N+1).
2. Agrupa touchpoints por contacto en memoria.
3. Por cada venta reconstruye el **path** (touchpoints previos dentro de la
   ventana de atribución, configurable; default 30 días).
4. Reparte el monto con **cada** estrategia y persiste los créditos.

Los tres modelos se **precalculan** y se guardan en `attribution_credits`. Así el
dashboard solo lee y agrega por **SQL** (`GROUP BY`), y conmutar de modelo es
instantáneo (no se recalcula el reparto en cada petición). Esa tabla es la
**fuente única** de los reportes; ciertos campos del touchpoint/venta se
desnormalizan ahí (campaña, origen, canal, fecha) para que filtros y agregaciones
sean SQL puro.

### 2.6 Configuración (fuente única)

`database.config.ts` define las opciones de PostgreSQL una sola vez y las
consumen **ambos**: el `TypeOrmModule` de la app (runtime) y el `DataSource` del
CLI (migrations). `synchronize` está **siempre en `false`**: el esquema se levanta
solo con migrations.

### 2.7 Validación y errores

`ValidationPipe` global con `whitelist` + `forbidNonWhitelisted` + `transform`:
los DTOs (`class-validator`) validan y tipan toda entrada (rango de fechas, modelo
desconocido, etc.) y Nest responde con los códigos HTTP correctos (400/404/…).

---

## 3. Endpoints

Filtros comunes del dashboard (query params): `from`, `to`, `campaignId`,
`audienceOrigin`, `model` (default `linear`).

| Verbo | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/attribution/recompute?window=<días>` | Recalcula los créditos de los 3 modelos. |
| `GET` | `/api/dashboard/metrics` | Seis métricas core (blended). |
| `GET` | `/api/dashboard/campaigns` | Filas por campaña: ROAS real vs plataforma, diferencia %, flag. |
| `GET` | `/api/dashboard/campaigns/:id` | Drill-down: touchpoints y ventas atribuidas. |
| `GET` | `/api/dashboard/audience-performance` | ROAS real por origen de audiencia (gasto prorrateado). |

> Se ampliará con los endpoints del `action-center` en su fase.
