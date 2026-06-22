import React, { useState } from 'react';

// 1. Adicionamos a prop 'variant' na interface
interface TerminalCapturaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  statusBotao: 'idle' | 'loading' | 'success';
  variant?: 'entrada' | 'baixa'; 
}

export const TerminalCaptura: React.FC<TerminalCapturaProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  statusBotao,
  variant = 'entrada' // 'entrada' será o padrão se nada for passado
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // 2. Dicionário de configuração do botão baseado na variante
  const buttonConfig = {
    entrada: {
      text: 'PROCESSAR E ENVIAR',
      icon: 'send',
      baseColor: 'bg-primary text-on-primary hover:shadow-primary/10',
      gradientColor: 'from-primary via-blue-400 to-primary',
    },
    baixa: {
      text: 'DAR BAIXA NOS PROCESSOS',
      icon: 'task_alt',
      // Usamos as cores verdes que você tinha definido na tela de baixa
      baseColor: 'bg-[#059669] text-white hover:shadow-[#059669]/20', 
      gradientColor: 'from-[#059669] via-[#10b981] to-[#059669]',
    }
  };

  const currentConfig = buttonConfig[variant];

  return (
    <div 
      className={`bg-surface-container rounded-xl border p-stack-md transition-all duration-300 ${
        isFocused 
          ? 'border-primary/50 shadow-[0_0_30px_rgba(173,198,255,0.05)]' 
          : 'border-outline-variant'
      }`}
    >
      <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">terminal</span>
          <span className="font-label-sm text-label-sm text-on-surface">Terminal de Captura de Dados</span>
        </div>
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-error/40"></span>
          <span className="w-3 h-3 rounded-full bg-secondary/40"></span>
          <span className="w-3 h-3 rounded-full bg-primary/40"></span>
        </div>
      </div>
      
      <label className="sr-only" htmlFor="pje_input">Conteúdo do PJe</label>
      <textarea 
        id="pje_input" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl p-6 font-body-md text-body-md focus:border-primary focus:ring-0 outline-none transition-all resize-none placeholder:text-outline/50" 
        placeholder="0001234-56.2023.8.19.0001...&#10;Andamento: Sentença Proferida&#10;Data: 24/05/2024&#10;..." 
        rows={15}
      />
      
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-on-surface-variant opacity-60">
        </div>
        
        <button 
          onClick={onSubmit}
          disabled={statusBotao !== 'idle'}
          className={`group relative px-8 py-4 font-bold rounded-xl overflow-hidden shadow-lg transition-all flex items-center justify-center gap-3 w-full md:w-auto ${
            statusBotao === 'success' 
              ? 'bg-green-600/20 text-green-400 border border-green-400/50' 
              // 3. Aplicamos a cor base dinâmica aqui
              : `${currentConfig.baseColor} active:scale-[0.98]`
          }`}
        >
          {statusBotao === 'idle' && (
            <>
              {/* 4. Aplicamos o texto e o ícone dinâmicos */}
              <span className="relative z-10 font-label-sm text-label-sm">{currentConfig.text}</span>
              <span className="material-symbols-outlined relative z-10 text-[20px] group-hover:translate-x-1 transition-transform">
                {currentConfig.icon}
              </span>
              
              {/* 5. Aplicamos o gradiente dinâmico */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentConfig.gradientColor} bg-[length:200%_auto] opacity-0 group-hover:opacity-40 group-hover:animate-bg-gradient transition-opacity duration-500`}></div>
            </>
          )}
          {statusBotao === 'loading' && (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              <span className="font-label-sm text-label-sm">PROCESSANDO...</span>
            </>
          )}
          {statusBotao === 'success' && (
            <>
              <span className="material-symbols-outlined">check_circle</span>
              <span className="font-label-sm text-label-sm">SUCESSO!</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};