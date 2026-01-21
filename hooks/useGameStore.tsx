
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, DailyLog, RankState, UserProfile, RankHistoryEntry, QuestClaim, SkillPerk, LeagueState, ActiveQuestsState, QuestRewards, UnlockedBadge, Loadout } from '../types';
import { getInitialRank, recomputeHistory, isBossDay, getBossMonthKey } from '../utils/gameEngine';
import { generateDailyQuests, generateWeeklyQuests, generateMonthlyQuests, generateSeasonalQuests, getWeekId, getMonthId } from '../utils/questEngine';
import { CURRENT_SEASON_ID, WEAPONS, RELICS, BANNERS, TITLES } from '../constants';

interface GameContextType {
  profile: UserProfile | null;
  logs: DailyLog[];
  questClaims: QuestClaim[];
  achievementClaims: string[];
  skills: SkillPerk[];
  rank: RankState;
  history: RankHistoryEntry[];
  league: LeagueState | null;
  activeQuests: ActiveQuestsState;
  isLoading: boolean;
  saveLog: (log: DailyLog) => void;
  updateProfile: (profile: UserProfile) => void;
  claimQuest: (id: string, rewards: QuestRewards) => void;
  claimAchievement: (id: string, rewards: { cp: number; essence: number }) => void;
  unlockSkill: (id: string, cost: number) => void;
  unlockItem: (id: string, cost: number) => void;
  updateLoadout: (type: keyof Loadout, id: string) => void;
  claimBossRewards: () => void;
  markSeasonSeen: () => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  resetData: () => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  recalc: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'ranked_cut_save_v1';
const CURRENT_VERSION = 8;

const DEFAULT_ACTIVE_QUESTS: ActiveQuestsState = {
    daily: { date: '', quests: [] },
    weekly: { week: '', quests: [] },
    monthly: { month: '', quests: [] },
    seasonal: { season: '', quests: [] }
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [questClaims, setQuestClaims] = useState<QuestClaim[]>([]);
  const [achievementClaims, setAchievementClaims] = useState<string[]>([]);
  const [skills, setSkills] = useState<SkillPerk[]>([]);
  const [rank, setRank] = useState<RankState>(getInitialRank());
  const [history, setHistory] = useState<RankHistoryEntry[]>([]);
  const [league, setLeague] = useState<LeagueState | null>(null);
  const [activeQuests, setActiveQuests] = useState<ActiveQuestsState>(DEFAULT_ACTIVE_QUESTS);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppData = JSON.parse(saved);
        const version = parsed.version || 1;
        
        setProfile(parsed.profile);
        setLogs(parsed.logs);
        setQuestClaims(parsed.questClaims || []);
        setAchievementClaims(parsed.achievementClaims || []);
        setSkills(parsed.skills || []);
        
        let loadedQuests = parsed.activeQuests || DEFAULT_ACTIVE_QUESTS;
        if (!loadedQuests.monthly) loadedQuests.monthly = { month: '', quests: [] };
        if (!loadedQuests.seasonal) loadedQuests.seasonal = { season: '', quests: [] };
        setActiveQuests(loadedQuests);
        
        if (version < 8) {
            console.log("Migrating to v8...");
        }

      } catch (e) {
        console.error("Failed to load save", e);
      }
    } else {
      setShowOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  // Quest Generation Effect
  useEffect(() => {
     if (!profile) return;
     
     const today = new Date().toISOString().split('T')[0];
     const thisWeek = getWeekId(new Date());
     const thisMonth = getMonthId(new Date());
     
     let needsUpdate = false;
     let newActive = { ...activeQuests };

     if (newActive.daily.date !== today) {
         newActive.daily = { date: today, quests: generateDailyQuests(today, profile) };
         needsUpdate = true;
     }

     if (newActive.weekly.week !== thisWeek) {
         newActive.weekly = { week: thisWeek, quests: generateWeeklyQuests(thisWeek, profile) };
         needsUpdate = true;
     }

     if (newActive.monthly.month !== thisMonth) {
         newActive.monthly = { month: thisMonth, quests: generateMonthlyQuests(thisMonth, profile) };
         needsUpdate = true;
     }
     
     if (newActive.seasonal.season !== CURRENT_SEASON_ID) {
         newActive.seasonal = { season: CURRENT_SEASON_ID, quests: generateSeasonalQuests(CURRENT_SEASON_ID, profile) };
         needsUpdate = true;
     }

     if (needsUpdate) {
         setActiveQuests(newActive);
         persist();
     }
  }, [profile, activeQuests]);

  const persist = () => {
      const data: AppData = {
          version: CURRENT_VERSION,
          profile, logs, questClaims, achievementClaims, skills, league, activeQuests
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    if (!profile) return;
    const { currentRank, history: newHistory, league: newLeague } = recomputeHistory(
        logs, profile, questClaims, skills, rank.loadout, rank.unlockedItems, rank.unlockedBadges, rank.legacySeasons, rank.lastSeenSeasonId
    );
    // Adjust rank CP/Essence with achievement claims if needed, but for now we apply them directly on claim
    setRank(currentRank);
    setHistory(newHistory);
    setLeague(newLeague);
    persist();
  }, [logs, profile, questClaims, skills, activeQuests]); 

  const saveLog = (newLog: DailyLog) => {
    setLogs(prev => {
      const existing = prev.findIndex(l => l.date === newLog.date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newLog;
        return updated;
      }
      return [...prev, newLog];
    });
  };

  const updateProfile = (p: UserProfile) => setProfile(p);
  
  const claimQuest = (id: string, rewards: QuestRewards) => {
     if (questClaims.some(q => q.id === id)) return;
     const claim: QuestClaim = { id, date: new Date().toISOString().split('T')[0], rewards };
     setQuestClaims(prev => [...prev, claim]);
  };

  const claimAchievement = (id: string, rewards: { cp: number; essence: number }) => {
      if (achievementClaims.includes(id)) return;
      setAchievementClaims(prev => [...prev, id]);
      
      // Update rank state immediately for UI feedback
      setRank(prev => ({
          ...prev,
          cp: prev.cp + rewards.cp,
          essence: prev.essence + rewards.essence
      }));
  };

  const unlockSkill = (id: string, cost: number) => {
     if (rank.essence < cost) return; 
     setSkills(prev => {
         const existing = prev.find(s => s.id === id);
         if (existing) {
             return prev.map(s => s.id === id ? { ...s, level: s.level + 1 } : s);
         }
         return [...prev, { id, level: 1 }];
     });
  };
  
  const unlockItem = (id: string, cost: number) => {
      if (rank.essence < cost) return;
      if (rank.unlockedItems.includes(id)) return;
      setRank(prev => ({
          ...prev,
          unlockedItems: [...prev.unlockedItems, id]
      }));
  };

  const updateLoadout = (type: keyof Loadout, id: string) => {
      setRank(prev => ({
          ...prev,
          loadout: { ...prev.loadout, [type]: id }
      }));
  };

  const claimBossRewards = () => {
      const key = `BOSS_CLAIM_${rank.bossState.monthKey}`;
      if (questClaims.some(q => q.id === key)) return;
      
      const rewards: QuestRewards = { lp: 0, cp: 100, essence: 200 };
      claimQuest(key, rewards);
      
      setRank(prev => ({
          ...prev, 
          bossState: { ...prev.bossState, rewardsClaimed: true }
      }));
  };

  const markSeasonSeen = () => {
      setRank(prev => ({ ...prev, lastSeenSeasonId: CURRENT_SEASON_ID }));
  };

  const recalc = () => {
    if(profile) {
        const { currentRank, history: newHistory, league: newLeague } = recomputeHistory(logs, profile, questClaims, skills, rank.loadout, rank.unlockedItems, rank.unlockedBadges, rank.legacySeasons, rank.lastSeenSeasonId);
        setRank(currentRank);
        setHistory(newHistory);
        setLeague(newLeague);
    }
  }

  const exportData = () => {
    const data: AppData = { version: CURRENT_VERSION, profile, logs, questClaims, achievementClaims, skills, league, activeQuests };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranked-cut-save-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.profile || !Array.isArray(parsed.logs)) throw new Error("Invalid Format");
      
      setProfile(parsed.profile);
      setLogs(parsed.logs);
      setQuestClaims(parsed.questClaims || []);
      setAchievementClaims(parsed.achievementClaims || []);
      setSkills(parsed.skills || []);
      if(parsed.activeQuests) setActiveQuests(parsed.activeQuests);
      
      alert("Data imported successfully!");
    } catch (e) {
      alert("Failed to import data. Invalid file.");
    }
  };
  
  const resetData = () => {
      if(confirm("Are you sure? This deletes all progress forever.")) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
      }
  }

  return (
    <GameContext.Provider value={{ 
      profile, logs, rank, history, questClaims, achievementClaims, skills, league, isLoading, activeQuests,
      saveLog, updateProfile, claimQuest, claimAchievement, unlockSkill, unlockItem, updateLoadout, claimBossRewards, markSeasonSeen, exportData, importData, resetData,
      showOnboarding, setShowOnboarding, recalc
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameStore = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameStore must be used within GameProvider");
  return context;
};
