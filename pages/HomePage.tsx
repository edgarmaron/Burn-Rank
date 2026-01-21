
import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { Emblem } from '../components/Emblems';
import { Flame, Plus, Skull, X, Clock, AlertTriangle, Target, Crown, Zap, Trophy, ArrowUpRight, Scroll, Moon, Footprints, Activity, Scale, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getDashboardMetrics, getLeagueLeaders } from '../utils/gameEngine';
import { getStartWeight, getCurrentWeight, safeAvg, getConsistency } from '../utils/stats';
import { TIER_CONFIG, SEASON_INFO, DAILY_QUOTES, DEFAULT_GOALS, BADGES, TITLES } from '../constants';
import { QuickLogModal } from '../components/QuickLogModal';
import { DailySummaryModal } from '../components/DailySummaryModal';
import { getSeededRandom } from '../utils/rng';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const { profile, rank, saveLog, logs, history, league } = useGameStore();
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);
  const lastHistory = history[history.length - 1];
  
  // -- Data Calculations --
  const sortedLogs = useMemo(() => [...logs].sort((a,b) => a.date.localeCompare(b.date)), [logs]);
  
  const startWeight = useMemo(() => profile ? getStartWeight(logs, profile) : 0, [logs, profile]);
  const currentWeight = useMemo(() => profile ? getCurrentWeight(logs, profile) : 0, [logs, profile]);
  const goalWeight = profile?.goalWeight || 0;
  
  const bmr = useMemo(() => {
    if (!profile) return 0;
    return Math.round((10 * currentWeight) + (6.25 * profile.height) - (5 * profile.age) + (profile.sex === 'male' ? 5 : -161));
  }, [profile, currentWeight]);

  const latestWeightLog = useMemo(() => [...logs].sort((a,b) => b.date.localeCompare(a.date)).find(l => l.weightKg), [logs]);
  const weightDate = latestWeightLog ? latestWeightLog.date : 'Start';

  const totalToLose = startWeight - goalWeight;
  const lostSoFar = startWeight - currentWeight;
  const remaining = currentWeight - goalWeight;
  const progressPct = totalToLose !== 0 ? Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100)) : 0;

  const calConsistencyPct = getConsistency(logs, 'calories', 14);

  const metrics = useMemo(() => {
      return getDashboardMetrics(logs, history, profile!, rank, league);
  }, [logs, history, rank, league, profile]);

  const leagueLeaders = useMemo(() => getLeagueLeaders(league, rank, profile!), [league, rank, profile]);

  const dailyQuote = useMemo(() => {
      const idx = Math.floor(getSeededRandom(todayStr + 'quote') * DAILY_QUOTES.length);
      return DAILY_QUOTES[idx];
  }, [todayStr]);
  
  const recentBadges = useMemo(() => {
      return [...rank.unlockedBadges].reverse().slice(0, 3).map(ub => {
          return BADGES.find(b => b.id === ub.id);
      }).filter(Boolean);
  }, [rank.unlockedBadges]);

  const currentTitle = TITLES.find(t => t.id === rank.loadout.titleId)?.name || 'Recruit';

  useEffect(() => {
    if (todayLog) {
      if (todayLog.calories) setCalories(todayLog.calories.toString());
      if (todayLog.steps) setSteps(todayLog.steps.toString());
      if (todayLog.sleepHours) setSleep(todayLog.sleepHours.toString());
      if (todayLog.weightKg) setWeight(todayLog.weightKg.toString());
    }
  }, [todayLog]);

  useEffect(() => {
      const tick = () => {
          const now = new Date();
          const midnight = new Date();
          midnight.setHours(24, 0, 0, 0);
          const diff = midnight.getTime() - now.getTime();
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${h}h ${m}m`);
      };
      tick();
      const interval = setInterval(tick, 60000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && focusMode) setFocusMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);

  if (!profile) return <div className="text-center p-10 animate-pulse">Initializing Setup...</div>;

  const tempLog = {
    date: todayStr,
    calories: calories ? Number(calories) : null,
    steps: steps ? Number(steps) : null,
    sleepHours: sleep ? Number(sleep) : null,
    weightKg: weight ? Number(weight) : null,
    notes: ''
  };

  const handleSubmit = () => {
    if (!calories) return;
    setSubmitting(true);
    saveLog(tempLog);
    setTimeout(() => {
        setSubmitting(false);
        setShowSummary(true);
        setFocusMode(false);
    }, 600); 
  };

  // Boss active logic
  const isBossActive = rank.bossState.status === 'active';

  if (focusMode) {
      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
              <button onClick={() => setFocusMode(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
                  <X size={32} />
              </button>
              <div className="w-full max-w-lg space-y-8">
                  <div className="text-center space-y-2">
                      <h1 className="text-4xl font-black text-white uppercase tracking-wider">Focus Mode</h1>
                      <p className="text-zinc-500">Log today's performance. No distractions.</p>
                  </div>
                  <div className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-zinc-400 text-sm uppercase font-bold">Calories</label>
                          <input type="number" value={calories} onChange={e => setCalories(e.target.value)} autoFocus className="w-full bg-zinc-900 border border-zinc-700 text-4xl p-4 rounded-xl text-center font-mono text-white focus:border-amber-500 outline-none" placeholder="0" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-zinc-400 text-sm uppercase font-bold">Steps</label>
                              <input type="number" value={steps} onChange={e => setSteps(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-2xl p-3 rounded-xl text-center font-mono text-white focus:border-blue-500 outline-none" placeholder="0" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-zinc-400 text-sm uppercase font-bold">Sleep</label>
                              <input type="number" value={sleep} onChange={e => setSleep(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-2xl p-3 rounded-xl text-center font-mono text-white focus:border-purple-500 outline-none" placeholder="0" />
                          </div>
                      </div>
                  </div>
                  <button onClick={handleSubmit} disabled={!calories} className="w-full bg-white text-black font-black text-xl py-6 rounded-xl hover:bg-zinc-200 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                      SUBMIT MATCH
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-full pb-24">
      
      {/* Top Banner Area */}
      <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex justify-between items-center text-xs md:text-sm">
             <span className="font-bold text-zinc-100 flex items-center gap-2"><Trophy size={14} className="text-amber-500" /> {SEASON_INFO.name}</span>
             <span className="text-zinc-500 font-mono">Ends: {SEASON_INFO.deadline}</span>
          </div>
          
          {/* CP/Essence Panel */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-6">
              <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-bold">CP Progress</span>
                      <span className="text-blue-400">{rank.cp}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(rank.cp % 100)}%` }}></div>
                  </div>
              </div>
              <div className="flex items-center gap-2 border-l border-zinc-700 pl-4">
                  <Zap size={16} className="text-purple-400" fill="currentColor" />
                  <span className="font-bold text-white">{rank.essence}</span>
              </div>
          </div>
      </div>

      {isBossActive && (
          <Link to="/boss" className="block w-full p-4 bg-gradient-to-r from-red-900/50 via-black to-red-900/50 border border-red-500/50 rounded-xl flex items-center justify-center gap-3 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:scale-[1.01] transition-transform">
              <Skull className="text-red-500" size={24} />
              <span className="font-black text-white tracking-widest uppercase text-xl">BOSS ACTIVE: DEFEND THE REALM</span>
          </Link>
      )}

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: LEFT (Rank, League Leaders) */}
        <div className="space-y-6">
            
            {/* Rank Card */}
            <Card className="p-6 relative overflow-hidden group border-zinc-800 bg-zinc-900/80">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Emblem tier={rank.tier} className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                 <div className="flex justify-between items-start">
                     <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1">Current Rank</h2>
                     {metrics.risk === 'DANGER' && (
                         <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-bold animate-pulse">
                             <AlertTriangle size={10} /> AT RISK
                         </span>
                     )}
                 </div>
                 
                 <div className="flex items-center gap-4 my-2">
                     <Emblem tier={rank.tier} className="w-16 h-16" />
                     <div>
                         <div className={`text-3xl font-bold ${TIER_CONFIG[rank.tier].color} uppercase tracking-tighter`}>
                            {rank.tier} {rank.division}
                         </div>
                         <div className="text-sm text-zinc-400 font-mono">
                             {rank.lp} LP
                         </div>
                     </div>
                 </div>
                 
                 <div className="text-xs text-zinc-500 mb-2 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    {currentTitle}
                 </div>

                 <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1 text-zinc-400">
                      <span>Progress</span>
                      <span>{TIER_CONFIG[rank.tier].promoteAt} LP Target</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${rank.series ? 'bg-blue-500' : 'bg-amber-500'}`} 
                        style={{ width: `${Math.min(100, (rank.lp / TIER_CONFIG[rank.tier].promoteAt) * 100)}%` }}
                      />
                    </div>
                 </div>
              </div>
            </Card>

            {/* League Leaders */}
            <Card className="p-0 overflow-hidden bg-zinc-900/50">
               <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center">
                   <h3 className="text-xs uppercase text-zinc-500 font-bold flex items-center gap-2">
                       <Crown size={14} className="text-amber-500" /> League Leaders
                   </h3>
                   <Link to="/league" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
               </div>
               <div className="p-2 space-y-1">
                   {leagueLeaders.map((r) => (
                       <div key={r.id} className={`flex items-center justify-between p-2 rounded ${r.id === 'user' ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-zinc-800/50'}`}>
                           <div className="flex items-center gap-2">
                               <div className="w-5 h-5 flex items-center justify-center font-bold text-xs text-zinc-500">#{r.rank}</div>
                               <Emblem tier={rank.tier} className="w-6 h-6" />
                               <span className={`text-xs font-bold ${r.id === 'user' ? 'text-white' : 'text-zinc-400'}`}>{r.name}</span>
                           </div>
                           <div className="flex items-center gap-3">
                               <div className="text-xs font-mono">{r.lp}</div>
                               {r.trend === 'UP' && <TrendingUp size={12} className="text-emerald-500" />}
                               {r.trend === 'DOWN' && <TrendingDown size={12} className="text-red-500" />}
                               {r.trend === 'FLAT' && <Minus size={12} className="text-zinc-600" />}
                           </div>
                       </div>
                   ))}
               </div>
            </Card>
        </div>

        {/* COLUMN 2: MIDDLE (Action, Threat, Promo) */}
        <div className="space-y-6">
            
            {/* Action Card */}
            <Card className="p-6 border-amber-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950">
               <div className="flex justify-between items-start mb-4">
                   <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <Clock size={18} className="text-zinc-500" />
                       Action Required
                   </h2>
                   <div className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded animate-pulse">
                       {timeLeft} left
                   </div>
               </div>
               
               <div className="text-center py-4">
                   {todayLog?.calories ? (
                       <div className="text-emerald-400 font-bold flex flex-col items-center gap-2">
                           <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                               <Plus size={24} />
                           </div>
                           Entry Logged
                       </div>
                   ) : (
                       <div className="text-zinc-400 text-sm mb-4">
                           Market closes at midnight. Log your calories to avoid LP decay.
                       </div>
                   )}
               </div>

               <button 
                  onClick={() => setShowQuickLog(true)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      todayLog?.calories 
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                      : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  }`}
               >
                  {todayLog?.calories ? 'Edit Entry' : 'Quick Log'}
               </button>
               
               <button onClick={() => setFocusMode(true)} className="w-full mt-3 text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-wider">
                   Enter Focus Mode
               </button>
            </Card>

            {/* Promotion Tracker */}
            <Card className="p-4 bg-zinc-900/50">
               <h3 className="text-xs uppercase text-zinc-500 font-bold mb-3 flex items-center gap-2">
                  <ArrowUpRight size={14} /> Promotion Track
               </h3>
               {metrics.promotionTracker.daysToPromote ? (
                  <div className="flex items-end justify-between">
                     <div>
                        <div className="text-2xl font-bold text-white">{metrics.promotionTracker.lpNeeded} <span className="text-sm font-normal text-zinc-500">LP needed</span></div>
                     </div>
                     <div className="text-right">
                        <div className="text-xl font-bold text-blue-400">~{metrics.promotionTracker.daysToPromote} Days</div>
                        <div className="text-[10px] text-zinc-600">Estimated</div>
                     </div>
                  </div>
               ) : (
                  <div className="text-sm text-zinc-500 italic">Win consistently to see estimation.</div>
               )}
            </Card>

            {/* Threat Level */}
            <Card className="p-4 bg-zinc-900/50">
               <h3 className="text-xs uppercase text-zinc-500 font-bold mb-3 flex items-center gap-2">
                  <Skull size={14} /> Threat Level
               </h3>
               {metrics.nextThreat ? (
                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-300">{metrics.nextThreat.name}</span>
                          <span className={`font-bold ${
                              metrics.nextThreat.risk === 'High' ? 'text-red-500' :
                              metrics.nextThreat.risk === 'Med' ? 'text-orange-400' : 'text-zinc-400'
                          }`}>{metrics.nextThreat.risk} Risk</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${
                              metrics.nextThreat.risk === 'High' ? 'bg-red-500 w-3/4' :
                              metrics.nextThreat.risk === 'Med' ? 'bg-orange-500 w-1/2' : 'bg-zinc-600 w-1/4'
                          }`}></div>
                      </div>
                      <div className="text-left text-[10px] text-zinc-500 mt-1">-{metrics.nextThreat.gap} LP Gap to next rival</div>
                  </div>
               ) : (
                  <div className="text-sm text-emerald-500">No immediate threats.</div>
               )}
            </Card>
        </div>

        {/* COLUMN 3: RIGHT (Vitals, Badges, Loadout) */}
        <div className="space-y-6">
            
            {/* Vitals */}
            <Card className="p-5 border-l-2 border-emerald-500 bg-zinc-900/60">
                <div className="flex justify-between items-start mb-4">
                     <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                         <Scale size={16} className="text-emerald-500" /> Vitals
                     </h3>
                     <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{weightDate}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase">Weight</div>
                         <div className="text-2xl font-bold text-white">{currentWeight} <span className="text-sm font-normal text-zinc-500">kg</span></div>
                     </div>
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase">BMR</div>
                         <div className="text-2xl font-bold text-zinc-300">{bmr} <span className="text-sm font-normal text-zinc-500">kcal</span></div>
                     </div>
                </div>
            </Card>

            {/* Recent Badges */}
            <Card className="p-4 bg-zinc-900/50">
               <div className="flex justify-between items-center mb-3">
                   <h3 className="text-xs uppercase text-zinc-500 font-bold flex items-center gap-2">
                      <Shield size={14} className="text-purple-400" /> Recent Honors
                   </h3>
                   <Link to="/badges" className="text-xs text-zinc-500 hover:text-white">→</Link>
               </div>
               {recentBadges.length > 0 ? (
                   <div className="flex gap-2">
                       {recentBadges.map(b => (
                           <div key={b?.id} className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500 shadow-lg" title={b?.name}>
                               <Shield size={18} />
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-xs text-zinc-500 italic">No badges yet.</div>
               )}
            </Card>

            {/* Daily Wisdom */}
            <Card className="p-4 bg-amber-500/5 border-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                    <Scroll size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-500 uppercase">Daily Wisdom</span>
                </div>
                <p className="text-sm text-zinc-200 italic font-serif leading-relaxed">
                    "{dailyQuote}"
                </p>
            </Card>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 md:hidden z-30">
         <button 
            onClick={() => setShowQuickLog(true)}
            className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-90 transition-transform text-black"
         >
            <Plus size={28} />
         </button>
      </div>

      {showQuickLog && (
        <QuickLogModal 
          onClose={() => setShowQuickLog(false)}
          onSave={(log) => {
             saveLog(log);
          }}
          existingLog={todayLog}
        />
      )}

      {showSummary && todayLog && lastHistory && lastHistory.date === todayStr && (
          <DailySummaryModal 
             entry={lastHistory} 
             streak={rank.streak}
             onClose={() => setShowSummary(false)} 
          />
      )}
    </div>
  );
};
