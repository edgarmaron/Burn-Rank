import React from 'react';
import { RankHistoryEntry } from '../types';
import { Copy, Check, Shield } from 'lucide-react';
import { Emblem } from './Emblems';

interface DailySummaryModalProps {
  entry: RankHistoryEntry;
  onClose: () => void;
  streak: number;
}

export const DailySummaryModal = ({ entry, onClose, streak }: DailySummaryModalProps) => {
  const [copied, setCopied] = React.useState(false);

  const isWin = entry.result === 'WIN';
  const isShielded = entry.result === 'SHIELDED';
  
  // Parse Tier from snapshot if possible for emblem display
  const tierMatch = entry.rankSnapshot.match(/^(Iron|Bronze|Silver|Gold|Platinum|Emerald|Diamond|Master|Grandmaster|Challenger)/);
  const tier = tierMatch ? tierMatch[0] as any : 'Iron';

  const handleCopy = () => {
      const text = `Ranked Cut: ${entry.date}\nResult: ${entry.result}\nLP Change: ${entry.lpChange > 0 ? '+' : ''}${entry.lpChange}\nStreak: ${streak}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative">
          {/* Emblem Background Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Emblem tier={tier} className="w-64 h-64" />
          </div>

          {/* Header */}
          <div className={`p-8 text-center relative z-10 ${isWin ? 'bg-amber-500/10' : isShielded ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
              <div className="mb-4 flex justify-center">
                  <Emblem tier={tier} className="w-24 h-24 drop-shadow-xl" />
              </div>
              <h2 className={`text-4xl font-black uppercase tracking-tighter ${isWin ? 'text-amber-500' : isShielded ? 'text-blue-400' : 'text-red-500'}`}>
                  {isWin ? 'Victory' : isShielded ? 'Shielded' : 'Defeat'}
              </h2>
              <div className="mt-2 flex justify-center">
                  <div className="text-5xl font-bold text-white">
                      {entry.lpChange > 0 ? '+' : ''}{entry.lpChange} <span className="text-xl text-zinc-400">LP</span>
                  </div>
              </div>
          </div>

          {/* Breakdown */}
          <div className="p-6 space-y-3 relative z-10 bg-zinc-900/80">
              {entry.details && (
                  <>
                    <div className="flex justify-between text-zinc-400 text-sm">
                        <span>Base Result</span>
                        <span>{entry.details.base}</span>
                    </div>
                    {entry.details.boss !== 0 && (
                        <div className="flex justify-between text-purple-400 text-sm font-bold">
                            <span>Boss Day</span>
                            <span>{entry.details.boss > 0 ? '+' : ''}{entry.details.boss}</span>
                        </div>
                    )}
                    {entry.details.bonus > 0 && (
                         <div className="flex justify-between text-emerald-400 text-sm">
                            <span>Activity Bonus</span>
                            <span>+{entry.details.bonus}</span>
                        </div>
                    )}
                    {entry.details.streak > 0 && (
                         <div className="flex justify-between text-amber-500 text-sm">
                            <span>Streak Bonus</span>
                            <span>+{entry.details.streak}</span>
                        </div>
                    )}
                    {entry.details.shieldUsed && (
                        <div className="flex items-center justify-center gap-2 p-2 bg-blue-500/10 rounded text-blue-300 text-sm font-bold mt-2">
                            <Shield size={16} /> Shield Consumed!
                        </div>
                    )}
                  </>
              )}
          </div>
          
          {/* Actions */}
          <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-4 relative z-10 bg-zinc-900">
              <button onClick={handleCopy} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-200 font-bold">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Share'}
              </button>
              <button onClick={onClose} className="p-3 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors font-bold">
                  Continue
              </button>
          </div>
      </div>
    </div>
  );
};
