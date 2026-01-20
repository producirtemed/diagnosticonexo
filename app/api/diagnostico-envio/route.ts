// app/api/diagnostico-envio/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

// ==========================================
// CONFIGURACIÓN (CON TUS CLAVES ACTUALES)
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

const initializeSupabaseClient = (url: string, key: string) => {
    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

/**
 * Función encargada de enviar el correo vinculando la URL de Supabase 
 * con la variable {{download_link}} de EmailJS.
 */
async function sendEmailJsFromSever(downloadUrl: string, userEmail: string, userName: string) {
    console.log(`--- Iniciando petición a EmailJS para destino fijo: producirte.med@gmail.com ---`);

    // CONFIGURACIÓN DE PARÁMETROS: Enviamos a tu correo fijo
    const templateParams = {
        to_email: 'producirte.med@gmail.com', // DESTINATARIO FIJO SOLICITADO
        user_name: userName,                  // Nombre del cliente para el reporte
        customer_email: userEmail,            // Email del cliente para que sepas quién es
        download_link: downloadUrl,           // Link que activa el botón en tu HTML
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: PUBLIC_KEY,      
                accessToken: PRIVATE_KEY, 
                template_params: templateParams,
            }),
        });

        if (response.ok) { 
            console.log("✅ EmailJS: Envío exitoso a producirte.med@gmail.com.");
            return { success: true, message: "Correo enviado con éxito." };
        } else {
            const errorText = await response.text(); 
            console.error(`❌ Fallo EmailJS API: Status ${response.status}`, errorText);
            return { success: false, message: `Fallo EmailJS: ${errorText}` };
        }
    } catch (e: any) {
        console.error("❌ Error de red en EmailJS:", e);
        return { success: false, message: e.message };
    }
}

// ==========================================
// HANDLER POST PRINCIPAL
// ==========================================

export async function POST(req: NextRequest) {
    const supabase = initializeSupabaseClient(supabaseUrl, supabaseKey);

    try {
        // Recibimos los datos del frontend (DiagnosticoNexo.tsx)
        const { pdfBase64, fileName, userEmail, userName } = await req.json();
        
        if (!pdfBase64 || !userEmail) {
            return NextResponse.json({ error: "PDF o Email faltantes" }, { status: 400 });
        }

        console.log(`--- PROCESANDO REPORTE PARA: ${userName} ---`);

        // 1. Convertir Base64 a Buffer y limpiar nombre de archivo
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uniqueFileName = `${Date.now()}_${cleanFileName}`; 
        const filePath = `reports/${uniqueFileName}`;

        // 2. Subida a Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, pdfBuffer, { 
                contentType: 'application/pdf', 
                upsert: false 
            });

        if (uploadError) {
            console.error('❌ Error Supabase Upload:', uploadError);
            throw new Error('Fallo subida Supabase: ' + uploadError.message);
        }
        
        // 3. Obtener URL Pública del archivo
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
        const finalDownloadUrl = publicUrlData.publicUrl;
        console.log("✅ Archivo subido. URL generada:", finalDownloadUrl);

        // 4. Enviar Correo con los datos ahora disponibles
        const emailResult = await sendEmailJsFromSever(finalDownloadUrl, userEmail, userName);
        
        if (!emailResult.success) {
            throw new Error(emailResult.message);
        }

        return NextResponse.json({ 
            success: true,
            downloadUrl: finalDownloadUrl,
            message: "Reporte procesado y enviado a producirte.med@gmail.com" 
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error Crítico en el Servidor:', error.message);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}