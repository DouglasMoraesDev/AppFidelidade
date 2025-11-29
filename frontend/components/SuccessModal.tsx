import React from 'react';
import { CheckCircleIcon } from './icons/Icons';

interface SuccessModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in fade-in">
        <div className="flex justify-center">
          <div className="bg-green-500/20 p-4 rounded-full">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
          <p className="text-on-surface-secondary">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-focus text-white font-semibold py-3 rounded-md transition"
        >
          <CheckCircleIcon className="h-5 w-5" />
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;

