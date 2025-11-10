FROM node:20-alpine

WORKDIR /app

# Copia solo los archivos de dependencias
COPY package*.json ./
RUN npm install

COPY tsconfig.json ./

# NOTA: Quita el RUN npm run build

# Opcional, pero define un comando simple por si acaso (será sobrescrito)
CMD ["node"] 

EXPOSE 4000