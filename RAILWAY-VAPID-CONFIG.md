# Configuração de Variáveis de Ambiente no Railway

## ⚠️ IMPORTANTE: Adicionar estas variáveis no Railway

O deploy está crashando porque as chaves VAPID não estão configuradas no Railway.
Você precisa adicionar estas 3 variáveis de ambiente:

### Passo a Passo:

1. **Acesse o Railway Dashboard**:

   - Vá em: https://railway.app
   - Entre no seu projeto AppFidelidade

2. **Abra as Variáveis de Ambiente**:

   - Clique no serviço `api`
   - Vá na aba `Variables`

3. **Adicione estas 3 variáveis** (clique em `+ New Variable` para cada uma):

```
VAPID_PUBLIC_KEY=BDPNRvzoJkaYoYwlYfFe4tFW3QASg43eMy0AVjVILVt7r6PMLhxCT6cYrhNQuX12rukc-5tl7hYVjKj_RqWmEr8

VAPID_PRIVATE_KEY=6azKY09n_vHX5YeUZmCwtgq-stTRb7Mpqioc7TJyivM

VAPID_EMAIL=mailto:appfidelidade@example.com
```

4. **Salve e Redeploy**:
   - Clique em `Deploy` ou aguarde o redeploy automático
   - O app deve iniciar normalmente agora

## ✅ Verificação

Após adicionar as variáveis, você deve ver no log:

```
[Push] VAPID configurado com sucesso
```

## 📝 Nota

Com a correção que fiz agora, o app não vai mais crashar se as variáveis não estiverem definidas.
Mas as notificações push só vão funcionar depois que você adicionar essas variáveis no Railway.
