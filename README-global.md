# AppFidelidade (monorepo)

Este repositório contém o frontend (gerado pelo Google) e o backend scaffold (Node.js + Express + Prisma).

Estrutura:
- frontend/  --> frontend React + TypeScript (Vite) (já presente no upload)
- api/       --> backend Node.js + Express + Prisma (scaffold criado)

## Como rodar (desenvolvimento)
1. Configure MySQL local ou via Docker:
   `docker run --name mysql-appfidelidade -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=appfidelidade -p 3306:3306 -d mysql:8.0`

2. Backend:
   ```
   cd api
   npm install
   cp .env.example .env
   # editar .env com DATABASE_URL correto
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

3. Frontend:
   ```
   cd frontend
   npm install
   # ajustar .env.local com VITE_API_URL=http://localhost:4000
   npm run dev
   ```

Os logos para desenvolvimento ficam em `/img` na raiz do repo e são servidos pela API em `/img/<nome>`.
