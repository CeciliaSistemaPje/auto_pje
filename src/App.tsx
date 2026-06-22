import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Painel } from './pages/PannelPage';
import { Entrada } from './pages/EntriesPage';
import { Baixa } from './pages/CasualtiesPage';
import { Relatorio } from './pages/ReportPage';
import { Login } from './pages/LoginPage';
import { isAuthenticated } from './services/auth';
import { getOperadorId, setOperadorId } from './services/usuarios';

function App() {
  // Bloqueio de rotas: só libera as telas internas se houver token salvo.
  const [autenticado, setAutenticado] = useState(isAuthenticated);

  // Operador ativo (usuario_id) — usado para filtrar e vincular processos.
  const [operadorId, setOperadorIdState] = useState(getOperadorId);
  const trocarOperador = (id: number) => {
    setOperadorIdState(id);
    setOperadorId(id); // persiste no localStorage
  };

  // Estado para controlar qual a aba que o utilizador está a ver
  const [activeTab, setActiveTab] = useState('Painel');

  // Sem token salvo -> apenas a tela de login é exibida.
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-surface text-on-background flex flex-col relative font-sans antialiased">
        <BackgroundEffects />
        <Login onLogin={() => setAutenticado(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-background flex flex-col relative font-sans antialiased">
      {/* 1. Efeitos Visuais de Fundo (Brilhos) */}
      <BackgroundEffects />

      {/* 2. Barra de Navegação Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        operadorId={operadorId}
        onTrocarOperador={trocarOperador}
      />

      {/* 3. Conteúdo Dinâmico das Telas */}
      {activeTab === 'Painel' && <Painel operadorId={operadorId} />}
      {activeTab === 'Entrada' && <Entrada operadorId={operadorId} />}
      {activeTab === 'Saída / Baixa' && <Baixa operadorId={operadorId} />}
      {activeTab === 'Relatório' && <Relatorio operadorId={operadorId} />}
    </div>
  );
}

export default App;