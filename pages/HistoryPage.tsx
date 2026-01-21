import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';

export const HistoryPage = () => {
  const { history, logs } = useGameStore();
  
  const reversedHistory = [...history].reverse();

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">Match History</h2>
      
      {reversedHistory.length === 0 && (
        <div className="text-center text-zinc-500 py-10">No matches played yet.</div>
      )}

      {reversedHistory.map((item, idx) => {
        const log = logs.find(l => l.date === item.date);
        const isWin = item.result === 'WIN';
        
        return (
          <Card key={idx} className={`p-4 flex flex-col md:flex-row items-center justify-between border-l-4 ${isWin ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
            <div className="flex items-center gap-4 mb-2 md:mb-0 w-full md:w-auto">
               <div className={`w-16 h-16 rounded bg-zinc-800 flex flex-col items-center justify-center font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className="text-xl">{isWin ? 'WIN' : 'LOSS'}</span>
               </div>
               <div>
                  <div className="text-zinc-100 font-bold text-lg">{item.date}</div>
                  <div className="text-xs text-zinc-500">{item.rankSnapshot}</div>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8 text-center w-full md:w-auto">
               <div>
                  <div className="text-xs text-zinc-500 uppercase">Calories</div>
                  <div className="font-mono text-zinc-200">{log?.calories || '-'}</div>
               </div>
               <div>
                  <div className="text-xs text-zinc-500 uppercase">Steps</div>
                  <div className="font-mono text-zinc-200">{log?.steps || '-'}</div>
               </div>
               <div>
                  <div className="text-xs text-zinc-500 uppercase">LP Change</div>
                  <div className={`font-bold ${item.lpChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.lpChange > 0 ? '+' : ''}{item.lpChange}
                  </div>
               </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};