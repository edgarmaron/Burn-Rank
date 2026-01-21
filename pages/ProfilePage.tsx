
import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { Emblem } from '../components/Emblems';
import { WeaponIcon } from '../components/Weapons';
import { TITLES, SEASON_INFO, BADGES, WEAPONS, RELICS, BANNERS, ACHIEVEMENTS } from '../constants';
import { User, Calendar, Trophy, Zap, Shield, Crown, Edit, Archive, Skull, Lock, Star, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { SettingsModal } from '../components/SettingsModal';
import { SeasonTrailerModal } from '../components/SeasonTrailerModal';
import { BadgeDetailModal } from '../components/BadgeDetailModal';
import { Link } from 'react-router-dom';
import { calculateAchievementProgress } from '../utils/gameEngine';
import { Badge } from '../types';

export const ProfilePage = () => {
  const { profile, rank, history, updateProfile, logs, league, achievementClaims, claimAchievement } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile?.name || '');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!profile) return null;

  const currentTitle = TITLES.find(t => t.id === rank.loadout.titleId);
  const currentWeapon = WEAPONS.find(w => w.id === rank.loadout.weaponId);
  const currentRelic = RELICS.find(r => r.id === rank.loadout.relicId);
  
  // Badge Data
  const recentBadges = [...rank.unlockedBadges].reverse().slice(0, 3).map(ub => BADGES.find(b => b.id === ub.id)).filter(Boolean);
  const allUnlocked = [...rank.unlockedBadges].reverse();
  const showcaseSlots = 8;
  const showcaseBadges = Array.from({ length: showcaseSlots }).map((_, i) => {
      const ub = allUnlocked[i];
      return ub ? BADGES.find(b => b.id === ub.id) : null;
  });

  const saveName = () => {
      if (tempName.trim()) {
          updateProfile({ ...profile, name: tempName });
          setEditingName(false);
      }
  };

  // Achievement Groups
  const categories = ['Consistency', 'Progression', 'League', 'Boss'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
       
       {/* Header Profile Card */}
       <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
           {/* Banner Background */}
           <div className="absolute inset-0 h-32 bg-gradient-to-r from-amber-900/40 via-zinc-900 to-zinc-900"></div>
           
           <div className="relative z-10 px-6 pt-16 pb-6 flex flex-col md:flex-row items-end md:items-center gap-6">
               <div className="relative">
                   <Emblem tier={rank.tier} className="w-32 h-32 md:w-40 md:h-40 filter drop-shadow-2xl" />
                   <div className="absolute -bottom-2 -right-2 bg-zinc-950 text-amber-500 text-xs font-bold px-2 py-1 rounded border border-amber-500/30">
                       {rank.tier} {rank.division}
                   </div>
               </div>
               
               <div className="flex-1 mb-2">
                   <div className="flex items-center gap-3 mb-1">
                       {editingName ? (
                           <div className="flex gap-2">
                               <input value={tempName} onChange={e => setTempName(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-white px-2 py-1 rounded" autoFocus />
                               <button onClick={saveName} className="text-xs bg-emerald-500 text-black px-2 rounded font-bold">Save</button>
                           </div>
                       ) : (
                           <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                               {profile.name}
                               <button onClick={() => setEditingName(true)} className="text-zinc-600 hover:text-white transition-colors"><Edit size={16} /></button>
                           </h1>
                       )}
                   </div>
                   {currentTitle && <div className="text-zinc-400 font-serif italic mb-4">{currentTitle.name}</div>}
                   
                   <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
                       <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50 flex items-center gap-2">
                           <Shield size={12} className="text-amber-500" />
                           <span className="text-xs font-bold text-zinc-300">{rank.unlockedBadges.length} Badges</span>
                       </div>
                       <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50 flex items-center gap-2">
                           <Trophy size={12} className="text-blue-500" />
                           <span className="text-xs font-bold text-zinc-300">{achievementClaims.length} Achievements</span>
                       </div>
                       <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50 flex items-center gap-2">
                           <Skull size={12} className="text-red-500" />
                           <span className="text-xs font-bold text-zinc-300">{rank.unlockedBadges.filter(b => b.id.startsWith('badge_boss')).length} Boss Kills</span>
                       </div>
                       {rank.legacySeasons.length > 0 && (
                            <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50 flex items-center gap-2">
                                <Archive size={12} className="text-purple-500" />
                                <span className="text-xs font-bold text-zinc-300">{rank.legacySeasons.length} Legacy</span>
                            </div>
                       )}
                   </div>

                   <div className="flex gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                       <span>{rank.lp} LP</span>
                       <span>•</span>
                       <span>Season {rank.seasonId.split('_')[1]}</span>
                       <span>•</span>
                       <span>{profile.motto || 'No Motto Set'}</span>
                   </div>
               </div>

               <div className="flex gap-2">
                   <button onClick={() => setShowTrailer(true)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 text-xs font-bold">
                       Replay Intro
                   </button>
                   <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 text-xs font-bold">
                       Edit Profile
                   </button>
               </div>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* LEFT COL */}
           <div className="space-y-6">
               <Card className="p-6">
                   <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2"><Trophy size={16} /> Career Stats</h3>
                   <div className="space-y-3 text-sm">
                       <div className="flex justify-between p-2 bg-zinc-800/50 rounded">
                           <span className="text-zinc-400">Total Days Logged</span>
                           <span className="text-white font-mono font-bold">{rank.totalDaysLogged}</span>
                       </div>
                       <div className="flex justify-between p-2 bg-zinc-800/50 rounded">
                           <span className="text-zinc-400">Best Streak</span>
                           <span className="text-amber-500 font-mono font-bold">{Math.max(rank.streak, 0)} Days</span>
                       </div>
                       <div className="flex justify-between p-2 bg-zinc-800/50 rounded">
                           <span className="text-zinc-400">Highest Rank</span>
                           <span className="text-purple-400 font-mono font-bold">{rank.highestRank}</span>
                       </div>
                   </div>
               </Card>

               <Card className="p-6">
                   <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2"><Crown size={16} /> Active Loadout</h3>
                   <div className="grid grid-cols-4 gap-2">
                       {[currentWeapon, currentRelic].map((item, i) => (
                           <div key={i} className="aspect-square bg-zinc-800 rounded border border-zinc-700 flex flex-col items-center justify-center p-2 text-center" title={item?.name}>
                               {item?.type === 'weapon' ? <WeaponIcon id={item.id} className="w-8 h-8" /> : <Zap size={24} className="text-blue-400" />}
                           </div>
                       ))}
                       <div className="col-span-2 bg-zinc-800 rounded border border-zinc-700 p-2 flex items-center justify-center text-xs text-zinc-500 italic">
                           {currentTitle?.name}
                       </div>
                   </div>
               </Card>

               {rank.legacySeasons.length > 0 && (
                    <Card className="p-6 border-amber-900/20">
                        <h3 className="text-sm font-bold text-amber-500 uppercase mb-4 flex items-center gap-2"><Archive size={16} /> Legacy Archive</h3>
                        <div className="space-y-2">
                            {rank.legacySeasons.map(s => (
                                <div key={s.seasonId} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-amber-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Emblem tier={s.finalTier} className="w-10 h-10 grayscale opacity-70" />
                                        <div>
                                            <div className="font-bold text-white">{s.seasonName}</div>
                                            <div className="text-xs text-zinc-500">Ended {s.endDate} • Best Streak: {s.bestStreak}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-zinc-300">{s.finalTier} {s.finalDivision}</div>
                                        <div className="text-xs text-zinc-500">{s.finalLP} LP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
           </div>

           {/* RIGHT COL (WIDER) */}
           <div className="lg:col-span-2 space-y-8">
                
                {/* Badges & Honors */}
                <Card className="p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Shield size={16} /> Badges & Honors</h3>
                        <Link to="/badges" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                            View All <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-xs text-zinc-500 font-bold uppercase mb-3">Recently Earned</h4>
                        <div className="grid grid-cols-3 gap-4">
                            {recentBadges.length > 0 ? recentBadges.map((badge, i) => (
                                <div key={i} onClick={() => setSelectedBadge(badge as any)} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-zinc-800 hover:border-amber-500/50 transition-all group">
                                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shadow-lg group-hover:scale-110 transition-transform">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-200 text-sm leading-tight">{badge?.name}</div>
                                        <div className="text-[10px] text-zinc-500 mt-1">{badge?.rarity}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-3 text-center py-6 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                                    No badges yet. Win your first day to earn one.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs text-zinc-500 font-bold uppercase mb-3">Showcase</h4>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {showcaseBadges.map((badge, i) => (
                                <div key={i} 
                                    onClick={() => badge && setSelectedBadge(badge as any)}
                                    className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${
                                        badge ? 'bg-zinc-800 border-zinc-700 cursor-pointer hover:border-zinc-500 text-zinc-300' : 'bg-zinc-900/50 border-zinc-800 text-zinc-700'
                                    }`}
                                >
                                    {badge ? <Shield size={16} /> : <Lock size={14} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Achievements */}
                <Card className="p-6">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase mb-6 flex items-center gap-2"><Star size={16} /> Achievements</h3>
                    
                    <div className="space-y-8">
                        {categories.map(cat => {
                            const catAchievs = ACHIEVEMENTS.filter(a => a.category === cat);
                            if (catAchievs.length === 0) return null;

                            return (
                                <div key={cat}>
                                    <h4 className="text-xs text-zinc-500 font-bold uppercase mb-3 border-b border-zinc-800 pb-1">{cat}</h4>
                                    <div className="space-y-4">
                                        {catAchievs.map(ach => {
                                            const progress = calculateAchievementProgress(ach, rank, logs, league, achievementClaims);
                                            
                                            return (
                                                <div key={ach.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${progress.completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                                        {progress.completed ? <CheckCircle size={20} /> : <Star size={20} />}
                                                    </div>
                                                    
                                                    <div className="flex-1 w-full">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="font-bold text-zinc-200">{ach.name}</div>
                                                            <div className="text-xs font-mono text-zinc-500">
                                                                {progress.current} / {progress.target}
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-1">
                                                            <div className={`h-full transition-all duration-1000 ${progress.completed ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress.percent}%` }}></div>
                                                        </div>
                                                        <div className="text-xs text-zinc-500">{ach.description}</div>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        {progress.claimed ? (
                                                            <div className="px-3 py-1 bg-zinc-800 text-zinc-500 text-xs font-bold rounded border border-zinc-700">
                                                                Completed
                                                            </div>
                                                        ) : progress.completed ? (
                                                            <button 
                                                                onClick={() => claimAchievement(ach.id, ach.reward)}
                                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded shadow-lg animate-pulse"
                                                            >
                                                                Claim Reward
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-col items-end text-xs text-zinc-600 font-mono">
                                                                {ach.reward.cp > 0 && <span>+{ach.reward.cp} CP</span>}
                                                                {ach.reward.essence > 0 && <span>+{ach.reward.essence} Ess</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

           </div>
       </div>

       {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
       {showTrailer && <SeasonTrailerModal onClose={() => setShowTrailer(false)} />}
       {selectedBadge && (
          <BadgeDetailModal 
              badge={selectedBadge} 
              unlockedInfo={rank.unlockedBadges.find(b => b.id === selectedBadge.id)}
              onClose={() => setSelectedBadge(null)}
          />
       )}
    </div>
  );
};
