// app/page.tsx

import { DiagnosticoNexo } from '../components/DiagnosticoNexo';

// Importación para asegurar que los estilos de los subcomponentes estén disponibles
// Nota: Next.js importará automáticamente los subcomponentes usados por DiagnosticoNexo.
import '../components/ui/CircularMetric';
import '../components/ui/BrechaCard';
import '../components/ui/RecomendacionCard';


export default function HomePage() {
  return (
    <main>
      {/* El componente DiagnosticoNexo.tsx contiene todo el diseño y lógica de la aplicación.
        Como ya incluye <Head> (o su equivalente en Next.js, aunque aquí es por compatibilidad), 
        y los estilos están inyectados, solo necesitamos renderizarlo. 
      */}
      <DiagnosticoNexo />
    </main>
  );
}