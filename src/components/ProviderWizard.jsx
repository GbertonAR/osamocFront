import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api_config';

const ProviderWizard = ({ user, onLogout }) => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState({ invoice: null, annexes: [], invoiceUrl: null });
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Validaciones
    const [validationErrors, setValidationErrors] = useState([]);

    const validateInvoice = (data) => {
        const errors = [];
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // 1. Validar Fecha... (Igual)
        let issueDate = null;
        if (data.fecha) {
            const parts = data.fecha.split(/[-/]/);
            if (parts.length === 3) issueDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (issueDate && issueDate > today) errors.push("La fecha de factura no puede ser futura.");

        // 2. Validar Matemática (Bruto - Coseguros = Neto)
        // Tolerancia $100
        const calculatedNet = data.subtotal - data.coseguros;
        if (Math.abs(calculatedNet - data.total) > 100) {
            errors.push(`Error matemático: Subtotal ($${data.subtotal}) - Coseguros ($${data.coseguros}) != Total ($${data.total}). Diferencia: $${(calculatedNet - data.total).toFixed(2)}`);
        }

        // 3. Validar Suma de Items vs Bruto (Los items suelen sumar el bruto antes de deducir coseguros)
        if (data.items_factura && data.items_factura.length > 0) {
            const sumItems = data.items_factura.reduce((acc, item) => acc + (item.subtotal || item.importe || 0), 0);
            if (Math.abs(sumItems - data.subtotal) > 100) {
                errors.push(`Discrepancia Items: La suma de items ($${sumItems.toLocaleString()}) no coincide con el Subtotal Bruto ($${data.subtotal.toLocaleString()}).`);
            }
        }

        // 4. Periodo
        if (!data.periodo || data.periodo === "No detectado") {
            errors.push("No se detectó el periodo facturado.");
        }

        return errors;
    };

    // Helper to parse European formatted numbers (1.234,56) to Float
    const parseCurrency = (value) => {
        if (typeof value === 'number') return value;
        if (!value) return 0.0;
        // Eliminar puntos de miles y reemplazar coma decimal por punto
        const clean = value.toString().replace(/\./g, '').replace(',', '.');
        return parseFloat(clean) || 0.0;
    };

    // State for granular loading feedback
    const [loadingText, setLoadingText] = useState("Procesando...");

    const handleAnnexUpload = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        if (uploadedFiles.length === 0) return;

        setLoading(true);
        setLoadingText("Subiendo documentos...");

        const newAnnexes = [...files.annexes];

        // Procesar secuencialmente (simulado para demo, podría ser paralelo)
        for (const file of uploadedFiles) {
            setLoadingText(`Analizando ${file.name} con IA...`);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('provider_cuit', user.cuit);

            // HERENCIA: Enviamos el modo detectado o confirmado en la factura
            if (invoiceData?.tipo_prestacion) {
                const auditMode = invoiceData.tipo_prestacion.toUpperCase().includes('INTERNACION') ? 'hierarchical' : 'flat';
                formData.append('mode', auditMode);
                console.log(`🔗 [PORTAL] Forzando modo ${auditMode} para anexo ${file.name}`);
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/provider/extract-annex`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.status === 'success') {
                    const data = response.data.data;
                    const mode = response.data.mode;

                    let numericTotal = 0;
                    let itemsCount = 0;

                    if (mode === 'hierarchical') {
                        // El backend jerárquico devuelve estructura Level 1/2
                        numericTotal = (data.pacientes || []).reduce((acc, p) => acc + parseFloat(p.level1?.total_paciente || 0), 0);
                        itemsCount = (data.pacientes || []).reduce((acc, p) => acc + (p.level2?.items || []).length, 0);
                    } else {
                        const rawTotal = data.total_items || 0;
                        numericTotal = parseCurrency(rawTotal);
                        itemsCount = (data.items_detalle || []).length;
                    }

                    newAnnexes.push({
                        filename: file.name,
                        total: numericTotal,
                        items_count: itemsCount,
                        mode: mode,
                        data: data, // Guardamos data cruda para enviar al final
                        previewUrl: URL.createObjectURL(file) // Para visualización
                    });
                }
            } catch (err) {
                console.error("Error subiendo anexo", err);
                alert(`Error al procesar ${file.name}`);
            }
        }

        setFiles(prev => ({ ...prev, annexes: newAnnexes }));
        setLoading(false);
        setLoadingText("Procesando..."); // Reset text
        e.target.value = ''; // FIX: Reset input to allow re-uploading same file
    };

    const handleSubmit = async () => {
        if (!invoiceData) return;
        setLoading(true);
        setLoadingText("Enviando presentación final...");

        try {
            const payload = {
                session_id: `PORTAL-${Date.now()}`,
                provider_cuit: user.cuit,
                invoice_data: invoiceData,
                annexes_data: files.annexes.map(a => a.data),
                total_reconciled: files.annexes.reduce((sum, a) => sum + (a.total || 0), 0),
                file_path: invoiceData.file_path // Send path to backend
            };

            const response = await axios.post(`${API_BASE_URL}/provider/submit-audit`, payload);

            if (response.data.status === 'success') {
                alert("✅ ¡Presentación Exitosa! Tu facturación ha ingresado al circuito de pago.");
                // Reset o Logout
                window.location.reload();
            }
        } catch (error) {
            alert("Error al presentar: " + error.message);
        } finally {
            setLoading(false);
            setLoadingText("Procesando...");
        }
    };

    const handleInvoiceUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Crear URL para preview
            const objectUrl = URL.createObjectURL(file);

            setFiles(prev => ({ ...prev, invoice: file, invoiceUrl: objectUrl }));
            setLoading(true);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post(`${API_BASE_URL}/provider/extract-invoice`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const data = response.data.data;
                const mappedData = {
                    emisor: data.emisor_nombre || user.name,
                    cuit: data.cuit_emisor || user.cuit,
                    nro_factura: data.nro_factura || "No detectado",
                    fecha: data.fecha_emision || "",
                    cae: data.cae || "No detectado",
                    vto_cae: data.vto_cae || "",
                    punto_venta: data.punto_venta || "",
                    total: data.total_factura || 0.0,
                    subtotal: data.total_importe_bruto || data.total_factura,
                    periodo: data.periodo_facturado || "No detectado",
                    items_factura: data.items_factura || [],
                    tipo_prestacion: data.tipo_prestacion || "AMBULATORIO",
                    file_path: response.data.temp_path // Capture standardized path
                };

                setInvoiceData(mappedData);
                const errors = validateInvoice(mappedData);
                setValidationErrors(errors);

                setStep(2);
            } catch (error) {
                alert("Error leyendo factura: " + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Modal State
    const [previewFile, setPreviewFile] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Header del Portal */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <img src="/logo-osamoc.png" alt="OSAMOC" className="h-8 object-contain" />
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-700">Portal de Prestadores</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Autogestión de Facturación</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{user.name || 'Prestador'}</p>
                        <p className="text-xs text-gray-400 font-mono">{user.cuit || "CUIT no registrado"}</p>
                    </div>
                    <button onClick={onLogout} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Wizard Steps */}
            <div className="max-w-6xl mx-auto mt-6 px-4">
                <div className="flex justify-between items-center mb-8 relative max-w-2xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10"></div>

                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex flex-col items-center ${step >= s ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${step >= s ? 'bg-osamoc-blue text-white shadow-lg shadow-blue-200 scale-110' : 'bg-gray-200 text-gray-500'}`}>
                                {s}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 px-2">{s === 1 ? 'Carga Factura' : s === 2 ? 'Validación Datos' : 'Anexos y Envío'}</span>
                        </div>
                    ))}
                </div>

                {/* Contenido Dinámico */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex">

                    {/* PASO 1: Subir Factura */}
                    {step === 1 && (
                        <div className="w-full p-16 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-6">
                                📄
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Comencemos con tu Factura</h2>
                            <p className="text-slate-400 mb-10 max-w-md">Sube el PDF original de tu factura. El sistema validará fechas y montos automáticamente.</p>

                            <label className={`group relative flex flex-col items-center justify-center w-full max-w-lg h-48 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-blue-50/50 hover:border-osamoc-blue/30 transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {loading ? (
                                        <p className="text-osamoc-blue font-bold animate-pulse">{loadingText || "Analizando documento..."}</p>
                                    ) : (
                                        <>
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Click para subir</span> o arrastra aquí</p>
                                            <p className="text-xs text-gray-400">PDF (Digital o Escaneado)</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept=".pdf" onChange={handleInvoiceUpload} />
                            </label>
                        </div>
                    )}

                    {/* PASO 2: Validar Datos (Split Screen REAL) */}
                    {step === 2 && invoiceData && (
                        <div className="w-full flex h-[800px] animate-fade-in">
                            {/* Preview Izquierda - PDF Viewer */}
                            <div className="w-1/2 bg-slate-800 flex flex-col border-r border-gray-100 relative">
                                <div className="p-2 bg-slate-900 text-white text-xs font-bold text-center">
                                    Vista Previa Documento Original
                                </div>
                                <iframe
                                    src={files.invoiceUrl}
                                    className="w-full h-full object-contain bg-slate-600"
                                    title="Invoice PDF"
                                ></iframe>
                            </div>

                            {/* Formulario Derecha */}
                            <div className="w-1/2 p-8 overflow-y-auto bg-slate-50">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-osamoc-blue">Validación Inteligente</h3>
                                    {invoiceData?.tipo_prestacion && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${invoiceData.tipo_prestacion.includes('INTERNACION')
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm'
                                            }`}>
                                            {invoiceData.tipo_prestacion}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-6">Confirma que los datos leídos coincidan con tu documento.</p>

                                {/* Validation Alerts */}
                                {validationErrors.length > 0 && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                                        <h4 className="text-xs font-black text-red-600 uppercase mb-2">⚠️ Atención - Errores Detectados</h4>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {validationErrors.map((err, i) => (
                                                <li key={i} className="text-xs text-red-700 font-medium">{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-black text-gray-400 mb-1 block">Nro Comprobante</label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.nro_factura}
                                                    onChange={(e) => setInvoiceData({ ...invoiceData, nro_factura: e.target.value })}
                                                    className="w-full bg-gray-50 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-black text-gray-400 mb-1 block">Fecha Emisión</label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.fecha}
                                                    onChange={(e) => setInvoiceData({ ...invoiceData, fecha: e.target.value })}
                                                    className="w-full bg-gray-50 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-black text-gray-400 mb-1 block">CUIT del Proveedor</label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.cuit}
                                                    onChange={(e) => setInvoiceData({ ...invoiceData, cuit: e.target.value })}
                                                    className="w-full bg-blue-50/30 rounded-lg px-3 py-2 font-bold text-blue-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-black text-gray-400 mb-1 block">Razón Social</label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.emisor}
                                                    onChange={(e) => setInvoiceData({ ...invoiceData, emisor: e.target.value })}
                                                    className="w-full bg-blue-50/30 rounded-lg px-3 py-2 font-bold text-blue-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase font-black text-gray-400 mb-1 block">Periodo Facturado</label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.periodo}
                                                    onChange={(e) => setInvoiceData({ ...invoiceData, periodo: e.target.value })}
                                                    className="w-full bg-blue-50/50 rounded-lg px-3 py-2 font-bold text-blue-800 outline-none border border-blue-100 focus:bg-white focus:ring-2 focus:ring-blue-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-[10px] uppercase font-black text-gray-400 mb-1 block">Items Detectados ({invoiceData.items_factura.length})</label>
                                        <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
                                            {invoiceData.items_factura.map((item, idx) => (
                                                <div key={idx} className="text-xs flex justify-between p-2 bg-gray-50 rounded-lg">
                                                    <span className="truncate w-2/3">{item.descripcion}</span>
                                                    <span className="font-bold">${(item.subtotal || item.importe || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Breakdown Coseguros REMOVED by USER REQUEST */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between px-2 text-xs text-gray-500">
                                            <span>Subtotal (Suma Items)</span>
                                            <span className="font-bold">${invoiceData.subtotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 group">
                                        <label className="text-[10px] uppercase font-black text-green-600 mb-1 block group-hover:text-green-700 cursor-pointer">Total A Facturar (Editar si es necesario)</label>
                                        <div className="flex items-center">
                                            <span className="text-green-800 text-xl font-black mr-1">$</span>
                                            <input
                                                type="number"
                                                value={invoiceData.total}
                                                onChange={(e) => setInvoiceData({ ...invoiceData, total: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-transparent text-3xl font-black text-green-800 outline-none focus:underline"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex space-x-3">
                                        <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Corregir Archivo</button>
                                        <button
                                            onClick={() => setStep(3)}
                                            disabled={false} // Siempre habilitado, el usuario valida
                                            className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 bg-osamoc-blue hover:bg-blue-700 shadow-blue-200`}
                                        >
                                            Confirmar y Seguir →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Anexos y Presentación */}
                    {step === 3 && (
                        <div className="w-full flex h-[600px] animate-fade-in">
                            {/* Panel Izquierdo: Lista de Anexos */}
                            <div className="w-1/2 p-10 bg-slate-800 text-white flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Anexos de Respaldo</h3>
                                        <p className="text-xs text-gray-400">Archivos cargados para justificar facturación.</p>
                                    </div>
                                    <label className={`cursor-pointer group border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/5 hover:border-blue-500/50 transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">➕</span>
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-400">{loading ? loadingText : "Agregar Anexo"}</span>
                                        <input type="file" multiple className="hidden" onChange={handleAnnexUpload} />
                                    </label>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                                    {files.annexes.length === 0 && (
                                        <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-xl text-gray-500 text-xs">
                                            No hay anexos cargados. Agrega uno con el botón (+).
                                        </div>
                                    )}
                                    {files.annexes.map((annex, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">📎</div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-200 max-w-[150px] truncate" title={annex.filename}>{annex.filename}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-[10px] text-gray-500 uppercase">
                                                            {annex.mode === 'hierarchical' ? `${annex.data?.pacientes?.length || 0} pacientes` : `${annex.items_count || 0} items`}
                                                        </p>
                                                        {annex.mode === 'hierarchical' && (
                                                            <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 text-[8px] font-black rounded uppercase">Internación</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-bold text-green-400 mr-2">${annex.total?.toLocaleString()}</p>
                                                <button
                                                    onClick={() => setPreviewFile(annex)}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                                                    title="Ver documento"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newAnnexes = files.annexes.filter((_, i) => i !== idx);
                                                        setFiles(prev => ({ ...prev, annexes: newAnnexes }));
                                                    }}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                                                    title="Eliminar anexo"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel Derecho: Reconciliación Final */}
                            <div className="w-1/2 p-10 bg-slate-50 relative flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Resumen de Cuenta</h3>

                                <div className="space-y-4 max-w-sm mx-auto w-full">
                                    <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Total Factura (Cargado)</span>
                                        <span className="text-lg font-black text-slate-800">${invoiceData.total.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-center text-gray-300 text-xl font-bold">-</div>

                                    <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Total Anexos (IA)</span>
                                        <span className="text-lg font-black text-blue-600">${files.annexes.reduce((sum, a) => sum + (a.total || 0), 0).toLocaleString()}</span>
                                    </div>

                                    <div className="h-px bg-gray-300 my-4"></div>

                                    <div className={`flex justify-between items-center p-6 rounded-2xl border-2 transition-all ${Math.abs(invoiceData.total - files.annexes.reduce((sum, a) => sum + (a.total || 0), 0)) < 100
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-orange-50 border-orange-200 text-orange-700'
                                        }`}>
                                        <span className="text-xs font-black uppercase tracking-widest">Diferencia</span>
                                        <span className="text-2xl font-black">
                                            ${(invoiceData.total - files.annexes.reduce((sum, a) => sum + (a.total || 0), 0)).toLocaleString()}
                                        </span>
                                    </div>

                                    {Math.abs(invoiceData.total - files.annexes.reduce((sum, a) => sum + (a.total || 0), 0)) > 100 ? (
                                        <p className="text-xs text-center text-orange-500 font-bold animate-pulse">
                                            ⚠️ Diferencia detectada. Se enviará a Auditoría Manual.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-center text-green-600 font-bold">
                                            ✅ Balance Correcto. Listo para presentar.
                                        </p>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 mt-6 ${loading
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : Math.abs(invoiceData.total - files.annexes.reduce((sum, a) => sum + (a.total || 0), 0)) > 100
                                                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-300'
                                                : 'bg-osamoc-blue text-white hover:bg-blue-700 shadow-blue-300'
                                            }`}
                                    >
                                        {loading ? 'Procesando...' : Math.abs(invoiceData.total - files.annexes.reduce((sum, a) => sum + (a.total || 0), 0)) > 100 ? 'Enviar a Revisión' : 'Presentar Facturación Final'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PDF Preview Modal con Panel de Datos */}
                    {previewFile && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 animate-fade-in" onClick={() => setPreviewFile(null)}>
                            <div className="bg-white w-full max-w-7xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                                <div className="bg-slate-900 px-8 py-4 flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">📎</div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">{previewFile.filename}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{previewFile.mode === 'hierarchical' ? 'Auditoría Jerárquica' : 'Auditoría Plana'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPreviewFile(null)}
                                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all scale-100 hover:scale-110"
                                    >✕</button>
                                </div>
                                <div className="flex-1 flex overflow-hidden">
                                    {/* PDF View */}
                                    <div className="w-2/3 h-full bg-slate-200">
                                        <iframe src={previewFile.previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                                    </div>

                                    {/* Data View */}
                                    <div className="w-1/3 h-full bg-slate-50 border-l border-gray-200 overflow-y-auto custom-scrollbar p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Datos Extraídos (IA)</h4>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full">${previewFile.total?.toLocaleString()}</span>
                                        </div>

                                        {previewFile.mode === 'hierarchical' ? (
                                            <div className="space-y-4">
                                                {(previewFile.data?.pacientes || []).map((p, pIdx) => (
                                                    <div key={pIdx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <p className="text-[10px] font-black text-blue-600 uppercase mb-0.5">{p.level1?.dni}</p>
                                                                <h5 className="text-xs font-bold text-slate-800 leading-tight uppercase">{p.level1?.paciente}</h5>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-slate-900">${parseFloat(p.level1?.total_paciente || 0).toLocaleString()}</p>
                                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${p.level1?.validacion_interna === 'MATCH' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {p.level1?.validacion_interna}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Sub-items del paciente */}
                                                        <div className="mt-2 space-y-1.5 pt-2 border-t border-dashed border-gray-100">
                                                            {(p.level2?.items || []).map((it, itIdx) => (
                                                                <div key={itIdx} className="flex justify-between items-center text-[10px]">
                                                                    <span className="text-gray-500 max-w-[140px] truncate uppercase">{it.desc}</span>
                                                                    <span className="font-bold text-slate-600">${parseFloat(it.subtotal || 0).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {(previewFile.data?.items_detalle || []).map((it, idx) => (
                                                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                                        <div className="max-w-[70%]">
                                                            <p className="text-[10px] font-bold text-slate-800 leading-tight truncate uppercase">{it.descripcion_practica || it.descripcion}</p>
                                                            <p className="text-[8px] text-gray-400 font-black uppercase">{it.nombre_paciente} | {it.dni_paciente}</p>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-900">${parseCurrency(it.subtotal || it.importe).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderWizard;
