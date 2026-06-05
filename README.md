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

### Requisitos

- [Docker](https://www.docker.com/) + Docker Compose v2 (`docker compose`).
- Puertos libres en el host: **3000** (web), **3001** (API) y **5432** (PostgreSQL).
  Si alguno está ocupado, ver [Variables de entorno](#variables-de-entorno) para reasignarlos.

### Levantar todo (back + front)

Desde la raíz del repo (`D:\Proyectos\PruebaTecnica`):

```bash
docker compose up -d --build
```

Esto arranca los tres servicios en orden:

1. **postgres** — espera a estar `healthy` antes de continuar.
2. **api** (NestJS) — al arrancar **aplica las migraciones automáticamente**
   (`migration:run`) y queda en modo watch (hot-reload).
3. **web** (Next.js) — modo `next dev` con hot-reload.

Cuando terminen de construirse:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api
- **PostgreSQL:** `localhost:5432` (usuario `nodotech` / pass `nodotech` / db `nodotech_marketing`)

> El hot-reload monta `apps/api/src` y `apps/web/src` desde el host; editar el código
> recompila dentro del contenedor sin reconstruir la imagen. Solo hace falta
> `--build` la primera vez o al cambiar dependencias / Dockerfiles.

### Cargar datos de ejemplo (seed)

Las migraciones crean el esquema vacío. Para poblar la base con datos de demo
(touchpoints, ventas, etc.) ejecuta el seed **dentro del contenedor de la API**:

```bash
docker compose exec api npm run seed
```

El seed genera el negocio con id `11111111-1111-1111-1111-111111111111`, que es el
mismo `NEXT_PUBLIC_BUSINESS_ID` que consume el frontend.

### Comandos útiles

```bash
docker compose logs -f api        # ver logs de la API (o web / postgres)
docker compose ps                 # estado de los servicios
docker compose down               # parar y eliminar contenedores (conserva datos)
docker compose down -v            # además borra el volumen de PostgreSQL (datos)
docker compose up -d --build api  # reconstruir solo un servicio
```

### Variables de entorno

Los puertos del host son configurables (útil si ya tienes algo ocupando esos
puertos). Se pueden exportar antes de `docker compose up` o ponerlos en un `.env`
en la raíz:

| Variable             | Default | Descripción                  |
| -------------------- | ------- | ---------------------------- |
| `WEB_HOST_PORT`      | `3000`  | Puerto del frontend          |
| `API_HOST_PORT`      | `3001`  | Puerto de la API             |
| `POSTGRES_HOST_PORT` | `5432`  | Puerto de PostgreSQL         |

Ejemplo (PostgreSQL local ocupando el 5432):

```bash
POSTGRES_HOST_PORT=5433 docker compose up -d --build
```
