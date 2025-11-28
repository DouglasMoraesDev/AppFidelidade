# 🔧 Troubleshooting - AppFidelidade

## Índice Rápido

- [Erros no Build Local](#erros-no-build-local)
- [Erros no GitHub Actions](#erros-no-github-actions)
- [Erros no Railway](#erros-no-railway)
- [Erros de Prisma](#erros-de-prisma)
- [Erros de Frontend](#erros-de-frontend)
- [Checklist de Debug](#checklist-de-debug)

---

## Erros no Build Local

### ❌ "npm ERR! Peer dependency issues"

**Problema:** Falta de dependências de peer (geralmente no vite/react)

**Solução:**

```bash
cd frontend
npm install --legacy-peer-deps
# ou
npm install --force
```

---

### ❌ "Cannot find module '@/components'"

**Problema:** Alias TypeScript não configurado

**Solução:** Verificar `frontend/vite.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  }
}
```

E `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### ❌ "vite build failed"

**Problema:** Erro ao compilar frontend

**Solução:**

```bash
cd frontend

# 1. Limpar cache
rm -rf node_modules/.vite

# 2. Reinstalar
npm ci --prefer-offline

# 3. Tentar build novamente
npm run build

# Se persistir, ver o erro detalhado
npm run build -- --debug
```

---

### ❌ "Prisma Client not generated"

**Problema:** Falta do Prisma Client na pasta `node_modules/@prisma/client`

**Solução:**

```bash
cd api

# Gerar Prisma Client
npx prisma generate

# Ou reinstalar tudo
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

---

## Erros no GitHub Actions

### ❌ Build falha no GitHub Actions

**Problema:** Local funciona, mas no GitHub Actions não

**Passos:**

1. Ver logs no GitHub: `Actions` → (último run) → (clique no X vermelho)
2. Procure por:
   - `Error: Command failed` (qual comando?)
   - `npm ERR!` (erro de dependência)
   - `failed to solve: ...` (erro Docker)

**Soluções comuns:**

```bash
# Limpar cache no GitHub
# Settings → Actions → Clear all caches

# Ou trigger novo run
git commit --allow-empty -m "Trigger CI"
git push
```

---

### ❌ "failed to push to registry"

**Problema:** Não consegue fazer login ou push em GHCR

**Solução:**

1. Verificar que `GITHUB_TOKEN` está disponível (padrão no GitHub Actions)
2. Se erro persistir, verificar:
   - Registry correcta: `ghcr.io`
   - Username: `${{ github.actor }}`
   - Password: `${{ secrets.GITHUB_TOKEN }}` (tem permissão `packages:write`?)

---

### ❌ "multi-platform build failed"

**Problema:** Build falha ao tentar compilar para arm64

**Solução:** Remover multi-platform (já feito no workflow):

```yaml
# ❌ Remover isso:
# platforms: linux/amd64,linux/arm64

# ✅ Deixar apenas:
platforms: linux/amd64
```

---

## Erros no Railway

### ❌ "Application failed to respond"

**Diagnóstico:**

1. **Verificar variáveis de ambiente:**

   ```
   Railway Dashboard → Services → Variables
   ```

   Deve ter:

   ```
   DATABASE_URL=mysql://... (SEM aspas duplas!)
   PORT=4000
   SERVE_FRONTEND=true
   ```

2. **Ver logs:**

   ```
   Railway Dashboard → Services → Logs
   ```

   Procure por:

   - ✅ `API rodando na porta 4000`
   - ✅ `Prisma conectado`
   - ❌ Erros de conexão DB
   - ❌ Erros de módulo não encontrado

3. **Testar health endpoint:**

   ```bash
   curl https://appfidelidade-production.up.railway.app/health
   ```

4. **Reiniciar:**
   ```
   Railway Dashboard → Services → Restart
   ```

---

### ❌ "PORT already in use"

**Problema:** Outra instância rodando na porta 4000

**Solução:**

```bash
# Railway automaticamente gerencia portas
# Mas verificar no Dashboard que PORT=4000 está setado
```

---

### ❌ "Cannot connect to database"

**Problema:** Conexão MySQL falhando

**Verificar:**

1. **DATABASE_URL correto?**

   ```
   Railway Dashboard → Variables → DATABASE_URL
   ```

2. **MySQL está rodando?**

   - Se Railway Plugin: verificar em `Services`
   - Se externo: verificar na plataforma (ex.: Shuttle)

3. **Credenciais corretas?**

   ```bash
   # Testar localmente
   mysql -h [host] -u [user] -p[password] [database]
   ```

4. **Firewall/Network?**
   - Railway está em mesma rede que DB?
   - DB aceita conexões externas?

**Solução:**

```bash
# Rebuildar imagem com novo DATABASE_URL
# Railway Dashboard → Redeploy Latest
```

---

## Erros de Prisma

### ❌ "Prisma Client could not locate the Query Engine"

**Problema:** Binary OpenSSL não encontrado no runtime

**Solução:** (já corrigido no Dockerfile)

```dockerfile
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
```

Se persistir:

```bash
# Regenerar Prisma Client com binaryTargets corretos
cd api

# Adicionar binaryTargets em schema.prisma:
# generator client {
#   provider = "prisma-client-js"
#   binaryTargets = ["native", "debian-openssl-3.0.x", "debian-openssl-1.1.x"]
# }

npx prisma generate
npx prisma migrate deploy
```

---

### ❌ "Error: P1012 - invalid comment syntax"

**Problema:** Comentários com `#` dentro de `generator` block

**Solução:** Usar `//` em vez de `#`:

```prisma
generator client {
  provider = "prisma-client-js"
  // ✅ Comentários com //
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

---

### ❌ "Error validating database connection: Expected 0 arguments, got 1"

**Problema:** Migração com SQL inválido

**Solução:**

```bash
# Ver qual migration tem erro
cd api
npx prisma migrate status

# Se migration antiga está com erro, corrigir em:
# prisma/migrations/[timestamp]_[name]/migration.sql

# Depois rodar:
npx prisma migrate deploy
```

---

## Erros de Frontend

### ❌ "Frontend não carrega no Railway (mostra só JSON)"

**Problema:** `SERVE_FRONTEND` não ativado ou dist não foi copiado

**Verificar:**

1. Logs no Railway devem ter:

   ```
   [Server] Servindo frontend estático de: /app/frontend/dist
   ```

2. Se não aparecer:
   - `SERVE_FRONTEND=true` está setado?
   - `frontend/dist` foi copiado no Docker?

**Solução:**

```bash
# Rebuild localmente e push
npm run build  # frontend
npm start      # backend deve servir em http://localhost:4000

# Push
git add .
git push origin main

# Railway vai rebuildar e redeployar
```

---

### ❌ "Blank page / 404 no frontend"

**Problema:** HTML não está sendo servido, ou rotas React não funcionam

**Verificar:**

1. `frontend/index.html` existe e tem `<div id="root">`?
2. `server.js` tem fallback para SPA:
   ```javascript
   app.get("*", (req, res) => {
     res.sendFile(path.join(servedFrontendPath, "index.html"));
   });
   ```

**Solução:**

```bash
# Verificar build local
cd frontend
npm run build

# Ver se /index.html foi gerado
ls -la dist/

# Se não, error no build
npm run build -- --debug
```

---

### ❌ "API calls from frontend failing (CORS)"

**Problema:** Frontend em um domínio, API em outro (ou esquema diferente)

**Verificar:** `server.js`:

```javascript
app.use(cors({ origin: true })); // Aceita todas as origens
```

Se quiser restringir:

```javascript
app.use(
  cors({
    origin: ["https://appfidelidade-production.up.railway.app"],
    credentials: true,
  })
);
```

---

## Checklist de Debug

### Quando algo não funciona:

- [ ] **Build local funciona?**

  ```bash
  cd frontend && npm run build
  cd ../api && npm run prisma-generate
  npm start
  ```

- [ ] **Git push feito?**

  ```bash
  git log --oneline -1
  # Deve mostrar seu último commit
  ```

- [ ] **GitHub Actions passou?**

  ```
  GitHub → Actions → último run (verde?)
  ```

- [ ] **Imagem foi publicada?**

  ```bash
  # Verificar em:
  # https://github.com/DouglasMoraesDev/AppFidelidade/packages
  # Procure por: ghcr.io/.../appfidelidade:latest
  ```

- [ ] **Variáveis no Railway corretas?**

  ```
  DATABASE_URL (sem aspas)
  PORT=4000
  SERVE_FRONTEND=true
  ```

- [ ] **Railway logs foi verificado?**

  ```
  Railway Dashboard → Services → Logs
  Procure por erros
  ```

- [ ] **Health endpoint responde?**
  ```bash
  curl https://appfidelidade-production.up.railway.app/health
  ```

---

## Comandos Úteis

```bash
# Teste localmente
npm run dev        # Backend + Frontend em paralelo

# Build produção
npm run build      # Frontend
npm start          # Backend (com frontend compilado)

# Docker local
docker build -t appfidelidade:latest .
docker run -p 4000:4000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  appfidelidade:latest

# Logs
docker logs -f <container-id>

# Prisma
npx prisma migrate status     # Ver estado
npx prisma migrate dev        # Local dev
npx prisma migrate deploy     # Produção
npx prisma studio            # Interface visual
```

---

## Eskalação / Contato

Se nada funcionar após seguir este guide:

1. **Coletar info:**

   - Coletar TODOS os logs (local, GitHub Actions, Railway)
   - Versão do Node, npm, Docker
   - Erro exato (copiar/colar stack trace)

2. **Railway Support:**

   - https://railway.app/help
   - Criar ticket com logs

3. **GitHub Issues:**
   - Abrir issue no repositório com detalhes

---

**Versão:** 1.0
**Última atualização:** 28 de novembro de 2025
