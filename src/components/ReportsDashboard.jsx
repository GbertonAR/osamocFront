import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const ReportsDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [data, setData] = useState({ invoices: [], services: [], affiliates: [], kpis: {} });
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc', tab: 'invoices' });
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [invoicesRes, servicesRes, affiliatesRes, kpisRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/reports/invoices`),
                    axios.get(`${API_BASE_URL}/api/reports/services`),
                    axios.get(`${API_BASE_URL}/api/reports/affiliates`),
                    axios.get(`${API_BASE_URL}/api/reports/kpis`)
                ]);

                setData({
                    invoices: invoicesRes.data.invoices || [],
                    services: servicesRes.data.services || [],
                    affiliates: affiliatesRes.data.affiliates || [],
                    kpis: kpisRes.data || {}
                });
            } catch (error) {
                console.error("Error fetching reports data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const requestSort = (key, tab) => {
        let direction = 'asc';
        if (sortConfig.tab === tab && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction, tab });
    };

    const getSortedData = (items, tab) => {
        if (sortConfig.tab !== tab || !sortConfig.key) return items;

        const sortableItems = [...items];
        sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null) return 1;
            if (bValue === null) return -1;

            if (typeof aValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        });
        return sortableItems;
    };

    const SortIndicator = ({ column, tab }) => {
        if (sortConfig.tab !== tab || sortConfig.key !== column) return <span className="ml-1 opacity-20">⇅</span>;
        return <span className="ml-1 text-osamoc-blue">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
    };

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-bold transition-colors ${activeTab === id
                ? 'bg-white text-osamoc-blue border-t-2 border-osamoc-blue shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );

    const [expandedInvoice, setExpandedInvoice] = useState(null);

    const toggleExpand = (id) => {
        setExpandedInvoice(expandedInvoice === id ? null : id);
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-osamoc-blue tracking-tighter">Centro de Informes</h1>
                    <p className="text-gray-400 font-medium">Análisis detallado de facturación y prestaciones.</p>
                </div>
                {/* KPIs Rapidos */}
                <div className="flex space-x-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Gasto Total Acumulado</p>
                        <p className="text-2xl font-black text-slate-800">${(data.kpis.global_spent || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Prestaciones Auditadas</p>
                        <p className="text-2xl font-black text-cyan-600">{(data.kpis.total_services || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Top Prestador</p>
                        <p className="text-xl font-black text-purple-600">{data.kpis.top_provider || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <TabButton id="analytics" label="Análisis" icon="📊" />
                <TabButton id="invoices" label="Facturas" icon="📄" />
                <TabButton id="services" label="Prestaciones" icon="🩺" />
                <TabButton id="affiliates" label="Afiliados" icon="👥" />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-xl border border-gray-100 p-8 min-h-[600px]">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96 space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-osamoc-blue border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-gray-400 font-bold animate-pulse text-sm">Cargando reportes estratégicos...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'analytics' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Line Chart: Gasto Mensual */}
                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                            <span className="bg-osamoc-blue/10 p-2 rounded-lg mr-3">📈</span>
                                            Evolución de Gasto Mensual
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={data.kpis.monthly_spending || []}>
                                                    <defs>
                                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Gasto']}
                                                    />
                                                    <Area type="monotone" dataKey="total" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Pie Chart: Distribución por Prestador */}
                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                            <span className="bg-cyan-100 p-2 rounded-lg mr-3">🏢</span>
                                            Distribución por Prestador
                                        </h3>
                                        <div className="h-[300px] w-full flex">
                                            <ResponsiveContainer width="60%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={data.kpis.provider_distribution || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {data.kpis.provider_distribution?.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="w-[40%] flex flex-col justify-center space-y-2">
                                                {data.kpis.provider_distribution?.map((entry, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                        <span className="text-xs font-bold text-slate-700 truncate">{entry.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart: Resumen de Afiliados */}
                                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                        <span className="bg-purple-100 p-2 rounded-lg mr-3">🔝</span>
                                        Top 5 Afiliados por Gasto
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.affiliates?.slice(0, 5).map(a => ({ name: a.nombre.split(',')[0], total: a.total_gastado })) || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <Tooltip cursor={{ fill: 'transparent' }} />
                                                <Bar dataKey="total" fill="#7c3aed" radius={[8, 8, 0, 0]} barSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'invoices' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('fecha', 'invoices')}>
                                                Fecha Audit <SortIndicator column="fecha" tab="invoices" />
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('provider', 'invoices')}>
                                                Prestador <SortIndicator column="provider" tab="invoices" />
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('nro_comprobante', 'invoices')}>
                                                Nro Comprobante <SortIndicator column="nro_comprobante" tab="invoices" />
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('tipo', 'invoices')}>
                                                Tipo Modalidad <SortIndicator column="tipo" tab="invoices" />
                                            </th>
                                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100" onClick={() => requestSort('total', 'invoices')}>
                                                Monto Total <SortIndicator column="total" tab="invoices" />
                                            </th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100" onClick={() => requestSort('periodo', 'invoices')}>
                                                Periodo <SortIndicator column="periodo" tab="invoices" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {getSortedData(data.invoices, 'invoices').map((inv, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr
                                                    onClick={() => toggleExpand(inv.id)}
                                                    className={`bg-white hover:bg-osamoc-blue/[0.02] cursor-pointer transition-colors group ${expandedInvoice === inv.id ? 'bg-osamoc-blue/[0.03]' : ''}`}
                                                >
                                                    <td className="px-6 py-4 text-xs font-medium">
                                                        {inv.fecha ? new Date(inv.fecha).toLocaleDateString() : '-'}
                                                        <span className="ml-2 text-gray-300">{expandedInvoice === inv.id ? '▼' : '▶'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-black text-slate-800">{inv.provider}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">ID: {inv.id.substring(0, 8)}</p>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-gray-600">{inv.nro_comprobante}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inv.tipo === 'INTERNACION' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {inv.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-800 text-base">${inv.total.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-500 bg-gray-50/30 group-hover:bg-transparent">{inv.periodo}</td>
                                                </tr>
                                                {expandedInvoice === inv.id && (
                                                    <tr className="bg-gray-50/50">
                                                        <td colSpan="6" className="px-12 py-6">
                                                            <div className="bg-white rounded-xl shadow-inner border border-gray-100 p-4">
                                                                <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Ítems Desglosados de Cabecera</h4>
                                                                <div className="space-y-2">
                                                                    {inv.items_factura && inv.items_factura.length > 0 ? (
                                                                        inv.items_factura.map((item, i) => (
                                                                            <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-gray-50 last:border-0">
                                                                                <span className="font-bold text-slate-600">{item.descripcion}</span>
                                                                                <div className="space-x-4">
                                                                                    <span className="text-gray-400">Cant: {item.cantidad}</span>
                                                                                    <span className="font-black text-slate-800">${item.total.toLocaleString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-gray-400 italic text-xs">No hay ítems registrados en la cabecera.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {data.invoices.length === 0 && (
                                            <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-bold italic">No hay facturas procesadas en el sistema.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('fecha', 'services')}>
                                                Fecha <SortIndicator column="fecha" tab="services" />
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('paciente', 'services')}>
                                                Paciente / Beneficiario <SortIndicator column="paciente" tab="services" />
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('prestacion', 'services')}>
                                                Descripción de Prestación <SortIndicator column="prestacion" tab="services" />
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('lugar', 'services')}>
                                                Centro / Lugar <SortIndicator column="lugar" tab="services" />
                                            </th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100" onClick={() => requestSort('cantidad', 'services')}>
                                                Cant. <SortIndicator column="cantidad" tab="services" />
                                            </th>
                                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100" onClick={() => requestSort('total', 'services')}>
                                                Subtotal <SortIndicator column="total" tab="services" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {getSortedData(data.services, 'services').map((srv, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-osamoc-blue/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-xs font-medium">{srv.fecha ? new Date(srv.fecha).toLocaleDateString() : '-'}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-slate-800">{srv.paciente}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">DNI: {srv.dni}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs font-medium text-gray-600 leading-tight">
                                                        {srv.prestacion}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 italic text-gray-500">{srv.lugar}</td>
                                                <td className="px-6 py-4 text-center font-bold">{srv.cantidad}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-black text-slate-800">${srv.total.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">${srv.precio_unitario.toLocaleString()} c/u</p>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.services.length === 0 && (
                                            <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-bold italic">No hay prestaciones auditadas.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'affiliates' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {data.affiliates.map((aff, idx) => (
                                    <div key={idx} className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                        <div className="flex items-center space-x-5 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-100 group-hover:rotate-12 transition-transform">
                                                {aff.nombre ? aff.nombre.substring(0, 1) : '?'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-lg leading-tight">{aff.nombre}</p>
                                                <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">Beneficiario Nº: {aff.dni}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase">Consumo Auditado</span>
                                                </div>
                                                <p className="text-xl font-black text-emerald-600">${aff.total_gastado?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-between px-2">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Frecuencia</p>
                                                    <p className="font-black text-slate-700">{aff.visitas} Visitas</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">Ticket Prom</p>
                                                    <p className="font-black text-slate-700">${(aff.total_gastado / (aff.visitas || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-50">
                                                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Último Lugar de Atención</p>
                                                <p className="font-bold text-purple-600 truncate text-xs">{aff.ultimo_lugar}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {data.affiliates.length === 0 && (
                                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl flex flex-col items-center justify-center space-y-4">
                                        <span className="text-4xl opacity-20">👥</span>
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Sin datos de afiliados para mostrar</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsDashboard;
