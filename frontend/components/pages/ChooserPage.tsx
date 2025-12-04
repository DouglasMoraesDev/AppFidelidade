import React, { useState } from 'react';
import { BuildingOfficeIcon, UserPlusIcon, LoginIcon, GiftIcon } from '../icons/Icons';

interface ChooserPageProps {
    onSelectRole: (role: 'establishment' | 'superAdmin') => void;
    onCreateAccount?: () => void;
    onLogin?: () => void;
}

const ChooserPage: React.FC<ChooserPageProps> = ({ onSelectRole, onCreateAccount, onLogin }) => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-on-surface">
            {/* Logo e Título */}
            <div className="text-center mb-8">
                <GiftIcon className="h-20 w-20 text-primary mx-auto mb-4"/>
                <h1 className="text-4xl font-bold text-on-surface">AppFidelidade</h1>
                <p className="text-on-surface-secondary mt-2 text-lg">Gestão inteligente de fidelidade</p>
            </div>

            {/* Introdução do App */}
            <div className="w-full max-w-2xl bg-surface rounded-lg p-6 mb-8 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center">Transforme seu negócio com cartões fidelidade digitais</h2>
                <div className="space-y-3 text-on-surface-secondary">
                    <p className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">✓</span>
                        <span><strong className="text-on-surface">Simples e Prático:</strong> Cadastre clientes e acumule pontos de forma rápida e intuitiva</span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">✓</span>
                        <span><strong className="text-on-surface">Fidelização Eficiente:</strong> Recompense seus clientes com vouchers personalizados</span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">✓</span>
                        <span><strong className="text-on-surface">Controle Total:</strong> Acompanhe todo o histórico de pontos e resgates em tempo real</span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">✓</span>
                        <span><strong className="text-on-surface">31 Dias Grátis:</strong> Teste todas as funcionalidades sem compromisso</span>
                    </p>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="w-full max-w-md text-center space-y-4">
                {!showLogin ? (
                    <>
                        <button
                            onClick={() => onCreateAccount ? onCreateAccount() : onSelectRole('establishment')}
                            className="w-full flex items-center justify-center gap-4 bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            <UserPlusIcon className="w-8 h-8"/>
                            <span>Criar Conta Grátis</span>
                        </button>
                        <div className="pt-4 border-t border-surface">
                            <p className="text-on-surface-secondary mb-3">Já é um parceiro?</p>
                            <button
                                onClick={() => onLogin ? onLogin() : setShowLogin(true)}
                                className="w-full flex items-center justify-center gap-4 bg-surface text-on-surface font-semibold py-3 px-6 rounded-lg hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all duration-300"
                            >
                                <LoginIcon className="w-6 h-6"/>
                                <span>Fazer Login</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onLogin ? onLogin() : onSelectRole('establishment')}
                            className="w-full flex items-center justify-center gap-4 bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            <BuildingOfficeIcon className="w-8 h-8"/>
                            <span>Acessar como Estabelecimento</span>
                        </button>
                        <button
                            onClick={() => setShowLogin(false)}
                            className="w-full text-on-surface-secondary hover:text-on-surface underline py-2 transition-colors"
                        >
                            ← Voltar para criar conta
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChooserPage;