// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Se remueve 'appDir: true' de 'experimental' ya que el App Router
  // se habilita por defecto con la existencia de la carpeta /app en
  // versiones recientes de Next.js (como la 15.5.6)
  
  // Si no hay otras configuraciones experimentales, puedes omitir
  // el objeto 'experimental' por completo, o dejarlo vacío si planeas
  // añadir otras opciones experimentales más adelante.
  
  // En este caso, lo eliminaré si no hay otras configuraciones.
  
  /*
  experimental: {
    // appDir: true, // Eliminado para corregir la advertencia
  },
  */
  
  // Configuración opcional para imágenes externas (si necesitas cargar logos desde fuera)
  images: {
    // Si usas imágenes de dominio externo, lista los dominios aquí:
    // domains: ['example.com'], 
  },
  
  // Puedes añadir otras configuraciones como rewrites o headers si es necesario.
};

module.exports = nextConfig;