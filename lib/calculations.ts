import { DANE_TEXTIL_BENCHMARKS } from './benchmarkService';

export const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

export const calcularImpactoReal = (ciiu: string, respuestas: Record<string, number>) => {
  const benchmark = DANE_TEXTIL_BENCHMARKS[ciiu] || DANE_TEXTIL_BENCHMARKS["OTRO"];
  
  // Normalización: Escala 1-3 a porcentaje de eficiencia (0.3, 0.65, 0.95)
  const getEficiencia = (val: number) => (val === 3 ? 0.95 : val === 2 ? 0.65 : 0.30);

  const uOperacional = getEficiencia(respuestas['p4'] || 1);
  const uProduccion = getEficiencia(respuestas['p6'] || 1);

  // Parámetros de escala (PYME promedio Colombia)
  const numEmpleadosBase = 15;
  const horasLaboralesAnio = 2400;

  // 1. Pérdida por Brecha Operacional (VAB no generado por subutilización)
  const brechaOp = Math.max(0, (benchmark.utilizacionReferencia / 100) - uOperacional);
  const impactoOp = brechaOp * benchmark.vabAnualPorEmpleado * numEmpleadosBase;

  // 2. Pérdida por Baja Productividad (Basado en valor hora/hombre)
  const brechaProd = Math.max(0, 0.90 - uProduccion); // Meta 90% vs actual
  const impactoPr = brechaProd * benchmark.productividadHora * horasLaboralesAnio * numEmpleadosBase;

  const impactoTotal = impactoOp + impactoPr;
  const ahorroProyectado = impactoTotal * 0.75; // Factor de recuperación Nexo

  return {
    impactoTotal,
    impactoOp,
    impactoPr,
    ahorroProyectado,
    benchmark,
    brechaOp: brechaOp * 100
  };
};