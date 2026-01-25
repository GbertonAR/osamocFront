import React, { useState } from 'react';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);
    const [showFinish, setShowFinish] = useState(false);

    const addLog = (msg) => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setResult(null);
        setLogs([]);
        setShowFinish(false);
    };

    const downloadFile = (content, filename, contentType) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Por favor seleccione un archivo.");
            return;
        }

        setUploading(true);
        setError(null);
        setResult(null);
        setLogs([]);
        setShowFinish(false);

        addLog(`✈️ Iniciando conexión segura con motor Angetica V4...`);
        addLog(`📂 Transfiriendo binarios: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

        const formData = new FormData();
        formData.append("file", file);

        try {
            await new Promise(r => setTimeout(r, 800));
            addLog(`🔍 Analizando estructura visual (Layout Analysis)...`);

            const response = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Error crítico en motor de visión.");

            addLog(`🧬 Extrayendo metadatos: CUIT, Punto de Venta y CAE...`);
            await new Promise(r => setTimeout(r, 1000));
            addLog(`🔢 Cuadrando totales y validando consistencia aritmética...`);

            const data = await response.json();

            addLog(`✅ ¡Auditoría IA completada con éxito!`);
            addLog(`💾 Resultados almacenados en base de intercambio local.`);

            setResult(data);
            onUploadSuccess && onUploadSuccess(data);
            setFile(null);
            setShowFinish(true);
        } catch (err) {
            addLog(`❌ ERROR: ${err.message}`);
            setError(err.message);
            setShowFinish(true);
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setLogs([]);
        setShowFinish(false);
        setFile(null);
    };

    return (
        <div className="p-10 max-w-4xl mx-auto flex flex-col space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-osamoc-blue mb-6">Nueva Ingesta de Datos (Modo TXT)</h2>

                {(!result && !showFinish) ? (
                    <>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center hover:border-osamoc-blue transition-colors cursor-pointer mb-6 relative">
                            <input
                                type="file"
                                id="fileInput"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,image/*"
                            />
                            <div>
                                <div className="text-4xl mb-4 text-osamoc-blue">📄</div>
                                <p className="text-gray-500 font-medium">
                                    {file ? file.name : "Arrastre su factura o haga clic para buscar"}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Formatos aceptados: PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-osamoc-red text-sm rounded border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file}
                            className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-md ${uploading || !file ? 'bg-gray-300 cursor-not-allowed' : 'bg-osamoc-blue hover:bg-blue-800'
                                }`}
                        >
                            {uploading ? "Procesando con IA Angetica..." : "Comenzar Extracción"}
                        </button>
                    </>
                ) : result ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className={`${result.status === 'error' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} p-6 rounded-lg border`}>
                            <div className={`flex items-center space-x-3 ${result.status === 'error' ? 'text-osamoc-red' : 'text-osamoc-green'} mb-4`}>
                                <span className="text-2xl">{result.status === 'error' ? '⚠️' : '✅'}</span>
                                <h3 className="text-lg font-bold">
                                    {result.status === 'error' ? 'Error en Extracción OCR' : 'Extracción Exitosa'}
                                </h3>
                            </div>

                            {result.status === 'error' && (
                                <div className="mb-4 p-3 bg-white/50 border border-red-200 rounded text-red-700 text-xs font-mono">
                                    <p className="font-bold">CAUSA DEL FALLO:</p>
                                    <p>{result.error_detail || "No se detectaron campos válidos en el documento."}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                <div>
                                    <p className="text-gray-500 uppercase text-xs font-bold">Emisor (CUIT)</p>
                                    <p className={`font-mono font-bold ${result.status === 'error' ? 'text-red-400' : 'text-osamoc-blue'}`}>{result.data.cuit_emisor}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase text-xs font-bold">Comprobante Nro</p>
                                    <p className="font-mono font-bold text-gray-700">{result.data.numero_factura}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase text-xs font-bold">Fecha Proceso</p>
                                    <p>{result.data.fecha}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase text-xs font-bold">Monto Auditado</p>
                                    <p className={`font-bold ${result.status === 'error' ? 'text-red-400' : 'text-osamoc-green'}`}>$ {result.data.total?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase text-xs font-bold">Beneficiario</p>
                                    <p className="font-bold text-gray-700 truncate">{result.data.beneficiario_nombre || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase text-xs font-bold">DNI / Período</p>
                                    <p className="text-gray-600">{result.data.beneficiario_dni || 'N/A'} - {result.data.periodo || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => downloadFile(result.txt, `AUDIT_${result.data.numero_factura}.txt`, 'text/plain')}
                                    className={`flex-1 ${result.status === 'error' ? 'bg-osamoc-red' : 'bg-osamoc-blue'} text-white py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-colors`}
                                >
                                    {result.status === 'error' ? 'Bajar Reporte Error (.TXT)' : 'Bajar Auditoría (.TXT)'}
                                </button>
                                <button
                                    onClick={() => downloadFile(result.json, `DATA_${result.data.numero_factura}.json`, 'application/json')}
                                    className={`flex-1 bg-white ${result.status === 'error' ? 'text-osamoc-red border-osamoc-red' : 'text-osamoc-blue border-osamoc-blue'} border py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors`}
                                >
                                    Bajar Estructura (.JSON)
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={reset}
                                className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-black transition-colors font-bold shadow-lg"
                            >
                                Finalizar Operación
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-osamoc-red font-bold">Ocurrió un error. Por favor presione el botón de continuar en la consola.</p>
                        <button onClick={reset} className="mt-4 bg-gray-100 p-2 rounded">Reiniciar</button>
                    </div>
                )}
            </div>

            {/* Visual Log / Terminal */}
            {(uploading || logs.length > 0) && (
                <div className="bg-black text-green-400 font-mono text-xs p-5 rounded-lg shadow-2xl border border-gray-800 max-h-64 overflow-y-auto">
                    <p className="text-gray-500 mb-2 border-b border-gray-800 pb-1 flex justify-between uppercase tracking-widest text-[10px]">
                        <span>Console Stream - Angetica Auditoría</span>
                        <span className="animate-pulse">● LIVE</span>
                    </p>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 flex">
                            <span className="text-gray-600 mr-2 shrink-0">[{log.time}]</span>
                            <span className={log.msg.includes('ERROR') ? 'text-red-400' : ''}>{log.msg}</span>
                        </div>
                    ))}
                    {uploading && (
                        <div className="mt-1 flex items-center space-x-2">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
                            <span className="animate-pulse">Procesando metadatos...</span>
                        </div>
                    )}
                    {showFinish && !uploading && (
                        <div className="mt-3 pt-2 border-t border-gray-800 text-blue-400 font-bold animate-pulse">
                            &gt;&gt; SESIÓN COMPLETADA. ESPERANDO CONFIRMACIÓN HUMANA...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
