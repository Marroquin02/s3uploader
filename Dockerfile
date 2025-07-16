# Dockerfile ultra-optimizado para Next.js
FROM node:22-alpine AS base

# Instalar solo dependencias esenciales
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

WORKDIR /app

# Etapa de dependencias - optimizada para cache
FROM base AS deps
# Copiar solo archivos de dependencias para mejor cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Instalar dependencias con optimizaciones
RUN pnpm install --frozen-lockfile --prefer-offline && \
    pnpm store prune

# Etapa de construcción
FROM base AS builder
WORKDIR /app

# Argumentos de construcción
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir aplicación con optimizaciones
RUN pnpm build && \
    rm -rf node_modules && \
    pnpm install --frozen-lockfile --prod --prefer-offline && \
    pnpm store prune

# Etapa final ultra-liviana
FROM node:22-alpine AS runner
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Variables de entorno optimizadas
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar solo archivos esenciales de producción
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando optimizado para ejecutar la aplicación
CMD ["node", "server.js"]