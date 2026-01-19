// lib/emailjs.config.ts

import emailjs from '@emailjs/browser';

// Claves de entorno del cliente (NEXT_PUBLIC_)
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

// Bandera local para rastrear el estado de inicialización (solución al error isInitialized)
let initialized = false;

/**
 * Función para inicializar EmailJS y validar que la clave pública exista.
 * Se ejecuta solo una vez.
 */
export function initializeEmailJS() {
    if (typeof window === 'undefined') {
        return;
    }
    
    // 1. Validar clave pública (CRÍTICO para emailjs.init)
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.trim() === '') {
        console.error("❌ ERROR CRÍTICO EMAILJS: La Clave Pública (NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) NO está definida. La inicialización fallará. Detenga y reinicie su servidor.");
        // Si la clave pública es crítica y falla, no inicializamos.
        return; 
    }
    
    // 2. LOG y Validar IDs de Servicio/Template
    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID.trim() === '') {
        console.warn("⚠️ ADVERTENCIA EMAILJS: El ID de Servicio está vacío. Revise .env.local.");
    }
    if (!EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID.trim() === '') {
        console.warn("⚠️ ADVERTENCIA EMAILJS: El ID de Plantilla está vacío. Revise .env.local.");
    }

    // 3. Inicializar solo si no se ha hecho
    if (!initialized) {
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            initialized = true; 
            console.log("✅ EmailJS inicializado con la clave pública.");
        } catch (e) {
            console.error("❌ Fallo al inicializar EmailJS:", e);
        }
    }
}

// Exportar IDs
export {
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID
};