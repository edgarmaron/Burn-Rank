import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { Scroll } from 'lucide-react';

export const ChroniclesPage = () => {
  const { profile, history, rank } = useGameStore();

  const generateLore = () => {
     if (history.length < 3) return "The journey has just begun. The pages of history are blank, waiting for your first victories.";
     
     const wins = history.filter(h => h.result === 'WIN').length;
     const losses = history.filter(h => h.result === 'LOSS').length;
     const winRate = Math.round((wins / history.length) * 100);
     
     const recent = history.slice(-7);
     const recentWins = recent.filter(r => r.result === 'WIN').length;
     
     let text = `The warrior ${profile?.name || 'Unknown'} stands at the rank of ${rank.tier} ${rank.division || ''}. `;
     
     if (winRate > 70) text += "A formidable force, crushing challenges with relentless consistency. ";
     else if (winRate > 50) text += "A steady climber, fighting through the days with determination. ";
     else text += "The path is difficult, and the shadows of decay loom close. ";
     
     if (recentWins >= 5) text += "This week has been a triumph, a shining example of discipline. ";
     else if (recentWins <= 2) text += "Recent days have been dark. The discipline wavers. Focus is required to regain honor. ";
     
     return text;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-1000">
       <div className="text-center mb-10">
          <Scroll className="w-16 h-16 mx-auto text-amber-500 mb-4 opacity-80" />
          <h2 className="text-3xl font-serif text-amber-100/80 tracking-widest">THE CHRONICLES</h2>
          <div className="w-32 h-1 bg-amber-500/30 mx-auto mt-4 rounded-full"></div>
       </div>
       
       <Card className="p-8 bg-zinc-900/80 border-amber-500/10 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
          <p className="font-serif text-lg leading-relaxed text-zinc-300 first-letter:text-5xl first-letter:font-bold first-letter:text-amber-500 first-letter:mr-3 first-letter:float-left">
             {generateLore()}
          </p>
          <div className="mt-8 text-right text-sm text-zinc-600 font-mono">
             - Record Keeper
          </div>
       </Card>
    </div>
  );
};