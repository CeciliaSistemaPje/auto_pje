import React, { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { TabelaProcessos } from '../components/Table';
import { useProcessos } from '../hooks/useProcessos';
import { mapearProcesso, pertenceAoMes, venceHojeOuAmanha } from '../services/processoUtils';

interface PainelProps {
  operadorId: number;
}

export const Painel: React.FC<PainelProps> = ({ operadorId }) => {
  const { processos, loading, error } = useProcessos(operadorId);

  // Lista já no formato consumido pela tabela (compartilhada para evitar buscar duas vezes).
  const processosView = useMemo(() => processos.map(mapearProcesso), [processos]);

  // Métricas calculadas a partir dos dados reais do backend.
  const metricas = useMemo(() => {
    const hoje = new Date();
    const ativos = processos.filter((p) => !p.status);
    return {
      totalAtivo: processos.length,
      pendentes: ativos.length,
      vencendo: ativos.filter((p) => venceHojeOuAmanha(p.limite_dias_uteis ?? p.limite_dias_corridos)).length,
      baixadosMes: processos.filter(
        (p) => p.status && pertenceAoMes(p.data_baixa, hoje.getMonth(), hoje.getFullYear()),
      ).length,
    };
  }, [processos]);

  return (
    <main className="flex-1 max-w-container-max mx-auto w-full px-gutter py-stack-lg">

      <PageHeader
        title="Controle de Prazos"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-stack-lg">
        <MetricCard title="Total Ativo" value={metricas.totalAtivo} icon="folder_shared" theme="blue" />
        <MetricCard title="Pendentes" value={metricas.pendentes} icon="pending_actions" theme="orange" />
        <MetricCard title="Vencendo Hoje / Amanhã" value={metricas.vencendo} icon="notification_important" theme="red" />
        <MetricCard title="Baixados (Mês)" value={metricas.baixadosMes} icon="task_alt" theme="green" />
      </div>

      <TabelaProcessos processos={processosView} loading={loading} error={error} />

    </main>
  );
};