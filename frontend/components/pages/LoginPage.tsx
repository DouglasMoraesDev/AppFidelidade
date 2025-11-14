import React, { useState } from 'react';
import { GiftIcon, UserIcon, LockClosedIcon } from '../icons/Icons';

interface LoginPageProps {
    onLogin: (username: string, passwordHash: string) => void;
    onNavigateToRegister: () => void;
    onNavigateToChooser: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister, onNavigateToChooser }) => {
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
                    <GiftIcon className="h-16 w-16 text-primary mx-auto"/>
                    <h1 className="text-3xl font-bold text-on-surface mt-4">Bem-vindo de volta!</h1>
                    <p className="text-on-surface-secondary">Login do Estabelecimento.</p>
                </div>

                <div className="bg-surface p-8 rounded-xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-on-surface-secondary mb-1">Usuário</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="h-5 w-5 text-on-surface-secondary" />
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    className="w-full bg-background text-on-surface p-3 pl-10 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
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
                                    className="w-full bg-background text-on-surface p-3 pl-10 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
                <div className="text-center mt-6 space-y-2">
                    <div>
                        <p className="text-on-surface-secondary">Não tem uma conta?</p>
                        <button onClick={onNavigateToRegister} className="font-semibold text-primary hover:text-primary-focus">
                            Cadastre seu estabelecimento
                        </button>
                    </div>
                     <div className="pt-4">
                         <button onClick={onNavigateToChooser} className="text-sm text-on-surface-secondary hover:text-on-surface">
                            Voltar à seleção de perfil
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;