import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';

const AuditExplorer = () => {
    const [audits, setAudits] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState(null);

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/audits`);
            setAudits(res.data.audits);
            setStats(res.data.stats);
        } catch (err) {
            console.error("Error fetching audits", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadExport = (sessionId, format) => {
        window.open(`${API_BASE_URL}/audits/${sessionId}/export/${format}`, '_blank');
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-full">
            {/* HUD Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">📄</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Procesados</p>
                    <p className="text-3xl font-bold text-osamoc-blue">{stats.total_count || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">💰</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto Auditado</p>
                    <p className="text-3xl font-bold text-green-600">${(stats.total_amount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">⚡</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Eficiencia (Tokens)</p>
                    <p className="text-3xl font-bold text-purple-600">{(stats.total_tokens || 0).toLocaleString()}</p>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Historial de Auditorías Médicas</h2>
                        <p className="text-xs text-gray-400 font-medium">Visualización de reconciliación en tiempo real</p>
                    </div>
                    <button onClick={fetchAudits} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all">
                        🔄
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <th className="px-8 py-4">Session ID</th>
                                <th className="px-8 py-4">Prestador</th>
                                <th className="px-8 py-4">Fecha</th>
                                <th className="px-8 py-4 text-right">Monto</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4 text-center">Reconciliación</th>
                                <th className="px-8 py-4 text-center">Archivos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-gray-400 animate-pulse font-medium">Cargando registros de auditoría...</td>
                                </tr>
                            ) : audits.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-gray-300 font-medium italic">No hay auditorías registradas aún.</td>
                                </tr>
                            ) : audits.map((a) => (
                                <tr key={a.session_id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedAudit(a)}>
                                    <td className="px-8 py-5 font-mono text-[10px] text-gray-400">{a.session_id.substring(0, 8)}...</td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-gray-700 text-sm">{a.emisor}</p>
                                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{a.filename}</p>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">{a.fecha || 'N/A'}</td>
                                    <td className="px-8 py-5 text-right font-bold text-gray-700 text-sm">
                                        ${parseFloat(a.total || 0).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${a.status === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${a.reconciliation_status === 'MATCH' ? 'bg-green-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-200 anim-pulse'}`}>
                                                {a.reconciliation_status || 'PENDING'}
                                            </span>
                                            {a.reconciliation_diff > 0 && (
                                                <span className="text-[10px] text-red-400 font-bold mt-1">Diff: ${a.reconciliation_diff.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); downloadExport(a.session_id, 'json'); }} className="p-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-black transition-all shadow-md active:scale-95">JSON</button>
                                            <button onClick={(e) => { e.stopPropagation(); downloadExport(a.session_id, 'txt'); }} className="p-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-all shadow-md active:scale-95">TXT</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detalle (Opcional simplificado) */}
            {selectedAudit && (
                <div className="fixed inset-0 bg-osamoc-blue/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAudit(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-osamoc-blue">{selectedAudit.emisor}</h3>
                                <p className="text-sm text-gray-450 mt-1">Sesión: {selectedAudit.session_id}</p>
                            </div>
                            <button onClick={() => setSelectedAudit(null)} className="text-2xl text-gray-300 hover:text-gray-600 tracking-tighter transition-colors">✕</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Status Auditoría</p>
                                    <p className="font-bold text-gray-700 capitalize">{selectedAudit.status.toLowerCase()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Reconciliación</p>
                                    <p className={`font-bold ${selectedAudit.reconciliation_status === 'MATCH' ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedAudit.reconciliation_status} (${selectedAudit.reconciliation_diff.toFixed(2)})
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Acciones Disponibles</p>
                                <div className="flex space-x-4">
                                    <button onClick={() => downloadExport(selectedAudit.session_id, 'json')} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95">Exportar Consolidado JSON</button>
                                    <button onClick={() => downloadExport(selectedAudit.session_id, 'txt')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl active:scale-95">Exportar Plano TXT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditExplorer;
