import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none overflow-hidden">
      <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-tertiary-container/5 blur-[120px] rounded-full"></div>
    </div>
  );
};