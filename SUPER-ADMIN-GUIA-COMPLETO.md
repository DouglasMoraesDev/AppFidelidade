# 🛡️ Super Admin - Painel de Administração

## 🎯 Visão Geral

O painel de Super Admin é uma área restrita e poderosa para você, como dono do AppFidelidade, gerenciar todos os estabelecimentos cadastrados na plataforma. Acesso via URL única e secreta.

---

## 🔐 Acesso ao Painel

### URL Única e Secreta:

```
https://seu-dominio.com/admin-douglas-2025
```

**⚠️ IMPORTANTE:**

- Esta URL NÃO aparece em nenhum menu público
- Apenas você deve conhecer esta URL
- Não compartilhe com ninguém
- Salve em um gerenciador de senhas seguro

### Credenciais de Login:

- **Usuário:** [Definido no backend]
- **Senha:** [Definida no backend]
- **Secret Key:** `Dooug#525210` (hardcoded no código)

---

## 📊 Funcionalidades Disponíveis

### 1️⃣ **Dashboard (Visão Geral)**

**O que você vê:**

- 📈 Total de estabelecimentos cadastrados
- 👥 Total de clientes em toda a plataforma
- 🎟️ Total de vouchers emitidos
- 💰 Estabelecimentos inadimplentes

**Informações Exibidas:**

- Lista completa de todos os estabelecimentos
- Status de pagamento de cada um
- Número de clientes por estabelecimento
- Último pagamento registrado

---

### 2️⃣ **Estabelecimentos (Gerenciamento Básico)**

#### ✏️ Editar Estabelecimento

Você pode modificar:

- Nome do estabelecimento
- E-mail de contato
- Mensagem personalizada do voucher
- Usuário de login
- Pontos necessários para voucher

#### 💳 Adicionar Pagamento Manual

- Registrar pagamento fora do sistema automático
- Selecionar data específica do pagamento
- Útil para pagamentos offline ou ajustes

#### 🗑️ Deletar Estabelecimento

- Remove o estabelecimento **permanentemente**
- **CASCADE DELETE:** Apaga automaticamente:
  - ✅ Todos os usuários
  - ✅ Todos os clientes
  - ✅ Todos os cartões de fidelidade
  - ✅ Todos os movimentos (pontos)
  - ✅ Todos os vouchers
  - ✅ Todos os pagamentos
  - ✅ Arquivo de logo

**⚠️ ATENÇÃO:** Esta ação é IRREVERSÍVEL!

---

### 3️⃣ **Ferramentas Avançadas (NOVO! 🎉)**

Esta é a seção mais poderosa do painel. Aqui você tem controle total sobre cada estabelecimento.

#### 🔑 **Resetar Senha**

**O que faz:**

- Redefine a senha de acesso do estabelecimento
- O cliente pode fazer login imediatamente com a nova senha

**Quando usar:**

- Cliente esqueceu a senha
- Solicitação de suporte
- Necessidade de acesso emergencial

**Como usar:**

1. Selecione o estabelecimento
2. Digite a nova senha (mínimo 4 caracteres)
3. Clique em "Resetar Senha"
4. Informe a nova senha ao cliente

---

#### 💰 **Estender Assinatura (Force Payment)**

**O que faz:**

- Adiciona meses de acesso sem necessidade de pagamento real
- Útil para promoções, compensações, bônus

**Quando usar:**

- Promoção de "3 meses grátis"
- Compensação por problemas técnicos
- Parceria especial com cliente VIP
- Período de testes estendido

**Como funciona:**

- Selecione o número de meses (1-12)
- Sistema adiciona pagamentos com datas futuras
- Assinatura fica ativa automaticamente

**Exemplo:**

```
Cliente X teve problemas no sistema →
Você estende 2 meses grátis como compensação
```

---

#### 🔄 **Ativar/Desativar Estabelecimento**

**O que faz:**

- Bloqueia ou desbloqueia o acesso ao sistema
- Estabelecimento desativado NÃO PODE fazer login

**Quando usar:**
**DESATIVAR:**

- Inadimplência prolongada
- Uso indevido da plataforma
- Solicitação temporária do cliente
- Manutenção técnica específica

**ATIVAR:**

- Pagamento regularizado
- Problema resolvido
- Cliente solicitou reativação

**⚠️ IMPORTANTE:**

- Desativar não apaga dados, apenas bloqueia acesso
- Clientes do estabelecimento continuam cadastrados
- Pode ser reativado a qualquer momento

---

#### 📧 **Enviar Notificação**

**O que faz:**

- Envia mensagem importante para o dashboard do estabelecimento
- Cliente vê assim que fizer login

**Quando usar:**

- Avisos de manutenção programada
- Novas funcionalidades disponíveis
- Lembretes de vencimento
- Comunicados importantes

**Exemplos de Mensagens:**

```
"Seu plano vence em 5 dias. Renove para continuar usando!"

"Nova funcionalidade: Agora você pode personalizar temas!"

"Manutenção programada dia 15/12 das 02h às 04h"

"Parabéns! Você atingiu 100 clientes cadastrados! 🎉"
```

---

### 4️⃣ **Aparência do App**

**Personalização Global:**

- Cores primária e secundária
- Cor de fundo e superfícies
- Fonte do sistema
- **Afeta todos os estabelecimentos**

**Variáveis Customizáveis:**

```css
- Primary Color (Cor principal)
- Primary Focus (Cor de destaque)
- Secondary Color (Cor secundária)
- Background (Fundo)
- Surface (Cartões e painéis)
- Font Family (Fonte tipográfica)
```

---

## 🎯 Fluxo de Trabalho Recomendado

### Novo Estabelecimento:

1. Cliente se cadastra pelo site
2. Sistema cria conta com 31 dias grátis
3. Você monitora no Dashboard
4. Após teste, cliente paga mensalidade
5. Você registra pagamento manual (se necessário)

### Suporte a Cliente:

1. Cliente entra em contato
2. Você acessa "Ferramentas Avançadas"
3. Seleciona o estabelecimento dele
4. Resolve o problema:
   - Resetar senha
   - Estender assinatura
   - Enviar notificação

### Inadimplência:

1. Cliente não paga mensalidade
2. Sistema marca como "Expirada" no dashboard
3. Você envia notificação de lembrete
4. Se não pagar após X dias:
   - Desativa temporariamente
5. Quando pagar:
   - Adiciona pagamento
   - Reativa o acesso

### Promoção Especial:

1. Decida dar benefício a clientes
2. Use "Estender Assinatura"
3. Adicione meses grátis
4. Envie notificação informando

---

## 📱 Interface Responsiva

**Desktop:**

- Sidebar lateral fixa
- Tabelas completas
- Todas as informações visíveis

**Mobile:**

- Menu hamburger
- Cards adaptativos
- Mesmas funcionalidades

---

## 🔒 Segurança

### Camadas de Proteção:

1. **URL Única:** `/admin-douglas-2025`
2. **Login com Senha:** Autenticação obrigatória
3. **Secret Key:** Validada em cada requisição
4. **Sem Botão de Voltar:** Acesso direto apenas via URL

### Boas Práticas:

- ✅ Use HTTPS sempre
- ✅ Mantenha senha complexa
- ✅ Não compartilhe credenciais
- ✅ Faça logout após uso
- ✅ Use navegação anônima em computadores compartilhados

---

## 🚀 Status de Implementação

### ✅ Funcionalidades Ativas:

- Dashboard com métricas
- Lista de estabelecimentos
- Editar estabelecimentos
- Deletar estabelecimentos (CASCADE)
- Adicionar pagamento manual
- Personalização de tema
- Ferramentas Avançadas (interface pronta)
- Estender Assinatura (funcional)

### 🔜 Pendentes (Backend):

- Resetar Senha (endpoint a implementar)
- Ativar/Desativar (endpoint a implementar)
- Enviar Notificação (endpoint a implementar)

---

## 🎨 Atalhos de Teclado (Futuro)

```
Alt + D = Dashboard
Alt + E = Estabelecimentos
Alt + F = Ferramentas Avançadas
Alt + T = Temas
Alt + L = Logout
```

---

## 📊 Relatórios e Exportações (Futuro)

**Planejado para próximas versões:**

- Exportar lista de estabelecimentos (CSV/Excel)
- Relatório de pagamentos
- Gráfico de crescimento de clientes
- Análise de inadimplência
- Vouchers mais usados

---

## 🆘 Suporte e Dúvidas

**Em caso de problemas:**

1. Verifique se está usando a URL correta
2. Confirme se o secret key está correto no código
3. Verifique logs do navegador (F12 → Console)
4. Verifique logs do servidor backend

**Logs Úteis:**

```javascript
console.log("Current View:", currentView);
console.log("Super Admin Secret:", superAdminSecret);
console.log("Establishments:", establishments);
```

---

## 🎉 Conclusão

Você agora tem controle total sobre sua plataforma AppFidelidade! Use o Super Admin com responsabilidade e mantenha sempre um backup dos dados importantes.

**URL de Acesso:** `/admin-douglas-2025`
**Build Atual:** 333.88 kB (91.11 kB gzip)

**Pronto para gerenciar seus clientes! 🚀**
