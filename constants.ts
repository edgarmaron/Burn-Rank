
import { Tier, QuestTemplate, Item, Badge, AchievementConfig } from './types';

export const TIERS: Tier[] = [
  'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'
];

export const DIVISIONS = ['IV', 'III', 'II', 'I'];

export const TIER_CONFIG: Record<Tier, { 
  baseWin: number; 
  baseLoss: number; 
  promoteAt: number; 
  color: string; 
  hasDivisions: boolean;
  minDays?: number; 
}> = {
  Iron: { baseWin: 20, baseLoss: -10, promoteAt: 100, color: 'text-zinc-400', hasDivisions: true },
  Bronze: { baseWin: 19, baseLoss: -12, promoteAt: 110, color: 'text-orange-700', hasDivisions: true },
  Silver: { baseWin: 18, baseLoss: -14, promoteAt: 120, color: 'text-slate-400', hasDivisions: true },
  Gold: { baseWin: 16, baseLoss: -17, promoteAt: 140, color: 'text-amber-400', hasDivisions: true },
  Platinum: { baseWin: 14, baseLoss: -19, promoteAt: 160, color: 'text-cyan-400', hasDivisions: true },
  Emerald: { baseWin: 13, baseLoss: -21, promoteAt: 180, color: 'text-emerald-500', hasDivisions: true },
  Diamond: { baseWin: 12, baseLoss: -23, promoteAt: 200, color: 'text-blue-400', hasDivisions: true },
  Master: { baseWin: 11, baseLoss: -26, promoteAt: 500, color: 'text-purple-400', hasDivisions: false, minDays: 21 },
  Grandmaster: { baseWin: 10, baseLoss: -28, promoteAt: 700, color: 'text-red-500', hasDivisions: false, minDays: 45 },
  Challenger: { baseWin: 9, baseLoss: -30, promoteAt: 1000, color: 'text-yellow-300', hasDivisions: false, minDays: 70 },
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
};

export const DEFAULT_GOALS = {
  steps: 8000,
  sleep: 7.5,
};

export const SEASONS = [
  { id: 'season_1', name: "Season 1: Awakening", theme: 'amber', startDate: '2024-01-01', endDate: '2026-06-30' }
];

export const SEASON_INFO = {
  id: 'season_1', 
  name: "Awakening", 
  deadline: '2026-06-30',
  description: "The age of transformation begins. Forge your habits in iron.",
  features: [
      "New Boss Rotation: Elemental Tyrants",
      "Ranked Ladder Reset",
      "Expanded Armory: Relics & Banners",
      "Daily & Weekly Quest System"
  ]
};

export const CURRENT_SEASON_ID = 'season_1';

export const BOSS_TYPES = [
    { id: 'flame_tyrant', name: 'Flame Tyrant', monthMod: 0 },
    { id: 'frost_warden', name: 'Frost Warden', monthMod: 1 },
    { id: 'void_herald', name: 'Void Herald', monthMod: 2 },
    { id: 'storm_colossus', name: 'Storm Colossus', monthMod: 3 },
    { id: 'iron_behemoth', name: 'Iron Behemoth', monthMod: 4 },
    { id: 'plague_monarch', name: 'Plague Monarch', monthMod: 5 },
    { id: 'dune_leviathan', name: 'Dune Leviathan', monthMod: 6 },
    { id: 'astral_seraph', name: 'Astral Seraph', monthMod: 7 },
];

// Skill Tree
export const SKILL_BRANCHES = {
    Consistency: [
        { id: 'iron_will', label: 'Iron Will', description: 'Reduces calorie-miss decay by 1 per level.', maxLevel: 3, cost: 150, reqTier: 'Iron' },
        { id: 'fortify', label: 'Fortify', description: '+1 Max Weekly Shield charge.', maxLevel: 1, cost: 300, reqTier: 'Silver' },
        { id: 'recovery', label: 'Recovery', description: 'After a miss, next win gives +2 LP.', maxLevel: 2, cost: 200, reqTier: 'Gold' },
    ],
    Progression: [
        { id: 'treasure_hunter', label: 'Treasure Hunter', description: '+10% CP earned per level.', maxLevel: 2, cost: 150, reqTier: 'Bronze' },
        { id: 'essence_magnet', label: 'Essence Magnet', description: '+10% Essence earned per level.', maxLevel: 2, cost: 200, reqTier: 'Gold' },
        { id: 'milestone_boost', label: 'Milestone Boost', description: 'Every 100 CP grants 1 shield.', maxLevel: 1, cost: 400, reqTier: 'Platinum' },
    ],
    BossLeague: [
        { id: 'boss_prep', label: 'Boss Prep', description: '+15% Boss rewards (CP/Essence).', maxLevel: 2, cost: 200, reqTier: 'Silver' },
        { id: 'rival_breaker', label: 'Rival Breaker', description: 'Gain 5 Essence when passing a rival (max 1/day).', maxLevel: 1, cost: 250, reqTier: 'Gold' },
        { id: 'league_scout', label: 'League Scout', description: 'See rival movement predictions.', maxLevel: 1, cost: 100, reqTier: 'Bronze' },
    ]
};

export const PERKS = [
    ...SKILL_BRANCHES.Consistency,
    ...SKILL_BRANCHES.Progression,
    ...SKILL_BRANCHES.BossLeague
];

// ITEMS
export const WEAPONS: Item[] = [
    { id: 'iron_dagger', name: 'Iron Dagger', type: 'weapon', tier: 'Iron', description: 'A rusted blade.', cpBonus: 0, unlockCost: 0 },
    { id: 'bronze_mace', name: 'Bronze Mace', type: 'weapon', tier: 'Bronze', description: 'Heavy hitter. +1 CP/win.', cpBonus: 1, unlockCost: 100 },
    { id: 'silver_spear', name: 'Silver Spear', type: 'weapon', tier: 'Silver', description: 'Precision. +2 CP/win.', cpBonus: 2, unlockCost: 250 },
    { id: 'gold_saber', name: 'Gold Saber', type: 'weapon', tier: 'Gold', description: 'Gilded edge. +3 CP/win.', cpBonus: 3, unlockCost: 500 },
    { id: 'platinum_halberd', name: 'Platinum Halberd', type: 'weapon', tier: 'Platinum', description: 'Reach for glory. +4 CP/win.', cpBonus: 4, unlockCost: 1000 },
    { id: 'emerald_bow', name: 'Emerald Bow', type: 'weapon', tier: 'Emerald', description: 'Nature’s wrath. +5 CP/win.', cpBonus: 5, unlockCost: 1500 },
    { id: 'diamond_rapier', name: 'Diamond Rapier', type: 'weapon', tier: 'Diamond', description: 'Flawless form. +6 CP/win.', cpBonus: 6, unlockCost: 2500 },
    { id: 'master_staff', name: 'Master Staff', type: 'weapon', tier: 'Master', description: 'Arcane power. +8 CP/win.', cpBonus: 8, unlockCost: 5000 },
    { id: 'grandmaster_blade', name: 'Grandmaster Blade', type: 'weapon', tier: 'Grandmaster', description: 'Legendary cut. +10 CP/win.', cpBonus: 10, unlockCost: 10000 },
    { id: 'challenger_relic', name: 'Challenger Relic', type: 'weapon', tier: 'Challenger', description: 'God tier artifact. +15 CP/win.', cpBonus: 15, unlockCost: 25000 },
];

export const RELICS: Item[] = [
    { id: 'old_coin', name: 'Old Coin', type: 'relic', tier: 'Iron', description: 'Good luck charm. +2 Essence/win.', essenceBonus: 2, unlockCost: 50 },
    { id: 'steps_talisman', name: 'Talisman of Motion', type: 'relic', tier: 'Bronze', description: 'Movement flows. +5 CP/win.', cpBonus: 5, unlockCost: 150 },
    { id: 'dream_catcher', name: 'Dream Catcher', type: 'relic', tier: 'Silver', description: 'Restful thoughts. +5 Essence/win.', essenceBonus: 5, unlockCost: 300 },
    { id: 'phoenix_feather', name: 'Phoenix Feather', type: 'relic', tier: 'Gold', description: 'Rise again. +10 CP/win.', cpBonus: 10, unlockCost: 600 },
];

export const BANNERS: Item[] = [
    { id: 'banner_initiate', name: 'Initiate Banner', type: 'banner', tier: 'Cosmetic', description: 'Standard issue.', unlockCost: 0 },
    { id: 'banner_flame', name: 'Flame Banner', type: 'banner', tier: 'Cosmetic', description: 'Awarded for defeating Flame Tyrant.', unlockCost: 0 }, 
    { id: 'banner_gold', name: 'Gilded Banner', type: 'banner', tier: 'Gold', description: 'For those who strike gold.', unlockCost: 500 },
];

export const TITLES: Item[] = [
    { id: 'title_recruit', name: 'Recruit', type: 'title', tier: 'Cosmetic', description: 'Just started.', unlockCost: 0 },
    { id: 'title_consistent', name: 'The Consistent', type: 'title', tier: 'Cosmetic', description: '7-Day Streak.', unlockCost: 0 },
    { id: 'title_slayer', name: 'Boss Slayer', type: 'title', tier: 'Cosmetic', description: 'Defeated a Boss.', unlockCost: 0 },
    { id: 'title_ironbound', name: 'Ironbound', type: 'title', tier: 'Iron', description: 'Forged in Iron.', unlockCost: 50 },
    { id: 'title_legacy_s1', name: 'Awakened', type: 'title', tier: 'Legacy', description: 'Season 1 Participant.', unlockCost: 0 },
];

export const ALL_ITEMS = [...WEAPONS, ...RELICS, ...BANNERS, ...TITLES];

// BADGES
export const BADGES: Badge[] = [
    // BOSS BADGES
    { id: 'badge_boss_flame', name: 'Flame Tyrant Slayer', description: 'Defeated the Flame Tyrant.', type: 'boss', rarity: 'rare', icon: 'skull' },
    { id: 'badge_boss_frost', name: 'Frost Warden Slayer', description: 'Defeated the Frost Warden.', type: 'boss', rarity: 'rare', icon: 'snowflake' },
    { id: 'badge_boss_void', name: 'Void Herald Slayer', description: 'Defeated the Void Herald.', type: 'boss', rarity: 'rare', icon: 'ghost' },
    { id: 'badge_boss_storm', name: 'Storm Colossus Slayer', description: 'Defeated the Storm Colossus.', type: 'boss', rarity: 'rare', icon: 'zap' },
    { id: 'badge_boss_collector', name: 'Boss Collector', description: 'Defeated 4 different boss types.', type: 'boss', rarity: 'epic', icon: 'skull-gold' },

    // RANK BADGES
    { id: 'badge_rank_iron', name: 'Ironbound', description: 'Reached Iron Tier.', type: 'rank', rarity: 'common', icon: 'shield' },
    { id: 'badge_rank_bronze', name: 'Bronze Rising', description: 'Reached Bronze Tier.', type: 'rank', rarity: 'common', icon: 'shield' },
    { id: 'badge_rank_silver', name: 'Silver Lining', description: 'Reached Silver Tier.', type: 'rank', rarity: 'common', icon: 'shield' },
    { id: 'badge_rank_gold', name: 'Golden Era', description: 'Reached Gold Tier.', type: 'rank', rarity: 'rare', icon: 'crown' },
    { id: 'badge_rank_platinum', name: 'Platinum Oath', description: 'Reached Platinum Tier.', type: 'rank', rarity: 'rare', icon: 'crown' },
    { id: 'badge_rank_emerald', name: 'Emerald Rite', description: 'Reached Emerald Tier.', type: 'rank', rarity: 'epic', icon: 'crown' },
    { id: 'badge_rank_diamond', name: 'Diamond Edge', description: 'Reached Diamond Tier.', type: 'rank', rarity: 'epic', icon: 'crown' },
    { id: 'badge_rank_master', name: 'Master’s Mark', description: 'Reached Master Tier.', type: 'rank', rarity: 'legendary', icon: 'star' },
    { id: 'badge_rank_grandmaster', name: 'Grandmaster Seal', description: 'Reached Grandmaster Tier.', type: 'rank', rarity: 'legendary', icon: 'star' },
    { id: 'badge_rank_challenger', name: 'Challenger’s Crown', description: 'Reached Challenger Tier.', type: 'rank', rarity: 'legendary', icon: 'trophy' },

    // CONSISTENCY BADGES
    { id: 'badge_streak_7', name: 'Week of Iron', description: 'Achieved a 7-day streak.', type: 'consistency', rarity: 'common', icon: 'flame' },
    { id: 'badge_streak_30', name: 'Month of Steel', description: 'Achieved a 30-day streak.', type: 'consistency', rarity: 'epic', icon: 'flame-blue' },
    { id: 'badge_night_watch', name: 'Night Watch', description: 'Logged 5 times after 10:30 PM.', type: 'consistency', rarity: 'rare', icon: 'moon' },
    { id: 'badge_early_bird', name: 'Early Bird', description: 'Logged 5 times before 8:00 AM.', type: 'consistency', rarity: 'rare', icon: 'sun' },

    // MILESTONE BADGES
    { id: 'badge_cp_100', name: 'CP Novice', description: 'Earned 100 Consistency Points.', type: 'milestone', rarity: 'common', icon: 'target' },
    { id: 'badge_cp_500', name: 'CP Adept', description: 'Earned 500 Consistency Points.', type: 'milestone', rarity: 'rare', icon: 'target' },
    { id: 'badge_cp_1000', name: 'CP Master', description: 'Earned 1000 Consistency Points.', type: 'milestone', rarity: 'epic', icon: 'target' },
    { id: 'badge_ess_100', name: 'Essence Seeker', description: 'Earned 100 Essence.', type: 'milestone', rarity: 'common', icon: 'zap' },
    { id: 'badge_ess_500', name: 'Essence Hoarder', description: 'Earned 500 Essence.', type: 'milestone', rarity: 'rare', icon: 'zap' },

    // SEASONAL BADGES
    { id: 'badge_season_1', name: 'Awakened', description: 'Participated in Season 1.', type: 'seasonal', rarity: 'common', icon: 'flag' },
    { id: 'badge_season_champion', name: 'Season Champion', description: 'Finish Top 3 in League.', type: 'seasonal', rarity: 'legendary', icon: 'trophy' },

    // SECRET
    { id: 'badge_clutch_log', name: 'Clutch Log', description: 'Log within 5 mins of midnight.', type: 'secret', rarity: 'rare', icon: 'clock', secret: true },
];

export const DAILY_QUOTES = [
  "Discipline is the bridge between goals and accomplishment.",
  "The Rank does not lie.",
  "Decay waits for no one.",
  "Every calorie logged is a victory secured.",
  "Sleep is the mana of the real world.",
  "Steps taken today define the strength of tomorrow.",
  "Consistency beats intensity.",
  "Your rival is grinding. Are you?",
  "The scale is just data. The habit is the win.",
  "Do not fear the loss, fear the skipped log.",
  "A missed log is a surrendered battle.",
  "Forged in iron, polished in diamond.",
  "Hunger is temporary. Glory is forever.",
  "Track everything. Mercy for nothing.",
  "The only bad workout is the one that didn't happen.",
  "Data is your sword. Routine is your shield.",
];

// Quests
export const QUEST_TEMPLATES: { daily: QuestTemplate[], weekly: QuestTemplate[], monthly: QuestTemplate[], seasonal: QuestTemplate[] } = {
  daily: [
    { id: 'dq_cal_log', label: () => 'Log Calories Today', type: 'calories', targetType: 'log', baseTarget: 1, freq: 'daily', rewards: { lp: 1, cp: 10, essence: 20 } },
    { id: 'dq_weight_log', label: () => 'Log Weight Today', type: 'weight', targetType: 'log', baseTarget: 1, freq: 'daily', rewards: { lp: 0, cp: 15, essence: 25 } },
    { id: 'dq_steps_log', label: () => 'Log Steps Today', type: 'steps', targetType: 'log', baseTarget: 1, freq: 'daily', rewards: { lp: 0, cp: 10, essence: 15 } },
    { id: 'dq_sleep_log', label: () => 'Log Sleep Today', type: 'sleep', targetType: 'log', baseTarget: 1, freq: 'daily', rewards: { lp: 0, cp: 10, essence: 15 } },
    { id: 'dq_steps_goal', label: (t) => `Hit ${t} Steps`, type: 'steps', targetType: 'value', baseTarget: 8000, freq: 'daily', rewards: { lp: 0, cp: 20, essence: 40 } },
    { id: 'dq_sleep_goal', label: (t) => `Sleep ${t} Hours`, type: 'sleep', targetType: 'value', baseTarget: 7.5, freq: 'daily', rewards: { lp: 0, cp: 20, essence: 40 } },
  ],
  weekly: [
    { id: 'wq_cal_count', label: (t) => `Log Calories ${t} times`, type: 'calories', targetType: 'count', baseTarget: 5, freq: 'weekly', rewards: { lp: 3, cp: 50, essence: 100 } },
    { id: 'wq_steps_count', label: (t) => `Log Steps ${t} times`, type: 'steps', targetType: 'count', baseTarget: 5, freq: 'weekly', rewards: { lp: 0, cp: 40, essence: 80 } },
    { id: 'wq_sleep_count', label: (t) => `Log Sleep ${t} times`, type: 'sleep', targetType: 'count', baseTarget: 5, freq: 'weekly', rewards: { lp: 0, cp: 40, essence: 80 } },
    { id: 'wq_weight_count', label: (t) => `Log Weight ${t} times`, type: 'weight', targetType: 'count', baseTarget: 3, freq: 'weekly', rewards: { lp: 0, cp: 30, essence: 60 } },
  ],
  monthly: [
      { id: 'mq_boss', label: () => 'Defeat Monthly Boss', type: 'boss', targetType: 'boolean', baseTarget: 1, freq: 'monthly', rewards: { lp: 5, cp: 100, essence: 200 } },
      { id: 'mq_cal_streak', label: () => '15 Day Streak', type: 'streak', targetType: 'value', baseTarget: 15, freq: 'monthly', rewards: { lp: 5, cp: 150, essence: 250 } },
  ],
  seasonal: [
      { id: 'sq_promo', label: () => 'Earn a Promotion', type: 'streak', targetType: 'boolean', baseTarget: 1, freq: 'seasonal', rewards: { lp: 10, cp: 500, essence: 1000 } }, 
  ]
};

export const RIVAL_NAMES = [
  "IronWill", "ZeroSugar", "KetoKing", "GymRat99", "CardioBunny", "LiftHeavy", 
  "MacroMaster", "CheatDay", "BulkLord", "CutCommander", "ProteinShake", 
  "ZenMode", "NightOwl", "EarlyRiser", "RepCounter", "SquatPro", 
  "BenchPresser", "SaladEnjoyer", "WaterChugger", "StepCounter", "SleepMaxxer",
  "NoExcuses", "JustDoIt", "GrindSet", "Discipline", "Focus", "Gainz"
];

export const WEEKLY_EVENTS = [
  { id: 'none', label: 'Standard Week', desc: 'No special modifiers.', effect: {} },
  { id: 'slump', label: 'Slump Week', desc: 'Rivals are struggling. (-10% Win Rate)', modWin: -0.1 },
  { id: 'surge', label: 'Surge Week', desc: 'Rivals are motivated. (+10% Win Rate)', modWin: 0.1 },
  { id: 'chaos', label: 'Chaos Week', desc: 'Rivals are aggressive. (+50% LP Swing)', modSwing: 1.5 },
];

export const ACHIEVEMENTS: AchievementConfig[] = [
    // Consistency
    { id: 'ach_streak_7', name: '7-Day Calories Streak', description: 'Log calories for 7 days in a row.', category: 'Consistency', target: 7, reward: { cp: 50, essence: 10 } },
    { id: 'ach_streak_30', name: '30-Day Calories Streak', description: 'Log calories for 30 days in a row.', category: 'Consistency', target: 30, reward: { cp: 200, essence: 50 } },
    { id: 'ach_perfect_week', name: 'Perfect Week', description: 'Log Cal + Steps + Sleep for 7 days straight.', category: 'Consistency', target: 7, reward: { cp: 100, essence: 30 } },

    // Progression
    { id: 'ach_cp_100', name: 'Earn 100 CP', description: 'Reach 100 total Consistency Points.', category: 'Progression', target: 100, reward: { cp: 0, essence: 20 } },
    { id: 'ach_cp_500', name: 'Earn 500 CP', description: 'Reach 500 total Consistency Points.', category: 'Progression', target: 500, reward: { cp: 0, essence: 50 } },
    { id: 'ach_ess_100', name: 'Earn 100 Essence', description: 'Accumulate 100 total Essence.', category: 'Progression', target: 100, reward: { cp: 50, essence: 0 } },
    { id: 'ach_ess_500', name: 'Earn 500 Essence', description: 'Accumulate 500 total Essence.', category: 'Progression', target: 500, reward: { cp: 100, essence: 0 } },

    // League
    { id: 'ach_top_10', name: 'Reach Top 10', description: 'Finish a day in the Top 10 of your league.', category: 'League', target: 10, reward: { cp: 30, essence: 10 } },
    { id: 'ach_top_3', name: 'Reach Top 3', description: 'Finish a day in the Top 3 of your league.', category: 'League', target: 3, reward: { cp: 60, essence: 20 } },
    { id: 'ach_top_1', name: 'League Champion', description: 'Reach Rank 1 in your league.', category: 'League', target: 1, reward: { cp: 100, essence: 50 } },

    // Boss
    { id: 'ach_boss_1', name: 'First Blood', description: 'Defeat a monthly boss.', category: 'Boss', target: 1, reward: { cp: 50, essence: 50 } },
    { id: 'ach_boss_3', name: 'Boss Veteran', description: 'Defeat 3 different bosses.', category: 'Boss', target: 3, reward: { cp: 150, essence: 100 } },
];
