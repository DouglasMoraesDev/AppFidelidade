# 🔧 FIX RÁPIDO - PORT 8080 → 4000

## ⚠️ PROBLEMA IDENTIFICADO

No Railway está rodando em **PORT=8080**, mas deveria ser **PORT=4000**.

**Logs do Railway:**

```
API rodando na porta 8080 (host 0.0.0.0)
```

**Frontend tentando acessar:**

```
POST http://localhost:4000/api/auth/login net::ERR_CONNECTION_REFUSED
```

---

## ✅ SOLUÇÃO (2 MINUTOS)

### PASSO 1: Abrir Railway Dashboard

Acesse: https://railway.app/dashboard

### PASSO 2: Ir para o Serviço

```
Services → (seu serviço AppFidelidade)
```

### PASSO 3: Verificar/Atualizar PORT

Vá em: **Variables**

**Procure por `PORT`:**

- ❌ Se estiver `8080` → **MUDE para `4000`**
- ✅ Se estiver `4000` → ok
- ⚠️ Se não existir → **ADICIONE: PORT=4000**

### PASSO 4: Confirmar Outras Variáveis

Certifique-se que existem:

```
DATABASE_URL=mysql://root:xBupgaNtJLhdplUfgqQxslAfyNxcROSu@shuttle.proxy.rlwy.net:18002/railway
PORT=4000
HOST=0.0.0.0
JWT_SECRET=Voyageturbo13.
SERVE_FRONTEND=true
NODE_ENV=production
```

### PASSO 5: Reiniciar/Redeploy

Depois de mudar as variáveis:

```
Railway Dashboard → Services → (seu serviço) → Redeploy Latest
ou
Restart
```

Aguarde status ficar verde ✅

---

## 🧪 VALIDAR

Após reiniciar, tente novamente no navegador:

```
https://appfidelidade-production.up.railway.app/
```

Frontend deve carregar ✅

Tente fazer login (deve funcionar agora)

---

## 📝 RESUMO RÁPIDO

| Problema                       | Solução                         |
| ------------------------------ | ------------------------------- |
| PORT=8080                      | Mudar para PORT=4000            |
| Frontend não consegue conectar | Variáveis incorretas no Railway |
| Local funciona, produção não   | Variáveis não sincronizadas     |

---

**Depois que fizer essa mudança, tudo deve funcionar! 🎉**
