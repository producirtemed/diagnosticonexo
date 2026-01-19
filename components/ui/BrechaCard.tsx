import React from 'react';
import { Info } from 'lucide-react';

interface BrechaCardProps {
    title: string;
    data: {
        descripcion: string;
        impacto: string;
    };
    fuente?: string;
}

const BrechaCard: React.FC<BrechaCardProps> = ({ title, data, fuente = "DANE – EAM" }) => (
    <div className="brecha-card p-6 bg-slate-800 border-l-4 border-red-500 rounded-r-xl">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="group relative">
                <Info className="w-4 h-4 text-slate-500 cursor-help" />
                <span className="absolute hidden group-hover:block bg-black text-[10px] p-2 rounded -left-24 w-32 z-50">
                    Cálculo basado en estadísticas oficiales del {fuente}
                </span>
            </div>
        </div>
        <p className="text-slate-300 text-sm mb-4">{data.descripcion}</p>
        <div className="bg-slate-900/50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Impacto Económico Anual</p>
            <p className="text-2xl font-black text-red-400">{data.impacto}</p>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 italic">Fuente: Indicadores de Productividad {fuente}</p>
    </div>
);

export default BrechaCard;