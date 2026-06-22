import React from 'react';

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title}) => {
  // Gera a data dinamicamente: "terça-feira, 16 de junho de 2026"
  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-stack-lg gap-4">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
      </div>
      <div className="text-right">
        <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">
          {hoje}
        </span>
      </div>
    </div>
  );
};