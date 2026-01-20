// app/api/diagnostico-envio/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

// ==========================================
// CONFIGURACIÓN (USANDO TUS CLAVES)
// ==========================================

const supabaseUrl = "https://pjsynwjazjguvtvapozv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqc3lud2phempndXZ0dmFwb3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTUyNjk1OCwiZXhwIjoyMDY1MTAyOTU4fQ.AvY0r1N9QCO9yBkYVHQLR2KU0WH54bJgdtzMAryPXxw";
const bucketName = "nexo-reports";

const SERVICE_ID = "service_eqey1qm";
const TEMPLATE_ID = "template_l3ku93m";
const PUBLIC_KEY = "HqZVNwheq-X4ByJu_";
const PRIVATE_KEY = "gNNOVMwu-XP_mDl97rH8f"; 

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Envía el correo mediante la API REST de EmailJS.
 * downloadUrl: Se mapea a {{download_link}} en tu HTML
 */
async function sendEmailJsFromSever(downloadUrl: string, userEmail: string, userName: string) {
    console.log(`--- Iniciando petición a EmailJS ---`);

    const templateParams = {
        to_email: 'producirte.med@gmail.com', // Destinatario principal solicitado
        user_name: userName,                  // Nombre del cliente
        customer_email: userEmail,            // Correo del cliente para tu registro
        download_link: downloadUrl,           // VARIABLE CRÍTICA PARA EL BOTÓN HTML
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: PUBLIC_KEY,
                accessToken: PRIVATE_KEY, // Requerido para peticiones desde el servidor
                template_params: templateParams,
            }),
        });

        if (response.ok) {
            console.log("✅ EmailJS: Correo enviado con éxito.");
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error("❌ EmailJS Error:", errorText);
            return { success: false, message: errorText };
        }
    } catch (e: any) {
        console.error("❌ EmailJS Exception:", e.message);
        return { success: false, message: e.message };
    }
}

// ==========================================
// MANEJADOR DE LA RUTA (POST)
// ==========================================

export async function POST(req: NextRequest) {
    try {
        const { pdfBase64, fileName, userEmail, userName } = await req.json();

        if (!pdfBase64) {
            return NextResponse.json({ error: 'No se recibió el PDF' }, { status: 400 });
        }

        // 1. Inicializar Supabase con Service Role Key para tener permisos de escritura
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Limpiar el base64 si incluye el prefijo data:application/pdf;base64,
        const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        // Definir la ruta del archivo en el bucket
        const filePath = `diagnosticos/${fileName || `reporte_${Date.now()}.pdf`}`;

        // 2. Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, pdfBuffer, { 
                contentType: 'application/pdf', 
                upsert: true // Cambiado a true para evitar errores si el archivo existe
            });

        if (uploadError) {
            console.error('❌ Error Supabase Upload:', uploadError);
            throw new Error('Fallo subida Supabase: ' + uploadError.message);
        }
        
        // 3. Obtener URL Pública del archivo
        // Nota: Esto funciona porque tu política "Allow anyone to download report" es pública.
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
        const finalDownloadUrl = publicUrlData.publicUrl;
        console.log("✅ Archivo en Supabase. URL:", finalDownloadUrl);

        // 4. Enviar Correo vinculando la URL al botón de descarga
        const emailResult = await sendEmailJsFromSever(finalDownloadUrl, userEmail, userName);
        
        if (!emailResult.success) {
            throw new Error(`EmailJS falló: ${emailResult.message}`);
        }

        return NextResponse.json({ 
            success: true,
            downloadUrl: finalDownloadUrl,
            message: "Reporte procesado y enviado a producirte.med@gmail.com exitosamente." 
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error Crítico en el Servidor:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}