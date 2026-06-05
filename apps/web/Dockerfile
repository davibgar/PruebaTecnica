# ---------- Desarrollo (hot-reload) ----------
# Imagen con todas las dependencias; corre Next en modo dev. El código fuente se
# monta como volumen desde el host (ver docker-compose), así los cambios se
# recompilan dentro del contenedor. Escucha en 0.0.0.0 para ser accesible desde
# el host.
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npm run dev -- -H 0.0.0.0 -p 3000"]

# ---------- Build (producción) ----------
# Las variables NEXT_PUBLIC_* se inlinean en el bundle de cliente en build time,
# así que se pasan como ARG.
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ARG NEXT_PUBLIC_BUSINESS_ID=11111111-1111-1111-1111-111111111111
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BUSINESS_ID=$NEXT_PUBLIC_BUSINESS_ID
RUN npm run build

# ---------- Runtime (producción) ----------
# Para construirla: docker build --target runner -t nodotech-web ./apps/web
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p 3000"]
