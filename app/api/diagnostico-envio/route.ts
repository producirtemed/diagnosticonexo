// app/api/diagnostico-envio/route.ts
import { NextResponse, NextRequest } from 'next/server';

// Claves de EmailJS desde variables de entorno
const SERVICE_ID = "service_eqey1qm";
const TEMPLATE_ID = "template_l3ku93m";
const PUBLIC_KEY = "HqZVNwheq-X4ByJu_";
const PRIVATE_KEY = "gNNOVMwu-XP_mDl97rH8f"; 

async function sendEmailJsFromSever(downloadUrl: string, userEmail: string, userName: string) {
    const templateParams = {
        to_email: 'producirte.med@gmail.com', // Destinatario fijo
        user_name: userName,
        customer_email: userEmail,
        download_link: downloadUrl, // Vinculado a {{download_link}} en tu HTML
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

        return response.ok;
    } catch (e) {
        console.error("Fallo EmailJS:", e);
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        // Recibimos solo la URL generada por el frontend
        const { publicUrl, userEmail, userName } = await req.json();
        
        if (!publicUrl) {
            return NextResponse.json({ error: "URL del reporte faltante" }, { status: 400 });
        }

        // Enviamos el correo con el link de descarga
        const success = await sendEmailJsFromSever(publicUrl, userEmail, userName);
        
        if (!success) {
            throw new Error("Fallo el envío del correo");
        }

        return NextResponse.json({ 
            success: true, 
            message: "Correo enviado exitosamente" 
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}