
import React, { useState } from 'react';
import { Plus, Flame, Footprints, Moon, Weight, X, Save, AlertCircle } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { toast } from './ui/Toast';
import { DailyLog } from '../types';

type LogMode = 'calories' | 'steps' | 'sleep' | 'weight' | null;

export const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<LogMode>(null);
  
  // Modal Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { logs, saveLog } = useGameStore();

  const handleOpenMode = (m: LogMode) => {
    setMode(m);
    setIsOpen(false);
    setDate(new Date().toISOString().split('T')[0]);
    setValue('');
    setError(null);
    
    // Pre-fill if log exists for today
    const today = new Date().toISOString().split('T')[0];
    const log = logs.find(l => l.date === today);
    if (log) {
        if (m === 'calories' && log.calories) setValue(log.calories.toString());
        if (m === 'steps' && log.steps) setValue(log.steps.toString());
        if (m === 'sleep' && log.sleepHours) setValue(log.sleepHours.toString());
        if (m === 'weight' && log.weightKg) setValue(log.weightKg.toString());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mode) return;

    if (!value) {
        // If empty, we could allow clearing? For now user said "Empty input -> do not save"
        setError("Please enter a value.");
        return;
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
        setError("Invalid number.");
        return;
    }

    // Calories Validation
    if (mode === 'calories' && numVal <= 0) {
        setError("Calories must be > 0 for a Ranked Match.");
        return;
    }

    // Merge Logic
    const existingLog = logs.find(l => l.date === date);
    
    // If it's a new log, start fresh. If existing, spread it.
    const newLog: DailyLog = existingLog ? { ...existingLog } : {
        date,
        calories: null,
        steps: null,
        sleepHours: null,
        weightKg: null,
        notes: '',
        isRanked: false 
    };

    // Update specific field
    if (mode === 'calories') {
        newLog.calories = Math.round(numVal);
        newLog.isRanked = true; // Trigger ranked logic
        
        // Add timestamp if not present for "Clutch Log" badge logic
        if (!newLog.timestamp) {
            const now = new Date();
            newLog.timestamp = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        }
    } else if (mode === 'steps') {
        newLog.steps = Math.round(numVal);
    } else if (mode === 'sleep') {
        newLog.sleepHours = numVal;
    } else if (mode === 'weight') {
        newLog.weightKg = numVal;
    }

    saveLog(newLog);
    
    const messages = {
        calories: "Ranked match submitted!",
        steps: "Steps recorded.",
        sleep: "Sleep recorded.",
        weight: "Weight recorded."
    };
    
    toast.success(messages[mode]);
    setMode(null);
  };

  const getIcon = () => {
      switch(mode) {
          case 'calories': return <Flame size={24} className="text-amber-500" />;
          case 'steps': return <Footprints size={24} className="text-blue-500" />;
          case 'sleep': return <Moon size={24} className="text-purple-500" />;
          case 'weight': return <Weight size={24} className="text-emerald-500" />;
          default: return null;
      }
  };

  const getLabel = () => {
      switch(mode) {
          case 'calories': return "Log Calories";
          case 'steps': return "Log Steps";
          case 'sleep': return "Log Sleep";
          case 'weight': return "Log Weight";
          default: return "";
      }
  };

  const getSubLabel = () => {
      switch(mode) {
          case 'calories': return "Ranked Match Entry";
          case 'steps': return "Stats Only (No LP Impact)";
          case 'sleep': return "Stats Only (No LP Impact)";
          case 'weight': return "Stats Only (No LP Impact)";
          default: return "";
      }
  };

  return (
    <>
      {/* FAB & MENU */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-4">
        
        {/* Quick Actions Menu */}
        <div className={`flex flex-col gap-3 transition-all duration-200 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
           <button onClick={() => handleOpenMode('weight')} className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-full shadow-lg hover:bg-zinc-800 transition-colors">
               <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
               <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Weight size={16} /></div>
           </button>
           
           <button onClick={() => handleOpenMode('sleep')} className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-full shadow-lg hover:bg-zinc-800 transition-colors">
               <span className="text-xs font-bold uppercase tracking-wider">Sleep</span>
               <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Moon size={16} /></div>
           </button>

           <button onClick={() => handleOpenMode('steps')} className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-full shadow-lg hover:bg-zinc-800 transition-colors">
               <span className="text-xs font-bold uppercase tracking-wider">Steps</span>
               <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Footprints size={16} /></div>
           </button>

           <button onClick={() => handleOpenMode('calories')} className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-full shadow-lg hover:bg-zinc-800 transition-colors">
               <span className="text-xs font-bold uppercase tracking-wider">Calories</span>
               <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><Flame size={16} /></div>
           </button>
        </div>

        {/* FAB Trigger */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-zinc-800 text-zinc-400 rotate-45' : 'bg-amber-500 text-zinc-950 hover:scale-105 active:scale-95'}`}
        >
            <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* SINGLE FIELD MODAL */}
      {mode && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <div>
                            <h3 className="font-bold text-zinc-100">{getLabel()}</h3>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{getSubLabel()}</p>
                        </div>
                    </div>
                    <button onClick={() => setMode(null)} className="text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1 font-bold">Date</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-zinc-600"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1 font-bold">
                            {mode === 'calories' ? 'Calories (kcal)' : 
                             mode === 'steps' ? 'Steps Count' : 
                             mode === 'sleep' ? 'Hours Slept' : 'Weight (kg)'}
                        </label>
                        <input 
                            type="number" 
                            step={mode === 'steps' || mode === 'calories' ? "1" : "0.1"}
                            value={value}
                            onChange={e => {
                                setValue(e.target.value);
                                if(e.target.value) setError(null);
                            }}
                            autoFocus
                            placeholder="0"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-2xl font-mono text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-2 rounded">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                            mode === 'calories' 
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                            : 'bg-zinc-100 hover:bg-white text-black shadow-white/10'
                        }`}
                    >
                        <Save size={18} />
                        {mode === 'calories' ? 'Submit Match' : 'Save Stats'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
};
