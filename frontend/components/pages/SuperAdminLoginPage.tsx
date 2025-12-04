import React, { useState } from 'react';
import { ShieldCheckIcon, UserIcon, LockClosedIcon } from '../icons/Icons';

interface SuperAdminLoginPageProps {
    onLogin: (username: string, passwordHash: string) => void;
    onNavigateToChooser?: () => void;
}

const SuperAdminLoginPage: React.FC<SuperAdminLoginPageProps> = ({ onLogin, onNavigateToChooser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <ShieldCheckIcon className="h-16 w-16 text-secondary mx-auto"/>
                    <h1 className="text-3xl font-bold text-on-surface mt-4">Acesso Super Admin</h1>
                    <p className="text-on-surface-secondary">Painel de controle da plataforma.</p>
                </div>

                <div className="bg-surface p-8 rounded-xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-on-surface-secondary mb-1">Usuário Admin</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="h-5 w-5 text-on-surface-secondary" />
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    className="w-full bg-background text-on-surface p-3 pl-10 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none transition"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-on-surface-secondary mb-1">Senha</label>
                             <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockClosedIcon className="h-5 w-5 text-on-surface-secondary" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full bg-background text-on-surface p-3 pl-10 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none transition"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all duration-300"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
                 {onNavigateToChooser && (
                    <div className="text-center mt-6">
                        <button onClick={onNavigateToChooser} className="text-sm text-on-surface-secondary hover:text-on-surface">
                            Voltar à seleção de perfil
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default SuperAdminLoginPage;