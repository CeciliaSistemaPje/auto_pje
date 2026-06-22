import React, { useMemo, useState } from 'react';
import { TerminalCaptura } from '../components/TerminalCaptura';
import { GuiaRapido } from '../components/GuiaRapido';
import { useProcessos } from '../hooks/useProcessos';
import { darBaixaProcessos } from '../services/api';
import { formatarDataCurta } from '../services/processoUtils';

interface BaixaProps {
  operadorId: number;
}

export const Baixa: React.FC<BaixaProps> = ({ operadorId }) => {
  const [textoBaixa, setTextoBaixa] = useState('');
  const [statusBotao, setStatusBotao] = useState<'idle' | 'loading' | 'success'>('idle');
  const { processos, refetch } = useProcessos(operadorId);

  // Últimas baixas realizadas, ordenadas pela data de baixa (mais recentes primeiro).
  const ultimasBaixas = useMemo(
    () =>
      processos
        .filter((p) => p.status && p.data_baixa)
        .sort((a, b) => (b.data_baixa ?? '').localeCompare(a.data_baixa ?? ''))
        .slice(0, 4),
    [processos],
  );

  // Lógica do botão de Baixa
  const handleBaixar = async () => {
    if (!textoBaixa.trim() || statusBotao !== 'idle') return;

    setStatusBotao('loading');

    try {
      await darBaixaProcessos(textoBaixa, operadorId);
      await refetch(); // Atualiza a lista com as baixas recém-realizadas.
      setStatusBotao('success');

      setTimeout(() => {
        setStatusBotao('idle');
        setTextoBaixa(''); // Limpa o campo após o sucesso
      }, 2000);
    } catch {
      setStatusBotao('idle');
    }
  };

  return (
    <>
      <section className="my-8 p-gutter flex-1 flex flex-col max-w-container-max mx-auto w-full animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Baixa de Processos</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Cole os andamentos do PJe ou as linhas da planilha para atualizar o status para <span className="text-primary font-bold">Deferido/Concluído</span>. O sistema processará as strings e identificará os números dos processos automaticamente.
          </p>
        </div>

        {/* Interaction Card (Bento-style layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Input Area (Reutilizando o Componente) */}
          <div className="lg:col-span-8">
            <TerminalCaptura 
              value={textoBaixa}
              onChange={setTextoBaixa}
              onSubmit={handleBaixar}
              statusBotao={statusBotao}
              variant="baixa"
            />
          </div>

          {/* Stats/Tips Sidebar (Específica da Baixa) */}
          <div className="lg:col-span-4 flex flex-col gap-6">            
            <div className="bg-surface-container border-l-4 border-primary rounded-xl p-stack-md">
              <h4 className="font-label-sm text-label-sm text-on-surface mb-3 uppercase tracking-tighter">Últimas Entradas</h4>
              <ul className="space-y-4">
                {ultimasBaixas.length === 0 && (
                  <li className="text-[10px] text-on-surface-variant">Nenhuma baixa registrada.</li>
                )}
                {ultimasBaixas.map((p) => (
                  <li key={`${p.numero_processo}|${p.assistido}|${p.data_expedicao}`} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface truncate">Proc. {p.numero_processo}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        Baixado{p.data_baixa ? ` · ${formatarDataCurta(p.data_baixa)}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <GuiaRapido />

      </section>
    </>
  );
};