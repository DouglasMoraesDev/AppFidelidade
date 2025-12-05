# 📚 AppFidelidade - Documentação Completa

**Última atualização**: 5 de dezembro de 2025

---

## 📋 Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração Inicial](#configuração-inicial)
4. [Desenvolvimento Local](#desenvolvimento-local)
5. [Sincronização entre Computadores](#sincronização-entre-computadores)
6. [Deploy em Produção](#deploy-em-produção)
7. [Super Admin](#super-admin)
8. [Troubleshooting](#troubleshooting)
9. [Histórico de Atualizações](#histórico-de-atualizações)

---

## 🎯 Sobre o Projeto

Sistema completo de gerenciamento de cartões de fidelidade com:

- Frontend PWA (React + TypeScript + Vite)
- Backend API REST (Node.js + Express)
- Banco de dados MySQL (via Prisma ORM)
- Sistema de notificações push
- Painel super admin
- Temas personalizáveis por estabelecimento
- Deploy automatizado no Railway

---

## 🏗️ Estrutura do Projeto

```
AppFidelidade/
├── api/                          # Backend
│   ├── src/
│   │   ├── server.js            # Servidor principal
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── prismaClient.js
│   │   ├── controllers/         # Controladores da API
│   │   ├── routes/              # Rotas da API
│   │   ├── middlewares/         # Auth, SuperAdmin, etc
│   │   └── services/
│   ├── prisma/
│   │   └── schema.prisma        # Schema do banco
│   ├── package.json
│   └── .env                      # Variáveis de ambiente (NÃO commitado)
├── frontend/                      # Frontend
│   ├── src/
│   ├── components/
│   ├── index.html
│   ├── App.tsx
│   ├── vite.config.ts
│   └── package.json
└── Dockerfile                     # Multi-stage build
```

---

## ⚙️ Configuração Inicial

### Pré-requisitos

- **Node.js**: >= 22.12.0
- **npm**: >= 11.x
- **Git**: Para versionamento

### Instalação do Node.js

**Windows:**

```powershell
winget install OpenJS.NodeJS.LTS
```

Depois **reinicie o VS Code** para reconhecer o Node.js.

### Clone do Repositório

```bash
git clone https://github.com/DouglasMoraesDev/AppFidelidade.git
cd AppFidelidade
```

### Instalação de Dependências

**API:**

```bash
cd api
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### Configuração do Arquivo .env

Crie o arquivo `api/.env` com o seguinte conteúdo:

```env
# Porta do servidor (local)
PORT=4000

# Host
HOST=0.0.0.0

# Database URL - Railway
DATABASE_URL="mysql://root:xBupgaNtJLhdplUfgqQxslAfyNxcROSu@shuttle.proxy.rlwy.net:18002/railway"

# JWT Secret
JWT_SECRET="Voyageturbo13."

# Super Admin Secret (IMPORTANTE: usar aspas por causa do #)
SUPER_ADMIN_SECRET="Dooug#525210"

# Frontend URL (local)
FRONTEND_URL=http://localhost:3000

# Ambiente
NODE_ENV=development

# Servir frontend compilado?
SERVE_FRONTEND=false

# VAPID Keys para notificações push
VAPID_EMAIL="mailto:appfidelidade@example.com"
VAPID_PUBLIC_KEY="BDPNRvzoJkaYoYwlYfFe4tFW3QASg43eMy0AVjVILVt7r6PMLhxCT6cYrhNQuX12rukc-5tl7hYVjKj_RqWmEr8"
VAPID_PRIVATE_KEY="6azKY09n_vHX5YeUZmCwtgq-stTRb7Mpqioc7TJyivM"
```

**⚠️ IMPORTANTE:**

- O arquivo `.env` **NÃO** está no Git por segurança
- Sempre use **aspas** em valores com caracteres especiais (#, espaços, etc)

---

## 💻 Desenvolvimento Local

### Portas Utilizadas

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Banco de dados**: Railway (porta 18002)

### Iniciando o Projeto

Abra **2 terminais**:

**Terminal 1 - API:**

```powershell
cd api
npm run dev
```

**Terminal 2 - Frontend:**

```powershell
cd frontend
npm run dev
```

### Acessando o Sistema

Abra o navegador em: **http://localhost:3000**

**Credenciais de Teste:**

- Login estabelecimento: use as credenciais cadastradas
- Super Admin: usuário `Dooug`, senha `525210`

---

## 🔄 Sincronização entre Computadores

### Workflow Diário

#### ✅ ANTES de trabalhar (SEMPRE):

```bash
git pull origin main
```

#### ✅ DEPOIS de trabalhar (SEMPRE):

```bash
git add .
git commit -m "descrição clara do que foi feito"
git push origin main
```

### Regras de Ouro

1. **SEMPRE** faça `git pull` antes de começar
2. **SEMPRE** faça `git push` depois de terminar
3. **NUNCA** deixe alterações sem commit ao trocar de computador
4. Se tiver conflitos, resolva antes de continuar

### Setup em Novo Computador

1. **Instalar Node.js** (ver seção de instalação)
2. **Clonar o repositório**:
   ```bash
   git clone https://github.com/DouglasMoraesDev/AppFidelidade.git
   cd AppFidelidade
   ```
3. **Instalar dependências**:
   ```bash
   cd api && npm install
   cd ../frontend && npm install
   ```
4. **Criar arquivo `.env`** (copiar do outro PC ou usar o template acima)
5. **Testar**: rodar API e Frontend

### Comandos Úteis Git

```bash
# Ver status
git status

# Ver últimos commits
git log --oneline -10

# Descartar alterações locais (CUIDADO!)
git checkout .

# Criar backup antes de pull
git stash
git pull origin main
git stash pop
```

---

## 🚀 Deploy em Produção

O projeto está configurado para deploy automático no **Railway**.

### Como Funciona

1. Você faz `git push origin main`
2. Railway detecta o push
3. Executa o build automaticamente
4. Atualiza o app em produção

### Variáveis de Ambiente no Railway

Configuradas no painel Railway (mesmo conteúdo do `.env` local):

- `DATABASE_URL`
- `JWT_SECRET`
- `SUPER_ADMIN_SECRET`
- `NODE_ENV=production`
- `VAPID_*` (chaves push)

### URL de Produção

https://appfidelidade-production.up.railway.app

---

## 👨‍💼 Super Admin

### Acesso Direto (Recomendado)

**URL Exclusiva**: http://localhost:3000/admin-douglas-2025

Esta URL vai **direto** para o login do Super Admin, sem precisar sair de nenhum login de estabelecimento.

#### 💡 Dica: Criar Atalho

1. Acesse `http://localhost:3000/admin-douglas-2025`
2. Adicione aos favoritos ou crie um atalho na área de trabalho
3. Sempre que abrir este link, vai direto ao Super Admin

### Credenciais

- **Usuário**: Dooug
- **Senha**: 525210

### Funcionalidades

- Dashboard com métricas gerais
- Gestão de estabelecimentos
- Adicionar/remover pagamentos
- Resetar senhas
- Ativar/desativar estabelecimentos
- Enviar notificações globais
- Configurações de tema
- Configurações avançadas

### Segurança

O super admin usa um **secret** via header HTTP:

```
x-super-admin-secret: Dooug#525210
```

Definido em:

- Frontend: `App.tsx` (constante `SUPER_ADMIN_SECRET`)
- Backend: `api/src/middlewares/superAdmin.middleware.js`

---

## 🔧 Troubleshooting

### Problema: Frontend na porta errada (3001 ao invés de 3000)

**Causa**: Porta 3000 já ocupada  
**Solução**:

```powershell
# Parar processo na porta 3000
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
# Reiniciar frontend
cd frontend
npm run dev
```

### Problema: Erro 401 no Super Admin

**Causa**: Secret no `.env` sem aspas (caractere `#` interpretado como comentário)  
**Solução**: Adicionar aspas:

```env
SUPER_ADMIN_SECRET="Dooug#525210"
```

Reiniciar a API após a mudança.

### Problema: Módulo não encontrado (vite, etc)

**Causa**: Dependências não instaladas ou corrompidas  
**Solução**:

```bash
cd frontend
rm -rf node_modules
npm install
```

### Problema: npm não reconhecido após instalar Node.js

**Causa**: PATH não atualizado  
**Solução**: Reinicie o VS Code ou terminal

### Problema: Erro de conexão com banco de dados

**Causa**: DATABASE_URL incorreta ou Railway fora do ar  
**Solução**: Verificar variável no `.env` e conectividade com Railway

### Problema: Git conflitos ao fazer pull

**Causa**: Alterações locais conflitam com remotas  
**Solução**:

```bash
# Ver arquivos em conflito
git status

# Descartar alterações locais (CUIDADO!)
git checkout .
git pull origin main

# OU resolver manualmente os conflitos
# Editar arquivos marcados com <<<<<<<
# Depois:
git add .
git commit -m "resolvido conflito"
```

---

## 📝 Histórico de Atualizações

### 5 de Dezembro de 2025

**Configuração Notebook**

- ✅ Instalado Node.js v24.11.1 via winget
- ✅ Configurado PowerShell ExecutionPolicy para RemoteSigned
- ✅ Instaladas dependências da API e Frontend
- ✅ Criado arquivo `.env` com credenciais Railway
- ✅ Corrigido vite.config.ts (portas 3000 frontend / 4000 API)
- ✅ Corrigido SUPER_ADMIN_SECRET com aspas no `.env`
- ✅ Corrigido FRONTEND_URL de 5173 para 3000
- ✅ Projeto funcionando e sincronizado com PC de casa
- ✅ Consolidada documentação em arquivo único

**Problemas Resolvidos**

- Frontend iniciando na porta errada (3001)
- Erro 401 no super admin (secret sem aspas)
- Configurações diferentes entre PC de casa e notebook

**Arquivos Criados/Modificados**

- `api/.env` - Criado com configurações corretas
- `api/src/middlewares/superAdmin.middleware.js` - Adicionados logs debug (podem ser removidos)
- `DOCUMENTACAO-COMPLETA.md` - Este arquivo

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consultar seção [Troubleshooting](#troubleshooting)
2. Verificar logs nos terminais da API e Frontend
3. Consultar este documento

---

**Desenvolvido com ❤️ por Douglas Moraes**
