import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import TestBatchGenerator from './components/TestBatchGenerator';
// Removed App.css import to prevent layout conflicts

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessionStats, setSessionStats] = useState({
    totalProcessed: 0,
    totalGenerated: 0,
    totalProcessTime: 0, // in seconds
    processedAmount: 0
  });
  const [sessionHistory, setSessionHistory] = useState([]);

  const handleUploadSuccess = (result) => {
    // result contains { data: { importe_total, ... }, ... }
    const processingTime = Math.random() * 2 + 1; // Simulated for now since it's a demo

    if (result.status === 'success') {
      setSessionStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        totalProcessTime: prev.totalProcessTime + processingTime,
        processedAmount: prev.processedAmount + (result.data.total || 0)
      }));
    } else {
      setSessionStats(prev => ({
        ...prev,
        totalProcessTime: prev.totalProcessTime + processingTime,
      }));
    }

    setSessionHistory(prev => [
      {
        ...result.data,
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

  return (
    <div className="flex h-screen w-full bg-osamoc-gray overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-osamoc-blue text-white flex flex-col shadow-xl">
        <div className="p-8 pb-4">
          <div className="bg-white/95 p-4 rounded-2xl shadow-lg mb-6 flex justify-center items-center">
            <img
              src="/logo-osamoc.png"
              alt="OSAMOC Logo"
              className="w-full h-auto object-contain max-h-16"
            />
          </div>
          {/* <h1 className="text-xl font-bold tracking-tight">OSAMOC</h1> */}
          <p className="text-xs text-blue-100 mt-1 uppercase tracking-widest opacity-80">Auditoría Inteligente</p>
        </div>

        <div className="h-px bg-white/10 mx-6 mb-4"></div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white ${activeTab === 'dashboard' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white ${activeTab === 'upload' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Nueva Carga
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white ${activeTab === 'history' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Historial
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white ${activeTab === 'generator' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Generar Lote
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors text-white ${activeTab === 'settings' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-osamoc-green flex items-center justify-center text-xs font-bold">
              GB
            </div>
            <div>
              <p className="text-sm font-medium">Operador</p>
              <p className="text-xs text-blue-200">En línea</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>25 de Enero, 2026</span>
            <div className="w-px h-4 bg-gray-200"></div>
            <button className="hover:text-osamoc-blue">Ayuda</button>
            <button className="hover:text-osamoc-blue text-red-500 font-medium">Cerrar Sesión</button>
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
            <div className="p-10">
              <h2 className="text-2xl font-bold text-osamoc-blue mb-6">Historial de Sesión</h2>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Hora</th>
                      <th className="px-6 py-3">CUIT Emisor</th>
                      <th className="px-6 py-3">Factura</th>
                      <th className="px-6 py-3">Importe</th>
                      <th className="px-6 py-3">Latencia (AI)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {sessionHistory.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No hay actividad en esta sesión.</td></tr>
                    ) : sessionHistory.map((item, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 text-gray-400">{item.timestamp}</td>
                        <td className="px-6 py-4 font-mono">{item.cuit_emisor}</td>
                        <td className="px-6 py-4 font-bold text-osamoc-blue">{item.numero_factura}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">$ {item.total?.toLocaleString() || '0.00'}</td>
                        <td className="px-6 py-4"><span className="bg-blue-100 text-osamoc-blue px-2 py-1 rounded text-xs">{item.processingTime}s</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-10">
              <h2 className="text-2xl font-bold text-osamoc-blue mb-6">Configuración de Inteligencia</h2>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Motor de IA Actual</h3>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-osamoc-blue">Gemini 1.5 Flash (Google Brain)</p>
                      <p className="text-xs text-blue-600">Conectado vía Google AI SDK - Optimizado para OCR Dinámico</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold">Temperatura</p>
                    <p className="text-lg font-mono">0.0 (Extracción Determinística)</p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold">API Status</p>
                    <p className="text-lg text-green-600 font-bold">Conectado (Live)</p>
                  </div>
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
