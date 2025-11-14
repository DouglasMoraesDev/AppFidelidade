# API AppFidelidade (scaffold)

## Pré-requisitos
- Node.js LTS
- MySQL local (ou via Docker)

## Instalação
1. `npm install`
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` e `JWT_SECRET`.
3. Gere o cliente Prisma e rode migrations:
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Inicie: `npm run dev`

## Observações
- Uploads de logo são salvos em `api/img/` durante desenvolvimento e servidos em `/img/...`.
- Ajuste permissões da pasta `api/img` se necessário.
