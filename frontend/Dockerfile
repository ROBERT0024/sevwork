# Dockerfile — Frontend React (Multi-stage)
# Etapa 1: Build con Node.js
# Etapa 2: Servidor Nginx ligero con usuario no-root

# ──── Etapa 1: Build ────
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias (capa separada para cache)
COPY package.json package-lock.json* ./
RUN npm ci --silent 2>/dev/null || npm install --silent

# Copiar código y construir
COPY . .
RUN npm run build

# ──── Etapa 2: Servidor de producción ────
FROM nginx:1.27-alpine-slim

# Actualizar paquetes del sistema para corregir CVEs con parche disponible
# Específicamente: libcrypto3 >= 3.3.6-r0 (CVE-2025-15467)
RUN apk upgrade --no-cache

# Metadatos
LABEL maintainer="secure-workspace"
LABEL description="Frontend - Secure Workspace"

# Copiar build estático desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
