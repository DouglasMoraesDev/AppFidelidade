// frontend/src/components/ClienteDetalhe.tsx
import React, { useState } from 'react';
import { confirmarVoucher } from '../utils/api';

interface Props {
  cartao: any; // objeto vindo da API
  token?: string; // opcional; se não houver, a ação confirm será bloqueada
  usuarioId?: number;
}

export default function ClienteDetalhe({ cartao, token, usuarioId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('');

  const enviarVoucher = () => {
    const numero = (cartao?.cliente?.telefone || '').replace(/\D/g, '');
    const mensagem = (cartao?.estabelecimento?.mensagem_voucher) ?
      cartao.estabelecimento.mensagem_voucher.replace('{{nome_cliente}}', cartao.cliente.nome) :
      `Parabéns ${cartao.cliente.nome}! Você ganhou um voucher.`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    // abrir modal para confirmação quando retornar
    setTimeout(() => setModalOpen(true), 400);
  };

  const confirmar = async () => {
    if (!token) {
      setStatus('Ação exige login (token). Faça login e tente novamente.');
      return;
    }
    setStatus('Confirmando...');
    try {
      const res = await confirmarVoucher({
        cartaoId: cartao.id,
        usuarioId: usuarioId || null,
        mensagem: 'Voucher enviado',
        numeroCliente: cartao.cliente.telefone
      }, token);
      if (res.error) {
        setStatus('Erro: ' + res.error);
      } else {
        setStatus('Voucher confirmado. Pontos zerados.');
      }
    } catch (err) {
      setStatus('Erro ao confirmar voucher');
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div>
      <h3>{cartao?.cliente?.nome}</h3>
      <div>Pontos: {cartao?.pontos}</div>
      <button disabled={cartao?.pontos < 10} onClick={enviarVoucher}>Enviar voucher</button>

      {modalOpen && (
        <div className="modal">
          <div className="modal-body">
            <p>Você enviou o voucher no WhatsApp?</p>
            <button onClick={confirmar}>Sim, confirmar</button>
            <button onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {status && <div>{status}</div>}
    </div>
  );
}
