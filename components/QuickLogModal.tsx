import React, { useState } from 'react';
import { X, Flame, Footprints, Moon, Weight, Save } from 'lucide-react';
import { DailyLog } from '../types';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calories) return;

    onSave({
      date,
      calories: calories ? Number(calories) : null,
      steps: steps ? Number(steps) : null,
      sleepHours: sleep ? Number(sleep) : null,
      weightKg: weight ? Number(weight) : null,
      notes
    });
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
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
             <label className="block text-xs uppercase text-zinc-500 mb-1">Calories (Required)</label>
             <input 
                type="number" 
                value={calories} 
                onChange={e => setCalories(e.target.value)}
                placeholder="e.g. 2100"
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                autoFocus
             />
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

          <button 
             type="submit"
             disabled={!calories}
             className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${!calories ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
          >
             <Save size={18} />
             Save Entry
          </button>
        </form>
      </div>
    </div>
  );
};