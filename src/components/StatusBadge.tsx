import React from 'react';

type StatusType = 'urgente' | 'pendente' | 'deferido';

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'urgente') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container mr-1.5 animate-pulse"></span>
        URGENTE
      </span>
    );
  }

  if (status === 'pendente') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
        PENDENTE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
      DEFERIDO
    </span>
  );
};