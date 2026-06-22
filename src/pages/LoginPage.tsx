import React, { useState } from 'react';
import { login } from '../services/auth';

interface LoginProps {
  // Chamado após autenticar com sucesso (o App reavalia o bloqueio de rotas).
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    if (!email.trim() || !password) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setStatus('loading');
    setErro(null);

    try {
      await login(email.trim(), password);
      onLogin();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setStatus('idle');
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-gutter py-stack-lg relative z-10">
      <div className="w-full max-w-md animate-in fade-in duration-700 slide-in-from-bottom-4">

        {/* Marca */}
        <div className="text-center mb-8">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Automação PJe
          </span>
          <p className="text-on-surface-variant font-body-md text-body-md mt-2">
            Acesse o painel de controle de prazos
          </p>
        </div>

        {/* Card de login */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container rounded-xl border border-outline-variant p-stack-lg shadow-lg"
        >
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Entrar</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Use suas credenciais para continuar.
          </p>

          {/* E-mail */}
          <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">
            E-mail
          </label>
          <div className="relative mt-1 mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              mail
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all placeholder:text-outline/50"
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha */}
          <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">
            Senha
          </label>
          <div className="relative mt-1 mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              lock
            </span>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all placeholder:text-outline/50"
              placeholder="••••••••"
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 text-tertiary-container font-label-sm text-label-sm mt-3 mb-1">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{erro}</span>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="group relative w-full mt-6 px-8 py-4 font-bold rounded-xl overflow-hidden shadow-lg transition-all flex items-center justify-center gap-3 bg-primary text-on-primary hover:shadow-primary/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {status === 'idle' && (
              <>
                <span className="relative z-10 font-label-sm text-label-sm">ENTRAR</span>
                <span className="material-symbols-outlined relative z-10 text-[20px] group-hover:translate-x-1 transition-transform">
                  login
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] opacity-0 group-hover:opacity-40 group-hover:animate-bg-gradient transition-opacity duration-500"></div>
              </>
            )}
            {status === 'loading' && (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                <span className="font-label-sm text-label-sm">ENTRANDO...</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
};
