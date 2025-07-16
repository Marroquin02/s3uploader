# Dockerfile optimizado para Next.js en producción
FROM node:22-alpine AS base

# Instalar dependencias del sistema y pnpm
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

WORKDIR /app

# Etapa de dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Etapa de construcción
FROM base AS builder
WORKDIR /app

# Argumentos de construcción para configurar el basePath
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación
RUN pnpm build

# Etapa de producción (imagen final optimizada)
FROM node:22-alpine AS runner
WORKDIR /app

# Instalar solo pnpm
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar solo archivos necesarios para producción
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile && \
    pnpm store prune && \
    rm -rf ~/.pnpm-store

# Copiar archivos de construcción con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para ejecutar la aplicación
CMD ["pnpm", "start"]