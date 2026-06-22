// Gerenciamento de autenticação no front-end (token JWT vindo do backend NestJS).

const TOKEN_KEY = 'access_token';

// Lê a base das requisições da variável de ambiente (ver .env / vite.config.ts).
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface LoginResponse {
  access_token: string;
}

// --- Token no localStorage ---------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// --- Login -------------------------------------------------------------------

// Faz POST /auth/login com email e senha; em caso de sucesso salva o token.
export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('E-mail ou senha inválidos.');
    }
    throw new Error(`Falha ao fazer login (${res.status})`);
  }

  const data: LoginResponse = await res.json();
  if (!data?.access_token) {
    throw new Error('Resposta de login inválida: token ausente.');
  }

  setToken(data.access_token);
}

// Encerra a sessão: limpa o token e leva o usuário de volta ao login.
export function logout(): void {
  clearToken();
  // Recarrega para que o bloqueio de rotas reavalie e exiba a tela de login.
  window.location.reload();
}
