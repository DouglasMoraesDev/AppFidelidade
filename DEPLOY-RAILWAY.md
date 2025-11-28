# 🚀 Guia de Deploy no Railway (AppFidelidade)

## ⚠️ PRÉ-REQUISITOS

Antes de fazer o deploy, você deve:

1. ✅ Ter clonado o repositório e feito as modificações
2. ✅ Ter testado o build local (`npm run build` no frontend, `npm run prisma-generate` no backend)
3. ✅ Ter um banco de dados MySQL funcionando (Railway Plugins ou externo)
4. ✅ Ter um repositório GitHub com o código
5. ✅ Ter conta no Railway conectada ao GitHub

---

## PASSO 1: Preparar o Repositório (GitHub)

### 1.1. Fazer Commit e Push

```bash
cd C:\Users\dougm\Downloads\AppFidelidade_complete_with_auth_frontend

# Adicionar todas as mudanças
git add .

# Fazer commit
git commit -m "Prepare production deployment: integrated frontend+backend, improved Dockerfile, fixed workflow"

# Push para main
git push origin main
```

Após o push:

- GitHub Actions vai rodar o workflow `.github/workflows/ci-deploy.yml`
- A imagem Docker será compilada e publicada em `ghcr.io/DouglasMoraesDev/appfidelidade:latest`

### 1.2. Verificar GitHub Actions

1. Acesse seu repositório no GitHub
2. Vá em **Actions** tab
3. Procure pelo run mais recente
4. Verifique se o build foi bem-sucedido ✅

---

## PASSO 2: Configurar Railway (Primeira Vez)

### 2.1. Login no Railway Dashboard

Acesse: https://railway.app/dashboard

### 2.2. Criar/Configurar o Serviço

**Se NÃO tem serviço ainda:**

- Clique em "New Project"
- Selecione "GitHub Repo" ou "Deploy from Git"
- Escolha o repositório `AppFidelidade`

**Se JÁ tem o serviço:**

- Vá em **Services** e clique no serviço existente

### 2.3. Configurar Variáveis de Ambiente

No **Railway Dashboard**, clique no serviço → **Variables** e adicione:

```
DATABASE_URL=mysql://root:xBupgaNtJLhdplUfgqQxslAfyNxcROSu@shuttle.proxy.rlwy.net:18002/railway
PORT=4000
HOST=0.0.0.0
JWT_SECRET=Voyageturbo13.
SERVE_FRONTEND=true
NODE_ENV=production
```

⚠️ **Importante:**

- **Copiar DATABASE_URL SEM aspas duplas**
- Deixar todas as outras variáveis exatamente como acima

### 2.4. Apontar para a Imagem Docker (Método A: Manual)

1. No serviço do Railway, vá em **Deploy** ou **Settings**
2. Procure por "Image" ou "Docker Image"
3. Cole a URL da imagem:
   ```
   ghcr.io/DouglasMoraesDev/appfidelidade:latest
   ```
4. Clique em **Deploy** ou **Restart**

### 2.5. (Alternativo) Usar GitHub Secrets para Auto-Deploy (Método B: Automático)

Se quiser que o deploy rode automaticamente após cada push:

1. No GitHub, vá em seu repositório → **Settings** → **Secrets and variables** → **Actions**

2. Clique em **New repository secret** e adicione:

   **Secret 1: RAILWAY_TOKEN**

   - Name: `RAILWAY_TOKEN`
   - Value: seu token do Railway (obtém em Railway Dashboard → Account → API Tokens)

   **Secret 2: RAILWAY_PROJECT_ID**

   - Name: `RAILWAY_PROJECT_ID`
   - Value: o ID do seu projeto (obtém em Railway Dashboard → Project Settings)

3. Agora, cada push para `main` vai:
   - Compilar a imagem
   - Publicar em GHCR
   - Tentar fazer deploy automaticamente no Railway

---

## PASSO 3: Sincronizar Banco de Dados (IMPORTANTE!)

### 3.1. Primeiro Deploy

Se é a PRIMEIRA VEZ que você faz deploy e o banco está vazio:

```bash
cd api

# Instalar dependências (se não tiver feito)
npm install

# Aplicar todas as migrations
npx prisma migrate deploy
```

Se der erro de conexão, verifique:

- `DATABASE_URL` está correta?
- O servidor MySQL está rodando?
- As credenciais estão corretas?

### 3.2. Deployments Posteriores

Se já tem migracoes aplicadas, ele vai rodar automatically quando o servidor inicia.

---

## PASSO 4: Validar o Deploy

### 4.1. Acessar a Aplicação

Depois de fazer o deploy, acesse:

```
https://appfidelidade-production.up.railway.app/
```

Você deve ver:

- ✅ A página de login/home do frontend
- ✅ Sem erro "Application failed to respond"

### 4.2. Testar Health Endpoint

```bash
curl https://appfidelidade-production.up.railway.app/health
# Deve retornar: {"status":"ok"}
```

Ou acesse no navegador:

```
https://appfidelidade-production.up.railway.app/health
```

### 4.3. Testar uma API

```bash
curl https://appfidelidade-production.up.railway.app/api/estabelecimentos
# Deve retornar um JSON (vazio ou com dados)
```

---

## TROUBLESHOOTING

### Erro: "Application failed to respond"

**Causas possíveis:**

1. **Variáveis de ambiente não setadas corretamente**

   - Verificar no Railway Dashboard → Variables
   - DATABASE_URL deve estar SEM aspas duplas

2. **Banco de dados não está acessível**

   ```bash
   # Testar conexão localmente
   cd api
   npx prisma db push
   ```

3. **Imagem antiga ainda rodando**

   - Railway Dashboard → Services → (Seu serviço) → **Redeploy** ou **Restart**

4. **Migrations não aplicadas**

   - Rodar localmente: `npx prisma migrate deploy`
   - Ou abrir SSH no Railway e rodar lá

5. **Ver logs detalhados:**
   - Railway Dashboard → Services → (Seu serviço) → **Logs**
   - Procure por erros de Prisma, Express, etc.

### Erro: "Prisma Client could not locate the Query Engine"

- Isso já foi corrigido no Dockerfile (instalação de OpenSSL)
- Se persistir, tente:
  ```bash
  cd api
  rm -rf node_modules/.prisma
  npx prisma generate
  npx prisma migrate deploy
  ```

### Frontend não carrega (mostra só API)

- Verificar que `SERVE_FRONTEND=true` está setado
- Verificar que `frontend/dist` foi copiado corretamente no build
- Ver logs: `[Server] Servindo frontend estático de: ...`

---

## Monitoramento

### Logs

Acesse regularmente:

```
Railway Dashboard → Services → (Seu serviço) → Logs
```

Procure por:

- ✅ `[Prisma] Conectado com sucesso ao banco de dados.`
- ✅ `[Server] Servindo frontend estático de: /app/frontend/dist`
- ✅ `API rodando na porta 4000 (host 0.0.0.0)`

### Health Check

```bash
# Testar regularmente
curl https://appfidelidade-production.up.railway.app/health

# Ou crie um Monitor no Railway
```

---

## PRÓXIMAS ETAPAS

1. ✅ Commit e push do código
2. ✅ Configurar variáveis no Railway
3. ✅ Fazer deploy (manual ou via workflow)
4. ✅ Testar health endpoint
5. ✅ Acessar a aplicação em produção
6. ✅ Monitorar logs

---

## Contato / Suporte

Se houver problemas:

1. Verificar logs no Railway Dashboard
2. Testar localmente com `npm run dev` ou `npm start`
3. Validar variáveis de ambiente (sem aspas, valores corretos)
4. Criar issue no GitHub com o erro

---

**Última atualização:** 28 de novembro de 2025
**Status:** ✅ Pronto para produção
