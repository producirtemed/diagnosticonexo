'use client';

import React, { useState, useMemo } from 'react';
import CircularMetric from './ui/CircularMetric';
import BrechaCard from './ui/BrechaCard';
import RecomendacionCard from './ui/RecomendacionCard';

// Componente Local para Tooltips Dinámicos y Técnicos
const TooltipSimple: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div 
            className="flex-1 flex justify-center h-full" 
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <div className="relative w-full flex justify-center h-full">
                {children}
                {visible && content && (
                    <div className="absolute z-50 p-4 bg-slate-800 text-xs text-white rounded-lg shadow-2xl border border-slate-700 w-80 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none animate-fadeIn">
                        <div className="relative text-center leading-relaxed whitespace-pre-line">
                            {content}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-700"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ResultadosProps {
  respuestas: Record<string, number>;
  userData: {
    empresa: string;
    sector: string[];
    nombre: string;
    tamanoOrganizacion: string;
  };
  iaData: any;      
  metricas: any;    
}

/**
 * ESTRATEGIA: TRADUCCIÓN DINÁMICA EXHAUSTIVA (QUESTION_MAP)
 */
const QUESTION_MAP: Record<string, { cat: string, label: string, text: string }> = {
    'p1': { cat: 'Cat. I', label: 'P1', text: 'Definición clara de módulos de producción' },
    'p2': { cat: 'Cat. I', label: 'P2', text: 'Establecimiento de objetivos de rendimiento' },
    'p3': { cat: 'Cat. I', label: 'P3', text: 'Integración eficiente entre módulos' },
    'p4': { cat: 'Cat. II', label: 'P1', text: 'Identificación de cuellos de botella' },
    'p5': { cat: 'Cat. II', label: 'P2', text: 'Metodologías Lean Manufacturing' },
    'p6': { cat: 'Cat. II', label: 'P3', text: 'Monitoreo de tiempos de ciclo' },
    'p7': { cat: 'Cat. III', label: 'P1', text: 'Sistema de gestión de calidad' },
    'p8': { cat: 'Cat. III', label: 'P2', text: 'Controles de calidad por etapa' },
    'p9': { cat: 'Cat. III', label: 'P3', text: 'Acciones correctivas para defectos' },
    'p10': { cat: 'Cat. IV', label: 'P1', text: 'Gestión de cadena de suministro' },
    'p11': { cat: 'Cat. IV', label: 'P2', text: 'Evaluación regular de proveedores' },
    'p12': { cat: 'Cat. IV', label: 'P3', text: 'Gestión eficiente de inventarios' },
    'p13': { cat: 'Cat. V', label: 'P1', text: 'Capacitación del personal' },
    'p14': { cat: 'Cat. V', label: 'P2', text: 'Programas de capacitación continua' },
    'p15': { cat: 'Cat. V', label: 'P3', text: 'Seguridad y salud en el trabajo' },
    'p16': { cat: 'Cat. VI', label: 'P1', text: 'Tecnología en procesos productivos' },
    'p17': { cat: 'Cat. VI', label: 'P2', text: 'Inversión en innovación' },
    'p18': { cat: 'Cat. VI', label: 'P3', text: 'Decisiones basadas en datos' },
    'p19': { cat: 'Cat. VII', label: 'P1', text: 'Conocimiento detallado de costos' },
    'p20': { cat: 'Cat. VII', label: 'P2', text: 'Reducción continua de costos' }
};

const ResultadosNexo: React.FC<ResultadosProps> = ({ respuestas, userData, iaData, metricas }) => {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        maximumFractionDigits: 0 
    }).format(val) + " COP";

  const analisisDinamico = useMemo(() => {
    // --- LÓGICA DE CÁLCULO SISTÉMICO BLINDADA ---
    const costosReales = Number(respuestas['VII_costos_reales']) || 0;
    const desperdicioPct = Number(respuestas['VII_desperdicio_percibido']) || 0;
    const tamano = userData.tamanoOrganizacion;

    // 1. Brecha Económica Anual Detectada (Fuga)
    const fugaTotal = costosReales * (desperdicioPct / 100);

    // 2. Ahorro Recuperable (85%)
    const ahorroRecuperable = fugaTotal * 0.85;

    // 3. Inversión Dinámica por Tamaño (Evita ROI negativo) 
    const factoresTamano: Record<string, number> = {
        "Microempresa": 0.10,   
        "Pequeña empresa": 0.15, 
        "Mediana empresa": 0.20, 
        "Gran empresa": 0.25    
    };
    
    const factorAplicable = factoresTamano[tamano] || 0.15;
    let inversionEstimada = fugaTotal * factorAplicable;

    // SEGURO TÉCNICO: La inversión nunca supera el 40% del ahorro 
    const techoInversion = ahorroRecuperable * 0.40;
    if (inversionEstimada > techoInversion) {
        inversionEstimada = techoInversion;
    }

    // 4. ROI Blindado (Mínimo lógico 150%) 
    const roiCalculado = inversionEstimada > 0 
        ? Math.round(((ahorroRecuperable - inversionEstimada) / inversionEstimada) * 100) 
        : 0;

    const roiFinal = Math.max(roiCalculado, 150);

    // 5. Recuperación de Inversión (Payback)
    const ahorroMensual = ahorroRecuperable / 12;
    const mesesRecuperacion = (ahorroMensual > 0 && inversionEstimada > 0) 
        ? (inversionEstimada / ahorroMensual).toFixed(1) 
        : "0";

    // --- LÓGICA DE PUNTUACIÓN Y GAPS ---
    const calcularPotencialMejora = (preguntas: string[]) => {
      const sumaPuntos = preguntas.reduce((acc, id) => {
        const val = respuestas[id] || 1;
        return acc + (val === 3 ? 5 : val === 2 ? 3 : 0);
      }, 0);
      const maxPuntosPosibles = preguntas.length * 5;
      const madurezReal = (sumaPuntos / maxPuntosPosibles) * 100;
      return Math.round(100 - madurezReal);
    };

    const gapOperacional = calcularPotencialMejora(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    const gapProduccion = calcularPotencialMejora(['p7', 'p8', 'p9', 'p10', 'p11', 'p12']);
    const gapProcesos = calcularPotencialMejora(['p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20']);

    const puntuacionTotalObtenida = Object.entries(respuestas).reduce((acc, [key, value]) => {
        if (key.startsWith('p') && key !== 'VII_costos_reales' && key !== 'VII_desperdicio_percibido') {
            const index = value - 1;
            const pts = [0, 3, 5];
            return acc + (pts[index] || 0);
        }
        return acc;
    }, 0);

    return {
        roi: roiFinal,
        payback: mesesRecuperacion,
        ahorroRecuperable: ahorroRecuperable,
        fugaPercibida: fugaTotal,
        puntuacionTotalObtenida,
        gapOperacional,
        gapProduccion,
        gapProcesos
    };
  }, [respuestas, userData.tamanoOrganizacion]);

  if (!iaData || !metricas) return null;

  return (
    <div className="resultados-container animate-fadeIn">
      {/* 1. RESUMEN EJECUTIVO EN NÚMEROS */}
      <section className="seccion-ejecutiva">
        <h2 className="titulo-reporte">📊 Resumen Ejecutivo Nexo En Números</h2>
        <p className="subtitulo-ejecutivo">Análisis de Competitividad Global para {userData.empresa}</p>

        <div className="grid-impacto-financiero">
          <div className="card-financiera hover-brecha relative border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] flex flex-col justify-center">
              <span className="valor-principal text-red-400">{formatMoney(analisisDinamico.fugaPercibida)}</span>
              <p className="label-financiero">Brecha Económica Anual Detectada</p>
              <p className="text-[10px] text-slate-500 mt-2 italic">Basado en su desperdicio del {respuestas['VII_desperdicio_percibido'] || 0}% sobre costos reales.</p>
          </div>

          <TooltipSimple content={`Clasificación: ${iaData.nivelMadurez}.\nResultado de promediar el cumplimiento técnico de los 7 pilares.`}>
              <div className="card-financiera hover-madurez w-full flex flex-col justify-center">
                  <span className="valor-principal text-blue-400">{iaData.nivelMadurez}</span>
                  <p className="label-financiero">Nivel de Madurez</p>
                  <p className="descripcion-financiera">Clasificación estratégica basada en su operación actual.</p>
              </div>
          </TooltipSimple>

          <div className="card-financiera highlight hover-ahorro flex flex-col justify-center">
              <span className="valor-principal text-green-400">{formatMoney(analisisDinamico.ahorroRecuperable)}</span>
              <p className="label-financiero">Ahorro Recuperable (85%)</p>
              <p className="descripcion-financiera">Potencial real capturable bajo estándares de Clase Mundial.</p>
          </div>
        </div>

        <div className="grid-secundario-metricas">
            <TooltipSimple content="ROI Blindado basado en el ahorro recuperable neto de inversión.">
                <div className="metrica-mini-card hover-mini w-full">
                    <span className="mini-valor text-emerald-400">{analisisDinamico.roi}%</span>
                    <p className="mini-label">ROI Esperado</p>
                </div>
            </TooltipSimple>

            <TooltipSimple content="Meses para recuperar la inversión basada en el ahorro mensual generado.">
                <div className="metrica-mini-card hover-mini w-full">
                    <span className="mini-valor text-emerald-400">{analisisDinamico.payback} Meses</span>
                    <p className="mini-label">Recuperación de Inversión</p>
                </div>
            </TooltipSimple>

            <TooltipSimple content={`Puntos técnicos obtenidos: ${analisisDinamico.puntuacionTotalObtenida}.`}>
                <div className="metrica-mini-card hover-mini w-full">
                    <span className="mini-valor text-emerald-400">{analisisDinamico.puntuacionTotalObtenida}</span>
                    <p className="mini-label">Puntos Nexo</p>
                </div>
            </TooltipSimple>
        </div>
      </section>

      <hr className="divider mb-4" />

      {/* 2. ANÁLISIS DE BRECHAS */}
      <h2 className="titulo-seccion-estetica -mt-10 mb-2">Análisis de Brechas e Impacto Económico</h2>
      <p className="text-center text-slate-400 mb-6">Haz clic sobre cada uno de los recuadros para explorar el potencial de mejora de tu eficiencia</p>
      
      <div className="grid-metricas-circulares mb-10">
        <div className="hover-gap-card no-chevron-container">
          <CircularMetric 
              value={analisisDinamico.gapOperacional} 
              label="Potencial de Mejora para Alcanzar la Eficiencia Operacional Total" 
              subtext="Brecha pendiente para optimización total" 
              color="#3b82f6" 
              isOpen={false}
              onToggle={() => {}}
          />
        </div>

        <div className="hover-gap-card no-chevron-container">
          <CircularMetric 
              value={analisisDinamico.gapProduccion} 
              label="Potencial de Mejora para Alcanzar la Eficiencia de Producción Total" 
              subtext="Brecha pendiente en calidad y suministro" 
              color="#4ade80" 
              isOpen={false}
              onToggle={() => {}}
          />
        </div>

        <div className="hover-gap-card no-chevron-container">
          <CircularMetric 
              value={analisisDinamico.gapProcesos} 
              label="Potencial de Mejora para Alcanzar la Eficiencia de Procesos Total" 
              subtext="Brecha pendiente en talento y tecnología" 
              color="#f59e0b" 
              isOpen={false}
              onToggle={() => {}}
          />
        </div>
      </div>

      <hr className="divider"/>

      <h2 className="titulo-seccion-estetica">Ruta Táctica Recomendada por IA</h2>
      <div className="grid-recomendaciones">
          {iaData.recomendaciones.map((rec: any, index: number) => (
              <RecomendacionCard 
                key={index}
                titulo={rec.titulo}
                descripcion={rec.descripcion}
              />
          ))}
      </div>

      <h2 className="titulo-seccion-estetica">Sin Nexo vs. Con Nexo: Un Contraste Revelador</h2>
      <div className="comparativa-visual">
          <div className="comp-card sin-nexo hover-glow-red">
              <div className="comp-header">Sin Nexo</div>
              <p className="mb-2">Estado: Ineficiencia Detectada ❌</p>
              <p className="mb-2">Brecha: {formatMoney(analisisDinamico.fugaPercibida)} ❌</p>
              <p>Riesgo: Estancamiento Competitivo ❌</p>
          </div>
          <div className="comp-card con-nexo hover-glow-green">
              <div className="comp-header">Con Nexo</div>
              <p className="mb-2">Productividad: +15% Optimización ✅</p>
              <p className="mb-2">ROI: {analisisDinamico.roi}% Proyectado ✅</p>
              <p>Ahorro: {formatMoney(analisisDinamico.ahorroRecuperable)} ✅</p>
          </div>
      </div>

      <div className="cta-final-box">
          <h2>El Momento de Actuar es Ahora</h2>
          <div className="texto-accion">
              <p>
                  Su operación textil en <strong>{userData.empresa}</strong> está en un punto clave.
                  Califica como nivel <strong>{iaData.nivelMadurez}</strong>.
                  Tiene un ahorro potencial de <strong>{formatMoney(analisisDinamico.ahorroRecuperable)}</strong> esperando ser liberado.
              </p>
          </div>
          <div className="botones-cta">
              <button className="btn-agenda-main" onClick={() => window.open('https://tu-agenda.com', '_blank')}>Agendar Sesión Inicial Gratuita</button>
              <button className="btn-contacto-sec" onClick={() => window.location.href = 'mailto:asesor@nexo.com'}>Contactar a un Asesor</button>
          </div>
      </div>

      <style jsx>{`
        .resultados-container { padding: 40px 0; max-width: 1200px; margin: 0 auto; color: #fff; }
        .seccion-ejecutiva { background: #0f172a; padding: 40px; border-radius: 24px; border: 1px solid #1e293b; text-align: center; margin-bottom: 40px; }
        .titulo-reporte { font-size: 2.5rem; font-weight: 800; margin-bottom: 10px; color: #f8fafc; }
        .subtitulo-ejecutivo { color: #94a3b8; font-size: 1.1rem; margin-bottom: 40px; }
        
        .grid-impacto-financiero { display: flex; gap: 20px; margin-bottom: 20px; align-items: stretch; }
        .card-financiera { 
            flex: 1; 
            background: #1e293b; 
            padding: 30px; 
            border-radius: 20px; 
            border: 1px solid #334155; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .hover-brecha:hover { border-color: #f87171; box-shadow: 0 0 25px rgba(248, 113, 113, 0.25); transform: translateY(-5px); background: rgba(248, 113, 113, 0.02); }
        .hover-madurez:hover { border-color: #60a5fa; box-shadow: 0 0 25px rgba(96, 165, 250, 0.25); transform: translateY(-5px); background: rgba(96, 165, 250, 0.02); }
        .hover-ahorro:hover { border-color: #4ade80; box-shadow: 0 0 25px rgba(74, 222, 128, 0.25); transform: translateY(-5px); background: rgba(74, 222, 128, 0.02); }
        .card-financiera.highlight { border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.05); }
        
        .grid-secundario-metricas { display: flex; justify-content: space-between; align-items: stretch; gap: 20px; margin-top: 20px; width: 100%; }
        .metrica-mini-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(71, 85, 105, 0.3); padding: 20px; border-radius: 12px; text-align: center; flex: 1; min-height: 120px; display: flex; flex-direction: column; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-mini:hover { border-color: #4ade80; box-shadow: 0 0 15px rgba(74, 222, 128, 0.2); transform: translateY(-3px); background: rgba(74, 222, 128, 0.05); }
        
        .valor-principal { display: block; font-size: 1.8rem; font-weight: 900; margin-bottom: 8px; }
        .label-financiero { color: #fff; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
        .mini-valor { display: block; font-size: 1.5rem; font-weight: 700; }
        .mini-label { color: #94a3b8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-top: 5px; }
        
        .titulo-seccion-estetica { text-align: center; font-size: 2rem; font-weight: 800; margin: 30px 0 20px; color: #fff; }
        
        .hover-gap-card {
            transition: all 0.4s ease;
            border-radius: 20px;
        }
        .hover-gap-card:hover {
            transform: scale(1.02);
            filter: brightness(1.2);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.15);
        }

        :global(.circular-metric-label) {
            font-size: 0.80rem !important;
            line-height: 1.2 !important;
            padding: 0 10px !important;
            text-align: center;
        }

        .no-chevron-container :global(button),
        .no-chevron-container :global(svg[class*="chevron"]),
        .no-chevron-container :global(svg[class*="Chevron"]),
        .no-chevron-container :global(.chevron),
        .no-chevron-container :global(div[style*="position: absolute"][style*="bottom"]) {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        .grid-metricas-circulares { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
        .comparativa-visual { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0; }
        
        .comp-card { 
            padding: 30px; 
            border-radius: 20px; 
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid transparent;
        }

        .hover-glow-red:hover {
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
            transform: translateY(-5px);
        }

        .hover-glow-green:hover {
            background: rgba(34, 197, 94, 0.08);
            border-color: rgba(34, 197, 94, 0.3);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
            transform: translateY(-5px);
        }

        .sin-nexo { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); }
        .con-nexo { background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); }
        .comp-header { font-size: 1.5rem; font-weight: 800; margin-bottom: 15px; }
        .cta-final-box { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 60px; border-radius: 30px; text-align: center; border: 1px solid #334155; margin-top: 80px; }
        .btn-agenda-main { background: #3b82f6; color: white; padding: 18px 36px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; margin-right: 15px; font-size: 1.1rem; }
        .btn-contacto-sec { background: transparent; color: white; padding: 18px 36px; border-radius: 12px; font-weight: 800; border: 2px solid #334155; cursor: pointer; font-size: 1.1rem; }
        .divider { border: 0; border-top: 1px solid #1e293b; margin: 60px 0; }
        
        @media (max-width: 900px) {
          .grid-impacto-financiero { flex-direction: column; }
          .grid-secundario-metricas { flex-direction: column; align-items: center; }
          .metrica-mini-card { width: 100%; max-width: 320px; min-height: 100px; }
          .grid-metricas-circulares { grid-template-columns: 1fr; }
          .comparativa-visual { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ResultadosNexo;