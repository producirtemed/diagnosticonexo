import { NextResponse, NextRequest } from 'next/server';

const SERVICE_ID = "service_eqey1qm";
const TEMPLATE_ID = "template_l3ku93m";
const PUBLIC_KEY = "HqZVNwheq-X4ByJu_";
const PRIVATE_KEY = "gNNOVMwu-XP_mDl97rH8f"; 

export async function POST(req: NextRequest) {
    try {
        const { publicUrl, userEmail, userName } = await req.json();
        
        const templateParams = {
            to_email: 'producirte.med@gmail.com',
            user_name: userName,
            customer_email: userEmail,
            download_link: publicUrl, // Aquí inyectamos la URL de Supabase
        };

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

        if (!response.ok) throw new Error("Fallo en EmailJS");

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}