
import React, { useMemo } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Card } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, AreaChart, Area } from 'recharts';
import { Activity, Zap, Scale, Moon, Footprints, Flame, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { safeAvg, safeFloatAvg, getConsistency, getGoalMetCount, getBestDay, calculateTDEE, getCurrentWeight } from '../utils/stats';
import { DEFAULT_GOALS } from '../constants';

export const StatsPage = () => {
  const { logs, history, profile, rank } = useGameStore();

  if (!profile) return null;

  // -- Data Prep --
  const sortedLogs = useMemo(() => [...logs].sort((a,b) => a.date.localeCompare(b.date)), [logs]);
  const last30Logs = sortedLogs.slice(-30); 
  
  // TDEE Calculation
  const currentWeight = getCurrentWeight(logs, profile);
  const tdee = calculateTDEE(profile, currentWeight);

  // Extract values
  const stepValues7 = last30Logs.slice(-7).map(l => l.steps || 0).filter(v => v > 0);
  const stepValues30 = last30Logs.map(l => l.steps || 0).filter(v => v > 0);
  const sleepValues7 = last30Logs.slice(-7).map(l => l.sleepHours || 0).filter(v => v > 0);
  const sleepValues30 = last30Logs.map(l => l.sleepHours || 0).filter(v => v > 0);
  
  // Calorie Stats
  const calorieLogs30 = last30Logs.filter(l => l.calories !== null && l.calories > 0);
  const calorieValues7 = last30Logs.slice(-7).filter(l => l.calories !== null && l.calories > 0).map(l => l.calories as number);
  const calorieValues30 = calorieLogs30.map(l => l.calories as number);
  
  // Averages
  const avgSteps7 = safeAvg(stepValues7);
  const avgSleep7 = safeFloatAvg(sleepValues7);
  const avgCalories7 = safeAvg(calorieValues7);
  const avgCalories30 = safeAvg(calorieValues30);

  // Consistency
  const stepsConsistency = getConsistency(logs, 'steps', 14);
  const sleepConsistency = getConsistency(logs, 'sleepHours', 14);
  const calorieConsistency = getConsistency(logs, 'calories', 14);
  const calorieConsistency30 = Math.round((calorieLogs30.length / 30) * 100);

  // Goals
  const stepGoal = profile.goals.steps || DEFAULT_GOALS.steps;
  const sleepGoal = profile.goals.sleep || DEFAULT_GOALS.sleep;
  
  const stepsMet7 = getGoalMetCount(logs, 'steps', stepGoal, 7);
  const sleepMet7 = getGoalMetCount(logs, 'sleepHours', sleepGoal, 7);

  // Bests
  const bestSteps = getBestDay(logs, 'steps');
  const bestSleep = getBestDay(logs, 'sleepHours');
  const bestCalories = getBestDay(logs, 'calories'); // This might be highest intake, contextually maybe lowest is better? Usually best is consistency. Let's show Max for now or maybe closest to target. 
  // Let's stick to Max logged for "Best" in terms of record keeping, or maybe omit "Best" for calories and show "Deficit".
  
  // Chart Data Construction
  const today = new Date();
  const last30DaysDates = Array.from({length: 30}, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
  });

  const chartData = last30DaysDates.map(date => {
      const log = logs.find(l => l.date === date);
      const histEntry = history.find(h => h.date === date);
      
      let lp = null;
      if (histEntry) {
          const lpMatch = histEntry.rankSnapshot.match(/(\d+) LP/);
          lp = lpMatch ? parseInt(lpMatch[1]) : 0;
      }
      
      return {
          date: date.slice(5), // MM-DD
          lp,
          calories: log?.calories || null, // Allow null for gaps
          steps: log?.steps || 0,
          sleep: log?.sleepHours || 0,
          weight: log?.weightKg || null
      };
  });

  // Insights
  const insights = [];
  if (calorieConsistency < 40) insights.push({ type: 'warn', text: "Low calorie logging rate. Your rank will decay more often." });
  else if (avgCalories7 > tdee * 1.15) insights.push({ type: 'warn', text: "You're trending above maintenance. Tighten portions or add steps." });
  else if (avgCalories7 > 0 && avgCalories7 < tdee * 0.75) insights.push({ type: 'warn', text: "Very low intake trend. Ensure you are fueling enough." });
  
  if (avgSteps7 < stepGoal * 0.7) insights.push({ type: 'warn', text: "Step count is low this week. Try a 10-minute walk." });
  if (parseFloat(avgSleep7) < sleepGoal) insights.push({ type: 'warn', text: `Sleep avg (${avgSleep7}h) is below target. Prioritize recovery.` });
  
  if (insights.length === 0 && calorieConsistency > 80) insights.push({ type: 'good', text: "Excellent discipline across the board. Keep climbing!" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-zinc-900/50">
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Calorie Log Rate</div>
             <div className="text-2xl font-bold text-amber-500">{calorieConsistency}%</div>
             <div className="text-xs text-zinc-600">Last 14 Days</div>
          </Card>
          <Card className="p-4 bg-zinc-900/50">
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Avg Calories</div>
             <div className="text-2xl font-bold text-zinc-100">{avgCalories7 || '—'}</div>
             <div className="text-xs text-zinc-600">7 Day Avg</div>
          </Card>
          <Card className="p-4 bg-zinc-900/50 hidden md:block">
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Step Consistency</div>
             <div className="text-2xl font-bold text-blue-400">{stepsConsistency}%</div>
             <div className="text-xs text-zinc-600">Last 14 Days</div>
          </Card>
          <Card className="p-4 bg-zinc-900/50 hidden md:block">
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Sleep Consistency</div>
             <div className="text-2xl font-bold text-purple-400">{sleepConsistency}%</div>
             <div className="text-xs text-zinc-600">Last 14 Days</div>
          </Card>
          <Card className="p-4 bg-zinc-900/50">
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Total Logs</div>
             <div className="text-2xl font-bold text-zinc-100">{logs.length}</div>
             <div className="text-xs text-zinc-600">Lifetime</div>
          </Card>
          <Card className="p-4 bg-zinc-900/50">
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Consistency Pts</div>
             <div className="text-2xl font-bold text-emerald-500">{rank.cp}</div>
             <div className="text-xs text-zinc-600">Season Total</div>
          </Card>
      </div>

      {/* Insights Banner */}
      {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, i) => (
                  <div key={i} className={`p-3 rounded border flex items-center gap-3 ${
                      insight.type === 'warn' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                      insight.type === 'good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-200'
                  }`}>
                      {insight.type === 'warn' && <AlertCircle size={18} />}
                      {insight.type === 'good' && <CheckCircle size={18} />}
                      {insight.type === 'info' && <Activity size={18} />}
                      <span className="text-sm font-medium">{insight.text}</span>
                  </div>
              ))}
          </div>
      )}

      {/* CALORIES ANALYSIS SECTION */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Flame className="text-amber-500" /> Calories Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-6 h-80">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                           <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                           <YAxis stroke="#52525b" fontSize={10} width={30} domain={['auto', 'auto']} />
                           <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                           {tdee > 0 && (
                               <ReferenceLine y={tdee} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'TDEE', fill: '#10b981', fontSize: 10, position: 'right' }} />
                           )}
                           <Line 
                               type="monotone" 
                               dataKey="calories" 
                               stroke="#f59e0b" 
                               strokeWidth={2} 
                               dot={{r: 3, fill: '#f59e0b'}} 
                               activeDot={{r: 5}}
                               connectNulls={false}
                           />
                       </LineChart>
                   </ResponsiveContainer>
              </Card>
              <div className="space-y-4">
                  <Card className="p-4 bg-amber-500/5 border-amber-500/10">
                      <div className="text-xs text-zinc-500 uppercase font-bold">7 Day Avg</div>
                      <div className="text-2xl font-bold text-white">{avgCalories7 || '—'} <span className="text-sm font-normal text-zinc-500">kcal</span></div>
                      <div className="text-xs text-zinc-500 mt-1">Target: ~{tdee}</div>
                  </Card>
                   <Card className="p-4">
                      <div className="text-xs text-zinc-500 uppercase font-bold">30 Day Avg</div>
                      <div className="text-2xl font-bold text-zinc-300">{avgCalories30 || '—'}</div>
                  </Card>
                   <Card className="p-4">
                      <div className="text-xs text-zinc-500 uppercase font-bold">Logged Days</div>
                      <div className="text-xl font-bold text-zinc-100">{calorieLogs30.length} <span className="text-sm font-normal text-zinc-500">/ 30</span></div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${calorieConsistency30}%` }}></div>
                      </div>
                  </Card>
              </div>
          </div>
      </div>

      {/* WEIGHT TREND */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Scale className="text-emerald-500" /> Weight Trend
          </h2>
          <Card className="p-6 h-64">
             <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData.filter(d => d.weight !== null)}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                     <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                     <YAxis domain={['auto', 'auto']} stroke="#52525b" fontSize={10} width={30} />
                     <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                     <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{r: 3}} />
                 </LineChart>
             </ResponsiveContainer>
          </Card>
      </div>

      {/* STEPS SECTION */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Footprints className="text-blue-500" /> Steps Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-6 h-80">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                           <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                           <YAxis stroke="#52525b" fontSize={10} width={30} />
                           <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                           <ReferenceLine y={stepGoal} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Goal', fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                           <Line type="monotone" dataKey="steps" stroke="#60a5fa" strokeWidth={2} dot={{r: 2}} activeDot={{r: 4}} />
                       </LineChart>
                   </ResponsiveContainer>
              </Card>
              <div className="space-y-4">
                  <Card className="p-4">
                      <div className="text-xs text-zinc-500 uppercase font-bold">7 Day Avg</div>
                      <div className="text-2xl font-bold text-white">{avgSteps7}</div>
                      <div className="text-xs text-zinc-600 mt-1">Goal Met: {stepsMet7}/7 Days</div>
                  </Card>
                   <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                      <div className="text-xs text-zinc-500 uppercase font-bold">Personal Best</div>
                      <div className="text-xl font-bold text-blue-400">{bestSteps?.value || 0}</div>
                      <div className="text-xs text-zinc-500">{bestSteps?.date || '-'}</div>
                  </Card>
              </div>
          </div>
      </div>

      {/* SLEEP SECTION */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Moon className="text-purple-500" /> Sleep Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-6 h-80">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                           <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                           <YAxis stroke="#52525b" fontSize={10} width={30} domain={[0, 12]} />
                           <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                           <ReferenceLine y={sleepGoal} stroke="#a855f7" strokeDasharray="3 3" label={{ value: 'Goal', fill: '#a855f7', fontSize: 10, position: 'right' }} />
                           <Line type="step" dataKey="sleep" stroke="#c084fc" strokeWidth={2} dot={{r: 2}} activeDot={{r: 4}} />
                       </LineChart>
                   </ResponsiveContainer>
              </Card>
              <div className="space-y-4">
                  <Card className="p-4">
                      <div className="text-xs text-zinc-500 uppercase font-bold">7 Day Avg</div>
                      <div className="text-2xl font-bold text-white">{avgSleep7}h</div>
                      <div className="text-xs text-zinc-600 mt-1">Goal Met: {sleepMet7}/7 Days</div>
                  </Card>
                   <Card className="p-4 border-purple-500/20 bg-purple-500/5">
                      <div className="text-xs text-zinc-500 uppercase font-bold">Best Sleep</div>
                      <div className="text-xl font-bold text-purple-400">{bestSleep?.value || 0}h</div>
                      <div className="text-xs text-zinc-500">{bestSleep?.date || '-'}</div>
                  </Card>
              </div>
          </div>
      </div>

    </div>
  );
};
