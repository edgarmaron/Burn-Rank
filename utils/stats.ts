
import { DailyLog, UserProfile } from '../types';
import { ACTIVITY_MULTIPLIERS } from '../constants';

export const safeAvg = (nums: number[]): number => {
    if (nums.length === 0) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
};

export const safeFloatAvg = (nums: number[]): string => {
    if (nums.length === 0) return "0.0";
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
};

export const getConsistency = (logs: DailyLog[], field: keyof DailyLog, daysToCheck: number = 14): number => {
    // Get last N dates based on today
    const today = new Date();
    let hits = 0;
    for (let i = 0; i < daysToCheck; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const log = logs.find(l => l.date === dateStr);
        if (log && log[field] !== null && log[field] !== 0) hits++;
    }
    return Math.round((hits / daysToCheck) * 100);
};

export const getGoalMetCount = (logs: DailyLog[], field: 'steps' | 'sleepHours', goal: number, daysToCheck: number = 7): number => {
    const sorted = [...logs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, daysToCheck);
    return sorted.filter(l => (l[field] || 0) >= goal).length;
};

export const getBestDay = (logs: DailyLog[], field: 'steps' | 'sleepHours' | 'calories'): { date: string, value: number } | null => {
    let best = { date: '', value: 0 };
    logs.forEach(l => {
        const val = l[field] || 0;
        if (val > best.value) best = { date: l.date, value: val };
    });
    return best.value > 0 ? best : null;
};

export const getStartWeight = (logs: DailyLog[], profile: UserProfile): number => {
    const sorted = [...logs].sort((a,b) => a.date.localeCompare(b.date));
    const firstLog = sorted.find(l => l.weightKg !== null);
    return firstLog?.weightKg || profile.weight; 
};

export const getCurrentWeight = (logs: DailyLog[], profile: UserProfile): number => {
    const sorted = [...logs].sort((a,b) => b.date.localeCompare(a.date));
    const lastLog = sorted.find(l => l.weightKg !== null);
    return lastLog?.weightKg || profile.weight;
};

export const calculateBMR = (profile: UserProfile, currentWeight: number): number => {
    return Math.round((10 * currentWeight) + (6.25 * profile.height) - (5 * profile.age) + (profile.sex === 'male' ? 5 : -161));
};

export const calculateTDEE = (profile: UserProfile, currentWeight: number): number => {
    const bmr = calculateBMR(profile, currentWeight);
    const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
};
