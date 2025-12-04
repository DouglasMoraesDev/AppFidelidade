import React, { useEffect, useState } from 'react';
import { fetchNotificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas } from '../utils/api';

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  criadaEm: string;
}

export function NotificationBanner() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const res = await fetchNotificacoes();
      if (res?.notificacoes) {
        // Mostrar apenas notificações não lidas
        const naoLidas = res.notificacoes.filter((n: Notificacao) => !n.lida);
        setNotificacoes(naoLidas);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLida = async (id: number) => {
    try {
      await marcarNotificacaoLida(id);
      setNotificacoes(prev => prev.filter(n => n.id !== id));
      setExpandedId(null);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarcarTodasLidas = async () => {
    try {
      await marcarTodasNotificacoesLidas();
      setNotificacoes([]);
      setExpandedId(null);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'aviso':
        return '⚠️';
      case 'promocao':
        return '🎉';
      case 'atualizacao':
        return '🔔';
      default:
        return 'ℹ️';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'aviso':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'promocao':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'atualizacao':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) return null;
  if (notificacoes.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {/* Cabeçalho com botão de marcar todas como lidas */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">
          📬 Notificações ({notificacoes.length})
        </h3>
        {notificacoes.length > 1 && (
          <button
            onClick={handleMarcarTodasLidas}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Lista de notificações */}
      {notificacoes.map((notif) => (
        <div
          key={notif.id}
          className={`border rounded-lg p-4 ${getTipoColor(notif.tipo)} transition-all`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{getTipoIcon(notif.tipo)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm">{notif.titulo}</h4>
                <button
                  onClick={() => handleMarcarLida(notif.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-black/5 flex-shrink-0"
                  title="Marcar como lida"
                >
                  ✓
                </button>
              </div>
              
              {/* Mensagem - expandível se for longa */}
              {notif.mensagem.length > 150 && expandedId !== notif.id ? (
                <>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {notif.mensagem.substring(0, 150)}...
                  </p>
                  <button
                    onClick={() => setExpandedId(notif.id)}
                    className="text-xs font-medium mt-1 hover:underline"
                  >
                    Ver mais
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {notif.mensagem}
                  </p>
                  {notif.mensagem.length > 150 && expandedId === notif.id && (
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-xs font-medium mt-1 hover:underline"
                    >
                      Ver menos
                    </button>
                  )}
                </>
              )}
              
              <p className="text-xs mt-2 opacity-70">
                {new Date(notif.criadaEm).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
