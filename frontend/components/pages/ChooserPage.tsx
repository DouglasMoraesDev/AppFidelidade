import React from 'react';
import { BuildingOfficeIcon, ShieldCheckIcon, GiftIcon } from '../icons/Icons';

interface ChooserPageProps {
    onSelectRole: (role: 'establishment' | 'superAdmin') => void;
}

const ChooserPage: React.FC<ChooserPageProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-on-surface">
            <div className="text-center mb-10">
                <GiftIcon className="h-20 w-20 text-primary mx-auto"/>
                <h1 className="text-4xl font-bold text-on-surface mt-4">AppFidelidade</h1>
                <p className="text-on-surface-secondary mt-2">Seu gerenciador de cartões fidelidade.</p>
            </div>

            <div className="w-full max-w-md text-center">
                <h2 className="text-2xl font-semibold mb-6">Como você deseja acessar?</h2>
                <div className="space-y-4">
                    <button
                        onClick={() => onSelectRole('establishment')}
                        className="w-full flex items-center justify-center gap-4 bg-surface text-on-surface font-bold py-4 px-6 rounded-lg hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300 transform hover:scale-105"
                    >
                        <BuildingOfficeIcon className="w-8 h-8"/>
                        <span>Sou Dono de Estabelecimento</span>
                    </button>
                    <button
                        onClick={() => onSelectRole('superAdmin')}
                        className="w-full flex items-center justify-center gap-4 bg-surface text-on-surface font-bold py-4 px-6 rounded-lg hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all duration-300 transform hover:scale-105"
                    >
                        <ShieldCheckIcon className="w-8 h-8"/>
                        <span>Sou Super Admin</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChooserPage;