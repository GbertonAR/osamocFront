import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';

const ProviderLogin = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username,
                password
            });

            if (response.data.status === 'success') {
                onLoginSuccess(response.data.user);
            } else {
                throw new Error("Error de autenticación");
            }
        } catch (err) {
            console.error(err);
            setError('Usuario o contraseña incorrectos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-osamoc-blue p-8 pb-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                    <img src="/logo-osamoc.png" alt="OSAMOC" className="h-12 mx-auto mb-4 object-contain brightness-0 invert" />
                    <h2 className="text-white font-bold text-2xl tracking-tight">Portal de Prestadores</h2>
                    <p className="text-blue-200 text-sm mt-2">Acceso Seguro a Auditoría Digital</p>
                </div>

                <div className="p-8 -mt-6 bg-white rounded-t-3xl relative z-10 flex-1">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-osamoc-blue/50 transition-all text-gray-700"
                                placeholder="Ej: resonancia"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-osamoc-blue/50 transition-all text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center">
                                <span className="mr-2">🚫</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-osamoc-blue hover:bg-blue-700'}`}
                        >
                            {loading ? 'Validando...' : 'Ingresar al Portal'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            ¿Problemas de acceso? <a href="#" className="text-osamoc-blue font-bold hover:underline">Contactar Soporte</a>
                        </p>
                        <p className="text-[10px] text-gray-300 mt-4 uppercase tracking-widest">
                            Powered by OSAMOC AI Core
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderLogin;
