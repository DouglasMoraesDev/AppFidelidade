
import React, { useState } from 'react';
import { CreditCardIcon, QrCodeIcon, ClipboardDocumentIcon, CheckCircleIcon } from '../icons/Icons';

interface PaymentPageProps {
    onPaymentSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSuccess }) => {
    const [pixCode] = useState('00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540510.005802BR5913NOME DO LOJISTA6009SAO PAULO62070503***6304E2D1');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-on-surface">
            <div className="w-full max-w-md text-center">
                <CreditCardIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-on-surface">Ops, sua assinatura expirou!</h1>
                <p className="text-on-surface-secondary mt-2 mb-8">Para continuar usando o LoyaltyApp, por favor, renove sua assinatura.</p>

                <div className="bg-surface p-8 rounded-xl shadow-2xl space-y-6">
                    <h2 className="text-xl font-semibold">Pague com Pix para liberar seu acesso</h2>
                    
                    <div className="space-y-4 text-left">
                        <p className="flex items-start gap-3">
                            <span className="text-primary font-bold text-lg mt-1">1.</span>
                            <span>Copie o código Pix abaixo clicando no botão.</span>
                        </p>
                         <p className="flex items-start gap-3">
                            <span className="text-primary font-bold text-lg mt-1">2.</span>
                            <span>Abra o app do seu banco, vá na seção Pix, escolha "Pix Copia e Cola" e cole o código.</span>
                        </p>
                         <p className="flex items-start gap-3">
                            <span className="text-primary font-bold text-lg mt-1">3.</span>
                            <span>Após a confirmação do pagamento, seu acesso será liberado automaticamente.</span>
                        </p>
                    </div>

                    <div className="bg-background p-4 rounded-lg">
                        <QrCodeIcon className="w-32 h-32 mx-auto text-on-surface-secondary" />
                        <p className="text-xs text-on-surface-secondary break-all mt-4">{pixCode}</p>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-md transition-all duration-300 ${
                            copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-primary text-white hover:bg-primary-focus'
                        }`}
                    >
                        {copied ? <CheckCircleIcon className="w-5 h-5"/> : <ClipboardDocumentIcon className="w-5 h-5"/>}
                        {copied ? 'Código Copiado!' : 'Copiar Código Pix'}
                    </button>
                    
                    <div className="border-t border-slate-600 my-4"></div>

                    <button
                        onClick={onPaymentSuccess}
                        className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all duration-300"
                    >
                        Já paguei, verificar acesso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
