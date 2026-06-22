import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useProcessos } from '../hooks/useProcessos';
import { pertenceAoMes } from '../services/processoUtils';

// Nomes dos meses na ordem do índice usado pelo Date (0-11).
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Extrai a chave "YYYY-MM" de uma data ISO (que pode vir com hora).
function chaveMes(iso: string | null): string | null {
  if (!iso) return null;
  return iso.split('T')[0].split(' ')[0].slice(0, 7);
}

// Dias da semana na ordem domingo -> sábado.
const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

const pad = (n: number) => String(n).padStart(2, '0');

// Converte uma data ISO em um Date local "puro" (sem fuso).
function parseDia(iso: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('T')[0].split(' ')[0].split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Chave "YYYY-MM-DD" a partir de um Date.
function chaveDia(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Retorna o domingo (início) da semana que contém a data informada.
function inicioSemana(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay()); // getDay(): 0 = domingo
  return d;
}

// Rótulo "14/06 a 20/06" para uma semana (domingo + 6 dias).
function rotuloSemana(domingo: Date): string {
  const sabado = new Date(domingo);
  sabado.setDate(domingo.getDate() + 6);
  return `${pad(domingo.getDate())}/${pad(domingo.getMonth() + 1)} a ${pad(sabado.getDate())}/${pad(sabado.getMonth() + 1)}`;
}

const hoje = new Date();

interface RelatorioProps {
  operadorId: number;
}

export const Relatorio: React.FC<RelatorioProps> = ({ operadorId }) => {
  const { processos } = useProcessos(operadorId);
  const [mes, setMes] = useState(MESES[hoje.getMonth()]);
  const [ano, setAno] = useState(String(hoje.getFullYear()));

  // Períodos (YYYY-MM) que de fato existem nos dados — considera expedição e baixa.
  const periodos = useMemo(() => {
    const set = new Set<string>();
    for (const p of processos) {
      const exp = chaveMes(p.data_expedicao);
      const bx = chaveMes(p.data_baixa);
      if (exp) set.add(exp);
      if (bx) set.add(bx);
    }
    return [...set].sort((a, b) => b.localeCompare(a)); // mais recentes primeiro
  }, [processos]);

  // Anos disponíveis para o seletor (sempre inclui o ano atualmente selecionado).
  const anos = useMemo(() => {
    const set = new Set(periodos.map((ym) => ym.slice(0, 4)));
    set.add(ano);
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [periodos, ano]);

  // Ao carregar os dados pela primeira vez, abre no período mais recente que existe.
  const inicializado = useRef(false);
  useEffect(() => {
    if (!inicializado.current && periodos.length > 0) {
      const [a, m] = periodos[0].split('-');
      setAno(a);
      setMes(MESES[Number(m) - 1]);
      inicializado.current = true;
    }
  }, [periodos]);

  // Métricas do mês/ano selecionados calculadas a partir dos dados reais.
  const { entradasMes, baixasMes, taxaResolucao } = useMemo(() => {
    const indiceMes = MESES.indexOf(mes);
    const anoNum = Number(ano);
    const entradas = processos.filter((p) => pertenceAoMes(p.data_expedicao, indiceMes, anoNum)).length;
    const baixas = processos.filter((p) => p.status && pertenceAoMes(p.data_baixa, indiceMes, anoNum)).length;
    return {
      entradasMes: entradas,
      baixasMes: baixas,
      taxaResolucao: entradas > 0 ? Math.round((baixas / entradas) * 100) : 0,
    };
  }, [processos, mes, ano]);

  // Semanas (domingo a sábado) que existem nos dados; a semana atual sempre entra.
  const semanas = useMemo(() => {
    const mapa = new Map<string, Date>();
    const registrar = (iso: string | null) => {
      const d = parseDia(iso);
      if (!d) return;
      const domingo = inicioSemana(d);
      mapa.set(chaveDia(domingo), domingo);
    };
    for (const p of processos) {
      registrar(p.data_expedicao);
      registrar(p.data_baixa);
    }
    const domingoAtual = inicioSemana(hoje);
    mapa.set(chaveDia(domingoAtual), domingoAtual);
    return [...mapa.entries()]
      .sort((a, b) => b[0].localeCompare(a[0])) // mais recentes primeiro
      .map(([key, date]) => ({ key, date, rotulo: rotuloSemana(date) }));
  }, [processos]);

  // Semana selecionada (padrão: a mais recente, geralmente a semana atual).
  const [semanaSel, setSemanaSel] = useState('');
  const semanaEfetiva = semanaSel || semanas[0]?.key || '';

  // Volume de entradas e baixas por dia da semana selecionada.
  const dadosSemana = useMemo(() => {
    const domingo = semanas.find((s) => s.key === semanaEfetiva)?.date ?? inicioSemana(hoje);
    return DIAS.map((dia, i) => {
      const d = new Date(domingo);
      d.setDate(domingo.getDate() + i);
      const chave = chaveDia(d);
      const entradas = processos.filter((p) => {
        const exp = parseDia(p.data_expedicao);
        return exp != null && chaveDia(exp) === chave;
      }).length;
      const baixas = processos.filter((p) => {
        if (!p.status) return false;
        const bx = parseDia(p.data_baixa);
        return bx != null && chaveDia(bx) === chave;
      }).length;
      return { dia, entradas, baixas };
    });
  }, [processos, semanas, semanaEfetiva]);

  // Maior valor do período para escalar a altura das barras (mínimo 1 evita divisão por zero).
  const maxSemana = Math.max(1, ...dadosSemana.flatMap((d) => [d.entradas, d.baixas]));
  const ALTURA_MAX = 240; // px — mesma referência visual do gráfico original

  return (
    <section className="my-8 p-gutter max-w-container-max mx-auto w-full space-y-stack-lg animate-in fade-in duration-700 slide-in-from-bottom-4">
      
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-on-surface-variant">Mês de Referência</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface rounded-lg font-body-md focus:ring-2 focus:ring-primary min-w-[140px] transition-all duration-300 hover:bg-surface-bright cursor-pointer outline-none p-2"
            >
              {MESES.map((nome) => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-on-surface-variant">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface rounded-lg font-body-md focus:ring-2 focus:ring-primary min-w-[100px] transition-all duration-300 hover:bg-surface-bright cursor-pointer outline-none p-2"
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
        
        {/* Entradas Card */}
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant metric-glow-blue flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
          <div>
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Entradas no Mês</p>
            <h3 className="font-metric-xl text-metric-xl text-primary">{entradasMes}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-400">
            <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
          </div>
        </div>

        {/* Baixas Card */}
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant metric-glow-orange flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
          <div>
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Baixas no Mês</p>
            <h3 className="font-metric-xl text-metric-xl text-secondary">{baixasMes}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
          </div>
        </div>

        {/* Taxa Resolução Card */}
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant metric-glow-red flex flex-col justify-between relative overflow-hidden hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300 group">
          <div className="z-10">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Taxa de Resolução</p>
            <h3 className="font-metric-xl text-metric-xl text-tertiary-container">{taxaResolucao}%</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-400 z-10">
            <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-tertiary-container/10 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700"></div>
        </div>
      </div>

      {/* Productivity Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md">
        
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-surface-container p-6 rounded-xl border border-outline-variant min-h-[400px] flex flex-col hover:border-primary/20 transition-colors duration-500">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-headline-md text-on-surface">Produtividade Semanal</h4>
              <p className="font-body-md text-on-surface-variant">Volume de petições e atos processuais</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Seletor de semana (domingo a sábado) */}
              <select
                value={semanaEfetiva}
                onChange={(e) => setSemanaSel(e.target.value)}
                className="bg-surface-container-highest border-none text-on-surface rounded-lg font-label-sm text-label-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:bg-surface-bright cursor-pointer outline-none px-2 py-1.5"
              >
                {semanas.map((s) => (
                  <option key={s.key} value={s.key}>{s.rotulo}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-label-sm text-on-surface-variant">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="font-label-sm text-on-surface-variant">Baixas</span>
              </div>
            </div>
          </div>
          
          {/* Gráfico de barras — entradas e baixas por dia da semana selecionada */}
          <div className="flex-grow flex items-end justify-between gap-2 px-4 pb-4">
            {dadosSemana.map((coluna, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
                title={`${coluna.entradas} entrada(s) / ${coluna.baixas} baixa(s)`}
              >
                <div className="w-full flex gap-1 items-end justify-center">
                  <div className="w-4 bg-primary/40 group-hover:bg-primary transition-all duration-300 rounded-t-sm" style={{ height: `${(coluna.entradas / maxSemana) * ALTURA_MAX}px` }}></div>
                  <div className="w-4 bg-secondary/40 group-hover:bg-secondary transition-all duration-300 rounded-t-sm" style={{ height: `${(coluna.baixas / maxSemana) * ALTURA_MAX}px` }}></div>
                </div>
                <span className="font-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{coluna.dia}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};