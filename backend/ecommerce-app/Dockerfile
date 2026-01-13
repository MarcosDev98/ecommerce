# Etapa base
FROM node:20-alpine AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Etapa de desarrollo
FROM base AS development

# Instalar todas las dependencias (incluyendo dev)
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# El comando se define en docker-compose.yml
CMD ["pnpm", "run", "start:dev"]

# Etapa de build para producción
FROM base AS build

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Generar cliente de Drizzle (si usas drizzle-kit)
RUN pnpm drizzle-kit generate || true

# Build de la aplicación
RUN pnpm run build

# Etapa de producción
FROM node:20-alpine AS production

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar package.json
COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar archivos compilados desde la etapa de build
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

# Usuario no privilegiado
USER node

EXPOSE 3000

CMD ["node", "dist/main"]