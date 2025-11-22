# Dockerfile multi-stage para AppFidelidade (frontend + backend)
# Constrói o frontend com Vite e o backend com Node/Prisma e cria uma imagem mínima para produção.

FROM node:22.12.0 AS build
WORKDIR /workspace

# --- frontend build ---
COPY frontend/package*.json frontend/
COPY frontend/ ./frontend/
RUN cd frontend && npm ci --prefer-offline --no-audit --no-fund && npm run build

# --- backend build (instala dependências, gera client do Prisma) ---
COPY api/package*.json api/
COPY api/ ./api/
RUN cd api && npm ci --prefer-offline --no-audit --no-fund && npx prisma generate && npm prune --production


FROM node:22.12.0-slim AS runtime
WORKDIR /app

# Copia o backend preparado
COPY --from=build /workspace/api ./api
# Copia o build do frontend para dentro da pasta do api (server serve os arquivos)
COPY --from=build /workspace/frontend/dist ./api/frontend/dist

WORKDIR /app/api
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "src/server.js"]
