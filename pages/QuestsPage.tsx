
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { SKILL_BRANCHES, WEAPONS, RELICS, BANNERS, TITLES } from '../constants';
import { Star, Sword, CheckCircle, Zap, Lock, Unlock, Clock, RotateCcw, Shield, Coins, Crown, Briefcase, Calendar } from 'lucide-react';
import { getQuestProgressAdvanced } from '../utils/questEngine';
import { QuestInstance, Loadout } from '../types';
import { WeaponIcon } from '../components/Weapons';

export const QuestsPage = () => {
  const { logs, profile, claimQuest, questClaims, skills, unlockSkill, rank, activeQuests, unlockItem, updateLoadout } = useGameStore();
  const [activeTab, setActiveTab] = useState<'quests' | 'skills' | 'loadout'>('quests');
  const [timeUntilDaily, setTimeUntilDaily] = useState('');
  const [timeUntilWeekly, setTimeUntilWeekly] = useState('');

  // Timers
  useEffect(() => {
      const tick = () => {
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(24, 0, 0, 0);
          const diffDaily = midnight.getTime() - now.getTime();
          const dh = Math.floor(diffDaily / (1000 * 60 * 60));
          const dm = Math.floor((diffDaily % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilDaily(`${dh}h ${dm}m`);

          const day = now.getDay();
          const nextMonday = new Date(now);
          nextMonday.setDate(now.getDate() + (day === 0 ? 1 : 8 - day));
          nextMonday.setHours(0,0,0,0);
          const diffWeekly = nextMonday.getTime() - now.getTime();
          const wh = Math.floor(diffWeekly / (1000 * 60 * 60));
          setTimeUntilWeekly(`${Math.floor(wh/24)}d ${wh%24}h`);
      };
      tick();
      const interval = setInterval(tick, 60000);
      return () => clearInterval(interval);
  }, []);

  if (!profile) return null;

  // Calculate Spent Essence manually for UI display since rank.essence is total accrued
  const totalSpentSkills = skills.reduce((sum, s) => {
      let def = SKILL_BRANCHES.Consistency.find(p => p.id === s.id);
      if (!def) def = SKILL_BRANCHES.Progression.find(p => p.id === s.id);
      if (!def) def = SKILL_BRANCHES.BossLeague.find(p => p.id === s.id);
      return sum + (def ? def.cost * s.level : 0);
  }, 0);
  
  // Calculate Item Spend
  const totalSpentItems = rank.unlockedItems.reduce((sum, id) => {
      const w = WEAPONS.find(i => i.id === id);
      if (w) return sum + w.unlockCost;
      const r = RELICS.find(i => i.id === id);
      if (r) return sum + r.unlockCost;
      const b = BANNERS.find(i => i.id === id);
      if (b) return sum + b.unlockCost;
      const t = TITLES.find(i => i.id === id);
      if (t) return sum + t.unlockCost;
      return sum;
  }, 0);
  
  const availableEssence = rank.essence - totalSpentSkills - totalSpentItems;

  const renderQuestCard = (q: QuestInstance, type: 'daily' | 'weekly' | 'monthly' | 'seasonal') => {
      const progress = getQuestProgressAdvanced(q, logs, type === 'daily' ? activeQuests.daily.date : type === 'weekly' ? activeQuests.weekly.week : type === 'monthly' ? activeQuests.monthly.month : activeQuests.seasonal.season, rank);
      const isClaimed = questClaims.some(c => c.id === q.id);
      const canClaim = progress.completed && !isClaimed;
      const pct = Math.min(100, Math.round((progress.current / q.targetValue) * 100));

      return (
          <div key={q.id} className="p-4 bg-zinc-900 rounded border border-zinc-800 flex flex-col justify-between h-full relative overflow-hidden">
              {type === 'seasonal' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
              <div>
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-zinc-200">{q.label}</span>
                      {isClaimed && <CheckCircle size={16} className="text-green-500" />}
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-1">
                      <div className={`h-full transition-all duration-500 ${progress.completed ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="text-xs text-right text-zinc-500 mb-3">{progress.current} / {q.targetValue}</div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase mb-4">
                      {q.rewards.lp > 0 && <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">+{q.rewards.lp} LP</span>}
                      {q.rewards.cp > 0 && <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">+{q.rewards.cp} CP</span>}
                      {q.rewards.essence > 0 && <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">+{q.rewards.essence} Ess</span>}
                  </div>
              </div>
              <button 
                  onClick={() => claimQuest(q.id, q.rewards)}
                  disabled={!canClaim}
                  className={`w-full py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isClaimed ? 'bg-zinc-800 text-zinc-500 cursor-default' :
                      canClaim ? 'bg-emerald-500 text-black hover:bg-emerald-400' :
                      'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
              >
                  {isClaimed ? 'Claimed' : canClaim ? 'Claim Reward' : 'In Progress'}
              </button>
          </div>
      );
  };

  const renderSkillBranch = (title: string, perks: typeof SKILL_BRANCHES.Consistency) => (
      <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">{title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {perks.map(perk => {
                   const currentLevel = skills.find(s => s.id === perk.id)?.level || 0;
                   const isMaxed = currentLevel >= perk.maxLevel;
                   const canAfford = availableEssence >= perk.cost;
                   return (
                       <Card key={perk.id} className={`p-6 border flex flex-col justify-between ${currentLevel > 0 ? 'border-amber-500/40 bg-amber-900/10' : 'border-zinc-800'}`}>
                           <div>
                               <div className="flex justify-between items-start mb-2">
                                   <h3 className="font-bold text-zinc-100">{perk.label}</h3>
                                   <div className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">Lvl {currentLevel}/{perk.maxLevel}</div>
                               </div>
                               <p className="text-sm text-zinc-400 mb-4 min-h-[40px]">{perk.description}</p>
                           </div>
                           <button 
                             onClick={() => unlockSkill(perk.id, perk.cost)}
                             disabled={!canAfford || isMaxed}
                             className={`w-full py-2 font-bold rounded border flex items-center justify-center gap-2 transition-all ${
                                 isMaxed ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-default' : 
                                 canAfford ? 'bg-purple-600 border-purple-500 hover:bg-purple-500 text-white' : 
                                 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                             }`}
                           >
                               {isMaxed ? 'Maxed' : <><Unlock size={14} /> Unlock ({perk.cost})</>}
                           </button>
                       </Card>
                   );
               })}
          </div>
      </div>
  );
  
  const renderLoadoutSection = (title: string, items: any[], type: keyof Loadout, currentEquipped: string | null) => (
      <div className="space-y-4 mb-8">
           <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">{title}</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {items.map(item => {
                   const isUnlocked = item.unlockCost === 0 || rank.unlockedItems.includes(item.id);
                   const isEquipped = currentEquipped === item.id;
                   const canAfford = availableEssence >= item.unlockCost;
                   
                   return (
                       <Card key={item.id} className={`p-4 flex flex-col items-center text-center gap-3 relative overflow-hidden group ${isEquipped ? 'border-amber-500 bg-amber-900/20' : isUnlocked ? 'border-zinc-700' : 'border-zinc-800 opacity-60'}`}>
                           {isEquipped && <div className="absolute top-2 right-2 text-amber-500"><CheckCircle size={16} /></div>}
                           
                           {type === 'weaponId' ? <WeaponIcon id={item.id} className={`w-12 h-12 ${isUnlocked ? 'text-white' : 'text-zinc-600'}`} /> : 
                            type === 'relicId' ? <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center"><Briefcase size={24} className={isUnlocked ? 'text-blue-400' : 'text-zinc-600'} /></div> :
                            type === 'bannerId' ? <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center"><Shield size={24} className={isUnlocked ? 'text-red-400' : 'text-zinc-600'} /></div> :
                            <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center"><Crown size={24} className={isUnlocked ? 'text-amber-400' : 'text-zinc-600'} /></div>
                           }
                           
                           <div className="min-h-[40px]">
                               <div className="font-bold text-zinc-200 text-xs leading-tight">{item.name}</div>
                               <div className="text-[10px] text-zinc-500">{item.tier} Tier</div>
                           </div>
                           
                           <div className="text-[10px] text-zinc-400 h-8 overflow-hidden">{item.description}</div>
                           
                           {isUnlocked ? (
                               <button
                                 onClick={() => updateLoadout(type, item.id)}
                                 disabled={isEquipped}
                                 className={`w-full py-1.5 rounded text-xs font-bold ${
                                     isEquipped ? 'bg-amber-500 text-black' : 
                                     'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                 }`}
                               >
                                   {isEquipped ? 'Equipped' : 'Equip'}
                               </button>
                           ) : (
                               <button
                                 onClick={() => unlockItem(item.id, item.unlockCost)}
                                 disabled={!canAfford}
                                 className={`w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 ${
                                     canAfford ? 'bg-purple-600 text-white hover:bg-purple-500' : 
                                     'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                 }`}
                               >
                                   <Unlock size={10} /> {item.unlockCost}
                               </button>
                           )}
                       </Card>
                   )
               })}
           </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                 <Crown className="text-amber-500" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">Progression</h1>
                <p className="text-zinc-400 text-sm">Quests, Skills, and Loadout.</p>
              </div>
           </div>
           
           <Card className="px-6 py-3 bg-zinc-900 border-zinc-700 flex items-center gap-4">
               <div>
                   <div className="text-xs text-zinc-500 uppercase">Essence</div>
                   <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                       <Zap size={20} fill="currentColor" /> {availableEssence}
                   </div>
               </div>
               <div className="text-right border-l border-zinc-700 pl-4">
                   <div className="text-xs text-zinc-500 uppercase">CP</div>
                   <div className="text-xl font-bold text-zinc-100">{rank.cp}</div>
               </div>
           </Card>
       </div>

       {/* Navigation */}
       <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 w-fit">
           {['quests', 'skills', 'loadout'].map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                   {tab}
               </button>
           ))}
       </div>

       {/* Content */}
       {activeTab === 'quests' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="p-6 border-blue-500/20 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                          <Star className="text-blue-400" size={18} /> Daily Quests
                      </h3>
                      <div className="text-xs text-zinc-500 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                          <RotateCcw size={12} /> {timeUntilDaily}
                      </div>
                  </div>
                  <div className="space-y-4 flex-1">
                     {activeQuests.daily.quests.map(q => renderQuestCard(q, 'daily'))}
                  </div>
               </Card>
               
               <div className="space-y-6">
                   <Card className="p-6 border-purple-500/20 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                          <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                              <Star className="text-purple-400" size={18} /> Weekly Quests
                          </h3>
                          <div className="text-xs text-zinc-500 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                              <Clock size={12} /> {timeUntilWeekly}
                          </div>
                      </div>
                      <div className="space-y-4 flex-1">
                         {activeQuests.weekly.quests.map(q => renderQuestCard(q, 'weekly'))}
                      </div>
                   </Card>

                   <div className="grid grid-cols-2 gap-6">
                       <Card className="p-6 border-red-500/20">
                          <div className="mb-4">
                              <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm">
                                  <Calendar className="text-red-400" size={14} /> Monthly
                              </h3>
                          </div>
                          <div className="space-y-4">
                             {activeQuests.monthly.quests.map(q => renderQuestCard(q, 'monthly'))}
                          </div>
                       </Card>
                       <Card className="p-6 border-amber-500/20">
                          <div className="mb-4">
                              <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm">
                                  <Crown className="text-amber-400" size={14} /> Seasonal
                              </h3>
                          </div>
                          <div className="space-y-4">
                             {activeQuests.seasonal.quests.map(q => renderQuestCard(q, 'seasonal'))}
                          </div>
                       </Card>
                   </div>
               </div>
           </div>
       )}

       {activeTab === 'skills' && (
           <div className="space-y-8">
               {renderSkillBranch('Consistency', SKILL_BRANCHES.Consistency)}
               {renderSkillBranch('Progression', SKILL_BRANCHES.Progression)}
               {renderSkillBranch('League & Boss', SKILL_BRANCHES.BossLeague)}
           </div>
       )}

       {activeTab === 'loadout' && (
           <div className="space-y-8">
               {renderLoadoutSection('Weapons (Primary)', WEAPONS, 'weaponId', rank.loadout.weaponId)}
               {renderLoadoutSection('Relics (Passive)', RELICS, 'relicId', rank.loadout.relicId)}
               {renderLoadoutSection('Banners (Cosmetic)', BANNERS, 'bannerId', rank.loadout.bannerId)}
               {renderLoadoutSection('Titles (Display)', TITLES, 'titleId', rank.loadout.titleId)}
           </div>
       )}
    </div>
  );
};
