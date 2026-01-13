# Etapa base
FROM node:20-alpine AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Etapa de desarrollo
FROM base AS development

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# El comando se define en docker-compose.yml
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# Etapa de build para producción
FROM base AS build

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN pnpm run build

# Etapa de producción con nginx
FROM nginx:alpine AS production

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]