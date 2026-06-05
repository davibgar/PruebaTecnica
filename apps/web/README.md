# Frontend — NodoTech Marketing (Análisis)

Dashboard del sub-módulo **07 · Análisis** en **Next.js (App Router) + React +
TypeScript**. Consume la API NestJS y muestra atribución multi-touch, ROAS real
reconciliado contra POS y el Action Center, con una UI fiel al design system de
NodoTech (modo oscuro, acento esmeralda).

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
> `NEXT_PUBLIC_API_URL`). Sin backend, cada sección muestra su estado de error
> con botón de reintento.

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
**TanStack Query** (estado de servidor) · **sonner** (toasts). La capa visual es
un **design system propio en CSS** (sin framework de utilidades), portado del
bundle de [Claude Design](https://claude.ai/design): tokens en OKLCH, tipografía
**Manrope** + **Geist Mono**, modo oscuro con acento esmeralda.

### 2.1 Organización (feature-based, espeja los dominios del backend)

```
src/
├─ app/
│  ├─ layout.tsx          Fuentes (Manrope/Geist Mono), Toaster, Providers
│  ├─ providers.tsx       QueryClientProvider (React Query)
│  ├─ globals.css         Design system completo (tokens + componentes)
│  └─ page.tsx            Renderiza el dashboard
│
├─ lib/                   Sin estado de UI: datos y utilidades puras
│  ├─ api/                fetch único (URL base + x-business-id) y un módulo por dominio
│  ├─ types.ts            Tipos que espejan los DTOs del backend
│  ├─ format.ts           COP (largo y corto), porcentajes, ROAS, fechas
│  ├─ labels.ts           Enums → etiquetas
│  └─ query-keys.ts       Claves de React Query
│
├─ components/ui/         Primitivas presentacionales
│  ├─ icon.tsx            Iconos SVG (stroke) del design system
│  ├─ states.tsx          Spinner / Loading / Empty / Error
│  └─ query-boundary.tsx  Unifica loading/error/empty (+ skeleton) de una query
│
└─ features/
   ├─ filters/            Contexto de filtros (modelo, ventana, rango, campaña, origen)
   ├─ dashboard/          Shell (sidebar, topbar), command bar, filtros, métricas,
   │                      gráficos (barras + donut), tabla, drawer, tweaks, export
   └─ action-center/      Recomendaciones (con severidad) y tasks
```

### 2.2 App shell

Layout de dos columnas: **sidebar** con los sub-módulos del módulo Marketing
(solo *Análisis* activo) y un **main** con topbar (breadcrumbs + título +
**command bar conversacional**) y el contenido. El acento de marca y la densidad
del layout son configurables desde el panel de **Tweaks** (FAB inferior derecho).

### 2.3 Estado de servidor (TanStack Query)

Todo dato del backend vive en React Query. El **contexto de filtros**
(`features/filters`) guarda el estado de la UI (modelo, ventana, rango, campaña,
origen) y **deriva un `ReportFilter`** que entra en las claves de query: cambiar
un filtro refetchea solo lo que depende de él, sin recargar. Las mutaciones del
Action Center invalidan las claves afectadas y disparan un toast.

### 2.4 Filtros que recalculan

- **Modelo de atribución** como segmented (Lineal · Time-decay · Position-based).
- **Rango** (7/30/90 días) → traduce a `from`/`to`.
- **Campaña** y **origen de audiencia** como selects nativos.
- **Slider de ventana de atribución** (3–90 días): al moverlo, llama a
  `POST /attribution/recompute?window=N` (debounced), recalcula los créditos en
  el backend e invalida la cache.
- **Command bar**: texto natural → `POST /dashboard/parse-filters` (parser de
  reglas del backend); aplica solo lo reconocido y lo muestra con chips.

### 2.5 Gráficos y reportes

Barras horizontales (ingreso por campaña), barras agrupadas (ROAS real vs
plataforma), **donut por origen de audiencia** (conic-gradient) con el insight del
mejor ROAS, **tabla de reconciliación** con Δ vs plataforma (>5% resaltado) y un
**drawer de drill-down** con las ventas y touchpoints atribuidos. Export del
reporte por campaña a **CSV/PDF** desde la cabecera de la tabla.

### 2.6 Multi-tenant

`lib/api/client.ts` adjunta el header `x-business-id` en cada petición.

---

## 3. Mapa feature → endpoint

| Feature | Endpoint(s) |
|---|---|
| Métricas core | `GET /dashboard/metrics` |
| Gráficos + tabla | `GET /dashboard/campaigns` |
| Drill-down (drawer) | `GET /dashboard/campaigns/:id` |
| Donut por origen | `GET /dashboard/audience-performance` |
| Slider de ventana | `POST /attribution/recompute?window=N` |
| Exportar | `GET /dashboard/export?format=csv\|pdf` |
| Command bar | `POST /dashboard/parse-filters` |
| Action Center | `GET/POST/PATCH /action-center/*` |

---

## 4. Notas y siguiente iteración

- El **slider de ventana** recalcula los créditos del negocio en el backend
  (operación global, idempotente); en producción convendría hacerlo por job/cache.
- El drawer muestra ventas y touchpoints atribuidos; el **crédito por touchpoint
  y por canal** (que el diseño insinúa) requiere exponerlo desde
  `attribution_credits` en el backend — queda como mejora.
- Persistir filtros en la URL (`searchParams`) para enlaces compartibles.
- La iconografía usa SVGs del design system; el acento y la densidad son
  configurables en runtime desde Tweaks.
