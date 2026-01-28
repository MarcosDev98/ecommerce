# Etapa base
FROM node:20-alpine AS base

# Instalación más robusta de pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Etapa de desarrollo
FROM base AS development

# No uses --frozen-lockfile si estás teniendo problemas de módulos no encontrados
# Esto fuerza a pnpm a verificar que todo esté en su sitio
RUN pnpm install

# Copiar el resto del código
COPY . .

EXPOSE 5173

# Aseguramos que use el host 0.0.0.0 para que sea accesible desde fuera del contenedor
CMD ["pnpm", "dev", "--host", "0.0.0.0"]