import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  theme: 'blue' | 'orange' | 'red' | 'green';
}

// Anima o número de 0 até o valor final de forma fluida
const AnimatedValue: React.FC<{ value: string | number; className: string }> = ({ value, className }) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  const isNumeric = Number.isFinite(numericValue);

  // useSpring cria uma mola que interpola o valor de forma natural e suave.
  const spring = useSpring(0, { stiffness: 90, damping: 18, mass: 0.8 });
  // Arredonda e formata em pt-BR a cada frame da animação.
  const display = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString('pt-BR')
  );

  useEffect(() => {
    if (isNumeric) {
      spring.set(numericValue);
    }
  }, [spring, numericValue, isNumeric]);

  // Para valores não numéricos, apenas renderiza o conteúdo original sem animar.
  if (!isNumeric) {
    return <span className={className}>{value}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, theme }) => {
  // Mapeamos a propriedade 'borderHover' com a classe completa para o Tailwind não se perder no build
  const themeStyles = {
    blue: { 
      glow: 'metric-glow-blue', text: 'text-primary', icon: 'text-primary/30', 
      borderHover: 'hover:border-primary' 
    },
    orange: { 
      glow: 'metric-glow-orange', text: 'text-secondary', icon: 'text-secondary/30', 
      borderHover: 'hover:border-secondary' 
    },
    red: { 
      glow: 'metric-glow-red', text: 'text-tertiary-container', icon: 'text-tertiary-container/30', 
      borderHover: 'hover:border-tertiary-container' 
    },
    green: { 
      glow: 'metric-glow-green', text: 'text-primary-fixed-dim', icon: 'text-primary-fixed-dim/30', 
      borderHover: 'hover:border-primary-fixed-dim' 
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div 
      className={`bg-surface-container p-6 rounded-xl border border-slate-800 transition-colors duration-300 ease-in-out cursor-default ${currentTheme.glow} ${currentTheme.borderHover}`}
    >
      <h3 className="font-label-sm text-label-sm text-outline mb-2 uppercase tracking-tighter">
        {title}
      </h3>
      <div className="flex items-end justify-between">
        <AnimatedValue
          value={value}
          className={`font-metric-xl text-metric-xl ${currentTheme.text}`}
        />
        <span className={`material-symbols-outlined text-4xl ${currentTheme.icon}`}>
          {icon}
        </span>
      </div>
    </div>
  );
};