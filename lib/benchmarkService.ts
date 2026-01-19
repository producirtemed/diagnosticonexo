export interface SectorBenchmark {
  ciiu: string;
  nombre: string;
  vabAnualPorEmpleado: number; // Pesos COP
  utilizacionReferencia: number; // % promedio del sector
  productividadHora: number;    // COP generados por hora/hombre
}

export const DANE_TEXTIL_BENCHMARKS: Record<string, SectorBenchmark> = {
  "1311": { ciiu: "1311", nombre: "Hilatura de fibras", vabAnualPorEmpleado: 72000000, utilizacionReferencia: 82, productividadHora: 30000 },
  "1312": { ciiu: "1312", nombre: "Tejeduría", vabAnualPorEmpleado: 68000000, utilizacionReferencia: 78, productividadHora: 28500 },
  "1410": { ciiu: "1410", nombre: "Confección de prendas", vabAnualPorEmpleado: 58000000, utilizacionReferencia: 76, productividadHora: 24200 },
  "1521": { ciiu: "1521", nombre: "Calzado de cuero", vabAnualPorEmpleado: 52000000, utilizacionReferencia: 74, productividadHora: 21600 },
  "OTRO": { ciiu: "OTRO", nombre: "Manufactura General", vabAnualPorEmpleado: 48000000, utilizacionReferencia: 70, productividadHora: 20000 }
};