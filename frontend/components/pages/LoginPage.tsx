// frontend/src/components/pages/LoginPage.tsx
import React, { useState } from 'react';
import { GiftIcon, UserIcon, LockClosedIcon } from '../icons/Icons';
import { InputField } from '../InputField';

interface LoginPageProps {
  onLogin: (username: string, passwordHash: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToChooser: () => void;
  loading?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister, onNavigateToChooser, loading: externalLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const busy = loading || externalLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setMsg(err?.message || 'Erro ao tentar efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <GiftIcon className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-on-surface mt-4">Bem-vindo de volta!</h1>
          <p className="text-on-surface-secondary">Login do Estabelecimento.</p>
        </div>

        <div className="bg-surface p-8 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              id="username"
              label="Usuário"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              icon={<UserIcon className="h-5 w-5 text-on-surface-secondary" />}
              required
            />
            <InputField
              id="password"
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<LockClosedIcon className="h-5 w-5 text-on-surface-secondary" />}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300"
            >
              {busy ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          {msg && <div className="mt-4 text-center text-sm text-red-400">{msg}</div>}
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
