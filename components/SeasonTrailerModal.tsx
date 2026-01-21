
import React, { useEffect, useState } from 'react';
import { SEASON_INFO } from '../constants';
import { Emblem } from './Emblems';
import { ArrowRight, Star } from 'lucide-react';

export const SeasonTrailerModal = ({ onClose }: { onClose: () => void }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
      const t = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] scale-[2]">
                <Emblem tier="Challenger" className="w-[500px] h-[500px]" />
            </div>
        </div>

        <div className={`relative z-10 max-w-2xl w-full text-center transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-2 text-amber-500 font-bold tracking-[0.2em] text-sm uppercase">Welcome To</div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                Season {SEASON_INFO.id.split('_')[1]}
            </h1>
            <h2 className="text-3xl font-serif text-amber-100 mb-8 italic">"{SEASON_INFO.name}"</h2>
            
            <p className="text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
                {SEASON_INFO.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-12">
                {SEASON_INFO.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Star className="text-amber-500 fill-amber-500" size={16} />
                        <span className="font-bold text-sm text-zinc-200">{feature}</span>
                    </div>
                ))}
            </div>

            <button 
                onClick={onClose}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black text-lg uppercase tracking-widest hover:bg-amber-400 transition-colors rounded-none clip-path-slant"
            >
                Enter The Arena <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </div>
  );
};
