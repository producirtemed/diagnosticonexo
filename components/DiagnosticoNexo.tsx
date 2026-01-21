'use client'; 

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
    FileText, Trophy, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle, 
    Settings, Compass, Users, Layers, ChevronRight, ArrowLeft, Loader2, Info, 
    Play, User, ChevronDown, Check, Download, ChevronLeft, Building, Briefcase, 
    Phone, Mail, Globe, MapPin, ShieldCheck
} from 'lucide-react'; 

// IMPORTACIÓN DE LIBRERÍA EMAILJS
import emailjs from '@emailjs/browser';
// Si tienes una configuración personalizada, mantenla, si no, la inicialización directa abajo funciona
import { initializeEmailJS } from '../lib/emailjs.config';
import { useGemini } from '../hooks/useGemini';
import ResultadosNexo from './ResultadosNexo';  

// --- DATOS DE SECTORES ECONÓMICOS (CON CÓDIGOS CIIU TEXTILES) ---
const SECTORES_ECONOMICOS = [
// DIVISIÓN 13: FABRICACIÓN DE PRODUCTOS TEXTILES
{ id: '1311', label: '1311 - Preparación e hilatura de fibras textiles', baseCostos: 310000, factorMejora: 0.16 },
{ id: '1312', label: '1312 - Tejeduría de productos textiles', baseCostos: 300000, factorMejora: 0.15 },
{ id: '1313', label: '1313 - Acabado de productos textiles', baseCostos: 320000, factorMejora: 0.17 },
{ id: '1391', label: '1391 - Fabricación de tejidos de punto y ganchillo', baseCostos: 280000, factorMejora: 0.15 },
{ id: '1392', label: '1392 - Confección de artículos con materiales textiles (excepto prendas)', baseCostos: 260000, factorMejora: 0.14 },
{ id: '1393', label: '1393 - Fabricación de tapetes y alfombras para pisos', baseCostos: 290000, factorMejora: 0.15 },
{ id: '1394', label: '1394 - Fabricación de cuerdas, cordeles, cables y redes', baseCostos: 240000, factorMejora: 0.12 },
{ id: '1399', label: '1399 - Fabricación de otros artículos textiles n.c.p.', baseCostos: 250000, factorMejora: 0.12 },

// DIVISIÓN 14: CONFECCIÓN DE PRENDAS DE VESTIR
{ id: '1410', label: '1410 - Confección de prendas de vestir (excepto piel)', baseCostos: 250000, factorMejora: 0.20 },
{ id: '1420', label: '1420 - Fabricación de artículos de piel', baseCostos: 400000, factorMejora: 0.18 },
{ id: '1430', label: '1430 - Fabricación de artículos de punto y ganchillo', baseCostos: 240000, factorMejora: 0.19 },

// DIVISIÓN 15: CURTIDO Y CALZADO (CADENA DE VALOR RELACIONADA)
{ id: '1511', label: '1511 - Curtido y recurtido de cueros; teñido de pieles', baseCostos: 350000, factorMejora: 0.13 },
{ id: '1512', label: '1512 - Fabricación de artículos de viaje, bolsos y talabartería', baseCostos: 280000, factorMejora: 0.15 },
{ id: '1521', label: '1521 - Fabricación de calzado de cuero y piel', baseCostos: 320000, factorMejora: 0.17 },
{ id: '1522', label: '1522 - Fabricación de otros tipos de calzado (textil/sintético)', baseCostos: 270000, factorMejora: 0.16 },

// COMERCIO AL POR MAYOR Y MENOR (SECTOR TEXTIL)
{ id: '4641', label: '4641 - Comercio al por mayor de textiles y productos confeccionados', baseCostos: 150000, factorMejora: 0.10 },
{ id: '4642', label: '4642 - Comercio al por mayor de prendas de vestir', baseCostos: 160000, factorMejora: 0.11 },
{ id: '4643', label: '4643 - Comercio al por mayor de calzado', baseCostos: 155000, factorMejora: 0.10 },
{ id: '4751', label: '4751 - Comercio al por menor de productos textiles en especializados', baseCostos: 120000, factorMejora: 0.09 },
{ id: '4771', label: '4771 - Comercio al por menor de prendas de vestir y accesorios', baseCostos: 130000, factorMejora: 0.10 },

// GENÉRICOS
{ id: 'OTRO', label: 'Otro sector manufacturero', baseCostos: 100000, factorMejora: 0.08 },
];

// --- LISTA DE PAÍSES ORDENADA A-Z (FORMATO STANDARD) ---
const COUNTRIES = [
    { name: "Colombia", code: "CO", dial_code: "+57", flag: "🇨🇴" },
    { name: "Afghanistan", code: "AF", dial_code: "+93", flag: "🇦🇫" },
    { name: "Argentina", code: "AR", dial_code: "+54", flag: "🇦🇷" },
    { name: "Australia", code: "AU", dial_code: "+61", flag: "🇦🇺" },
    { name: "Bolivia", code: "BO", dial_code: "+591", flag: "🇧🇴" },
    { name: "Brazil", code: "BR", dial_code: "+55", flag: "🇧🇷" },
    { name: "Canada", code: "CA", dial_code: "+1", flag: "🇨🇦" },
    { name: "Chile", code: "CL", dial_code: "+56", flag: "🇨🇱" },
    { name: "China", code: "CN", dial_code: "+86", flag: "🇨🇳" },
    { name: "Costa Rica", code: "CR", dial_code: "+506", flag: "🇨🇷" },
    { name: "Dominican Republic", code: "DO", dial_code: "+1-809", flag: "🇩🇴" },
    { name: "Ecuador", code: "EC", dial_code: "+593", flag: "🇪🇨" },
    { name: "El Salvador", code: "SV", dial_code: "+503", flag: "🇸🇻" },
    { name: "France", code: "FR", dial_code: "+33", flag: "🇫🇷" },
    { name: "Germany", code: "DE", dial_code: "+49", flag: "🇩🇪" },
    { name: "Guatemala", code: "GT", dial_code: "+502", flag: "🇬🇹" },
    { name: "Honduras", code: "HN", dial_code: "+504", flag: "🇭🇳" },
    { name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
    { name: "Italy", code: "IT", dial_code: "+39", flag: "🇮🇹" },
    { name: "Japan", code: "JP", dial_code: "+81", flag: "🇯🇵" },
    { name: "Mexico", code: "MX", dial_code: "+52", flag: "🇲🇽" },
    { name: "Panama", code: "PA", dial_code: "+507", flag: "🇵🇦" },
    { name: "Paraguay", code: "PY", dial_code: "+595", flag: "🇵🇾" },
    { name: "Peru", code: "PE", dial_code: "+51", flag: "🇵🇪" },
    { name: "Spain", code: "ES", dial_code: "+34", flag: "🇪🇸" },
    { name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
    { name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
    { name: "Uruguay", code: "UY", dial_code: "+598", flag: "🇺🇾" },
    { name: "Venezuela", code: "VE", dial_code: "+58", flag: "🇻🇪" },
];

// --- INTERFACES Y DATOS ---

interface UserData {
    nombre: string;
    apellido: string; 
    cargo: string;
    empresa: string;
    nit: string;
    whatsapp: string; 
    email: string;
    sector: string[];
    tamanoOrganizacion: string; //
    aceptaDatos: boolean;
    expectativas: string; // <-- AÑADIR ESTA LÍNEA
    countryCode: string; 
    dialCode: string;   
}

interface EconomicMetrics { puntuacionPorcentaje: number; ahorroAnualPotencial: number; roiEsperado: number; recuperacionMeses: number; baseSolida: boolean; potencialMejora: number; }
interface ComparativoMetrics { tiemposCicloActual: string; tiemposCicloReferencia: string; tiemposCicloExperto: string; defectosPPMActual: number; defectosPPMReferencia: number; defectosPPMExperto: number; utilizacionMaquinasActual: string; utilizacionMaquinasReferencia: string; utilizacionMaquinasExperto: string; variabilidadEntregaActual: string; variabilidadEntregaReferencia: string; variabilidadEntregaExperto: string; }
interface NexoReporte { nivelMadurez: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto'; puntosAcumulados: number; eficienciaOperacional: number; eficienciaProduccion: number; eficienciaProcesos: number; brechas: { operacional: { descripcion: string; impacto: string }; produccion: { descripcion: string; impacto: string }; procesos: { descripcion: string; impacto: string }; }; comparativo: ComparativoMetrics; desafios: { titulo: string; recompensa: string; icon: React.ElementType; }[]; recomendaciones: { titulo: string; descripcion: string }[]; tiempoExperto: string; hallazgos: { fortalezas: { titulo: string; descripcion: string }[]; criticas: { titulo: string; descripcion: string }[]; } }

const DUMMY_REPORT: NexoReporte = { nivelMadurez: 'Avanzado', puntosAcumulados: 650, eficienciaOperacional: 65, eficienciaProduccion: 70, eficienciaProcesos: 60, tiempoExperto: '6-12 meses', brechas: { operacional: { descripcion: 'Se recomienda implementar un sistema de gestión visual (Andon) para monitorizar el estado de la maquinaria y reducir tiempos muertos en un 15%.', impacto: '$50,000 anuales' }, produccion: { descripcion: 'Existe alta variabilidad en el tiempo de ciclo entre líneas. Se requiere balancear la carga de trabajo y automatizar inspecciones críticas.', impacto: '$75,000 anuales' }, procesos: { descripcion: 'La documentación de procesos no está centralizada. Se debe estandarizar los SOPs para reducir errores de montaje y reprocesos.', impacto: '$60,000 anuales' }, }, comparativo: { tiemposCicloActual: '120 min', tiemposCicloReferencia: '90 min', tiemposCicloExperto: '30 min', defectosPPMActual: 5000, defectosPPMReferencia: 1000, defectosPPMExperto: 400, utilizacionMaquinasActual: '60%', utilizacionMaquinasReferencia: '85%', utilizacionMaquinasExperto: '95%', variabilidadEntregaActual: '±3 días', variabilidadEntregaReferencia: '±0.5 días', variabilidadEntregaExperto: '±0.1 días', }, desafios: [ { titulo: 'Reducir Defectos en 30%', recompensa: 'Recompensa: Acceso al Pilar II (Calidad Integrada).', icon: CheckCircle, }, { titulo: 'Implementar Gestión Visual', recompensa: 'Recompensa: Acceso al Pilar IV (Cultura Sostenible).', icon: Settings, }, { titulo: 'Balancear Líneas de Producción', recompensa: 'Recompensa: Acceso al Pilar I (Estructura Modular).', icon: Layers, }, ], recomendaciones: [ { titulo: 'Optimización de Balanceo de Línea', descripcion: 'Aplicar estudio de tiempos para equilibrar la carga de trabajo en cada estación modular.' }, { titulo: 'Implementación de Gestión Visual', descripcion: 'Desarrollar tableros de control de KPIs y sistemas Andon para monitoreo en tiempo real.' }, { titulo: 'Capacitación en Mejora Continua', descripcion: 'Formar al personal en herramientas Lean para identificar y eliminar desperdicios.' }, ], hallazgos: { fortalezas: [ { titulo: 'Compromiso con la Calidad', descripcion: 'Tu equipo muestra dedicación a los estándares.' }, { titulo: 'Base Modular Sólida', descripcion: 'Existe una estructura productiva adaptable.' }, { titulo: 'Potencial de Crecimiento', descripcion: 'Gran capacidad no utilizada en procesos clave.' }, ], criticas: [ { titulo: 'Tiempos de Ciclo', descripcion: 'Oportunidades para reducir la ineficiencia entre estaciones.' }, { titulo: 'Tasa de Defectos', descripcion: 'Reducir el reproceso y el desperdicio en la línea.' }, { titulo: 'Utilización de Maquinaria', descripcion: 'Maximizar el rendimiento de tus equipos actuales.' }, ] }
};

interface Pregunta { id: string; afirmacion: string; seccion: string; tipo?: 'number' | 'percent' | 'text'; }
const preguntasCompletas: Pregunta[] = [ 
    { id: 'p1', afirmacion: '¿Tienes definidos claramente los módulos de producción?', seccion: 'I. Gestión de Procesos por Módulos' },
    { id: 'p2', afirmacion: '¿Cada módulo tiene objetivos de rendimiento específicos?', seccion: 'I. Gestión de Procesos por Módulos' },
    { id: 'p3', afirmacion: '¿Los módulos están integrados eficientemente entre sí?', seccion: 'I. Gestión de Procesos por Módulos' },
    { id: 'p4', afirmacion: '¿Realizas análisis para identificar cuellos de botella en la producción?', seccion: 'II. Eficiencia y Optimización' },
    { id: 'p5', afirmacion: '¿Usas metodologías Lean Manufacturing para reducir desperdicios?', seccion: 'II. Eficiencia y Optimización' },
    { id: 'p6', afirmacion: '¿Monitoreas y reduces los tiempos de ciclo en la producción?', seccion: 'II. Eficiencia y Optimización' },
    { id: 'p7', afirmacion: '¿Tienes un sistema de gestión de calidad implementado?', seccion: 'III. Gestión de Calidad' },
    { id: 'p8', afirmacion: '¿Realizas controles de calidad en cada etapa del proceso productivo?', seccion: 'III. Gestión de Calidad' },
    { id: 'p9', afirmacion: '¿Implementas acciones correctivas para reducir defectos?', seccion: 'III. Gestión de Calidad' },
    { id: 'p10', afirmacion: '¿Gestionas eficientemente tu cadena de suministro?', seccion: 'IV. Cadena de Suministro' },
    { id: 'p11', afirmacion: '¿Evalúas el desempeño de tus proveedores regularmente?', seccion: 'IV. Cadena de Suministro' },
    { id: 'p12', afirmacion: '¿Gestionas el inventario de manera eficiente?', seccion: 'IV. Cadena de Suministro' },
    { id: 'p13', afirmacion: '¿Tu personal está capacitado para realizar sus tareas?', seccion: 'V. Talento Humano' },
    { id: 'p14', afirmacion: '¿Ofreces capacitación continua a tu personal?', seccion: 'V. Talento Humano' },
    { id: 'p15', afirmacion: '¿Fomentas un ambiente de trabajo seguro y saludable?', seccion: 'V. Talento Humano' },
    { id: 'p16', afirmacion: '¿Utilizas tecnología para mejorar tus procesos productivos?', seccion: 'VI. Tecnología e Innovación' },
    { id: 'p17', afirmacion: '¿Inviertes en innovación para mejorar tu producción?', seccion: 'VI. Tecnología e Innovación' },
    { id: 'p18', afirmacion: '¿Utilizas datos para tomar decisiones informadas en la producción?', seccion: 'VI. Tecnología e Innovación' },
    { id: 'p19', afirmacion: '¿Conoces tus costos de producción detalladamente?', seccion: 'VII. Costos y Finanzas' },
    { id: 'p20', afirmacion: '¿Reduces los costos de producción de manera continua?', seccion: 'VII. Costos y Finanzas' },
{ 
   id: 'VII_ingresos_anuales', 
    afirmacion: '¿A cuánto ascienden aproximadamente sus ingresos o ventas totales ANUALES?', 
    seccion: 'VII. Costos y Finanzas', 
    tipo: 'number' 
},
{ 
    id: 'VII_costos_reales', 
    afirmacion: '¿Cuál es el valor aproximado de sus costos operativos totales ANUALES (Mano de obra + Insumos + Energía)?', 
    seccion: 'VII. Costos y Finanzas', 
    tipo: 'number' 
},
{ 
    id: 'VII_desperdicio_percibido', 
    afirmacion: '¿Qué porcentaje de desperdicio o reproceso estima actualmente en su operación?', 
    seccion: 'VII. Costos y Finanzas', 
    tipo: 'percent' 
},
{ 
    id: 'expectativas', 
    afirmacion: 'Expectativas: Describa sus principales cuellos de botella y lo que espera lograr con la ruta nexo como herramienta clave para la mejora de sus procesos productivos.', 
    seccion: 'VII. Costos y Finanzas', 
    tipo: 'text' // Usaremos un tipo nuevo 'text' para identificarlo
},

];

const preguntas = preguntasCompletas; 
const MAX_PUNTOS_POR_PREGUNTA = 5; 
const PUNTOS_POR_RESPUESTA = [0, 3, 5]; 

// CAMBIO CLAVE: Solo filtramos preguntas que empiecen por 'p' (técnicas)
const MAX_PUNTOS = preguntas.filter(p => p.id.startsWith('p')).length * MAX_PUNTOS_POR_PREGUNTA; 

const PUNTUACION_MAXIMA_GAMIFICADA = 1300;

interface Seccion { id: string; titulo: string; preguntas: Pregunta[]; }
const secciones: Seccion[] = preguntas.reduce((acc, pregunta) => {
    const seccionId = pregunta.seccion.split('. ')[0];
    const existingSection = acc.find(s => s.id === seccionId);

    if (existingSection) {
        existingSection.preguntas.push(pregunta);
    } else {
        acc.push({ id: seccionId, titulo: pregunta.seccion, preguntas: [pregunta] });
    }
    return acc;
}, [] as Seccion[]);

// --- COMPONENTES AUXILIARES ---

const TooltipComponent: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <span 
            className="relative inline-block" 
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div className="absolute z-50 p-2 bg-slate-700 text-sm text-white rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2 whitespace-nowrap mb-2">
                    {content}
                </div>
            )}
        </span>
    );
};

const PuntuacionSelector: React.FC<{ valorActual: number; onSelect: (value: number) => void; disabled: boolean }> = ({ valorActual, onSelect, disabled }) => {
    const opciones = [ { value: 1 }, { value: 2 }, { value: 3 }, ];
    return (
        <div className="flex justify-end items-center space-x-4"> 
            {opciones.map(op => (
                <div
                    key={op.value}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-base font-bold
                        ${op.value === valorActual 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/50' 
                            : 'bg-slate-700 text-slate-400'
                        }
                        ${!disabled && op.value !== valorActual ? 'hover:bg-slate-600 hover:ring-2 hover:ring-slate-500 cursor-pointer' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !disabled && onSelect(op.value)}
                    data-value={op.value}
                >
                    {op.value}
                </div>
            ))}
        </div>
    );
};

// --- COMPONENTE METRICAS CIRCULARES ---
interface CircularMetricProps { value: number; label: string; subtext: string; onClick: (brechaType: 'operacional' | 'produccion' | 'procesos') => void; isActive: boolean; colorVar: string; brechaType: 'operacional' | 'produccion' | 'procesos'; }

const CircularMetric: React.FC<CircularMetricProps> = ({ value, label, subtext, onClick, isActive, colorVar, brechaType }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const strokeColor = `var(${colorVar})`; 
    const activeClass = isActive ? 'active-brecha' : '';
    const tooltipContent = isActive ? "Clic para plegar la información" : "Clic para ver Brechas y Recomendaciones";
    
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const strokeWidth = 6; 

    return (
        <TooltipComponent content={tooltipContent}>
            <div 
                className={`card-dark relative flex flex-col items-center justify-start text-center h-full cursor-pointer transition-all duration-300 overflow-visible ${activeClass}`}
                style={{ padding: '1.5rem', paddingBottom: '100px', minHeight: '420px' }}
                onClick={() => onClick(brechaType)}
            >
                <div className="relative w-48 h-48 mt-2 mb-4 shrink-0"> 
                    <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90 overflow-visible">
                        <circle fill="#020617" stroke="transparent" strokeWidth={strokeWidth} cx="60" cy="60" r={radius} /> 
                        <circle 
                            className="transition-all duration-1000 ease-out" 
                            cx="60" cy="60" r={radius} 
                            fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth}
                            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span 
                            className="font-extrabold text-5xl leading-none"
                            style={{ color: strokeColor, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }} 
                        >
                            {value}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-start w-full z-10 px-2">
                    <h4 className="font-bold text-xl text-white mb-2 leading-tight">{label}</h4> 
                    <p className="text-sm text-slate-400 leading-tight opacity-90">{subtext}</p> 
                </div>
                
                <div 
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onClick(brechaType);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '20px', 
                        right: '20px',
                        width: '3rem', 
                        height: '3rem',
                        borderRadius: '1rem', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        zIndex: 30, 
                        backgroundColor: isButtonHovered ? '#1e293b' : 'rgba(30, 41, 59, 0.4)', 
                        border: isButtonHovered ? '1px solid #3b82f6' : '1px solid #334155', 
                        color: isButtonHovered ? '#ffffff' : '#94a3b8', 
                        boxShadow: isButtonHovered ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none', 
                        transform: isButtonHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                >
                    <ChevronDown 
                        size={24}
                        strokeWidth={2}
                        className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>
        </TooltipComponent>
    );
};

interface BrechaCardProps { title: string; data: { descripcion: string; impacto: string }; icon: React.ElementType; isActive: boolean; }
const BrechaCard: React.FC<BrechaCardProps> = ({ title, data, icon: Icon, isActive }) => (
    <div className={`card-dark p-5 flex flex-col h-full ${isActive ? 'active-brecha' : ''}`}>
        <div className="flex items-center mb-3"><Icon className="w-6 h-6 mr-3 text-red-400" /><h4 className="text-lg font-semibold text-white">{title}</h4></div>
        <p className="brecha-descripcion text-slate-300 mb-2">{data.descripcion}</p> 
        <p className="brecha-impacto text-slate-400 text-xs mt-auto pt-2 border-t border-slate-700/50">Impacto económico estimado: <strong className="text-blue-400">{data.impacto}</strong></p>
    </div>
);

interface RecomendacionCardProps { titulo: string; descripcion: string; icon: React.ElementType; }
const RecomendacionCard: React.FC<RecomendacionCardProps> = ({ titulo, descripcion, icon: Icon }) => (
    <div className="card-dark p-5 flex flex-col h-full">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-400/20 text-blue-400 mb-3"><Icon className="w-5 h-5" /></div>
        <h4 className="recomendacion-title text-white mb-2">{titulo}</h4> 
        <p className="recomendacion-descripcion text-slate-300">{descripcion}</p> 
    </div>
);

// Cambia la definición de la interfaz para incluir lo necesario
interface StepperProps { 
    currentStep: number; 
    totalSteps: number; 
    handleNavigate: (step: number) => void; 
    isReportComplete: boolean;
    isDiagnosticoCompleto?: boolean; // Opcional: puedes pasarla como prop extra
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, handleNavigate, isReportComplete }) => {
    const stepNames = ["Introducción", "Datos", "Cuestionario", "Resultados"];
    const currentStepIndex = currentStep - 1;

    return (
        <div className="stepper-container">
            {stepNames.map((name, index) => {
                // Lógica de habilitación basada en props recibidas
                const isStepAccessible = 
                    index <= 1 || // Pasos 1 y 2 siempre accesibles
                    (index === 2 && (currentStep >= 2)) || // Paso 3 si ya pasó por el 2
                    (index === 3 && isReportComplete);     // Paso 4 solo si el reporte está listo

                return (
                    <div 
                        key={index} 
                        className="stepper-step" 
                        onClick={() => isStepAccessible && handleNavigate(index + 1)}
                        style={{ 
                            pointerEvents: isStepAccessible ? 'auto' : 'none',
                            opacity: isStepAccessible ? 1 : 0.5 // Recomendado para feedback visual
                        }} 
                    >
                        <div className={`step-number ${currentStepIndex >= index ? 'active' : ''}`}>
                            {index + 1}
                        </div>
                        <div className={`step-label ${currentStepIndex >= index ? 'active' : ''}`}>
                            {name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- COMPONENTE FORMULARIO DE CONTACTO (OPTIMIZADO PARA SPLIT SCREEN EN TABLET) ---
interface ContactFormProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
    onSubmit: () => void;
    isLocked: boolean; // <--- Se agrega la propiedad de control
}

const ContactForm: React.FC<ContactFormProps> = ({ userData, setUserData, onSubmit, isLocked }) => { // <--- Se recibe aquí
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- PEGAR DESDE AQUÍ ---
    const toggleSector = (sectorId: string) => {
        if (!sectorId) return;
        setUserData(prev => {
            // Aseguramos que tratamos sector como un arreglo para evitar errores de tipo
            const currentSectors = Array.isArray(prev.sector) ? prev.sector : [];
            const isSelected = currentSectors.includes(sectorId);
            
            return {
                ...prev,
                sector: isSelected 
                    ? currentSectors.filter(id => id !== sectorId) // Si ya existe, lo remueve
                    : [...currentSectors, sectorId]             // Si no existe, lo añade
            };
        });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCountryDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prev => ({ ...prev, aceptaDatos: e.target.checked }));
    };

    const handleSelectCountry = (country: typeof COUNTRIES[0]) => {
        setUserData(prev => ({ ...prev, countryCode: country.code, dialCode: country.dial_code }));
        setIsCountryDropdownOpen(false);
    };

    const selectedCountry = COUNTRIES.find(c => c.code === userData.countryCode) || COUNTRIES.find(c => c.code === 'CO')!;
    const isFormValid = userData.nombre && userData.apellido && userData.empresa && userData.nit && userData.email && userData.whatsapp && userData.sector.length > 0 && userData.tamanoOrganizacion && userData.aceptaDatos;

    const labelStyle = "block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider";
    const inputStyle = "w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 h-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 shadow-sm";

    return (
        /* ==========================================================
        CORRECCIÓN FINAL DE DISEÑO (SPLIT SCREEN ABSOLUTO):
        1. Grid Forzado: 'flex flex-col md:grid md:grid-cols-12' en el contenedor principal.
            Esto obliga a que en pantallas >768px se use el sistema de 12 columnas.
        2. Marketing (Izquierda): 'hidden md:flex md:col-span-5'
            Ocupa 5 de las 12 columnas.
        3. Formulario (Derecha): 'w-full md:col-span-7'
            Ocupa las 7 columnas restantes.
        4. Max Width: 'max-w-7xl' para expandirse en pantallas 1080p.
        ========================================================== */
        <div className="flex flex-col md:grid md:grid-cols-12 w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
            
            {/* 1. PANEL MARKETING (IZQUIERDA - 5 COLUMNAS) */}
            <div className="hidden md:flex md:col-span-5 bg-slate-950 p-6 md:p-8 lg:p-10 flex-col justify-between relative border-r border-slate-800 h-full">
                {/* Elementos Decorativos de Fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center py-1.5 px-3 bg-blue-500/10 rounded-full border border-blue-500/20 mb-8 backdrop-blur-sm">
                        <Compass className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-[10px] font-bold text-blue-300 tracking-widest uppercase">Diagnóstico Empresarial</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight">
                        Genera y valida tu <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Potencial Textil</span>
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-10 border-l-2 border-blue-500/30 pl-4">
                        ¡Deja de perder dinero en procesos manuales! Hoy, las empresas líderes utilizan datos para optimizar su cadena de producción.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-start group">
                            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition-colors mr-4 shrink-0 shadow-lg">
                                <TrendingUp className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors mt-1">Optimización Real</h4>
                                <p className="text-sm text-slate-500 mt-1">Detecta ineficiencias automáticamente.</p>
                            </div>
                        </div>
                        <div className="flex items-start group">
                            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700 group-hover:border-green-500/50 transition-colors mr-4 shrink-0 shadow-lg">
                                <ShieldCheck className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg group-hover:text-green-300 transition-colors mt-1">Datos Seguros</h4>
                                <p className="text-sm text-slate-500 mt-1">Tu información está encriptada y segura.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                        <p className="text-sm text-slate-400 italic leading-relaxed">
                            "Lo que no se mide, no se puede mejorar."
                        </p>
                        <p className="text-xs text-slate-500 font-bold mt-2 text-right">- Peter Drucker</p>
                    </div>
                </div>
            </div>

            {/* 2. PANEL FORMULARIO (DERECHA - 7 COLUMNAS) */}
            <div className="w-full md:col-span-7 p-6 md:p-8 lg:p-12 bg-slate-900 flex flex-col justify-center relative h-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Configura tu Perfil</h2>
                    <p className="text-slate-400 text-sm">Completa los campos para iniciar el diagnóstico.</p>
                </div>

                {/* FORMULARIO GRID: 2 COLUMNAS (Responsive) */}
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* CAMPO 1: NOMBRE */}
                    <div className="space-y-1">
                        <label className={labelStyle}>Nombres <span className="text-blue-500">*</span></label>
                        <input 
    name="nombre" 
    value={userData.nombre} 
    onChange={handleChange} 
    type="text" 
    className={inputStyle} 
    placeholder="Tus nombres" 
    required 
    disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
/>
                    </div>

                    {/* CAMPO 2: APELLIDO */}
                    <div className="space-y-1">
                        <label className={labelStyle}>Apellidos <span className="text-blue-500">*</span></label>
                        <input 
                            name="apellido" 
                            value={userData.apellido} 
                            onChange={handleChange} 
                            type="text" 
                            className={inputStyle} 
                            placeholder="Tus apellidos" 
                            required 
                            disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
                        />
                    </div>

                    {/* CAMPO 3: CARGO */}
                    <div className="space-y-1">
                        <label className={labelStyle}>Cargo / Puesto <span className="text-blue-500">*</span></label>
                        <input 
                            name="cargo" 
                            value={userData.cargo} 
                            onChange={handleChange} 
                            type="text" 
                            className={inputStyle} 
                            placeholder="Ej: Gerente de Planta" 
                            required
                            disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
                        />
                    </div>

                    {/* CAMPO 4: EMPRESA */}
                    <div className="space-y-1">
                        <label className={labelStyle}>Empresa <span className="text-blue-500">*</span></label>
                        <input 
                            name="empresa" 
                            value={userData.empresa} 
                            onChange={handleChange} 
                            type="text" 
                            className={inputStyle} 
                            placeholder="Organización" 
                            required 
                            disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
                        />
                    </div>

                    {/* CAMPO 5: EMAIL */}
                    <div className="space-y-1">
                        <label className={labelStyle}>Correo Corporativo <span className="text-blue-500">*</span></label>
                        <input 
                            name="email" 
                            value={userData.email} 
                            onChange={handleChange} 
                            type="email" 
                            className={inputStyle} 
                            placeholder="nombre@empresa.com" 
                            required 
                            disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
                        />
                    </div>

                    {/* CAMPO 6: TELÉFONO (COMPLEJO CON DROPDOWN) */}
                    <div ref={dropdownRef} className="relative space-y-1">
                        <label className={labelStyle}>Número de Teléfono <span className="text-blue-500">*</span></label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="h-12 w-20 shrink-0 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-1 hover:bg-slate-750 transition-colors text-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            >
                                <span className="text-xl leading-none">{selectedCountry.flag}</span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                            
                            {isCountryDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn">
                                    <div className="sticky top-0 bg-slate-800 p-2 border-b border-slate-700 z-10">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Selecciona País</span>
                                    </div>
                                    {COUNTRIES.map((c) => (
                                        <div key={c.code} onClick={() => handleSelectCountry(c)} className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors">
                                            <span className="text-2xl">{c.flag}</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{c.name}</span>
                                                <span className="text-xs text-slate-400">{c.dial_code}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex-1 relative h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                                <div className="h-full px-3 flex items-center justify-center text-slate-400 font-medium text-sm bg-slate-800/50 select-none border-r border-slate-700/50">
                                    {userData.dialCode}
                                </div>
                                <input
                                    name="whatsapp"
                                    value={userData.whatsapp}
                                    onChange={handleChange}
                                    type="tel"
                                    className="w-full h-full bg-transparent border-none text-white px-3 focus:ring-0 outline-none placeholder:text-slate-600 font-medium"
                                    placeholder="300 123 4567"
                                    required
                                    disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                {/* CAMPO 7: SECTORES ECONÓMICOS (MULTI-SELECCIÓN) */}
<div className="md:col-span-2 space-y-1">
    <label className={labelStyle}>Actividades Económicas (CIIU) <span className="text-blue-500">*</span></label>
<div className="bg-slate-800 border border-slate-700 rounded-xl p-3 min-h-14 transition-all focus-within:border-blue-500 shadow-inner">
        
        {/* Visualización de etiquetas seleccionadas */}
        <div className="flex flex-wrap gap-2 mb-3">
            {userData.sector.length > 0 ? (
                userData.sector.map(id => {
                    const s = SECTORES_ECONOMICOS.find(sec => sec.id === id);
                    return (
                        <span key={id} className="bg-blue-600/30 text-blue-100 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-blue-500/50 flex items-center gap-2 animate-fadeIn">
                            {s?.id} - {s?.label.split(' - ')[1]}
                            <button 
                                type="button" 
                                onClick={() => toggleSector(id)} 
                                className="hover:text-red-400 text-lg leading-none"
                            >
                                &times;
                            </button>
                        </span>
                    );
                })
            ) : (
                <span className="text-slate-600 text-sm py-1">Seleccione una o varias actividades...</span>
            )}
        </div>

        {/* Selector para añadir nuevos códigos */}
        <div className="relative">
            <select 
                className="w-full bg-slate-700/50 text-white border-none rounded-lg px-4 h-10 outline-none cursor-pointer appearance-none text-sm"
                value=""
                onChange={(e) => toggleSector(e.target.value)}
            >
                <option value="">+ Vincular código CIIU adicional...</option>
                {SECTORES_ECONOMICOS
                    .filter(s => !userData.sector.includes(s.id))
                    .map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                            {s.label}
                        </option>
                    ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
    <p className="text-[10px] text-slate-500 mt-1 ml-1 italic">Haga clic en el menú para agregar más actividades a su perfil operativo.</p>
</div>

{/* FILA AGRUPADA: NIT Y TAMAÑO DE ORGANIZACIÓN - CORRECCIÓN DE RETÍCULA */}
{/* ESTA ES LA PARTE QUE SOLUCIONA TU PROBLEMA: NIT AL LADO DE TAMAÑO */}
<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
    {/* COLUMNA IZQUIERDA: NIT */}
    <div className="space-y-1">
        <label className={labelStyle}>NIT / RUC <span className="text-blue-500">*</span></label>
        <input 
            name="nit" 
            value={userData.nit} 
            onChange={handleChange} 
            type="text" 
            className={inputStyle} 
            placeholder="Identificación tributaria" 
            required 
            disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
        />
    </div>

    {/* COLUMNA DERECHA: TAMAÑO DE LA ORGANIZACIÓN */}
    <div className="space-y-1">
        <label className={labelStyle}>Tamaño de la Organización <span className="text-blue-500">*</span></label>
        <div className="relative">
            <select 
                name="tamanoOrganizacion" 
                value={userData.tamanoOrganizacion} 
                onChange={handleChange} 
                className={`${inputStyle} appearance-none cursor-pointer`} 
                required
                disabled={isLocked} // <--- Bloquea la escritura si isLocked es true
            >
                <option value="" className="text-slate-500">Seleccione el tamaño...</option>
                <option value="Microempresa">Microempresa (1-10 personas)</option>
                <option value="Pequeña empresa">Pequeña empresa (11-50 personas)</option>
                <option value="Mediana empresa">Mediana empresa (51-200 personas)</option>
                <option value="Gran empresa">Gran empresa (más de 200 personas)</option>
            </select>
            <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-500 pointer-events-none" />
        </div>
    </div>
</div>

{/* CHECKBOX (SPAN 2 COLUMNAS) - DISEÑO ULTRA-ILUMINADO NEÓN CORREGIDO */}
<div className="md:col-span-2 pt-4">
    <label className="flex items-start space-x-4 cursor-pointer group select-none">
        <div className="relative flex items-center pt-1">
            <input 
                type="checkbox" 
                checked={userData.aceptaDatos} 
                onChange={handleCheckboxChange} 
                className="peer appearance-none h-7 w-7 border-2 border-cyan-300 rounded-full bg-slate-900/80 checked:bg-green-500 checked:border-green-400 focus:ring-0 transition-all duration-300 cursor-pointer relative z-10 
                disabled={isLocked} // <--- Bloquea el check
                /* ILUMINACIÓN PERMANENTE CIAN */
                shadow-[0_0_20px_rgba(34,211,238,0.8),inset_0_0_10px_rgba(34,211,238,0.2)] 
                /* CAMBIO A ILUMINACIÓN VERDE AL SELECCIONAR */
                peer-checked:shadow-[0_0_30px_rgba(34,197,94,1),inset_0_0_10px_rgba(255,255,255,0.4)]" 
            />
            {/* ICONO DE CHULITO CON SINTAXIS CORREGIDA A stroke-2 */}
            <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white stroke-2 opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-50 peer-checked:scale-110 z-20" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm text-slate-100 group-hover:text-white transition-colors leading-tight pt-1.5 font-bold">
                Acepto recibir comunicaciones de Producir-TE y autorizo el tratamiento de datos. <span className="text-cyan-400 animate-pulse">*</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Campo obligatorio para continuar</span>
        </div>
    </label>
</div>

                    {/* BOTÓN (SPAN 2 COLUMNAS) */}
                    <div className="md:col-span-2 pt-4">
                        <button type="submit" disabled={!isFormValid} className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center text-base shadow-lg ${isFormValid ? 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] hover:shadow-blue-600/25 active:scale-[0.99]' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}>
                            Continuar al Cuestionario <ChevronRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- SECCIÓN COLAPSABLE REDISEÑADA (Alineación Horizontal) ---
interface CollapsibleSectionProps {
    seccion: Seccion;
    respuestas: Record<string, number>;
    onRespuestaSeleccionada: (questionId: string, value: number) => void;
    isActive: boolean;
    onToggle: (sectionId: string) => void; 
    onNextSection: () => void;
    isLastSection: boolean;
    totalPreguntas: number;
    getPuntosPorRespuesta: (value: number) => number;
    isProcessingReport: boolean;
    handleVerReporte: () => void;
    shouldScroll: boolean; 
    isLocked: boolean;
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

// --- SECCIÓN COLAPSABLE REDISEÑADA (Alineación Horizontal Forzada) ---
interface CollapsibleSectionProps {
    seccion: Seccion;
    respuestas: Record<string, number>;
    onRespuestaSeleccionada: (questionId: string, value: number) => void;
    isActive: boolean;
    onToggle: (sectionId: string) => void; 
    onNextSection: () => void;
    isLastSection: boolean;
    totalPreguntas: number;
    getPuntosPorRespuesta: (value: number) => number;
    isProcessingReport: boolean;
    handleVerReporte: () => void;
    shouldScroll: boolean; 
    isLocked: boolean;
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
    seccion, 
    respuestas, 
    onRespuestaSeleccionada, 
    isActive, 
    onToggle, 
    onNextSection,
    isLastSection,
    isProcessingReport,
    handleVerReporte,
    shouldScroll,
    isLocked,
    userData,
    setUserData
}) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isFirstRenderRef = useRef(true);
    const numPreguntas = seccion.preguntas.length;

    const numRespondidas = seccion.preguntas.filter(p => {
    // Si la pregunta es la de expectativas, miramos el campo de texto en userData
    if (p.id === 'expectativas') {
        return userData.expectativas && userData.expectativas.trim().length > 0;
    }
    // Para las demás, seguimos mirando el objeto de respuestas numéricas
    return respuestas[p.id] > 0;
}).length;

    const isCompleted = numRespondidas === numPreguntas;
    const progresoPorcentaje = Math.round((numRespondidas / numPreguntas) * 100);
    
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return; 
        }
        if (isActive && shouldScroll && sectionRef.current) {
            setTimeout(() => {
                sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [isActive, shouldScroll]);

    return (
        <div 
            ref={sectionRef} 
            className={`bg-slate-900 border-slate-800 shadow-xl rounded-xl mb-4 overflow-hidden transition-all duration-300 backdrop-blur-sm 
                        ${isActive ? 'border border-blue-400' : isCompleted ? 'border border-green-500/50' : 'border border-slate-800'}`}
        >
            {/* CABECERA */}
            <div 
                className={`p-4 flex justify-between items-center cursor-pointer transition-all duration-200 border-b 
                            ${isActive ? 'bg-slate-800 border-blue-400/50' : 'bg-slate-800/70 border-slate-800 hover:bg-slate-800'}`}
                onClick={() => onToggle(seccion.id)} 
            >
                <div className="flex items-center">
                    {isCompleted ? <Check className="w-5 h-5 mr-3 text-green-400" /> : <Info className="w-5 h-5 mr-3 text-yellow-400" />}
                    <h3 className="text-lg font-semibold text-white">{seccion.titulo}</h3>
                    <span className={`ml-2 text-sm font-medium ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                        ({numRespondidas} / {numPreguntas})
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
            </div>

            {/* CONTENIDO */}
            <div 
                className="transition-all duration-500 ease-in-out"
                style={{ 
                    maxHeight: isActive ? '3500px' : '0', 
                    padding: isActive ? '1.5rem' : '0 1.5rem', 
                    visibility: isActive ? 'visible' : 'hidden',
                    opacity: isActive ? 1 : 0, 
                    overflow: 'hidden' 
                }} 
            >
                {/* PROGRESO INTERNO */}
                <div className="p-3 border border-slate-700 rounded-lg bg-slate-800/20 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-400">Progreso de la Sección:</span>
                        <span className="text-sm font-bold text-blue-400">{progresoPorcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="h-3 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${progresoPorcentaje}%` }}></div>
                    </div>
                </div>

{/* LISTADO DE PREGUNTAS RESPONSIVO ACTUALIZADO */}
{seccion.preguntas.map((pregunta, index) => {
    const isTextField = pregunta.tipo === 'text';
    const isAnswered = isTextField 
        ? (userData.expectativas && userData.expectativas.trim().length > 0) 
        : (respuestas[pregunta.id] !== undefined && respuestas[pregunta.id] !== null && respuestas[pregunta.id] > 0);

    return (
        <div key={pregunta.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 mb-4 hover:border-slate-500 transition-colors shadow-sm"> 
            
            {/* CONTENEDOR FLEX: En PC (md:flex-row) las respuestas van al frente. En móvil se apilan. */}
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full`}>
                
                {/* Bloque de Texto de la Pregunta (Ocupa 75% en PC para dejar espacio a la respuesta) */}
                <div className={`flex items-start ${isTextField ? 'w-full' : 'w-full md:max-w-[70%]'}`}>
                    <div className="shrink-0 flex items-center pt-1 mr-4">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tighter mr-2">P{index + 1}</span>
                        {isAnswered ? (
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        )}
                    </div>
                    <p className="text-sm sm:text-base text-white font-bold leading-snug wrap-break-word">
                        {pregunta.afirmacion}
                    </p>
                </div>

                {/* Bloque de Respuesta: Alineado a la derecha y al frente en PC */}
                <div className={`w-full ${isTextField ? 'mt-3' : 'md:w-auto flex justify-center md:justify-end mt-2 md:mt-0'}`}>
                    {isTextField ? (
                        <textarea 
                            value={userData.expectativas || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, expectativas: e.target.value }))}
                            placeholder="Describa sus cuellos de botella y lo que espera lograr con la ruta nexo..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm min-h-30 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner resize-none"
                            disabled={isLocked}
                        />
                    ) : (
                        <div className="flex items-center w-full md:w-auto">
                            {pregunta.tipo === 'number' || pregunta.tipo === 'percent' ? (
                                <div className="relative w-full md:w-52">
                                    <input 
                                        type="text"
                                        value={pregunta.tipo === 'percent' ? (respuestas[pregunta.id] || '') : formatInputCurrency(respuestas[pregunta.id] || '')}
                                        onChange={(e) => onRespuestaSeleccionada(pregunta.id, Number(e.target.value.replace(/\D/g, '')))}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 h-11 text-right font-bold text-white outline-none focus:border-blue-500 text-sm sm:text-base shadow-inner"
                                        placeholder={pregunta.tipo === 'percent' ? "0" : "$ 0"}
                                        disabled={isLocked}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                                        {pregunta.tipo === 'percent' ? '%' : 'COP'}
                                    </span>
                                </div>
                            ) : (
                                <PuntuacionSelector 
                                    valorActual={respuestas[pregunta.id] || 0} 
                                    onSelect={(val) => onRespuestaSeleccionada(pregunta.id, val)} 
                                    disabled={isLocked} 
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
})}
                
                {/* BOTÓN FINAL DE SECCIÓN: Adaptado para móvil */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end pt-6 border-t border-slate-800/50 mt-6 gap-4">
                    {isLastSection ? (
                        <button
    className={`h-14 w-full sm:min-w-80 px-8 rounded-xl font-black transition-all duration-500 flex items-center justify-center border-2
        ${!isCompleted || isProcessingReport
            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
            : 'bg-[#4ade80] text-black border-white shadow-[0_0_25px_rgba(74,222,128,0.6)] hover:bg-[#22c55e] hover:text-white active:scale-95'
        }
    `}
    onClick={handleVerReporte} 
    disabled={!isCompleted || isProcessingReport}
>
                            {isProcessingReport ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generando Informe...</>
                            ) : (
                                <><Trophy className="w-5 h-5 mr-2" /> Finalizar y Enviar Reporte</>
                            )}
                        </button>
                    ) : (
                        <button 
                            type="button"
                            onClick={onNextSection} 
                            className={`h-11 w-full sm:w-auto px-8 rounded-xl btn-primary-gradient text-white font-bold flex items-center justify-center transition-all ${!isCompleted ? 'opacity-50 pointer-events-none' : 'hover:scale-105 shadow-lg shadow-blue-500/20 active:scale-95'}`}
                        >
                            Continuar <ChevronRight className="ml-2 w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (DiagnosticoNexo) ---
const formatInputCurrency = (value: number | string) => {
    if (!value || value === 0) return '';
    const num = value.toString().replace(/\D/g, '');
    return '$ ' + new Intl.NumberFormat('es-CO').format(Number(num));
};

// === 1. CONSTANTE (FUERA DEL COMPONENTE) ===
const PRODUCTIVITY_QUOTES = [
    { text: "La eficiencia operativa es la tela con la que se corta el éxito en la industria textil.", author: "Producir-TE" },
    { text: "En la manufactura, el tiempo es el hilo más costoso; no permitas que se enrede.", author: "Experto Nexo" },
    { text: "Lo que no se mide en la hilatura, se pierde irremediablemente en la tejeduría.", author: "Peter Drucker (Adaptado)" },
    { text: "La verdadera innovación no está solo en la fibra, sino en la optimización del ciclo.", author: "Amancio Ortega" },
    { text: "Un módulo balanceado es el secreto detrás de una prenda perfecta y rentable.", author: "Ruta Nexo" },
    { text: "Reducir el desperdicio en el corte es aumentar directamente tu margen de utilidad.", author: "Lean Textile" }
];

export const DiagnosticoNexo: React.FC = () => {
    // === 2. HOOKS Y REFERENCIAS ===
    const { ejecutarMotorNexo, isProcessingIA } = useGemini();
    const resultadosRef = useRef<HTMLElement>(null);
    const brechasRef = useRef<HTMLDivElement>(null);

    // === 3. DECLARACIÓN ÚNICA DE ESTADOS ===
    const [iaData, setIaData] = useState<any>(null);
    const [metricasEconomicas, setMetricasEconomicas] = useState<any>(null);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [reporteData, setReporteData] = useState<NexoReporte | null>(null);
    const [respuestas, setRespuestas] = useState<Record<string, number>>({});
    
    // Navegación y Control
    const [showForm, setShowForm] = useState(false);
    const [showDiagnostico, setShowDiagnostico] = useState(false);
    const [showReporte, setShowReporte] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isProcessingReport, setIsProcessingReport] = useState(false);
    const [reporteGeneradoExitosamente, setReporteGeneradoExitosamente] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    // UI y Efectos Visuales
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [scrollTrigger, setScrollTrigger] = useState<boolean>(false);
    const [activeBrecha, setActiveBrecha] = useState<'operacional' | 'produccion' | 'procesos' | null>(null);
    const [isBackButtonHovered, setIsBackButtonHovered] = useState(false);
    const [isNoHovered, setIsNoHovered] = useState(false);
    const [isSiHovered, setIsSiHovered] = useState(false);

    const [userData, setUserData] = useState<UserData>({
        nombre: '', apellido: '', cargo: '', empresa: '', nit: '', whatsapp: '', 
        countryCode: 'CO', dialCode: '+57', email: '', sector: [], 
        tamanoOrganizacion: '', aceptaDatos: false,
    expectativas: '' // <-- AÑADIR ESTA LÍNEA
    });

    // === 4. EFECTOS (useEffect) ===
    useEffect(() => {
        initializeEmailJS();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessingReport) {
            interval = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % PRODUCTIVITY_QUOTES.length);
            }, 4500);
        }
        return () => clearInterval(interval);
    }, [isProcessingReport]);

    // === 5. FUNCIONES LÓGICAS ===
    const getPuntosPorRespuesta = useCallback((valor: number): number => {
        if (valor >= 1 && valor <= 3) {
            return PUNTOS_POR_RESPUESTA[valor - 1];
        }
        return 0;
    }, []);

    const calcularPuntajeLocal = useMemo(() => {
        let score = 0;
        preguntas.forEach(p => {
            if (p.tipo !== 'number') {
                const respuestaValor = respuestas[p.id];
                if (respuestaValor) {
                    score += getPuntosPorRespuesta(respuestaValor);
                }
            }
        });
        return score;
    }, [respuestas, getPuntosPorRespuesta]);

const totalRespuestasDadas = useMemo(() => {
    // 1. Contamos respuestas p1 a p20 + las 3 de la Cat VII (ingresos, costos, desperdicio)
    // Usamos Number(val) > 0 para asegurar que campos vacíos o ceros no sumen al total
    const tecnicasRespondidas = Object.entries(respuestas).filter(([id, val]) => 
        (id.startsWith('p') || id.startsWith('VII_')) && Number(val) > 0
    ).length;

    // 2. Verificamos que 'expectativas' tenga contenido real (mínimo 3 caracteres para evitar espacios accidentales)
    const expectativasRespondida = (userData.expectativas && userData.expectativas.trim().length >= 3) ? 1 : 0;

    return tecnicasRespondidas + expectativasRespondida;
}, [respuestas, userData.expectativas]);

// EL CAMBIO CLAVE: Comparamos contra el número exacto de preguntas configuradas (24)
const isDiagnosticoCompleto = totalRespuestasDadas === preguntas.length;

// Solo permitir acceso al reporte si el diagnóstico está 100% completo
const isReporteDisponible = isDiagnosticoCompleto && (reporteData !== null || iaData !== null);

// LÓGICA DE STEPPER
let currentStepperStep = 1;
if (showForm) currentStepperStep = 2;
else if (showDiagnostico && !showReporte) currentStepperStep = 3;
else if (showReporte) currentStepperStep = 4;

useEffect(() => {
    if (scrollTrigger) {
        const timeout = setTimeout(() => setScrollTrigger(false), 50); 
        return () => clearTimeout(timeout);
    }
    if (showReporte && activeBrecha && brechasRef.current) {
        requestAnimationFrame(() => {
            brechasRef.current!.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}, [showDiagnostico, activeSectionId, scrollTrigger, showReporte, activeBrecha]); 

const handleBrechaToggle = (brechaType: 'operacional' | 'produccion' | 'procesos') => {
    if (brechaType === activeBrecha) {
        setActiveBrecha(null);
    } else {
        setActiveBrecha(brechaType);
    }
};

const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount).replace('.00', '');
};

const determineNivelMadurez = (porcentaje: number): NexoReporte['nivelMadurez'] => {
    if (porcentaje >= 80) return 'Experto';
    if (porcentaje >= 51) return 'Avanzado';
    if (porcentaje >= 30) return 'Intermedio';
    return 'Principiante';
};

const calcularNivelActual = () => {
    const p = Math.min(100, Math.round((totalRespuestasDadas / preguntas.length) * 100));
    if (p === 100) return 'Completado';
    if (p > 75) return 'Avanzado';
    if (p > 50) return 'Intermedio';
    if (p > 25) return 'Principiante';
    return 'Básico';
}

const generarMetricasBase = (puntaje: number): EconomicMetrics => {
    const puntuacionPorcentaje = Math.min(100, puntaje);
    const potencialMejora = 100 - puntuacionPorcentaje;
    
   const sectorIdPrincipal = userData.sector.length > 0 ? userData.sector[0] : 'OTRO';
const sectorSeleccionado = SECTORES_ECONOMICOS.find(s => s.id === sectorIdPrincipal) || SECTORES_ECONOMICOS[4]; 
    const baseCostosUSD = sectorSeleccionado.baseCostos; 
    const baseAhorro = baseCostosUSD * sectorSeleccionado.factorMejora;
    const baseROI = 250;
    const baseRecuperacion = 7.5; 
    const basePotencial = 35; 
    
    const factor = potencialMejora / basePotencial;
    
    const ahorroAnualPotencial = Math.round(baseAhorro * factor);
    const roiEsperado = Math.round(baseROI * factor);
    const recuperacionMeses = Math.round(baseRecuperacion / factor); 

    return {
        puntuacionPorcentaje,
        ahorroAnualPotencial: ahorroAnualPotencial, 
        roiEsperado: Math.min(roiEsperado, 400),
        recuperacionMeses: Math.min(Math.max(6, recuperacionMeses), 18), 
        baseSolida: puntuacionPorcentaje >= 51,
        potencialMejora,
    };
};

const handleRespuestaSeleccionada = (questionId: string, value: number) => {
    setRespuestas(prev => ({ ...prev, [questionId]: value }));
};

const handleToggleSection = (sectionId: string) => {
    if (sectionId === activeSectionId) {
        setActiveSectionId(null);
        setScrollTrigger(false); 
    } else {
        setActiveSectionId(sectionId);
        setScrollTrigger(true);
    }
};

const handleNavigate = (step: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (step === 1) { // Inicio
        setShowForm(false);
        setShowDiagnostico(false);
        setShowReporte(false);
    } else if (step === 2) { // Formulario
        setShowForm(true);
        setShowDiagnostico(false);
        setShowReporte(false);
    } else if (step === 3 && (isFormValid() || showDiagnostico)) { // Cuestionario
        setShowForm(false);
        setShowDiagnostico(true);
        setShowReporte(false);
        setActiveBrecha(null); 
        setActiveSectionId(null); 
        setTimeout(() => {
            document.getElementById('preguntas-seccion')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
 // Se agrega (iaData || ...) para que si ya existen datos, permita entrar siempre.
} else if (step === 4 && (iaData || isReporteDisponible)) { 
    setShowForm(false);
    setShowDiagnostico(false);
    setShowReporte(true);
    setActiveBrecha(null); 
}
};

const handleNextSection = () => {
    const currentIndex = secciones.findIndex(s => s.id === activeSectionId);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < secciones.length) {
        setActiveSectionId(secciones[nextIndex].id);
        setScrollTrigger(true);
    } else {
        setActiveSectionId(null);
        setScrollTrigger(false);
    }
};

const handleComenzarAventura = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowForm(true); // AHORA VA AL FORMULARIO
    setShowDiagnostico(false);
    setShowReporte(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

const handleContactSubmit = () => {
    setShowForm(false);
    setShowDiagnostico(true);
    setActiveSectionId(null);
    setTimeout(() => {
        document.getElementById('preguntas-seccion')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

const isFormValid = () => {
    return userData.nombre && userData.apellido && userData.empresa && userData.nit && userData.email && userData.whatsapp && userData.sector.length > 0 && userData.tamanoOrganizacion && userData.aceptaDatos;
};

const handleVerReporte = () => {
    // NUEVA VALIDACIÓN: Si ya se generó exitosamente, mostrar mensaje y no continuar.
    if (reporteGeneradoExitosamente) {
        alert("El reporte ya fue generado, y se ha enviado al correo con éxito. Producir-TE te enviará posteriormente los resultados de tu diagnóstico. Gracias por querer descubrir el potencial oculto de tu operación textil");
        return;
    }

    if (!isDiagnosticoCompleto) {
        alert('¡Atención! Por favor, responde las 20 preguntas para ver tu reporte completo.');
        return;
    }
    setShowConfirmModal(true); 
};

// NUEVA FUNCIÓN PARA EL CLIC EN LA TARJETA DE "RECIBE UN REPORTE" (HEADER)
const handleReporteCardClick = () => {
    if (reporteGeneradoExitosamente) {
        alert("El reporte ya fue generado, y se ha enviado al correo con éxito. Producir-TE te enviará posteriormente los resultados de tu diagnóstico. Gracias por querer descubrir el potencial oculto de tu operación textil");
    } else {
        alert("Por favor, complete todas las secciones para generar el diagnóstico.");
    }
};

const handleConfirmarFinalizacion = async () => {
    setShowConfirmModal(false);
    setIsProcessingReport(true); 

    try {
        const analisisIA = await ejecutarMotorNexo(respuestas, userData);

        if (analisisIA && !analisisIA.error) {
            setMetricasEconomicas(analisisIA.metricas);
            setIaData(analisisIA); 

            setShowDiagnostico(false);
            setShowReporte(true);

            setTimeout(() => {
                const seccionResultados = document.getElementById('resultados-seccion');
                if (seccionResultados) {
                    seccionResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
                // Iniciamos la generación y envío
                setTimeout(() => {
                    handleGeneratePDFReport(analisisIA); 
                }, 800); 

            }, 100);

        } else {
            alert("El Motor Nexo no pudo procesar los datos. Reintente.");
        }
    } catch (error) {
        console.error("Error crítico:", error);
        alert("Ocurrió un error al procesar el diagnóstico.");
    } finally {
        setIsProcessingReport(false);
    }
};

const handleGeneratePDFReport = (directData?: any) => {
    if (reporteGeneradoExitosamente || isPdfGenerating) return;

    const dataDisponible = directData || iaData || reporteData;
    if (!dataDisponible) return;
    
    setIsPdfGenerating(true);
    const pdfWorker = new Worker('/pdf.worker.js');

    const metricasParaWorker = {
        ahorroAnualPotencial: directData?.metricas?.ahorroAnualPotencial || metricasEconomicas?.ahorroAnualPotencial || 0,
        roiEsperado: directData?.metricas?.roiEsperado || metricasEconomicas?.roiEsperado || 0,
        recuperacionMeses: directData?.metricas?.recuperacionMeses || metricasEconomicas?.recuperacionMeses || 0
    };

pdfWorker.onmessage = async (event: MessageEvent) => {
    const { status, pdfBase64 } = event.data;
    const pdfFileName = `Nexo_${userData.empresa.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

    if (status === 'completed' && pdfBase64) {
        try {
            // 1. Convertir Base64 a Blob (archivo real)
            const pdfBlob = await (await fetch(pdfBase64.startsWith('data:') ? pdfBase64 : `data:application/pdf;base64,${pdfBase64}`)).blob();

            // 2. Inicializar Supabase en el Cliente
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // 3. Subir directamente al Bucket (Esto evita el límite de Vercel)
            const filePath = `reports/${Date.now()}_${pdfFileName}`;
            const { error: uploadError } = await supabase.storage
                .from('nexo-reports')
                .upload(filePath, pdfBlob);

            if (uploadError) throw uploadError;

            // 4. Obtener URL Pública
            const { data: { publicUrl } } = supabase.storage.from('nexo-reports').getPublicUrl(filePath);

            // 5. Enviar solo la URL al servidor (Petición liviana de texto)
            const response = await fetch('/api/diagnostico-envio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    publicUrl, 
                    userEmail: userData.email,
                    userName: `${userData.nombre} ${userData.apellido}` 
                }),
            });

            if (response.ok) {
                setReporteGeneradoExitosamente(true);
            } else {
                throw new Error("Error al procesar el envío del correo");
            }
        } catch (error: any) {
            console.error('Error:', error);
            alert("Error: " + error.message);
        } finally {
            setIsPdfGenerating(false);
            pdfWorker.terminate();
        }
    }
};

    pdfWorker.postMessage({ 
        reporteData: JSON.parse(JSON.stringify(dataDisponible)), 
        metricasEconomicas: metricasParaWorker, 
        userData: userData, 
        respuestas: respuestas, 
        tipoReporte: 'Final'
    });
};

const handleBotonClick = (accion: 'agenda' | 'contacto' | 'transformacion') => {
    let mensaje = '';
    if (accion === 'agenda') {
        mensaje = 'Redireccionando a la Agenda para Sesión Inicial Gratuita... (Simulación)';
    } else if (accion === 'contacto') {
        mensaje = 'Redireccionando al Chat de WhatsApp para Contactar a un Asesor... (Simulación)';
    } else if (accion === 'transformacion') {
        mensaje = 'Iniciando Ruta de Transformación Nexo... (Simulación)';
    }
    alert(mensaje);
};

const getBrechaRecomendacion = (brechaKey: 'operacional' | 'produccion' | 'procesos') => {
    if (!reporteData) {
        return {
            brecha: { descripcion: 'Cargando...', impacto: '' },
            recomendacion: { titulo: 'Cargando...', descripcion: '', icon: FileText }
        };
    }
    
    const brechaData = reporteData.brechas[brechaKey];
    let recomendacionTitle = "";
    let recomendacionDesc = "";

    if (brechaKey === 'operacional') {
        recomendacionTitle = DUMMY_REPORT.recomendaciones[1].titulo; 
        recomendacionDesc = DUMMY_REPORT.recomendaciones[1].descripcion;
    } else if (brechaKey === 'produccion') {
        recomendacionTitle = DUMMY_REPORT.recomendaciones[0].titulo; 
        recomendacionDesc = DUMMY_REPORT.recomendaciones[0].descripcion;
    } else if (brechaKey === 'procesos') {
        recomendacionTitle = DUMMY_REPORT.recomendaciones[2].titulo; 
        recomendacionDesc = DUMMY_REPORT.recomendaciones[2].descripcion;
    }
    
    return {
        brecha: brechaData,
        recomendacion: { titulo: recomendacionTitle, descripcion: recomendacionDesc, icon: FileText }
    };
};

return (
    <div className="bg-gray-900 min-h-screen text-white relative">

        {/* --- PANTALLA DE CARGA CON FRASES DE PRODUCTIVIDAD --- */}
        {isProcessingReport && (
            <div 
    className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-fadeIn"
    style={{ zIndex: 100000 }}
>
                
                {/* Iconografía Central (ADN Modular) */}
                <div className="relative mb-12">
                    <div className="w-40 h-40 border-4 border-blue-500/10 rounded-full animate-ping absolute" />
                    <div className="w-40 h-40 border-t-4 border-cyan-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Layers className="w-14 h-14 text-blue-400 animate-pulse" />
                    </div>
                </div>

                <div className="max-w-2xl text-center px-8">
                    {/* Badge de Estado */}
                    <div className="inline-flex items-center justify-center py-1.5 px-3 bg-blue-500/10 rounded-full border border-blue-500/20 mb-8">
                        <Loader2 className="w-3.5 h-3.5 text-blue-400 mr-2 animate-spin" />
                        <span className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">
                            Motor Nexo: Procesando Diagnóstico
                        </span>
                    </div>
                    
                    {/* Frases Dinámicas */}
                    <div className="h-32 flex flex-col justify-center animate-fadeIn" key={quoteIndex}>
                        <p className="text-2xl md:text-3xl font-serif italic text-white leading-tight mb-4">
                            "{PRODUCTIVITY_QUOTES[quoteIndex].text}"
                        </p>
                        <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">
                            — {PRODUCTIVITY_QUOTES[quoteIndex].author}
                        </p>
                    </div>

                    {/* Barra de Progreso Neón */}
                    <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-12 mx-auto overflow-hidden">
                        <div className="h-full bg-linear-to-r from-blue-600 via-cyan-400 to-blue-600 w-full animate-loading-bar shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    </div>
                    
                    <p className="text-slate-600 text-[10px] mt-4 uppercase tracking-tighter">
                        Analizando ineficiencias y calculando ROI potencial...
                    </p>
                </div>
            </div>
        )}

   {/* Renderizado condicional con Estética Original y Logo Producir-TE */}
{!showForm && !showDiagnostico && !showReporte && (
    <header className="py-20 bg-slate-900/80 border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Contenedor flexible para Título y Logo: Fila en PC, Columna en Móvil */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                        <span className="text-[#4da6ff]">Diagnóstico Nexo:</span> <br /> 
                        <span className="text-white md:text-transparent md:bg-clip-text md:bg-linear-to-r md:from-blue-400 md:to-cyan-400">
                            "Tu Ruta de Transformación"
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mt-6 font-medium">
                        Descubre el potencial oculto de tu operación textil
                    </p>
                </div>
                
                {/* Logo ubicado a la derecha en PC, centrado en móvil */}
                <div className="shrink-0">
                    <img 
                        src="/logo-producir-te.png" 
                        alt="Logo Producir-TE" 
                        className="w-44 md:w-80 h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                    />
                </div>
            </div>

            <p className="text-center md:text-center text-lg text-slate-400 mb-16 max-w-4xl mx-auto">
                Conoce a fondo tu cadena de producción con nuestro diagnóstico gamificado. Identifica oportunidades de mejora y recibe recomendaciones personalizadas para optimizar la eficiencia y productividad de tu empresa textil.
            </p>

{/* CONTENEDOR DE TARJETAS: 3 Columnas en PC, 1 Columna en Móvil */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 max-w-7xl mx-auto px-4">
    
    {/* TARJETA 1: COMENZAR (Neón Azul) */}
    <div 
        className="flex flex-col items-center text-center p-10 rounded-3xl bg-slate-800/40 border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-[1.03] cursor-pointer group h-full"
        onClick={handleComenzarAventura}
    >
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
            <Play className="w-10 h-10 fill-current" />
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">Comenzar la Aventura</h3>
        <p className="text-slate-400 text-base leading-relaxed">Responde preguntas clave sobre tu operación.</p>
    </div>

    {/* TARJETA 2: PUNTOS (Neón Verde) */}
    <div 
        className="flex flex-col items-center text-center p-10 rounded-3xl bg-slate-800/40 border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_35px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-[1.03] cursor-pointer group h-full"
        onClick={handleComenzarAventura}
    >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-8 text-green-400 group-hover:bg-green-600 group-hover:text-white transition-all shadow-inner">
            <User className="w-10 h-10" />
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">Acumula Puntos</h3>
        <p className="text-slate-400 text-base leading-relaxed">Cada respuesta te acerca a tu nivel de transformación.</p>
    </div>

    {/* TARJETA 3: REPORTE (Neón Púrpura) */}
    <div 
        className="flex flex-col items-center text-center p-10 rounded-3xl bg-slate-800/40 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-[1.03] cursor-pointer group h-full"
        onClick={handleReporteCardClick}
    >
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-8 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
            <Mail className="w-10 h-10" />
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">Recibe un Reporte</h3>
        <p className="text-slate-400 text-base leading-relaxed">Producir-TE te hará el envío de tu diagnóstico.</p>
    </div>
</div>

{/* BOTÓN DINÁMICO: Centrado en móvil, Derecha en PC */}
<div className="flex justify-center md:justify-center mt-8 px-4">
    <button 
        className="w-full md:w-auto min-w-75 h-14 px-10 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-300 bg-blue-600 shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 active:scale-95 border border-white/10"
        onClick={handleComenzarAventura}
    >
        Comenzar el Diagnóstico
    </button>
</div>
            </div>
        </header>
        )}

    {/* --- SECCIÓN DE FORMULARIO DE CONTACTO (SPLIT SCREEN) --- */}
    {showForm && (
        <section id="form-seccion" className="py-16 animate-fadeIn min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
              <div className="mb-10 pb-6 border-b border-slate-700 relative flex flex-col items-center justify-center">
    
    {/* 1. Botón Atrás (Absoluto a la izquierda) */}
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
            onMouseEnter={() => setIsBackButtonHovered(true)}
            onMouseLeave={() => setIsBackButtonHovered(false)}
            onClick={() => handleNavigate(1)}
            className="flex items-center justify-center transition-all duration-300"
            style={{
                width: '3.5rem', 
                height: '3.5rem',
                borderRadius: '1rem', 
                cursor: 'pointer',
                backgroundColor: isBackButtonHovered ? '#1e293b' : 'rgba(30, 41, 59, 0.4)', 
                border: isBackButtonHovered ? '1px solid #3b82f6' : '1px solid #334155', 
                color: isBackButtonHovered ? '#ffffff' : '#94a3b8', 
                boxShadow: isBackButtonHovered ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none', 
                transform: isBackButtonHovered ? 'scale(1.05)' : 'scale(1)'
            }}
        >
            <ChevronLeft className="w-8 h-8" />
        </button>
    </div>

{/* ENCABEZADO ACTUALIZADO: Título Masivo a la Izquierda y Logo a la Derecha en PC */}
<div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12 px-4 md:px-0">
    <div className="text-center md:text-left flex-1">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.1] tracking-tighter">
            <span className="text-[#4da6ff]">Diagnóstico Nexo:</span> <br /> 
            <span className="text-white md:text-transparent md:bg-clip-text md:bg-linear-to-r md:from-blue-400 md:to-cyan-400">
                "Tu Ruta de Transformación"
            </span>
        </h1>
        <p className="text-xl md:text-3xl text-white font-bold mt-6 text-center md:text-left">
            Datos de Contacto
        </p>
    </div>
    
    <div className="shrink-0">
        <img 
            src="/logo-producir-te.png" 
            alt="Logo Producir-TE" 
            className="w-44 md:w-96 h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
        />
    </div>
</div>

{/* 3. Subtítulo Centrado */}
<p className="text-xl md:text-3xl text-white font-bold text-center">
    Datos de Contacto
</p>
</div>

<Stepper 
    currentStep={currentStepperStep} 
    totalSteps={4} 
    handleNavigate={handleNavigate} 
    isReportComplete={!!iaData || reporteGeneradoExitosamente} 
/>
                <div className="mt-8">
                    <ContactForm 
                        userData={userData} 
                        setUserData={setUserData} 
                        onSubmit={handleContactSubmit} 
                        isLocked={showDiagnostico || showReporte} // <--- Bloquea si ya pasó al cuestionario o al reporte
                    />
                </div>
            </div>
        </section>
    )}

    {showDiagnostico && !showReporte && (
        <section id="preguntas-seccion" className="py-16 animate-fadeIn">
        <div className="max-w-6xl mx-auto px-4">
            
<div className="mb-8 pb-6 border-b border-slate-700 relative flex flex-col items-center justify-center">
    
    {/* 1. Botón Atrás (Absoluto a la izquierda) */}
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
            onMouseEnter={() => setIsBackButtonHovered(true)}
            onMouseLeave={() => setIsBackButtonHovered(false)}
            onClick={() => { 
                setShowDiagnostico(false); 
                setShowForm(true); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }}
            style={{
                width: '3.5rem', 
                height: '3.5rem',
                borderRadius: '1rem', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: isBackButtonHovered ? '#1e293b' : 'rgba(30, 41, 59, 0.4)', 
                border: isBackButtonHovered ? '1px solid #3b82f6' : '1px solid #334155', 
                color: isBackButtonHovered ? '#ffffff' : '#94a3b8', 
                boxShadow: isBackButtonHovered ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none', 
                transform: isBackButtonHovered ? 'scale(1.05)' : 'scale(1)'
            }}
            aria-label="Regresar"
        >
            <ChevronLeft className="w-8 h-8" />
        </button>
    </div>

{/* ENCABEZADO ACTUALIZADO: Título Masivo a la Izquierda y Logo a la Derecha en PC */}
<div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12 px-4 md:px-0">
    <div className="text-center md:text-left flex-1">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.1] tracking-tighter">
            <span className="text-[#4da6ff]">Diagnóstico Nexo:</span> <br /> 
            <span className="text-white md:text-transparent md:bg-clip-text md:bg-linear-to-r md:from-blue-400 md:to-cyan-400">
                "Tu Ruta de Transformación"
            </span>
        </h1>
        <p className="text-xl md:text-3xl text-white font-bold mt-6 text-center md:text-left">
            Cuestionario
        </p>
    </div>
    
    <div className="shrink-0">
        <img 
            src="/logo-producir-te.png" 
            alt="Logo Producir-TE" 
            className="w-44 md:w-96 h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
        />
    </div>
</div>

{/* 3. Subtítulo Forzado */}
<p className="text-xl md:text-3xl text-white font-bold text-center">
    Cuestionario
</p>
</div>

           <Stepper 
    currentStep={currentStepperStep} 
    totalSteps={4} 
    handleNavigate={handleNavigate} 
    // Esto le avisa al Stepper si debe habilitar el último círculo
    isReportComplete={!!iaData || reporteGeneradoExitosamente} 
/>
            
            <div className="game-score-card" style={{ maxWidth: '800px', width: '100%' }}>
                <div className="game-score-title">Puntuación Total Acumulada</div>
                <div className="game-score-value">{calcularPuntajeLocal} / {MAX_PUNTOS}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-lg shadow-xl mb-12">
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div className="text-base font-semibold text-blue-400">Progreso General: {calcularNivelActual()}</div>
                        <div className="text-sm font-semibold text-slate-300">
                            {totalRespuestasDadas} / {preguntas.length} preguntas respondidas
                        </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                        <div 
                            className="h-3 rounded-full bg-blue-500 transition-all duration-500" 
                            style={{ width: `${Math.round((totalRespuestasDadas / preguntas.length) * 100)}%`}}
                        ></div>
                    </div>
                </div>
            </div>
    <div className="space-y-4">
                {secciones.map((seccion, index) => (
                    <CollapsibleSection
                        key={seccion.id}
                        seccion={seccion}
                        respuestas={respuestas}
                        onRespuestaSeleccionada={handleRespuestaSeleccionada}
                        isActive={seccion.id === activeSectionId}
                        onToggle={handleToggleSection} 
                        onNextSection={handleNextSection}
                        isLastSection={index === secciones.length - 1}
                        totalPreguntas={preguntas.length}
                        getPuntosPorRespuesta={getPuntosPorRespuesta}
                        isProcessingReport={isProcessingReport}
                        handleVerReporte={handleVerReporte}
                        shouldScroll={scrollTrigger && seccion.id === activeSectionId}
                        isLocked={reporteGeneradoExitosamente || showReporte}
                        userData={userData}
                        setUserData={setUserData}
                    />
                ))}
            </div>
        </div>
        </section>
    )}

    {/* --- SECCIÓN DE RESULTADOS OCULTA Y UI DE ÉXITO PREMIUM --- */}
    {showReporte && (
        <section id="resultados-seccion" className="py-16 animate-fadeIn min-h-screen flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
                
               {/* 1. DISEÑO PREMIUM DE ÉXITO (Visible solo cuando el reporte se genera/envía) */}
{reporteGeneradoExitosamente ? (
    <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
        <div className="relative mb-12">
            <div className="w-40 h-40 bg-green-500/10 rounded-full animate-ping absolute -inset-4" />
            <div className="w-32 h-32 bg-linear-to-br from-green-400 via-emerald-500 to-green-600 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.4)] flex items-center justify-center transform rotate-6 border border-white/20">
                <CheckCircle className="w-16 h-16 text-white transform -rotate-6" />
            </div>
        </div>

        <div className="max-w-3xl text-center bg-slate-900/80 border border-slate-700 p-12 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
                <div className="inline-flex items-center justify-center py-1.5 px-4 bg-green-500/10 rounded-full border border-green-500/20 mb-8">
                    <span className="text-[10px] font-black text-green-400 tracking-[0.3em] uppercase">
                        Procesamiento Finalizado
                    </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                    ¡Tu Diagnóstico Nexo <br /> 
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400">Ha Sido Enviado con Éxito!</span>
                </h2>
                
                {/* CAMBIO DE TEXTO SOLICITADO */}
                <p className="text-slate-300 text-xl leading-relaxed mb-10 px-6">
                    El reporte ha sido generado. 
                    <span className="block mt-4 text-slate-400 text-lg">
                        Producir-TE socializará los resultados de tu diagnóstico posteriormente. Gracias por querer descubrir el potencial oculto de tu operación textil.
                    </span>
                </p>

<div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="w-full md:w-auto px-10 py-4 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl font-bold transition-all border border-slate-600 flex items-center justify-center group"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Nuevo Diagnóstico
                    </button>

                    <button 
                        onClick={() => {
                            const mensaje = encodeURIComponent(`Hola Producir-TE, acabo de terminar mi Diagnóstico Nexo para la empresa ${userData.empresa} y quiero acceder a mi ruta de optimización y obtener mi bonus especial.`);
                            window.open(`https://wa.me/573153774241?text=${mensaje}`, '_blank');
                        }} 
                        className="w-full md:w-auto px-12 py-4 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-extrabold transition-all shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center"
                    >
                        <div className="flex items-center mb-1">
                            <Phone className="w-5 h-5 mr-2" />
                            <span>Quiero acceder a mi ruta de optimización</span>
                        </div>
                        <span className="text-sm opacity-90 font-bold">y obtener un bonus especial</span>
                    </button>
                </div>
            </div>
        </div>
        <p className="mt-12 text-slate-500 text-sm font-medium tracking-wide text-center">Gracias por confiar en Producir-TE.</p>
    </div>
) : (
/* 4. ESPERA TÉCNICA: Diseño actualizado con Título Masivo + Logo a la derecha en PC */
    <div id="resultados-seccion" className="animate-pulse flex flex-col items-center py-10 md:py-20 min-h-screen">
        <div className="mb-10 pb-6 border-b border-slate-700 relative flex flex-col items-center justify-center w-full px-4 md:px-0">
            
            {/* ENCABEZADO COHERENTE: Mismo estilo que las secciones anteriores */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12 w-full max-w-7xl mx-auto">
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.1] tracking-tighter">
                        <span className="text-[#4da6ff]">Diagnóstico Nexo:</span> <br /> 
                        <span className="text-white md:text-transparent md:bg-clip-text md:bg-linear-to-r md:from-blue-400 md:to-cyan-400">
                            "Tu Ruta de Transformación"
                        </span>
                    </h1>
                </div>
                
                <div className="shrink-0">
                    <img 
                        src="/logo-producir-te.png" 
                        alt="Logo Producir-TE" 
                        className="w-44 md:w-96 h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                    />
                </div>
            </div>
            
            {/* BLOQUE DE CARGA: Se mantiene centrado para enfoque visual */}
            <div className="flex flex-col items-center gap-6 mt-4">
                <p className="text-xl md:text-3xl text-white font-bold italic text-center">Generando Documentación Técnica...</p>
                <div className="w-full max-w-xs md:max-w-md h-3 bg-slate-900 rounded-full overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.6)] border border-cyan-500/30">
                    <div className="h-full bg-linear-to-r from-cyan-500 via-white to-cyan-500 w-full animate-loading-bar shadow-[0_0_15px_#fff]" />
                </div>
                <span className="text-slate-500 text-[10px] uppercase tracking-widest animate-pulse">
                    Por favor, no cierre esta ventana
                </span>
            </div>
        </div>
        <Stepper currentStep={4} totalSteps={4} handleNavigate={handleNavigate} isReportComplete={true} />
    </div> 
)}

        {/* 3. RENDERIZADO TÉCNICO INVISIBLE */}
        <div className="invisible h-0 w-0 pointer-events-none absolute" style={{ left: '-2500px' }}>
            <ResultadosNexo 
                respuestas={respuestas}
                userData={userData}      
                iaData={iaData}          
                metricas={metricasEconomicas} 
            />
        </div>
    </div>
</section>
)}

<footer className="bg-slate-900/90 text-slate-500 text-xs py-4 text-center border-t border-slate-800">
    Diseñado por VIALKER para Producir-TE: "Transformación productiva del sector textil". Todos los derechos reservados 2026.©
</footer>

{showConfirmModal && (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, 
        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
    }}>
        <div className="bg-[#0B1120] border-2 border-slate-400 p-10 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center relative animate-fadeIn">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">¿Quieres Finalizar El Diagnóstico?</h3>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    Verifique la información antes de finalizar. No podrá editarla después y se enviará por correo electrónico.
                </p>
                <div className="flex flex-row gap-4 justify-center w-full">
                    <button
                        onClick={() => setShowConfirmModal(false)}
                        onMouseEnter={() => setIsNoHovered(true)}
                        onMouseLeave={() => setIsNoHovered(false)}
                        className="flex-1 px-8 py-4 text-lg rounded-xl font-bold border-2 transition-all duration-300 active:scale-95"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: isNoHovered ? '#3b82f6' : '#475569', 
                            color: isNoHovered ? '#60a5fa' : '#94a3b8', 
                            boxShadow: isNoHovered ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none', 
                            transform: isNoHovered ? 'scale(1.05)' : 'scale(1)',
                            cursor: 'pointer'
                        }}
                    >
                        No, Revisar
                    </button>
                    <button
                        onClick={handleConfirmarFinalizacion}
                        onMouseEnter={() => setIsSiHovered(true)}
                        onMouseLeave={() => setIsSiHovered(false)}
                        className="flex-1 px-8 py-4 text-lg rounded-xl font-bold border-2 transition-all duration-300 active:scale-95"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: isSiHovered ? '#22c55e' : '#475569', 
                            color: isSiHovered ? '#4ade80' : '#94a3b8', 
                            boxShadow: isSiHovered ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none', 
                            transform: isSiHovered ? 'scale(1.05)' : 'scale(1)',
                            cursor: 'pointer'
                        }}
                    >
                        Sí, Finalizar
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
</div>
);
};