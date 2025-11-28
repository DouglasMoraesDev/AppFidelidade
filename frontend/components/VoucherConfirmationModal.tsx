import React from 'react';
import { CheckCircleIcon, XIcon } from './icons/Icons';

interface VoucherConfirmationModalProps {
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const VoucherConfirmationModal: React.FC<VoucherConfirmationModalProps> = ({ clientName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in fade-in">
        <div className="flex justify-center">
          <div className="bg-primary/20 p-4 rounded-full">
            <CheckCircleIcon className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">Confirmar Envio de Voucher</h2>
          <p className="text-on-surface-secondary">
            Você enviou o voucher para <strong className="text-on-surface">{clientName}</strong> via WhatsApp?
          </p>
        </div>

        <div className="bg-background/50 p-4 rounded-lg border border-slate-700 text-sm text-on-surface-secondary">
          <p className="mb-2">⚠️ Importante:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Confirme apenas se o voucher foi enviado com sucesso</li>
            <li>Se confirmar, os pontos do cliente serão zerados</li>
            <li>Se cancelar, os pontos serão mantidos para novo envio</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-md transition"
          >
            <XIcon className="h-5 w-5" />
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherConfirmationModal;
