
import React from 'react';
import { Badge, UnlockedBadge } from '../types';
import { X, Calendar, Lock, Unlock } from 'lucide-react';
import { Card } from './ui/Card';

interface BadgeDetailModalProps {
  badge: Badge;
  unlockedInfo?: UnlockedBadge;
  onClose: () => void;
}

export const BadgeDetailModal = ({ badge, unlockedInfo, onClose }: BadgeDetailModalProps) => {
  const isUnlocked = !!unlockedInfo;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Glow Effect */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isUnlocked ? 'from-amber-500 via-yellow-400 to-amber-500' : 'from-zinc-700 via-zinc-600 to-zinc-700'}`}></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10">
          <X size={24} />
        </button>

        <div className="p-8 text-center">
           <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 mb-6 shadow-xl ${isUnlocked ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
               {/* This is a placeholder for actual SVG icons based on badge.icon */}
               <Unlock size={48} className={isUnlocked ? 'opacity-100' : 'opacity-0'} /> 
               {!isUnlocked && <Lock size={32} className="absolute" />}
           </div>

           <h2 className="text-2xl font-bold text-white mb-2">{badge.name}</h2>
           <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase mb-6 ${
               badge.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
               badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
               badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
               'bg-zinc-800 text-zinc-400 border border-zinc-700'
           }`}>
               {badge.rarity} Badge
           </div>

           <p className="text-zinc-300 leading-relaxed mb-8">
               {badge.secret && !isUnlocked ? "???" : badge.description}
           </p>

           {isUnlocked ? (
               <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-800">
                   <div className="text-xs text-zinc-500 uppercase mb-1">Earned On</div>
                   <div className="text-white font-mono flex items-center justify-center gap-2">
                       <Calendar size={14} /> {unlockedInfo.date}
                   </div>
               </div>
           ) : (
               <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 border-dashed text-zinc-500 text-sm">
                   {badge.secret ? "This achievement is hidden." : "Complete the requirements to unlock."}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
