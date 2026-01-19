'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CircularMetricProps {
  value: number;
  label: string;
  subtext: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
}

const CircularMetric: React.FC<CircularMetricProps> = ({ value, label, subtext, color, isOpen, onToggle }) => {
  // Ajustes para máxima fidelidad con la imagen de referencia
  const size = 180; // Tamaño del contenedor SVG
  const center = size / 2;
  const radius = 70; // Radio más amplio para que el número respire
  const strokeWidth = 6; // Trazo fino y profesional
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div 
      onClick={onToggle}
      className={`relative p-12 rounded-3xl bg-[#0f172a]/80 border-2 transition-all duration-500 cursor-pointer flex flex-col items-center h-full group
        ${isOpen ? 'border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'border-slate-800/40 hover:border-slate-700'}`}
    >
      {/* Gráfico Circular Estilizado */}
      <div className="relative mb-10 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Círculo de fondo (Track) */}
          <circle 
            cx={center} cy={center} r={radius} 
            stroke="currentColor" strokeWidth={strokeWidth} 
            fill="transparent" className="text-slate-800/30" 
          />
          {/* Círculo de progreso (Indicator) */}
          <circle
            cx={center} cy={center} r={radius} 
            stroke={color} strokeWidth={strokeWidth} 
            fill="transparent"
            strokeDasharray={circumference}
            style={{ 
                strokeDashoffset, 
                transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-black text-white tracking-tighter">
            {value}<span className="text-3xl ml-0.5 opacity-90">%</span>
          </span>
        </div>
      </div>

      <div className="text-center space-y-3 mb-10">
        <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">
          {label}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed opacity-70 max-w-52 mx-auto">
          {subtext}
        </p>
      </div>

      {/* Botón Chevron estilizado */}
      <div className={`mt-auto p-3 rounded-2xl border-2 transition-all duration-300 
        ${isOpen 
            ? 'bg-blue-600/20 border-blue-500/50 rotate-180' 
            : 'bg-slate-800/40 border-slate-700 group-hover:border-slate-500'}`}
      >
        <ChevronDown className={`w-7 h-7 ${isOpen ? 'text-blue-400' : 'text-slate-400'}`} />
      </div>
    </div>
  );
};

export default CircularMetric;