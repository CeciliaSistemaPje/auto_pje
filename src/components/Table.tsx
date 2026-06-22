import React, { useMemo, useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { useProcessos } from '../hooks/useProcessos';
import { mapearProcesso, formatarMesAno, type ProcessoView } from '../services/processoUtils';

interface TabelaProcessosProps {
  // Quando não recebe dados via prop, o componente busca por conta própria.
  processos?: ProcessoView[];
  loading?: boolean;
  error?: string | null;
}

export const TabelaProcessos: React.FC<TabelaProcessosProps> = ({
  processos: processosProp,
  loading: loadingProp,
  error: errorProp,
}) => {
  const [filtroAtivo, setFiltroAtivo] = useState('Pendentes');
  const filtros = ['Pendentes', 'Urgentes', 'Deferidos', 'Todos'];

  // Filtros acionados pelo "FILTRAR RESULTADOS": busca por assistido + dropdowns.
  const [busca, setBusca] = useState('');
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [filtroVara, setFiltroVara] = useState('');
  const [filtroTipoAto, setFiltroTipoAto] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Se nenhum dado foi passado pelo componente pai, este hook carrega do backend.
  const usarHookProprio = processosProp === undefined;
  const hook = useProcessos();
  const dadosBrutos = usarHookProprio ? hook.processos.map(mapearProcesso) : processosProp!;
  const loading = usarHookProprio ? hook.loading : loadingProp ?? false;
  const error = usarHookProprio ? hook.error : errorProp ?? null;

  // Normaliza texto para busca: minúsculas e sem acentos.
  const normalizar = (texto: string) =>
    texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Opções dos dropdowns derivadas dos dados reais.
  const varas = useMemo(
    () => [...new Set(dadosBrutos.map((p) => p.vara))].filter(Boolean).sort(),
    [dadosBrutos],
  );
  const tiposAto = useMemo(
    () => [...new Set(dadosBrutos.map((p) => p.tipoAto))].filter(Boolean).sort(),
    [dadosBrutos],
  );
  // Meses de expedição únicos: valor = "YYYY-MM" (para ordenar/filtrar), rótulo = "Junho de 2026".
  const meses = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const p of dadosBrutos) {
      if (p.dataExpedicaoISO) {
        const ym = p.dataExpedicaoISO.slice(0, 7);
        mapa.set(ym, formatarMesAno(ym));
      }
    }
    return [...mapa.entries()].sort((a, b) => b[0].localeCompare(a[0])); // mais recentes primeiro
  }, [dadosBrutos]);

  // Aplica, em ordem: filtro de status, busca por assistido e os dropdowns.
  const processosFiltrados = useMemo(() => {
    let lista: ProcessoView[];
    switch (filtroAtivo) {
      case 'Pendentes':
        lista = dadosBrutos.filter((p) => p.status === 'pendente' || p.status === 'urgente');
        break;
      case 'Urgentes':
        lista = dadosBrutos.filter((p) => p.status === 'urgente');
        break;
      case 'Deferidos':
        lista = dadosBrutos.filter((p) => p.status === 'deferido');
        break;
      default:
        lista = dadosBrutos;
    }

    if (filtroVara) lista = lista.filter((p) => p.vara === filtroVara);
    if (filtroTipoAto) lista = lista.filter((p) => p.tipoAto === filtroTipoAto);
    if (filtroData) lista = lista.filter((p) => p.dataExpedicaoISO.slice(0, 7) === filtroData);

    const termo = normalizar(busca.trim());
    if (!termo) return lista;

    // Busca textual apenas pelo nome do assistido.
    return lista.filter((p) => normalizar(p.parteAssistida).includes(termo));
  }, [dadosBrutos, filtroAtivo, busca, filtroVara, filtroTipoAto, filtroData]);

  const totalAtivos = useMemo(() => dadosBrutos.filter((p) => p.status !== 'deferido').length, [dadosBrutos]);

  // Função auxiliar para renderizar as partes destacando o assistido
  const renderPartes = (partes: string, parteAssistida: string) => {
    // 1. Separa os dois lados originais
    const [polo1, polo2] = partes.split(' vs. ');

    // Caso só exista uma parte (ex.: apenas o assistido vindo do banco), exibe-a destacada.
    if (!polo2) {
      return (
        <span className="text-outline-variant text-sm font-normal">
          <span className={polo1 === parteAssistida ? 'text-primary font-semibold' : ''}>
            {polo1}
          </span>
        </span>
      );
    }

    // 2. Verifica se a parte assistida veio depois do "vs." na string original
    const assistidoEhPolo2 = polo2 === parteAssistida;

    // 3. Define quem aparece primeiro (se o assistido era o polo2, ele vira a primeiraParte)
    const primeiraParte = assistidoEhPolo2 ? polo2 : polo1;
    const segundaParte = assistidoEhPolo2 ? polo1 : polo2;

    return (
      <span className="text-outline-variant text-sm font-normal">
        {/* A primeira parte sempre recebe a checagem de destaque */}
        <span className={primeiraParte === parteAssistida ? 'text-primary font-semibold' : ''}>
          {primeiraParte}
        </span>

        <span className="mx-2 text-outline-variant text-sm font-normal">vs.</span>

        {/* A segunda parte fica com a cor normal */}
        <span>
          {segundaParte}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden" style={{ borderColor: 'rgb(30, 41, 59)' }}>
      
      {/* Cabeçalho da Tabela e Filtros */}
      <div className="p-6 border-b border-outline-variant">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {filtros.map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroAtivo(filtro)}
                className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                  filtroAtivo === filtro
                    ? 'bg-primary text-on-primary-container shadow-[0_0_10px_rgba(77,142,255,0.3)]'
                    : 'bg-slate-900 border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {filtro}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMostrarBusca((v) => !v)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              mostrarBusca || busca || filtroVara || filtroTipoAto || filtroData
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span className="font-label-sm text-label-sm">FILTRAR RESULTADOS</span>
          </button>
        </div>

        {/* Busca por assistido + dropdowns de vara, tipo de ato e data */}
        {mostrarBusca && (
          <div className="mt-4 flex flex-col md:flex-row md:flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-surface-container-highest outline-none border border-outline-variant rounded-lg pl-10 pr-10 py-2 text-body-md font-body-md focus:ring-2 focus:ring-primary text-on-surface placeholder-on-surface-variant"
                placeholder="Buscar por assistido..."
                type="text"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Limpar busca"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <select
              value={filtroVara}
              onChange={(e) => setFiltroVara(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface rounded-lg font-body-md text-label-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:bg-surface-bright cursor-pointer outline-none p-2 min-w-[150px]"
            >
              <option value="">Todas as varas</option>
              {varas.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select
              value={filtroTipoAto}
              onChange={(e) => setFiltroTipoAto(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface rounded-lg font-body-md text-label-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:bg-surface-bright cursor-pointer outline-none p-2 min-w-[150px]"
            >
              <option value="">Todos os atos</option>
              {tiposAto.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="bg-surface-container-highest border-none text-on-surface rounded-lg font-body-md text-label-sm focus:ring-2 focus:ring-primary transition-all duration-300 hover:bg-surface-bright cursor-pointer outline-none p-2 min-w-[150px]"
            >
              <option value="">Todos os meses</option>
              {meses.map(([ym, rotulo]) => (
                <option key={ym} value={ym}>{rotulo}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Corpo da Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-high">
            <tr>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">PROCESSO / PARTE</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">VARA</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">TIPO DE ATO</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">EXPEDIÇÃO</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">PRAZO</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">DATA LIMITE</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase">STATUS</th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-outline uppercase text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-on-surface-variant font-body-md text-body-md">
                  <span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>
                  Carregando processos...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-tertiary-container font-body-md text-body-md">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && processosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-on-surface-variant font-body-md text-body-md">
                  Nenhum processo encontrado.
                </td>
              </tr>
            )}
            {!loading && !error && processosFiltrados.map((processo) => (
              <tr key={processo.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-on-surface font-semibold font-body-md text-body-md mb-1">
                      {processo.numero}
                    </span>
                    {renderPartes(processo.partes, processo.parteAssistida)}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-on-surface-variant font-body-md text-body-md">{processo.vara}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-on-surface-variant font-body-md text-body-md">{processo.tipoAto}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-on-surface-variant font-body-md text-body-md">{processo.dataExpedicao}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-on-surface-variant font-body-md text-body-md">{processo.prazo}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-bold font-body-md text-body-md ${processo.riscado ? 'text-outline line-through font-normal' : processo.status === 'urgente' ? 'text-tertiary-container' : 'text-on-surface-variant'}`}>
                      <span className="font-normal font-label-sm text-label-sm text-outline mr-1">Úteis:</span>
                      {processo.limiteUteis}
                    </span>
                    <span className={`font-label-sm text-label-sm ${processo.riscado ? 'text-outline line-through' : 'text-outline'}`}>
                      <span className="mr-1">Corridos:</span>
                      {processo.limiteCorridos}
                    </span>
                    {processo.dataLimiteSecundaria && (
                      <span className={`font-label-sm text-label-sm ${processo.riscado ? 'text-primary-fixed-dim' : 'text-outline'}`}>
                        {processo.dataLimiteSecundaria}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={processo.status} />
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé da Tabela (Paginação) */}
      <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-outline">EXIBINDO {processosFiltrados.length} DE {totalAtivos} PROCESSOS ATIVOS</span>
        <div className="flex gap-4">
          <button className="p-1 text-outline hover:text-primary disabled:opacity-30" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-1 text-outline hover:text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};