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

## Deploy no Railway (passo a passo)

Opções: você pode deployar como um único serviço (o backend serve o frontend build estático), ou como dois serviços separados (API e Frontend). Aqui mostramos a opção de um único serviço, que é mais simples.

1) No painel do Railway, crie um novo projeto e conecte ao repositório GitHub (já feito).
2) Configure variáveis de ambiente no Railway para o serviço principal (API):
    - `DATABASE_URL` = `mysql://root:xBupgaNtJLhdplUfgqQxslAfyNxcROSu@shuttle.proxy.rlwy.net:18002/railway`
    - `PORT` = `4000` (opcional)
    - `SERVE_FRONTEND` = `true`

3) O `Procfile` em `api/Procfile` usa `npm start`. O Railway irá rodar `npm install` em `api/` e, graças ao `postinstall` no `api/package.json`, o frontend será instalado e construído automaticamente.

4) Ajustes do Prisma: no deploy em produção, execute `prisma migrate deploy` via console do Railway ou configure um _startup command_ para rodá-lo antes do start se desejar aplicar migrations automaticamente.

5) Domain custom: no painel do Railway, adicione o custom domain `https://appfidelidade-production.up.railway.app/` (ou vincule ao domínio dado) nas configurações de domínio do projeto. Garanta que o serviço esteja rodando e que a porta configurada corresponde à variável `PORT`.

6) Teste: acesse `https://appfidelidade-production.up.railway.app/` para ver o frontend e `https://appfidelidade-production.up.railway.app/api/diag` para endpoints de diagnóstico.

Se quiser que eu gere arquivos adicionais (Dockerfile, workflow de GitHub Actions para deploy automático, ou separar em dois serviços), me diga qual opção prefere.
 
## CI/CD — GitHub Actions e Docker

Incluí um `Dockerfile` multi-stage na raiz e um workflow de exemplo em `.github/workflows/ci-deploy.yml` que:
- Constrói o frontend e backend numa imagem Docker
- Publica a imagem no GitHub Container Registry (GHCR)
- Opcionalmente, se os _secrets_ `RAILWAY_TOKEN` e `RAILWAY_PROJECT_ID` estiverem configurados no repositório, o workflow tenta executar `railway up` para acionar o deploy (pode precisar de ajustes conforme o projeto Railway).

Secrets recomendados no GitHub (Settings → Secrets):
- `RAILWAY_TOKEN` — token de API Railway (opcional)
- `RAILWAY_PROJECT_ID` — ID do projeto Railway (opcional)

No Railway você pode também usar a integração nativa com o GitHub para deploy automático sem configurar o `RAILWAY_TOKEN`.
