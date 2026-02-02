import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(10);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            setUploadProgress(30);
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(30 + (percentCompleted * 0.4)); // Escalar de 30% a 70%
                }
            });

            setUploadProgress(90);
            setTimeout(() => {
                onUploadSuccess(response.data);
                setIsUploading(false);
                setUploadProgress(0);
                setFiles([]);
                alert("¡Lote procesado con éxito! Revisa el Dashboard.");
            }, 500);

        } catch (error) {
            console.error('Error uploading:', error);
            setIsUploading(false);
            setUploadProgress(0);
            alert('Error al procesar el lote. Verifica la conexión con el servidor IA.');
        }
    };

    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="bg-white w-full max-w-2xl p-12 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-8 animate-bounce">
                    ☁️
                </div>
                <h2 className="text-3xl font-black text-osamoc-blue mb-2 tracking-tighter">Carga de Lote de Auditoría</h2>
                <p className="text-gray-400 font-medium mb-10">Selecciona la Factura (PDF) y el Detalle (PDF/XLS) para iniciar el análisis.</p>

                <div className="w-full relative group">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-4 border-dashed border-gray-100 rounded-3xl p-10 group-hover:border-osamoc-blue/20 group-hover:bg-blue-50/30 transition-all">
                        {files.length > 0 ? (
                            <div className="space-y-2">
                                {files.map((f, i) => (
                                    <p key={i} className="text-sm font-bold text-gray-700">📄 {f.name}</p>
                                ))}
                                <p className="text-[10px] text-osamoc-blue font-black uppercase mt-4">Toca para cambiar archivos</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm font-bold text-gray-400">Arrastra archivos aquí o haz clic para buscar</p>
                                <p className="text-[10px] text-gray-300 uppercase font-black mt-2 tracking-widest">Formatos: PDF, XLS, XLSX</p>
                            </>
                        )}
                    </div>
                </div>

                {isUploading ? (
                    <div className="w-full mt-10">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-black text-osamoc-blue uppercase tracking-widest animate-pulse">Analizando con Gemini 2.0...</p>
                            <p className="text-xs font-black text-gray-400">{Math.round(uploadProgress)}%</p>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-osamoc-blue transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0}
                        className={`w-full mt-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all active:scale-95 ${files.length > 0 ? 'bg-osamoc-blue text-white hover:bg-osamoc-blue/90 shadow-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        Iniciar Auditoría Aktiva →
                    </button>
                )}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                <div className="text-center">
                    <p className="text-xl mb-2">🧬</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Extracción</p>
                    <p className="text-xs font-bold text-gray-600">Modelos Determinísticos</p>
                </div>
                <div className="text-center">
                    <p className="text-xl mb-2">⚖️</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Reconciliación</p>
                    <p className="text-xs font-bold text-gray-600">Validación de Totales</p>
                </div>
                <div className="text-center">
                    <p className="text-xl mb-2">📁</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Persistencia</p>
                    <p className="text-xs font-bold text-gray-600">Historización en Postgres</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
