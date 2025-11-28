# AppFidelidade

Sistema de gerenciamento de cartões de fidelidade com frontend (React + Vite) e backend (Node.js + Express + Prisma).

## 🏗️ Estrutura do Projeto

```
AppFidelidade/
├── api/                          # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── server.js            # Servidor principal (serve frontend + API)
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── prismaClient.js
│   │   ├── controllers/         # Controladores da API
│   │   ├── routes/              # Rotas da API
│   │   ├── middlewares/         # Middlewares (auth, etc)
│   │   └── services/
│   ├── prisma/
│   │   └── schema.prisma        # Schema do banco de dados
│   ├── package.json
│   └── .env                      # Variáveis de ambiente
├── frontend/                      # Frontend (React + TypeScript)
│   ├── src/
│   ├── components/
│   ├── index.html
│   ├── index.tsx
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile                     # Multi-stage build (frontend + backend)
└── .github/workflows/
    └── ci-deploy.yml            # GitHub Actions: build + push + deploy
```

## 🚀 Início Rápido (Desenvolvimento Local)

### Pré-requisitos

- Node.js >= 22.12.0
- npm >= 9.x
- MySQL 8.0+ (local ou remoto)

### 1. Clonar o repositório

```bash
git clone https://github.com/DouglasMoraesDev/AppFidelidade.git
cd AppFidelidade
```

### 2. Configurar variáveis de ambiente

#### Backend

```bash
cd api
cp .env.example .env
```

Edite `api/.env` e adicione:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/appfidelidade"
PORT=4000
JWT_SECRET="seu-secret-super-seguro"
SERVE_FRONTEND=true
NODE_ENV=development
```

### 3. Instalar dependências e rodar em desenvolvimento

**Terminal 1 - Backend:**

```bash
cd api
npm install
npm run dev
```

O backend vai rodar em `http://localhost:4000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

O frontend vai rodar em `http://localhost:3000` e qualquer requisição `/api/*` será proxiada para `http://localhost:4000`

### 4. Criar/sincronizar banco de dados

```bash
cd api
npx prisma migrate dev
# ou em produção:
npx prisma migrate deploy
```

## 📦 Build para Produção

### Opção A: Build local + Dockerfile

```bash
# Na raiz do projeto
docker build -t appfidelidade:latest .
docker run -p 4000:4000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  -e JWT_SECRET="seu-secret" \
  appfidelidade:latest
```

### Opção B: CI/CD com GitHub Actions + Railway

1. **Fazer push para `main`:**

   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

2. **GitHub Actions vai:**

   - Fazer checkout do código
   - Build a imagem Docker (frontend + backend integrados)
   - Publicar em `ghcr.io/DouglasMoraesDev/appfidelidade:latest`
   - (Opcional) Acionar deploy no Railway se secrets forem configurados

3. **Configurar Railway:**
   - Adicione os secrets no GitHub (Settings > Secrets and variables > Actions):
     - `RAILWAY_TOKEN`: token de API do Railway
     - `RAILWAY_PROJECT_ID`: ID do projeto Railway
   - No Railroad, configure o serviço para usar a imagem: `ghcr.io/DouglasMoraesDev/appfidelidade:latest`
   - Configure variáveis de ambiente (ver seção abaixo)

## ⚙️ Variáveis de Ambiente

### Backend (api/.env)

| Variável         | Descrição                         | Exemplo                                |
| ---------------- | --------------------------------- | -------------------------------------- |
| `DATABASE_URL`   | String de conexão MySQL           | `mysql://root:senha@host:3306/railway` |
| `PORT`           | Porta do servidor                 | `4000`                                 |
| `HOST`           | Host para bind                    | `0.0.0.0`                              |
| `JWT_SECRET`     | Secret para JWT                   | `seu-secret-seguro`                    |
| `SERVE_FRONTEND` | Servir frontend (true/false)      | `true`                                 |
| `NODE_ENV`       | Ambiente (development/production) | `production`                           |

### Railway (Variáveis no painel)

Configure no Railway Dashboard > Variables:

```
DATABASE_URL=mysql://...
PORT=4000
JWT_SECRET=seu-secret
SERVE_FRONTEND=true
NODE_ENV=production
```

## 🔗 Integração Frontend + Backend

O backend (`api/src/server.js`) serve automaticamente o frontend compilado:

1. **Postinstall script** em `api/package.json`:

   ```json
   "postinstall": "cd ../frontend && npm ci --prefer-offline && npm run build || true"
   ```

2. **Dockerfile multi-stage:**

   - Stage 1: Compila frontend (Vite) + backend (Prisma)
   - Stage 2: Copia `frontend/dist` para `/app/frontend/dist`
   - Backend detecta o diretório e serve como estático

3. **Server.js logic:**
   ```javascript
   if (fs.existsSync(distPath)) {
     app.use(express.static(distPath));
     app.get("*", (req, res) => {
       res.sendFile(path.join(distPath, "index.html"));
     });
   }
   ```

Isso garante que:

- API fica em `/api/*`
- Frontend fica em `/` (e todos os paths 404 caem em `index.html`)

## 🧪 Testing & Validation

### Health Check

```bash
curl http://localhost:4000/health
# Resposta: {"status":"ok"}
```

### API Endpoints

```bash
curl http://localhost:4000/api/estabelecimentos
```

### Frontend

Acesse `http://localhost:4000` no navegador (ou `http://localhost:3000` em dev)

## 🐳 Docker

### Build local

```bash
docker build -t appfidelidade:latest .
```

### Run

```bash
docker run --rm \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="seu-secret" \
  -p 4000:4000 \
  appfidelidade:latest
```

### Logs

```bash
docker logs <container-id>
```

## 🚀 Deploy no Railway

### 1. Sincronizar banco de dados (PRIMEIRO)

```bash
cd api
npm install
npx prisma migrate deploy
```

### 2. Fazer commit e push

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

O GitHub Actions vai:

- Build a imagem
- Publicar em GHCR
- Tentar fazer deploy no Railway (se secrets estiverem configurados)

### 3. Acessar a aplicação

```
https://appfidelidade-production.up.railway.app/
```

### 4. Troubleshooting no Railway

**Se a app retorna "Application failed to respond":**

1. **Checar logs:**

   - Railway Dashboard > Services > Logs
   - Procure por erros de Prisma, conexão DB, ou stack traces

2. **Verificar variáveis de ambiente:**

   - DATABASE_URL está sem aspas duplas?
   - PORT=4000?
   - SERVE_FRONTEND=true?

3. **Testar health endpoint:**

   ```bash
   curl https://appfidelidade-production.up.railway.app/health
   ```

4. **Reiniciar serviço:**

   - Railway Dashboard > Services > (Clique no serviço) > Restart

5. **Atualizar imagem:**
   - Se foi publicada nova versão, Railway Dashboard > Deploy > Redeploy Latest
   - Ou aponte para `ghcr.io/DouglasMoraesDev/appfidelidade:latest`

## 📝 Scripts Úteis

```bash
# Backend
cd api

# Desenvolvimento
npm run dev              # Inicia com nodemon

# Produção
npm start                # Inicia sem nodemon

# Prisma
npx prisma generate     # Gera Prisma Client
npx prisma migrate dev  # Cria/aplica migration (dev)
npx prisma migrate deploy # Aplica migrations (produção)
npx prisma studio      # Abre interface visual do banco

# Frontend
cd ../frontend

# Desenvolvimento
npm run dev              # Inicia Vite server

# Build
npm run build            # Compila para dist/

# Preview
npm run preview          # Preview do build localmente
```

## 🔐 Segurança

- **JWT_SECRET:** Use um valor forte e único em produção
- **DATABASE_URL:** Não fazer commit da senha real; usar variáveis de ambiente
- **CORS:** Configurado com `origin: true` em dev; ajuste em produção se necessário
- **Prisma binaryTargets:** Suporta múltiplos OpenSSL para compatibilidade com diferentes runtimes

## 📚 Documentação Adicional

- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Railway Docs](https://docs.railway.app/)

## 💬 Suporte

Para dúvidas ou erros:

1. Verificar `api/.env` (DATABASE_URL, JWT_SECRET)
2. Rodar `npx prisma migrate deploy` se houver erro de schema
3. Checar logs: local com `npm run dev` ou Railway Dashboard > Logs
4. Criar issue no repositório

---

**Status:** ✅ Integração frontend + backend pronta para produção
