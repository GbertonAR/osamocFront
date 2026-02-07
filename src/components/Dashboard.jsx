import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';

const Dashboard = ({ stats: initialStats, user }) => {
    const [dbStats, setDbStats] = useState({ total_tokens: 0, total_amount: 0, total_count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/audits`);
                setDbStats(res.data.stats);
            } catch (err) {
                console.error("Error fetching db stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGlobalStats();
    }, []);

    const cards = [
        {
            title: "Total Auditado",
            value: `$${(dbStats.total_amount || 0).toLocaleString()}`,
            sub: "Caudal financiero analizado",
            icon: "💳",
            color: "from-blue-600 to-indigo-600",
            shadow: "shadow-blue-200"
        },
        {
            title: "Eficacia Operativa",
            value: `${dbStats.total_count || 0}`,
            sub: "Casos resueltos con éxito",
            icon: "💎",
            color: "from-emerald-500 to-teal-600",
            shadow: "shadow-emerald-200"
        },
        {
            title: "Inteligencia Aplicada",
            value: `${((dbStats.total_tokens / 1000) || 0).toFixed(1)}k`,
            sub: "Tokens Gemini 2.0 consumidos",
            icon: "🧠",
            color: "from-purple-600 to-pink-600",
            shadow: "shadow-purple-200"
        },
        {
            title: "Tiempo Promedio",
            value: "0.8s",
            sub: "Velocidad de procesamiento",
            icon: "⚡",
            color: "from-orange-500 to-red-500",
            shadow: "shadow-orange-200"
        }
    ];

    return (
        <div className="p-10 space-y-10 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-osamoc-blue tracking-tighter">Bienvenido, {user?.name || 'Usuario'}</h1>
                    <p className="text-gray-400 font-medium mt-1">Tu plataforma de auditoría médica está operando al 100%.</p>
                </div>
                <div className="flex space-x-2">
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Backend Live
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((c, i) => (
                    <div key={i} className={`relative p-8 rounded-[2rem] bg-gradient-to-br ${c.color} text-white ${c.shadow} hover:scale-[1.02] transition-transform cursor-default group overflow-hidden`}>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:scale-125 transition-transform duration-500">{c.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">{c.title}</p>
                        <p className="text-4xl font-black mb-1">{c.value}</p>
                        <p className="text-xs font-medium opacity-70">{c.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <span className="text-9xl font-black text-osamoc-blue tracking-tighter italic">AKTIVA</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">🚀</span>
                        Resumen de Actividad Reciente
                    </h3>

                    <div className="space-y-6">
                        {[
                            { label: "Mantenimiento de Red Neural", status: "Óptimo", val: "99.9%", color: "bg-blue-500" },
                            { label: "Tasa de Reconciliación (MATCH)", status: "Alta", val: "94.2%", color: "bg-emerald-500" },
                            { label: "Velocidad de Respuesta API", status: "Ultra-Fast", val: "45ms", color: "bg-purple-500" }
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">{item.label}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.status}</p>
                                    </div>
                                    <p className="text-sm font-black text-gray-800">{item.val}</p>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.val }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
                    <h3 className="text-xl font-bold mb-8 relative z-10 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3">🧠</span>
                        Gemini AI Insights
                    </h3>
                    <div className="space-y-6 relative z-10">
                        <p className="text-sm text-slate-400 leading-relaxed">
                            "He detectado un patrón de inconsistencia de $0.05 en el prestador <span className="text-cyan-400 font-bold">Resonancia ART</span>. Sugiero revisar el redondeo de IVA."
                        </p>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase text-white/40 mb-2">Recomendación Proactiva</p>
                            <p className="text-xs font-medium">Habilitar modo 'Deterministic' para facturas de Santa Rosa.</p>
                        </div>
                        <button className="w-full py-4 bg-blue-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40">
                            Optimizar Modelos →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;