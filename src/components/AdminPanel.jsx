import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';
import KPIsView from './KPIsView';

const AdminPanel = () => {
    const [providers, setProviders] = useState([]);
    const [users, setUsers] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [promptVersions, setPromptVersions] = useState([]);
    const [tables, setTables] = useState([]);
    const [tableData, setTableData] = useState(null);
    const [selectedTable, setSelectedTable] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState('kpis');

    // Modales
    const [showModal, setShowModal] = useState(null); // 'provider' | 'user' | 'prompt' | 'config'
    const [formData, setFormData] = useState({});
    const [selectedId, setSelectedId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [provRes, userRes, confRes, versRes, tablesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/providers`),
                axios.get(`${API_BASE_URL}/admin/users`),
                axios.get(`${API_BASE_URL}/admin/configs`),
                axios.get(`${API_BASE_URL}/admin/prompt-versions`),
                axios.get(`${API_BASE_URL}/admin/tables`)
            ]);
            setProviders(provRes.data);
            setUsers(userRes.data);
            setConfigs(confRes.data);
            setPromptVersions(versRes.data);
            setTables(tablesRes.data);
        } catch (err) {
            console.error("Error fetching admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTableChange = async (tableName) => {
        setSelectedTable(tableName);
        if (!tableName) {
            setTableData(null);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/tables/${tableName}`);
            setTableData(res.data);
        } catch (err) {
            console.error("Error fetching table data", err);
        }
    };

    const handleDelete = async (endpoint, id) => {
        if (!window.confirm("¿Está seguro de eliminar este registro?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/admin/${endpoint}/${id}`);
            fetchData();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            if (showModal === 'provider') {
                await axios.post(`${API_BASE_URL}/admin/providers`, {
                    cuit: formData.cuit,
                    name: formData.razon_social,
                    email: formData.email
                });
            } else if (showModal === 'user') {
                await axios.post(`${API_BASE_URL}/admin/users`, {
                    username: formData.username,
                    password: formData.password,
                    role: formData.role || 'PROVIDER',
                    provider_id: formData.provider_id
                });
            } else if (showModal === 'prompt') {
                await axios.put(`${API_BASE_URL}/admin/providers/${selectedId}`, {
                    custom_prompt_template: formData.custom_prompt_template,
                    change_reason: formData.change_reason || "Manual update"
                });
            } else if (showModal === 'config') {
                await axios.post(`${API_BASE_URL}/admin/configs`, {
                    provider_cuit: formData.provider_cuit,
                    layout_fingerprint: formData.layout_fingerprint,
                    map_schema: JSON.parse(formData.map_schema_str || '{}'),
                    example_row: JSON.parse(formData.example_row_str || '{}')
                });
            }
            setShowModal(null);
            setFormData({});
            setSelectedId(null);
            fetchData();
        } catch (err) {
            alert("Error al procesar: " + (err.response?.data?.detail || err.message));
        }
    };

    const openPromptModal = (p) => {
        setSelectedId(p.id);
        setFormData({ custom_prompt_template: p.custom_prompt_template || '', change_reason: '' });
        setShowModal('prompt');
    };

    return (
        <div className="p-10 space-y-8 animate-fade-in relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-osamoc-blue tracking-tighter">Panel de Administración</h1>
                    <p className="text-gray-400 font-medium">Gestión integral de la plataforma OSEMOC.</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={fetchData} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" title="Refrescar">🔄</button>
                    {['providers', 'users', 'configs'].includes(activeSubTab) && (
                        <button
                            onClick={() => {
                                setShowModal(activeSubTab === 'providers' ? 'provider' : activeSubTab === 'users' ? 'user' : 'config');
                                setFormData({});
                            }}
                            className="bg-osamoc-blue text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                        >
                            + Nuevo
                        </button>
                    )}
                </div>
            </div>

            <div className="flex space-x-6 border-b border-gray-100 overflow-x-auto pb-1">
                <button
                    onClick={() => setActiveSubTab('kpis')}
                    className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${activeSubTab === 'kpis' ? 'text-osamoc-blue border-b-2 border-osamoc-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    KPIs Bitácora
                </button>
                <button
                    onClick={() => setActiveSubTab('providers')}
                    className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${activeSubTab === 'providers' ? 'text-osamoc-blue border-b-2 border-osamoc-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Prestadores ({providers.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('users')}
                    className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${activeSubTab === 'users' ? 'text-osamoc-blue border-b-2 border-osamoc-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Usuarios ({users.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('configs')}
                    className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${activeSubTab === 'configs' ? 'text-osamoc-blue border-b-2 border-osamoc-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Config Determinística ({configs.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('prompts')}
                    className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${activeSubTab === 'prompts' ? 'text-osamoc-blue border-b-2 border-osamoc-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Historial Prompts ({promptVersions.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('db')}
                    className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${activeSubTab === 'db' ? 'text-osamoc-blue border-b-2 border-osamoc-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Explorador DB
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {activeSubTab === 'kpis' && <KPIsView />}

                    {activeSubTab === 'providers' && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Razón Social / CUIT</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">IA Contextual</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {providers.map((p) => (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-800">{p.razon_social || p.name}</p>
                                                <p className="text-[10px] font-mono text-gray-400">{p.cuit}</p>
                                            </td>
                                            <td className="px-8 py-5 text-gray-600">{p.email || "-"}</td>
                                            <td className="px-8 py-5">
                                                <button
                                                    onClick={() => openPromptModal(p)}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${p.custom_prompt_template ? 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    {p.custom_prompt_template ? 'Edit Instructions' : 'Set Instructions'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-5 text-right space-x-3">
                                                <button onClick={() => handleDelete('providers', p.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeSubTab === 'users' && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuario</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Rol</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Vínculo</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5 font-bold text-gray-800">{u.username}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-gray-500">P_ID: {u.provider_id || "-"} / CUIT: {u.provider_cuit || "-"}</td>
                                            <td className="px-8 py-5 text-right space-x-3">
                                                <button onClick={() => handleDelete('users', u.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeSubTab === 'configs' && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">CUIT / Huella</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Esquema Mapeo</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Fecha Alta</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {configs.map((c) => (
                                        <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-800">{c.provider_cuit}</p>
                                                <p className="text-[10px] font-mono text-gray-400 truncate w-24" title={c.layout_fingerprint}>{c.layout_fingerprint}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <pre className="text-[10px] bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                                                    {JSON.stringify(c.map_schema, null, 2)}
                                                </pre>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => handleDelete('configs', c.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeSubTab === 'prompts' && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">P_ID / Versión</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Instrucción / Motivo</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Creado por</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {promptVersions.map((v) => (
                                        <tr key={v.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-800">Prov ID: {v.provider_id}</p>
                                                <p className="text-xs font-black text-cyan-600">V{v.version}</p>
                                            </td>
                                            <td className="px-8 py-5 py-5 max-w-md">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Motivo: {v.change_reason}</p>
                                                <p className="text-xs line-clamp-3 text-gray-600 italic">"{v.prompt_content}"</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-medium">{v.created_by}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(v.created_at).toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => handleDelete('prompt-versions', v.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeSubTab === 'db' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Seleccionar Tabla</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={selectedTable}
                                    onChange={(e) => handleTableChange(e.target.value)}
                                >
                                    <option value="">-- Elige una tabla --</option>
                                    {tables.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {tableData && (
                                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vista Previa: {selectedTable} (Top 10)</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-[10px]">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {tableData.columns.map(col => (
                                                        <th key={col} className="px-4 py-3 font-bold uppercase text-gray-400">{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {tableData.rows.map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        {row.map((val, j) => (
                                                            <td key={j} className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                                                {val === null ? <span className="text-gray-300 italic">null</span> : String(val)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal General de Acción */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className={`bg-white w-full ${['prompt', 'config'].includes(showModal) ? 'max-w-2xl' : 'max-w-md'} rounded-3xl shadow-2xl overflow-hidden animate-slide-up`}>
                        <div className="bg-osamoc-blue p-6 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">
                                {showModal === 'provider' ? 'Nuevo Prestador' :
                                    showModal === 'user' ? 'Nuevo Usuario' :
                                        showModal === 'config' ? 'Nueva Config Determinística' :
                                            'Ajustar Instrucciones IA'}
                            </h3>
                            <button onClick={() => setShowModal(null)} className="opacity-50 hover:opacity-100">✕</button>
                        </div>
                        <form onSubmit={handleAction} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                            {showModal === 'provider' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Razón Social</label>
                                        <input required className="w-full border rounded-xl px-4 py-2" value={formData.razon_social || ''} onChange={e => setFormData({ ...formData, razon_social: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CUIT</label>
                                        <input required className="w-full border rounded-xl px-4 py-2" value={formData.cuit || ''} onChange={e => setFormData({ ...formData, cuit: e.target.value })} placeholder="XX-XXXXXXXX-X" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email de Contacto</label>
                                        <input type="email" className="w-full border rounded-xl px-4 py-2" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </>
                            )}
                            {showModal === 'user' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Username</label>
                                        <input required className="w-full border rounded-xl px-4 py-2" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Password</label>
                                        <input required type="password" className="w-full border rounded-xl px-4 py-2" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rol</label>
                                        <select className="w-full border rounded-xl px-4 py-2" value={formData.role || 'PROVIDER'} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="PROVIDER">PROVIDER (Prestador)</option>
                                            <option value="ADMIN">ADMIN (OSAMOC)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link Provider ID</label>
                                        <input type="number" className="w-full border rounded-xl px-4 py-2" value={formData.provider_id || ''} onChange={e => setFormData({ ...formData, provider_id: e.target.value })} />
                                    </div>
                                </>
                            )}
                            {showModal === 'config' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CUIT Prestador</label>
                                        <input required className="w-full border rounded-xl px-4 py-2" value={formData.provider_cuit || ''} onChange={e => setFormData({ ...formData, provider_cuit: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Huella Layout (md5/hash)</label>
                                        <input required className="w-full border rounded-xl px-4 py-2" value={formData.layout_fingerprint || ''} onChange={e => setFormData({ ...formData, layout_fingerprint: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Esquema Mapeo (JSON)</label>
                                        <textarea required rows={4} className="w-full border rounded-xl px-4 py-2 font-mono text-xs" value={formData.map_schema_str || ''} onChange={e => setFormData({ ...formData, map_schema_str: e.target.value })} placeholder='{"columns": [...], "mapping": {...}}' />
                                    </div>
                                </>
                            )}
                            {showModal === 'prompt' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instrucciones IA (Contexto)</label>
                                        <textarea rows={8} className="w-full border rounded-xl px-4 py-2 font-mono text-xs bg-cyan-50/20" value={formData.custom_prompt_template || ''} onChange={e => setFormData({ ...formData, custom_prompt_template: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Motivo del Cambio</label>
                                        <input required className="w-full border rounded-xl px-4 py-2 text-xs" value={formData.change_reason || ''} onChange={e => setFormData({ ...formData, change_reason: e.target.value })} placeholder="Ej: Ajuste de detección de DNI" />
                                    </div>
                                </>
                            )}
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => { setShowModal(null); setFormData({}); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-osamoc-blue text-white rounded-xl font-bold border-b-4 border-blue-900 shadow-lg active:border-b-0 translate-y-0 active:translate-y-1 transition-all">
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
