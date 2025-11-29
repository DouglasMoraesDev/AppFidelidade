import React from 'react';
import { TrashIcon, XIcon } from './icons/Icons';

interface DeleteConfirmationModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ itemName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in fade-in">
        <div className="flex justify-center">
          <div className="bg-red-500/20 p-4 rounded-full">
            <TrashIcon className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">Confirmar Exclusão</h2>
          <p className="text-on-surface-secondary">
            Tem certeza que deseja excluir <strong className="text-on-surface">{itemName}</strong>?
          </p>
        </div>

        <div className="bg-background/50 p-4 rounded-lg border border-slate-700 text-sm text-on-surface-secondary">
          <p className="mb-2">⚠️ Atenção:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Esta ação não pode ser desfeita</li>
            <li>Todos os dados relacionados serão perdidos</li>
            <li>O cliente será removido permanentemente</li>
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
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition"
          >
            <TrashIcon className="h-5 w-5" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

