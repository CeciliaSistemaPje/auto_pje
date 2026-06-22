import React, { useMemo, useState } from 'react';
import { TerminalCaptura } from '../components/TerminalCaptura';
import { GuiaRapido } from '../components/GuiaRapido';
import { useProcessos } from '../hooks/useProcessos';
import { criarProcessos } from '../services/api';
import { formatarDataCurta } from '../services/processoUtils';

interface EntradaProps {
  operadorId: number;
}

export const Entrada: React.FC<EntradaProps> = ({ operadorId }) => {
  const [textoPje, setTextoPje] = useState('');
  const [statusBotao, setStatusBotao] = useState<'idle' | 'loading' | 'success'>('idle');
  const { processos, refetch } = useProcessos(operadorId);

  // Últimas entradas ordenadas pela data de expedição (mais recentes primeiro).
  const ultimasEntradas = useMemo(
    () =>
      [...processos]
        .sort((a, b) => (b.data_expedicao ?? '').localeCompare(a.data_expedicao ?? ''))
        .slice(0, 4),
    [processos],
  );

  const handleEnviar = async () => {
    if (!textoPje.trim() || statusBotao !== 'idle') return;

    setStatusBotao('loading');

    try {
      await criarProcessos(textoPje, operadorId);
      await refetch(); // Atualiza a lista de últimas entradas com os dados recém-cadastrados.
      setStatusBotao('success');

      setTimeout(() => {
        setStatusBotao('idle');
        setTextoPje('');
      }, 2000);
    } catch {
      setStatusBotao('idle');
    }
  };

  return (
    <main className="flex-1 p-gutter max-w-container-max mx-auto w-full">
      <section className="mt-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Cabeçalho */}
        <header className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            Nova Entrada de Processos (PJe)
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Copie os andamentos do PJe e cole no campo abaixo. O sistema organizará tudo automaticamente utilizando reconhecimento semântico temporal.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-stack-lg">
          
          {/* Sessão do Textarea (Esquerda) */}
          <div className="col-span-12 lg:col-span-8">
            <TerminalCaptura 
              value={textoPje}
              onChange={setTextoPje}
              onSubmit={handleEnviar}
              statusBotao={statusBotao}
              variant="entrada"
            />
          </div>

          {/* Barra Lateral de Status/Dicas (Direita) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-stack-md">
            
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-stack-md relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-label-sm text-label-sm text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  DICA DE PRODUTIVIDADE
                </h3>
                <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  Para capturas em massa, utilize o atalho <kbd className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-mono text-xs text-on-surface">Ctrl + V</kbd> após selecionar todos os andamentos na tela "Movimentações" do PJe.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]">psychology</span>
              </div>
            </div>

            <div className="bg-surface-container border-l-4 border-primary rounded-xl p-stack-md">
              <h4 className="font-label-sm text-label-sm text-on-surface mb-3 uppercase tracking-tighter">Últimas Entradas</h4>
              <ul className="space-y-4">
                {ultimasEntradas.length === 0 && (
                  <li className="text-[10px] text-on-surface-variant">Nenhuma entrada registrada.</li>
                )}
                {ultimasEntradas.map((p) => (
                  <li key={`${p.numero_processo}|${p.assistido}|${p.data_expedicao}`} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface truncate">Proc. {p.numero_processo}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {p.tipo_ato ?? 'Ato'}{p.data_expedicao ? ` · ${formatarDataCurta(p.data_expedicao)}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Guia Rápido Inferior */}
        <GuiaRapido />
        
      </section>
    </main>
  );
};