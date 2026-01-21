import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { TIERS, TIER_CONFIG } from '../constants';
import { TrendingUp, HelpCircle, Lock, ShieldAlert } from 'lucide-react';
import { Emblem } from '../components/Emblems';

export const RankPage = () => {
  const { rank, history } = useGameStore();

  const config = TIER_CONFIG[rank.tier];
  const promoteAt = config.promoteAt;
  
  // Next Goal
  let nextGoal = 'Max Rank';
  const idx = TIERS.indexOf(rank.tier);
  if (idx < TIERS.length - 1) {
      nextGoal = `${TIERS[idx+1]}`;
  }

  // Gates
  const nextTierConfig = idx < TIERS.length - 1 ? TIER_CONFIG[TIERS[idx+1]] : null;
  const daysGate = nextTierConfig?.minDays || 0;
  const daysLeftGate = Math.max(0, daysGate - rank.totalDaysLogged);
  const isGated = daysLeftGate > 0;

  // Stats
  const last14 = history.slice(-14);
  const wins = last14.filter(h => h.result === 'WIN').length;
  const losses = last14.filter(h => h.result === 'LOSS').length;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Ladder View */}
      <Card className="lg:col-span-2 p-6 h-[80vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold mb-6 text-zinc-100">Ranked Ladder</h2>
        <div className="space-y-2 relative">
           <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-zinc-800 z-0"></div>
           
           {[...TIERS].reverse().map((tier) => {
             const isActive = rank.tier === tier;
             const tConfig = TIER_CONFIG[tier];
             
             return (
               <div key={tier} className={`relative z-10 flex items-center gap-4 p-3 rounded-lg border transition-all ${isActive ? 'bg-zinc-800 border-amber-500/50 shadow-lg shadow-amber-900/20' : 'bg-zinc-950/50 border-transparent opacity-60'}`}>
                  <div className="w-12 flex justify-center">
                     <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-zinc-700'}`}></div>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Emblem tier={tier} className="w-10 h-10" />
                        <div>
                           <div className={`font-bold ${tConfig.color}`}>{tier}</div>
                           <div className="text-xs text-zinc-500">Promote: {tConfig.promoteAt} LP {tConfig.minDays ? `• ${tConfig.minDays}d Min` : ''}</div>
                        </div>
                     </div>
                     {isActive && (
                       <div className="text-amber-500 font-mono text-sm font-bold">CURRENT</div>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      </Card>

      {/* Side Stats */}
      <div className="space-y-6">
        {/* Promotion Target */}
        <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-zinc-900">
           <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Next Tier: {nextGoal}
           </h3>
           <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-1">{rank.lp} / {promoteAt}</div>
              <div className="text-sm text-zinc-400">LP Progress</div>
           </div>
           
           {isGated && (
               <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-center mb-4">
                   <div className="flex justify-center text-red-400 mb-1"><Lock size={16} /></div>
                   <div className="text-sm text-zinc-300">Promotion Gated</div>
                   <div className="text-xs text-zinc-500">Need {daysLeftGate} more logged days</div>
               </div>
           )}

           <div className="bg-zinc-950/50 rounded p-3 text-center border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase mb-1">Last 14 Days</div>
              <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                  <span className="text-green-400">{wins} W</span>
                  <span className="text-red-400">{losses} L</span>
              </div>
           </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-6">
            <h3 className="font-bold text-zinc-100 mb-2 flex items-center gap-2">
                <HelpCircle size={16} /> Tier Breakdown ({rank.tier})
            </h3>
            <div className="text-xs text-zinc-400 space-y-2">
                <div className="flex justify-between">
                    <span>Base Win</span>
                    <span className="text-green-400">+{config.baseWin}</span>
                </div>
                <div className="flex justify-between">
                    <span>Base Loss</span>
                    <span className="text-red-400">{config.baseLoss}</span>
                </div>
                <div className="h-px bg-zinc-800 my-2"></div>
                <div className="flex items-center gap-2 text-zinc-500 italic">
                    <ShieldAlert size={12} />
                    Decay applies on missed days.
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};
