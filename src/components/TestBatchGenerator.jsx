import React, { useState } from 'react';
import API_BASE_URL from '../api_config';

const TestBatchGenerator = ({ onBatchGenerated }) => {
    const [count, setCount] = useState(5);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);

    const [showFinish, setShowFinish] = useState(false);

    const addLog = (msg) => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setResult(null);
        setLogs([]);
        setShowFinish(false);

        addLog(`Iniciando generador de datos sintéticos...`);
        addLog(`Configuración: Lote de ${count} facturas.`);

        try {
            await new Promise(r => setTimeout(r, 600));
            addLog(`Generando perfiles de beneficiarios aleatorios...`);

            const response = await fetch(`${API_BASE_URL}/generate-batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count }),
            });

            if (!response.ok) throw new Error("Error al generar el lote.");

            addLog(`Creando archivos PDF con normas 2025...`);
            await new Promise(r => setTimeout(r, 1000));
            addLog(`Inyectando discrepancias aleatorias para auditoría...`);

            const data = await response.json();
            addLog(`¡Lote completado con éxito!`);
            setResult(data);
            onBatchGenerated && onBatchGenerated(data.count);
            setShowFinish(true);
        } catch (err) {
            addLog(`ERROR: ${err.message}`);
            // alert(err.message);
            setShowFinish(true);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto flex flex-col space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-osamoc-blue mb-6">Generador de Lotes para Pruebas</h2>

                {!result ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cantidad de Facturas a Generar
                            </label>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value))}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-osamoc-blue focus:border-transparent outline-none"
                                min="1"
                                max="50"
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                            <p className="font-bold mb-1">Reglas de Generación:</p>
                            <ul className="list-disc list-inside space-y-1 opacity-80">
                                <li>PDFs siguiendo el manual de estilo OSAMOC.</li>
                                <li>Datos sintéticos de beneficiarios y prestaciones.</li>
                                <li>Inyección aleatoria de errores (20% de probabilidad).</li>
                                <li>Almacenamiento automático en el servidor local.</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-md ${generating ? 'bg-gray-300 cursor-not-allowed' : 'bg-osamoc-blue hover:bg-blue-800'
                                }`}
                        >
                            {generating ? "Generando Lote Sintético..." : "Generar Lote de Prueba"}
                        </button>
                    </div>
                ) : (
                    <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-100 animate-fade-in">
                        <h3 className="text-osamoc-green font-bold flex items-center mb-2">
                            <span className="mr-2">✅</span> Lote Creado Exitosamente
                        </h3>
                        <p className="text-sm text-gray-600">
                            Se han generado <strong>{result.count}</strong> archivos PDF en:
                        </p>
                        <p className="text-xs font-mono bg-white p-2 mt-2 border border-green-100 rounded break-all">
                            {result.path}
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => { setResult(null); setLogs([]); setShowFinish(false); }}
                                className="bg-gray-100 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-bold"
                            >
                                Finalizar Operación
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Visual Log / Terminal */}
            {(generating || logs.length > 0) && (
                <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg shadow-xl border border-gray-800 max-h-48 overflow-y-auto">
                    <p className="text-gray-500 mb-2 border-b border-gray-800 pb-1">CONSOLE LOG - BATCH GENERATOR</p>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">
                            <span className="text-gray-600 mr-2">[{log.time}]</span>
                            <span>{log.msg}</span>
                        </div>
                    ))}
                    {generating && <span className="animate-pulse">_</span>}
                    {showFinish && !generating && (
                        <div className="mt-2 pt-2 border-t border-gray-800 text-osamoc-blue font-bold animate-pulse">
                            &gt; GENERACIÓN COMPLETADA. PRESIONE EL BOTÓN PARA CONTINUAR.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestBatchGenerator;
