
import { QuestInstance, QuestTemplate, UserProfile, DailyLog } from '../types';
import { QUEST_TEMPLATES, DEFAULT_GOALS, CURRENT_SEASON_ID } from '../constants';
import { getSeededRandom, cyrb128, sfc32 } from './rng';

export const getWeekId = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

export const getMonthId = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
};

const createQuestInstance = (template: QuestTemplate, dateKey: string, profile: UserProfile): QuestInstance => {
    let target = template.baseTarget;
    if (template.type === 'steps' && template.targetType === 'value') {
        target = profile.goals.steps || DEFAULT_GOALS.steps;
    }
    if (template.type === 'sleep' && template.targetType === 'value') {
        target = profile.goals.sleep || DEFAULT_GOALS.sleep;
    }

    return {
        id: `${template.id}_${dateKey}`,
        templateId: template.id,
        label: template.label(target),
        type: template.type,
        targetType: template.targetType,
        targetValue: target,
        rewards: { ...template.rewards },
        expires: dateKey,
        freq: template.freq
    };
};

export const generateDailyQuests = (dateStr: string, profile: UserProfile): QuestInstance[] => {
    const seed = cyrb128(dateStr);
    const rng = sfc32(seed[0], seed[1], seed[2], seed[3]);
    const forcedQuest = QUEST_TEMPLATES.daily.find(q => q.id === 'dq_cal_log')!;
    const pool = QUEST_TEMPLATES.daily.filter(q => q.id !== 'dq_cal_log');
    
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    const selected = [forcedQuest];
    const usedTypes = new Set<string>(['calories']);
    
    for (const q of pool) {
        if (selected.length >= 3) break;
        if (!usedTypes.has(q.type) || pool.length < 3) {
            selected.push(q);
            usedTypes.add(q.type);
        }
    }
    return selected.map(t => createQuestInstance(t, dateStr, profile));
};

export const generateWeeklyQuests = (weekId: string, profile: UserProfile): QuestInstance[] => {
    const seed = cyrb128(weekId);
    const rng = sfc32(seed[0], seed[1], seed[2], seed[3]);
    const pool = [...QUEST_TEMPLATES.weekly];
    
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 2).map(t => createQuestInstance(t, weekId, profile));
};

export const generateMonthlyQuests = (monthId: string, profile: UserProfile): QuestInstance[] => {
    return QUEST_TEMPLATES.monthly.map(t => createQuestInstance(t, monthId, profile));
};

export const generateSeasonalQuests = (seasonId: string, profile: UserProfile): QuestInstance[] => {
    return QUEST_TEMPLATES.seasonal.map(t => createQuestInstance(t, seasonId, profile));
};

export const getQuestProgressAdvanced = (quest: QuestInstance, logs: DailyLog[], dateKey: string, rankState?: any): { current: number, completed: boolean } => {
    let current = 0;
    
    // Filter logs based on freq
    let relevantLogs = logs;
    if (quest.freq === 'daily') relevantLogs = logs.filter(l => l.date === dateKey);
    else if (quest.freq === 'weekly') relevantLogs = logs.filter(l => getWeekId(new Date(l.date)) === dateKey);
    else if (quest.freq === 'monthly') relevantLogs = logs.filter(l => getMonthId(new Date(l.date)) === dateKey);
    // Seasonal logs? Just all logs for now or filter by season range?
    // Assuming dateKey for seasonal is season ID, we'd need start/end dates.
    // Simplified: All logs for current season context.
    
    if (quest.targetType === 'boolean') {
        if (quest.type === 'boss') {
            // Check rank state boss
            if (rankState && rankState.bossState.status === 'completed' && rankState.bossState.monthKey === dateKey) {
                current = 1;
            }
        }
        else if (quest.type === 'streak') {
            // Promo quest?
            if (rankState && rankState.tier !== 'Iron') current = 1; // Simplified
        }
    }
    else if (quest.targetType === 'log') {
        const fieldMap: Record<string, keyof DailyLog> = { 'calories': 'calories', 'steps': 'steps', 'sleep': 'sleepHours', 'weight': 'weightKg' };
        const field = fieldMap[quest.type];
        if (relevantLogs.some(l => l[field] !== null)) current = 1;
    } 
    else if (quest.targetType === 'value') {
         if (quest.type === 'streak') {
             // Need to calc max streak in window.
             // This is complex. For now, use current Streak from rank if window includes today?
             // Or scan relevantLogs for consecutive?
             // Simplified: Use RankState streak if active? 
             // Better: Scan logs.
             // Placeholder:
             current = rankState ? rankState.streak : 0;
         } else {
             const fieldMap: Record<string, keyof DailyLog> = { 'calories': 'calories', 'steps': 'steps', 'sleep': 'sleepHours', 'weight': 'weightKg' };
             const field = fieldMap[quest.type];
             relevantLogs.forEach(l => {
                 const val = Number(l[field] || 0);
                 if (val > current) current = val;
             });
         }
    }
    else if (quest.targetType === 'count') {
        relevantLogs.forEach(l => {
            let hit = false;
             if (quest.templateId.includes('goal')) {
                 const stepThresh = 8000;
                 const sleepThresh = 7.5;
                 if (quest.type === 'steps') hit = (l.steps || 0) >= stepThresh;
                 if (quest.type === 'sleep') hit = (l.sleepHours || 0) >= sleepThresh;
             } else {
                 const fieldMap: Record<string, keyof DailyLog> = { 'calories': 'calories', 'steps': 'steps', 'sleep': 'sleepHours', 'weight': 'weightKg' };
                 if (l[fieldMap[quest.type]] !== null) hit = true;
             }
             if (hit) current++;
        });
    }

    return { current, completed: current >= quest.targetValue };
};
