
export type Tier = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Emerald' | 'Diamond' | 'Master' | 'Grandmaster' | 'Challenger';

export type Division = 'IV' | 'III' | 'II' | 'I' | null;

export type RivalPersonality = 'Grinder' | 'Consistent' | 'Slacker' | 'Clutch' | 'Aggressive' | 'Standard';

export interface Rival {
  id: string;
  name: string;
  personality: RivalPersonality;
  lp: number;
  lastResult: 'W' | 'L' | '-';
  trend: 'UP' | 'FLAT' | 'DOWN';
  history: number[]; 
  lastRank: number; 
  equippedWeaponId?: string;
  equippedTitleId?: string;
}

export interface LeagueState {
  id: string; 
  tier: Tier;
  division: Division;
  startDate: string; 
  lastSimulatedDate: string;
  rivals: Rival[];
  weeklyEvent: string | null;
  userPlacementHistory: { date: string, rank: number }[];
}

export interface BossState {
  monthKey: string; 
  type: string; 
  status: 'upcoming' | 'active' | 'completed' | 'defeated' | 'failed';
  result?: 'win' | 'loss';
  rewardsClaimed: boolean;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'relic' | 'banner' | 'title';
  tier: Tier | 'Cosmetic' | 'Legacy'; 
  description: string;
  cpBonus?: number; 
  essenceBonus?: number; 
  unlockCost: number; 
  reqTier?: Tier;
}

export type BadgeCategory = 'boss' | 'rank' | 'league' | 'consistency' | 'quest' | 'milestone' | 'secret' | 'seasonal';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'legacy';

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: BadgeCategory;
  rarity: BadgeRarity;
  icon: string;
  secret?: boolean; 
}

export interface UnlockedBadge {
  id: string;
  date: string;
  details?: string;
}

export interface Loadout {
  weaponId: string;
  relicId: string | null;
  bannerId: string | null;
  titleId: string | null;
}

export interface LegacySeason {
  seasonId: string;
  seasonName: string;
  theme: string;
  startDate: string;
  endDate: string;
  finalTier: Tier;
  finalDivision: Division;
  finalLP: number;
  totalDaysLogged: number;
  bestStreak: number;
  bossesDefeated: string[];
  badgesEarned: string[];
  archivedAt: string;
}

export interface RankState {
  tier: Tier;
  division: Division;
  lp: number;
  pendingQuestLp: number; 
  streak: number;
  series: {
    active: boolean;
    wins: number;
    losses: number;
    targetWins: number;
  } | null;
  highestRank: string;
  
  // Mechanics
  cp: number; 
  essence: number; 
  shields: number; 
  rivalLp: number; 
  totalDaysLogged: number; 
  
  // Progression
  loadout: Loadout;
  unlockedItems: string[]; 
  unlockedBadges: UnlockedBadge[];
  
  // State
  bossState: BossState;
  seasonId: string;
  lastSeenSeasonId: string; 
  legacySeasons: LegacySeason[];
}

export interface UserProfile {
  name: string;
  bio?: string; 
  weight: number;
  goalWeight: number;
  deadline: string;
  height: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very';
  goals: {
    calories?: number;
    steps?: number;
    sleep?: number;
  };
  motto?: string;
}

export interface DailyLog {
  date: string; 
  timestamp?: string; 
  calories: number | null;
  steps: number | null;
  sleepHours: number | null;
  weightKg: number | null;
  notes: string | null;
  isRanked?: boolean; // New flag for stats-only vs ranked match
}

export interface QuestRewards {
  lp: number;
  cp: number;
  essence: number;
}

export interface QuestTemplate {
  id: string;
  label: (target: number) => string;
  type: 'calories' | 'steps' | 'sleep' | 'weight' | 'streak' | 'boss';
  targetType: 'log' | 'value' | 'count' | 'boolean';
  baseTarget: number; 
  rewards: QuestRewards;
  freq: 'daily' | 'weekly' | 'monthly' | 'seasonal';
}

export interface QuestInstance {
  id: string; 
  templateId: string;
  label: string;
  type: 'calories' | 'steps' | 'sleep' | 'weight' | 'streak' | 'boss';
  targetType: 'log' | 'value' | 'count' | 'boolean';
  targetValue: number;
  rewards: QuestRewards;
  expires: string;
  freq: 'daily' | 'weekly' | 'monthly' | 'seasonal';
}

export interface ActiveQuestsState {
  daily: { date: string; quests: QuestInstance[] };
  weekly: { week: string; quests: QuestInstance[] };
  monthly: { month: string; quests: QuestInstance[] };
  seasonal: { season: string; quests: QuestInstance[] };
}

export interface QuestClaim {
  id: string;
  date: string; 
  rewards: QuestRewards;
}

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  category: 'Consistency' | 'Progression' | 'League' | 'Boss';
  target: number;
  reward: { cp: number; essence: number };
}

export interface SkillPerk {
  id: string;
  level: number;
}

export interface RankHistoryEntry {
  date: string;
  lpChange: number;
  rankSnapshot: string; 
  result: 'WIN' | 'LOSS' | 'QUEST' | 'SHIELDED';
  details?: {
    base: number;
    bonus: number; 
    streak: number;
    boss: number;
    questLp: number;
    pendingLpApplied: number;
    shieldUsed: boolean;
  }
}

export interface AppData {
  version: number;
  profile: UserProfile | null;
  logs: DailyLog[];
  questClaims: QuestClaim[];
  achievementClaims: string[]; 
  activeQuests?: ActiveQuestsState;
  skills: SkillPerk[]; 
  league: LeagueState | null;
  unlockedItems?: string[];
  unlockedBadges?: UnlockedBadge[];
}
