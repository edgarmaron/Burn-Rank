
import { RankState, DailyLog, UserProfile, Tier, Division, QuestClaim, SkillPerk, LeagueState, Rival, RivalPersonality, RankHistoryEntry, BossState, UnlockedBadge, Item, Loadout, AppData, Badge, LegacySeason, AchievementConfig } from '../types';
import { TIERS, DIVISIONS, TIER_CONFIG, DEFAULT_GOALS, PERKS, RIVAL_NAMES, WEEKLY_EVENTS, WEAPONS, RELICS, CURRENT_SEASON_ID, BOSS_TYPES, BADGES, SEASON_INFO, ACHIEVEMENTS } from '../constants';
import { getSeededRandom, cyrb128, sfc32 } from './rng';

// -- Helper Functions --

export const getInitialRank = (): RankState => ({
  tier: 'Iron',
  division: 'IV',
  lp: 0,
  pendingQuestLp: 0,
  streak: 0,
  series: null,
  highestRank: 'Iron IV 0 LP',
  cp: 0,
  essence: 0,
  shields: 0,
  rivalLp: 0,
  totalDaysLogged: 0,
  loadout: {
      weaponId: 'iron_dagger',
      relicId: null,
      bannerId: null,
      titleId: 'title_recruit'
  },
  unlockedItems: ['iron_dagger', 'title_recruit', 'banner_initiate'],
  unlockedBadges: [],
  bossState: {
    monthKey: '',
    type: 'flame_tyrant',
    status: 'upcoming',
    rewardsClaimed: false
  },
  seasonId: CURRENT_SEASON_ID,
  lastSeenSeasonId: '',
  legacySeasons: []
});

const getNextTier = (tier: Tier): Tier | null => {
  const idx = TIERS.indexOf(tier);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
};

const getPrevTier = (tier: Tier): Tier | null => {
  const idx = TIERS.indexOf(tier);
  return idx > 0 ? TIERS[idx - 1] : null;
};

// Boss Logic: First Saturday of the month
export const isBossDay = (date: Date): boolean => {
  if (date.getDay() !== 6) return false; // Must be Saturday
  return date.getDate() <= 7;
};

export const getBossMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// -- League Logic --

const generateLeague = (tier: Tier, division: Division | null, dateSeed: string): LeagueState => {
  const rivals: Rival[] = [];
  const personalities: RivalPersonality[] = ['Grinder', 'Consistent', 'Slacker', 'Clutch', 'Aggressive', 'Standard'];
  
  const seedParts = cyrb128(dateSeed);
  const rng = sfc32(seedParts[0], seedParts[1], seedParts[2], seedParts[3]);
  const shuffledNames = [...RIVAL_NAMES].sort(() => rng() - 0.5);

  for (let i = 0; i < 19; i++) {
     const personality = personalities[Math.floor(getSeededRandom(dateSeed + i + 'pers') * personalities.length)];
     const startLp = Math.floor(getSeededRandom(dateSeed + i + 'lp') * 80);
     const weapon = WEAPONS[Math.floor(getSeededRandom(dateSeed + i + 'wep') * WEAPONS.length)];
     
     rivals.push({
       id: `rival_${i}`,
       name: shuffledNames[i],
       personality,
       lp: startLp,
       lastResult: '-',
       trend: 'FLAT',
       history: [startLp],
       lastRank: i + 1, // approximate start rank
       equippedWeaponId: weapon.id
     });
  }

  return {
     id: `${tier}_${division || ''}_${dateSeed}`,
     tier,
     division,
     startDate: dateSeed,
     lastSimulatedDate: dateSeed,
     rivals,
     weeklyEvent: null,
     userPlacementHistory: []
  };
};

const simulateRivalDay = (rival: Rival, tier: Tier, dateStr: string, eventId: string, currentLeagueRivals: Rival[]) => {
    const rng = getSeededRandom(dateStr + rival.id);
    const date = new Date(dateStr);
    const event = WEEKLY_EVENTS.find(e => e.id === eventId) || WEEKLY_EVENTS[0];
    const config = TIER_CONFIG[tier];

    // Calc Rank before simulation (based on current LPs)
    const sortedBefore = [...currentLeagueRivals].sort((a,b) => b.lp - a.lp);
    const rankBefore = sortedBefore.findIndex(r => r.id === rival.id) + 1;
    rival.lastRank = rankBefore;

    let winChance = 0.60;
    
    switch(rival.personality) {
        case 'Grinder': winChance += 0.15; break;
        case 'Consistent': winChance += 0.10; break;
        case 'Slacker': winChance -= 0.15; break;
    }
    
    if (event.modWin) winChance += event.modWin;

    const isWin = rng < winChance;
    let change = isWin ? config.baseWin : config.baseLoss;
    
    let swingMult = 1;
    if (rival.personality === 'Aggressive') swingMult = 1.25;
    if (event.modSwing) swingMult = Math.max(swingMult, event.modSwing || 1);
    
    change = Math.round(change * swingMult);

    rival.lp += change;
    rival.lp = Math.max(0, rival.lp); 
    rival.lp = Math.min(config.promoteAt + 10, rival.lp);

    rival.lastResult = isWin ? 'W' : 'L';
    
    rival.history.push(rival.lp);
    if (rival.history.length > 7) rival.history.shift();
    if (rival.history.length >= 2) {
        const diff = rival.history[rival.history.length-1] - rival.history[0];
        rival.trend = diff > 5 ? 'UP' : diff < -5 ? 'DOWN' : 'FLAT';
    }
};

// -- Core Logic --

export const recomputeHistory = (
  logs: DailyLog[], 
  profile: UserProfile,
  questClaims: QuestClaim[] = [],
  skills: SkillPerk[] = [],
  prevLoadout?: Loadout, 
  prevUnlocked?: string[],
  prevBadges?: UnlockedBadge[],
  prevLegacy?: LegacySeason[],
  prevLastSeen?: string
) => {
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  
  let startStr = sortedLogs.length > 0 ? sortedLogs[0].date : new Date().toISOString().split('T')[0];
  if (questClaims.length > 0) {
      const earliestClaim = [...questClaims].sort((a,b) => a.date.localeCompare(b.date))[0].date;
      if (earliestClaim < startStr) startStr = earliestClaim;
  }

  const startDate = new Date(startStr);
  const today = new Date();
  const history: RankHistoryEntry[] = [];
  
  let currentState = getInitialRank();
  if (prevLoadout) currentState.loadout = prevLoadout;
  if (prevUnlocked) currentState.unlockedItems = prevUnlocked;
  if (prevBadges) currentState.unlockedBadges = prevBadges;
  if (prevLegacy) currentState.legacySeasons = prevLegacy;
  if (prevLastSeen) currentState.lastSeenSeasonId = prevLastSeen;

  let league: LeagueState = generateLeague(currentState.tier, currentState.division, startStr);

  const getPerkLevel = (id: string) => skills.find(s => s.id === id)?.level || 0;
  
  let weeklyShieldsUsed = 0;
  let currentWeekStr = '';
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    
    // Aggregating quest rewards
    const dayClaims = questClaims.filter(q => q.date === dateStr);
    const extraLp = dayClaims.reduce((sum, q) => sum + (q.rewards?.lp || (q as any).lp || 0), 0);
    const extraCp = dayClaims.reduce((sum, q) => sum + (q.rewards?.cp || 0), 0);
    const extraEssence = dayClaims.reduce((sum, q) => sum + (q.rewards?.essence || 0), 0);

    const weekNum = getWeekNumber(d);
    const weekStr = `${d.getFullYear()}-W${weekNum}`;
    
    // Weekly Reset Logic
    if (weekStr !== currentWeekStr) {
        currentWeekStr = weekStr;
        weeklyShieldsUsed = 0;
        
        const fortifyLevel = getPerkLevel('fortify');
        if (getPerkLevel('shield_battery') > 0 || fortifyLevel > 0) {
             currentState.shields = Math.min(1 + fortifyLevel, currentState.shields + 1 + fortifyLevel);
        }
        
        const eventRng = getSeededRandom(weekStr);
        const eventIdx = Math.floor(eventRng * WEEKLY_EVENTS.length);
        league.weeklyEvent = WEEKLY_EVENTS[eventIdx].id;
    }

    // Boss Logic
    if (isBossDay(d)) {
        const monthKey = getBossMonthKey(d);
        currentState.bossState.monthKey = monthKey;
        currentState.bossState.status = 'active';
        // Deterministic boss type based on month
        const bossIdx = (d.getMonth() + d.getFullYear()) % BOSS_TYPES.length;
        currentState.bossState.type = BOSS_TYPES[bossIdx].id;
        
        // Check if won (Must be ranked win)
        const isWin = !!log && log.calories !== null && (log.isRanked ?? true);

        if (isWin) {
            currentState.bossState.result = 'win';
            currentState.bossState.status = 'completed';
            
            // Unlock Boss Badge if not present
            const badgeId = `badge_boss_${currentState.bossState.type.split('_')[1]}`; 
            if (!currentState.unlockedBadges.some(b => b.id === badgeId)) {
                currentState.unlockedBadges.push({ id: badgeId, date: dateStr });
            }
             // Unlock Boss Slayer Title
            if (!currentState.unlockedItems.includes('title_slayer')) currentState.unlockedItems.push('title_slayer');

        } else if (dateStr < today.toISOString().split('T')[0]) {
             currentState.bossState.result = 'loss';
             currentState.bossState.status = 'failed';
        }
    }

    const isToday = dateStr === new Date().toISOString().split('T')[0];
    // A log only counts as a Ranked Win if it has calories AND is explicitly ranked (or legacy)
    const hasRankedLog = !!log && log.calories !== null && (log.isRanked ?? true);
    
    // We should process the day if:
    // 1. We have a ranked log (Win)
    // 2. It's a past day (Loss/Decay)
    // 3. We have extra LP/rewards to apply
    const shouldProcessUser = hasRankedLog || (!isToday && d < today); 
    
    let lpChange = 0;
    let result: 'WIN' | 'LOSS' | 'QUEST' | 'SHIELDED' | null = null;
    let details: any = {};

    if (shouldProcessUser || extraLp > 0 || extraCp > 0 || extraEssence > 0) {
         if (isToday && !hasRankedLog && extraLp === 0 && extraCp === 0) {
             // Do nothing (e.g. stats only save for today)
         } else {
             const res = processDay({
                current: currentState,
                log,
                profile,
                extraLp,
                extraCp,
                extraEssence,
                date: d,
                skills,
                weeklyShieldsUsed
            });
            
            currentState = res.newState;
            lpChange = res.lpChange;
            result = res.result;
            details = res.details;
            
            const tierChanged = currentState.tier !== league.tier || currentState.division !== league.division;
            if (tierChanged) {
                league = generateLeague(currentState.tier, currentState.division, dateStr);
            }
            
            if (result === 'SHIELDED') weeklyShieldsUsed++;

            history.push({
              date: dateStr,
              lpChange,
              rankSnapshot: `${currentState.tier} ${currentState.division || ''} ${currentState.lp} LP`,
              result: result || 'QUEST',
              details
            });
         }
    }

    // BADGE UNLOCK LOGIC
    const unlockBadge = (id: string) => {
        if (!currentState.unlockedBadges.some(b => b.id === id)) {
            currentState.unlockedBadges.push({ id, date: dateStr });
        }
    };

    // Rank Badges
    const tierIdx = TIERS.indexOf(currentState.tier);
    if (tierIdx >= 0) unlockBadge('badge_rank_iron');
    if (tierIdx >= 1) unlockBadge('badge_rank_bronze');
    if (tierIdx >= 2) unlockBadge('badge_rank_silver');
    if (tierIdx >= 3) unlockBadge('badge_rank_gold');
    if (tierIdx >= 4) unlockBadge('badge_rank_platinum');
    if (tierIdx >= 5) unlockBadge('badge_rank_emerald');
    if (tierIdx >= 6) unlockBadge('badge_rank_diamond');
    if (tierIdx >= 7) unlockBadge('badge_rank_master');
    if (tierIdx >= 8) unlockBadge('badge_rank_grandmaster');
    if (tierIdx >= 9) unlockBadge('badge_rank_challenger');

    // Streak Badges
    if (currentState.streak >= 7) unlockBadge('badge_streak_7');
    if (currentState.streak >= 30) unlockBadge('badge_streak_30');

    // Milestone Badges
    if (currentState.cp >= 100) unlockBadge('badge_cp_100');
    if (currentState.cp >= 500) unlockBadge('badge_cp_500');
    if (currentState.cp >= 1000) unlockBadge('badge_cp_1000');
    if (currentState.essence >= 100) unlockBadge('badge_ess_100');
    if (currentState.essence >= 500) unlockBadge('badge_ess_500');

    // Time-based badges (Requires log timestamp)
    if (log && log.timestamp && log.isRanked) {
        const hour = parseInt(log.timestamp.split(':')[0]);
        const min = parseInt(log.timestamp.split(':')[1]);
        // Early Bird: before 8:00
        if (hour < 8) {
             unlockBadge('badge_early_bird');
        }
        // Night Watch: after 22:30
        if (hour > 22 || (hour === 22 && min >= 30)) {
             unlockBadge('badge_night_watch');
        }
        // Clutch Log: 23:55+
        if (hour === 23 && min >= 55) {
             unlockBadge('badge_clutch_log');
        }
    }

    if (dateStr > league.lastSimulatedDate) {
        league.rivals.forEach(rival => {
            simulateRivalDay(rival, league.tier, dateStr, league.weeklyEvent || 'none', league.rivals);
        });
        league.lastSimulatedDate = dateStr;
        
        const userLp = currentState.lp;
        const allLps = [...league.rivals.map(r => r.lp), userLp].sort((a,b) => b - a);
        const rankPos = allLps.indexOf(userLp) + 1;
        league.userPlacementHistory.push({ date: dateStr, rank: rankPos });
        if (league.userPlacementHistory.length > 7) league.userPlacementHistory.shift();
    }
  }
  
  return { currentRank: currentState, history, league };
};

export const calculateAchievementProgress = (ach: AchievementConfig, rank: RankState, logs: DailyLog[], league: LeagueState | null, claims: string[]) => {
    let current = 0;
    
    if (ach.category === 'Consistency') {
        if (ach.id === 'ach_streak_7' || ach.id === 'ach_streak_30') {
            current = rank.streak;
        } else if (ach.id === 'ach_perfect_week') {
            let perfectStreak = 0;
            const sorted = [...logs].sort((a,b) => b.date.localeCompare(a.date));
            for(const l of sorted) {
                if (l.calories && l.steps && l.sleepHours) perfectStreak++;
                else break;
            }
            current = perfectStreak;
        }
    } else if (ach.category === 'Progression') {
        if (ach.id.includes('cp')) current = rank.cp;
        if (ach.id.includes('ess')) current = rank.essence;
    } else if (ach.category === 'League') {
        if (league && league.userPlacementHistory.length > 0) {
            const bestRank = Math.min(...league.userPlacementHistory.map(h => h.rank));
            if (bestRank <= ach.target) current = ach.target; 
            else current = 0;
        }
    } else if (ach.category === 'Boss') {
        if (ach.id === 'ach_boss_1') {
            current = rank.unlockedBadges.some(b => b.id.startsWith('badge_boss_')) ? 1 : 0;
        } else if (ach.id === 'ach_boss_3') {
             const unique = new Set(rank.unlockedBadges.filter(b => b.id.startsWith('badge_boss_')).map(b => b.id)).size;
             current = unique;
        }
    }
    
    const visualCurrent = Math.min(current, ach.target);
    const percent = Math.min(100, Math.floor((visualCurrent / ach.target) * 100));
    const completed = current >= ach.target;
    const claimed = claims.includes(ach.id);

    return { current: visualCurrent, target: ach.target, percent, completed, claimed };
};

// -- Day Processor --

interface ProcessParams {
    current: RankState;
    log: DailyLog | undefined;
    profile: UserProfile;
    extraLp: number;
    extraCp: number;
    extraEssence: number;
    date: Date;
    skills: SkillPerk[];
    weeklyShieldsUsed: number;
}

function processDay({ current, log, profile, extraLp, extraCp, extraEssence, date, skills, weeklyShieldsUsed }: ProcessParams) {
    let state = { ...current };
    const config = TIER_CONFIG[state.tier];
    const isWin = !!log && log.calories !== null && (log.isRanked ?? true);
    
    const getSkill = (id: string) => skills.find(s => s.id === id)?.level || 0;
    
    // Skill Checks
    const perkMomentum = getSkill('momentum'); 
    const perkSteady = getSkill('steady_hands');
    const perkIronWill = getSkill('iron_will');
    const perkTreasure = getSkill('treasure_hunter');
    const perkEssence = getSkill('essence_magnet');
    const perkRecovery = getSkill('recovery');
    
    let lpChange = 0;
    let result: 'WIN' | 'LOSS' | 'QUEST' | 'SHIELDED' = isWin ? 'WIN' : 'LOSS';
    
    const details = {
        base: 0,
        bonus: 0,
        streak: 0,
        boss: 0,
        questLp: 0,
        pendingLpApplied: 0,
        shieldUsed: false
    };

    if (isWin) {
        state.totalDaysLogged++;
        state.streak++;
        
        let base = config.baseWin;
        if (state.streak >= 3) base += perkMomentum;
        
        if (current.streak === 0 && perkRecovery > 0) {
             base += (perkRecovery * 2);
        }

        lpChange += base;
        details.base = base;

        let streakBonus = 0;
        if (state.streak >= 30) streakBonus = 3;
        else if (state.streak >= 7) streakBonus = 2;
        
        if (['Diamond', 'Master', 'Grandmaster', 'Challenger'].includes(state.tier)) {
            streakBonus = Math.floor(streakBonus * 0.5);
        }
        lpChange += streakBonus;
        details.streak = streakBonus;

        if (state.pendingQuestLp > 0) {
            lpChange += state.pendingQuestLp;
            details.pendingLpApplied = state.pendingQuestLp;
            state.pendingQuestLp = 0;
        }

        lpChange += extraLp;
        details.questLp = extraLp;

        const hitSteps = (log?.steps ?? 0) >= (profile.goals.steps || DEFAULT_GOALS.steps);
        const hitSleep = (log?.sleepHours ?? 0) >= (profile.goals.sleep || DEFAULT_GOALS.sleep);
        
        let cpGain = 10;
        if (hitSteps) cpGain += 3;
        if (hitSleep) cpGain += 3;
        if (log?.weightKg) cpGain += 2;
        
        const weapon = WEAPONS.find(w => w.id === state.loadout.weaponId);
        if (weapon) cpGain += weapon.cpBonus || 0;
        
        const relic = RELICS.find(r => r.id === state.loadout.relicId);
        if (relic) {
            cpGain += relic.cpBonus || 0;
            extraEssence += relic.essenceBonus || 0; 
        }

        cpGain = Math.floor(cpGain * (1 + (perkTreasure * 0.1)));
        
        state.cp += cpGain;
        state.cp += extraCp; 
        
        let essGain = 5;
        essGain = Math.floor(essGain * (1 + (perkEssence * 0.1)));
        
        state.essence += essGain + extraEssence; 

    } else {
        state.streak = 0;

        if (extraLp > 0) {
            state.pendingQuestLp += extraLp;
        }
        
        state.cp += extraCp;
        state.essence += extraEssence;

        if (state.shields > 0) {
            state.shields--;
            result = 'SHIELDED';
            lpChange = 0;
            details.shieldUsed = true;
        } else {
            let decay = config.baseLoss;
            decay += perkIronWill;
            decay += perkSteady; 
            
            if (decay > 0) decay = 0; 

            lpChange += decay;
            details.base = decay;
        }
    }
    
    if (!isWin && (extraCp > 0 || extraEssence > 0) && lpChange === 0) {
        result = 'QUEST';
    }

    // Rank Logic 
    if (state.series && state.series.active) {
        if (result === 'WIN') {
            state.series.wins++;
            if (state.series.wins >= state.series.targetWins) promoteTier(state);
        } else if (result === 'LOSS') {
             state.series.losses++;
             if (state.series.losses > (state.series.targetWins === 2 ? 1 : 2)) {
                 state.series = null;
                 state.lp = Math.max(0, config.promoteAt - 25);
             }
        }
    } else {
        let newLp = state.lp + lpChange;
        
        if (newLp >= config.promoteAt) {
            const nextTier = getNextTier(state.tier);
            if (nextTier) {
                const nextConfig = TIER_CONFIG[nextTier];
                const gateReq = nextConfig.minDays || 0;
                
                if (state.totalDaysLogged < gateReq) {
                    newLp = config.promoteAt - 1; 
                } else {
                    const needsSeries = (state.tier === 'Diamond' && nextTier === 'Master') ||
                                        (state.tier === 'Grandmaster' && nextTier === 'Challenger');
                    
                    if (needsSeries) {
                        state.lp = config.promoteAt;
                        state.series = { active: true, wins: 0, losses: 0, targetWins: state.tier === 'Diamond' ? 2 : 3 };
                    } else if (config.hasDivisions) {
                        const divIdx = DIVISIONS.indexOf(state.division as string);
                        if (divIdx < 3) {
                            state.division = DIVISIONS[divIdx + 1] as Division;
                            state.lp = 0; 
                        } else {
                             state.tier = nextTier;
                             state.division = nextConfig.hasDivisions ? 'IV' : null;
                             state.lp = 0;
                        }
                    } else {
                         state.tier = nextTier;
                         state.division = null;
                         state.lp = 0;
                    }
                }
            } else {
                state.lp = newLp;
            }
        } else if (newLp < 0) {
             if (config.hasDivisions) {
                 const divIdx = DIVISIONS.indexOf(state.division as string);
                 if (divIdx > 0) {
                     state.division = DIVISIONS[divIdx - 1] as Division;
                     state.lp = 75; 
                 } else {
                     const prev = getPrevTier(state.tier);
                     if (prev) {
                         state.tier = prev;
                         state.division = 'I';
                         state.lp = 75;
                     } else {
                         state.lp = 0; 
                     }
                 }
             } else {
                 const prev = getPrevTier(state.tier);
                 if (prev) {
                     state.tier = prev;
                     state.division = 'I';
                     state.lp = 75;
                 }
             }
        } else {
            state.lp = newLp;
        }
    }
    
    if (getSkill('milestone_boost') > 0) {
         if (Math.floor(state.cp / 100) > Math.floor(current.cp / 100)) {
             state.shields++;
         }
    } else {
        if (state.cp > 0 && Math.floor(state.cp / 300) > Math.floor(current.cp / 300) && isWin) {
            state.shields = Math.min(3, state.shields + 1);
        }
    }

    state.highestRank = `${state.tier} ${state.division || ''} ${state.lp} LP`;
    
    return { newState: state, lpChange, result, details };
}

function promoteTier(state: RankState) {
    const next = getNextTier(state.tier);
    if (next) {
        state.tier = next;
        state.division = TIER_CONFIG[next].hasDivisions ? 'IV' : null;
        state.lp = 0;
        state.series = null;
    }
}

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}

export const getLeagueLeaders = (league: LeagueState | null, userRank: RankState, userProfile: UserProfile) => {
    if (!league) return [];
    
    const userEntry: Rival = {
        id: 'user',
        name: userProfile.name || 'You',
        personality: 'Standard',
        lp: userRank.lp,
        lastResult: '-',
        trend: 'FLAT', 
        history: [],
        lastRank: 0,
        equippedWeaponId: userRank.loadout.weaponId
    };

    const all = [...league.rivals, userEntry].sort((a,b) => b.lp - a.lp);
    
    return all.slice(0, 5).map((r, idx) => {
        const currentRank = idx + 1;
        let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
        if (r.id !== 'user' && r.lastRank > 0) {
            if (currentRank < r.lastRank) trend = 'UP';
            else if (currentRank > r.lastRank) trend = 'DOWN';
        }
        
        return { ...r, rank: currentRank, trend };
    });
};

export const getDashboardMetrics = (
  logs: DailyLog[], 
  history: RankHistoryEntry[], 
  profile: UserProfile, 
  rank: RankState, 
  league: LeagueState | null
) => {
    let risk = 'SAFE';
    const lastLogDate = logs.filter(l => l.isRanked !== false).sort((a,b) => b.date.localeCompare(a.date))[0]?.date;
    const today = new Date().toISOString().split('T')[0];
    
    if (lastLogDate) {
         const diffTime = Math.abs(new Date(today).getTime() - new Date(lastLogDate).getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         if (diffDays > 2) risk = 'DANGER';
         else if (diffDays > 1) risk = 'WARNING';
    } else {
        risk = 'WARNING'; 
    }
    
    const config = TIER_CONFIG[rank.tier];
    const promoteAt = config.promoteAt;
    const lpNeeded = Math.max(0, promoteAt - rank.lp);
    const avgLpGain = 15; 
    const daysToPromote = lpNeeded > 0 ? Math.ceil(lpNeeded / avgLpGain) : 0;
    
    let nextThreat = null;
    if (league) {
        const rivals = [...league.rivals].sort((a,b) => b.lp - a.lp);
        const userLp = rank.lp;
        const below = rivals.filter(r => r.lp < userLp);
        if (below.length > 0) {
            const threat = below[0];
            const gap = userLp - threat.lp;
             if (gap < 20) {
                 nextThreat = {
                     name: threat.name,
                     risk: gap < 10 ? 'High' : 'Med',
                     gap: gap
                 };
             }
        }
    }

    return {
        risk,
        promotionTracker: {
            lpNeeded,
            daysToPromote: daysToPromote > 0 ? daysToPromote : null
        },
        nextThreat
    };
};
