# Dockerfile multi-stage para AppFidelidade (frontend + backend)
# Constrói o frontend com Vite e o backend com Node/Prisma e cria uma imagem mínima para produção.

FROM node:20-bullseye AS build
WORKDIR /workspace

# --- frontend build ---
COPY frontend/package*.json frontend/
COPY frontend/ ./frontend/
RUN cd frontend && npm ci --prefer-offline --no-audit --no-fund && npm run build

# --- backend build (instala dependências, gera client do Prisma) ---
COPY api/package*.json api/
COPY api/ ./api/
RUN cd api && npm ci --prefer-offline --no-audit --no-fund && npx prisma generate && npm prune --production


FROM gcr.io/distroless/nodejs:20 AS runtime
WORKDIR /app

# Copia o backend preparado (inclui node_modules e Prisma client gerado)
COPY --from=build /workspace/api ./api
# Copia o build do frontend para o local esperado pelo servidor (/app/frontend/dist)
COPY --from=build /workspace/frontend/dist ./frontend/dist

WORKDIR /app/api
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Distroless images são minimalistas e já contêm CA certs; não há apt-get aqui.
# O entrypoint do distroless nodejs é o binário 'node', então passamos o script como CMD.
CMD ["src/server.js"]
