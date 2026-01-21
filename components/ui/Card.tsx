
import React from 'react';

export const Card: React.FC<{ children?: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div 
        onClick={onClick}
        className={`bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-xl shadow-xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};
