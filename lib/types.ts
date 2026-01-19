// lib/types.ts

// --- Tipos de Datos del Reporte Final ---

/**
 * Define la estructura completa del reporte finalizado que genera el backend.
 */
export interface NexoReporte {
  nivelMadurez: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  puntosAcumulados: number;
  eficienciaOperacional: number; // 0-100
  eficienciaProduccion: number; // 0-100
  eficienciaProcesos: number; // 0-100
  brechas: {
    operacional: { descripcion: string; impacto: string };
    produccion: { descripcion: string; impacto: string };
    procesos: { descripcion: string; impacto: string };
  };
  comparativo: {
    tiemposCiclo: number; // en min
    defectosPPM: number;
    utilizacionMaquinas: number; // 0-100
    variabilidadEntrega: number; // en días
  };
  recomendaciones: { titulo: string; descripcion: string }[];
  tiempoExperto: string;
}


// --- Tipos de Datos de Entrada ---

/**
 * Define la estructura de las preguntas y sus opciones para el frontend.
 */
export interface Pregunta {
  id: string;
  afirmacion: string;
  seccion: string;
}

/**
 * Define la entrada de datos cruda que se envía desde el frontend al API Route.
 */
export interface DiagnosticoInput {
  respuestas: Record<string, number>; // {p1: 5, p2: 3, ...}
  puntaje: number;
}