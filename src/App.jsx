import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import TestBatchGenerator from './components/TestBatchGenerator';
import AuditExplorer from './components/AuditExplorer';
import SystemMonitor from './components/SystemMonitor';
import ProviderLogin from './components/ProviderLogin';
import ProviderWizard from './components/ProviderWizard'; // Importar el componente

function App() {
  // Estado de Sesión Global
  const [user, setUser] = useState(null); // null = Logged Out
  const [activeTab, setActiveTab] = useState('dashboard');

  const [sessionStats, setSessionStats] = useState({
    totalProcessed: 0,
    totalGenerated: 0,
    totalProcessTime: 0,
    processedAmount: 0,
    totalTokens: 0
  });
  const [sessionHistory, setSessionHistory] = useState([]);

  // 1. Si no hay usuario, mostrar login
  if (!user) {
    return <ProviderLogin onLoginSuccess={setUser} />;
  }

  // 2. Si es Prestador, mostramos el Portal de Autogestión
  if (user.role === 'PROVIDER') {
    return <ProviderWizard user={user} onLogout={() => setUser(null)} />;
  }

  // 3. Si es Admin, mostramos dashboard completo

  const handleUploadSuccess = (result) => {
    // result ahora viene del nuevo ai_service.py con usage_metrics
    const processingTime = Math.random() * 1.5 + 0.5; // Simulado, Gemini 2.0 es más rápido

    if (result.status === 'success') {
      setSessionStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        totalProcessTime: prev.totalProcessTime + processingTime,
        processedAmount: prev.processedAmount + (result.total || 0),
        // Sumamos los tokens reales del SuperAdmin
        totalTokens: prev.totalTokens + (result.usage_metrics?.total_tokens || 0)
      }));
    } else {
      setSessionStats(prev => ({
        ...prev,
        totalProcessTime: prev.totalProcessTime + processingTime,
      }));
    }

    setSessionHistory(prev => [
      {
        ...result, // Contiene toda la data y usage_metrics
        status: result.status,
        timestamp: new Date().toLocaleTimeString(),
        processingTime: processingTime.toFixed(1),
        type: 'UPLOAD'
      },
      ...prev
    ]);
  };

  const handleBatchGenerated = (count) => {
    setSessionStats(prev => ({
      ...prev,
      totalGenerated: prev.totalGenerated + count
    }));
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex h-screen w-full bg-osamoc-gray overflow-hidden">
      {/* Sidebar - Solo visible para ADMIN por ahora (o adaptado) */}
      <div className="w-64 bg-osamoc-blue text-white flex flex-col shadow-xl">
        <div className="p-8 pb-4">
          <div className="bg-white/95 p-4 rounded-2xl shadow-lg mb-6 flex justify-center items-center">
            <img
              src="/logo-osamoc.png"
              alt="OSAMOC Logo"
              className="w-full h-auto object-contain max-h-16"
            />
          </div>
          <p className="text-xs text-blue-100 mt-1 uppercase tracking-widest opacity-80 font-bold text-center">Auditoría Aktiva</p>
        </div>

        <div className="h-px bg-white/10 mx-6 mb-4"></div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {['dashboard', 'upload', 'history', 'monitor', 'generator', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white capitalize ${activeTab === tab ? 'bg-white/10 font-bold border-l-4 border-cyan-400' : 'hover:bg-white/5 opacity-70'}`}
            >
              {tab === 'generator' ? 'Generar Lote' : tab === 'monitor' ? 'Monitor IA' : tab}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold shadow-lg">
              GB
            </div>
            <div>
              <p className="text-sm font-bold">Gustavo (Admin)</p>
              <p className="text-[10px] text-green-400 font-bold animate-pulse">● PROYECTO AKTIVO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="text-osamoc-blue font-bold capitalize tracking-tight">Módulo: {activeTab}</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="font-medium">{new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400">Status:</span>
              <span className="bg-blue-50 text-osamoc-blue text-[10px] px-2 py-1 rounded-full font-bold">Vertex AI Live</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard stats={sessionStats} />}

          {activeTab === 'upload' && (
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'generator' && (
            <TestBatchGenerator onBatchGenerated={handleBatchGenerated} />
          )}

          {activeTab === 'history' && (
            <AuditExplorer />
          )}

          {activeTab === 'monitor' && (
            <SystemMonitor />
          )}

          {activeTab === 'settings' && (
            <div className="p-10">
              <h2 className="text-2xl font-bold text-osamoc-blue mb-6">Configuración de Inteligencia Superior</h2>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Infraestructura Cloud</h3>
                  <div className="flex items-center space-x-4 p-5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                    <div className="bg-cyan-500/20 p-3 rounded-lg">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <p className="font-bold text-cyan-400 text-lg">Gemini 2.0 Flash (Vertex AI Edition)</p>
                      <p className="text-xs text-slate-400 font-mono">Status: Connected to osamoc-demo via SuperAdmin Identity</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-2">Modo de Extracción</p>
                    <p className="text-sm font-bold text-gray-700">Determinístico (Temp 0.0)</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-2">Facturación</p>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-tighter italic">Créditos Cloud ($300.00)</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-2">Región de Cómputo</p>
                    <p className="text-sm font-bold text-gray-700">us-central1 (Iowa, US)</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button className="text-xs font-bold text-osamoc-blue hover:underline">Ver Logs Técnicos en Google Cloud Console →</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;