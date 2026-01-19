import React from 'react';

interface RecomendacionCardProps {
    titulo: string; // Título de la recomendación (Ej: Optimización de Balanceo de Línea)
    descripcion: string; // Detalle de la acción
}

const RecomendacionCard: React.FC<RecomendacionCardProps> = ({ titulo, descripcion }) => (
    <div className="recomendacion-card">
        <span className="flecha-icono">→</span>
        <div>
            <h4>{titulo}</h4>
            <p>{descripcion}</p>
        </div>
        
        {/* Nota: Los estilos CSS para estas clases deben estar en DiagnosticoNexo.tsx o globals.css */}
    </div>
);

export default RecomendacionCard;