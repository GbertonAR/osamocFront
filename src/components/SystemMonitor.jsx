import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';

const SystemMonitor = () => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("Checking...");

    const fetchLiveStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/audits`);
            const lastAudit = res.data.audits[0];
            if (lastAudit && lastAudit.logs) {
                setLogs(lastAudit.logs.slice(-20)); // Últimos 20 logs
            }
            setStatus("Connected");
        } catch (e) {
            setStatus("Offline");
        }
    };

    useEffect(() => {
        fetchLiveStatus();
        const interval = setInterval(fetchLiveStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-10 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] shadow-2xl">
                <div>
                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase">Terminal de Auditoría</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Monitoreo de Telemetría Cross-Node</p>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status === 'Connected' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {status}
                </div>
            </div>

            <div className="bg-black/90 backdrop-blur-xl rounded-[2.5rem] p-8 min-h-[500px] shadow-inner font-mono text-[11px] overflow-hidden border border-white/5 relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <p className="text-4xl text-white font-black italic">PROB_V8.4</p>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[450px] scrollbar-hide text-cyan-400">
                    {logs.length > 0 ? logs.map((log, i) => (
                        <div key={i} className="flex space-x-3 group border-b border-white/5 pb-2">
                            <span className="text-slate-600 shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
                            <span className={`leading-relaxed ${log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('❌') ? 'text-red-400' : 'text-cyan-400'}`}>
                                {log}
                            </span>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-40 text-slate-700 animate-pulse">
                            <p className="text-3xl mb-4">⌨️</p>
                            <p className="uppercase font-black tracking-widest">Esperando Telemetría del Servidor...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl">
                    <p className="text-[10px] font-black uppercase mb-2">Conexión Gemini 2.0</p>
                    <div className="flex justify-between items-end">
                        <p className="text-2xl font-black">LATENCIA BAJA</p>
                        <p className="text-xs font-bold opacity-70">Region: us-central1</p>
                    </div>
                </div>
                <div className="p-6 bg-emerald-600 rounded-3xl text-white shadow-xl">
                    <p className="text-[10px] font-black uppercase mb-2">Estado de Base de Datos</p>
                    <div className="flex justify-between items-end">
                        <p className="text-2xl font-black">ESCRITURA OK</p>
                        <p className="text-xs font-bold opacity-70">PostgreSQL Cloud Native</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
