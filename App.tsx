
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Trophy, BarChart2, History, Scroll, UserCog, Sword, Users, Skull, Shield, User } from 'lucide-react';
import { GameProvider, useGameStore } from './hooks/useGameStore';
import { HomePage } from './pages/HomePage';
import { RankPage } from './pages/RankPage';
import { StatsPage } from './pages/StatsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChroniclesPage } from './pages/ChroniclesPage';
import { QuestsPage } from './pages/QuestsPage';
import { LeaguePage } from './pages/LeaguePage';
import { BossPage } from './pages/BossPage';
import { BadgesPage } from './pages/BadgesPage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { SeasonTrailerModal } from './components/SeasonTrailerModal';
import { CURRENT_SEASON_ID } from './constants';
import { MobileNavigation } from './components/MobileNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/Toast';
import { QuickActions } from './components/QuickActions';

// Desktop Sidebar Item
const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
          isActive
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
        }`
      }
    >
      <Icon size={20} strokeWidth={2} />
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { profile, showOnboarding, setShowOnboarding, rank, markSeasonSeen } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
      if (profile && rank.lastSeenSeasonId !== CURRENT_SEASON_ID) {
          setShowTrailer(true);
      }
  }, [profile, rank.lastSeenSeasonId]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-zinc-100 selection:bg-amber-500/30">
      
      {/* MOBILE NAV SYSTEM */}
      <MobileNavigation />

      {/* GLOBAL FAB */}
      <QuickActions />

      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <nav className="hidden md:flex z-40 w-64 bg-surface border-r border-border flex-col justify-between p-4 sticky top-0 h-screen">
        <div className="flex flex-col w-full gap-4 mb-8">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy size={18} className="text-zinc-950" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
              Ranked Cut
            </h1>
          </div>
          
          <div className="flex flex-col gap-1">
            <NavItem to="/" icon={Home} label="Home" />
            <NavItem to="/rank" icon={Trophy} label="Rank" />
            <NavItem to="/league" icon={Users} label="League" />
            <NavItem to="/profile" icon={User} label="Profile" />
            <NavItem to="/quests" icon={Sword} label="Progression" />
            <NavItem to="/boss" icon={Skull} label="Boss" />
            <NavItem to="/badges" icon={Shield} label="Badges" />
            <NavItem to="/stats" icon={BarChart2} label="Stats" />
            <NavItem to="/history" icon={History} label="History" />
            <NavItem to="/chronicles" icon={Scroll} label="Chronicles" />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-border">
             <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors text-sm"
              >
                <UserCog size={20} />
                <span>Settings</span>
              </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 md:p-8 pt-20 pb-24 md:pb-8 md:pt-8 w-full max-w-7xl mx-auto relative">
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
        <Toaster />
      </main>

      {/* Modals */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showTrailer && <SeasonTrailerModal onClose={() => { markSeasonSeen(); setShowTrailer(false); }} />}
    </div>
  );
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/rank" element={<RankPage />} />
      <Route path="/league" element={<LeaguePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/quests" element={<QuestsPage />} />
      <Route path="/boss" element={<BossPage />} />
      <Route path="/badges" element={<BadgesPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/chronicles" element={<ChroniclesPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <GameProvider>
          <Layout>
            <AppContent />
          </Layout>
        </GameProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
