import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { Skull, Clock, CheckCircle, XCircle, Award, Calendar } from 'lucide-react';
import { Emblem } from '../components/Emblems';
import { QuickLogModal } from '../components/QuickLogModal';

export const BossPage = () => {
  const { rank, claimBossRewards, saveLog, logs } = useGameStore();
  const [showLog, setShowLog] = React.useState(false);
  
  const { bossState } = rank;
  const isSaturday = new Date().getDay() === 6;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);

  const renderStatus = () => {
      switch(bossState.status) {
          case 'active':
              return <div className="text-emerald-400 font-black text-2xl animate-pulse">BOSS ACTIVE</div>;
          case 'completed':
              return <div className="text-amber-500 font-black text-2xl">DEFEATED</div>;
          case 'failed':
              return <div className="text-red-500 font-black text-2xl">BOSS ESCAPED</div>;
          default:
              return <div className="text-zinc-500 font-black text-2xl">DORMANT</div>;
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Banner */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-red-900/50 bg-black flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black"></div>
            <div className="z-10 text-center space-y-4">
                <Skull size={64} className="mx-auto text-red-500 animate-bounce-slow" />
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest text-shadow-red">Monthly Boss</h1>
                <div className="inline-block px-4 py-1 bg-red-900/30 border border-red-500/30 rounded text-red-300 font-mono text-sm">
                    Cadence: First Saturday
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-red-900/30 bg-gradient-to-br from-zinc-900 to-black">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-200">Boss Status</h2>
                        <p className="text-zinc-500 text-sm">Window: 00:00 - 23:59 Local Time</p>
                    </div>
                    {renderStatus()}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center">
                            <Calendar className="text-zinc-400" />
                        </div>
                        <div>
                            <div className="text-xs uppercase text-zinc-500 font-bold">Event Month</div>
                            <div className="text-lg font-mono text-white">{bossState.monthKey || '---'}</div>
                        </div>
                    </div>

                    {bossState.status === 'active' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            <p className="text-red-200 font-bold mb-2">Requirement</p>
                            <p className="text-white">Log ANY calorie amount today.</p>
                        </div>
                    )}
                    
                    <div className="pt-4">
                        {bossState.status === 'active' && !bossState.result ? (
                             <button 
                                onClick={() => setShowLog(true)}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xl rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95"
                             >
                                 ATTACK BOSS (LOG)
                             </button>
                        ) : bossState.status === 'completed' && !bossState.rewardsClaimed ? (
                             <button 
                                onClick={claimBossRewards}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xl rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                             >
                                 <Award /> CLAIM REWARDS
                             </button>
                        ) : bossState.status === 'completed' ? (
                            <div className="w-full py-4 bg-zinc-800 text-zinc-500 font-bold text-center rounded-xl border border-zinc-700">
                                Rewards Claimed
                            </div>
                        ) : bossState.status === 'failed' ? (
                            <div className="w-full py-4 bg-zinc-900 text-zinc-600 font-bold text-center rounded-xl border border-zinc-800">
                                Better luck next month.
                            </div>
                        ) : (
                            <div className="w-full py-4 bg-zinc-900 text-zinc-500 font-bold text-center rounded-xl border border-zinc-800">
                                Boss Inactive
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="p-8 border-amber-900/30 bg-gradient-to-br from-zinc-900 to-black">
                 <h2 className="text-xl font-bold text-zinc-200 mb-6 flex items-center gap-2">
                     <Award className="text-amber-500" /> Victory Rewards
                 </h2>
                 
                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                         <span className="font-bold text-zinc-300">Consistency Points</span>
                         <span className="font-mono text-blue-400 font-bold text-xl">+100 CP</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                         <span className="font-bold text-zinc-300">Essence</span>
                         <span className="font-mono text-purple-400 font-bold text-xl">+200 Ess</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                         <span className="font-bold text-zinc-300">Boss Badge</span>
                         <Emblem tier="Master" className="w-8 h-8 opacity-50 grayscale" />
                     </div>
                 </div>
                 
                 <div className="mt-8 text-xs text-zinc-500 text-center">
                     *Rewards do not affect Rank LP directly.
                 </div>
            </Card>
        </div>

        {showLog && (
            <QuickLogModal onClose={() => setShowLog(false)} onSave={saveLog} existingLog={todayLog} />
        )}
    </div>
  );
};
