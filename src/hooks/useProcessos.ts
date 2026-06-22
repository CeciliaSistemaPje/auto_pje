import { useCallback, useEffect, useState } from 'react';
import { buscarProcessos, type ProcessoDB } from '../services/api';

// Hook responsável por carregar os processos do operador (usuario_id) informado.
// Recarrega automaticamente quando o operador muda. Sem operador, não busca.
export function useProcessos(operador?: number) {
  const [processos, setProcessos] = useState<ProcessoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (operador == null) {
      setProcessos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dados = await buscarProcessos(operador);
      setProcessos(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido ao carregar processos.');
    } finally {
      setLoading(false);
    }
  }, [operador]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { processos, loading, error, refetch: carregar };
}
