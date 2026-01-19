// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css'; // Importa tus estilos globales
// CORRECCIÓN: Importar estilos específicos para el diagnóstico
import './styles/nexo-diagnostico.css'; 

// --- METADATA (SEO) ---
export const metadata: Metadata = {
  title: 'Diagnóstico Nexo: Tu Ruta de Transformación Textil',
  description: 'Descubre el potencial oculto y las oportunidades de mejora en tu operación textil con el método Nexo.',
  keywords: ['Nexo', 'Textil', 'Diagnóstico', 'Optimización', 'Producción', 'Gamificado'],
  icons: {
    // INSERCIÓN DEL FAVICON AQUÍ
    icon: '/favicon producirTE.png', 
  },
};

// --- LAYOUT PRINCIPAL ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Es importante que este archivo CSS contenga la definición para el body/html */}
      <body className="dark-theme">
        {children}
      </body>
    </html>
  );
}