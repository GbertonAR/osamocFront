import React, { useEffect, useState } from 'react';

const Dashboard = ({ stats }) => {
    const avgTime = stats.totalProcessed > 0
        ? (stats.totalProcessTime / stats.totalProcessed).toFixed(2)
        : "0.00";

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-osamoc-blue mb-4">Panel de Control (Sesión Aktiva)</h2>

            {/* Alert about Database Status */}
            <div className="bg-blue-50 border-l-4 border-osamoc-blue p-4 mb-6 flex items-center shadow-sm">
                <span className="text-2xl mr-4">ℹ️</span>
                <p className="text-sm text-blue-800">
                    <strong>Modo Demo Aktivo:</strong> Los datos se gestionan en memoria para esta sesión.
                    No se requiere base de datos persistente para esta previsualización.
                </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-osamoc-blue">
                    <h3 className="text-gray-500 text-xs font-bold uppercase">TXT Escaneados</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalProcessed}</p>
                    <p className="text-osamoc-blue text-[10px] mt-2 font-bold">READY PARA AUDITORÍA</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-osamoc-green">
                    <h3 className="text-gray-500 text-xs font-bold uppercase">PDF Generados</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalGenerated}</p>
                    <p className="text-osamoc-green text-[10px] mt-2 font-bold">PRUEBAS DE ESTRÉS</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-400">
                    <h3 className="text-gray-500 text-xs font-bold uppercase">Latencia Promedio</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{avgTime}s</p>
                    <p className="text-yellow-600 text-[10px] mt-2 font-bold">VELOCIDAD AI ANGETICA</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase">Monto Procesado</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">$ {stats.processedAmount.toLocaleString()}</p>
                    <p className="text-purple-600 text-[10px] mt-2 font-bold">RECONOCIMIENTO DE VALORES</p>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center text-gray-400 opacity-80">
                <div className="max-w-md mx-auto">
                    <span className="text-5xl mb-4 block">📈</span>
                    <h3 className="font-bold text-gray-600 text-lg">Inteligencia Predictiva</h3>
                    <p className="text-sm mt-2">La IA está aprendiendo de tus procesos manuales. Con el tiempo, el sistema automatizará el 90% de las autorizaciones.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
