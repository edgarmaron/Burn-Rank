import React from 'react';

export const WeaponIcon = ({ id, className = "w-12 h-12" }: { id: string, className?: string }) => {
  const getWeaponPath = (id: string) => {
      switch(id) {
          case 'iron_dagger': return <path d="M40 80 L60 60 L70 30 L50 10 L30 30 L40 60 Z M45 80 L45 90" fill="none" stroke="#71717a" strokeWidth="3" />;
          case 'bronze_mace': return <g><circle cx="70" cy="30" r="15" fill="none" stroke="#cd7f32" strokeWidth="4"/><line x1="30" y1="70" x2="60" y2="40" stroke="#cd7f32" strokeWidth="6"/></g>;
          case 'silver_spear': return <line x1="10" y1="90" x2="90" y2="10" stroke="#94a3b8" strokeWidth="3"/>;
          case 'gold_saber': return <path d="M20 90 Q10 10 90 10" fill="none" stroke="#fbbf24" strokeWidth="4"/>;
          case 'platinum_halberd': return <path d="M50 90 L50 10 M30 30 L70 30 L50 10" fill="none" stroke="#22d3ee" strokeWidth="3"/>;
          case 'emerald_bow': return <path d="M20 20 Q90 50 20 80 M20 50 L80 50" fill="none" stroke="#10b981" strokeWidth="3"/>;
          case 'diamond_rapier': return <line x1="20" y1="80" x2="80" y2="20" stroke="#60a5fa" strokeWidth="2"/>;
          case 'master_staff': return <g><line x1="50" y1="90" x2="50" y2="30" stroke="#c084fc" strokeWidth="4"/><circle cx="50" cy="20" r="10" stroke="#c084fc" fill="#c084fc" fillOpacity="0.5"/></g>;
          case 'grandmaster_blade': return <path d="M40 90 L50 20 L60 90 Z" fill="#f87171" stroke="#f87171" fillOpacity="0.3"/>;
          case 'challenger_relic': return <g><circle cx="50" cy="50" r="30" stroke="#facc15" strokeWidth="4"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#facc15" strokeWidth="2"/></g>;
          default: return <circle cx="50" cy="50" r="20" />;
      }
  };

  return (
    <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`}>
        {getWeaponPath(id)}
    </svg>
  );
};