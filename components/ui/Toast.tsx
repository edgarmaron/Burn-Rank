
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Simple Event Emitter for Toast
const listeners: ((toast: ToastMessage) => void)[] = [];

export const toast = {
  success: (msg: string) => emit('success', msg),
  error: (msg: string) => emit('error', msg),
  info: (msg: string) => emit('info', msg),
};

function emit(type: ToastType, message: string) {
  const id = Math.random().toString(36).substring(2, 9);
  listeners.forEach(l => l({ id, type, message }));
}

export const Toaster = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (t: ToastMessage) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(item => item.id !== t.id));
      }, 3000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`flex items-center gap-3 p-4 rounded-lg shadow-2xl border animate-in slide-in-from-bottom-2 fade-in duration-300 ${
            t.type === 'success' ? 'bg-zinc-900 border-emerald-500/50 text-emerald-400' :
            t.type === 'error' ? 'bg-zinc-900 border-red-500/50 text-red-400' :
            'bg-zinc-900 border-blue-500/50 text-blue-400'
          }`}
        >
          {t.type === 'success' && <CheckCircle size={20} />}
          {t.type === 'error' && <AlertCircle size={20} />}
          {t.type === 'info' && <CheckCircle size={20} />}
          <span className="text-sm font-bold text-white">{t.message}</span>
          <button 
             onClick={() => setToasts(prev => prev.filter(i => i.id !== t.id))}
             className="ml-auto text-zinc-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
