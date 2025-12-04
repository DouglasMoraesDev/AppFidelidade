// Push notification utilities para o frontend

/**
 * Verifica se o navegador suporta notificações push
 */
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Converte base64 URL-safe para Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Solicita permissão para notificações
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.error('Este navegador não suporta notificações');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  console.log('Permissão de notificação:', permission);
  return permission;
};

/**
 * Registra push subscription no backend
 */
export const subscribeToPush = async (apiBaseUrl: string, token: string) => {
  try {
    if (!isPushSupported()) {
      throw new Error('Push notifications não suportadas neste navegador');
    }

    // Solicita permissão
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão de notificação negada');
    }

    // Obtém chave pública VAPID do backend
    const keyResponse = await fetch(`${apiBaseUrl}/push/public-key`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!keyResponse.ok) {
      throw new Error('Erro ao obter chave pública VAPID');
    }
    
    const { publicKey } = await keyResponse.json();

    // Registra o service worker
    const registration = await navigator.serviceWorker.ready;

    // Cria subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource
    });

    // Envia subscription para o backend
    const response = await fetch(`${apiBaseUrl}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription })
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar subscription no backend');
    }

    const result = await response.json();
    console.log('Push subscription registrada:', result);
    return result;
  } catch (error) {
    console.error('Erro ao configurar push notifications:', error);
    throw error;
  }
};

/**
 * Cancela subscription de push
 */
export const unsubscribeFromPush = async (apiBaseUrl: string, token: string) => {
  try {
    if (!isPushSupported()) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('Nenhuma subscription ativa encontrada');
      return;
    }

    // Remove do backend
    await fetch(`${apiBaseUrl}/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });

    // Remove localmente
    await subscription.unsubscribe();
    console.log('Push subscription removida');
  } catch (error) {
    console.error('Erro ao remover push subscription:', error);
    throw error;
  }
};

/**
 * Verifica se já existe uma subscription ativa
 */
export const checkPushSubscription = async (): Promise<boolean> => {
  try {
    if (!isPushSupported()) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return subscription !== null;
  } catch (error) {
    console.error('Erro ao verificar subscription:', error);
    return false;
  }
};

/**
 * Obtém estado atual da permissão de notificação
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};
