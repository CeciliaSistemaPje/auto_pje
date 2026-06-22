// Operadores do sistema (mapeamento nome -> usuario_id do banco).
// Não há endpoint /usuarios no backend, então o mapeamento fica aqui.
// ⚠️ Ajuste os ids caso sejam diferentes na tabela public.usuarios.

export interface Usuario {
  id: number;
  nome: string;
}

export const USUARIOS: Usuario[] = [
  { id: 1, nome: 'Dr.Evenin' },
  { id: 2, nome: 'Cecília' },
];

const KEY = 'operador_id';

// Lê o operador ativo do localStorage; cai no primeiro usuário se inválido.
export function getOperadorId(): number {
  const salvo = Number(localStorage.getItem(KEY));
  return USUARIOS.some((u) => u.id === salvo) ? salvo : USUARIOS[0].id;
}

export function setOperadorId(id: number): void {
  localStorage.setItem(KEY, String(id));
}

export function nomeDoOperador(id: number): string {
  return USUARIOS.find((u) => u.id === id)?.nome ?? USUARIOS[0].nome;
}
