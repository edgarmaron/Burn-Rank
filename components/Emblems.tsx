import React from 'react';
import { Tier } from '../types';

export const Emblem = ({ tier, className = "w-24 h-24" }: { tier: Tier, className?: string }) => {
  // Config for colors and styles
  const config = {
    Iron: { primary: '#52525b', secondary: '#27272a', core: '#71717a', glow: '#3f3f46' },
    Bronze: { primary: '#d97706', secondary: '#78350f', core: '#fbbf24', glow: '#f59e0b' },
    Silver: { primary: '#94a3b8', secondary: '#475569', core: '#e2e8f0', glow: '#cbd5e1' },
    Gold: { primary: '#fbbf24', secondary: '#b45309', core: '#fcd34d', glow: '#f59e0b' },
    Platinum: { primary: '#22d3ee', secondary: '#0e7490', core: '#67e8f9', glow: '#06b6d4' },
    Emerald: { primary: '#10b981', secondary: '#065f46', core: '#34d399', glow: '#10b981' },
    Diamond: { primary: '#60a5fa', secondary: '#1e3a8a', core: '#93c5fd', glow: '#3b82f6' },
    Master: { primary: '#c084fc', secondary: '#581c87', core: '#e879f9', glow: '#a855f7' },
    Grandmaster: { primary: '#f87171', secondary: '#7f1d1d', core: '#fca5a5', glow: '#ef4444' },
    Challenger: { primary: '#facc15', secondary: '#ca8a04', core: '#ffffff', glow: '#fde047' },
  };

  const c = config[tier];

  // Unique paths for each tier to create distinct silhouettes
  const renderPaths = () => {
    switch(tier) {
      case 'Iron':
        return (
          <g>
            <path d="M50 15 L85 25 L75 75 L50 90 L25 75 L15 25 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
            <circle cx="50" cy="50" r="15" fill={c.secondary} opacity="0.5" />
            <path d="M50 20 L50 80" stroke={c.secondary} strokeWidth="2" opacity="0.3" />
          </g>
        );
      case 'Bronze':
        return (
          <g>
            <path d="M20 20 L80 20 L70 80 L50 95 L30 80 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
            <path d="M20 20 L50 50 L80 20" stroke={c.secondary} strokeWidth="2" opacity="0.4" />
            <circle cx="50" cy="60" r="12" fill={c.core} className="animate-pulse" opacity="0.8" />
          </g>
        );
      case 'Silver':
        return (
          <g>
            <path d="M50 5 L90 20 L80 75 L50 95 L20 75 L10 20 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
            <path d="M50 5 L50 95" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M10 20 L50 50 L90 20" stroke="white" strokeWidth="1" opacity="0.3" />
          </g>
        );
      case 'Gold':
        return (
          <g>
            <path d="M50 10 L85 30 L80 70 L50 90 L20 70 L15 30 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
            <path d="M50 10 L90 10 L90 40 L50 60 L10 40 L10 10 Z" fill="none" stroke={c.core} strokeWidth="1" opacity="0.6" />
            <circle cx="50" cy="50" r="10" fill={c.core} className="animate-pulse" />
            <path d="M50 35 L65 50 L50 65 L35 50 Z" fill={c.secondary} opacity="0.5" />
          </g>
        );
      case 'Platinum':
        return (
          <g>
            <path d="M50 5 L95 25 L85 85 L50 95 L15 85 L5 25 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
            <path d="M50 5 L70 40 L50 95 L30 40 Z" fill={c.glow} opacity="0.3" />
            <circle cx="50" cy="40" r="8" fill="white" className="animate-pulse" />
          </g>
        );
      case 'Emerald':
        return (
          <g>
             <path d="M50 10 C80 10 90 40 80 80 L50 95 L20 80 C10 40 20 10 50 10 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
             <path d="M50 20 Q70 40 50 90 Q30 40 50 20" fill={c.core} opacity="0.4" />
             <path d="M50 50 L70 30 M50 50 L30 30 M50 50 L50 80" stroke={c.core} strokeWidth="2" />
          </g>
        );
      case 'Diamond':
        return (
          <g>
            <path d="M50 5 L90 45 L50 95 L10 45 Z" fill={`url(#grad_${tier})`} stroke="white" strokeWidth="1" />
            <path d="M50 5 L70 45 L50 95 L30 45 Z" fill={c.core} opacity="0.4" />
            <path d="M10 45 L90 45" stroke="white" strokeWidth="1" opacity="0.5" />
            <circle cx="50" cy="45" r="5" fill="white" className="animate-ping" style={{ animationDuration: '3s' }} />
          </g>
        );
      case 'Master':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="none" stroke={c.secondary} strokeWidth="2" />
            <path d="M50 5 L80 30 L65 85 L50 95 L35 85 L20 30 Z" fill={`url(#grad_${tier})`} />
            <circle cx="50" cy="40" r="15" fill={c.core} filter="url(#glow)" className="animate-pulse" />
            <path d="M50 25 L50 55 M35 40 L65 40" stroke="white" strokeWidth="2" />
          </g>
        );
      case 'Grandmaster':
        return (
          <g>
             <path d="M50 5 L95 20 L80 50 L90 90 L50 80 L10 90 L20 50 L5 20 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="2" />
             <circle cx="50" cy="50" r="20" fill={c.secondary} />
             <path d="M50 35 L60 60 L35 50 Z" fill={c.core} className="animate-spin-slow origin-center" /> 
             <circle cx="50" cy="50" r="8" fill={c.core} className="animate-pulse" />
          </g>
        );
      case 'Challenger':
        return (
          <g>
            <defs>
               <filter id="glow-challenger">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
               </filter>
            </defs>
            {/* Outer Ring */}
            <circle cx="50" cy="50" r="44" stroke={`url(#grad_${tier})`} strokeWidth="2" fill="none" strokeDasharray="10 5" className="animate-spin-slow origin-center" opacity="0.6" />
            <path d="M50 5 L75 25 L85 60 L50 95 L15 60 L25 25 Z" fill={`url(#grad_${tier})`} stroke={c.secondary} strokeWidth="1" />
            
            {/* Inner Core */}
            <path d="M50 20 L65 40 L80 40 L65 60 L70 80 L50 70 L30 80 L35 60 L20 40 L35 40 Z" fill="white" filter="url(#glow-challenger)" />
            <circle cx="50" cy="50" r="5" fill={c.secondary} />
          </g>
        );
      default:
        return <circle cx="50" cy="50" r="40" fill={c.primary} />;
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`grad_${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.primary} />
            <stop offset="50%" stopColor={c.core} />
            <stop offset="100%" stopColor={c.secondary} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Back Glow */}
        <circle cx="50" cy="50" r="40" fill={c.glow} filter="blur(15px)" opacity="0.3" className="animate-pulse" />
        
        {/* Main Emblem Content */}
        {renderPaths()}

        {/* Shine Effect */}
        <path d="M0 0 L100 100" stroke="white" strokeWidth="20" opacity="0" className="animate-shimmer" />
      </svg>
    </div>
  );
};
