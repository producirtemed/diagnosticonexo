// app/api/diagnostico-envio/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

// ==========================================
// CONFIGURACIÓN HARDCODEADA (CON TUS NUEVAS CLAVES)
// ==========================================

// --- Claves de SUPABASE (Ya verificadas que funcionan) ---
const supabaseUrl = "https://pjsynwjazjguvtvapozv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqc3lud2phempndXZ0dmFwb3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTUyNjk1OCwiZXhwIjoyMDY1MTAyOTU4fQ.AvY0r1N9QCO9yBkYVHQLR2KU0WH54bJgdtzMAryPXxw";
const bucketName = "nexo-reports";

// --- Claves de EMAILJS (NUEVAS - Actualizadas de tu imagen) ---
const SERVICE_ID = "service_eqey1qm";
const TEMPLATE_ID = "template_l3ku93m";
const PUBLIC_KEY = "HqZVNwheq-X4ByJu_";       // Tu NUEVA Public Key
const PRIVATE_KEY = "gNNOVMwu-XP_mDl97rH8f";  // Tu NUEVA Private Key

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

async function sendEmailJsFromSever(downloadUrl: string) {
    const DESTINO_FIJO = 'producirte.med@gmail.com'; 
    
    console.log("--- INTENTANDO ENVIAR CORREO EMAILJS (NUEVAS CLAVES) ---");

    const templateParams = {
        to_email: DESTINO_FIJO,
        download_link: downloadUrl,
        name: "Diagnóstico Nexo",
        email: DESTINO_FIJO,
    };

    try {
        // Usamos la API REST directa para evitar problemas de librería
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: PUBLIC_KEY,      // Autenticación pública nueva
                accessToken: PRIVATE_KEY, // Autenticación privada nueva
                template_params: templateParams,
            }),
        });

        if (response.ok) { 
            console.log("✅ Correo enviado exitosamente.");
            return { success: true, message: "Correo enviado con éxito." };
        } else {
            const errorText = await response.text(); 
            console.error(`❌ Fallo EmailJS API: Status ${response.status}`, errorText);
            return { success: false, message: `Fallo EmailJS: ${errorText}` };
        }
    } catch (e) {
        console.error("❌ Error de red al enviar correo:", e);
        return { success: false, message: "Error de red al enviar el correo." };
    }
}

// ==========================================
// MANEJADOR POST PRINCIPAL
// ==========================================

export async function POST(req: NextRequest) {
    const supabase = initializeSupabaseClient(supabaseUrl, supabaseKey);

    try {
        const { pdfBase64, fileName } = await req.json();
        
        console.log(`--- PROCESANDO: ${fileName} ---`);

        // 1. Subida a Supabase
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uniqueFileName = `${Date.now()}_${cleanFileName}`; 
        const filePath = `reports/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: false });

        if (uploadError) {
            console.error('❌ Error Supabase Upload:', uploadError);
            throw new Error('Fallo subida Supabase: ' + uploadError.message);
        }
        
        // 2. Obtener URL Pública
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
        const finalDownloadUrl = publicUrlData.publicUrl;
        console.log("✅ Archivo subido. URL:", finalDownloadUrl);

        // 3. Enviar Correo
        const emailResult = await sendEmailJsFromSever(finalDownloadUrl);
        
        return NextResponse.json({ 
            downloadUrl: finalDownloadUrl,
            emailSent: emailResult.success, 
            message: emailResult.message 
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error General:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}