# 🧪 Guia de Testes - AppFidelidade Melhorado

## 📋 Checklist de Testes

### ✅ Teste 1: Branding & PWA

**Objetivo:** Verificar se o app tem branding correto e funciona offline

```bash
# 1. Iniciar desenvolvimento
cd frontend
npm run dev

# 2. Abrir em http://localhost:5173
# 3. Verificar:
#    - Aba do navegador mostra "AppFidelidade" ✓
#    - Ícone de app apareça (PWA ready)
#    - No Chrome/Edge: Menu > Instalar AppFidelidade (deve estar disponível)
```

**Resultado esperado:**

- Título correto na aba
- App instalável
- Service Worker registrado (DevTools > Application > Service Workers)

### ✅ Teste 2: Dashboard Personalizado

```bash
# 1. Login com teste@teste.com / senha
# 2. Ir para Dashboard
# 3. Verificar:
#    - Mensagem: "Bem-vindo, [Nome Estabelecimento]! ..."
#    - Ícone 👥 em "Total de Clientes"
#    - Ícone ✉️ em "Vouchers Enviados"
#    - Ícone ⏱️ em "Atividade (24h)"
```

**Resultado esperado:**

- Nome do estabelecimento exibido
- Ícones corretos nas cards
- Informações de clientes visíveis

### ✅ Teste 3: Confirmação de Voucher

```bash
# 1. Ir para Notificações
# 2. Procurar cliente com >= pontos_para_voucher
# 3. Clicar "Enviar Voucher"
# 4. Verificar fluxo:
#    - WhatsApp abre em nova aba
#    - Modal aparece perguntando confirmação
#    - Opções: "Confirmar" e "Cancelar"
```

**Teste A - Confirmar:**

1. Clicar "Confirmar"
2. Verificar se pontos do cliente zerados
3. totalVouchersSent incrementa

**Teste B - Cancelar:**

1. Clicar "Cancelar"
2. Verificar se pontos do cliente mantidos
3. Poder enviar novamente

**Resultado esperado:**

- Modal aparece e funciona corretamente
- Pontos zerados apenas após confirmação
- Feedback claro ao usuário

### ✅ Teste 4: Mobile Viewport

**Testar no Chrome DevTools:**

```bash
# 1. F12 para abrir DevTools
# 2. Ctrl+Shift+M para modo mobile
# 3. Testar em:
#    - iPhone 12 (390x844)
#    - Samsung Galaxy S20 (360x800)
#    - iPad (768x1024)
```

**Verificar:**

- ✓ Página centralizada (sem scroll lateral)
- ✓ Sem zoom involuntário
- ✓ Notch support no iOS (se aplicável)
- ✓ Botões clicáveis sem problemas

**Resultado esperado:**

- Tela completamente centralizada
- Sem necessidade de pinça para ver conteúdo
- Responsivo em todos os tamanhos

### ✅ Teste 5: Consulta Pública de Pontos

```bash
# 1. Obter link de consulta em Settings > Link Público de Pontos
# 2. Copiar QR Code ou link
# 3. Abrir em nova aba anonimamente
# 4. Testar busca:
#    - Nome do cliente
#    - Telefone
#    - Verificar carimbos mostrados
```

**Verificar:**

- ✓ Título exibe "AppFidelidade - Consulta de Pontos"
- ✓ Imagens (logos) carregam corretamente
- ✓ URLs relativas funcionam (sem localhost)
- ✓ Pesquisa funciona

**Resultado esperado:**

- Página pública funciona sem autenticação
- Imagens carregam do servidor correto
- Consulta retorna dados corretos

### ✅ Teste 6: Instalação como App

**iOS (Safari):**

```
1. Abrir https://appfidelidade-production.up.railway.app/
2. Compartilhar (ícone de seta)
3. "Adicionar à Tela Inicial"
4. Nome: "AppFidelidade"
5. Home Screen > Novo ícone aparece
6. Tocar para abrir como app
```

**Android (Chrome):**

```
1. Abrir https://appfidelidade-production.up.railway.app/
2. Menu (⋮) no topo direito
3. "Instalar app"
4. Confirmar
5. App drawer > AppFidelidade
```

**Desktop (Chrome/Edge):**

```
1. Abrir https://appfidelidade-production.up.railway.app/
2. Menu (⋮) > "Instalar AppFidelidade"
3. Confirmar
4. Ícone no taskbar/dock
```

**Resultado esperado:**

- App instalável em todas plataformas
- Ícone correto
- Funciona como app standalone (sem barra de endereço)

## 🔧 Testes Técnicos

### Service Worker Offline

```bash
# 1. Chrome DevTools > Application > Service Workers
# 2. Marcar "Offline"
# 3. Página deve carregar do cache
# 4. Mas APIs não funcionarão (esperado)
```

### Network em Slow 3G

```bash
# 1. DevTools > Network
# 2. Throttling: "Slow 3G"
# 3. Recarregar página
# 4. Verificar:
#    - Página carrega em <3s
#    - Bundle compactado (82 kB gzip)
#    - Imagens lazy-loaded se aplicável
```

### Cache Validation

```bash
# 1. DevTools > Application > Cache Storage
# 2. Verificar se "appfidelidade-v1" existe
# 3. Clicar para ver recursos em cache
# 4. Incluir: index.html, manifest.json, assets
```

## 📊 Tabela de Verificação Completa

| Teste            | Objetivo               | Local | Produção | Status |
| ---------------- | ---------------------- | ----- | -------- | ------ |
| Branding         | Título "AppFidelidade" | ✅    | ⏳       | Pronto |
| PWA Install      | App instalável         | ✅    | ⏳       | Pronto |
| Dashboard        | Nome personalizado     | ✅    | ⏳       | Pronto |
| Ícones           | Novos ícones           | ✅    | ⏳       | Pronto |
| Voucher Modal    | Confirmar envio        | ✅    | ⏳       | Pronto |
| Mobile Viewport  | Sem scroll lateral     | ✅    | ⏳       | Pronto |
| Consulta Pública | Link funcionando       | ✅    | ⏳       | Pronto |
| Offline (SW)     | Cache funcionando      | ✅    | ⏳       | Pronto |

## 🚨 Troubleshooting

### Problema: PWA não instala

**Solução:**

- HTTPS deve estar ativo (prod tá ok)
- Service Worker deve estar registrado
- Manifest.json deve ser válido
- Chrome/Edge > Menu > Instalar

### Problema: Voucher modal não aparece

**Solução:**

- Verificar console (F12) para erros
- Ter cliente com pontos >= threshold
- Clicar em "Enviar Voucher" na aba Notificações

### Problema: Viewport ainda com scroll lateral em mobile

**Solução:**

- Limpar cache do navegador
- Hard refresh: Ctrl+Shift+R
- Testar em dispositivo real vs DevTools

### Problema: Service Worker não atualiza

**Solução:**

- DevTools > Application > Clear site data
- Fechar aba completamente
- Reabrir app

## 📝 Relatório de Teste

Depois de testar, preencher:

```
Data: __/__/____
Testador: _________
Navegador: Chrome/Safari/Firefox v___
Dispositivo: Desktop/iPhone/Android

Testes Executados:
- [ ] Branding
- [ ] PWA
- [ ] Dashboard
- [ ] Voucher
- [ ] Mobile
- [ ] Público
- [ ] Offline

Resultado Geral: ✅ PASSOU / ❌ FALHOU / ⚠️ COM RESSALVAS

Problemas Encontrados:
1. ___________
2. ___________
3. ___________
```

---

**Última atualização:** 28/11/2025
**Versão testada:** Build #625197b
