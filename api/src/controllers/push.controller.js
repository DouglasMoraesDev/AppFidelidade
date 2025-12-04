const webpush = require('web-push');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configurar VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:appfidelidade@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Retorna a chave pública VAPID para o frontend
 */
const getPublicKey = async (req, res) => {
  try {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
  } catch (error) {
    console.error('Erro ao obter chave pública:', error);
    res.status(500).json({ error: 'Erro ao obter chave pública' });
  }
};

/**
 * Registra uma nova push subscription
 */
const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const estabelecimentoId = req.user.estabelecimentoId;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription inválida' });
    }

    // Verifica se já existe
    const existente = await prisma.pushSubscription.findFirst({
      where: {
        estabelecimentoId,
        endpoint: subscription.endpoint
      }
    });

    if (existente) {
      return res.json({ message: 'Subscription já registrada', id: existente.id });
    }

    // Cria nova subscription
    const novaSub = await prisma.pushSubscription.create({
      data: {
        estabelecimentoId,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth
      }
    });

    res.status(201).json({ message: 'Subscription registrada com sucesso', id: novaSub.id });
  } catch (error) {
    console.error('Erro ao registrar subscription:', error);
    res.status(500).json({ error: 'Erro ao registrar subscription' });
  }
};

/**
 * Remove uma push subscription
 */
const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const estabelecimentoId = req.user.estabelecimentoId;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint não fornecido' });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        estabelecimentoId,
        endpoint
      }
    });

    res.json({ message: 'Subscription removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover subscription:', error);
    res.status(500).json({ error: 'Erro ao remover subscription' });
  }
};

/**
 * Envia notificação push para um estabelecimento específico
 */
const sendPushToEstabelecimento = async (estabelecimentoId, payload) => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { estabelecimentoId }
    });

    if (subscriptions.length === 0) {
      console.log(`Nenhuma subscription encontrada para estabelecimento ${estabelecimentoId}`);
      return { success: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth
              }
            },
            JSON.stringify(payload)
          );
          return { success: true };
        } catch (error) {
          // Se subscription expirou ou é inválida, remove do banco
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
            console.log(`Subscription expirada removida: ${sub.id}`);
          }
          return { success: false, error: error.message };
        }
      })
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - success;

    return { success, failed, total: results.length };
  } catch (error) {
    console.error('Erro ao enviar push:', error);
    return { success: 0, failed: 0, error: error.message };
  }
};

/**
 * Envia notificação push para todos os estabelecimentos
 */
const sendPushToAll = async (payload) => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      console.log('Nenhuma subscription encontrada');
      return { success: 0, failed: 0, total: 0 };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth
              }
            },
            JSON.stringify(payload)
          );
          return { success: true };
        } catch (error) {
          // Se subscription expirou ou é inválida, remove do banco
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
            console.log(`Subscription expirada removida: ${sub.id}`);
          }
          return { success: false, error: error.message };
        }
      })
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - success;

    return { success, failed, total: results.length };
  } catch (error) {
    console.error('Erro ao enviar push para todos:', error);
    return { success: 0, failed: 0, total: 0, error: error.message };
  }
};

module.exports = {
  getPublicKey,
  subscribe,
  unsubscribe,
  sendPushToEstabelecimento,
  sendPushToAll
};
