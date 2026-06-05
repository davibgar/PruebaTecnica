# Frontend — NodoTech Marketing (Análisis)

Dashboard del sub-módulo **07 · Análisis** en **Next.js (App Router) + React +
TypeScript**. Consume la API NestJS y muestra atribución multi-touch, ROAS real
reconciliado contra POS y el Action Center.

---

## 1. Arranque

Requisitos: Node 20+ y el **backend corriendo con el seed cargado**
(ver `apps/api/README.md`). El frontend lee del negocio demo por el header
`x-business-id`.

```bash
cp .env.example .env.local     # ajusta la URL del API si cambiaste el puerto
npm install
npm run dev                    # http://localhost:3000
```

> El backend debe estar en `http://localhost:3001/api` (o ajusta
> `NEXT_PUBLIC_API_URL`). Sin backend, la UI muestra estados de error con botón
> de reintento.

### Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (incluye `/api`). | `http://localhost:3001/api` |
| `NEXT_PUBLIC_BUSINESS_ID` | Negocio demo enviado en `x-business-id`. | `11111111-1111-1111-1111-111111111111` |

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |

---

## 2. Arquitectura

Stack: **Next.js 16 (App Router)** · **React 19** · **TypeScript** ·
**Tailwind v4** · **TanStack Query** (estado de servidor) · **Recharts**
(gráficos).

### 2.1 Organización (feature-based, espeja los dominios del backend)

```
src/
├─ app/
│  ├─ layout.tsx          Fuentes, metadata y <Providers>
│  ├─ providers.tsx       QueryClientProvider (React Query)
│  └─ page.tsx            Renderiza el dashboard
│
├─ lib/                   Sin estado de UI: datos y utilidades puras
│  ├─ api/
│  │  ├─ client.ts        fetch único: URL base + header x-business-id + errores
│  │  ├─ dashboard.ts     métricas, campañas, drill-down, origen, export, parser
│  │  ├─ attribution.ts   recompute
│  │  └─ action-center.ts recomendaciones y tasks
│  ├─ types.ts            Tipos que espejan los DTOs del backend (fuente de verdad)
│  ├─ format.ts           Moneda COP, porcentajes, ROAS, fechas
│  ├─ labels.ts           Enums → etiquetas legibles
│  ├─ query-keys.ts       Claves de React Query centralizadas
│  └─ cn.ts               Une clases condicionales
│
├─ components/ui/         Primitivas presentacionales sin lógica de dominio
│  ├─ card · badge · button · select · modal
│  ├─ states.tsx          Spinner / Loading / Empty / Error
│  └─ query-boundary.tsx  Unifica loading/error/empty de una query
│
└─ features/             Una carpeta por dominio; cada una trae su UI + hooks
   ├─ filters/            Contexto de filtros, barra manual y modo conversacional
   ├─ dashboard/          Métricas, gráficos, tabla, drill-down, ROAS por origen, export
   └─ action-center/      Recomendaciones y tasks (con mutaciones)
```

Regla simple: **`lib` no importa de `features` ni de `components`**; las features
componen `lib` + `components/ui`. Esto mantiene el grafo de dependencias en una
sola dirección y los módulos testeables por separado.

### 2.2 Estado de servidor (TanStack Query)

Todo dato del backend vive en React Query, no en `useState`. Cada vista declara
su query con una clave de `query-keys.ts` que **incluye los filtros**: cambiar un
filtro cambia la clave y refetchea solo lo que depende de él, sin recargar la
página. Las mutaciones del Action Center invalidan las claves afectadas y la
bandeja se refresca sola. `QueryBoundary` centraliza los estados de carga, error
(con reintento) y vacío para no repetirlos en cada componente.

### 2.3 Filtros como única fuente de configuración

`FiltersProvider` (contexto) guarda el `ReportFilter` activo (fechas, campaña,
origen, modelo). Tanto la barra manual como el modo conversacional escriben ahí;
todas las vistas leen de ahí. **El modelo de atribución es un filtro más**:
conmutarlo recalcula el dashboard porque entra en las claves de query.

### 2.4 Modo conversacional

El input de texto llama a `POST /dashboard/parse-filters` (parser de reglas del
backend, sin LLM) y aplica **solo los filtros reconocidos** sobre los actuales,
mostrando con chips qué entendió y qué no.

### 2.5 Multi-tenant

`lib/api/client.ts` adjunta el header `x-business-id` en cada petición, tomado de
`NEXT_PUBLIC_BUSINESS_ID`. El backend aísla por ese identificador.

### 2.6 Formato y UX

- Moneda en **COP** sin decimales e idioma `es-CO` (`Intl.NumberFormat`).
- ROAS como `x.xx` con color (verde ≥ 1, rojo < 1); diferencia % con signo.
- Filas de campaña con reconciliación **> 5%** resaltadas en ámbar (igual que el
  flag del backend).
- Estados de carga, vacío y error en cada sección.

### 2.7 Mapa feature → endpoint

| Feature | Endpoint(s) |
|---|---|
| Métricas core | `GET /dashboard/metrics` |
| Gráficos + tabla | `GET /dashboard/campaigns` |
| Drill-down | `GET /dashboard/campaigns/:id` |
| ROAS por origen | `GET /dashboard/audience-performance` |
| Exportar | `GET /dashboard/export?format=csv\|pdf` |
| Modo conversacional | `POST /dashboard/parse-filters` |
| Action Center | `GET/POST/PATCH /action-center/*` |

---

## 3. Qué quedaría para una siguiente iteración

- Persistir los filtros en la URL (`searchParams`) para enlaces compartibles.
- Conmutar la **ventana de atribución** desde la UI (hoy se fija al recalcular en
  el backend).
- Tests de componentes (React Testing Library) sobre la tabla y el Action Center.
