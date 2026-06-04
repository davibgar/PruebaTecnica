# ---------- Desarrollo (hot-reload) ----------
# Imagen con todas las dependencias; corre Nest en modo watch. El código fuente
# se monta como volumen desde el host (ver docker-compose), así los cambios se
# recompilan solos dentro del contenedor.
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
# Aplica migraciones y arranca en watch.
CMD ["sh", "-c", "npm run migration:run && npm run start:dev"]

# ---------- Build (producción) ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------- Runtime (producción) ----------
# Imagen final ligera: solo dependencias de producción + el compilado.
# Para construirla: docker build --target runner -t nodotech-api ./apps/api
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3001
# Aplica migraciones (DataSource compilado, sin ts-node) y arranca la API.
CMD ["sh", "-c", "npm run migration:run:prod && node dist/main.js"]
