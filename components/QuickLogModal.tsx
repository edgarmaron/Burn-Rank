
import React, { useState } from 'react';
import { X, Flame, Footprints, Moon, Weight, Save, Shield, AlertCircle } from 'lucide-react';
import { DailyLog } from '../types';
import { toast } from './ui/Toast';

interface QuickLogModalProps {
  onClose: () => void;
  onSave: (log: DailyLog) => void;
  initialDate?: string;
  existingLog?: DailyLog;
}

export const QuickLogModal = ({ onClose, onSave, initialDate, existingLog }: QuickLogModalProps) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [calories, setCalories] = useState(existingLog?.calories?.toString() || '');
  const [steps, setSteps] = useState(existingLog?.steps?.toString() || '');
  const [sleep, setSleep] = useState(existingLog?.sleepHours?.toString() || '');
  const [weight, setWeight] = useState(existingLog?.weightKg?.toString() || '');
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [error, setError] = useState<string | null>(null);

  // Determine if this log was already ranked/submitted
  const wasRanked = existingLog?.isRanked ?? (existingLog?.calories !== null && existingLog?.calories !== undefined);

  const getLogObject = (submitAsRanked: boolean): DailyLog => {
    // Preserve timestamp if editing, or create new if submitting for first time
    let timestamp = existingLog?.timestamp;
    if (submitAsRanked && !timestamp) {
        const now = new Date();
        timestamp = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    }

    return {
      date,
      calories: calories ? Number(calories) : null,
      steps: steps ? Number(steps) : null,
      sleepHours: sleep ? Number(sleep) : null,
      weightKg: weight ? Number(weight) : null,
      notes,
      timestamp,
      // If submitting match: true.
      // If saving stats: keep existing status (don't un-submit) or false if never submitted.
      isRanked: submitAsRanked ? true : (wasRanked || false)
    };
  };

  const handleSaveStats = (e: React.MouseEvent) => {
    e.preventDefault();
    const log = getLogObject(false);
    onSave(log);
    toast.success("Stats saved");
    onClose();
  };

  const handleSubmitMatch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!calories || Number(calories) <= 0) {
        setError("Calories required to submit a ranked match.");
        return;
    }
    const log = getLogObject(true);
    onSave(log);
    toast.success("Match submitted");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="text-amber-500" size={20} />
            Quick Log
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form className="p-4 space-y-4">
          <div>
            <label className="block text-xs uppercase text-zinc-500 mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-xs uppercase text-zinc-500">Calories</label>
             </div>
             <input 
                type="number" 
                value={calories} 
                onChange={e => {
                    setCalories(e.target.value);
                    if (e.target.value) setError(null);
                }}
                placeholder="Optional for stats only"
                className={`w-full bg-zinc-950 border rounded p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors ${error ? 'border-red-500' : 'border-zinc-700'}`}
                autoFocus
             />
             <div className="flex justify-between items-center mt-1">
                 <span className="text-[10px] text-amber-500 italic">*Calories required for ranked match.</span>
                 <span className="text-[10px] text-zinc-500">Optional for stats.</span>
             </div>
             {error && (
                 <div className="flex items-center gap-2 text-red-400 text-xs mt-2 animate-in fade-in slide-in-from-top-1">
                     <AlertCircle size={12} /> {error}
                 </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs uppercase text-zinc-500 mb-1">Steps</label>
               <div className="relative">
                 <Footprints className="absolute left-3 top-2.5 text-zinc-600" size={14} />
                 <input 
                    type="number" 
                    value={steps} 
                    onChange={e => setSteps(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 pl-9 text-white"
                 />
               </div>
            </div>
            <div>
               <label className="block text-xs uppercase text-zinc-500 mb-1">Sleep (Hrs)</label>
               <div className="relative">
                 <Moon className="absolute left-3 top-2.5 text-zinc-600" size={14} />
                 <input 
                    type="number" 
                    value={sleep} 
                    onChange={e => setSleep(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 pl-9 text-white"
                 />
               </div>
            </div>
          </div>

          <div>
             <label className="block text-xs uppercase text-zinc-500 mb-1">Weight (kg)</label>
             <div className="relative">
               <Weight className="absolute left-3 top-2.5 text-zinc-600" size={14} />
               <input 
                  type="number" 
                  value={weight} 
                  onChange={e => setWeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 pl-9 text-white"
               />
             </div>
          </div>

          <div>
             <label className="block text-xs uppercase text-zinc-500 mb-1">Notes</label>
             <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white h-20 resize-none text-sm"
                placeholder="How did it go?"
             />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
                type="button"
                onClick={handleSaveStats}
                className="py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700"
            >
                <Shield size={16} />
                Save Stats
            </button>
            <button 
                type="button"
                onClick={handleSubmitMatch}
                className="py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
            >
                <Save size={18} />
                Submit Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
