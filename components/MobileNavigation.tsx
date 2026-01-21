
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Home, Trophy, Users, User, Sword, Skull, Shield, BarChart2, History, Scroll, UserCog, Plus, ArrowRight } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { QuickLogModal } from './QuickLogModal';

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
}

const MobileNavItem = ({ to, icon: Icon, label, onClick }: NavItemProps) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-bold">{label}</span>
  </NavLink>
);

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const { saveLog, logs } = useGameStore();
  const location = useLocation();

  // Determine page title based on route
  const getTitle = () => {
      const path = location.pathname;
      if (path === '/') return 'Home';
      if (path === '/rank') return 'Rank';
      if (path === '/league') return 'League';
      if (path === '/profile') return 'Profile';
      if (path === '/quests') return 'Progression';
      if (path === '/boss') return 'Boss';
      if (path === '/badges') return 'Badges';
      if (path === '/stats') return 'Stats';
      if (path === '/history') return 'History';
      if (path === '/chronicles') return 'Chronicles';
      return 'Ranked Cut';
  };

  const closeDrawer = () => setIsOpen(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);

  return (
    <>
      {/* 1. TOP BAR (Fixed) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 z-50 flex items-center justify-between px-4 shadow-xl">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-zinc-400 hover:text-white active:scale-95 transition-transform"
            aria-label="Open Menu"
          >
              <Menu size={24} />
          </button>
          
          <h1 className="text-lg font-black text-white tracking-widest uppercase truncate max-w-[200px]">
              {getTitle()}
          </h1>

          <button 
             onClick={() => setShowQuickLog(true)}
             className="p-2 text-amber-500 hover:text-amber-400 active:scale-95 transition-transform"
          >
              <Plus size={24} />
          </button>
      </div>

      {/* 2. DRAWER (Overlay + Sidebar) */}
      {/* Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />
      
      {/* Drawer Panel */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-zinc-950 border-r border-zinc-800 z-[70] shadow-2xl transition-transform duration-300 transform flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded flex items-center justify-center shadow-lg">
                      <Trophy size={16} className="text-zinc-950" />
                  </div>
                  <span className="font-bold text-lg text-white tracking-tight">Ranked Cut</span>
              </div>
              <button onClick={closeDrawer} className="text-zinc-500 hover:text-white">
                  <X size={24} />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 px-2">Main</div>
              <MobileNavItem to="/" icon={Home} label="Home" onClick={closeDrawer} />
              <MobileNavItem to="/rank" icon={Trophy} label="Rank" onClick={closeDrawer} />
              <MobileNavItem to="/league" icon={Users} label="League" onClick={closeDrawer} />
              <MobileNavItem to="/profile" icon={User} label="Profile" onClick={closeDrawer} />
              
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mt-6 mb-2 px-2">Game</div>
              <MobileNavItem to="/quests" icon={Sword} label="Progression" onClick={closeDrawer} />
              <MobileNavItem to="/boss" icon={Skull} label="Boss" onClick={closeDrawer} />
              <MobileNavItem to="/badges" icon={Shield} label="Badges" onClick={closeDrawer} />
              
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mt-6 mb-2 px-2">Data</div>
              <MobileNavItem to="/stats" icon={BarChart2} label="Stats" onClick={closeDrawer} />
              <MobileNavItem to="/history" icon={History} label="History" onClick={closeDrawer} />
              <MobileNavItem to="/chronicles" icon={Scroll} label="Chronicles" onClick={closeDrawer} />
          </div>
          
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
              <div className="text-xs text-center text-zinc-600 font-mono">v1.0.8 Season 1</div>
          </div>
      </div>

      {/* 3. BOTTOM NAV (Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 z-40 flex items-center justify-around px-2 pb-safe">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
              <Home size={20} />
              <span className="text-[10px] font-bold">Home</span>
          </NavLink>
          <NavLink to="/rank" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
              <Trophy size={20} />
              <span className="text-[10px] font-bold">Rank</span>
          </NavLink>
          
          {/* Center Action Button */}
          <button 
            onClick={() => setShowQuickLog(true)}
            className="flex flex-col items-center justify-center -mt-6"
          >
              <div className="w-14 h-14 rounded-full bg-amber-500 border-4 border-zinc-950 flex items-center justify-center shadow-lg text-zinc-900 active:scale-95 transition-transform">
                  <Plus size={24} strokeWidth={3} />
              </div>
          </button>

          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
              <User size={20} />
              <span className="text-[10px] font-bold">Profile</span>
          </NavLink>
          <button onClick={() => setIsOpen(true)} className={`flex flex-col items-center gap-1 p-2 ${isOpen ? 'text-amber-500' : 'text-zinc-500'}`}>
              <UserCog size={20} />
              <span className="text-[10px] font-bold">More</span>
          </button>
      </div>

      {/* Global Quick Log Modal */}
      {showQuickLog && (
        <QuickLogModal 
          onClose={() => setShowQuickLog(false)}
          onSave={(log) => saveLog(log)}
          existingLog={todayLog}
        />
      )}
    </>
  );
};
