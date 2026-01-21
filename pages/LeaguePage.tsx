
import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { WEEKLY_EVENTS } from '../constants';
import { TrendingUp, TrendingDown, Minus, Crown, Target, Shield } from 'lucide-react';
import { Rival } from '../types';
import { Emblem } from '../components/Emblems';
import { WeaponIcon } from '../components/Weapons';

export const LeaguePage = () => {
  const { rank, league, profile, history } = useGameStore();

  if (!profile || !league) return <div className="text-center p-10">Initializing League...</div>;

  const event = WEEKLY_EVENTS.find(e => e.id === league.weeklyEvent) || WEEKLY_EVENTS[0];

  const userEntry: Rival = {
      id: 'user',
      name: profile.name || 'You',
      personality: 'Standard',
      lp: rank.lp,
      lastResult: history.length > 0 ? (history[history.length-1].result === 'WIN' ? 'W' : 'L') : '-',
      trend: rank.streak > 0 ? 'UP' : 'FLAT',
      history: [],
      lastRank: 0,
      equippedWeaponId: rank.loadout.weaponId || 'iron_dagger'
  };

  const allRacers = [...league.rivals, userEntry].sort((a,b) => b.lp - a.lp);
  
  const userIndex = allRacers.findIndex(r => r.id === 'user');
  const rivalAbove = userIndex > 0 ? allRacers[userIndex - 1] : null;
  const rivalBelow = userIndex < allRacers.length - 1 ? allRacers[userIndex + 1] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Watermark */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
          <Emblem tier={rank.tier} className="w-[800px] h-[800px]" />
      </div>

      {/* League Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
              <Emblem tier={rank.tier} className="w-20 h-20 drop-shadow-2xl" />
              <div>
                  <h1 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter">
                      {rank.tier} {rank.division}
                  </h1>
                  <p className="text-sm text-zinc-400 font-mono">Series ID: {league.id.slice(-8)}</p>
              </div>
          </div>
          
          <Card className={`px-4 py-2 border flex items-center gap-3 ${event.id === 'none' ? 'border-zinc-700 bg-zinc-900' : 'border-purple-500/50 bg-purple-900/20'}`}>
              <div>
                  <div className="text-xs text-zinc-500 uppercase">Current Event</div>
                  <div className="font-bold text-zinc-200">{event.label}</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-zinc-700 mx-2"></div>
              <div className="text-xs max-w-[200px] text-zinc-400 leading-tight hidden md:block">
                  {event.desc}
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Main Table */}
          <Card className="lg:col-span-2 overflow-hidden border-zinc-800 bg-zinc-900/90 backdrop-blur">
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="bg-zinc-950/50 border-b border-zinc-800">
                              <th className="p-4 text-zinc-500 font-medium w-16 text-center">#</th>
                              <th className="p-4 text-zinc-500 font-medium w-16">Rank</th>
                              <th className="p-4 text-zinc-500 font-medium">Gladiator</th>
                              <th className="p-4 text-zinc-500 font-medium text-center">Trend</th>
                              <th className="p-4 text-zinc-500 font-medium text-center hidden md:table-cell">Last</th>
                              <th className="p-4 text-zinc-500 font-medium text-right">LP</th>
                          </tr>
                      </thead>
                      <tbody>
                          {allRacers.map((r, i) => {
                              const pos = i + 1;
                              const isUser = r.id === 'user';
                              const isPromo = pos <= 3;
                              const isDanger = pos >= 18;
                              
                              return (
                                  <tr key={r.id} className={`border-b border-zinc-800/50 transition-colors ${isUser ? 'bg-amber-500/10 hover:bg-amber-500/20 box-border border-l-2 border-l-amber-500' : 'hover:bg-zinc-800/30'}`}>
                                      <td className="p-4 font-mono text-center font-bold">
                                          <span className={isPromo ? 'text-amber-400' : isDanger ? 'text-red-400' : 'text-zinc-500'}>{pos}</span>
                                      </td>
                                      <td className="p-4">
                                          <Emblem tier={rank.tier} className="w-8 h-8" />
                                      </td>
                                      <td className="p-4">
                                          <div className="flex items-center gap-3">
                                              {r.equippedWeaponId && <WeaponIcon id={r.equippedWeaponId} className="w-6 h-6 opacity-80" />}
                                              <div>
                                                  <div className={`font-bold ${isUser ? 'text-white' : 'text-zinc-300'}`}>
                                                      {r.name} {isUser && <span className="text-[10px] bg-amber-500 text-black px-1 rounded ml-2">YOU</span>}
                                                  </div>
                                                  {r.personality !== 'Standard' && <div className="text-[10px] text-zinc-500">{r.personality}</div>}
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-4 text-center">
                                          {r.trend === 'UP' && <TrendingUp size={16} className="mx-auto text-emerald-500" />}
                                          {r.trend === 'DOWN' && <TrendingDown size={16} className="mx-auto text-red-500" />}
                                          {r.trend === 'FLAT' && <Minus size={16} className="mx-auto text-zinc-600" />}
                                      </td>
                                      <td className="p-4 text-center hidden md:table-cell">
                                          <span className={`font-mono font-bold ${r.lastResult === 'W' ? 'text-emerald-500' : r.lastResult === 'L' ? 'text-red-500' : 'text-zinc-600'}`}>
                                              {r.lastResult}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right font-mono font-bold text-zinc-100 text-lg">
                                          {r.lp}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </Card>

          {/* Side Panel */}
          <div className="space-y-6">
              <Card className="p-6">
                  <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
                      <Target size={18} className="text-blue-500" /> Targets
                  </h3>
                  <div className="space-y-4">
                      {rivalAbove ? (
                          <div className="p-3 rounded bg-zinc-900/50 border border-zinc-800">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-zinc-500 text-xs uppercase font-bold">Overtake</span>
                                  <span className="text-red-400 text-xs font-mono font-bold">+{rivalAbove.lp - rank.lp} LP Gap</span>
                              </div>
                              <div className="font-bold text-lg text-zinc-200">{rivalAbove.name}</div>
                          </div>
                      ) : (
                          <div className="p-4 text-center text-amber-500 font-bold bg-amber-500/10 rounded border border-amber-500/20">
                              <Crown size={24} className="mx-auto mb-2" /> League Leader
                          </div>
                      )}

                      {rivalBelow && (
                          <div className="p-3 rounded bg-zinc-900/50 border border-zinc-800">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-zinc-500 text-xs uppercase font-bold">Pursuer</span>
                                  <span className="text-emerald-400 text-xs font-mono font-bold">-{rank.lp - rivalBelow.lp} LP Gap</span>
                              </div>
                              <div className="font-bold text-lg text-zinc-200">{rivalBelow.name}</div>
                          </div>
                      )}
                  </div>
              </Card>

              <Card className="p-6">
                  <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
                      <Shield size={18} className="text-zinc-400" /> Zone Info
                  </h3>
                  <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded bg-amber-900/20 text-amber-200">
                          <span>Promotion Zone</span>
                          <span className="font-bold">Top 3</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-red-900/20 text-red-200">
                          <span>Danger Zone</span>
                          <span className="font-bold">Bottom 3</span>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};
