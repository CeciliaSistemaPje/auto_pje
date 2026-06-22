// Camada de comunicação com o backend (NestJS).
// As requisições usam o prefixo /api, que o Vite redireciona para
// http://localhost:3000 (ver server.proxy em vite.config.ts), evitando CORS.

// Formato exato das colunas retornadas pela tabela 'processos' do Supabase.
export interface ProcessoDB {
  numero_processo: string;
  assistido: string;
  data_expedicao: string | null;
  prazo: number | null;
  limite_dias_uteis: string | null;
  limite_dias_corridos: string | null;
  vara: string | null;
  status: boolean; // false = pendente | true = baixado/concluído
  tipo_ato: string | null;
  data_baixa: string | null;
}

// Resposta padrão dos endpoints de escrita (create / baixa).
export interface RespostaProcessamento {
  sucesso: boolean;
  mensagem: string;
  dados?: unknown;
  erros?: string[];
}

import { getToken, clearToken } from './auth';
import { nomeDoOperador } from './usuarios';

// Lê a base das requisições da variável de ambiente (ver .env / vite.config.ts).
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Wrapper de fetch que injeta o token JWT no cabeçalho Authorization de toda
// requisição e trata expiração de sessão (401).
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token inválido/expirado: limpa a sessão e volta para o login.
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return res;
}

// O backend identifica o operador pelo NOME ('Dr.Evenin' / 'Cecília') e converte
// internamente para o usuario_id. Por isso enviamos o nome derivado do id ativo.

// Busca os processos vinculados ao operador informado.
export async function buscarProcessos(operador: number): Promise<ProcessoDB[]> {
  const res = await apiFetch(`/processos?operador=${encodeURIComponent(nomeDoOperador(operador))}`);
  if (!res.ok) {
    throw new Error(`Falha ao buscar processos (${res.status})`);
  }
  return res.json();
}

// Envia o texto bruto copiado do PJe para extração e cadastro, vinculado ao operador.
export async function criarProcessos(textoBruto: string, operador: number): Promise<RespostaProcessamento> {
  const res = await apiFetch('/processos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textoBruto, operador: nomeDoOperador(operador) }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao processar entrada (${res.status})`);
  }
  return res.json();
}

// Envia o texto bruto para dar baixa (status -> concluído), vinculado ao operador.
export async function darBaixaProcessos(textoBruto: string, operador: number): Promise<RespostaProcessamento> {
  const res = await apiFetch('/processos/baixa', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textoBruto, operador: nomeDoOperador(operador) }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao dar baixa (${res.status})`);
  }
  return res.json();
}
