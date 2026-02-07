import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';

const KPIsView = () => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/admin/metrics`);
                setMetrics(res.data);
            } catch (err) {
                console.error("Error fetching metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const latest = metrics[0] || {};
    const totalGreen = metrics.reduce((acc, m) => acc + (m.status_breakdown?.green || 0), 0);
    const totalYellow = metrics.reduce((acc, m) => acc + (m.status_breakdown?.yellow || 0), 0);
    const totalRed = metrics.reduce((acc, m) => acc + (m.status_breakdown?.red || 0), 0);
    const grandTotal = totalGreen + totalYellow + totalRed || 1;

    const cards = [
        { title: "Auditorías Totales", value: metrics.reduce((acc, m) => acc + m.total_audits, 0), icon: "📄", color: "from-blue-600 to-indigo-600" },
        { title: "Monto Circulante", value: `$${metrics.reduce((acc, m) => acc + m.total_amount, 0).toLocaleString()}`, icon: "�", color: "from-emerald-500 to-teal-600" },
        { title: "Tokens Gemini 2.0", value: metrics.reduce((acc, m) => acc + (m.efficiency?.tokens || 0), 0).toLocaleString(), icon: "🧠", color: "from-purple-600 to-pink-600" },
        { title: "Costo Estimado AI", value: `$${metrics.reduce((acc, m) => acc + (m.estimated_cost || 0), 0).toFixed(2)}`, icon: "⚡", color: "from-orange-500 to-red-500" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className={`relative p-8 rounded-[2rem] bg-gradient-to-br ${c.color} text-white shadow-xl hover:scale-[1.02] transition-transform cursor-default group overflow-hidden`}>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:scale-125 transition-transform duration-500">{c.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">{c.title}</p>
                        <p className="text-3xl font-black mb-1">{c.value}</p>
                        <p className="text-xs font-medium opacity-70">Acumulado 30 días</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Breakdown Visualization */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">�</span>
                        Salud de Auditoría
                    </h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Balanced (Match)</p>
                                <p className="text-sm font-black text-emerald-600">{((totalGreen / grandTotal) * 100).toFixed(1)}%</p>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-200" style={{ width: `${(totalGreen / grandTotal) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Warning (DNI/Logic)</p>
                                <p className="text-sm font-black text-yellow-600">{((totalYellow / grandTotal) * 100).toFixed(1)}%</p>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full shadow-lg shadow-yellow-200" style={{ width: `${(totalYellow / grandTotal) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Discrepancy (Critical)</p>
                                <p className="text-sm font-black text-red-600">{((totalRed / grandTotal) * 100).toFixed(1)}%</p>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full shadow-lg shadow-red-200" style={{ width: `${(totalRed / grandTotal) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-10 py-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Bitácora Diaria de KPIs</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-10 py-4">Fecha</th>
                                    <th className="px-6 py-4">Casos</th>
                                    <th className="px-6 py-4">Status (G/Y/R)</th>
                                    <th className="px-6 py-4 text-right">Items</th>
                                    <th className="px-6 py-4 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {metrics.map((m, i) => (
                                    <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-10 py-4 font-bold text-gray-700">{m.date}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{m.total_audits}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-1">
                                                <div className="h-4 w-4 bg-emerald-500 rounded text-[8px] flex items-center justify-center text-white font-black">{m.status_breakdown?.green}</div>
                                                <div className="h-4 w-4 bg-yellow-400 rounded text-[8px] flex items-center justify-center text-white font-black">{m.status_breakdown?.yellow}</div>
                                                <div className="h-4 w-4 bg-red-500 rounded text-[8px] flex items-center justify-center text-white font-black">{m.status_breakdown?.red}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">{m.efficiency?.items || 0}</td>
                                        <td className="px-6 py-4 text-right font-black text-osamoc-blue">${(m.total_amount || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIsView;
