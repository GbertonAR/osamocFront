import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import TestBatchGenerator from './components/TestBatchGenerator';
import AuditExplorer from './components/AuditExplorer';
import SystemMonitor from './components/SystemMonitor';
import ProviderLogin from './components/ProviderLogin';
import ProviderWizard from './components/ProviderWizard'; // Importar el componente
import AdminPanel from './components/AdminPanel';

function App() {
  // Estado de Sesión Global
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('osemoc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Sidebar móvil

  const handleSetUser = (u) => {
    setUser(u);
    if (u) {
      localStorage.setItem('osemoc_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('osemoc_user');
    }
  };

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
    return <ProviderLogin onLoginSuccess={handleSetUser} />;
  }

  // 2. Si es Prestador, mostramos el Portal de Autogestión
  if (user.role?.toUpperCase() === 'PROVIDER') {
    return <ProviderWizard user={user} onLogout={() => handleSetUser(null)} />;
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
    handleSetUser(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex h-screen w-full bg-osamoc-gray overflow-hidden">
      {/* Sidebar - Solo visible para ADMIN por ahora (o adaptado) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-osamoc-blue text-white flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative md:inset-0'}
      `}>
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/95 p-4 rounded-2xl shadow-lg flex justify-center items-center flex-1">
              <img
                src="/logo-osamoc.png"
                alt="OSAMOC Logo"
                className="w-full h-auto object-contain max-h-16"
              />
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden ml-4 text-white text-2xl">✕</button>
          </div>
          <p className="text-xs text-blue-100 mt-1 uppercase tracking-widest opacity-80 font-bold text-center">Auditoría Aktiva</p>
        </div>

        <div className="h-px bg-white/10 mx-6 mb-4"></div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {['dashboard', 'upload', 'history', 'monitor', 'generator', 'admin', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsMenuOpen(false); // Cerrar al seleccionar en móvil
              }}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white capitalize ${activeTab === tab ? 'bg-white/10 font-bold border-l-4 border-cyan-400' : 'hover:bg-white/5 opacity-70'}`}
            >
              {tab === 'generator' ? 'Generar Lote' : tab === 'monitor' ? 'Monitor IA' : tab === 'admin' ? 'Gestión' : tab}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold shadow-lg text-white">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-cyan-400 font-bold animate-pulse">● PROYECTO AKTIVO</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20"
          >
            <span>🚪</span>
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 text-osamoc-blue hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">☰</span>
            </button>
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
          {activeTab === 'dashboard' && <Dashboard stats={sessionStats} user={user} />}

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

          {activeTab === 'admin' && (
            <AdminPanel />
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