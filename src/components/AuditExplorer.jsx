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
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${['MATCH', 'BALANCED'].includes(a.reconciliation_status) ? 'bg-green-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-200 anim-pulse'}`}>
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

            {/* Modal de Inteligencia de Auditoría (Ficha de Hallazgos) */}
            {selectedAudit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all" onClick={() => setSelectedAudit(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20" onClick={e => e.stopPropagation()}>

                        {/* Header Premium */}
                        <div className={`p-8 pb-12 text-white relative overflow-hidden ${['MATCH', 'BALANCED'].includes(selectedAudit.reconciliation_status) ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
                            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                                <span className="text-9xl font-black">AI</span>
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Ficha de Auditoría V9.2</span>
                                    <button onClick={() => setSelectedAudit(null)} className="text-white/60 hover:text-white transition-colors">✕</button>
                                </div>
                                <h3 className="text-3xl font-black mt-4 leading-tight">{selectedAudit.emisor}</h3>
                                <p className="text-white/80 font-medium text-sm mt-1 opacity-90">{selectedAudit.filename}</p>
                            </div>
                        </div>

                        {/* Contenido de la Ficha */}
                        <div className="p-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-20 space-y-6">

                            {/* Resumen Ejecutivo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-osamoc-blue/30 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Mandante</p>
                                    <p className="text-2xl font-black text-gray-800">${parseFloat(selectedAudit.total || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-osamoc-blue/30 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado Reconciliación</p>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${['MATCH', 'BALANCED'].includes(selectedAudit.reconciliation_status) ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-red-500 shadow-lg shadow-red-200'}`}></div>
                                        <p className="font-black text-gray-800 uppercase text-lg">{selectedAudit.reconciliation_status || 'PENDING'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Narrativa de IA */}
                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg">🧠</span>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Análisis de Inteligencia Forense</p>
                                </div>
                                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                    {selectedAudit.narrative || "El sistema ha procesado los documentos. No se generó narrativa adicional para esta sesión."}
                                </p>
                            </div>

                            {/* Listado de Hallazgos (The "Card" Findings) */}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Hallazgos Técnicos ({selectedAudit.findings?.length || 0})</p>
                                <div className="space-y-3">
                                    {selectedAudit.findings && selectedAudit.findings.length > 0 ? (
                                        selectedAudit.findings.map((f, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border flex items-start space-x-4 transition-all ${f.severity === 'RED' ? 'bg-red-50/30 border-red-100' : 'bg-yellow-50/30 border-yellow-100'}`}>
                                                <span className="text-xl">{f.severity === 'RED' ? '🔴' : '⚠️'}</span>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold ${f.severity === 'RED' ? 'text-red-700' : 'text-yellow-700'}`}>{f.message}</p>
                                                    <div className="mt-2 flex items-center bg-white/60 p-2 rounded-xl">
                                                        <span className="text-[10px] mr-2">💡</span>
                                                        <p className="text-[11px] text-gray-600 italic font-medium">{f.hint}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-green-50/30 border border-green-100 rounded-2xl flex items-center space-x-4">
                                            <span className="text-xl">✅</span>
                                            <p className="text-sm font-bold text-green-700 uppercase tracking-wide">No se detectaron discrepancias. Documentación íntegra.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footter Acciones */}
                            <div className="flex space-x-3 pt-4">
                                <button onClick={() => downloadExport(selectedAudit.session_id, 'json')} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Descargar JSON</button>
                                <button onClick={() => downloadExport(selectedAudit.session_id, 'txt')} className="flex-1 bg-white border-2 border-slate-100 text-slate-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95">Vista TXT</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditExplorer;
