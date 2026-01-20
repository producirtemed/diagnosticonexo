// app/api/diagnostico-envio/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

// ==========================================
// CONFIGURACIÓN DE CLAVES (Mantenemos tus claves actuales)
// ==========================================

const supabaseUrl = "https://pjsynwjazjguvtvapozv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqc3lud2phempndXZ0dmFwb3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTUyNjk1OCwiZXhwIjoyMDY1MTAyOTU4fQ.AvY0r1N9QCO9yBkYVHQLR2KU0WH54bJgdtzMAryPXxw";
const bucketName = "nexo-reports";

const SERVICE_ID = "service_eqey1qm";
const TEMPLATE_ID = "template_l3ku93m";
const PUBLIC_KEY = "HqZVNwheq-X4ByJu_";
const PRIVATE_KEY = "I6YxYn6lXgX_614vB3Wsh"; // Tu clave privada para que EmailJS acepte la petición desde el servidor

// ==========================================
// FUNCIÓN DE ENVÍO DE EMAILJS (CORREGIDA)
// ==========================================
async function sendEmailJsFromSever(downloadUrl: string, userEmail: string, userName: string) {
    try {
        console.log(`--- Iniciando petición a EmailJS para: ${userEmail} ---`);
        
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000' // O tu dominio de Vercel
            },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: PUBLIC_KEY,
                accessToken: PRIVATE_KEY, // Requerido para envíos desde API/Server
                template_params: {
                    to_email: userEmail,          // Destinatario dinámico (el usuario)
                    user_name: userName,          // Nombre dinámico
                    download_link: downloadUrl,    // Link de Supabase
                    admin_email: 'producirte.med@gmail.com' // Tu correo de respaldo
                },
            }),
        });

        if (response.ok) {
            console.log("✅ EmailJS: Correo enviado exitosamente.");
            return { success: true, message: "Enviado correctamente" };
        } else {
            const errorText = await response.text();
            console.error("❌ EmailJS Error Detalles:", errorText);
            return { success: false, message: errorText };
        }
    } catch (err: any) {
        console.error("❌ EmailJS Fallo Crítico:", err);
        return { success: false, message: err.message };
    }
}

// ==========================================
// HANDLER PRINCIPAL POST
// ==========================================
export async function POST(req: NextRequest) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Recibimos todos los datos desde el frontend (DiagnosticoNexo.tsx)
        const { pdfBase64, fileName, userEmail, userName } = await req.json();

        if (!pdfBase64 || !userEmail) {
            return NextResponse.json({ error: "Faltan datos requeridos (PDF o Email)" }, { status: 400 });
        }

        console.log(`--- Procesando reporte para: ${userName} (${userEmail}) ---`);

        // 1. Subida a Supabase
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uniqueFileName = `${Date.now()}_${cleanFileName}`; 
        const filePath = `reports/${uniqueFileName}`;

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
        
        // 2. Obtener URL Pública
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
        const finalDownloadUrl = publicUrlData.publicUrl;
        console.log("✅ Archivo subido. URL:", finalDownloadUrl);

        // 3. Enviar Correo con los datos dinámicos recibidos
        const emailResult = await sendEmailJsFromSever(finalDownloadUrl, userEmail, userName);
        
        if (!emailResult.success) {
            throw new Error(emailResult.message);
        }

        return NextResponse.json({ 
            success: true,
            downloadUrl: finalDownloadUrl,
            message: "Reporte procesado y enviado con éxito" 
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error general en route.ts:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}