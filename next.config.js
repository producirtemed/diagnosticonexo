/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignorar errores de TypeScript durante el despliegue
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ignorar errores de ESLint (como las advertencias de EmailJS)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. Configuración de imágenes para evitar fallos de optimización
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig;