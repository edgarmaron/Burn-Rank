
import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { BADGES } from '../constants';
import { Shield, Lock, Award, Flame, Skull, Crown, Sun, Ghost, Snowflake, Moon, Target, Flag, Clock, Zap } from 'lucide-react';
import { BadgeDetailModal } from '../components/BadgeDetailModal';
import { Badge } from '../types';

export const BadgesPage = () => {
  const { rank } = useGameStore();
  const unlockedIds = rank.unlockedBadges.map(b => b.id);
  const [filter, setFilter] = useState<'all' | 'boss' | 'rank' | 'league' | 'consistency' | 'milestone' | 'seasonal'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const getIcon = (iconName: string, size: number) => {
      switch(iconName) {
          case 'skull': return <Skull size={size} />;
          case 'flame': return <Flame size={size} />;
          case 'flame-blue': return <Flame size={size} className="text-blue-400" />;
          case 'shield': return <Shield size={size} />;
          case 'award': return <Award size={size} />;
          case 'crown': return <Crown size={size} />;
          case 'sun': return <Sun size={size} />;
          case 'moon': return <Moon size={size} />;
          case 'ghost': return <Ghost size={size} />;
          case 'snowflake': return <Snowflake size={size} />;
          case 'target': return <Target size={size} />;
          case 'flag': return <Flag size={size} />;
          case 'clock': return <Clock size={size} />;
          case 'zap': return <Zap size={size} />;
          default: return <Award size={size} />;
      }
  };

  const categories = ['boss', 'rank', 'league', 'consistency', 'milestone', 'seasonal'];
  
  const filteredBadges = BADGES.filter(b => filter === 'all' || b.type === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Shield className="text-amber-500" size={32} />
              </div>
              <div>
                  <h1 className="text-3xl font-bold text-zinc-100">Badges</h1>
                  <p className="text-zinc-400">Achievements and trophies earned through glory.</p>
              </div>
          </div>
          <div className="text-right">
              <div className="text-2xl font-bold text-white">{unlockedIds.length} / {BADGES.length}</div>
              <div className="text-xs text-zinc-500 uppercase">Unlocked</div>
          </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
              All
          </button>
          {categories.map(cat => (
              <button 
                  key={cat}
                  onClick={() => setFilter(cat as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${filter === cat ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBadges.map(badge => {
              const isUnlocked = unlockedIds.includes(badge.id);
              const details = rank.unlockedBadges.find(b => b.id === badge.id);
              
              return (
                  <Card 
                      key={badge.id} 
                      className={`p-4 flex flex-col items-center text-center gap-3 transition-all cursor-pointer group hover:scale-105 ${isUnlocked ? 'bg-zinc-900 border-zinc-700 hover:border-amber-500/50' : 'bg-zinc-950/50 border-zinc-800 opacity-60'}`}
                      onClick={() => setSelectedBadge(badge as any)} // Note: onClick handler added to Card props in prev step or handled via div wrapper
                  >
                      {/* Note: Card component might not pass onClick, assume div wrapper below if needed */}
                      <div onClick={() => setSelectedBadge(badge as any)} className="contents">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${isUnlocked ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-900 border-zinc-700 text-zinc-700'}`}>
                              {isUnlocked ? getIcon(badge.icon, 32) : <Lock size={24} />}
                          </div>
                          
                          <div>
                              <h3 className={`font-bold text-sm ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>{badge.name}</h3>
                              {isUnlocked && (
                                  <div className="text-[10px] text-zinc-500 mt-1">{details?.date}</div>
                              )}
                          </div>
                      </div>
                  </Card>
              );
          })}
      </div>

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
