import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { UserProfile } from '../types';

export const OnboardingModal = ({ onClose }: { onClose: () => void }) => {
  const { updateProfile } = useGameStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    sex: 'male',
    activityLevel: 'sedentary',
    goals: {}
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Save
      updateProfile(formData as UserProfile);
      onClose();
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-zinc-800 w-full">
           <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(step/3)*100}%` }}></div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Initialize Profile</h2>
        <p className="text-zinc-400 mb-6 text-sm">Configure your parameters to begin the ranked season.</p>

        <div className="space-y-4">
           {step === 1 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
               <div>
                  <label className="block text-xs uppercase text-zinc-500 mb-1">Codename</label>
                  <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" 
                    onChange={e => handleChange('name', e.target.value)} placeholder="Player One"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Sex</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      onChange={e => handleChange('sex', e.target.value)} value={formData.sex}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Age</label>
                    <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                       onChange={e => handleChange('age', Number(e.target.value))}
                    />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Height (cm)</label>
                    <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                       onChange={e => handleChange('height', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Activity</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                       onChange={e => handleChange('activityLevel', e.target.value)} value={formData.activityLevel}
                    >
                      <option value="sedentary">Sedentary (Office job)</option>
                      <option value="light">Light (1-3 days/wk)</option>
                      <option value="moderate">Moderate (3-5 days/wk)</option>
                      <option value="very">Very Active (6-7 days/wk)</option>
                    </select>
                  </div>
               </div>
             </div>
           )}

           {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs uppercase text-zinc-500 mb-1">Current Weight (kg)</label>
                     <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                        onChange={e => handleChange('weight', Number(e.target.value))}
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase text-zinc-500 mb-1">Goal Weight (kg)</label>
                     <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                        onChange={e => handleChange('goalWeight', Number(e.target.value))}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-xs uppercase text-zinc-500 mb-1">Deadline Date</label>
                   <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      defaultValue="2026-06-30"
                      onChange={e => handleChange('deadline', e.target.value)}
                   />
                </div>
              </div>
           )}
           
           {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 <p className="text-zinc-300 text-sm">Optional Daily Goals (Leave blank for defaults)</p>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs uppercase text-zinc-500 mb-1">Step Goal</label>
                     <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" placeholder="8000"
                        onChange={e => {
                            const val = Number(e.target.value);
                            setFormData(prev => ({ ...prev, goals: { ...prev.goals, steps: val }}));
                        }}
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase text-zinc-500 mb-1">Sleep Goal (Hours)</label>
                     <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" placeholder="7.5"
                        onChange={e => {
                            const val = Number(e.target.value);
                            setFormData(prev => ({ ...prev, goals: { ...prev.goals, sleep: val }}));
                        }}
                     />
                   </div>
                </div>
              </div>
           )}
        </div>

        <div className="mt-8 flex justify-end">
           <button onClick={handleNext} className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-6 rounded transition-colors">
              {step === 3 ? 'Start Season' : 'Next'}
           </button>
        </div>
      </div>
    </div>
  );
};