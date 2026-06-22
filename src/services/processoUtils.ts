import type { ProcessoDB } from './api';

// Status visual usado pelos componentes da tabela/badges.
export type StatusVisual = 'urgente' | 'pendente' | 'deferido';

// Formato consumido pela TabelaProcessos.
export interface ProcessoView {
  id: string;
  numero: string;
  partes: string;
  parteAssistida: string;
  vara: string;
  tipoAto: string;
  dataExpedicao: string;
  dataExpedicaoISO: string;
  prazo: string;
  limiteUteis: string;
  limiteCorridos: string;
  dataLimiteSecundaria?: string;
  status: StatusVisual;
  riscado?: boolean;
}

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const MESES_LONGOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Recebe uma chave "YYYY-MM" e devolve o rótulo "Junho de 2026".
export function formatarMesAno(ym: string): string {
  const [ano, mes] = ym.split('-').map(Number);
  if (!ano || !mes || mes < 1 || mes > 12) return ym;
  return `${MESES_LONGOS[mes - 1]} de ${ano}`;
}

// Converte uma data ISO (YYYY-MM-DD ou timestamp) em um objeto Date local "puro" (sem fuso).
function parseData(iso: string | null): Date | null {
  if (!iso) return null;
  const apenasData = iso.split('T')[0].split(' ')[0];
  const partes = apenasData.split('-').map(Number);
  if (partes.length !== 3 || partes.some(isNaN)) return null;
  const [ano, mes, dia] = partes;
  return new Date(ano, mes - 1, dia);
}

function inicioDoDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Diferença em dias entre uma data e hoje (negativo = passado).
function diffDias(data: Date): number {
  const hoje = inicioDoDia(new Date());
  const alvo = inicioDoDia(data);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

// Formata uma data ISO no estilo curto usado na tabela: "16 jun", "Hoje, 16 jun", "Amanhã, 16 jun".
export function formatarDataLimite(iso: string | null): string {
  const data = parseData(iso);
  if (!data) return 'Sem data';
  const rotulo = `${String(data.getDate()).padStart(2, '0')} ${MESES_CURTOS[data.getMonth()]}`;
  const dias = diffDias(data);
  if (dias === 0) return `Hoje, ${rotulo}`;
  if (dias === 1) return `Amanhã, ${rotulo}`;
  return rotulo;
}

// Formata uma data ISO no estilo curto simples (sem "Hoje/Amanhã").
export function formatarDataCurta(iso: string | null): string {
  const data = parseData(iso);
  if (!data) return '';
  return `${String(data.getDate()).padStart(2, '0')} ${MESES_CURTOS[data.getMonth()]}`;
}

// Verifica se uma data ISO cai dentro de hoje ou amanhã (ou já venceu) — usado em "vencendo".
export function venceHojeOuAmanha(iso: string | null): boolean {
  const data = parseData(iso);
  if (!data) return false;
  const dias = diffDias(data);
  return dias <= 1;
}

// Verifica se uma data ISO pertence ao mês/ano informados.
export function pertenceAoMes(iso: string | null, mes: number, ano: number): boolean {
  const data = parseData(iso);
  if (!data) return false;
  return data.getMonth() === mes && data.getFullYear() === ano;
}

// Deriva o status visual a partir do registro do banco.
export function derivarStatus(p: ProcessoDB): StatusVisual {
  if (p.status) return 'deferido';
  const referencia = p.limite_dias_uteis ?? p.limite_dias_corridos;
  if (venceHojeOuAmanha(referencia)) return 'urgente';
  return 'pendente';
}

// Converte um registro do banco no formato consumido pela tabela.
export function mapearProcesso(p: ProcessoDB): ProcessoView {
  const status = derivarStatus(p);
  const assistido = p.assistido ?? 'Não informado';

  return {
    id: `${p.numero_processo}|${p.assistido}|${p.data_expedicao ?? ''}`,
    numero: p.numero_processo ?? 'Não informado',
    partes: assistido,
    parteAssistida: assistido,
    vara: p.vara ?? 'Não informada',
    tipoAto: p.tipo_ato ?? 'Não informado',
    dataExpedicao: p.data_expedicao ? formatarDataCurta(p.data_expedicao) : '—',
    dataExpedicaoISO: p.data_expedicao ? p.data_expedicao.split('T')[0].split(' ')[0] : '',
    prazo: p.prazo != null ? `${p.prazo} dias` : 'Sem prazo',
    limiteUteis: formatarDataLimite(p.limite_dias_uteis),
    limiteCorridos: p.limite_dias_corridos ? formatarDataCurta(p.limite_dias_corridos) : 'Sem data',
    dataLimiteSecundaria:
      p.status && p.data_baixa ? `Concluído em ${formatarDataCurta(p.data_baixa)}` : undefined,
    status,
    riscado: p.status,
  };
}
