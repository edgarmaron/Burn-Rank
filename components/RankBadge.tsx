import React from 'react';
import { Emblem } from './Emblems';
import { Tier } from '../types';

// Wrapper to ensure backwards compatibility while enforcing new design system
export const RankBadge = ({ tier, className }: { tier: Tier, className?: string }) => {
  return <Emblem tier={tier} className={className} />;
};
