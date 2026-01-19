// app/layout.tsx

import type { Metadata, Viewport } from 'next'; // Se añade Viewport
import './globals.css'; 
import './styles/nexo-diagnostico.css'; 

// --- CONFIGURACIÓN DE RESPONSIVIDAD (Crucial para móviles) ---
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// --- METADATA (SEO) ---
export const metadata: Metadata = {
  title: 'Diagnóstico Nexo: Tu Ruta de Transformación Textil',
  description: 'Descubre el potencial oculto y las oportunidades de mejora en tu operación textil con el método Nexo.',
  keywords: ['Nexo', 'Textil', 'Diagnóstico', 'Optimización', 'Producción', 'Gamificado'],
  icons: {
    icon: '/favicon-producirte.png', 
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
      <body className="dark-theme antialiased overflow-x-hidden">
        {/* 'antialiased' mejora la renderización de fuentes.
            'overflow-x-hidden' evita que la página se mueva hacia los lados en móviles.
        */}
        <main className="min-h-screen w-full flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}