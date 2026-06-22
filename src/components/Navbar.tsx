import React from 'react';
import { motion } from 'framer-motion';
import { logout } from '../services/auth';
import { USUARIOS, nomeDoOperador } from '../services/usuarios';

// Aqui definimos as abas para que o componente pai saiba qual está ativa
interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  operadorId: number;
  onTrocarOperador: (id: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, operadorId, onTrocarOperador }) => {
  const tabs = ['Painel', 'Entrada', 'Saída / Baixa', 'Relatório'];

  // O switch alterna para o outro operador da lista.
  const outro = USUARIOS.find((u) => u.id !== operadorId) ?? USUARIOS[0];
  const alternarUsuario = () => onTrocarOperador(outro.id);

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-gutter h-16 max-w-container-max mx-auto">
        
        {/* LOGO E LINKS */}
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Automação PJe
          </span>
          
          <nav className="hidden md:flex items-center gap-6 h-16">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative h-full flex items-center font-label-sm text-label-sm transition-colors ${
                  activeTab === tab
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab}
                
                {/* A linha agora é um motion.div que só renderiza na aba ativa */}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
                    initial={false}
                    transition={{
                      type: "spring",
                      ease: "circInOut",
                      bounce: 0.75,
                      damping: 25
                    }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Usuário */}
        <div className="flex items-center gap-4">
          <p className="text-on-surface-variant font-body-md text-body-md">
            Bem vindo(a), <span className="text-on-surface font-semibold">{nomeDoOperador(operadorId)}</span>
          </p>

          {/* Botão de seta dupla para alternar entre os dois usuários */}
          <button
            onClick={alternarUsuario}
            title={`Trocar para ${outro.nome}`}
            aria-label="Trocar usuário"
            className="group flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-500 group-hover:rotate-180">autorenew</span>
          </button>

          <button
            onClick={logout}
            title="Sair"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="hidden sm:inline font-label-sm text-label-sm">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};