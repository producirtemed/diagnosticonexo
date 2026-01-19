import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicialización con la clave del .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { respuestas, userData } = await req.json();
    
    // Usamos gemini-1.5-flash por su equilibrio entre velocidad y precisión técnica
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Eres un Ingeniero Senior de Producir-TE experto en competitividad textil global.
      Analiza la empresa "${userData.empresa}" (CIIU: ${userData.sector}) en Colombia.
      Respuestas del test (escala 1-3): ${JSON.stringify(respuestas)}

      TAREAS TÉCNICAS:
      1. Benchmarking DANE: Productividad vs promedio nacional EAM.
      2. Benchmarking Internacional: Eficiencia vs estándares actuales de México y China.
      3. Impacto Financiero: Ahorro anual potencial en COP basado en ineficiencias.
      4. Ruta de Acción: 3 recomendaciones específicas para cerrar la brecha.

      REGLAS DE RESPUESTA:
      - Responde exclusivamente en JSON válido.
      - No incluyas texto explicativo, solo el objeto.
      - Formatea impactos económicos como "COP X.XXX.XXX".

      ESTRUCTURA JSON REQUERIDA:
      {
        "nivelMadurez": "Principiante" | "Intermedio" | "Avanzado" | "Experto",
        "brechas": {
          "operacional": { "descripcion": "string", "impacto": "string" },
          "produccion": { "descripcion": "string", "impacto": "string" },
          "procesos": { "descripcion": "string", "impacto": "string" }
        },
        "metricas": {
          "ahorroAnualPotencial": number,
          "roiEsperado": number,
          "recuperacionMeses": number
        },
        "recomendaciones": [
          { "titulo": "string", "descripcion": "string" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/gi, "").trim();
    
    return new Response(responseText, { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error("Error Motor Nexo:", error);
    return new Response(JSON.stringify({ 
      error: "Fallo en el cálculo de competitividad",
      details: error.message 
    }), { status: 500 });
  }
}