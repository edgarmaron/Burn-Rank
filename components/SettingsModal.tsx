import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { X, Download, Upload, Trash2, RefreshCw, Type } from 'lucide-react';

export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { exportData, importData, resetData, recalc, profile, updateProfile } = useGameStore();
  const [motto, setMotto] = useState(profile?.motto || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      importData(e.target.files[0]);
    }
  };

  const handleMottoSave = () => {
      if (profile) {
          updateProfile({ ...profile, motto });
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
        
        <div className="space-y-4">
           {/* Motto Input */}
           <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
               <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block flex items-center gap-2">
                   <Type size={14} /> Personal Motto
               </label>
               <div className="flex gap-2">
                   <input 
                       type="text" 
                       value={motto} 
                       onChange={e => setMotto(e.target.value)}
                       placeholder="Grind in silence..."
                       className="flex-1 bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white"
                   />
                   <button onClick={handleMottoSave} className="bg-amber-500 text-black px-3 rounded text-xs font-bold hover:bg-amber-400">Save</button>
               </div>
           </div>

           <div className="h-px bg-zinc-800 my-2"></div>

           <button onClick={exportData} className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700">
              <span className="flex items-center gap-3">
                 <Download size={18} className="text-blue-400" />
                 <span>Export Save File</span>
              </span>
           </button>
           
           <div className="relative w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700">
              <span className="flex items-center gap-3">
                 <Upload size={18} className="text-emerald-400" />
                 <span>Import Save File</span>
              </span>
              <input type="file" accept=".json" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
           </div>

            <button onClick={() => { recalc(); alert('Recalculated!'); }} className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700">
              <span className="flex items-center gap-3">
                 <RefreshCw size={18} className="text-amber-400" />
                 <span>Force Recalculate Rank</span>
              </span>
           </button>
           
           <div className="h-px bg-zinc-800 my-4"></div>
           
           <button onClick={resetData} className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors border border-red-900/50 text-red-400 hover:text-red-200">
              <span className="flex items-center gap-3">
                 <Trash2 size={18} />
                 <span>Reset All Data</span>
              </span>
           </button>
        </div>
      </div>
    </div>
  );
};