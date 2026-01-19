import { useState } from 'react';

export const useGemini = () => {
  const [isProcessingIA, setIsProcessingIA] = useState(false);

  const ejecutarMotorNexo = async (respuestas: any, userData: any) => {
    setIsProcessingIA(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas, userData }),
      });
      
      if (!res.ok) throw new Error("Error en la respuesta del Motor Nexo");
      
      return await res.json();
    } catch (err) {
      console.error("Error en IA:", err);
      return null;
    } finally {
      setIsProcessingIA(false);
    }
  };

  return { ejecutarMotorNexo, isProcessingIA };
};